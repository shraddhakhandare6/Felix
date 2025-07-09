'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  group: string;
}

interface PlatformUsersContextType {
  users: PlatformUser[];
  addUser: (newUser: Omit<PlatformUser, 'id'>) => void;
}

const initialUsers: PlatformUser[] = [
    { id: '1', name: "Alice Johnson", email: "alice.j@example.com", group: "Developers" },
    { id: '2', name: "Bob Williams", email: "bob.w@example.com", group: "Users" },
];

const PlatformUsersContext = createContext<PlatformUsersContextType | undefined>(undefined);

export function PlatformUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PlatformUser[]>(initialUsers);

  const addUser = (newUser: Omit<PlatformUser, 'id'>) => {
    const userWithId: PlatformUser = {
      id: `user_${Date.now()}`,
      ...newUser,
    };
    setUsers(prev => [userWithId, ...prev]);
  };

  return (
    <PlatformUsersContext.Provider value={{ users, addUser }}>
      {children}
    </PlatformUsersContext.Provider>
  );
}

export function usePlatformUsers() {
  const context = useContext(PlatformUsersContext);
  if (context === undefined) {
    throw new Error('usePlatformUsers must be used within a PlatformUsersProvider');
  }
  return context;
}
