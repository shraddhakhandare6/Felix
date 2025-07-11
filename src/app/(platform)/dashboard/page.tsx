
'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateRequestDialog } from '@/components/dialogs/create-request-dialog';
import { usePaymentRequests } from '@/context/payment-requests-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { PageLoader } from '@/components/page-loader';

const transactions = [
  {
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-destructive" />,
    recipient: 'Project Gamma',
    service: 'API Development',
    amount: '-500 BD',
    status: 'Completed',
  },
  {
    type: 'Received',
    icon: <ArrowDownLeft className="h-4 w-4 text-accent" />,
    recipient: 'CoE Desk',
    service: 'Consulting',
    amount: '+1,200 BD',
    status: 'Completed',
  },
  {
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-destructive" />,
    recipient: 'user@domain.com',
    service: 'Design Assets',
    amount: '-150 BD',
    status: 'Pending',
  },
];

function DashboardPageContent() {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  const { incomingRequests, payRequest, declineRequest } = usePaymentRequests();
  const { toast } = useToast();
  const requests = incomingRequests.filter((req) => req.status === 'Pending');

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    const recipientParam = searchParams.get('recipient');
    if (recipientParam) {
      setRecipient(decodeURIComponent(recipientParam));
    }
  }, [searchParams]);

  // Redirect to login if not authenticated
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

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>
              Payment and multi-signature requests awaiting your action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests.map((req) => (
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
            <CreateRequestDialog>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Request
              </Button>
            </CreateRequestDialog>
          </CardContent>
        </Card>

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
                {transactions.map((tx, i) => (
                  <TableRow key={i}>
                    <TableCell className="flex items-center gap-2">
                      {tx.icon} {tx.type}
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
