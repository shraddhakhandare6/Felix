
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { useUser } from '@/context/user-context';
import { useEffect } from 'react';
import { fetchUserTransactions } from '@/lib/api';

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
  refetchTransactions: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const initialTransactions: Transaction[] = [];

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Helper function to extract amount and type from action string
  const parseTransactionFromAction = (action: string, txHash: string, createdAt: string) => {
    let type: 'Sent' | 'Received' | 'Issued' = 'Received';
    let amount = '';
    let recipient = '';
    let service = 'Transaction';

    if (action.includes('Sent')) {
      type = 'Sent';
      const sentMatch = action.match(/Sent ([\d.]+) ([A-Z]+) from .* to ([A-Z0-9]+)/);
      if (sentMatch) {
        amount = `-${sentMatch[1]} ${sentMatch[2]}`;
        recipient = sentMatch[3];
        service = 'Payment Sent';
      }
    } else if (action.includes('Received') || action.includes('from')) {
      type = 'Received';
      const receivedMatch = action.match(/(?:Received|from .* to .*?) ([\d.]+) ([A-Z]+)/);
      if (receivedMatch) {
        amount = `+${receivedMatch[1]} ${receivedMatch[2]}`;
        recipient = 'Received';
        service = 'Payment Received';
      }
    } else if (action.includes('Created new account')) {
      type = 'Received';
      amount = '+100.0000000 XLM';
      recipient = 'Account Creation';
      service = 'Account Created';
    } else if (action.includes('Established trustline')) {
      type = 'Received';
      amount = '+0.0000000 BD';
      recipient = 'Trustline';
      service = 'Trustline Established';
    } else if (action.includes('Unknown operation')) {
      type = 'Received';
      amount = '+0.0000000 BD';
      recipient = 'Unknown';
      service = 'Unknown Operation';
    }

    return {
      id: txHash,
      type,
      icon: type === 'Sent' 
        ? <ArrowUpRight className="h-4 w-4 text-destructive" />
        : <ArrowDownLeft className="h-4 w-4 text-accent" />,
      recipient,
      service,
      amount,
      status: 'Completed' as const,
      date: new Date(createdAt).toISOString().split('T')[0],
    };
  };

  const fetchTransactions = async () => {
    if (!user?.email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const transactionData = await fetchUserTransactions(user.email);
      
      if (Array.isArray(transactionData)) {
        const mappedTransactions = transactionData.map((tx: any) => {
          // Handle multiple actions in a single transaction
          if (Array.isArray(tx.actions) && tx.actions.length > 0) {
            return parseTransactionFromAction(tx.actions[0], tx.txHash, tx.createdAt);
          }
          return null;
        }).filter(Boolean);
        
        setTransactions(mappedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch transactions from backend API
  useEffect(() => {
    fetchTransactions();
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
    <TransactionsContext.Provider value={{ 
      transactions, 
      addTransaction, 
      refetchTransactions: fetchTransactions,
      isLoading,
      error
    }}>
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
