import { useCallback, useEffect, useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Settings2,
  Bell,
  Wallet,
  X
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils';
import { apiRequest, ApiError } from '../api';
import type { BankCard, ProfileResponse } from '../types';

interface CardsPageProps {
  token: string;
  email: string;
}

export function CardsPage({ token, email }: CardsPageProps) {
  const [cards, setCards] = useState<BankCard[]>([]);
  const [selectedCard, setSelectedCard] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPinNotice, setShowPinNotice] = useState(false);

  const loadCards = useCallback(async () => {
    try {
      const res = await apiRequest<ProfileResponse>('/api/profile', {}, token);
      const fetchedCards = res.data.cards;
      setCards(fetchedCards);
      if (fetchedCards.length > 0) {
        setSelectedCard(fetchedCards[0].id);
      }
    } catch {
      console.error('Failed to load cards');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleAddCard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      const res = await apiRequest<ProfileResponse>('/api/profile', {}, token);
      const accountId = res.data.accounts[0]?.id;
      
      if (!accountId) {
        setError('No account found to link card to.');
        return;
      }

      await apiRequest('/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          account_id: accountId,
          card_type: 'Platinum Visa',
          card_number_suffix: suffix,
          expiry_date: '12/28',
          color_theme: 'bg-primary'
        })
      }, token);
      void loadCards();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add card');
      console.error('Failed to add card');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    setIsLoading(true);
    setError('');
    try {
      await apiRequest(`/api/cards/${cardId}`, { method: 'DELETE' }, token);
      void loadCards();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete card');
      console.error('Failed to delete card');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const currentCard = cards.find(c => c.id === selectedCard) || cards[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Cards</h1>
        <p className="text-slate-500 font-medium mt-1">Manage your physical and virtual payment methods.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card Visual */}
          <div className="relative h-56 w-full max-w-md perspective-1000 group cursor-pointer">
            <div className={cn(
              "relative h-full w-full rounded-2xl p-8 text-white shadow-2xl transition-all duration-500 preserve-3d transform-gpu",
              currentCard?.color_theme || 'bg-slate-900'
            )}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-black opacity-60 uppercase tracking-widest">Linked Account</p>
                  <p className="text-2xl font-black">{currentCard?.account_id ? 'Active' : 'No Account'}</p>
                </div>
                <div className="h-10 w-10 opacity-60">
                   <CreditCard className="h-full w-full" />
                </div>
              </div>
              
              <div className="mt-12">
                <p className="text-lg font-black tracking-[0.2em]">••••  ••••  ••••  {currentCard?.card_number_suffix || '0000'}</p>
              </div>

              <div className="mt-auto flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Card Holder</p>
                  <p className="text-sm font-bold uppercase">{email.split('@')[0] || 'User'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Expires</p>
                  <p className="text-sm font-bold">{currentCard?.expiry_date || 'MM/YY'}</p>
                </div>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 h-full w-1/3 bg-white/10 skew-x-[-20deg] translate-x-1/2" />
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h2 className="text-lg font-black text-slate-800">Your Cards</h2>
                <Button variant="outline" size="sm" className="font-bold" onClick={handleAddCard} disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isLoading ? 'Adding...' : 'Add Card'}
                </Button>
             </div>
             
             <div className="space-y-3">
                {cards.map((card) => (
                  <Card 
                    key={card.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedCard === card.id ? "border-primary ring-1 ring-primary/10 bg-slate-50/50" : ""
                    )}
                    onClick={() => setSelectedCard(card.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-xl text-white", card.color_theme)}>
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{card.card_type} (•••• {card.card_number_suffix})</p>
                          <p className="text-xs font-medium text-slate-500">Expires {card.expiry_date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={card.status === 'Active' ? 'success' : 'neutral'}>
                          {card.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
                {cards.length === 0 && !isLoading && (
                  <p className="text-center text-slate-400 py-8 font-medium">No cards found. Link a card to get started.</p>
                )}
                {error && (
                  <p className="text-center text-red-600 py-4 text-sm font-bold">{error}</p>
                )}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-800">Card Controls</h2>
          <Card className="divide-y divide-slate-100 p-0">
            <button 
              className="flex w-full items-center justify-between px-6 py-4 hover:bg-red-50 transition-colors group"
              onClick={() => currentCard && handleDeleteCard(currentCard.id)}
              disabled={!currentCard || isLoading}
            >
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-slate-400 group-hover:text-danger" />
                <span className="text-sm font-bold text-slate-700 group-hover:text-danger">Delete Card</span>
              </div>
              <div className="text-xs font-black text-slate-300 group-hover:text-danger">Permanently</div>
            </button>
            <button
              className="flex w-full items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
              onClick={() => setShowPinNotice(true)}
              disabled={!currentCard}
            >
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">View PIN</span>
              </div>
              <Settings2 className="h-4 w-4 text-slate-300" />
            </button>
            <button className="flex w-full items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Transaction Alerts</span>
              </div>
              <div className="h-6 w-10 rounded-full bg-primary p-1 flex justify-end">
                <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </button>
          </Card>

          {showPinNotice && (
            <Card className="border-amber-100 bg-amber-50 p-0">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-amber-900">PINs are not viewable</h3>
                  <p className="text-xs font-semibold leading-relaxed text-amber-800">
                    For security, card PINs should not be stored in a readable form. Add a verified reset-PIN flow if users need to change it.
                  </p>
                </div>
                <button
                  className="rounded-full p-1 text-amber-700 hover:bg-amber-100"
                  onClick={() => setShowPinNotice(false)}
                  aria-label="Dismiss PIN notice"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </Card>
          )}

          <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
            <div className="relative z-10 space-y-3">
               <h3 className="font-black text-primary">Need help?</h3>
               <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                 Protect your accounts with our advanced security features. Report lost or stolen cards immediately.
               </p>
               <Button size="sm" className="w-full font-bold">
                 <ShieldCheck className="h-4 w-4 mr-2" />
                 Report an Issue
               </Button>
            </div>
            <Wallet className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/10" />
          </Card>
        </div>
      </div>
    </div>
  );
}
