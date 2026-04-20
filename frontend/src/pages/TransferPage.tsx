import { useState } from 'react';
import { Send, ShieldCheck, Info } from 'lucide-react';
import { apiRequest, ApiError } from '../api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { cn } from '../utils';

interface TransferPageProps {
  token: string;
}

export function TransferPage({ token }: TransferPageProps) {
  const [senderId, setSenderId] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setIsLoading(true);
    try {
      const res = await apiRequest(
        '/api/accounts/transfer',
        {
          method: 'POST',
          body: JSON.stringify({
            senderId,
            receiverId,
            amount: Number(amount),
            description,
          }),
        },
        token
      );
      setResult({ type: 'success', message: res.message });
      setAmount('');
      setDescription('');
    } catch (err) {
      setResult({ type: 'error', message: err instanceof ApiError ? err.message : 'Transfer failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Make a Transfer</h1>
          <p className="text-slate-500 font-medium mt-1">Send funds securely to any account within ModernBank.</p>
        </div>
        
        <Card className="bg-primary/5 border-primary/10 py-4 px-6 h-fit shrink-0">
          <p className="text-xs font-black text-primary uppercase tracking-widest leading-none mb-1">Available Balance</p>
          <p className="text-2xl font-black text-primary leading-none">$12,450.00</p>
        </Card>
      </div>

      <Card className="shadow-2xl shadow-slate-200/50 p-8 border-slate-200/50">
        <form onSubmit={handleTransfer} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Input 
              label="Sender Account ID"
              placeholder="e.g. ACC-12345"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value)}
              required
            />
            <Input 
              label="Receiver Account Number / ID"
              placeholder="e.g. ACC-99999"
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
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
