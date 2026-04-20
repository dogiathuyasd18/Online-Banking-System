import { useState } from 'react';
import { Search, Filter, History, Download } from 'lucide-react';
import { apiRequest, ApiError } from '../api';
import type { TransactionResponse } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate, cn } from '../utils';

interface HistoryPageProps {
  token: string;
}

export function HistoryPage({ token }: HistoryPageProps) {
  const [accountId, setAccountId] = useState('');
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!accountId) return;
    
    setError('');
    setIsLoading(true);
    try {
      const res = await apiRequest<TransactionResponse[]>(`/api/accounts/${accountId}/history`, {}, token);
      setTransactions(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to fetch history');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Transaction History</h1>
          <p className="text-slate-500 font-medium mt-1">Review all your past activity and account statements.</p>
        </div>
        <Button variant="outline" size="sm" className="font-bold border-slate-200">
          <Download className="h-4 w-4 mr-2" />
          Export Statement
        </Button>
      </div>

      <Card className="p-4 border-slate-200/50 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input 
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by Account ID (e.g. acc-123)"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="md:w-32">Search</Button>
          <Button variant="ghost" className="md:w-32">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </form>
      </Card>

      <Card className="p-0 border-slate-200/50 shadow-xl shadow-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[11px] font-black text-slate-400 tracking-widest">
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Type</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <tr key={tx.transactionId} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-700">{formatDate(tx.createdAt)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">ID: {tx.transactionId.split('-')[0]}</p>
                  </td>
                  <td className="px-6 py-5">
                    <Badge variant={tx.transactionType === 'DEPOSIT' ? 'success' : tx.transactionType === 'WITHDRAWAL' ? 'danger' : 'neutral'}>
                      {tx.transactionType}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-slate-600">{tx.description || 'No description provided'}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={cn(
                      "text-sm font-black",
                      tx.transactionType === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-900 group-hover:text-primary transition-colors'
                    )}>
                      {tx.transactionType === 'DEPOSIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <History className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold max-w-xs mx-auto">
                        {accountId ? 'No transactions found for this account.' : 'Search for an Account ID to view its transaction history.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {isLoading && (
                 <tr>
                    <td colSpan={4} className="px-6 py-24 text-center">
                       <div className="flex justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                       </div>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {error && (
        <Card className="bg-red-50 border-red-100 py-3">
          <p className="text-center text-sm font-bold text-red-700">{error}</p>
        </Card>
      )}
    </div>
  );
}
