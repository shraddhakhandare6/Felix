
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

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

const initialTransactions: Transaction[] = [
  {
    id: 'tx1',
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-destructive" />,
    recipient: 'Project Gamma',
    service: 'API Development',
    amount: '-500 BD',
    status: 'Completed',
    date: '2025-07-04'
  },
  {
    id: 'tx2',
    type: 'Received',
    icon: <ArrowDownLeft className="h-4 w-4 text-accent" />,
    recipient: 'CoE Desk',
    service: 'Consulting',
    amount: '+1,200 BD',
    status: 'Completed',
    date: '2025-07-03'
  },
  {
    id: 'tx3',
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-destructive" />,
    recipient: 'user@domain.com',
    service: 'Design Assets',
    amount: '-150 BD',
    status: 'Pending',
    date: '2025-07-05'
  },
];

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

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
