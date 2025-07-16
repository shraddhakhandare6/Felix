
'use client';

import type { Asset } from '@/context/asset-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Users, Package, Landmark } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  userPublicKey: string | undefined;
}

export function AssetCard({ asset, userPublicKey }: AssetCardProps) {
  // Only render the card if the current user is the issuer of this asset.
  if (asset.issuer !== userPublicKey) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>{asset.asset_code}</CardTitle>
            <Landmark className="h-6 w-6 text-primary" />
        </div>
        <CardDescription>Asset issued by you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Users className="h-4 w-4" /> Trustlines
          </span>
          <span className="font-semibold">{asset.trustlines}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-2">
            <Package className="h-4 w-4" /> Total Issued
          </span>
          <span className="font-semibold">{asset.amount}</span>
        </div>
      </CardContent>
    </Card>
  );
}
