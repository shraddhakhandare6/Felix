
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useEntities } from '@/context/entity-context';
import { useServices } from '@/context/service-context';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams, useRouter } from 'next/navigation';

const addUserSchema = z.object({
  entity: z.string({ required_error: "Please select an entity." }),
  email: z.string().email({ message: "Please enter a valid email." }),
});

const mappedUsersData = [
    { id: '1', name: "Alice Johnson", email: "alice.j@example.com", entity: "Project Phoenix" },
    { id: '2', name: "Bob Williams", email: "bob.w@example.com", entity: "CoE Desk" },
];

function EntityManagementComponent() {
    const { entities } = useEntities();
    const { services } = useServices();
    const { toast } = useToast();
    const [mappedUsers, setMappedUsers] = useState(mappedUsersData);
    const searchParams = useSearchParams();
    const router = useRouter();
    const entityId = searchParams.get('entityId');

    const form = useForm<z.infer<typeof addUserSchema>>({
        resolver: zodResolver(addUserSchema),
        defaultValues: {
            email: "",
            entity: entityId || undefined,
        }
    });

    useEffect(() => {
        if (entityId) {
            form.setValue('entity', entityId);
        }
    }, [entityId, form]);
    
    const handleServiceClick = (serviceName: string) => {
        router.push(`/services/${encodeURIComponent(serviceName)}`);
    };

    function onAddUser(values: z.infer<typeof addUserSchema>) {
        const entityName = entities.find(e => e.id === values.entity)?.name || "Unknown Entity";
        const newUser = {
            id: `mapped_${Date.now()}`,
            name: "New User", // In a real app, you might fetch this based on email
            email: values.email,
            entity: entityName,
        };
        setMappedUsers(prev => [...prev, newUser]);
        toast({
            title: "User Mapped",
            description: `${values.email} has been mapped to ${entityName}.`,
        });
        form.reset({
            email: "",
            entity: entityId || undefined
        });
    }

    function unmapUser(userId: string) {
        const userToUnmap = mappedUsers.find(u => u.id === userId);
        setMappedUsers(prev => prev.filter(user => user.id !== userId));
        if (userToUnmap) {
            toast({
                title: "User Unmapped",
                description: `${userToUnmap.email} has been unmapped.`,
                variant: 'destructive'
            });
        }
    }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Entity Management</h1>
        <p className="text-muted-foreground">
          Manage users and services for your entities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Manage Users</CardTitle>
                <CardDescription>Map users to an entity or unmap them.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onAddUser)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="entity"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Entity</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select an entity" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {entities.map((entity) => (
                                        <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>User Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="user@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Add User</Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col items-start">
                <h3 className="font-medium mb-4">Mapped Users</h3>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.entity}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="destructive" size="sm" onClick={() => unmapUser(user.id)}>Unmap</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardFooter>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Associated Services</CardTitle>
                <CardDescription>Services offered by your entities.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.filter(s => s.status === 'Active').map((service) => (
                            <TableRow key={service.name} onClick={() => handleServiceClick(service.name)} className="cursor-pointer">
                                <TableCell>{service.name}</TableCell>
                                <TableCell>
                                     <Badge variant={service.status === 'Active' ? 'success' : 'secondary'}>{service.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}


export default function EntityPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <EntityManagementComponent />
        </Suspense>
    )
}
