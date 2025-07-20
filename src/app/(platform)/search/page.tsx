
'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';
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
import { ArrowUpRight, ArrowDownLeft, Search, Users, Settings, CreditCard, ExternalLink } from 'lucide-react';

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
    icon: <ArrowUpRight className="h-4 w-4 text-red-500" />,
    recipient: 'Project Gamma',
    service: 'API Development',
    amount: '-500 BD',
    status: 'Completed',
    href: "/wallet",
  },
  {
    type: 'Received',
    icon: <ArrowDownLeft className="h-4 w-4 text-green-500" />,
    recipient: 'CoE Desk',
    service: 'Consulting',
    amount: '+1,200 BD',
    status: 'Completed',
    href: "/wallet",
  },
  {
    type: 'Sent',
    icon: <ArrowUpRight className="h-4 w-4 text-red-500" />,
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100' 
        : 'opacity-0'
    }`}>
      {/* Floating Elements */}
      <div className="fixed -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce pointer-events-none"></div>
      <div className="fixed -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
      
      <div className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
              <Search className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                Search Results
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
        {totalResults > 0 
            ? `Found ${totalResults} result${totalResults > 1 ? 's' : ''} for "${query}"`
            : `No results found for "${query}"`
        }
      </p>
            </div>
          </div>

      {totalResults === 0 && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 text-center p-12">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Nothing Found</CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">Try a different search term.</CardDescription>
        </Card>
      )}

      {filteredResults.contacts.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contacts ({filteredResults.contacts.length})</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                      People and organizations matching your search.
                    </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <Table>
              <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Name</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-gray-900 dark:text-gray-100">Address</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.contacts.map((contact, index) => (
                        <TableRow 
                          key={index}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium flex items-center gap-3 text-gray-900 dark:text-gray-100">
                            <Avatar className="ring-2 ring-blue-100 dark:ring-blue-900">
                        <AvatarImage src={`https://placehold.co/40x40/3F51B5/FFFFFF/png?text=${contact.avatar}`} data-ai-hint="avatar placeholder" />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">{contact.avatar}</AvatarFallback>
                      </Avatar>
                      {contact.name}
                    </TableCell>
                          <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                      {contact.address}
                    </TableCell>
                    <TableCell className="text-right">
                            <Link 
                              href={contact.href} 
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
                </div>
          </CardContent>
        </Card>
      )}

      {filteredResults.services.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Services ({filteredResults.services.length})</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                      Available services matching your search.
                    </CardDescription>
                  </div>
                </div>
          </CardHeader>
          <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
            <Table>
                <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Service Name</TableHead>
                        <TableHead className="hidden md:table-cell font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredResults.services.map((service, index) => (
                        <TableRow 
                          key={index}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <TableCell className="font-medium text-gray-900 dark:text-gray-100">{service.name}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">{service.description}</TableCell>
                            <TableCell>
                            <Badge 
                              variant={service.status === 'Active' ? 'success' : 'secondary'}
                              className={service.status === 'Active' 
                                ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                              }
                            >
                              {service.status}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <Link 
                              href={service.href} 
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
                </div>
          </CardContent>
        </Card>
      )}
      
      {filteredResults.transactions.length > 0 && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions ({filteredResults.transactions.length})</CardTitle>
                    <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                      Transaction history matching your search.
                    </CardDescription>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
              <Table>
                <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
                        <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Details</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                        <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.transactions.map((tx, i) => (
                        <TableRow 
                          key={i}
                          className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <TableCell className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        {tx.icon} {tx.type}
                      </TableCell>
                      <TableCell>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{tx.recipient}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{tx.service}</div>
                      </TableCell>
                          <TableCell className="text-right font-mono font-semibold text-gray-900 dark:text-gray-100">{tx.amount}</TableCell>
                      <TableCell className="text-right">
                            <Link 
                              href={tx.href} 
                              className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200"
                            >
                              <span>View</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                </div>
            </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
}
