'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface Asset {
  id: string;
  assetCode: string;
}

interface AssetContextType {
  assets: Asset[];
  addAsset: (newAsset: Omit<Asset, 'id'>) => void;
}

const initialAssets: Asset[] = [
    { id: '1', assetCode: "USD" },
    { id: '2', assetCode: "EUR" },
];

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  const addAsset = (newAsset: Omit<Asset, 'id'>) => {
    const assetWithId: Asset = {
      id: `asset_${Date.now()}`,
      assetCode: newAsset.assetCode.toUpperCase(),
    };
    setAssets(prev => [assetWithId, ...prev]);
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
}
