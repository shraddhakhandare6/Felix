
'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from '@/context/account-context';
import { useUser } from '@/context/user-context';
import { PageLoader } from '@/components/page-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Users, Package, Landmark, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface IssuedAsset {
  _links: {
    toml: {
      href: string;
    };
  };
  asset_type: string;
  asset_code: string;
  asset_issuer: string;
  paging_token: string;
  num_claimable_balances: number;
  num_liquidity_pools: number;
  num_contracts: number;
  accounts: {
    authorized: number;
    authorized_to_maintain_liabilities: number;
    unauthorized: number;
  };
  claimable_balances_amount: string;
  liquidity_pools_amount: string;
  contracts_amount: string;
  balances: {
    authorized: string;
    authorized_to_maintain_liabilities: string;
    unauthorized: string;
  };
  flags: {
    auth_required: boolean;
    auth_revocable: boolean;
    auth_immutable: boolean;
    auth_clawback_enabled: boolean;
  };
}

export default function AssetsPage() {
  const { account, isLoading: isAccountLoading } = useAccount();
  const { user } = useUser();
  const [issuedAssets, setIssuedAssets] = useState<IssuedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  // First fetch user's public key, then fetch issued assets
  useEffect(() => {
    const fetchUserPublicKeyAndAssets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Step 1: Fetch user's public key from wallet export API
        if (!user.email) {
          throw new Error('User email not available');
        }

        const exportResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/wallets/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });

        if (!exportResponse.ok) {
          const exportData = await exportResponse.json().catch(() => ({}));
          throw new Error(exportData.error || exportData.message || 'Failed to fetch user wallet');
        }

        const exportData = await exportResponse.json();
        
        if (!exportData.success || !Array.isArray(exportData.data) || !exportData.data[0]) {
          throw new Error('Invalid wallet export response');
        }

        const publicKey = exportData.data[0].public_key;
        setUserPublicKey(publicKey);

        // Step 2: Fetch issued assets using the user's public key
        const assetsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/assets/issued/${publicKey}`);
        
        if (!assetsResponse.ok) {
          throw new Error(`Failed to fetch assets: ${assetsResponse.status}`);
        }
        
        const assetsData = await assetsResponse.json();
        
        if (assetsData.success && Array.isArray(assetsData.data)) {
          setIssuedAssets(assetsData.data);
        } else {
          throw new Error('Invalid assets response format');
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
        setIssuedAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user.email) {
      fetchUserPublicKeyAndAssets();
    }
  }, [user.email]);

  // Format balance amount
  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (isNaN(num)) return '0';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 7 
    });
  };

  // Get total accounts
  const getTotalAccounts = (accounts: IssuedAsset['accounts']) => {
    return accounts.authorized + accounts.authorized_to_maintain_liabilities + accounts.unauthorized;
  };

  // Get total balance
  const getTotalBalance = (balances: IssuedAsset['balances']) => {
    const authorized = parseFloat(balances.authorized) || 0;
    const authorizedToMaintain = parseFloat(balances.authorized_to_maintain_liabilities) || 0;
    const unauthorized = parseFloat(balances.unauthorized) || 0;
    return authorized + authorizedToMaintain + unauthorized;
  };

  // Toggle asset expansion
  const toggleAssetExpansion = (assetId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
  };

  if (isAccountLoading || isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Asset Management</h1>
        <p className="text-muted-foreground">
          View and manage the assets issued by your account.
        </p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {issuedAssets.length === 0 && !error ? (
        <Card className="text-center p-12">
          <CardTitle>No Assets Found</CardTitle>
          <CardDescription className="mt-2">There are no assets issued on the platform yet.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {issuedAssets.map((asset) => (
            <Card key={asset.paging_token} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{asset.asset_code}</CardTitle>
                  <Landmark className="h-6 w-6 text-primary" />
                </div>
                <CardDescription className="flex items-center gap-2">
                  <span>Asset Type: {asset.asset_type}</span>
                  <Badge variant={asset.flags.auth_required ? "destructive" : "secondary"}>
                    {asset.flags.auth_required ? "Auth Required" : "No Auth"}
                  </Badge>
                </CardDescription>
                
                {/* Quick Summary - Always Visible */}
                <div className="mt-3 pt-3 border-t">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Issued:</span>
                      <span className="font-semibold">{formatBalance(asset.balances.authorized)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Accounts:</span>
                      <span className="font-medium">{getTotalAccounts(asset.accounts)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Collapsible 
                  open={expandedAssets.has(asset.paging_token)}
                  onOpenChange={() => toggleAssetExpansion(asset.paging_token)}
                >
                  <CollapsibleTrigger asChild>
                    <button className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-sm font-medium">
                      <span>View Details</span>
                      {expandedAssets.has(asset.paging_token) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="space-y-4 mt-3 pt-3 border-t">
                    {/* Trustline Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4" /> Trustline Details
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Authorized:</span>
                          <span className="font-medium">{asset.accounts.authorized}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Authorized to Maintain:</span>
                          <span className="font-medium">{asset.accounts.authorized_to_maintain_liabilities}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unauthorized:</span>
                          <span className="font-medium">{asset.accounts.unauthorized}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-medium">{getTotalAccounts(asset.accounts)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Balance Details */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Package className="h-4 w-4" /> Balance Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Authorized:</span>
                          <span className="font-medium">{formatBalance(asset.balances.authorized)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Authorized to Maintain:</span>
                          <span className="font-medium">{formatBalance(asset.balances.authorized_to_maintain_liabilities)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unauthorized:</span>
                          <span className="font-medium">{formatBalance(asset.balances.unauthorized)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t">
                          <span className="text-muted-foreground font-medium">Total Balance:</span>
                          <span className="font-semibold">{formatBalance(getTotalBalance(asset.balances).toString())}</span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-3 pt-2 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Additional Info
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Claimable:</span>
                          <span className="font-medium">{formatBalance(asset.claimable_balances_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Liquidity:</span>
                          <span className="font-medium">{formatBalance(asset.liquidity_pools_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contracts:</span>
                          <span className="font-medium">{formatBalance(asset.contracts_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Asset Issuer:</span>
                          <span className="font-medium text-xs truncate max-w-[120px]" title={asset.asset_issuer}>
                            {asset.asset_issuer}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Asset Flags */}
                    <div className="space-y-2 pt-2 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Asset Flags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {asset.flags.auth_revocable && (
                          <Badge variant="outline" className="text-xs">Revocable</Badge>
                        )}
                        {asset.flags.auth_immutable && (
                          <Badge variant="outline" className="text-xs">Immutable</Badge>
                        )}
                        {asset.flags.auth_clawback_enabled && (
                          <Badge variant="outline" className="text-xs">Clawback</Badge>
                        )}
                        {!asset.flags.auth_revocable && !asset.flags.auth_immutable && !asset.flags.auth_clawback_enabled && (
                          <Badge variant="outline" className="text-xs">Standard</Badge>
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
