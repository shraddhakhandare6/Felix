
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

const defaultAssets: Asset[] = [
  { asset_code: "BD", id: "default-bd-asset" }
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
      console.error('API endpoint is not configured. Please set NEXT_PUBLIC_API_BASE_URL.');
      setAssets(defaultAssets);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/assets/`);
      const parsedJson = await response.json();

      const fetchedAssets: Asset[] = [];
      if (parsedJson?.getAssetsResponse?.data) {
        parsedJson.getAssetsResponse.data.forEach((item: any) => {
          if (item.asset_code && item.id) {
            fetchedAssets.push({
              asset_code: item.asset_code,
              id: item.id,
            });
          }
        });
      }

      setAssets(prevAssets => {
        const assetMap = new Map<string, Asset>();
        // Add default assets first
        defaultAssets.forEach(asset => assetMap.set(asset.asset_code, asset));
        // Then add previous assets
        prevAssets.forEach(asset => assetMap.set(asset.asset_code, asset));
        // Then add/overwrite with fetched assets
        fetchedAssets.forEach(asset => assetMap.set(asset.asset_code, asset));
        return Array.from(assetMap.values());
      });

    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to fetch assets');
      // In case of error, fall back to default assets
      setAssets(defaultAssets);
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
