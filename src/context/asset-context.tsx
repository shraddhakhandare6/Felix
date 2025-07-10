
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Asset {
  id: string;
  assetCode: string;
}

interface AssetContextType {
  assets: Asset[];
  refreshAssets: () => Promise<void>;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export function AssetProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);

  const refreshAssets = useCallback(async () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      console.error('API endpoint is not configured. Please set NEXT_PUBLIC_API_BASE_URL.');
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.meta?.message || 'Failed to fetch assets.');
      }

      if (result && Array.isArray(result)) {
        const fetchedAssets = result
          .map((asset: any) => ({
            id: String(asset.id), 
            assetCode: asset.name || `Asset ${asset.id}`,
          }))
          .filter((asset: Asset) => asset.assetCode);
        setAssets(fetchedAssets);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setAssets([]);
    }
  }, []);

  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  return (
    <AssetContext.Provider value={{ assets, refreshAssets }}>
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
