
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

export interface Offer {
  id: string;
  type: 'Buy' | 'Sell';
  service: string;
  price: string;
  status: 'Active' | 'Cancelled';
  date: string;
  creatorEmail: string;
  entityName: string;
}

interface OffersContextType {
  myOffers: Offer[];
  addOffer: (newOffer: Omit<Offer, 'id' | 'status'>) => void;
  cancelOffer: (id: string) => void;
}

const initialOffers: Offer[] = [];

const OffersContext = createContext<OffersContextType | undefined>(undefined);

export function OffersProvider({ children }: { children: ReactNode }) {
  const [myOffers, setMyOffers] = useState<Offer[]>(initialOffers);

  // Fetch offers from backend buy and sell APIs
  useEffect(() => {
    async function fetchOffers() {
      try {
        const buyRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/offers/buy`, { method: 'GET' });
        const sellRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/offers/sell`, { method: 'GET' });
        const buyData = await buyRes.json();
        const sellData = await sellRes.json();
        let offers: Offer[] = [];
        if (buyData.success && Array.isArray(buyData.data)) {
          offers = offers.concat(buyData.data.map((item: any, idx: number) => ({
            id: item.id || `buy_${idx}_${Date.now()}`,
            type: 'Buy',
            service: item.serviceName || '',
            price: item.price || '',
            status: item.status || 'Active',
            date: item.date || new Date().toISOString().split('T')[0],
            creatorEmail: item.creatorEmail || '',
            entityName: item.entityName || '',
          })));
        }
        if (sellData.success && Array.isArray(sellData.data)) {
          offers = offers.concat(sellData.data.map((item: any, idx: number) => ({
            id: item.id || `sell_${idx}_${Date.now()}`,
            type: 'Sell',
            service: item.serviceName || '',
            price: item.price || '',
            status: item.status || 'Active',
            date: item.date || new Date().toISOString().split('T')[0],
            creatorEmail: item.creatorEmail || '',
            entityName: item.entityName || '',
          })));
        }
        setMyOffers(offers);
      } catch (err) {
        setMyOffers([]);
      }
    }
    fetchOffers();
  }, []);

  const addOffer = (newOffer: Omit<Offer, 'id' | 'status'>) => {
    const offerWithId: Offer = {
      id: `offer_${Date.now()}`,
      status: 'Active',
      ...newOffer,
      date: newOffer.date || new Date().toISOString().split('T')[0],
      creatorEmail: newOffer.creatorEmail || '',
      entityName: newOffer.entityName || '',
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
