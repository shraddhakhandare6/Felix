
'use client';

import React, { useState, useEffect } from 'react';
import { useAccount } from '@/context/account-context';
import { useUser } from '@/context/user-context';
import { PageLoader } from '@/components/page-loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import { Users, Package, Landmark, TrendingUp, Shield, AlertCircle, ChevronDown, ChevronRight, X, Coins } from 'lucide-react';

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100' 
        : 'opacity-0'
    }`}>
      {/* Floating Elements */}
      <div className="fixed -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce pointer-events-none"></div>
      <div className="fixed -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
      
      <div className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Asset Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
          View and manage the assets issued by your account.
        </p>
            </div>
      </div>

      {error && (
            <Card className="backdrop-blur-sm bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 border-0 shadow-2xl">
          <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {issuedAssets.length === 0 && !error ? (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 text-center p-12">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                <Coins className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">No Assets Found</CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">There are no assets issued on the platform yet.</CardDescription>
        </Card>
      ) : (
        <div className="assets-container relative">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {issuedAssets.map((asset, index) => (
              <Card 
                key={asset.paging_token} 
                    className={`backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer ${
                  floatingAsset === asset.paging_token ? 'opacity-50' : 'hover:scale-[1.02]'
                }`}
                onClick={(e) => handleCardClick(asset.paging_token, e)}
                style={{
                  flex: '0 0 auto',
                      width: floatingAsset === asset.paging_token ? '100%' : 'auto',
                      animationDelay: `${index * 50}ms`
                }}
              >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">{asset.asset_code}</CardTitle>
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Landmark className="h-5 w-5 text-white" />
                      </div>
                </div>
                    <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>Asset Type: {asset.asset_type}</span>
                      <Badge 
                        variant={asset.flags.auth_required ? "destructive" : "secondary"}
                        className="font-medium"
                      >
                    {asset.flags.auth_required ? "Auth Required" : "No Auth"}
                  </Badge>
                </CardDescription>
                
                {/* Quick Summary - Always Visible */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Issued:</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.balances.authorized)}</span>
                    </div>
                    <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Accounts:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{getTotalAccounts(asset.accounts)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                    <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="fixed inset-0 z-50 flex items-start justify-center pt-8 bg-black/20 backdrop-blur-sm"
            onClick={() => {
              setFloatingAsset(null);
              setFloatingPosition(null);
            }}
          >
            <div
                  className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl max-w-4xl w-full mx-4"
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
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <Landmark className="h-6 w-6 text-white" />
                          </div>
                          <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{asset.asset_code}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Asset Type: {asset.asset_type}</span>
                                  <Badge 
                                    variant={asset.flags.auth_required ? "destructive" : "secondary"}
                                    className="font-medium"
                                  >
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
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                        <div className="p-6">
                          {/* Compact Layout - All details in a single view */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                      {/* Quick Summary */}
                              <div className="grid grid-cols-2 gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <div className="text-center">
                                  <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatBalance(asset.balances.authorized)}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Issued</div>
                        </div>
                        <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{getTotalAccounts(asset.accounts)}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Accounts</div>
                        </div>
                      </div>

                      {/* Trustline Details */}
                              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100 mb-3">
                                  <Users className="h-3 w-3" />
                                  Trustline Details
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Authorized:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{asset.accounts.authorized}</span>
                            </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Auth to Maintain:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{asset.accounts.authorized_to_maintain_liabilities}</span>
                            </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Unauthorized:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{asset.accounts.unauthorized}</span>
                          </div>
                        </div>
                      </div>

                      {/* Balance Details */}
                              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100 mb-3">
                                  <Package className="h-3 w-3" />
                                  Balance Details
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Authorized:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.balances.authorized)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Auth to Maintain:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.balances.authorized_to_maintain_liabilities)}</span>
                          </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Unauthorized:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.balances.unauthorized)}</span>
                          </div>
                                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">Total:</span>
                                    <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{formatBalance(getTotalBalance(asset.balances).toString())}</span>
                          </div>
                          </div>
                        </div>
                      </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                      {/* Additional Info */}
                              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100 mb-3">
                                  <TrendingUp className="h-3 w-3" />
                                  Additional Information
                                </h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Claimable:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.claimable_balances_amount)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Liquidity:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.liquidity_pools_amount)}</span>
                            </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Contracts:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-100">{formatBalance(asset.contracts_amount)}</span>
                            </div>
                            </div>
                          </div>

                              {/* Asset Flags */}
                              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <h4 className="font-semibold text-sm flex items-center gap-2 text-gray-900 dark:text-gray-100 mb-3">
                                  <Shield className="h-3 w-3" />
                                  Asset Flags
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {asset.flags.auth_revocable && (
                                    <Badge variant="outline" className="px-2 py-0.5 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">Revocable</Badge>
                                  )}
                                  {asset.flags.auth_immutable && (
                                    <Badge variant="outline" className="px-2 py-0.5 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">Immutable</Badge>
                                  )}
                                  {asset.flags.auth_clawback_enabled && (
                                    <Badge variant="outline" className="px-2 py-0.5 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">Clawback</Badge>
                                  )}
                                  {!asset.flags.auth_revocable && !asset.flags.auth_immutable && !asset.flags.auth_clawback_enabled && (
                                    <Badge variant="outline" className="px-2 py-0.5 text-xs bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700">Standard</Badge>
                                  )}
                                </div>
                              </div>

                              {/* Asset Details */}
                              <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-3">Asset Details</h4>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <span className="text-gray-600 dark:text-gray-400">Issuer:</span>
                                    <div className="mt-1 font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded text-gray-900 dark:text-gray-100 break-all">
                                {asset.asset_issuer}
                              </div>
                            </div>
                            <div>
                                    <span className="text-gray-600 dark:text-gray-400">Token:</span>
                                    <div className="mt-1 font-mono bg-gray-100 dark:bg-gray-800 p-1 rounded text-gray-900 dark:text-gray-100 break-all">
                                {asset.paging_token}
                              </div>
                            </div>
                          </div>
                        </div>
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
      </div>
    </div>
    
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
