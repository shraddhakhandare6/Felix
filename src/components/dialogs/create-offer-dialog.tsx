
'use client';

import { useState } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServices } from '@/context/service-context';
import { useOffers, type Offer } from '@/context/offers-context';
import { useToast } from '@/hooks/use-toast';
import { useEntities } from '@/context/entity-context';
import Link from 'next/link';

export function CreateOfferDialog() {
  const [open, setOpen] = useState(false);
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [successResponse, setSuccessResponse] = useState<any>(null);
  
  const { services } = useServices();
  const { entities } = useEntities();
  const { addOffer } = useOffers();
  const { toast } = useToast();

  const [type, setType] = useState<'sell' | 'buy'>('sell');
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [entityName, setEntityName] = useState('kvb');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!serviceName || !price || !amount || !entityName || !email) {
        toast({
            variant: 'destructive',
            title: 'Missing fields',
            description: 'Please fill out all fields for the offer.',
        });
        return;
    }

    const isBuyOffer = type === 'buy';
    const apiUrl = isBuyOffer
      ? 'http://localhost:5000/api/v1/offers/buy'
      : 'http://localhost:5000/api/v1/offers/sell';

    const basePayload = {
        creatorEmail: email,
        entityName: entityName,
        assetCode: "BD",
        amount: amount,
        price: price,
        serviceName: serviceName, 
    };
    
    const offerPayload = isBuyOffer 
      ? { ...basePayload, otype: 'buy' }
      : basePayload;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(offerPayload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Failed to create ${type} offer.`);
        }
        
        setSuccessResponse(result);
        setIsSuccessAlertOpen(true);
        
        // Add to local state for UI update
        addOffer({
          type: type === 'sell' ? 'Sell' : 'Buy',
          service: serviceName,
          price: `${price} BD`,
        });

    } catch (error) {
        console.error(`Error creating ${type} offer:`, error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        });
    }

    // Reset form and close dialog
    setServiceName('');
    setPrice('');
    setAmount('');
    setEntityName('kvb');
    setEmail('');
    setOpen(false);
  };
  
  const renderSuccessResponse = () => {
    if (!successResponse || typeof successResponse !== 'object') {
        return <p>Offer processed successfully.</p>;
    }

    return (
        <div className="space-y-2 text-sm">
        {Object.entries(successResponse).map(([key, value]) => {
            const stringValue = String(value);
            const isLink = stringValue.startsWith('http');

            return (
            <div key={key} className="grid grid-cols-3 gap-2">
                <span className="font-semibold capitalize col-span-1">{key.replace(/_/g, ' ')}:</span>
                <span className="col-span-2 break-all">
                {isLink ? (
                    <Link href={stringValue} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {stringValue}
                    </Link>
                ) : (
                    stringValue
                )}
                </span>
            </div>
            );
        })}
        </div>
    );
  };


  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create a New Offer</DialogTitle>
            <DialogDescription>
              Choose whether you want to buy or sell a service, and fill in the details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Type</Label>
              <RadioGroup 
                value={type}
                className="col-span-3 flex gap-4"
                onValueChange={(value: 'sell' | 'buy') => setType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="r1" />
                  <Label htmlFor="r1">I want to sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buy" id="r2" />
                  <Label htmlFor="r2">I want to buy</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right">
                Service
              </Label>
              <Select onValueChange={setServiceName} value={serviceName}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.filter(s => s.status === 'Active').map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="0.10" 
                className="col-span-3" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                Amount
                </Label>
                <Input 
                id="amount" 
                type="number" 
                placeholder="10" 
                className="col-span-3" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset" className="text-right">
                Asset
                </Label>
                <Input 
                id="asset" 
                readOnly
                value="BD"
                className="col-span-3 bg-muted" 
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                Email
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="creator@example.com"
                  className="col-span-3" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entity" className="text-right">
                Entity Name
                </Label>
                <Select onValueChange={setEntityName} value={entityName}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
                <SelectContent>
                    {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.name}>
                        {entity.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

          </div>
          <DialogFooter>
            <Button type="submit">Create Offer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <AlertDialog open={isSuccessAlertOpen} onOpenChange={setIsSuccessAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Offer Submitted Successfully</AlertDialogTitle>
            <AlertDialogDescription>
                Your offer has been processed. Here are the details from the response:
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
                {renderSuccessResponse()}
            </div>
            <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsSuccessAlertOpen(false)}>Close</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

