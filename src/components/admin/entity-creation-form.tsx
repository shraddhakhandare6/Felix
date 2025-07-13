
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
      const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/entity/create`, {
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Project Phoenix" {...field} />
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
              <FormLabel>Entity Owner (Email)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="owner@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Create Entity</Button>
      </form>
    </Form>
  );
}
