
'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  ArrowUpRight,
  ArrowDownLeft,
  BadgeDollarSign,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateRequestDialog } from '@/components/dialogs/create-request-dialog';
import { usePaymentRequests } from '@/context/payment-requests-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { PageLoader } from '@/components/page-loader';
import { useTransactions, type Transaction } from '@/context/transactions-context';
import { useUser } from '@/context/user-context';
import { useEntities } from '@/context/entity-context';


function DashboardPageContent() {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const { user: currentUser } = useUser();
  const { entities } = useEntities();

  const { incomingRequests, outgoingRequests, payRequest, declineRequest, cancelRequest } = usePaymentRequests();
  const { transactions, addTransaction } = useTransactions();
  const { toast } = useToast();
  
  const pendingIncoming = incomingRequests.filter((req) => req.status === 'Pending');
  const pendingOutgoing = outgoingRequests.filter((req) => req.status === 'Pending');

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  const recentTransactions = transactions.slice(0, 3);

  const isEntityOwner = useMemo(() => {
    if (!currentUser?.email || !entities) {
      return false;
    }
    return entities.some(entity => entity.ownerEmail === currentUser.email);
  }, [currentUser, entities]);

  useEffect(() => {
    const recipientParam = searchParams.get('recipient');
    if (recipientParam) {
      setRecipient(decodeURIComponent(recipientParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (initialized && !keycloak?.authenticated) {
      keycloak.login();
    }
  }, [initialized, keycloak]);

  const handleSendPayment = () => {
    if (!recipient || !amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter a recipient and amount.',
      });
      return;
    }

    const newTransaction: Omit<Transaction, 'id' | 'icon' | 'status' | 'date'> = {
      type: 'Sent',
      recipient: recipient,
      service: memo || 'Quick Payment',
      amount: `-${parseFloat(amount).toFixed(2)} BD`,
    };

    addTransaction(newTransaction);

    toast({
      title: 'Payment Sent',
      description: `${amount} BD successfully sent to ${recipient}.`,
    });

    setRecipient('');
    setAmount('');
    setMemo('');
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold">Initializing authentication...</p>
      </div>
    );
  }

  const getUsername = () => {
    const preferredUsername = keycloak.tokenParsed?.preferred_username;
    if (preferredUsername && preferredUsername.includes('@')) {
      return preferredUsername.split('@')[0];
    }
    return preferredUsername;
  };


  return (
    <div className="container mx-auto p-4 space-y-6">
      {keycloak?.authenticated && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Welcome, {getUsername()}
          </h2>
          <Button variant="destructive" onClick={logout}>
            Logout
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wallet Overview</CardTitle>
            <CardDescription>
              Your current balance and a quick way to send BlueDollars.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4 p-6 rounded-lg bg-primary/10">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <BadgeDollarSign className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">BlueDollars Balance</div>
                <div className="text-3xl font-bold">10,430.50 BD</div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-md">Quick Payment</h3>
              <div className="grid gap-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Input 
                  id="recipient" 
                  placeholder="Stellar address or user@domain.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (BD)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="50.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="memo">Memo (Optional)</Label>
                <Input 
                  id="memo" 
                  placeholder="For service..."
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSendPayment}>Send BlueDollars</Button>
          </CardFooter>
        </Card>

        {isEntityOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Awaiting your action or confirmation from others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingIncoming.slice(0, 3).map((req) => (
                <div key={req.id} className="flex flex-col gap-3 rounded-lg bg-secondary p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{req.amount}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => declineRequest(req.id)}>Decline</Button>
                      <Button size="sm" onClick={() => payRequest(req.id)}>Approve</Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground break-words">From {req.from}</div>
                    <div className="text-xs text-muted-foreground break-words">For: {req.for}</div>
                  </div>
                </div>
              ))}
              {pendingOutgoing.slice(0, 3).map((req) => (
                <div key={req.id} className="flex flex-col gap-3 rounded-lg bg-secondary/70 p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{req.amount}</div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="cursor-default hover:bg-transparent pointer-events-none">
                            <Clock className="w-4 h-4 mr-1"/> Pending
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => cancelRequest(req.id)}>Cancel</Button>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground break-words">To {req.to}</div>
                    <div className="text-xs text-muted-foreground break-words">For: {req.for}</div>
                  </div>
                </div>
              ))}
              <CreateRequestDialog>
                <Button variant="outline" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Request
                </Button>
              </CreateRequestDialog>
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="flex items-center gap-2">
                      {tx.type === 'Sent' 
                        ? <ArrowUpRight className="h-4 w-4 text-destructive" />
                        : <ArrowDownLeft className="h-4 w-4 text-accent" />
                      }
                      {tx.type}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{tx.recipient}</div>
                      <div className="text-sm text-muted-foreground">{tx.service}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">{tx.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DashboardPageContent />
    </Suspense>
  );
}
