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
      const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/entity/create`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entities');
      }

      const result = await response.json();
      
      // Assuming the API returns a single object or an array of objects
      const dataToProcess = Array.isArray(result) ? result : [result];

      const fetchedEntities = dataToProcess.map((entity: any, index: number) => ({
        id: entity.id || `${entity.entity}-${index}`, // Use entity name and index if no id
        name: entity.entity,
        ownerEmail: entity.adminEmail,
        description: '', // No description from this API
      }));

      // A simple way to merge and avoid duplicates by name
      const allEntities = [...entities, ...fetchedEntities];
      const uniqueEntities = Array.from(new Map(allEntities.map(e => [e.name, e])).values());

      setEntities(uniqueEntities);

    } catch (error) {
      console.error("Failed to fetch entities:", error);
      toast({
        variant: 'destructive',
        title: 'Fetch Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred while fetching entities.',
      });
      setEntities([]);
    }
  }, [initialized, keycloak.token, toast, entities]);


  useEffect(() => {
    if (initialized && keycloak.token) {
      fetchEntities();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, keycloak.token]);

  const addEntity = (newEntity: Omit<Entity, 'id' | 'description'>) => {
    const entityWithId: Entity = {
      id: `entity_${Date.now()}`,
      description: '',
      ...newEntity,
    };
    setEntities(prev => [entityWithId, ...prev]);
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
