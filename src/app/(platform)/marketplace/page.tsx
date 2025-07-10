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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateServiceDialog } from "@/components/dialogs/create-service-dialog";
import { useServices } from "@/context/service-context";

export default function MarketplacePage() {
  const { services } = useServices();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold">Marketplace</h1>
            <p className="text-muted-foreground mt-1">
                Browse and manage the full list of services provided by your organization.
            </p>
        </div>
        <CreateServiceDialog />
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Service Catalog</CardTitle>
            <CardDescription>
                This module enables you to define service offerings, configure pricing, and streamline service visibility. Advanced service and pricing management features will be introduced here.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Service Name</TableHead>
                        <TableHead className="w-[40%] hidden lg:table-cell">Description</TableHead>
                        <TableHead className="hidden md:table-cell">Price Model</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {services.map((service, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{service.name}</TableCell>
                            <TableCell className="text-muted-foreground text-sm hidden lg:table-cell">{service.description}</TableCell>
                            <TableCell className="hidden md:table-cell">
                               <Badge variant="outline">{service.priceModel}</Badge>
                            </TableCell>
                             <TableCell>
                                <Badge variant={service.status === 'Active' ? 'success' : 'secondary'}>{service.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>View Offers</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Archive</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  )
}
