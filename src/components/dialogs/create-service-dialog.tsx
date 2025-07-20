
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
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServices, type Service } from '@/context/service-context';
import { useToast } from '@/hooks/use-toast';

type PriceModel = "Fixed" | "Per Endpoint" | "Per Page" | "Hourly";

export function CreateServiceDialog() {
  const [open, setOpen] = useState(false);
  const { addService } = useServices();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceModel, setPriceModel] = useState<PriceModel | ''>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !description || !priceModel) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please fill out all the fields to create a service.',
      });
      return;
    }

    const newService: Service = {
      name,
      description,
      priceModel,
      status: 'Active'
    };
    
    addService(newService);

    toast({
      title: 'Service Created',
      description: `The service "${name}" has been successfully created.`,
    });

    // Reset form and close
    setName('');
    setDescription('');
    setPriceModel('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Create Service</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-gray-100">Create New Service</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Define a new service that can be offered on the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </Label>
              <Input 
                id="name" 
                placeholder="e.g., UX/UI Design Mockup" 
                className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea 
                id="description" 
                placeholder="Describe the service offering" 
                className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price-model" className="text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                Price Model
              </Label>
              <Select onValueChange={(value: PriceModel) => setPriceModel(value)} value={priceModel}>
                <SelectTrigger className="col-span-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                  <SelectItem value="Fixed" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Fixed</SelectItem>
                  <SelectItem value="Hourly" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Hourly</SelectItem>
                  <SelectItem value="Per Endpoint" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Per Endpoint</SelectItem>
                  <SelectItem value="Per Page" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Per Page</SelectItem>
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
              <span>Save Service</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
