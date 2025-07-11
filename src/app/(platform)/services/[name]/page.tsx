
'use client';

import { useMemo, Suspense, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useServices, type Service } from '@/context/service-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from '@/hooks/use-toast';
import { PageLoader } from '@/components/page-loader';

const serviceFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  priceModel: z.enum(["Fixed", "Per Endpoint", "Per Page", "Hourly"]),
  status: z.enum(["Active", "Draft", "Archived"]),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

function ServiceDetailContent() {
    const params = useParams();
    const router = useRouter();
    const { services, updateService } = useServices();
    const { toast } = useToast();
    
    const serviceName = useMemo(() => {
        const name = params.name;
        return typeof name === 'string' ? decodeURIComponent(name) : undefined;
    }, [params.name]);

    const service = useMemo(() => {
        return services.find(s => s.name === serviceName);
    }, [services, serviceName]);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: service,
    });
    
    useEffect(() => {
        if (service) {
            form.reset(service);
        }
    }, [service, form]);

    if (!service) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="w-full max-w-lg text-center p-8">
                    <CardTitle className="text-2xl">Service Not Found</CardTitle>
                    <CardDescription className="mt-2">
                        The service you are looking for does not exist or could not be loaded.
                    </CardDescription>
                </Card>
            </div>
        );
    }
    
    function onSubmit(data: ServiceFormValues) {
        if (!serviceName) return;
        
        updateService(serviceName, data);
        toast({
          title: "Service Updated",
          description: `The service "${data.name}" has been updated successfully.`,
        });

        // If the name changed, the URL is now stale. We need to redirect.
        if (serviceName !== data.name) {
            router.replace(`/services/${encodeURIComponent(data.name)}`);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Edit Service</h1>
                    <Button type="submit">Save Changes</Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Service Configuration</CardTitle>
                        <CardDescription>
                            Modify the details of your service below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Service Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., UX/UI Design Mockup" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the service offering" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="priceModel"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price Model</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a price model" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Fixed">Fixed</SelectItem>
                                            <SelectItem value="Per Endpoint">Per Endpoint</SelectItem>
                                            <SelectItem value="Per Page">Per Page</SelectItem>
                                            <SelectItem value="Hourly">Hourly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}


export default function ServiceDetailPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <ServiceDetailContent />
        </Suspense>
    )
}
