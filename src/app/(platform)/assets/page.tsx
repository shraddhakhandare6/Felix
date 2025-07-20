
'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from '@/context/account-context';
import { useUser } from '@/context/user-context';
import { PageLoader } from '@/components/page-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Users, Package, Landmark, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronRight, X } from 'lucide-react';

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
  const [floatingAsset, setFloatingAsset] = useState<string | null>(null);
  const [floatingPosition, setFloatingPosition] = useState<{ x: number; y: number } | null>(null);

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

  // Handle card click for floating behavior
  const handleCardClick = (assetId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const cardElement = event.currentTarget;
    const rect = cardElement.getBoundingClientRect();
    const containerRect = cardElement.closest('.assets-container')?.getBoundingClientRect();
    
    if (floatingAsset === assetId) {
      // Collapse the floating card
      setFloatingAsset(null);
      setFloatingPosition(null);
    } else {
      // Expand the clicked card
      setFloatingAsset(assetId);
      setFloatingPosition({
        x: rect.left - (containerRect?.left || 0),
        y: rect.top - (containerRect?.top || 0)
      });
    }
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
        <div className="assets-container relative">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {issuedAssets.map((asset) => (
              <Card 
                key={asset.paging_token} 
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  floatingAsset === asset.paging_token ? 'opacity-50' : 'hover:scale-[1.02]'
                }`}
                onClick={(e) => handleCardClick(asset.paging_token, e)}
                style={{
                  flex: '0 0 auto',
                  width: floatingAsset === asset.paging_token ? '100%' : 'auto'
                }}
              >
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
                <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors text-sm font-medium">
                  <span>{floatingAsset === asset.paging_token ? 'Click to collapse' : 'Click to expand'}</span>
                  {floatingAsset === asset.paging_token ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Floating Card Modal - Positioned absolutely */}
        {floatingAsset && floatingPosition && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setFloatingAsset(null);
              setFloatingPosition(null);
            }}
          >
            <div
              className="bg-background border rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              {(() => {
                const asset = issuedAssets.find(a => a.paging_token === floatingAsset);
                if (!asset) return null;
                
                return (
                  <>
                    <div className="p-6 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Landmark className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">{asset.asset_code}</h2>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-muted-foreground">Asset Type: {asset.asset_type}</span>
                              <Badge variant={asset.flags.auth_required ? "destructive" : "secondary"}>
                                {asset.flags.auth_required ? "Auth Required" : "No Auth"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setFloatingAsset(null);
                            setFloatingPosition(null);
                          }}
                          className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Quick Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{formatBalance(asset.balances.authorized)}</div>
                          <div className="text-sm text-muted-foreground">Total Issued</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{getTotalAccounts(asset.accounts)}</div>
                          <div className="text-sm text-muted-foreground">Total Accounts</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatBalance(asset.claimable_balances_amount)}</div>
                          <div className="text-sm text-muted-foreground">Claimable</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{formatBalance(asset.liquidity_pools_amount)}</div>
                          <div className="text-sm text-muted-foreground">Liquidity</div>
                        </div>
                      </div>

                      {/* Trustline Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" /> Trustline Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Authorized</span>
                              <span className="text-lg font-semibold">{asset.accounts.authorized}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Authorized to Maintain</span>
                              <span className="text-lg font-semibold">{asset.accounts.authorized_to_maintain_liabilities}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Unauthorized</span>
                              <span className="text-lg font-semibold">{asset.accounts.unauthorized}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Balance Details */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" /> Balance Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <span className="text-muted-foreground">Authorized</span>
                            <span className="font-semibold">{formatBalance(asset.balances.authorized)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <span className="text-muted-foreground">Authorized to Maintain</span>
                            <span className="font-semibold">{formatBalance(asset.balances.authorized_to_maintain_liabilities)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                            <span className="text-muted-foreground">Unauthorized</span>
                            <span className="font-semibold">{formatBalance(asset.balances.unauthorized)}</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                            <span className="font-medium">Total Balance</span>
                            <span className="text-lg font-bold">{formatBalance(getTotalBalance(asset.balances).toString())}</span>
                          </div>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" /> Additional Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Claimable Balances</span>
                              <span className="font-semibold">{formatBalance(asset.claimable_balances_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Liquidity Pools</span>
                              <span className="font-semibold">{formatBalance(asset.liquidity_pools_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Contracts</span>
                              <span className="font-semibold">{formatBalance(asset.contracts_amount)}</span>
                            </div>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <div className="mb-3">
                              <span className="text-sm font-medium text-muted-foreground">Asset Issuer</span>
                              <div className="mt-1 text-sm font-mono bg-muted p-2 rounded break-all">
                                {asset.asset_issuer}
                              </div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-muted-foreground">Paging Token</span>
                              <div className="mt-1 text-sm font-mono bg-muted p-2 rounded break-all">
                                {asset.paging_token}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Asset Flags */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" /> Asset Flags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {asset.flags.auth_revocable && (
                            <Badge variant="outline" className="px-3 py-1">Revocable</Badge>
                          )}
                          {asset.flags.auth_immutable && (
                            <Badge variant="outline" className="px-3 py-1">Immutable</Badge>
                          )}
                          {asset.flags.auth_clawback_enabled && (
                            <Badge variant="outline" className="px-3 py-1">Clawback Enabled</Badge>
                          )}
                          {!asset.flags.auth_revocable && !asset.flags.auth_immutable && !asset.flags.auth_clawback_enabled && (
                            <Badge variant="outline" className="px-3 py-1">Standard</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    )}
    
    <style jsx>{`
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
    `}</style>
  </div>
);
}
