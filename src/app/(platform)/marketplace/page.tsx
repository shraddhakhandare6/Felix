
'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CreateOfferDialog } from "@/components/dialogs/create-offer-dialog";
import { useOffers } from "@/context/offers-context";
import { ConfirmOfferDialog } from '@/components/dialogs/confirm-offer-dialog';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, TrendingUp, Package } from 'lucide-react';

interface OfferDetails {
  service: string;
  by: string;
  price: string;
  action: 'Buy' | 'Sell';
}

const initialSellOffers = [
  { service: "UX/UI Design Mockup", by: "CoE Desk", price: "250 BD", action: "Buy" as const },
  { service: "Backend API Endpoint", by: "Project Alpha", price: "400 BD", action: "Buy" as const },
  { service: "Technical Documentation", by: "Project Beta", price: "150 BD", action: "Buy" as const },
];

const initialBuyOffers = [
    { service: "Code Review", by: "user_123", price: "100 BD", action: "Sell" as const },
    { service: "Database Optimization", by: "user_456", price: "300 BD", action: "Sell" as const },
];

export default function MarketplacePage() {
  const { myOffers, cancelOffer } = useOffers();
  const [sellOffers, setSellOffers] = useState(initialSellOffers);
  const [buyOffers, setBuyOffers] = useState(initialBuyOffers);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferDetails | null>(null);
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleOfferClick = (offer: OfferDetails) => {
    setSelectedOffer(offer);
    setIsConfirmOpen(true);
  };
  
  const handleConfirm = async () => {
    if (selectedOffer) {
      if (selectedOffer.action === 'Buy') {
        // Call the sell offer API to buy the offer
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/offers/sell`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              creatorEmail: 'shraddha@cateina.com',
              entityName: 'kvb',
              otype: 'sell',
              assetCode: 'BD',
              amount: '10',
              price: '0.1',
            }),
          });
        } catch (error) {
          toast({
            title: 'Buy Failed',
            description: 'There was an error processing your buy request.',
            variant: 'destructive',
          });
          setIsConfirmOpen(false);
          setSelectedOffer(null);
          return;
        }
      }
      toast({
        title: `${selectedOffer.action} Successful`,
        description: `You have successfully agreed to ${selectedOffer.action.toLowerCase()} "${selectedOffer.service}" for ${selectedOffer.price}.`,
        variant: 'success',
      });
      if (selectedOffer.action === 'Buy') {
        setSellOffers(prevOffers => prevOffers.filter(offer => offer.service !== selectedOffer.service));
      } else if (selectedOffer.action === 'Sell') {
        setBuyOffers(prevOffers => prevOffers.filter(offer => offer.service !== selectedOffer.service));
      }
    }
    setIsConfirmOpen(false);
    setSelectedOffer(null);
  }

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Marketplace
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Buy and sell services with other entities in the network.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreateOfferDialog />
            </div>
          </div>

          {/* Main Marketplace Content */}
          <Tabs defaultValue="sell-offers" className="space-y-6">
            <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <TabsTrigger 
                value="sell-offers" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                Services for Sale
              </TabsTrigger>
              <TabsTrigger 
                value="buy-offers" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                Services Wanted
              </TabsTrigger>
              <TabsTrigger 
                value="my-offers" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                My Offers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sell-offers">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Services for Sale</CardTitle>
                      <CardDescription className="text-base">
                        Browse and buy services offered by other entities.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Service</TableHead>
                          <TableHead className="hidden md:table-cell font-semibold text-gray-900 dark:text-gray-100">Offered By</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Price</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sellOffers.length > 0 ? (
                          sellOffers.map((offer, index) => (
                            <TableRow 
                              key={index}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{offer.service}</TableCell>
                              <TableCell className="hidden md:table-cell text-gray-600 dark:text-gray-400">{offer.by}</TableCell>
                              <TableCell className="font-semibold text-green-600 dark:text-green-400">{offer.price}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOfferClick(offer)}
                                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                                >
                                  {offer.action}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-12">
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                                <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Services for Sale</h3>
                              <p className="text-gray-600 dark:text-gray-400">No services are currently available for purchase.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buy-offers">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">Services Wanted (Buy Offers)</CardTitle>
                      <CardDescription className="text-base">Fulfill these requests for services.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Service Needed</TableHead>
                          <TableHead className="hidden md:table-cell font-semibold text-gray-900 dark:text-gray-100">Requested By</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Offering Price</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buyOffers.length > 0 ? (
                          buyOffers.map((offer, index) => (
                            <TableRow 
                              key={index}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{offer.service}</TableCell>
                              <TableCell className="hidden md:table-cell text-gray-600 dark:text-gray-400">{offer.by}</TableCell>
                              <TableCell className="font-semibold text-green-600 dark:text-green-400">{offer.price}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOfferClick(offer)}
                                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                                >
                                  {offer.action}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-12">
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                                <Package className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Services Wanted</h3>
                              <p className="text-gray-600 dark:text-gray-400">No services are currently being requested.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-offers">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <ShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold">My Offers</CardTitle>
                      <CardDescription className="text-base">Manage your active buy and sell offers.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Type</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Service / Asset</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold text-gray-900 dark:text-gray-100">Price</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myOffers.length > 0 ? (
                          myOffers.map((offer, index) => (
                            <TableRow 
                              key={offer.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell>
                                <Badge 
                                  variant={offer.type === 'Sell' ? 'secondary' : 'default'}
                                  className="font-medium"
                                >
                                  {offer.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{offer.service}</TableCell>
                              <TableCell className="hidden sm:table-cell font-semibold text-green-600 dark:text-green-400">{offer.price}</TableCell>
                              <TableCell className="hidden sm:table-cell">
                                <Badge 
                                  variant="outline"
                                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
                                >
                                  {offer.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => cancelOffer(offer.id)}
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                  Cancel
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-12">
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                                <ShoppingCart className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Active Offers</h3>
                              <p className="text-gray-600 dark:text-gray-400">You don't have any active offers at the moment.</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <ConfirmOfferDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        offer={selectedOffer}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
