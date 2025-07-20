
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
import { useKeycloak } from '@react-keycloak/web';
import { WalletDisplay } from '@/components/wallet-display';
import { ChevronLeft, Building2, Users, Settings, Plus, Trash2 } from 'lucide-react';

const addUserSchema = z.object({
  entity: z.string({ required_error: "Please select an entity." }),
  email: z.string().email({ message: "Please enter a valid email." }),
});

interface MappedUser {
    id: string;
    name: string;
    email: string;
    entity: string;
}

function EntityManagementComponent() {
    const { entities } = useEntities();
    const { services } = useServices();
    const { toast } = useToast();
    const { keycloak } = useKeycloak();
    const [mappedUsers, setMappedUsers] = useState<MappedUser[]>([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const entityId = searchParams.get('entityId');
    const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

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
            const entity = entities.find(e => e.id === entityId);
            if (entity) {
                setSelectedEntityName(entity.name);
            }
        }
    }, [entityId, form, entities]);

    const selectedEntityId = form.watch('entity');

    useEffect(() => {
        const entity = entities.find(e => e.id === selectedEntityId);
        setSelectedEntityName(entity ? entity.name : null);
    }, [selectedEntityId, entities]);

    useEffect(() => {
        const fetchMappedUsers = async () => {
            if (!selectedEntityId || !keycloak.token) {
                setMappedUsers([]);
                return;
            }

            const entity = entities.find(e => e.id === selectedEntityId);
            if (!entity) {
                setMappedUsers([]);
                return;
            }

            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            if (!apiBaseUrl) {
                toast({
                    variant: 'destructive',
                    title: 'Configuration Error',
                    description: 'The API endpoint is not configured.',
                });
                return;
            }
            
            try {
                const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/entity/${entity.name}/members/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${keycloak.token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch entity members.');
                }

                const result = await response.json();
                const membersData = result?.getEntityResponse?.data;

                if (Array.isArray(membersData)) {
                    const fetchedUsers: MappedUser[] = membersData.map((member: any) => ({
                        id: member.id,
                        name: member.user_email.split('@')[0], // Simple name generation
                        email: member.user_email,
                        entity: member.entity_name,
                    }));
                    setMappedUsers(fetchedUsers);
                } else {
                    setMappedUsers([]);
                }

            } catch (error) {
                console.error("Failed to fetch entity members:", error);
                setMappedUsers([]); // Clear on error
                toast({
                    variant: 'destructive',
                    title: 'Fetch Failed',
                    description: 'Could not fetch members for the selected entity.',
                });
            }
        };

        fetchMappedUsers();
    }, [selectedEntityId, entities, keycloak.token, toast]);
    
    const handleServiceClick = (serviceName: string) => {
        router.push(`/services/${encodeURIComponent(serviceName)}`);
    };

    async function onAddUser(values: z.infer<typeof addUserSchema>) {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiBaseUrl) {
            toast({
                variant: 'destructive',
                title: 'Configuration Error',
                description: 'The API endpoint is not configured.',
            });
            return;
        }

        if (!keycloak.token) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'Unable to get authentication token.',
            });
            return;
        }

        const entityName = entities.find(e => e.id === values.entity)?.name;
        if (!entityName) {
            toast({
                variant: 'destructive',
                title: 'Invalid Entity',
                description: 'The selected entity could not be found.',
            });
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/entity/member/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keycloak.token}`
                },
                body: JSON.stringify({
                    entity: entityName,
                    email: values.email,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to add entity member.' }));
                throw new Error(errorData.message || 'An unknown error occurred.');
            }

            const newUser: MappedUser = {
                id: `mapped_${Date.now()}`,
                name: "New User", 
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
                entity: entityId || values.entity
            });

        } catch (error) {
            console.error("Failed to add entity member:", error);
            toast({
                variant: 'destructive',
                title: 'Mapping Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        }
    }

    async function unmapUser(userId: string) {
        const userToUnmap = mappedUsers.find(u => u.id === userId);
        if (!userToUnmap) return;

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        if (!apiBaseUrl) {
            toast({
                variant: 'destructive',
                title: 'Configuration Error',
                description: 'The API endpoint is not configured.',
            });
            return;
        }

        if (!keycloak.token) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'Unable to get authentication token.',
            });
            return;
        }
        
        try {
            const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/entity/member/remove`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${keycloak.token}`
                },
                body: JSON.stringify({
                    entity: userToUnmap.entity,
                    email: userToUnmap.email,
                }),
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({ message: 'Failed to unmap entity member.' }));
                throw new Error(errorData.message || 'An unknown error occurred.');
            }

            setMappedUsers(prev => prev.filter(user => user.id !== userId));
            toast({
                title: "User Unmapped",
                description: `${userToUnmap.email} has been unmapped from ${userToUnmap.entity}.`,
                variant: 'destructive'
            });

        } catch (error) {
             console.error("Failed to unmap entity member:", error);
            toast({
                variant: 'destructive',
                title: 'Unmapping Failed',
                description: error instanceof Error ? error.message : 'An unknown error occurred.',
            });
        }
    }

    const handleChangeEntity = () => {
        form.reset({
            ...form.getValues(),
            entity: undefined,
        });
        setSelectedEntityName(null);
        router.replace('/entity', { scroll: false });
    };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000 ease-out ${
      isVisible 
        ? 'opacity-100' 
        : 'opacity-0'
    }`}>
      {/* Floating Elements */}
      <div className="fixed -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce pointer-events-none"></div>
      <div className="fixed -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce delay-1000 pointer-events-none"></div>
      <div className="fixed top-1/4 left-1/4 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
      
      <div className={`transition-all duration-700 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-8'
      }`}>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
        <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  Entity Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users and services for your entities.
            </p>
              </div>
        </div>
        {selectedEntityName && (
              <Button 
                variant="outline" 
                onClick={handleChangeEntity}
                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Change Entity
            </Button>
        )}
      </div>

      <Form {...form}>
        {selectedEntityName ? (
            <div className="space-y-6">
                <WalletDisplay entityName={selectedEntityName} />
            </div>
        ) : (
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Select an Entity</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        Choose an entity to view its wallet, users, and services.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                    <FormField
                        control={form.control}
                        name="entity"
                        render={({ field }) => (
                            <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Entity</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                <FormControl>
                            <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                                    <SelectValue placeholder="Select an entity" />
                                </SelectTrigger>
                                </FormControl>
                          <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                                {entities.map((entity) => (
                              <SelectItem key={entity.id} value={entity.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                {entity.name}
                              </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2">
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Users</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        Map users to an entity or unmap them.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onAddUser)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="entity"
                            render={({ field }) => (
                                <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Entity</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                    <FormControl>
                              <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                                        <SelectValue placeholder="Select an entity" />
                                    </SelectTrigger>
                                    </FormControl>
                            <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                                    {entities.map((entity) => (
                                <SelectItem key={entity.id} value={entity.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
                                  {entity.name}
                                </SelectItem>
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
                          <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">User Email</FormLabel>
                                <FormControl>
                            <Input 
                              type="email" 
                              placeholder="user@example.com" 
                              {...field}
                              className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    <Button 
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Add User</span>
                    </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col items-start">
                  <h3 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Mapped Users</h3>
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Email</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Entity</TableHead>
                          <TableHead className="text-right font-semibold text-gray-900 dark:text-gray-100">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mappedUsers.length > 0 ? (
                          mappedUsers.map((user, index) => (
                            <TableRow 
                              key={user.id}
                              className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <TableCell className="text-gray-900 dark:text-gray-100">{user.email}</TableCell>
                              <TableCell className="text-gray-900 dark:text-gray-100">{user.entity}</TableCell>
                                        <TableCell className="text-right">
                                <Button 
                                  variant="destructive" 
                                  size="sm" 
                                  onClick={() => unmapUser(user.id)}
                                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Unmap
                                </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-gray-600 dark:text-gray-400">
                                        Select an entity to see its members.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                  </div>
                </CardFooter>
            </Card>
            
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Associated Services</CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        Services offered by your entities.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                    <Table>
                        <TableHeader>
                        <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Service</TableHead>
                          <TableHead className="font-semibold text-gray-900 dark:text-gray-100">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {services.filter(s => s.status === 'Active').map((service, index) => (
                          <TableRow 
                            key={service.name} 
                            onClick={() => handleServiceClick(service.name)} 
                            className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-200"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="text-gray-900 dark:text-gray-100">{service.name}</TableCell>
                                    <TableCell>
                              <Badge 
                                variant={service.status === 'Active' ? 'success' : 'secondary'}
                                className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800"
                              >
                                {service.status}
                              </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                  </div>
                </CardContent>
            </Card>
        </div>
      </Form>
        </div>
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

    