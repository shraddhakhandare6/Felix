
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

interface Request {
  id: string;
  from?: string;
  to?: string;
  for: string;
  amount: string;
  status: 'Pending' | 'Paid';
  date: string;
}

interface PaymentRequestsContextType {
  incomingRequests: Request[];
  outgoingRequests: Request[];
  addRequest: (newRequest: Pick<Request, 'to' | 'for' | 'amount'>) => void;
  payRequest: (id: string) => void;
  declineRequest: (id: string) => void;
}

const initialIncomingRequests: Request[] = [
    { id: 'inc1', from: "Project Alpha", for: "UX Review", amount: "250 BD", status: "Pending", date: "2025-07-05" },
    { id: 'inc2', from: "member_two", for: "Asset Purchase", amount: "100 BD", status: "Pending", date: "2025-07-04" },
    { id: 'inc3', from: "CoE Desk", for: "Consulting Fee", amount: "1000 BD", status: "Paid", date: "2025-07-02" },
];

const initialOutgoingRequests: Request[] = [
    { id: 'out1', to: "Project Gamma", for: "API Usage", amount: "120 BD", status: "Pending", date: "2025-07-05" },
    { id: 'out2', to: "member_three", for: "Loan Repayment", amount: "75 BD", status: "Paid", date: "2025-07-03" },
];

const PaymentRequestsContext = createContext<PaymentRequestsContextType | undefined>(undefined);

export function PaymentRequestsProvider({ children }: { children: ReactNode }) {
  const [incomingRequests, setIncomingRequests] = useState<Request[]>(initialIncomingRequests);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>(initialOutgoingRequests);

  const addRequest = (newRequest: Pick<Request, 'to' | 'for' | 'amount'>) => {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const requestWithDefaults: Request = { 
      id: `out_${Date.now()}`,
      ...newRequest, 
      status: 'Pending' as const, 
      date 
    };
    
    setOutgoingRequests(prev => [requestWithDefaults, ...prev]);
  };

  const payRequest = (id: string) => {
    setIncomingRequests(prev => 
      prev.map(req => req.id === id ? { ...req, status: 'Paid' } : req)
    );
  };

  const declineRequest = (id: string) => {
    setIncomingRequests(prev => prev.filter(req => req.id !== id));
  };


  return (
    <PaymentRequestsContext.Provider value={{ incomingRequests, outgoingRequests, addRequest, payRequest, declineRequest }}>
      {children}
    </PaymentRequestsContext.Provider>
  );
}

export function usePaymentRequests() {
  const context = useContext(PaymentRequestsContext);
  if (context === undefined) {
    throw new Error('usePaymentRequests must be used within a PaymentRequestsProvider');
  }
  return context;
}
