
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
import { useUser } from '@/context/user-context';
import { useEntities } from '@/context/entity-context';

const TransactionTable = ({ transactions }: { transactions: TxType[] }) => {
  if (!transactions.length) {
    return <p className="text-center text-muted-foreground py-8">No transactions to display for this category.</p>
  }
  
  return (
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
        {transactions.map((tx) => (
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
  );
};

interface WalletDisplayProps {
    entityName?: string | null;
}

export function WalletDisplay({ entityName }: WalletDisplayProps) {
  const searchParams = useSearchParams();
  const { transactions } = useTransactions();
  const { user } = useUser();
  const { entities } = useEntities();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<{ publicKey: string; secretKey: string } | null>(null);

  // Wallet balance state
  const [balances, setBalances] = useState<any[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

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

  const filteredTransactions = useMemo(() => {
    if (!nameFilter) {
      return transactions;
    }
    const lowerCaseFilter = nameFilter.toLowerCase();
    return transactions.filter(tx => tx.recipient.toLowerCase().includes(lowerCaseFilter));
  }, [nameFilter, transactions]);

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
      const response = await fetch('http://localhost:5000/api/v1/wallets/export', {
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
                <DialogTitle>Export Wallet for Entity: {entityName}</DialogTitle>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {balanceLoading ? (
          <Card><CardContent>Loading balances...</CardContent></Card>
        ) : balanceError ? (
          <Card><CardContent className="text-red-500">{balanceError}</CardContent></Card>
        ) : balances.length === 0 ? (
          <Card><CardContent>No balances found.</CardContent></Card>
        ) : (
          balances.map((asset, idx) => {
            const code = asset.asset_code || asset.asset_type || idx;
            const assetName = assetNameMap[code] || code;
            return (
              <Card key={code}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{assetName}</CardTitle>
                  {asset.asset_code === 'BD' ? <BadgeDollarSign className="w-6 h-6 text-primary" /> : <CreditCard className="w-6 h-6 text-muted-foreground" />}
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
            {nameFilter
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
              <TransactionTable transactions={filteredTransactions} />
            </TabsContent>
            <TabsContent value="sent" className="mt-4">
              <TransactionTable transactions={sentTransactions} />
            </TabsContent>
            <TabsContent value="received" className="mt-4">
              <TransactionTable transactions={receivedTransactions} />
            </TabsContent>
            <TabsContent value="trades" className="mt-4">
              <TransactionTable transactions={tradeTransactions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
