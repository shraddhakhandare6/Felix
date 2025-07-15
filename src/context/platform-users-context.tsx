'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useToast } from '@/hooks/use-toast';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  group: string;
}

interface PlatformUsersContextType {
  users: PlatformUser[];
  addUser: (newUser: Omit<PlatformUser, 'id'>) => void;
  fetchUsers: () => void;
}

const PlatformUsersContext = createContext<PlatformUsersContextType | undefined>(undefined);

export function PlatformUsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const { keycloak, initialized } = useKeycloak();
  const { toast } = useToast();
  
  const fetchUsers = useCallback(async () => {
    if (!initialized || !keycloak.token) {
      return;
    }
    
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/tenants/Felix/users`, {
        headers: {
          'Authorization': `Bearer ${keycloak.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = await response.json();
      
      if (result.getAllRealmUsersResponse && result.getAllRealmUsersResponse.data) {
        const fetchedUsers = result.getAllRealmUsersResponse.data.map((user: any) => ({
          id: user.id || user.email,
          name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email.split('@')[0],
          email: user.email,
          group: user.group || 'Users', 
        }));
        setUsers(fetchedUsers);
      } else {
         setUsers([]);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        variant: 'destructive',
        title: 'Fetch Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred while fetching users.',
      });
      setUsers([]);
    }
  }, [initialized, keycloak.token, toast]);

  useEffect(() => {
    if (initialized && keycloak.token) {
      fetchUsers();
    }
  }, [fetchUsers, initialized, keycloak.token]);


  const addUser = (newUser: Omit<PlatformUser, 'id'>) => {
    const userWithId: PlatformUser = {
      id: `temp_${Date.now()}`,
      ...newUser,
    };
    setUsers(prev => [userWithId, ...prev.filter(u => !u.id.startsWith('temp_'))]);
  };

  return (
    <PlatformUsersContext.Provider value={{ users, addUser, fetchUsers }}>
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
