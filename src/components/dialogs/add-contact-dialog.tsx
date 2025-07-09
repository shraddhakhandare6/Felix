'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContacts } from '@/context/contacts-context';
import { useToast } from '@/hooks/use-toast';

export function AddContactDialog({ 
    open, 
    onOpenChange, 
    initialAddress = '',
    children
}: { 
    open: boolean, 
    onOpenChange: (open: boolean) => void, 
    initialAddress?: string,
    children?: ReactNode
}) {
  const { addContact } = useContacts();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    if (open) {
      setAddress(initialAddress);
      setName('');
    }
  }, [open, initialAddress]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !address.trim()) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please enter a name and address.',
        });
        return;
    }
    
    addContact({ name, address });
    toast({
        title: 'Contact Added',
        description: `Successfully added ${name} to your contacts.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Enter the details for your new contact below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input 
                id="name" 
                placeholder="Project or person's name" 
                className="col-span-3" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input 
                id="address" 
                placeholder="Stellar address or user*domain.com" 
                className="col-span-3" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Contact</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
