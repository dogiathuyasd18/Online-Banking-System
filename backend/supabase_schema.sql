-- Online Banking System - Supabase schema
-- Run this in the Supabase SQL editor after reviewing it.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- 2. Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT UNIQUE NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  account_type TEXT CHECK (account_type IN ('SAVINGS', 'CHECKING')) DEFAULT 'CHECKING',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
CREATE POLICY "Users can view their own accounts"
  ON public.accounts
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
CREATE POLICY "Users can create their own accounts"
  ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- 3. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  receiver_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2) NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER')) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_positive_amount CHECK (amount > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transactions involving their accounts" ON public.transactions;
CREATE POLICY "Users can view transactions involving their accounts"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (
    sender_account_id IN (
      SELECT id FROM public.accounts WHERE user_id = (select auth.uid())
    )
    OR receiver_account_id IN (
      SELECT id FROM public.accounts WHERE user_id = (select auth.uid())
    )
  );

-- 4. Cards
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_number_suffix VARCHAR(4) NOT NULL CHECK (card_number_suffix ~ '^[0-9]{4}$'),
  card_type VARCHAR(50) NOT NULL,
  expiry_date VARCHAR(5) NOT NULL,
  status VARCHAR(20) DEFAULT 'Active',
  color_theme VARCHAR(50) DEFAULT 'bg-slate-900',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cards" ON public.cards;
CREATE POLICY "Users can view their own cards"
  ON public.cards
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own cards" ON public.cards;
CREATE POLICY "Users can insert their own cards"
  ON public.cards
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
        AND accounts.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can update their own cards" ON public.cards;
CREATE POLICY "Users can update their own cards"
  ON public.cards
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.accounts
      WHERE accounts.id = cards.account_id
        AND accounts.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can delete their own cards" ON public.cards;
CREATE POLICY "Users can delete their own cards"
  ON public.cards
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- 5. Indexes for ownership checks and history queries
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_account_id ON public.cards(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_account_id ON public.transactions(sender_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_account_id ON public.transactions(receiver_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 6. Profile/account creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.accounts (user_id, account_number, balance, account_type)
  VALUES (
    new.id,
    'ACC-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10)),
    0.00,
    'CHECKING'
  );

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Atomic money operations. These use the caller's JWT via auth.uid().
CREATE OR REPLACE FUNCTION public.perform_deposit(
  p_account_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'Deposit'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance DECIMAL(15, 2);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  PERFORM 1
  FROM public.accounts
  WHERE id = p_account_id
    AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found or access denied';
  END IF;

  UPDATE public.accounts
  SET balance = balance + p_amount
  WHERE id = p_account_id
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.transactions (receiver_account_id, amount, transaction_type, description)
  VALUES (p_account_id, p_amount, 'DEPOSIT', COALESCE(NULLIF(trim(p_description), ''), 'Deposit'));

  RETURN jsonb_build_object(
    'status', 'success',
    'accountId', p_account_id,
    'amount', p_amount,
    'newBalance', v_new_balance
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.perform_withdrawal(
  p_account_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'Withdrawal'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance DECIMAL(15, 2);
  v_new_balance DECIMAL(15, 2);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT balance
  INTO v_current_balance
  FROM public.accounts
  WHERE id = p_account_id
    AND user_id = auth.uid()
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found or access denied';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  UPDATE public.accounts
  SET balance = balance - p_amount
  WHERE id = p_account_id
  RETURNING balance INTO v_new_balance;

  INSERT INTO public.transactions (sender_account_id, amount, transaction_type, description)
  VALUES (p_account_id, p_amount, 'WITHDRAWAL', COALESCE(NULLIF(trim(p_description), ''), 'Withdrawal'));

  RETURN jsonb_build_object(
    'status', 'success',
    'accountId', p_account_id,
    'amount', p_amount,
    'newBalance', v_new_balance
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.perform_transfer(
  p_sender_id UUID,
  p_receiver_account_number TEXT,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'Transfer'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_receiver_id UUID;
  v_sender_balance DECIMAL(15, 2);
  v_sender_new_balance DECIMAL(15, 2);
  v_receiver_new_balance DECIMAL(15, 2);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT id
  INTO v_receiver_id
  FROM public.accounts
  WHERE account_number = trim(p_receiver_account_number);

  IF v_receiver_id IS NULL THEN
    RAISE EXCEPTION 'Receiver account not found';
  END IF;

  IF v_receiver_id = p_sender_id THEN
    RAISE EXCEPTION 'Cannot transfer to the same account';
  END IF;

  PERFORM 1
  FROM public.accounts
  WHERE id IN (p_sender_id, v_receiver_id)
  ORDER BY id
  FOR UPDATE;

  SELECT balance
  INTO v_sender_balance
  FROM public.accounts
  WHERE id = p_sender_id
    AND user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized: Sender account does not belong to you';
  END IF;

  IF v_sender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;

  UPDATE public.accounts
  SET balance = balance - p_amount
  WHERE id = p_sender_id
  RETURNING balance INTO v_sender_new_balance;

  UPDATE public.accounts
  SET balance = balance + p_amount
  WHERE id = v_receiver_id
  RETURNING balance INTO v_receiver_new_balance;

  INSERT INTO public.transactions (sender_account_id, receiver_account_id, amount, transaction_type, description)
  VALUES (p_sender_id, v_receiver_id, p_amount, 'TRANSFER', COALESCE(NULLIF(trim(p_description), ''), 'Transfer'));

  RETURN jsonb_build_object(
    'status', 'success',
    'amount', p_amount,
    'senderId', p_sender_id,
    'receiverId', v_receiver_id,
    'senderNewBalance', v_sender_new_balance,
    'receiverNewBalance', v_receiver_new_balance
  );
END;
$$;

REVOKE ALL ON FUNCTION public.perform_deposit(UUID, DECIMAL, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.perform_withdrawal(UUID, DECIMAL, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.perform_transfer(UUID, TEXT, DECIMAL, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.perform_deposit(UUID, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_withdrawal(UUID, DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.perform_transfer(UUID, TEXT, DECIMAL, TEXT) TO authenticated;
