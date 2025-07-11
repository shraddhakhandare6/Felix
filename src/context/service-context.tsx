
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface Service {
  name: string;
  description: string;
  priceModel: 'Fixed' | 'Per Endpoint' | 'Per Page' | 'Hourly';
  status: 'Active' | 'Draft' | 'Archived';
}

interface ServiceContextType {
  services: Service[];
  addService: (service: Service) => void;
  archiveService: (serviceName: string) => void;
}

const initialServices: Service[] = [
  {
    name: "UX/UI Design Mockup",
    description: "High-fidelity mockups for web and mobile apps.",
    priceModel: "Fixed",
    status: "Active",
  },
  {
    name: "Backend API Endpoint",
    description: "Develop and deploy a single API endpoint.",
    priceModel: "Per Endpoint",
    status: "Active",
  },
  {
    name: "Technical Documentation",
    description: "Create comprehensive technical docs for a project.",
    priceModel: "Per Page",
    status: "Active",
  },
  {
    name: "1 Hour Consulting",
    description: "Expert advice on blockchain technology.",
    priceModel: "Hourly",
    status: "Active",
  },
    {
    name: "Code Review",
    description: "Review up to 1,000 lines of code for quality.",
    priceModel: "Fixed",
    status: "Draft",
  },
];

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export function ServiceProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(initialServices);

  const addService = (service: Service) => {
    setServices((prev) => [...prev, service]);
  };

  const archiveService = (serviceName: string) => {
    setServices((prevServices) =>
      prevServices.map((service) =>
        service.name === serviceName ? { ...service, status: 'Archived' } : service
      )
    );
  };

  return (
    <ServiceContext.Provider value={{ services, addService, archiveService }}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
