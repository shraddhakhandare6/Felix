
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
import {
  ArrowUpRight,
  ArrowDownLeft,
  BadgeDollarSign,
  PlusCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  Users,
  Activity,
  Wallet,
  Send,
  LogOut,
  Sparkles,
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
import { useAccount } from '@/context/account-context';
import { sendPayment } from '@/lib/api';

// Quick Payment Form Component - moved completely outside to prevent re-rendering issues
const QuickPaymentForm = ({ 
  recipient, 
  setRecipient, 
  amount, 
  setAmount, 
  memo, 
  setMemo, 
  onSendPayment, 
  isSending 
}: {
  recipient: string;
  setRecipient: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  memo: string;
  setMemo: (value: string) => void;
  onSendPayment: () => void;
  isSending: boolean;
}) => (
  <div className="space-y-4">
    <div className="grid gap-2">
      <Label htmlFor="recipient" className="text-sm font-medium text-gray-700 dark:text-gray-300">Recipient</Label>
      <Input 
        id="recipient" 
        placeholder="Stellar address or user@domain.com"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="amount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount (BD)</Label>
      <Input 
        id="amount" 
        type="text" 
        placeholder="50.00" 
        value={amount}
        onChange={(e) => {
          // Only allow numbers and decimal point
          const value = e.target.value;
          if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setAmount(value);
          }
        }}
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="memo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Memo (Optional)</Label>
      <Input 
        id="memo" 
        placeholder="For service..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    <Button 
      onClick={onSendPayment} 
      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group" 
      disabled={isSending}
    >
      {isSending ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Sending...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4" />
          <span>Send BlueDollars</span>
        </div>
      )}
    </Button>
  </div>
);

