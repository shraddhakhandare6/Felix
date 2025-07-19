
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from './user-context';
import { fetchWalletBalance } from '@/lib/api';

export interface Account {
  publicKey: string;
  secretKey: string;
}

export interface Balance {
  asset_code?: string;
  asset_type: string;
  balance: string;
}

interface AccountImportResult {
  success: boolean;
  account?: Account;
}

interface AccountContextType {
  account: Account;
  balances: Balance[];
  importAccount: (secretKey: string) => AccountImportResult;
  isLoading: boolean;
  setAccount: (account: Account) => void;
  refetchBalances: () => Promise<void>;
}

const initialAccount: Account = {
    publicKey: '',
    secretKey: '',
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(initialAccount);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  const fetchBalances = async () => {
    if (!user.email) return;

    try {
      console.log('Fetching balances for user:', user.email);
      const balanceData = await fetchWalletBalance(user.email);
      console.log('Received balance data:', balanceData);
      setBalances(balanceData || []);
    } catch (error) {
      console.error("Failed to fetch wallet balances:", error);
      toast({
        variant: "destructive",
        title: "Error fetching balances",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
      setBalances([]);
    }
  };

  // Enhanced refetch function with delay to ensure backend processing
  const refetchBalancesWithDelay = async (delayMs: number = 1000) => {
    if (!user.email) return;
    
    console.log(`Refetching balances in ${delayMs}ms for user:`, user.email);
    
    // Add a small delay to ensure the backend has processed the transaction
    await new Promise(resolve => setTimeout(resolve, delayMs));
    
    await fetchBalances();
  };

  useEffect(() => {
    if (!user.email) return;

    const fetchAndSetAccount = async () => {
        setIsLoading(true);
        const storageKey = `stellar_account_${user.email}`;
        const storedAccount = localStorage.getItem(storageKey);

        if (storedAccount) {
            try {
                const parsedAccount = JSON.parse(storedAccount);
                if (parsedAccount.publicKey && parsedAccount.secretKey) {
                    setAccount(parsedAccount);
                }
            } catch (error) {
                console.error("Failed to parse account from localStorage:", error);
                localStorage.removeItem(storageKey);
            }
        }
        
        await fetchBalances();
        setIsLoading(false);
    };

    fetchAndSetAccount();
  }, [user.email, toast]);

  const importAccount = (secretKey: string): AccountImportResult => {
    if (!user.email) {
        toast({
            variant: "destructive",
            title: "User not identified",
            description: "Cannot import an account without a logged-in user.",
        });
        return { success: false };
    }

    if (secretKey && secretKey.startsWith('S') && secretKey.length === 56) {
      const newPublicKey = 'G' + 'B'.repeat(55); // Mock public key for imported secret
      
      const newAccount = {
        publicKey: newPublicKey,
        secretKey: secretKey,
      };

      setAccount(newAccount);
      localStorage.setItem(`stellar_account_${user.email}`, JSON.stringify(newAccount));
      fetchBalances();
      toast({
        title: "Account Imported",
        description: "Your Stellar account has been successfully imported.",
      });
      return { success: true, account: newAccount };
    } else {
       toast({
        variant: "destructive",
        title: "Invalid Secret Key",
        description: "Please enter a valid Stellar secret key (it should start with 'S' and be 56 characters long).",
      });
      return { success: false };
    }
  };

  const updateAccountState = (newAccount: Account) => {
    setAccount(newAccount);
    if(user.email) {
        localStorage.setItem(`stellar_account_${user.email}`, JSON.stringify(newAccount));
    }
  };

  return (
    <AccountContext.Provider value={{ account, balances, importAccount, isLoading, setAccount: updateAccountState, refetchBalances: refetchBalancesWithDelay }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

