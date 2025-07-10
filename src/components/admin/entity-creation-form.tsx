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
import { useEntities } from '@/context/entity-context';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  ownerEmail: z.string().email({ message: "Please enter a valid email for the owner." }),
});

export function EntityCreationForm() {
  const { toast } = useToast();
  const { addEntity } = useEntities();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      ownerEmail: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addEntity({
        name: values.name,
        ownerEmail: values.ownerEmail,
        description: '' // Passing an empty string since it's required by the context
    });
    toast({
      title: 'Entity Created',
      description: `Entity ${values.name} has been successfully created.`,
    });
    form.reset();
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Create Entity</CardTitle>
            <CardDescription>
              Create a new entity like a project or a department.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
          <CardFooter>
            <Button type="submit">Create Entity</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
