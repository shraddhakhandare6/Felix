'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useAssets } from '@/context/asset-context';

const formSchema = z.object({
  assetCode: z.string().min(1, { message: "Asset code cannot be empty." }).max(12, { message: "Asset code cannot be longer than 12 characters." }),
});

export function AssetCreationForm() {
  const { toast } = useToast();
  const { refreshAssets } = useAssets();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCode: '',
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

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/assets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          asset_code: values.assetCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.meta?.message || 'Failed to create asset');
      }

      const newAsset = result.data?.[0];
      if (!newAsset?.assetCode) {
        throw new Error('API did not return created asset details.');
      }
      
      toast({
        title: 'Asset Created',
        description: `Asset ${newAsset.assetCode} has been successfully created.`,
      });
      
      refreshAssets();
      form.reset();

    } catch (error) {
        console.error("Failed to create asset:", error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create Asset</CardTitle>
            <CardDescription>
              Define a new asset by providing an asset code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="assetCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., BD, BTC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Create Asset</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
