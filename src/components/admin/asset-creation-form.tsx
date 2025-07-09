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
  const { addAsset } = useAssets();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Simulate the API call
    console.log('Simulating POST /api/v1/asset/create with payload:', {
      'asset-code': values.assetCode,
    });

    try {
        // This is where you would typically make the fetch request.
        // Since there is no backend, we will just simulate success.
        
        addAsset({ assetCode: values.assetCode });
        toast({
          title: 'Asset Created',
          description: `Asset ${values.assetCode} has been successfully created.`,
        });
        form.reset();
    } catch (error) {
        console.error("Failed to create asset:", error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: 'Could not create the asset.',
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
                    <Input placeholder="e.g., GOLD, BTC" {...field} />
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
