
'use client';

import { useMemo, Suspense, useEffect, useState } from 'react';
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
import { ChevronLeft, Settings, Save, ArrowLeft } from 'lucide-react';

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
    const [isVisible, setIsVisible] = useState(false);
    
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

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!service) {
        return (
            <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-1000 ease-out ${
                isVisible 
                    ? 'opacity-100' 
                    : 'opacity-0'
            }`}>
            <div className="flex items-center justify-center h-full">
                    <Card className="w-full max-w-lg text-center p-8 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                        <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl inline-block mb-4">
                            <Settings className="w-12 h-12 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Service Not Found</CardTitle>
                        <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
                        The service you are looking for does not exist or could not be loaded.
                    </CardDescription>
                </Card>
                </div>
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
        <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                                        <Settings className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
                                            Edit Service
                                        </h1>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                                            Modify the details and configuration of your service.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Button 
                                        variant="outline" 
                                        type="button" 
                                        onClick={() => router.back()}
                                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400 transition-all duration-200"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                                    <Button 
                                        type="submit"
                                        className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        <span>Save Changes</span>
                                    </Button>
                    </div>
                </div>

                            {/* Main Form Card */}
                            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300">
                                <CardHeader className="pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                                            <Settings className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold">Service Configuration</CardTitle>
                                            <CardDescription className="text-base">
                            Modify the details of your service below.
                        </CardDescription>
                                        </div>
                                    </div>
                    </CardHeader>
                                <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Service Name</FormLabel>
                                    <FormControl>
                                                    <Input 
                                                        placeholder="e.g., UX/UI Design Mockup" 
                                                        {...field} 
                                                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                    />
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
                                                <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</FormLabel>
                                    <FormControl>
                                                    <Textarea 
                                                        placeholder="Describe the service offering" 
                                                        {...field} 
                                                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none min-h-[100px]"
                                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="priceModel"
                            render={({ field }) => (
                                <FormItem>
                                                         <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Price Model</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                                                 <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                                                <SelectValue placeholder="Select a price model" />
                                            </SelectTrigger>
                                        </FormControl>
                                                        <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                                                            <SelectItem value="Fixed" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Fixed</SelectItem>
                                                            <SelectItem value="Per Endpoint" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Per Endpoint</SelectItem>
                                                            <SelectItem value="Per Page" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Per Page</SelectItem>
                                                            <SelectItem value="Hourly" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Hourly</SelectItem>
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
                                                         <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                                                 <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300/70 dark:border-gray-600/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                                                <SelectValue placeholder="Select a status" />
                                            </SelectTrigger>
                                        </FormControl>
                                                        <SelectContent className="backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                                                            <SelectItem value="Active" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Active</SelectItem>
                                                            <SelectItem value="Draft" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Draft</SelectItem>
                                                            <SelectItem value="Archived" className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                                    </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
                </div>
            </div>
        </div>
    );
}

export default function ServiceDetailPage() {
    return (
        <Suspense fallback={<PageLoader />}>
            <ServiceDetailContent />
        </Suspense>
    )
}
