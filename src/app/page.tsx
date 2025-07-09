// import Link from 'next/link';
// import { Button } from '@/components/ui/button';

// export default function LandingPage() {
//   return (
//     <div className="flex flex-col min-h-screen w-full bg-background dark:bg-gradient-to-br dark:from-[#0f0c29] dark:to-[#24243e] text-foreground">
//       <div className="flex-1 flex flex-col items-center justify-center p-4">
//         <div className="flex flex-col items-center justify-center text-center space-y-12">
          
//           {/* Main Title and Subtitle */}
//           <div>
//             <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent pb-4">
//               Felix
//             </h1>
//             <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto">
//               A modern platform for{' '}
//               <span className="text-cyan-400">blockchain-powered</span> services,
//               wallets, and assets.
//             </p>
//           </div>

//           {/* Get Started Button */}
//           <div className="text-center">
//              <Link href="/login" passHref>
//                 <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 text-base">
//                     Get Started
//                 </Button>
//             </Link>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }
// src/app/page.tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useKeycloak } from '@react-keycloak/web';

export default function LandingPage() {
  const { keycloak, initialized } = useKeycloak();

  return (
    <div className="flex flex-col min-h-screen w-full bg-background dark:bg-gradient-to-br dark:from-[#0f0c29] dark:to-[#24243e] text-foreground">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center text-center space-y-12">
          
          {/* Main Title and Subtitle - Unchanged from original */}
          <div>
            <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent pb-4">
              Felix
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto">
              A modern platform for{' '}
              <span className="text-cyan-400">blockchain-powered</span> services,
              wallets, and assets.
            </p>
          </div>

          {/* Enhanced Button with Auth State Handling */}
          <div className="text-center">
            {!initialized ? (
              // Loading state
              <Button 
                size="lg" 
                disabled
                className="bg-gray-500 text-white font-bold px-8 text-base"
              >
                Loading...
              </Button>
            ) : keycloak?.authenticated ? (
              // Authenticated state - goes to dashboard
              <Link href="/dashboard" passHref>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 text-base"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              // Not authenticated - original "Get Started" button behavior
              <Link href="/login" passHref>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 text-base"
                >
                  Get Started
                </Button>
              </Link>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}