
'use client';

import { useState, type ReactNode } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { usePaymentRequests } from '@/context/payment-requests-context';

export function CreateRequestDialog({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { addRequest } = usePaymentRequests();

  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!to || !amount || !reason) return;

    addRequest({
      to,
      amount: `${amount} BD`,
      for: reason,
    });
    
    // Reset form and close dialog
    setTo('');
    setAmount('');
    setReason('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button className="justify-center w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" /> Create Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Payment Request</DialogTitle>
            <DialogDescription>
              Request a payment from another user or project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to" className="text-right">
                To
              </Label>
              <Input 
                id="to" 
                placeholder="Stellar address or user*domain.com" 
                className="col-span-3"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (BD)
              </Label>
              <Input 
                id="amount" 
                type="number" 
                placeholder="100.00" 
                className="col-span-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="for" className="text-right pt-2">
                For
              </Label>
              <Textarea 
                id="for" 
                placeholder="e.g., API Usage, Loan Repayment" 
                className="col-span-3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