function DashboardPageContent() {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();
  const { user: currentUser } = useUser();
  const { entities } = useEntities();
  const { balances, isLoading: isAccountLoading, error: accountError, refetchBalances } = useAccount();

  const { incomingRequests, outgoingRequests, payRequest, declineRequest, cancelRequest } = usePaymentRequests();
  const { transactions, addTransaction, refetchTransactions } = useTransactions();
  const { toast } = useToast();
  
  const pendingIncoming = incomingRequests.filter((req) => req.status === 'Pending');
  const pendingOutgoing = outgoingRequests.filter((req) => req.status === 'Pending');

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const recentTransactions = transactions.slice(0, 5);

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

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSendPayment = async () => {
    if (!recipient || !amount) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter a recipient and amount.',
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid positive amount.',
      });
      return;
    }

    if (!currentUser?.email) {
      toast({
        variant: 'destructive',
        title: 'User not found',
        description: 'Please log in again.',
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('Sending payment:', { recipient, amount: numAmount, sender: currentUser.email });
      
      // Send payment via backend API
      const result = await sendPayment({
        recipient,
        amount: numAmount.toString(),
        memo,
        senderEmail: currentUser.email
      });

      console.log('Payment result:', result);

      // Add transaction to local state (optimistic update)
      const newTransaction: Omit<Transaction, 'id' | 'icon' | 'status' | 'date'> = {
        type: 'Sent',
        recipient: recipient,
        service: memo || 'Quick Payment',
        amount: `-${numAmount.toFixed(2)} BD`,
      };

      addTransaction(newTransaction);

      // Wait a bit longer to ensure backend has processed the transaction
      console.log('Waiting for backend to process transaction...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refetch balance to show updated amount
      console.log('Refetching balances...');
      await refetchBalances();
      
      // Refetch transactions to get the latest from backend
      console.log('Refetching transactions...');
      await refetchTransactions();

      toast({
        title: 'Payment Sent',
        description: `${amount} BD successfully sent to ${recipient}.`,
      });

      setRecipient('');
      setAmount('');
      setMemo('');
    } catch (error) {
      console.error('Payment failed:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An error occurred while sending the payment.',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!initialized || isAccountLoading) {
    return <PageLoader />;
  }

  const getUsername = () => {
    const preferredUsername = keycloak.tokenParsed?.preferred_username;
    let username = preferredUsername;
    if (preferredUsername && preferredUsername.includes('@')) {
      username = preferredUsername.split('@')[0];
    }
    if (username && typeof username === 'string' && username.length > 0) {
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    return username;
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto p-6 space-y-8">
        {keycloak?.authenticated && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Welcome back, {getUsername()}!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Here's what's happening with your account today
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        )}

        {isEntityOwner ? (
          // Layout for ENTITY OWNERS
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
            <Card className="lg:col-span-2 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Wallet Overview</CardTitle>
                    <CardDescription className="text-base">
                      Your current balance and a quick way to send BlueDollars.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="flex items-center gap-6 p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <BadgeDollarSign className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">BlueDollars Balance</div>
                    {isAccountLoading ? (
                      <div className="text-4xl font-bold text-gray-400">Loading...</div>
                    ) : accountError ? (
                      <div className="text-4xl font-bold text-red-500">{accountError.message}</div>
                    ) : balances.length > 0 ? (
                       (() => {
                          const bdAsset = balances.find(a => a.asset_code === 'BD');
                          const asset = bdAsset || balances[0];
                          let code = asset.asset_code || asset.asset_type || 'Asset';
                          if (code === 'native') code = 'XLM';
                          return (
                            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              {parseFloat(asset.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {code}
                            </div>
                          );
                        })()
                    ) : (
                      <div className="text-4xl font-bold text-gray-400">-</div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={refetchBalances} 
                    className="p-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200"
                  >
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </Button>
                </div>
                <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <Send className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Quick Payment</h3>
                    </div>
                    <QuickPaymentForm
                      recipient={recipient}
                      setRecipient={setRecipient}
                      amount={amount}
                      setAmount={setAmount}
                      memo={memo}
                      setMemo={setMemo}
                      onSendPayment={handleSendPayment}
                      isSending={isSending}
                    />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1 h-fit backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Pending Requests</CardTitle>
                    <CardDescription>
                      Awaiting your action or confirmation from others.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[450px] overflow-y-auto">
                {pendingIncoming.map((req) => (
                  <div key={req.id} className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg text-green-700 dark:text-green-300">{req.amount}</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => declineRequest(req.id)} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">Decline</Button>
                        <Button size="sm" onClick={() => payRequest(req.id)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 break-words">From {req.from}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 break-words">For: {req.for}</div>
                    </div>
                  </div>
                ))}
                {pendingOutgoing.map((req) => (
                  <div key={req.id} className="flex flex-col gap-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 border border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-lg text-orange-700 dark:text-orange-300">{req.amount}</div>
                      <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="cursor-default hover:bg-transparent pointer-events-none text-orange-600">
                              <Clock className="w-4 h-4 mr-1"/> Pending
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => cancelRequest(req.id)}>Cancel</Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 break-words">To {req.to}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 break-words">For: {req.for}</div>
                    </div>
                  </div>
                ))}
                <CreateRequestDialog>
                  <Button variant="outline" className="w-full mt-4 h-12 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 hover:border-blue-300 transition-all duration-200">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Request
                  </Button>
                </CreateRequestDialog>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                    <CardDescription>
                      Your latest account activity and transaction history.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-800">
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Details</TableHead>
                        <TableHead className="text-right font-semibold">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                          <TableCell className="flex items-center gap-2">
                            {tx.type === 'Sent' 
                              ? <ArrowUpRight className="h-4 w-4 text-red-500" />
                              : <ArrowDownLeft className="h-4 w-4 text-green-500" />
                            }
                            <span className="font-medium">{tx.type}</span>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{tx.recipient}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{tx.service}</div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-semibold">{tx.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Layout for ADMINS and regular USERS
          <>
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
                    <BadgeDollarSign className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">BlueDollars Balance</div>
                    {isAccountLoading ? (
                      <div className="text-4xl font-bold text-gray-400">Loading...</div>
                    ) : accountError ? (
                      <div className="text-4xl font-bold text-red-500">{accountError.message}</div>
                    ) : balances.length > 0 ? (
                      (() => {
                        const bdAsset = balances.find(a => a.asset_code === 'BD');
                        const asset = bdAsset || balances[0];
                        let code = asset.asset_code || asset.asset_type || 'Asset';
                        if (code === 'native') code = 'XLM';
                        return (
                          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {parseFloat(asset.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {code}
                          </div>
                        );
                      })()
                    ) : (
                      <div className="text-4xl font-bold text-gray-400">-</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Quick Payment</CardTitle>
                      <CardDescription>A quick way to send BlueDollars.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <QuickPaymentForm
                    recipient={recipient}
                    setRecipient={setRecipient}
                    amount={amount}
                    setAmount={setAmount}
                    memo={memo}
                    setMemo={setMemo}
                    onSendPayment={handleSendPayment}
                    isSending={isSending}
                  />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                      <CardDescription>Your latest account activity.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">Details</TableHead>
                          <TableHead className="text-right font-semibold">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.map((tx) => (
                          <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                            <TableCell className="flex items-center gap-2">
                              {tx.type === 'Sent' 
                                ? <ArrowUpRight className="h-4 w-4 text-red-500" />
                                : <ArrowDownLeft className="h-4 w-4 text-green-500" />
                              }
                              <span className="font-medium">{tx.type}</span>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{tx.recipient}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{tx.service}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono font-semibold">{tx.amount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
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
