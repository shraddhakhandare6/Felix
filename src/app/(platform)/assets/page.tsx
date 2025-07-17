
'use client';

import { AssetCard } from '@/components/asset-card';
import { useAccount } from '@/context/account-context';
import { useAssets } from '@/context/asset-context';
import { PageLoader } from '@/components/page-loader';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssetsPage() {
  const { assets, isLoading: isAssetsLoading } = useAssets();
  const { account, isLoading: isAccountLoading } = useAccount();

  if (isAssetsLoading || isAccountLoading) {
    return <PageLoader />;
  }

  const userPublicKey = account?.publicKey;
  const userIsIssuerForAtLeastOneAsset = assets.some(asset => asset.issuer === userPublicKey);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <p className="text-muted-foreground">
          View and manage the assets you have issued on the platform.
        </p>
      </div>

      {assets.length === 0 ? (
         <Card className="text-center p-12">
            <CardTitle>No Assets Found</CardTitle>
            <CardDescription className="mt-2">There are no assets created on the platform yet.</CardDescription>
        </Card>
      ) : !userIsIssuerForAtLeastOneAsset ? (
        <Card className="text-center p-12">
            <CardTitle>No Issued Assets</CardTitle>
            <CardDescription className="mt-2">You are not the issuer of any assets on the platform.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <AssetCard 
              key={asset.id} 
              asset={asset} 
              userPublicKey={userPublicKey} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
