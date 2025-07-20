
'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BadgeDollarSign, CreditCard, RefreshCw, Send, TrendingUp, Activity } from "lucide-react"
import { useTransactions, type Transaction as TxType } from '@/context/transactions-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/user-context';
import { useEntities } from '@/context/entity-context';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from '@/context/account-context';
import { sendPayment } from '@/lib/api';

const TransactionTable = ({ 
  transactions, 
  isLoading = false, 
  error = null 
}: { 
  transactions: TxType[];
  isLoading?: boolean;
  error?: string | null;
}) => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginated = transactions.slice((page - 1) * pageSize, page * pageSize);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading transactions: {error}</p>
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No transactions to display for this category.</p>
      </div>
    )
  }
  
  return (
    <>
      <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
    <Table>
      <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
              <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Details</TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
              <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
            {paginated.map((tx, index) => (
              <TableRow 
                key={tx.id}
                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
            <TableCell>
                  <Badge 
                    variant={tx.type === "Sent" ? "destructive" : tx.type === "Received" ? "default" : "secondary"} 
                    className="capitalize font-medium"
                  >
                    {tx.type}
                  </Badge>
            </TableCell>
                <TableCell className="text-gray-900 dark:text-gray-100">{tx.service}</TableCell>
                <TableCell className="hidden md:table-cell text-gray-600 dark:text-gray-400">{tx.date}</TableCell>
                <TableCell className={`text-right font-mono font-semibold ${tx.amount.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {tx.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">Page {page} of {totalPages}</span>
        <div className="space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            disabled={page === 1}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Previous
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages}
            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
};

// Quick Payment Form Component - moved outside to prevent re-rendering issues
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
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="memo" className="text-sm font-medium text-gray-700 dark:text-gray-300">Memo (Optional)</Label>
      <Input 
        id="memo" 
        placeholder="For service..."
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      />
    </div>
    <Button 
      onClick={onSendPayment} 
      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group" 
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

interface WalletDisplayProps {
    entityName?: string | null;
}

export function WalletDisplay({ entityName }: WalletDisplayProps) {
  const searchParams = useSearchParams();
  const { transactions, addTransaction, refetchTransactions } = useTransactions();
  const { user } = useUser();
  const { entities } = useEntities();
  const { toast } = useToast();
  const { balances, isLoading: isAccountLoading, error: accountError, refetchBalances } = useAccount();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ publicKey: string; secretKey: string } | null>(null);

  // Quick Payment form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Entity transaction state
  const [entityTransactions, setEntityTransactions] = useState<TxType[]>([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  
  const nameFilter = entityName || searchParams.get('name');

  // Determine email and type for balance API
  let walletType = 'user';
  let walletEmail = user.email;
  let creatorEmail = user.email;
  let entityParam = undefined;
  if (entityName) {
    walletType = 'entity';
    const entity = entities.find(e => e.name === entityName);
    walletEmail = entity?.ownerEmail || '';
    creatorEmail = user.email;
    entityParam = entityName;
  }

  // Handle Quick Payment
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

    if (!user.email) {
      toast({
        variant: 'destructive',
        title: 'User not found',
        description: 'Please log in again.',
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('Sending payment:', { recipient, amount: numAmount, sender: user.email });
      
      // Send payment via backend API
      const result = await sendPayment({
        recipient,
        amount: numAmount.toString(),
        memo,
        senderEmail: user.email
      });

      console.log('Payment result:', result);

      // Add transaction to local state (optimistic update)
      const newTransaction: Omit<TxType, 'id' | 'icon' | 'status' | 'date'> = {
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

  // Fetch entity transactions
  const fetchEntityTransactions = async (entityOwnerEmail: string, entityName: string) => {
    setTransactionLoading(true);
    setTransactionError(null);
    setEntityTransactions([]);
    
    try {
      // First get the entity's public key
      const exportResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/wallets/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: entityOwnerEmail, entityName }),
      });

      if (!exportResponse.ok) {
        throw new Error('Failed to fetch entity wallet');
      }

      const exportData = await exportResponse.json();
      if (!exportData.success || !Array.isArray(exportData.data) || !exportData.data[0]) {
        throw new Error('Invalid entity wallet response');
      }

      const entityPublicKey = exportData.data[0].public_key;

      // Then fetch transactions for the entity using the balance API
      const balanceUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/wallets/balance/type/entity/${entityOwnerEmail}?creatorEmail=${encodeURIComponent(user.email)}`;
      
      const balanceResponse = await fetch(balanceUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!balanceResponse.ok) {
        throw new Error('Failed to fetch entity transactions');
      }

      const balanceData = await balanceResponse.json();
      
      if (balanceData.success && Array.isArray(balanceData.data)) {
        // Map balance entries to transactions
        const mappedTransactions: TxType[] = balanceData.data.map((item: any, idx: number) => {
          let code = item.asset_code || item.asset_type || 'Asset';
          if (item.asset_type === 'native' || code === 'native') code = 'XLM';
          let amount = item.balance;
          if (typeof amount === 'number') amount = amount.toString();
          if (typeof amount !== 'string') amount = '0';
          if (!amount.startsWith('+') && !amount.startsWith('-')) amount = '+' + amount;
          
          return {
            id: `entity_tx_${entityName}_${idx}_${Date.now()}`,
            type: 'Received',
            icon: <BadgeDollarSign className="h-4 w-4 text-accent" />,
            recipient: entityName,
            service: `${code} Balance`,
            amount,
            status: 'Completed',
            date: new Date().toISOString().split('T')[0],
          };
        });
        
        setEntityTransactions(mappedTransactions);
      } else {
        throw new Error('Invalid balance response format');
      }
    } catch (err: any) {
      console.error('Error fetching entity transactions:', err);
      setTransactionError(err.message || 'Failed to fetch entity transactions');
      setEntityTransactions([]);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Fetch wallet balances
  React.useEffect(() => {
    // Add creatorEmail as a query param if needed
    let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/wallets/balance/type/${walletType}/${walletEmail}`;
    if (creatorEmail && creatorEmail !== walletEmail) {
      url += `?creatorEmail=${encodeURIComponent(creatorEmail)}`;
    }
    if (!walletEmail) {
      return;
    }
  }, [walletType, walletEmail, creatorEmail, entityParam]);

  // Fetch entity transactions when entity is selected
  React.useEffect(() => {
    if (entityName) {
      const entity = entities.find(e => e.name === entityName);
      if (entity && entity.ownerEmail) {
        fetchEntityTransactions(entity.ownerEmail, entityName);
      }
    } else {
      // Clear entity transactions when no entity is selected
      setEntityTransactions([]);
      setTransactionError(null);
    }
  }, [entityName, entities, user.email]);

  // Use entity transactions if entity is selected, otherwise use user transactions
  const transactionsToUse = entityName ? entityTransactions : transactions;

  const filteredTransactions = useMemo(() => {
    if (!nameFilter) {
      return transactionsToUse;
    }
    const lowerCaseFilter = nameFilter.toLowerCase();
    return transactionsToUse.filter(tx => tx.recipient.toLowerCase().includes(lowerCaseFilter));
  }, [nameFilter, transactionsToUse]);

  const sentTransactions = filteredTransactions.filter(tx => tx.type === 'Sent');
  const receivedTransactions = filteredTransactions.filter(tx => tx.type === 'Received' || tx.type === 'Issued');
  const tradeTransactions = filteredTransactions.filter(tx => tx.type === 'Offer Match');

  // Entity wallet export logic
  const handleExportWallet = async () => {
    setExportLoading(true);
    setExportError(null);
    setExportResult(null);
    try {
      // For demo, prompt for email (in real app, get from entity context or props)
      const email = prompt('Enter entity owner email for export:');
      if (!email || !entityName) {
        setExportError('Email and entity name are required.');
        setExportLoading(false);
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/wallets/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, entityName }),
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data[0]) {
        setExportResult({ publicKey: data.data[0].public_key, secretKey: data.data[0].secret });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setExportError(err.message || 'Failed to export wallet');
    } finally {
      setExportLoading(false);
    }
  };

  // Asset name mapping
  const assetNameMap: Record<string, string> = {
    BD: 'BlueDollars',
    USDC: 'USDC',
    // Add more mappings as needed
  };

  const handleCreateTrustline = async (assetCode: string, issuer: string) => {
    // This function will need to be implemented
    // It should make an API call to create a trustline
    toast({
      title: 'Trustline creation initiated',
      description: `Creating trustline for ${assetCode}...`
    });
  }

  if (isAccountLoading) {
    return (
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Wallet Overview</CardTitle>
              <CardDescription className="text-base">Loading wallet details...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Export Wallet Keys</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              These are your wallet keys. Keep them secure and do not share them.
            </DialogDescription>
          </DialogHeader>
          {exportLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
          {exportError && <p className="text-red-500">{exportError}</p>}
          {exportResult && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="publicKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Key</Label>
                <Input 
                  id="publicKey" 
                  value={exportResult.publicKey} 
                  readOnly 
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                />
              </div>
              <div>
                <Label htmlFor="secretKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">Secret Key</Label>
                <Input 
                  id="secretKey" 
                  value={exportResult.secretKey} 
                  readOnly 
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 mb-6">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <BadgeDollarSign className="w-5 h-5 text-white" />
              </div>
            <div>
                <CardTitle className="text-2xl font-bold">Wallet Overview</CardTitle>
                <CardDescription className="text-base">
                Your current balance and a quick way to send BlueDollars.
              </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                console.log('Manual balance refresh requested');
                await refetchBalances();
                await refetchTransactions();
                toast({
                  title: 'Balance Refreshed',
                  description: 'Your wallet balance has been updated.',
                });
              }}
              disabled={isAccountLoading}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAccountLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  const bdAsset = balances.find((a: any) => a.asset_code === 'BD');
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
          
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {isAccountLoading ? (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading balances...</p>
              </div>
            </CardContent>
          </Card>
        ) : accountError ? (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="text-red-500 py-8 text-center">{accountError.message}</CardContent>
          </Card>
        ) : balances.length === 0 ? (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardContent className="py-8 text-center text-gray-600 dark:text-gray-400">No balances found.</CardContent>
          </Card>
        ) : (
          balances.map((asset, idx) => {
            let code = asset.asset_code || asset.asset_type || idx;
            let assetName = assetNameMap[code] || code;
            // If asset_type is 'native', show 'XLM' everywhere
            if (asset.asset_type === 'native' || code === 'native') {
              code = 'XLM';
              assetName = 'XLM';
            }
            return (
              <Card key={code} className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">{assetName}</CardTitle>
                  {code === 'BD' ? 
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <BadgeDollarSign className="w-4 h-4 text-white" />
                    </div> : 
                    <div className="p-2 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                  }
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{asset.balance}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{code}</p>
            </CardContent>
          </Card>
            );
          })
        )}
      </div>

      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Transaction History</CardTitle>
              <CardDescription className="text-base">
            A record of all transactions on your account.
          </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300">All</TabsTrigger>
              <TabsTrigger value="sent" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300">Sent</TabsTrigger>
              <TabsTrigger value="received" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300">Received</TabsTrigger>
              <TabsTrigger value="trades" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300">Trades</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <TransactionTable transactions={filteredTransactions} isLoading={transactionLoading} error={transactionError} />
            </TabsContent>
            <TabsContent value="sent">
              <TransactionTable transactions={sentTransactions} isLoading={transactionLoading} error={transactionError} />
            </TabsContent>
            <TabsContent value="received">
              <TransactionTable transactions={receivedTransactions} isLoading={transactionLoading} error={transactionError} />
            </TabsContent>
            <TabsContent value="trades">
              <TransactionTable transactions={tradeTransactions} isLoading={transactionLoading} error={transactionError} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
