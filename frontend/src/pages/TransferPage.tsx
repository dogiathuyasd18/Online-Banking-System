import { useCallback, useEffect, useState } from 'react';
import { Send, ShieldCheck, Info } from 'lucide-react';
import { apiRequest, ApiError } from '../api';
import type { Account, ProfileResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { cn } from '../utils';

interface TransferPageProps {
  token: string;
}

export function TransferPage({ token }: TransferPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [senderId, setSenderId] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const loadAccounts = useCallback(async () => {
    try {
      const res = await apiRequest<ProfileResponse>('/api/profile', {}, token);
      setAccounts(res.data.accounts);
      if (res.data.accounts.length > 0) {
        setSenderId(res.data.accounts[0].id);
      }
    } catch {
      console.error('Failed to load accounts');
    }
  }, [token]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setIsLoading(true);
    try {
      const res = await apiRequest<unknown>(
        '/api/accounts/transfer',
        {
          method: 'POST',
          body: JSON.stringify({
            senderAccountId: senderId,
            receiverAccountNumber,
            amount: Number(amount),
            description,
          }),
        },
        token
      );
      setResult({ type: 'success', message: res.message });
      setAmount('');
      setDescription('');
      void loadAccounts();
    } catch (err) {
      setResult({ type: 'error', message: err instanceof ApiError ? err.message : 'Transfer failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const currentAccount = accounts.find(a => a.id === senderId) || accounts[0] || { balance: 0, account_number: '' };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Make a Transfer</h1>
          <p className="text-slate-500 font-medium mt-1">Send funds securely to any account within ModernBank.</p>
        </div>
        
        <Card className="bg-primary/5 border-primary/10 py-4 px-6 h-fit shrink-0">
          <p className="text-xs font-black text-primary uppercase tracking-widest leading-none mb-1">Available Balance</p>
          <p className="text-2xl font-black text-primary leading-none">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentAccount.balance)}
          </p>
        </Card>
      </div>

      <Card className="shadow-2xl shadow-slate-200/50 p-8 border-slate-200/50">
        <form onSubmit={handleTransfer} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Sender Account Number
              </label>
              <select
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-semibold text-slate-700 ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_number} - {account.account_type}
                  </option>
                ))}
              </select>
            </div>
            <Input 
              label="Receiver Account Number"
              placeholder="e.g. ACC-99999"
              value={receiverAccountNumber}
              onChange={(e) => setReceiverAccountNumber(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Input 
              label="Transfer Amount ($)"
              type="number"
              placeholder="$ 0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <Input 
              label="Transfer Date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              readOnly
              className="bg-slate-50 text-slate-400"
            />
          </div>

          <Input 
            label="Description / Reference"
            placeholder="What is this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm tracking-tight">
               <ShieldCheck className="h-5 w-5" />
               SECURE TRANSFER GUARANTEED
             </div>

             <div className="flex gap-4 w-full md:w-auto">
               <Button type="button" variant="outline" className="flex-1 md:flex-none">Cancel</Button>
               <Button type="submit" className="flex-1 md:flex-none px-12" isLoading={isLoading}>
                 Send Money Now <Send className="ml-2 h-4 w-4" />
               </Button>
             </div>
          </div>
        </form>

        <div className="mt-8 rounded-2xl bg-blue-50/50 p-6 flex gap-4 text-slate-600">
          <Info className="h-6 w-6 text-primary shrink-0" />
          <p className="text-sm font-medium leading-relaxed">
            <span className="font-bold text-slate-800">Note:</span> Large transfers (above $10,000) may require additional verification and up to 24 hours to process. Make sure to double-check the recipient's account details before confirming.
          </p>
        </div>
      </Card>

      {result && (
        <Card className={cn(
          result.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
        )}>
           <div className={cn("text-center font-bold px-8 py-2", result.type === 'success' ? 'text-emerald-700' : 'text-red-700')}>
             {result.message}
           </div>
        </Card>
      )}
    </div>
  );
}
