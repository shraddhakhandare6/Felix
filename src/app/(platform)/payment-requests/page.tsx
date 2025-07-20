
'use client';

import { useEffect, useState } from 'react';
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
import { CreateRequestDialog } from "@/components/dialogs/create-request-dialog";
import { usePaymentRequests } from "@/context/payment-requests-context";
import { BulkUploadDialog } from "@/components/dialogs/bulk-upload-dialog";
import { DownloadDataDialog } from "@/components/dialogs/download-data-dialog";
import { CreditCard, Download, Upload, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function PaymentRequestsPage() {
  const { incomingRequests, outgoingRequests, payRequest, declineRequest, cancelRequest } = usePaymentRequests();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Payment Requests
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Review incoming requests and track your outgoing requests.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <DownloadDataDialog 
              incomingData={incomingRequests}
              outgoingData={outgoingRequests}
              >
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-11 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Data
                </Button>
              </DownloadDataDialog>
              <BulkUploadDialog>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-11 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
              </BulkUploadDialog>
              <CreateRequestDialog>
                <Button 
                  className="w-full sm:w-auto h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Create Request</span>
                </Button>
              </CreateRequestDialog>
        </div>
      </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Requests</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                    Review incoming requests and track your outgoing requests.
                  </CardDescription>
                </div>
              </div>
        </CardHeader>
        <CardContent>
              <Tabs defaultValue="incoming" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                  <TabsTrigger 
                    value="incoming"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
                  >
                    Incoming
                  </TabsTrigger>
                  <TabsTrigger 
                    value="outgoing"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200"
                  >
                    Outgoing
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="incoming" className="mt-6">
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">From</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">For</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {incomingRequests.length > 0 ? (
                          incomingRequests.map((req, index) => (
                            <TableRow 
                              key={req.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{req.from}</TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100">{req.for}</TableCell>
                              <TableCell className="font-semibold text-green-600 dark:text-green-400">{req.amount}</TableCell>
                              <TableCell className="hidden sm:table-cell text-gray-600 dark:text-gray-400">{req.date}</TableCell>
                                    <TableCell>
                                <Badge 
                                  variant={req.status === "Pending" ? "warning" : "success"}
                                  className={req.status === "Pending" 
                                    ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                    : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                                  }
                                >
                                  {req.status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                                  {req.status === "Paid" && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {req.status}
                                </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "Pending" && (
                                            <div className="flex flex-col md:flex-row gap-2 justify-end">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full md:w-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200" 
                                      onClick={() => declineRequest(req.id)}
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Decline
                                    </Button>
                                    <Button 
                                      variant="default" 
                                      size="sm" 
                                      className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                                      onClick={() => payRequest(req.id)}
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Pay
                                    </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                                <CreditCard className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Incoming Requests</h3>
                              <p className="text-gray-600 dark:text-gray-400">You don't have any incoming payment requests at the moment.</p>
                            </TableCell>
                          </TableRow>
                        )}
                        </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="outgoing" className="mt-6">
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">To</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">For</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Amount</TableHead>
                          <TableHead className="hidden sm:table-cell font-semibold text-gray-900 dark:text-gray-100">Date</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {outgoingRequests.length > 0 ? (
                          outgoingRequests.map((req, index) => (
                            <TableRow 
                              key={req.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="font-medium text-gray-900 dark:text-gray-100">{req.to}</TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100">{req.for}</TableCell>
                              <TableCell className="font-semibold text-red-600 dark:text-red-400">{req.amount}</TableCell>
                              <TableCell className="hidden sm:table-cell text-gray-600 dark:text-gray-400">{req.date}</TableCell>
                                    <TableCell>
                                <Badge 
                                  variant={req.status === "Pending" ? "warning" : "success"}
                                  className={req.status === "Pending" 
                                    ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
                                    : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                                  }
                                >
                                  {req.status === "Pending" && <Clock className="w-3 h-3 mr-1" />}
                                  {req.status === "Paid" && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {req.status}
                                </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "Pending" && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => cancelRequest(req.id)}
                                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                  >
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Cancel
                                  </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12">
                              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                                <CreditCard className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Outgoing Requests</h3>
                              <p className="text-gray-600 dark:text-gray-400">You don't have any outgoing payment requests at the moment.</p>
                            </TableCell>
                          </TableRow>
                        )}
                        </TableBody>
                    </Table>
                  </div>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}
