
'use client';

import { useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useServices } from '@/context/service-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from '@/components/page-loader';

function ServiceDetailContent() {
    const params = useParams();
    const { services } = useServices();
    
    // The service name from the URL will be URL-encoded, so we need to decode it.
    const serviceName = useMemo(() => {
        const name = params.name;
        return typeof name === 'string' ? decodeURIComponent(name) : undefined;
    }, [params.name]);

    const service = useMemo(() => {
        return services.find(s => s.name === serviceName);
    }, [services, serviceName]);

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
    
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{service.name}</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Service Configuration</CardTitle>
                    <CardDescription>
                        This is a read-only view of the service's current configuration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Description</span>
                            <p>{service.description}</p>
                        </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Price Model</span>
                            <p>
                                <Badge variant="outline">{service.priceModel}</Badge>
                            </p>
                        </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Status</span>
                            <p>
                                <Badge variant={service.status === 'Active' ? 'success' : 'secondary'}>{service.status}</Badge>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
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
