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
import { PlusCircle, Save } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServices } from '@/context/service-context';
import { useOffers, type Offer } from '@/context/offers-context';
import { useToast } from '@/hooks/use-toast';
import { useEntities } from '@/context/entity-context';
import { useKeycloak } from '@react-keycloak/web';

export function CreateOfferDialog() {
  const [open, setOpen] = useState(false);
  const { keycloak } = useKeycloak();
  
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
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/offers/buy`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/offers/sell`;

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
                ...(keycloak?.token ? { 'Authorization': `Bearer ${keycloak.token}` } : {})
            },
            body: JSON.stringify(offerPayload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Failed to create ${type} offer.`);
        }
        
        toast({
            variant: 'success',
            title: 'Offer Submitted Successfully',
            description: `Your ${type} offer has been processed.`,
        });
        
        // Add to local state for UI update
        addOffer({
          type: type === 'sell' ? 'Sell' : 'Buy',
          service: serviceName,
          price: `${price} BD`,
          entityName: entityName,
          date: new Date().toISOString(),
          creatorEmail: email,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Create Offer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Create a New Offer</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Choose whether you want to buy or sell a service, and fill in the details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">Type</Label>
              <RadioGroup 
                value={type}
                className="col-span-3 flex gap-4"
                onValueChange={(value: 'sell' | 'buy') => setType(value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="r1" className="text-blue-600" />
                  <Label htmlFor="r1" className="text-sm font-medium text-gray-700 dark:text-gray-300">I want to sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buy" id="r2" className="text-blue-600" />
                  <Label htmlFor="r2" className="text-sm font-medium text-gray-700 dark:text-gray-300">I want to buy</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="service" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Service
              </Label>
              <Select onValueChange={setServiceName} value={serviceName}>
                <SelectTrigger className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                  {services.filter(s => s.status === 'Active').map((service) => (
                    <SelectItem key={service.name} value={service.name} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Price
              </Label>
              <Input 
                id="price" 
                type="number" 
                placeholder="0.10" 
                className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Amount
                </Label>
                <Input 
                id="amount" 
                type="number" 
                placeholder="10" 
                className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Asset
                </Label>
                <Input 
                id="asset" 
                readOnly
                value="BD"
                className="col-span-3 bg-gray-100 dark:bg-gray-800 border-gray-300/70 dark:border-gray-600/70 text-gray-600 dark:text-gray-400" 
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
                </Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="creator@example.com"
                  className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="entity" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Entity Name
                </Label>
                <Select onValueChange={setEntityName} value={entityName}>
                <SelectTrigger className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                    {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.name} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                        {entity.name}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

          </div>
          <DialogFooter className="gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
            >
              <Save className="mr-2 h-4 w-4" />
              <span>Create Offer</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


