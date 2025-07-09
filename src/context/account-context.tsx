
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from './user-context';

interface Account {
  publicKey: string;
  secretKey: string;
}

interface AccountContextType {
  account: Account;
  importAccount: (secretKey: string) => boolean;
}

const initialAccount: Account = {
    // This will be replaced almost immediately, but good to have a default.
    publicKey: 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    secretKey: 'SAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJNN',
};

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// Helper function to generate a random Stellar-like key.
const generateRandomKey = (prefix: 'G' | 'S'): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 55; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + result;
};

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(initialAccount);
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user.email) return; // Don't run if user isn't loaded yet

    const storedAccount = localStorage.getItem(`stellar_account_${user.email}`);
    if (storedAccount) {
        try {
            const parsedAccount = JSON.parse(storedAccount);
            if (parsedAccount.publicKey && parsedAccount.secretKey) {
                setAccount(parsedAccount);
            }
        } catch (error) {
            console.error("Failed to parse account from localStorage:", error);
            localStorage.removeItem(`stellar_account_${user.email}`);
        }
    } else {
        // In a real app, you would use a proper SDK to generate a keypair.
        // For this prototype, we'll generate a new mock keypair.
        const newPublicKey = generateRandomKey('G');
        const newSecretKey = generateRandomKey('S');
        const newUserAccount = { publicKey: newPublicKey, secretKey: newSecretKey };
        
        setAccount(newUserAccount);
        localStorage.setItem(`stellar_account_${user.email}`, JSON.stringify(newUserAccount));
    }
  }, [user.email]);

  const importAccount = (secretKey: string): boolean => {
    if (!user.email) {
        toast({
            variant: "destructive",
            title: "User not identified",
            description: "Cannot import an account without a logged-in user.",
        });
        return false;
    }

    // Basic validation for a Stellar secret key
    if (secretKey && secretKey.startsWith('S') && secretKey.length === 56) {
      // In a real app, you would derive the public key from the secret key.
      // For this prototype, we'll generate a new mock public key.
      const newPublicKey = generateRandomKey('G');
      
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
      return true;
    } else {
       toast({
        variant: "destructive",
        title: "Invalid Secret Key",
        description: "Please enter a valid Stellar secret key (it should start with 'S' and be 56 characters long).",
      });
      return false;
    }
  };

  return (
    <AccountContext.Provider value={{ account, importAccount }}>
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
