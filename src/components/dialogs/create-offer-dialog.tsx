
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

export function CreateOfferDialog() {
  const [open, setOpen] = useState(false);
  const { services } = useServices();
  const { addOffer } = useOffers();
  const { toast } = useToast();

  const [type, setType] = useState<'Sell' | 'Buy'>('Sell');
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!service || !price) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please select a service and enter a price.',
      })
      return;
    }

    const newOffer: Omit<Offer, 'id' | 'status'> = {
      type,
      service,
      price: `${price} BD`,
    };

    addOffer(newOffer);
    
    toast({
      title: 'Offer Created',
      description: `Your ${type.toLowerCase()} offer for ${service} has been created.`,
    })

    // Reset form
    setService('');
    setPrice('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
                defaultValue="Sell" 
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
              <Select onValueChange={setService} value={service}>
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
                Price (BD)
              </Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="50.00" 
                className="col-span-3" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create Offer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
