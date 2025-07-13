
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServices } from '@/context/service-context';
import { useOffers, type Offer } from '@/context/offers-context';
import { useToast } from '@/hooks/use-toast';
import { useEntities } from '@/context/entity-context';
import { useUser } from '@/context/user-context';

export function CreateOfferDialog() {
  const [open, setOpen] = useState(false);
  const { services } = useServices();
  const { entities } = useEntities();
  const { user } = useUser();
  const { addOffer } = useOffers();
  const { toast } = useToast();

  const [type, setType] = useState<'Sell' | 'Buy'>('Sell');
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [entityName, setEntityName] = useState('kvb');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (type === 'Buy') {
        if (!serviceName || !price) {
            toast({
                variant: 'destructive',
                title: 'Missing fields',
                description: 'Please select a service and enter a price.',
            })
            return;
        }

        const newOffer: Omit<Offer, 'id' | 'status'> = {
            type,
            service: serviceName,
            price: `${price} BD`,
        };

        addOffer(newOffer);
        
        toast({
            title: 'Offer Created',
            description: `Your ${type.toLowerCase()} offer for ${serviceName} has been created.`,
        })

    } else { // 'Sell' offer logic
        if (!serviceName || !price || !amount || !entityName) {
            toast({
                variant: 'destructive',
                title: 'Missing fields',
                description: 'Please fill out all fields for the sell offer.',
            });
            return;
        }

        const sellOfferPayload = {
            creatorEmail: user.email,
            entityName: entityName,
            otype: "sell",
            assetCode: "BD",
            amount: amount,
            price: price,
            // The API seems to expect a service name, but it's not in the body example.
            // I'll add it here assuming it might be needed. If not, it can be removed.
            serviceName: serviceName, 
        };

        try {
            const response = await fetch('http://localhost:5000/api/v1/offers/sell', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sellOfferPayload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create sell offer.');
            }
            
            toast({
                title: 'Sell Offer Created',
                description: 'Your sell offer has been successfully submitted.',
            });

            addOffer({
              type: 'Sell',
              service: serviceName,
              price: `${price} BD`,
            });

        } catch (error) {
            console.error('Error creating sell offer:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'An unexpected error occurred.',
            });
        }
    }


    // Reset form and close dialog
    setServiceName('');
    setPrice('');
    setAmount('');
    setEntityName('kvb');
    setOpen(false);
  };

  return (
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
                onValueChange={(value: 'Sell' | 'Buy') => setType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sell" id="r1" />
                  <Label htmlFor="r1">I want to sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Buy" id="r2" />
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

            {type === 'Sell' && (
              <>
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
                    readOnly
                    value={user.email}
                    className="col-span-3 bg-muted" 
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
              </>
            )}

          </div>
          <DialogFooter>
            <Button type="submit">Create Offer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
