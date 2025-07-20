
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKeycloak } from '@react-keycloak/web';

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
import { useToast } from '@/hooks/use-toast';
import { useEntities } from '@/context/entity-context';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  ownerEmail: z.string().email({ message: "Please enter a valid email for the owner." }),
});

interface EntityCreationFormProps {
  onSuccess?: () => void;
}

export function EntityCreationForm({ onSuccess }: EntityCreationFormProps) {
  const { toast } = useToast();
  const { addEntity, fetchEntities } = useEntities();
  const { keycloak } = useKeycloak();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      ownerEmail: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'The API endpoint is not configured. Please set NEXT_PUBLIC_API_BASE_URL.',
      });
      return;
    }

    if (!keycloak.token) {
       toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Unable to get authentication token. Please log in again.',
      });
      return;
    }

    addEntity({
        name: values.name,
        ownerEmail: values.ownerEmail,
    });
    form.reset();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tenants/Felix/entity/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keycloak.token}`
        },
        body: JSON.stringify({
          entity: values.name,
          adminEmail: values.ownerEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create entity. Please try again.' }));
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      toast({
        title: 'Entity Created',
        description: `Entity ${values.name} has been successfully created.`,
      });
      onSuccess?.();

    } catch (error) {
        console.error("Failed to create entity:", error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        fetchEntities();
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto p-0">
      <div className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6 transition-all duration-300 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Entity</h2>
    <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</FormLabel>
              <FormControl>
                    <Input placeholder="Project Phoenix" {...field} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ownerEmail"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Entity Owner (Email)</FormLabel>
              <FormControl>
                    <Input type="email" placeholder="owner@example.com" {...field} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group text-white focus-visible:outline-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">
              Create Entity
            </Button>
      </form>
    </Form>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(0.4,0,0.2,1); }
      `}</style>
    </div>
  );
}
