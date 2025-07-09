'use client';

import React, { useMemo, Suspense } from 'react';
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
import { PageLoader } from '@/components/page-loader';

const assets = [
  { name: "BlueDollars", code: "BD", balance: "10,430.50", icon: <BadgeDollarSign className="w-6 h-6 text-primary" /> },
  { name: "USDC", code: "USDC", balance: "500.00", icon: <CreditCard className="w-6 h-6 text-muted-foreground" /> },
]

const allTransactions = [
    { type: "Sent", details: "Payment to Project Gamma for API Development", amount: "-500.00 BD", date: "2025-07-04" },
    { type: "Received", details: "Payment from CoE Desk for Consulting", amount: "+1,200.00 BD", date: "2025-07-03" },
    { type: "Offer Match", details: "Bought 100 BD for 100 USDC", amount: "+100.00 BD", date: "2025-07-02" },
    { type: "Offer Match", details: "Sold 100 USDC for 100 BD", amount: "-100.00 USDC", date: "2025-07-02" },
    { type: "Issued", details: "Initial funding from Admin", amount: "+10,000.00 BD", date: "2025-07-01" },
];

type Transaction = typeof allTransactions[number];

const TransactionTable = ({ transactions }: { transactions: Transaction[] }) => {
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
        {transactions.map((tx, index) => (
          <TableRow key={index}>
            <TableCell>
              <Badge variant={tx.type === "Sent" ? "destructive" : tx.type === "Received" ? "default" : "secondary"} className="capitalize">{tx.type}</Badge>
            </TableCell>
            <TableCell>{tx.details}</TableCell>
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

function WalletPageContent() {
  const searchParams = useSearchParams();
  const nameFilter = searchParams.get('name');

  const filteredTransactions = useMemo(() => {
    if (!nameFilter) {
      return allTransactions;
    }
    const lowerCaseFilter = nameFilter.toLowerCase();
    return allTransactions.filter(tx => tx.details.toLowerCase().includes(lowerCaseFilter));
  }, [nameFilter]);

  const sentTransactions = filteredTransactions.filter(tx => tx.type === 'Sent');
  const receivedTransactions = filteredTransactions.filter(tx => tx.type === 'Received' || tx.type === 'Issued');
  const tradeTransactions = filteredTransactions.filter(tx => tx.type === 'Offer Match');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
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
              ? `Displaying transactions involving "${nameFilter}"`
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
