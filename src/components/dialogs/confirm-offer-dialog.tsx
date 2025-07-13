
'use client';

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

interface OfferDetails {
  service: string;
  price: string;
  action: 'Buy' | 'Sell';
}

interface ConfirmOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: OfferDetails | null;
  onConfirm: () => void;
}

export function ConfirmOfferDialog({ open, onOpenChange, offer, onConfirm }: ConfirmOfferDialogProps) {
  if (!offer) {
    return null;
  }

  const isBuyAction = offer.action === 'Buy';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Your Action</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to <strong>{offer.action}</strong> the service "{offer.service}" for <strong>{offer.price}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className={isBuyAction ? '' : 'bg-accent text-accent-foreground hover:bg-accent/90'}
          >
            Confirm {offer.action}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
