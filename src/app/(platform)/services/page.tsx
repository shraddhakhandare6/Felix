
'use client';

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

const sellOffers = [
  { service: "UX/UI Design Mockup", by: "CoE Desk", price: "250 BD", action: "Buy" },
  { service: "Backend API Endpoint", by: "Project Alpha", price: "400 BD", action: "Buy" },
  { service: "Technical Documentation", by: "Project Beta", price: "150 BD", action: "Buy" },
];

const buyOffers = [
    { service: "Code Review", by: "user_123", price: "100 BD", action: "Sell" },
    { service: "Database Optimization", by: "user_456", price: "300 BD", action: "Sell" },
];

const myOffers = [
    { type: "Sell", service: "1 Hour Consulting", price: "100 BD", status: "Active" },
    { type: "Buy", service: "Logo Design", price: "50 BD", status: "Active" },
]

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Services</h1>
        <CreateOfferDialog />
      </div>

      <Tabs defaultValue="sell-offers">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="sell-offers">Services for Sale</TabsTrigger>
          <TabsTrigger value="buy-offers">Services Wanted</TabsTrigger>
          <TabsTrigger value="my-offers">My Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="sell-offers">
          <Card>
            <CardHeader>
              <CardTitle>Services for Sale</CardTitle>
              <CardDescription>
                Browse and buy services offered by other entities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead className="hidden md:table-cell">Offered By</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellOffers.map((offer, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{offer.service}</TableCell>
                      <TableCell className="hidden md:table-cell">{offer.by}</TableCell>
                      <TableCell>{offer.price}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">{offer.action}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buy-offers">
             <Card>
                <CardHeader>
                    <CardTitle>Services Wanted (Buy Offers)</CardTitle>
                    <CardDescription>Fulfill these requests for services.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Service Needed</TableHead>
                            <TableHead className="hidden md:table-cell">Requested By</TableHead>
                            <TableHead>Offering Price</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {buyOffers.map((offer, index) => (
                            <TableRow key={index}>
                            <TableCell className="font-medium">{offer.service}</TableCell>
                            <TableCell className="hidden md:table-cell">{offer.by}</TableCell>
                            <TableCell>{offer.price}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm">{offer.action}</Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="my-offers">
             <Card>
                <CardHeader>
                    <CardTitle>My Offers</CardTitle>
                    <CardDescription>Manage your active buy and sell offers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Service / Asset</TableHead>
                            <TableHead className="hidden sm:table-cell">Price</TableHead>
                            <TableHead className="hidden sm:table-cell">Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {myOffers.map((offer, index) => (
                            <TableRow key={index}>
                            <TableCell>
                                <Badge variant={offer.type === 'Sell' ? 'secondary' : 'default'}>{offer.type}</Badge>
                            </TableCell>
                            <TableCell className="font-medium">{offer.service}</TableCell>
                            <TableCell className="hidden sm:table-cell">{offer.price}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                               <Badge variant="outline">{offer.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="destructive" size="sm">Cancel</Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
