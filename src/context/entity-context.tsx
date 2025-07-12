
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useToast } from '@/hooks/use-toast';

export interface Entity {
  id: string;
  name: string;
  description: string;
  ownerEmail: string;
}

interface EntityContextType {
  entities: Entity[];
  addEntity: (newEntity: Omit<Entity, 'id' | 'description'>) => void;
  fetchEntities: () => void;
}

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>([]);
  const { keycloak, initialized } = useKeycloak();
  const { toast } = useToast();

  const fetchEntities = useCallback(async () => {
    if (!initialized || !keycloak.token) {
      return;
    }
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/entity/`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entities');
      }

      const result = await response.json();
      
      const dataToProcess = result?.getEntityResponse?.data;

      if (Array.isArray(dataToProcess)) {
        const fetchedEntities = dataToProcess.map((item: any) => ({
          id: item.id,
          name: item.entity_name,
          ownerEmail: item.admin_email,
          description: '', 
        }));
        setEntities(fetchedEntities);
      } else {
        console.warn("Fetched data is not in the expected format:", result);
        setEntities([]);
      }

    } catch (error) {
      console.error("Failed to fetch entities:", error);
      toast({
        variant: 'destructive',
        title: 'Fetch Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred while fetching entities.',
      });
      setEntities([]);
    }
  }, [initialized, keycloak.token, toast]);


  useEffect(() => {
    if (initialized && keycloak.token) {
      fetchEntities();
    }
  }, [fetchEntities, initialized, keycloak.token]);

  const addEntity = (newEntity: Omit<Entity, 'id' | 'description'>) => {
    const entityWithId: Entity = {
      id: `temp_${Date.now()}`,
      description: '',
      ...newEntity,
    };
    setEntities(prev => [entityWithId, ...prev.filter(e => !e.id.startsWith('temp_'))]);
  };

  return (
    <EntityContext.Provider value={{ entities, addEntity, fetchEntities }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntities() {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntities must be used within an EntityProvider');
  }
  return context;
}
