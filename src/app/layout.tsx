import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { UserProvider } from '@/context/user-context';
import { PaymentRequestsProvider } from '@/context/payment-requests-context';
import { AccountProvider } from '@/context/account-context';
import { KeycloakProvider } from '@/components/keycloak-provider';
import { ContactsProvider } from '@/context/contacts-context';
import { EntityProvider } from '@/context/entity-context';
import { PlatformUsersProvider } from '@/context/platform-users-context';
import { AssetProvider } from '@/context/asset-context';
import { ServiceProvider } from '@/context/service-context';

export const metadata: Metadata = {
  title: 'Felix - Blockchain Service & Wallet Platform',
  description: 'Internal blockchain-powered platform for services, wallets, and assets.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
      <KeycloakProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <AccountProvider>
              <PaymentRequestsProvider>
                <ContactsProvider>
                  <EntityProvider>
                    <PlatformUsersProvider>
                      <AssetProvider>
                        <ServiceProvider>
                          <AuthProvider>
                            {children}
                          </AuthProvider>
                        </ServiceProvider>
                      </AssetProvider>
                    </PlatformUsersProvider>
                  </EntityProvider>
                </ContactsProvider>
              </PaymentRequestsProvider>
            </AccountProvider>
          </UserProvider>
          <Toaster />
        </ThemeProvider>
      </KeycloakProvider>
      </body>
    </html>
  );
}
