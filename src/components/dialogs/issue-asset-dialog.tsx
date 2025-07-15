'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAssets } from '@/context/asset-context';
import { useTransactions } from '@/context/transactions-context';

const formSchema = z.object({
  recipient: z.string(),
  assetCode: z.string({ required_error: "Please select an asset." }),
  amount: z.string().min(1, { message: "Amount is required." }),
});

interface Recipient {
  name: string;
  email: string;
}

interface IssueAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipient: Recipient;
}

export function IssueAssetDialog({ open, onOpenChange, recipient }: IssueAssetDialogProps) {
  const { toast } = useToast();
  const { assets } = useAssets();
  const { addTransaction } = useTransactions();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: recipient.email,
      assetCode: '',
      amount: '',
    },
  });

  useEffect(() => {
    if (recipient) {
      form.reset({
        recipient: recipient.email,
        assetCode: '',
        amount: '',
      });
    }
  }, [recipient, form, open]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    addTransaction({
        type: 'Issued',
        recipient: values.recipient,
        service: `Asset Issuance: ${values.amount} ${values.assetCode}`,
        amount: `+${values.amount} ${values.assetCode}`
    });

    toast({
      title: 'Asset Issued',
      description: `Successfully issued ${values.amount} ${values.assetCode} to ${values.recipient}.`,
      variant: 'success'
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Issue Asset to {recipient.name}</DialogTitle>
                <DialogDescription>
                    Issue a new asset directly to the recipient's account.
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                        <Input placeholder="User's public key or email" {...field} readOnly className="bg-muted"/>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                    control={form.control}
                    name="assetCode"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Asset Code</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an asset" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {assets.map((asset) => (
                                <SelectItem key={asset.id} value={asset.asset_code}>{asset.asset_code}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full">Send</Button>
            </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
