
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="flex items-center gap-4">
          <Logo className="w-16 h-16 text-primary" />
          <h1 className="text-6xl font-bold text-primary">Felix</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-md px-4">
          A modern platform for blockchain-powered services, wallets, and assets.
        </p>
        <div className="flex gap-4">
           <Link href="/dashboard" passHref>
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
