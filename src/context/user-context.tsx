
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  username: string;
  email: string;
}

interface UserContextType {
  user: User;
  updateUser: (newUser: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    username: 'User',
    email: 'user@coe.com',
  });

  useEffect(() => {
    // This runs only on the client, after hydration.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        if (parsedUser.email && parsedUser.username) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem('user');
      }
    }
  }, []);

  const updateUser = (newUser: Partial<User>) => {
    setUser((prevUser) => {
        const updatedUser = { ...prevUser, ...newUser };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
