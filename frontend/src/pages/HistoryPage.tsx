import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, History, Download } from 'lucide-react';
import { apiRequest, ApiError } from '../api';
import type { Account, ProfileResponse, TransactionResponse, TransactionType } from '../types';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency, formatDate, cn } from '../utils';

interface HistoryPageProps {
  token: string;
}

type TypeFilter = 'ALL' | TransactionType;

function isCredit(tx: TransactionResponse, accountId: string): boolean {
  if (tx.transactionType === 'DEPOSIT') return true;
  if (tx.transactionType === 'WITHDRAWAL') return false;
  return tx.receiverAccountId === accountId;
}

function csvEscape(value: string | number | null): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export function HistoryPage({ token }: HistoryPageProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async (manualId?: string) => {
    const id = manualId || accountId;
    if (!id) return;

    setError('');
    setIsLoading(true);
    try {
      const res = await apiRequest<TransactionResponse[]>(`/api/accounts/${id}/history`, {}, token);
      setTransactions(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to fetch history');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [accountId, token]);

  const fetchDefaultAccount = useCallback(async () => {
    try {
      const res = await apiRequest<ProfileResponse>('/api/profile', {}, token);
      setAccounts(res.data.accounts);

      if (res.data.accounts.length > 0) {
        const id = res.data.accounts[0].id;
        setAccountId(id);
        void loadHistory(id);
      }
    } catch {
      console.error('Failed to fetch default account');
    }
  }, [loadHistory, token]);

  useEffect(() => {
    void fetchDefaultAccount();
  }, [fetchDefaultAccount]);

  const selectedAccount = accounts.find((account) => account.id === accountId);

  const visibleTransactions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const fromTime = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
    const toTime = dateTo ? new Date(`${dateTo}T23:59:59`).getTime() : null;

    return transactions.filter((tx) => {
      const txTime = new Date(tx.createdAt).getTime();

      if (typeFilter !== 'ALL' && tx.transactionType !== typeFilter) return false;
      if (fromTime !== null && txTime < fromTime) return false;
      if (toTime !== null && txTime > toTime) return false;

      if (!needle) return true;

      const searchable = [
        tx.transactionId,
        tx.transactionType,
        tx.description,
        tx.senderAccountNumber,
        tx.receiverAccountNumber,
        tx.amount,
        formatDate(tx.createdAt),
      ].join(' ').toLowerCase();

      return searchable.includes(needle);
    });
  }, [dateFrom, dateTo, query, transactions, typeFilter]);

  const handleAccountChange = (id: string) => {
    setAccountId(id);
    void loadHistory(id);
  };

  const handleRefresh = (e: React.FormEvent) => {
    e.preventDefault();
    void loadHistory();
  };

  const clearFilters = () => {
    setQuery('');
    setTypeFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const exportStatement = () => {
    const rows = visibleTransactions.map((tx) => {
      const credit = isCredit(tx, accountId);
      return [
        formatDate(tx.createdAt),
        tx.transactionType,
        tx.description || 'No description provided',
        tx.senderAccountNumber,
        tx.receiverAccountNumber,
        `${credit ? '' : '-'}${tx.amount}`,
        tx.transactionId,
      ];
    });

    const csv = [
      ['Date', 'Type', 'Description', 'Sender Account', 'Receiver Account', 'Amount', 'Transaction ID'],
      ...rows,
    ].map((row) => row.map(csvEscape).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `statement-${selectedAccount?.account_number || 'account'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Transaction History</h1>
          <p className="text-slate-500 font-medium mt-1">Review all your past activity and account statements.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-bold border-slate-200"
          onClick={exportStatement}
          disabled={visibleTransactions.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Statement
        </Button>
      </div>

      <Card className="border-slate-200/50 shadow-sm">
        <form onSubmit={handleRefresh} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[280px_1fr_auto_auto]">
            <div className="flex w-full flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                Account Number
              </label>
              <select
                value={accountId}
                onChange={(e) => handleAccountChange(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-semibold text-slate-700 ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_number}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Search Transactions"
              icon={<Search className="h-4 w-4" />}
              placeholder="Description, amount, type, transaction ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Button type="submit" isLoading={isLoading} className="self-end lg:w-32">
              Refresh
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="self-end lg:w-32"
              onClick={() => setShowFilters((value) => !value)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-4">
              <div className="flex w-full flex-col gap-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Type
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base font-semibold text-slate-700 ring-offset-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  <option value="ALL">All Types</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="TRANSFER">Transfer</option>
                </select>
              </div>
              <Input label="From" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              <Input label="To" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              <Button type="button" variant="outline" className="self-end" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
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
              {visibleTransactions.map((tx) => {
                const credit = isCredit(tx, accountId);

                return (
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
                      {(tx.senderAccountNumber || tx.receiverAccountNumber) && (
                        <p className="mt-1 text-[11px] font-bold text-slate-400">
                          {tx.senderAccountNumber || 'External'} to {tx.receiverAccountNumber || 'External'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={cn(
                        'text-sm font-black',
                        credit ? 'text-emerald-600' : 'text-slate-900 group-hover:text-primary transition-colors'
                      )}>
                        {credit ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {visibleTransactions.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                        <History className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold max-w-xs mx-auto">
                        {transactions.length > 0 ? 'No transactions match the current search or filters.' : 'No transactions found for this account.'}
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
