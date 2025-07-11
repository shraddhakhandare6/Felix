
// 'use client';

// import { useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Logo } from '@/components/logo';
// import { useAuth } from '@/context/auth-context';
// import { useEffect } from 'react';

// export default function LoginPage() {
//   const router = useRouter();
//   const { login, isAuthenticated } = useAuth();

//   useEffect(() => {
//     // Redirect to dashboard if user is already authenticated
//     if (isAuthenticated) {
//       router.push('/dashboard');
//     }
//   }, [isAuthenticated, router]);


//   const handleLogin = () => {
//     login();
//   };

//   return (
//     <Card className="w-full max-w-sm">
//       <CardHeader className="text-center">
//         <div className="flex justify-center items-center gap-2 mb-4">
//            <Logo className="w-8 h-8 text-primary" />
//            <CardTitle className="text-3xl">Felix</CardTitle>
//         </div>
//         <CardDescription>
//           Click the button below to sign in to your account.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//          <Button className="w-full" onClick={handleLogin}>
//           Sign In
//         </Button>
//       </CardContent>
//        <CardFooter className="flex flex-col gap-4">
//          <p className="text-xs text-center text-muted-foreground">
//             You will be redirected to the secure login page.
//         </p>
//       </CardFooter>
//     </Card>
//   );
// }
'use client';

import { useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    if (initialized) {
      if (keycloak.authenticated) {
        router.push('/dashboard');
      }
    }
  }, [initialized, keycloak, router]);

  const handleLogin = () => {
    if (initialized && !keycloak.authenticated) {
      keycloak.login();
    }
  };

  // Optionally show loader while waiting for keycloak to initialize
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl font-semibold">Initializing authentication...</h1>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Logo className="w-8 h-8 text-primary" />
          <CardTitle className="text-3xl">Felix</CardTitle>
        </div>
        <CardDescription>
          Click the button below to sign in to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={handleLogin}>
          Sign In
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-xs text-center text-muted-foreground">
          You will be redirected to the secure login page.
        </p>
      </CardFooter>
    </Card>
  );
}
