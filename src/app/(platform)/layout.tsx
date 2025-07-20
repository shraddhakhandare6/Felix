
'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query?.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      if (isSheetOpen) {
        setIsSheetOpen(false);
        e.currentTarget.reset();
      }
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-30" style={{ width: '270px' }}>
          <AppSidebar />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 ml-[270px] flex flex-col min-h-screen">
          <SidebarInset>
            <header className="flex items-center justify-between p-4 md:rounded-2xl md:mx-4 mt-4 shadow-lg bg-gradient-to-r from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-0 transition-all duration-500 relative overflow-hidden z-20">
        {/* Floating accent */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce pointer-events-none"></div>
        <div className="absolute top-1/2 left-0 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
          <SidebarTrigger />
          <div className="flex items-center gap-2 sm:gap-4">
            <form className="hidden sm:flex items-center gap-2" onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-[200px] lg:w-[300px] bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-lg"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
            
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Search</SheetTitle>
                </SheetHeader>
                <form className="flex items-center gap-2 p-4" onSubmit={handleSearch}>
                    <Search className="h-5 w-5 text-muted-foreground" />
                    <Input
                        name="search"
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 rounded-lg"
                        autoFocus
                    />
                    <Button type="submit">Search</Button>
                </form>
              </SheetContent>
            </Sheet>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200">
                  <Bell className="h-5 w-5 text-white" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      You have no new notifications.
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background/95">
          {children}
        </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
