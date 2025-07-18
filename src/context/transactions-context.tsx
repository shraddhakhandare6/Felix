
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useUser } from '@/context/user-context';
import { useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'Sent' | 'Received' | 'Offer Match' | 'Issued';
  icon: React.ReactElement;
  recipient: string;
  service: string;
  amount: string;
  status: 'Completed' | 'Pending';
  date: string;
}

interface TransactionsContextType {
  transactions: Transaction[];
  addTransaction: (newTransaction: Omit<Transaction, 'id' | 'icon' | 'status' | 'date'>) => void;
}

const initialTransactions: Transaction[] = [];

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const { user } = useUser();

  // Fetch transactions from balance API
  useEffect(() => {
    if (!user?.email) return;
    fetch(`http://localhost:5000/api/v1/wallets/balance/type/user/${user.email}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || data.message || 'Failed to fetch transactions');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          // Map each balance entry to a Transaction
          const mapped = data.data.map((item: any, idx: number) => {
            let code = item.asset_code || item.asset_type || 'Asset';
            if (item.asset_type === 'native' || code === 'native') code = 'XLM';
            let amount = item.balance;
            if (typeof amount === 'number') amount = amount.toString();
            if (typeof amount !== 'string') amount = '0';
            if (!amount.startsWith('+') && !amount.startsWith('-')) amount = '+' + amount;
            return {
              id: `tx_api_${idx}_${Date.now()}`,
              type: 'Received',
              icon: <ArrowDownLeft className="h-4 w-4 text-accent" />,
              recipient: code,
              service: 'Wallet Balance',
              amount,
              status: 'Completed',
              date: new Date().toISOString().split('T')[0],
            };
          });
          setTransactions(mapped);
        }
      })
      .catch((err) => {
        setTransactions([]);
      });
  }, [user?.email]);

  const addTransaction = (newTransaction: Omit<Transaction, 'id' | 'icon' | 'status' | 'date'>) => {
    const transactionWithDefaults: Transaction = {
      id: `tx_${Date.now()}`,
      status: 'Completed',
      date: new Date().toISOString().split('T')[0],
      icon: newTransaction.type === 'Sent' 
        ? <ArrowUpRight className="h-4 w-4 text-destructive" />
        : <ArrowDownLeft className="h-4 w-4 text-accent" />,
      ...newTransaction,
    };
    setTransactions(prev => [transactionWithDefaults, ...prev]);
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
}
