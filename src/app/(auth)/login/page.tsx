'use client';

import { useEffect, useState } from 'react';
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
import { Shield, ArrowRight, Sparkles, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (initialized) {
      if (keycloak.authenticated) {
        router.push('/dashboard');
      }
    }
  }, [initialized, keycloak, router]);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async () => {
    if (initialized && !keycloak.authenticated) {
      setIsLoading(true);
      try {
        await keycloak.login();
      } catch (error) {
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Optionally show loader while waiting for keycloak to initialize
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Initializing authentication...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-md transition-all duration-700 ease-out ${
      isVisible 
        ? 'opacity-100 translate-y-0 scale-100' 
        : 'opacity-0 translate-y-8 scale-95'
    }`}>
      <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
        <CardHeader className="text-center pb-8">
          {/* Logo and Title */}
          <div className="flex justify-center items-center gap-3 mb-6">
            <div className="relative">
              <Logo className="w-10 h-10 text-primary drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Felix
            </CardTitle>
          </div>
          
          {/* Welcome Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
              Welcome Back
            </h2>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400">
              Sign in to access your secure dashboard and manage your assets
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Access</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Modern UI</span>
            </div>
          </div>

          {/* Login Button */}
          <Button 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>Sign In Securely</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </div>
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 pt-6">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <User className="w-3 h-3" />
            <span>You will be redirected to the secure login page</span>
          </div>
          
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300">
              Enterprise-grade security
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Floating Elements */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce"></div>
      <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce delay-1000"></div>
    </div>
  );
}
