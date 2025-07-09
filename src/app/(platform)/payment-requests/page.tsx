
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
import { CreateRequestDialog } from "@/components/dialogs/create-request-dialog";
import { usePaymentRequests } from "@/context/payment-requests-context";
import { BulkUploadDialog } from "@/components/dialogs/bulk-upload-dialog";

export default function PaymentRequestsPage() {
  const { incomingRequests, outgoingRequests, payRequest, declineRequest } = usePaymentRequests();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Payment Requests</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <BulkUploadDialog />
            <CreateRequestDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Manage Requests</CardTitle>
            <CardDescription>Review incoming requests and track your outgoing requests.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="incoming">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="incoming">Incoming</TabsTrigger>
                    <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                </TabsList>
                <TabsContent value="incoming" className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead>For</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {incomingRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.from}</TableCell>
                                    <TableCell>{req.for}</TableCell>
                                    <TableCell>{req.amount}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{req.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === "Pending" ? "warning" : "success"}>{req.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "Pending" && (
                                            <div className="flex flex-col md:flex-row gap-2 justify-end">
                                                <Button variant="outline" size="sm" className="w-full md:w-auto" onClick={() => declineRequest(req.id)}>Decline</Button>
                                                <Button variant="default" size="sm" className="w-full md:w-auto" onClick={() => payRequest(req.id)}>Pay</Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
                <TabsContent value="outgoing" className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>To</TableHead>
                                <TableHead>For</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="hidden sm:table-cell">Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {outgoingRequests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell className="font-medium">{req.to}</TableCell>
                                    <TableCell>{req.for}</TableCell>
                                    <TableCell>{req.amount}</TableCell>
                                    <TableCell className="hidden sm:table-cell">{req.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === "Pending" ? "warning" : "success"}>{req.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === "Pending" && (
                                            <Button variant="destructive" size="sm">Cancel</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
