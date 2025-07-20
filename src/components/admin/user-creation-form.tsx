
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useKeycloak } from '@react-keycloak/web';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { usePlatformUsers } from '@/context/platform-users-context';

const formSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  group: z.string({ required_error: 'Please select a group.' }),
});

interface UserCreationFormProps {
  onSuccess?: () => void;
}

export function UserCreationForm({ onSuccess }: UserCreationFormProps) {
  const { toast } = useToast();
  const { addUser, fetchUsers } = usePlatformUsers();
  const { keycloak } = useKeycloak();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      group: 'users',
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

    addUser({
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        group: values.group,
    });
    form.reset();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tenants/Felix/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          group: values.group
        }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        const errorMessage = responseBody?.message || responseBody?.meta?.message || 'An unknown error occurred.';
        throw new Error(errorMessage);
      }

      const fullName = `${values.firstName} ${values.lastName}`;

      toast({
        title: 'User Created',
        description: `User ${fullName} has been successfully created.`,
      });
      onSuccess?.();

    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
        fetchUsers();
    }
  }

  return (
    <div className="max-w-lg w-full mx-auto p-0">
      <div className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl p-6 transition-all duration-300 animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create User</h2>
    <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</FormLabel>
              <FormControl>
                    <Input placeholder="John" {...field} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</FormLabel>
              <FormControl>
                    <Input placeholder="Doe" {...field} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</FormLabel>
              <FormControl>
                    <Input type="email" placeholder="john.doe@example.com" {...field} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="group"
          render={({ field }) => (
            <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                      <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <SelectValue placeholder="Select a group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="users">users</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
            <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group text-white focus-visible:outline-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500">
              Create User
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
