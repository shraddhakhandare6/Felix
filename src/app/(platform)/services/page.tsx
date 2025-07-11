
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateServiceDialog } from "@/components/dialogs/create-service-dialog";
import { useServices, type Service } from "@/context/service-context";
import { useToast } from '@/hooks/use-toast';

export default function ServicesPage() {
  const router = useRouter();
  const { services, archiveService } = useServices();
  const { toast } = useToast();

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [serviceToAction, setServiceToAction] = useState<Service | null>(null);

  const handleEdit = (serviceName: string) => {
    router.push(`/services/${encodeURIComponent(serviceName)}`);
  };

  const handleViewOffers = (serviceName: string) => {
    router.push(`/marketplace?service=${encodeURIComponent(serviceName)}`);
  };

  const handleArchiveRequest = (service: Service) => {
    setServiceToAction(service);
    setIsArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (serviceToAction) {
      archiveService(serviceToAction.name);
      toast({
        title: "Service Archived",
        description: `The service "${serviceToAction.name}" has been archived.`,
      });
      setIsArchiveDialogOpen(false);
      setServiceToAction(null);
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
              <h1 className="text-3xl font-bold">Services</h1>
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
                                  <Badge variant={
                                    service.status === 'Active' ? 'success' 
                                    : service.status === 'Archived' ? 'destructive'
                                    : 'secondary'
                                  }>{service.status}</Badge>
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
                                          <DropdownMenuItem onClick={() => handleEdit(service.name)}>Edit</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleViewOffers(service.name)}>View Offers</DropdownMenuItem>
                                          {service.status !== 'Archived' && (
                                            <DropdownMenuItem 
                                              className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                              onClick={() => handleArchiveRequest(service)}
                                            >
                                              Archive
                                            </DropdownMenuItem>
                                          )}
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

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this service?</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving the service "{serviceToAction?.name}" will remove it from active lists but will not delete it permanently. You can change its status later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
