
'use client';

import React, { Suspense } from 'react';
import { PageLoader } from '@/components/page-loader';
import { WalletDisplay } from '@/components/wallet-display';


function WalletPageContent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      <WalletDisplay />
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <WalletPageContent />
    </Suspense>
  )
}
