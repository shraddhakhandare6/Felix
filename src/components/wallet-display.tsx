
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
import { BadgeDollarSign, CreditCard } from "lucide-react"
import { useTransactions, type Transaction as TxType } from '@/context/transactions-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/user-context';
import { useEntities } from '@/context/entity-context';
import { useToast } from '@/hooks/use-toast';

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
    return <p className="text-center text-muted-foreground py-8">Loading transactions...</p>
  }

  if (error) {
    return <p className="text-center text-red-500 py-8">Error loading transactions: {error}</p>
  }

  if (!transactions.length) {
    return <p className="text-center text-muted-foreground py-8">No transactions to display for this category.</p>
  }
  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Details</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
          {paginated.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <Badge variant={tx.type === "Sent" ? "destructive" : tx.type === "Received" ? "default" : "secondary"} className="capitalize">{tx.type}</Badge>
            </TableCell>
            <TableCell>{tx.service}</TableCell>
            <TableCell className="hidden md:table-cell">{tx.date}</TableCell>
            <TableCell className={`text-right font-mono ${tx.amount.startsWith('+') ? 'text-accent' : 'text-destructive'}`}>
              {tx.amount}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
        <div className="space-x-2">
          <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
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
  onSendPayment 
}: {
  recipient: string;
  setRecipient: (value: string) => void;
  amount: string;
  setAmount: (value: string) => void;
  memo: string;
  setMemo: (value: string) => void;
  onSendPayment: () => void;
}) => (
  <div className="space-y-4">
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
    <Button onClick={onSendPayment} className="w-full">Send BlueDollars</Button>
  </div>
);

interface WalletDisplayProps {
    entityName?: string | null;
}

export function WalletDisplay({ entityName }: WalletDisplayProps) {
  const searchParams = useSearchParams();
  const { transactions, addTransaction } = useTransactions();
  const { user } = useUser();
  const { entities } = useEntities();
  const { toast } = useToast();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ publicKey: string; secretKey: string } | null>(null);

  // Quick Payment form state
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');

  // Wallet balance state
  const [balances, setBalances] = useState<any[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

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
  const handleSendPayment = () => {
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

    const newTransaction: Omit<TxType, 'id' | 'icon' | 'status' | 'date'> = {
      type: 'Sent',
      recipient: recipient,
      service: memo || 'Quick Payment',
      amount: `-${numAmount.toFixed(2)} BD`,
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
      const balanceUrl = `http://localhost:5000/api/v1/wallets/balance/type/entity/${entityOwnerEmail}?creatorEmail=${encodeURIComponent(user.email)}`;
      
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
    let url = `http://localhost:5000/api/v1/wallets/balance/type/${walletType}/${walletEmail}`;
    if (creatorEmail && creatorEmail !== walletEmail) {
      url += `?creatorEmail=${encodeURIComponent(creatorEmail)}`;
    }
    setBalanceLoading(true);
    setBalanceError(null);
    setBalances([]);
    if (!walletEmail) {
      setBalanceError('No email found for wallet.');
      setBalanceLoading(false);
      return;
    }
    fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || data.message || 'Failed to fetch wallet balances');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBalances(data.data);
        } else {
          throw new Error('Invalid response from server');
        }
      })
      .catch((err) => {
        setBalanceError(err.message);
        setBalances([]);
      })
      .finally(() => setBalanceLoading(false));
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

  return (
    <>
      {entityName && (
        <div className="mb-4">
          <Button variant="secondary" onClick={() => setIsExportDialogOpen(true)}>
            Export Entity Wallet
          </Button>
          <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Wallet for Entity: {entityName}</DialogTitle>
                <DialogDescription>
                  Export the public and secret keys for this entity's wallet. You will need to provide the entity owner's email.
                </DialogDescription>
              </DialogHeader>
              {exportResult ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Public Key</label>
                    <Input readOnly value={exportResult.publicKey} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Secret Key</label>
                    <Input readOnly value={exportResult.secretKey} type="text" />
                  </div>
                </div>
              ) : (
                <Button onClick={handleExportWallet} disabled={exportLoading} className="w-full">
                  {exportLoading ? 'Exporting...' : 'Export Wallet'}
                </Button>
              )}
              {exportError && <div className="text-red-500 mt-2">{exportError}</div>}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Wallet Overview Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Wallet Overview</CardTitle>
          <CardDescription>
            Your current balance and a quick way to send BlueDollars.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-6 rounded-lg bg-primary/10">
            <div className="p-3 rounded-full bg-primary text-primary-foreground">
              <BadgeDollarSign className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">BlueDollars Balance</div>
              {balanceLoading ? (
                <div className="text-3xl font-bold">Loading...</div>
              ) : balanceError ? (
                <div className="text-3xl font-bold text-red-500">{balanceError}</div>
              ) : balances.length > 0 ? (
                (() => {
                  const bdAsset = balances.find((a: any) => a.asset_code === 'BD');
                  const asset = bdAsset || balances[0];
                  let code = asset.asset_code || asset.asset_type || 'Asset';
                  if (code === 'native') code = 'XLM';
                  return (
                    <div className="text-3xl font-bold">
                      {parseFloat(asset.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {code}
                    </div>
                  );
                })()
              ) : (
                <div className="text-3xl font-bold">-</div>
              )}
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Quick Payment</h3>
            <QuickPaymentForm
              recipient={recipient}
              setRecipient={setRecipient}
              amount={amount}
              setAmount={setAmount}
              memo={memo}
              setMemo={setMemo}
              onSendPayment={handleSendPayment}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {balanceLoading ? (
          <Card><CardContent>Loading balances...</CardContent></Card>
        ) : balanceError ? (
          <Card><CardContent className="text-red-500">{balanceError}</CardContent></Card>
        ) : balances.length === 0 ? (
          <Card><CardContent>No balances found.</CardContent></Card>
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
              <Card key={code}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{assetName}</CardTitle>
                  {code === 'BD' ? <BadgeDollarSign className="w-6 h-6 text-primary" /> : <CreditCard className="w-6 h-6 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{asset.balance}</div>
                  <p className="text-xs text-muted-foreground">{code}</p>
            </CardContent>
          </Card>
            );
          })
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {entityName 
              ? `Displaying transactions for entity: ${entityName}`
              : nameFilter
                ? `Displaying transactions for "${nameFilter}"`
                : 'A complete log of your account activity.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <TransactionTable 
                transactions={filteredTransactions} 
                isLoading={entityName ? transactionLoading : false}
                error={entityName ? transactionError : null}
              />
            </TabsContent>
            <TabsContent value="sent" className="mt-4">
              <TransactionTable 
                transactions={sentTransactions} 
                isLoading={entityName ? transactionLoading : false}
                error={entityName ? transactionError : null}
              />
            </TabsContent>
            <TabsContent value="received" className="mt-4">
              <TransactionTable 
                transactions={receivedTransactions} 
                isLoading={entityName ? transactionLoading : false}
                error={entityName ? transactionError : null}
              />
            </TabsContent>
            <TabsContent value="trades" className="mt-4">
              <TransactionTable 
                transactions={tradeTransactions} 
                isLoading={entityName ? transactionLoading : false}
                error={entityName ? transactionError : null}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
