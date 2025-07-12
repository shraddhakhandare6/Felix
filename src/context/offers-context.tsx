
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface Offer {
  id: string;
  type: 'Buy' | 'Sell';
  service: string;
  price: string;
  status: 'Active' | 'Cancelled';
}

interface OffersContextType {
  myOffers: Offer[];
  addOffer: (newOffer: Omit<Offer, 'id' | 'status'>) => void;
  cancelOffer: (id: string) => void;
}

const initialOffers: Offer[] = [
    { id: 'offer1', type: "Sell", service: "1 Hour Consulting", price: "100 BD", status: "Active" },
    { id: 'offer2', type: "Buy", service: "Logo Design", price: "50 BD", status: "Active" },
];

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export function OffersProvider({ children }: { children: ReactNode }) {
  const [myOffers, setMyOffers] = useState<Offer[]>(initialOffers);

  const addOffer = (newOffer: Omit<Offer, 'id' | 'status'>) => {
    const offerWithId: Offer = {
      id: `offer_${Date.now()}`,
      status: 'Active',
      ...newOffer,
    };
    setMyOffers(prev => [offerWithId, ...prev]);
  };

  const cancelOffer = (id: string) => {
    setMyOffers(prev => prev.filter(offer => offer.id !== id));
  };


  return (
    <OffersContext.Provider value={{ myOffers, addOffer, cancelOffer }}>
      {children}
    </OffersContext.Provider>
  );
}

export function useOffers() {
  const context = useContext(OffersContext);
  if (context === undefined) {
    throw new Error('useOffers must be used within a OffersProvider');
  }
  return context;
}
