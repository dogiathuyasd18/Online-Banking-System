import { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Minus, 
  History,
  TrendingUp,
  Building2,
  Wallet
} from 'lucide-react';
import { apiRequest, ApiError } from '../api';
import type { TransactionResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate, cn } from '../utils';

interface DashboardPageProps {
  token: string;
}

export function DashboardPage({ token }: DashboardPageProps) {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [recentTransactions, setRecentTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadHistory = async (id: string) => {
    try {
      const res = await apiRequest<TransactionResponse[]>(`/api/accounts/${id}/history`, {}, token);
      setRecentTransactions(res.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load history');
    }
  };

  const handleOperation = async (endpoint: string, type: string) => {
    setError('');
    setMessage('');
    setIsLoading(true);
    try {
      const res = await apiRequest<TransactionResponse>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify({
            receiverAccountId: accountId,
            amount: Number(amount),
            description,
          }),
        },
        token
      );
      setMessage(res.message);
      setAmount('');
      setDescription('');
      if (accountId) loadHistory(accountId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : `${type} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Optional: Load initial data if accountId exists in state/context
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Quick summary of your accounts and recent activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="relative overflow-hidden bg-primary text-white border-none shadow-lg shadow-primary/20">
          <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold opacity-80 uppercase tracking-widest text-primary-light">Current Balance</span>
              <Wallet className="h-6 w-6 opacity-60 text-primary-light" />
            </div>
            <div>
              <h2 className="text-4xl font-black">$12,450.00</h2>
              <p className="text-sm font-medium opacity-80 mt-1 text-primary-light">Main Account (....8291)</p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-300">
               <TrendingUp className="h-4 w-4" />
               <span>+2.4% this month</span>
            </div>
          </div>
          <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-blue-500 opacity-20 blur-3xl" />
          <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-blue-400 opacity-10 blur-3xl" />
        </Card>

        <Card className="flex flex-col justify-between">
           <div className="flex items-center justify-between text-slate-500">
             <span className="text-sm font-bold uppercase tracking-widest">Total Income</span>
             <ArrowDownLeft className="h-6 w-6 text-emerald-500" />
           </div>
           <div className="mt-4">
             <h2 className="text-3xl font-black text-slate-800">$8,520.40</h2>
             <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-tight">Across 3 sources</p>
           </div>
        </Card>

        <Card className="flex flex-col justify-between">
           <div className="flex items-center justify-between text-slate-500">
             <span className="text-sm font-bold uppercase tracking-widest">Total Expenses</span>
             <ArrowUpRight className="h-6 w-6 text-danger" />
           </div>
           <div className="mt-4">
             <h2 className="text-3xl font-black text-slate-800">$3,140.20</h2>
             <p className="text-xs font-bold text-danger mt-1 uppercase tracking-tight">Mainly "Shopping" & "Utilities"</p>
           </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <History className="h-6 w-6 text-primary" />
              Recent Activity
            </h2>
            <Button variant="ghost" size="sm" className="font-bold">View Full Statement</Button>
          </div>

          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[10px] font-black text-slate-400 tracking-widest">
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Transaction</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTransactions.map((tx: TransactionResponse) => (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <Badge variant={tx.transactionType === 'DEPOSIT' ? 'success' : tx.transactionType === 'WITHDRAWAL' ? 'danger' : 'neutral'}>
                          {tx.transactionType}
                        </Badge>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-700">{tx.description}</p>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">{formatDate(tx.createdAt)}</p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={cn(
                          "text-sm font-black",
                          tx.transactionType === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-800'
                        )}>
                          {tx.transactionType === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Enter an Account ID to view its recent transactions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Quick Actions
          </h2>
          <Card header={<CardTitle>Deposit / Withdrawal</CardTitle>}>
            <div className="space-y-4">
              <Input 
                placeholder="Account ID" 
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              />
              <Input 
                placeholder="Amount (USD)" 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Input 
                placeholder="Brief Note" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1" 
                  onClick={() => handleOperation('/api/accounts/deposit', 'Deposit')}
                  isLoading={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Deposit
                </Button>
                <Button 
                  className="flex-1 shadow-md hover:shadow-lg transition-shadow" 
                  variant="outline"
                  onClick={() => handleOperation('/api/accounts/withdrawal', 'Withdrawal')}
                  isLoading={isLoading}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </div>
            </div>
            {message && <p className="mt-4 text-xs font-bold text-emerald-600 text-center">{message}</p>}
            {error && <p className="mt-4 text-xs font-bold text-danger text-center">{error}</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
