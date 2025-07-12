
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Asset {
  asset_code: string;
  id: string;
}

interface AssetContextType {
  assets: Asset[];
  refreshAssets: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAssets = useCallback(async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error('API endpoint is not configured. Please set NEXT_PUBLIC_API_BASE_URL.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/assets/`);
      const parsedJson = await response.json();

      if (parsedJson && parsedJson.data && Array.isArray(parsedJson.data)) {
        const fetchedAssets = parsedJson.data
          .map((asset: any) => ({
            id: asset.id,
            asset_code: asset.asset_code,
          }))
          .filter((asset: Asset) => asset.id && asset.asset_code);
        
        setAssets(prevAssets => {
          const uniqueAssets = new Map<string, Asset>();
          [...prevAssets, ...fetchedAssets].forEach(asset => uniqueAssets.set(asset.id, asset));
          return Array.from(uniqueAssets.values());
        });
      } else {
        console.error('Failed to fetch assets, or response was empty or invalid.');
      }

    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setError('Failed to fetch assets');
      setAssets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  return (
    <AssetContext.Provider value={{ assets, refreshAssets, isLoading, error }}>
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
