'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useKeycloak } from '@react-keycloak/web';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/logo';
import { ArrowRight, Sparkles, Shield, Zap, Globe, Users, TrendingUp, Lock } from 'lucide-react';

export default function LandingPage() {
  const { keycloak, initialized } = useKeycloak();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-30 animate-bounce delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-40 animate-bounce delay-1400"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Logo className="w-8 h-8 text-primary drop-shadow-lg" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Felix
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">About</a>
            <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
              Sign In
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            isVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}>
            
            {/* Hero Section */}
            <div className="space-y-8 mb-16">
              {/* Main Title */}
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent leading-tight">
                  Felix
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  A modern platform for{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 font-semibold">
                    blockchain-powered
                  </span>{' '}
                  services, wallets, and assets.
                </p>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Secure & Reliable</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium">Lightning Fast</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <Globe className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium">Global Access</span>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-8">
              {/* Enhanced Button with Auth State Handling */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {!initialized ? (
                  <Button 
                    size="lg" 
                    disabled
                    className="h-14 px-8 text-lg font-semibold bg-gray-500 text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Loading...</span>
                    </div>
                  </Button>
                ) : keycloak?.authenticated ? (
                  <Link href="/dashboard" passHref>
                    <Button 
                      size="lg" 
                      className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Go to Dashboard</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" passHref>
                    <Button 
                      size="lg" 
                      className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                    >
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <span>Get Started</span>
                        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Trusted by 10,000+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>99.9% uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span>Enterprise security</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2024 Felix Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}