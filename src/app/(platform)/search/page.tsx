
'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const contacts = [
    { name: "CoE Desk", address: "coe_desk*felix.com", avatar: "C", href: "/contacts" },
    { name: "Project Alpha", address: "G...XYZ", avatar: "A", href: "/contacts" },
    { name: "Project Gamma", address: "G...ABC", avatar: "G", href: "/contacts" },
    { name: "Individual Member", address: "member_one*felix.com", avatar: "I", href: "/contacts" },
];

const services = [
  {
    name: "UX/UI Design Mockup",
    description: "High-fidelity mockups for web and mobile apps.",
    priceModel: "Fixed",
    status: "Active",
    href: "/marketplace",
  },
  {
    name: "Backend API Endpoint",
    description: "Develop and deploy a single API endpoint.",
    priceModel: "Per Endpoint",
    status: "Active",
    href: "/marketplace",
  },
  {
    name: "Technical Documentation",
    description: "Create comprehensive technical docs for a project.",
    priceModel: "Per Page",
    status: "Active",
    href: "/marketplace",
  },
  {
    name: "1 Hour Consulting",
    description: "Expert advice on blockchain technology.",
    priceModel: "Hourly",
    status: "Active",
    href: "/marketplace",
  },
    {
    name: "Code Review",
    description: "Review up to 1,000 lines of code for quality.",
    priceModel: "Fixed",
    status: "Draft",
    href: "/marketplace",
  },
];

const transactions = [
  {
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-destructive" />,
    recipient: 'Project Gamma',
    service: 'API Development',
    amount: '-500 BD',
    status: 'Completed',
    href: "/wallet",
  },
  {
    type: 'Received',
    icon: <ArrowDownLeft className="h-4 w-4 text-accent" />,
    recipient: 'CoE Desk',
    service: 'Consulting',
    amount: '+1,200 BD',
    status: 'Completed',
    href: "/wallet",
  },
  {
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-destructive" />,
    recipient: 'user@domain.com',
    service: 'Design Assets',
    amount: '-150 BD',
    status: 'Pending',
    href: "/wallet",
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const filteredResults = useMemo(() => {
    if (!query) {
      return { contacts: [], services: [], transactions: [] };
    }

    const lowerCaseQuery = query.toLowerCase();

    const filteredContacts = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerCaseQuery) ||
        contact.address.toLowerCase().includes(lowerCaseQuery)
    );

    const filteredServices = services.filter(
      (service) =>
        service.name.toLowerCase().includes(lowerCaseQuery) ||
        service.description.toLowerCase().includes(lowerCaseQuery)
    );
      
    const filteredTransactions = transactions.filter(
        (tx) => 
        tx.recipient.toLowerCase().includes(lowerCaseQuery) ||
        tx.service.toLowerCase().includes(lowerCaseQuery) ||
        tx.type.toLowerCase().includes(lowerCaseQuery)
    );

    return { contacts: filteredContacts, services: filteredServices, transactions: filteredTransactions };
  }, [query]);
  
  const totalResults = filteredResults.contacts.length + filteredResults.services.length + filteredResults.transactions.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Search Results</h1>
      <p className="text-muted-foreground">
        {totalResults > 0 
            ? `Found ${totalResults} result${totalResults > 1 ? 's' : ''} for "${query}"`
            : `No results found for "${query}"`
        }
      </p>

      {totalResults === 0 && (
        <Card className="text-center p-12">
            <CardTitle>Nothing Found</CardTitle>
            <CardDescription className="mt-2">Try a different search term.</CardDescription>
        </Card>
      )}

      {filteredResults.contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({filteredResults.contacts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Address</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.contacts.map((contact, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40/3F51B5/FFFFFF/png?text=${contact.avatar}`} data-ai-hint="avatar placeholder" />
                        <AvatarFallback>{contact.avatar}</AvatarFallback>
                      </Avatar>
                      {contact.name}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground hidden md:table-cell">
                      {contact.address}
                    </TableCell>
                    <TableCell className="text-right">
                        <Link href={contact.href} className="text-primary hover:underline">View</Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {filteredResults.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Services ({filteredResults.services.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead>Status</TableHead>
                         <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredResults.services.map((service, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell className="text-muted-foreground text-sm hidden md:table-cell">{service.description}</TableCell>
                            <TableCell>
                                <Badge variant={service.status === 'Active' ? 'success' : 'secondary'}>{service.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={service.href} className="text-primary hover:underline">View</Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {filteredResults.transactions.length > 0 && (
         <Card>
            <CardHeader>
              <CardTitle>Transactions ({filteredResults.transactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.transactions.map((tx, i) => (
                    <TableRow key={i}>
                      <TableCell className="flex items-center gap-2">
                        {tx.icon} {tx.type}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.recipient}</div>
                        <div className="text-sm text-muted-foreground">{tx.service}</div>
                      </TableCell>
                      <TableCell className="text-right font-mono">{tx.amount}</TableCell>
                      <TableCell className="text-right">
                         <Link href={tx.href} className="text-primary hover:underline">View</Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
