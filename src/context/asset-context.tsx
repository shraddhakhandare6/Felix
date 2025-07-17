
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Asset {
  id: string;
  asset_code: string;
  issuer: string;
  trustlines: number;
  amount: string;
}

interface AssetContextType {
  assets: Asset[];
  addAsset: (newAsset: Omit<Asset, 'id' | 'issuer' | 'trustlines' | 'amount'>) => void;
  refreshAssets: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const defaultAssets: Asset[] = [
  // Default BD asset will be dynamically added from fetch if available
];

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>(defaultAssets);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAssets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      setError('API endpoint is not configured. Please set NEXT_PUBLIC_API_BASE_URL.');
      setAssets(defaultAssets);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/assets/`);
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      
      const parsedJson = await response.json();

      if (parsedJson?.success === false || !parsedJson?.getAssetsResponse?.data) {
        setAssets([]);
      } else {
        const fetchedAssets: Asset[] = parsedJson.getAssetsResponse.data.map((item: any) => {
           return {
              id: item.id,
              asset_code: item.asset_code,
              issuer: item.acc.issuer,
              // 'acc' is an array, so its length represents the number of trustlines
              trustlines: Array.isArray(item.acc) ? item.acc.length : 0, 
              amount: item.balances.authorize,
            };
        });
        setAssets(fetchedAssets);
      }

    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to fetch assets');
      setAssets([]); // Reset to empty on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  const addAsset = (newAsset: Omit<Asset, 'id' | 'issuer' | 'trustlines' | 'amount'>) => {
    // This function is now simplified as we mainly rely on backend data.
    // It can be used for optimistic updates if needed.
    const optimisticAsset: Asset = {
      id: `temp_${Date.now()}`,
      asset_code: newAsset.asset_code,
      issuer: '',
      trustlines: 0,
      amount: '0',
    };
    setAssets((prev) => [optimisticAsset, ...prev.filter(asset => !asset.id.startsWith('temp_'))]);
  };

  return (
    <AssetContext.Provider value={{ assets, addAsset, refreshAssets, isLoading, error }}>
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
