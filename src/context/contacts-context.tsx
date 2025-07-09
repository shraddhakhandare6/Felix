'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';

export interface Contact {
  id: string;
  name: string;
  address: string;
  avatar: string;
}

interface ContactsContextType {
  contacts: Contact[];
  addContact: (newContact: { name: string; address: string }) => void;
}

const initialContacts: Contact[] = [
    { id: '1', name: "CoE Desk", address: "coe_desk*felix.com", avatar: "C" },
    { id: '2', name: "Project Alpha", address: "G...XYZ", avatar: "A" },
    { id: '3', name: "Project Gamma", address: "G...ABC", avatar: "G" },
    { id: '4', name: "Individual Member", address: "member_one*felix.com", avatar: "I" },
];

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const addContact = (newContact: { name: string; address: string }) => {
    const contactWithAvatar: Contact = {
      id: `contact_${Date.now()}`,
      ...newContact,
      avatar: newContact.name.charAt(0).toUpperCase(),
    };
    setContacts(prev => [contactWithAvatar, ...prev]);
  };

  return (
    <ContactsContext.Provider value={{ contacts, addContact }}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactsProvider');
  }
  return context;
}
