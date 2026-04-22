import { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  ShieldCheck, 
  Lock, 
  Eye, 
  Settings2,
  Bell,
  Wallet
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { cn } from '../utils';

export function CardsPage() {
  const [selectedCard, setSelectedCard] = useState('8291');

  const cards = [
    { id: '8291', type: 'Platinum Visa', balance: 12450.00, expiry: '09/27', status: 'Active', color: 'bg-slate-900' },
    { id: '4521', type: 'Virtual Master', balance: 2100.50, expiry: '12/28', status: 'Active', color: 'bg-primary' },
    { id: '1109', type: 'Business Card', balance: 0.00, expiry: '03/26', status: 'Frozen', color: 'bg-slate-500' },
  ];

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
              cards.find(c => c.id === selectedCard)?.color || 'bg-slate-900'
            )}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-black opacity-60 uppercase tracking-widest">Balance</p>
                  <p className="text-2xl font-black">${cards.find(c => c.id === selectedCard)?.balance.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 opacity-60">
                   <CreditCard className="h-full w-full" />
                </div>
              </div>
              
              <div className="mt-12">
                <p className="text-lg font-black tracking-[0.2em]">••••  ••••  ••••  {selectedCard}</p>
              </div>

              <div className="mt-auto flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Card Holder</p>
                  <p className="text-sm font-bold uppercase">John Doe</p>
                </div>
                <div>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Expires</p>
                  <p className="text-sm font-bold">{cards.find(c => c.id === selectedCard)?.expiry}</p>
                </div>
              </div>
              
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 h-full w-1/3 bg-white/10 skew-x-[-20deg] translate-x-1/2" />
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
               <h2 className="text-lg font-black text-slate-800">Your Cards</h2>
               <Button variant="outline" size="sm" className="font-bold">
                 <Plus className="h-4 w-4 mr-2" />
                 Add Card
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
                       <div className={cn("p-3 rounded-xl text-white", card.color)}>
                         <CreditCard className="h-5 w-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">{card.type} (•••• {card.id})</p>
                         <p className="text-xs font-medium text-slate-500">Expires {card.expiry}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <Badge variant={card.status === 'Active' ? 'success' : 'neutral'}>
                         {card.status}
                       </Badge>
                       <p className="text-sm font-black text-slate-800">${card.balance.toLocaleString()}</p>
                     </div>
                   </div>
                 </Card>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-black text-slate-800">Card Controls</h2>
          <Card className="divide-y divide-slate-100 p-0">
            <button className="flex w-full items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Lock Card</span>
              </div>
              <div className="h-6 w-10 rounded-full bg-slate-200 p-1">
                <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </button>
            <button className="flex w-full items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
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
