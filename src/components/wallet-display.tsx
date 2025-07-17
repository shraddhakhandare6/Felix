
'use client';

import React, { useMemo } from 'react';
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

const assets = [
  { name: "BlueDollars", code: "BD", balance: "10,430.50", icon: <BadgeDollarSign className="w-6 h-6 text-primary" /> },
  { name: "USDC", code: "USDC", balance: "500.00", icon: <CreditCard className="w-6 h-6 text-muted-foreground" /> },
]

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
  
  const nameFilter = entityName || searchParams.get('name');

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

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assets.map(asset => (
          <Card key={asset.code}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{asset.name}</CardTitle>
              {asset.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{asset.balance}</div>
              <p className="text-xs text-muted-foreground">{asset.code}</p>
            </CardContent>
          </Card>
        ))}
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
