
// 'use client';

// import type { ReactNode } from 'react';
// import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// export interface Asset {
//   asset_code: string;
//   id: string;
//   assetCode: string;
// }

// interface AssetContextType {
//   assets: Asset[];
//   refreshAssets: () => Promise<void>;
//   isLoading: boolean;
//   error: string | null;
// }

// const AssetContext = createContext<AssetContextType | undefined>(undefined);

// export function AssetProvider({ children }: { children: ReactNode }) {
//   const [assets, setAssets] = useState<Asset[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const refreshAssets = useCallback(async () => {
//     const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
//     if (!apiBaseUrl) {
//       console.error('API endpoint is not configured. Please set NEXT_PUBLIC_API_BASE_URL.');
//       return;
//     }

//     setIsLoading(true);
//     setError(null); // Reset the error state

//     try {
//       const response = await fetch(`${apiBaseUrl}/api/v1/assets/`);
//       const responseText = await response.text();
      
//       if (response.ok && responseText) {
//           const parsedJson = JSON.parse(responseText);
//           if (parsedJson && Array.isArray(parsedJson.data)) {
//             const fetchedAssets = parsedJson.data
//               .map((asset: any) => ({
//                 id: asset.id,
//                 asset_code: asset.asset_code || asset.company, 
//                 assetCode: asset.asset_code || asset.company,
//               }))
//               .filter((asset: Asset) => asset.id && asset.asset_code);

//             // Append newly fetched assets to the existing list
//             setAssets(prevAssets => [...prevAssets, ...fetchedAssets]);
//           }
//       } else {
//            console.error('Failed to fetch assets, or response was empty.');
//       }

//     } catch (error) {
//       console.error('Failed to fetch assets:', error);
//       setError('Failed to fetch assets');
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     refreshAssets();
//   }, [refreshAssets]);

//   return (
//     <AssetContext.Provider value={{ assets, refreshAssets, isLoading, error }}>
//       {children}
//     </AssetContext.Provider>
//   );
// }

// export function useAssets() {
//   const context = useContext(AssetContext);
//   if (context === undefined) {
//     throw new Error('useAssets must be used within an AssetProvider');
//   }
//   return context;
// }
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
      const parsedJson = await response.json();

      if (parsedJson && Array.isArray(parsedJson.data[0].data)) {
        const fetchedAssets = parsedJson.data[0].data
          .map((asset: any) => ({
            id: asset.id,
            asset_code: asset.asset_code, // Map 'asset_code' correctly
            assetCode: asset.asset_code,  // Use consistent naming for assetCode
          }))
          .filter((asset: Asset) => asset.id && asset.asset_code);

        // Append the new assets to the existing list of assets
        // Use a Map to filter out duplicates based on 'id'
        setAssets(prevAssets => {
          const uniqueAssets = new Map<string, Asset>();
          prevAssets.forEach(asset => uniqueAssets.set(asset.id, asset));
          fetchedAssets.forEach((asset: Asset) => uniqueAssets.set(asset.id, asset));
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
