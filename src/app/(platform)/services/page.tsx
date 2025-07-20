
'use client';

import { useState, useEffect } from 'react';
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
import { MoreHorizontal, Settings, Plus, Activity } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CreateServiceDialog } from "@/components/dialogs/create-service-dialog";
import { useServices, type Service } from "@/context/service-context";
import { useToast } from '@/hooks/use-toast';

export default function ServicesPage() {
  const router = useRouter();
  const { services, archiveService } = useServices();
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [serviceToAction, setServiceToAction] = useState<Service | null>(null);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
                <Settings className="w-8 h-8 text-white" />
              </div>
          <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Services
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Browse and manage the full list of services provided by your organization.
              </p>
          </div>
            </div>
            <div className="flex items-center gap-3">
          <CreateServiceDialog />
            </div>
        </div>

          {/* Main Services Card */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">Service Catalog</CardTitle>
                  <CardDescription className="text-base">
                  This module enables you to define service offerings, configure pricing, and streamline service visibility. Advanced service and pricing management features will be introduced here.
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
                      <TableHead className="w-[40%] hidden lg:table-cell font-semibold text-gray-900 dark:text-gray-100">Description</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold text-gray-900 dark:text-gray-100">Price Model</TableHead>
                      <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {services.map((service, index) => (
                      <TableRow 
                        key={index}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">{service.name}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400 text-sm hidden lg:table-cell">{service.description}</TableCell>
                              <TableCell className="hidden md:table-cell">
                          <Badge 
                            variant="outline" 
                            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300"
                          >
                            {service.priceModel}
                          </Badge>
                              </TableCell>
                              <TableCell>
                          <Badge 
                            variant={
                                    service.status === 'Active' ? 'success' 
                                    : service.status === 'Archived' ? 'destructive'
                                    : 'secondary'
                            }
                            className="font-medium"
                          >
                            {service.status}
                          </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                              >
                                              <span className="sr-only">Open menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="end"
                              className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
                            >
                              <DropdownMenuItem 
                                onClick={() => handleEdit(service.name)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                              >
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleViewOffers(service.name)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                              >
                                View Offers
                              </DropdownMenuItem>
                                          {service.status !== 'Archived' && (
                                            <DropdownMenuItem 
                                  className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400 transition-all duration-200"
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
              </div>
              
              {services.length === 0 && (
                <div className="text-center py-12">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                    <Settings className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Services Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first service to get started with your service catalog.</p>
                  <CreateServiceDialog />
                </div>
              )}
          </CardContent>
        </Card>
        </div>
      </div>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Are you sure you want to archive this service?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Archiving the service "{serviceToAction?.name}" will remove it from active lists but will not delete it permanently. You can change its status later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setServiceToAction(null)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmArchive} 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
