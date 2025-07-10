
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Asset {
  asset_code: string;
  id: string;
  assetCode: string;
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
    setError(null); // Reset the error state

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/assets/`);
      const responseText = await response.text();
      
      if (response.ok && responseText) {
          const parsedJson = JSON.parse(responseText);
          if (parsedJson && Array.isArray(parsedJson.data)) {
            const fetchedAssets = parsedJson.data
              .map((asset: any) => ({
                id: asset.id,
                asset_code: asset.asset_code || asset.company, 
                assetCode: asset.asset_code || asset.company,
              }))
              .filter((asset: Asset) => asset.id && asset.asset_code);

            // Replace the old assets with the newly fetched list to prevent duplicates
            setAssets(fetchedAssets);
          }
      } else {
           console.error('Failed to fetch assets, or response was empty.');
      }

    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setError('Failed to fetch assets');
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
