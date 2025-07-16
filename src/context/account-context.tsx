
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from './user-context';

export interface Account {
  publicKey: string;
  secretKey: string;
}

interface AccountImportResult {
  success: boolean;
  account?: Account;
}

interface AccountContextType {
  account: Account;
  importAccount: (secretKey: string) => AccountImportResult;
  isLoading: boolean;
  setAccount: (account: Account) => void;
}

const initialAccount: Account = {
    publicKey: '',
    secretKey: '',
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(initialAccount);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

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
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Failed to parse account from localStorage:", error);
                localStorage.removeItem(storageKey);
            }
        }
        
        const apiBaseUrl = 'https://5000-firebase-felix-cashflow-1751957540178.cluster-htdgsbmflbdmov5xrjithceibm.cloudworkstations.dev';
        if (!apiBaseUrl) {
            toast({
                variant: 'destructive',
                title: 'Configuration Error',
                description: 'The API endpoint is not configured.',
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/wallets/export`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch wallet keys.' }));
                throw new Error(errorData.message || 'An unknown error occurred.');
            }

            const data = await response.json();
            const newAccount: Account = {
                publicKey: data.public_key,
                secretKey: data.secret,
            };

            setAccount(newAccount);
            localStorage.setItem(storageKey, JSON.stringify(newAccount));
            
        } catch (error) {
            console.error("Failed to fetch wallet keys:", error);
            toast({
                variant: 'destructive',
                title: 'Fetch Failed',
                description: error instanceof Error ? error.message : 'Could not fetch wallet details.',
            });
        } finally {
            setIsLoading(false);
        }
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
    <AccountContext.Provider value={{ account, importAccount, isLoading, setAccount: updateAccountState }}>
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

