'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface Entity {
  id: string;
  name: string;
  description: string;
  ownerEmail: string;
}

interface EntityContextType {
  entities: Entity[];
  addEntity: (newEntity: Omit<Entity, 'id'>) => void;
}

const initialEntities: Entity[] = [
    { id: '1', name: "Project Phoenix", description: "A next-generation platform for decentralized finance.", ownerEmail: "owner.phoenix@example.com" },
    { id: '2', name: "CoE Desk", description: "Center of Excellence for blockchain initiatives.", ownerEmail: "owner.coe@example.com" },
];

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({ children }: { children: ReactNode }) {
  const [entities, setEntities] = useState<Entity[]>(initialEntities);

  const addEntity = (newEntity: Omit<Entity, 'id'>) => {
    const entityWithId: Entity = {
      id: `entity_${Date.now()}`,
      ...newEntity,
    };
    setEntities(prev => [entityWithId, ...prev]);
  };

  return (
    <EntityContext.Provider value={{ entities, addEntity }}>
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
