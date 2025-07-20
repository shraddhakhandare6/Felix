
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { useAssets } from '@/context/asset-context';

const formSchema = z.object({
  assetCode: z.string().min(1, { message: "Asset code cannot be empty." }).max(12, { message: "Asset code cannot be longer than 12 characters." }),
});

interface AssetCreationFormProps {
  onSuccess?: () => void;
}

export function AssetCreationForm({ onSuccess }: AssetCreationFormProps) {
  const { toast } = useToast();
  const { addAsset, refreshAssets } = useAssets();

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

    addAsset({
      asset_code: values.assetCode,
    });
    form.reset();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/assets/create`, {
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
      onSuccess?.();

    } catch (error) {
        console.error("Failed to create asset:", error);
        toast({
          variant: 'destructive',
          title: 'Creation Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
    } finally {
        refreshAssets();
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto p-0">
      <div className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6 transition-all duration-300 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Asset</h2>
    <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="assetCode"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Asset Code</FormLabel>
              <FormControl>
                    <Input placeholder="e.g., BD, BTC" {...field} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group text-white focus-visible:outline-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">
              Create Asset
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
