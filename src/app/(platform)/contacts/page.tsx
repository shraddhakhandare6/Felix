'use client';

import React, { useState, useEffect } from 'react';
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
import { MoreHorizontal, PlusCircle, Users, Send, Edit, Trash2, QrCode } from "lucide-react"
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
  const [isVisible, setIsVisible] = useState(false);
  
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

  const [initialAddress, setInitialAddress] = useState('');

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Contacts
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage your saved contacts for quick and easy transactions.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <ScanQrDialog onScanSuccess={handleScanSuccess}>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto h-11 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan QR
                </Button>
              </ScanQrDialog>
              
              <Button 
                className="w-full sm:w-auto h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group" 
                onClick={handleAddContactClick}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Add Contact</span>
              </Button>
          </div>
        </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Address Book</CardTitle>
                  <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                    Manage your saved contacts for quick and easy transactions.
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
                      <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.length > 0 ? (
                      contacts.map((contact, index) => (
                        <TableRow 
                          key={contact.id}
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
                          <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{contact.address}</TableCell>
                              <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleSend(contact.address)}
                                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                              >
                                <Send className="w-3 h-3 mr-1" />
                                Send
                              </Button>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                                    onClick={() => handleEditContact(contact)}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleViewTransactions(contact.name)}
                                    className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                  >
                                    <Users className="w-4 h-4 mr-2" />
                                    View Transactions
                                  </DropdownMenuItem>
                                          <DropdownMenuItem 
                                    className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-600 dark:focus:text-red-400 transition-all duration-200"
                                            onClick={() => handleDeleteRequest(contact)}
                                          >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-12">
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 inline-block mb-4">
                            <Users className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Contacts Found</h3>
                          <p className="text-gray-600 dark:text-gray-400">Start by adding your first contact to make transactions easier.</p>
                              </TableCell>
                          </TableRow>
                    )}
                  </TableBody>
              </Table>
              </div>
          </CardContent>
        </Card>
        </div>
      </div>

      <AddContactDialog 
        open={isAddContactOpen} 
        onOpenChange={setIsAddContactOpen}
        initialAddress={initialAddress}
        contactToEdit={contactToEdit}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Are you sure you want to delete this contact?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This will permanently delete the contact "{contactToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
