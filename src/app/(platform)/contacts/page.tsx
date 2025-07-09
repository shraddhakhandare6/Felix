'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { AddContactDialog } from '@/components/dialogs/add-contact-dialog';
import { ScanQrDialog } from '@/components/dialogs/scan-qr-dialog';
import { useContacts } from '@/context/contacts-context';

export default function ContactsPage() {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [initialAddress, setInitialAddress] = useState('');
  const { contacts } = useContacts();

  const handleScanSuccess = (decodedText: string) => {
    setInitialAddress(decodedText);
    setIsAddContactOpen(true);
  };
  
  const handleAddContactClick = () => {
    setInitialAddress('');
    setIsAddContactOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <ScanQrDialog onScanSuccess={handleScanSuccess} />
            
            <AddContactDialog 
                open={isAddContactOpen} 
                onOpenChange={setIsAddContactOpen}
                initialAddress={initialAddress}
            >
                <Button className="justify-center w-full sm:w-auto" onClick={handleAddContactClick}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
                </Button>
            </AddContactDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Address Book</CardTitle>
            <CardDescription>Manage your saved contacts for quick and easy transactions.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40/3F51B5/FFFFFF/png?text=${contact.avatar}`} data-ai-hint="avatar placeholder" />
                                    <AvatarFallback>{contact.avatar}</AvatarFallback>
                                </Avatar>
                                {contact.name}
                            </TableCell>
                            <TableCell className="font-mono text-sm text-muted-foreground hidden md:table-cell">{contact.address}</TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="outline" className="mr-2">Send</Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>View Transactions</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">Delete</DropdownMenuItem>
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
