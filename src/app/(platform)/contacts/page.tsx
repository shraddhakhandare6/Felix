'use client';

import React, { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { AddContactDialog } from '@/components/dialogs/add-contact-dialog';
import { ScanQrDialog } from '@/components/dialogs/scan-qr-dialog';
import { useContacts, type Contact } from '@/context/contacts-context';
import { useToast } from '@/hooks/use-toast';

export default function ContactsPage() {
  const router = useRouter();
  const { contacts, deleteContact } = useContacts();
  const { toast } = useToast();
  
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const [initialAddress, setInitialAddress] = useState('');

  const handleScanSuccess = (decodedText: string) => {
    setInitialAddress(decodedText);
    setContactToEdit(null);
    setIsAddContactOpen(true);
  };
  
  const handleAddContactClick = () => {
    setInitialAddress('');
    setContactToEdit(null);
    setIsAddContactOpen(true);
  }

  const handleEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsAddContactOpen(true);
  };
  
  const handleDeleteRequest = (contact: Contact) => {
    setContactToDelete(contact);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (contactToDelete) {
      deleteContact(contactToDelete.id);
      toast({
        title: "Contact Deleted",
        description: `${contactToDelete.name} has been removed from your contacts.`,
      });
      setIsDeleteDialogOpen(false);
      setContactToDelete(null);
    }
  };

  const handleSend = (address: string) => {
    router.push(`/dashboard?recipient=${encodeURIComponent(address)}`);
  };

  const handleViewTransactions = (name: string) => {
    router.push(`/wallet?name=${encodeURIComponent(name)}`);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Contacts</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <ScanQrDialog onScanSuccess={handleScanSuccess} />
              
              <Button className="justify-center w-full sm:w-auto" onClick={handleAddContactClick}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Contact
              </Button>
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
                                  <Button size="sm" variant="outline" className="mr-2" onClick={() => handleSend(contact.address)}>Send</Button>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" className="h-8 w-8 p-0">
                                              <span className="sr-only">Open menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleEditContact(contact)}>Edit</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleViewTransactions(contact.name)}>View Transactions</DropdownMenuItem>
                                          <DropdownMenuItem 
                                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                            onClick={() => handleDeleteRequest(contact)}
                                          >
                                            Delete
                                          </DropdownMenuItem>
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

      <AddContactDialog 
        open={isAddContactOpen} 
        onOpenChange={setIsAddContactOpen}
        initialAddress={initialAddress}
        contactToEdit={contactToEdit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact "{contactToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
