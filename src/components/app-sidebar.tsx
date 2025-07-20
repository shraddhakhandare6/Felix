
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Send,
  Users,
  Settings,
  ShoppingBag,
  LogOut,
  Moon,
  Sun,
  User,
  Shield,
  Briefcase,
  Package,
} from 'lucide-react';
import { useTheme } from "next-themes";
import { useUser } from '@/context/user-context';
import React from 'react'; // Added missing import for React

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { buttonVariants } from '@/components/ui/button';
import { Avatar } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

const allMenuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['realm-admin', 'user'] },
  { href: '/wallet', label: 'Wallet', icon: Wallet, roles: ['realm-admin', 'user'] },
  { href: '/services', label: 'Services', icon: ArrowLeftRight, roles: ['realm-admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['realm-admin', 'user'] },
  { href: '/payment-requests', label: 'Payment Requests', icon: Send, roles: ['realm-admin', 'user'] },
  { href: '/contacts', label: 'Contacts', icon: Users, roles: ['realm-admin', 'user'] },
  { href: '/assets', label: 'Assets', icon: Package, roles: ['realm-admin'] },
  { href: '/entity', label: 'Entity', icon: Briefcase, roles: ['realm-admin'] },
  { href: '/admin', label: 'Admin', icon: Shield, roles: ['realm-admin'] },
  { href: '/account', label: 'Account', icon: Settings, roles: ['realm-admin', 'user'] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setTheme } = useTheme();
  const { user } = useUser();
  const { logout, roles } = useAuth();
  
  const isAdmin = roles.includes('realm-admin');

  const menuItems = allMenuItems.filter(item => {
    if (item.roles.includes('realm-admin') && isAdmin) {
      return true;
    }
    // A non-admin should see items that are not exclusive to admins.
    // Let's assume for now that if a role is not 'realm-admin', it's a general user role.
    if (!isAdmin && !item.roles.includes('realm-admin')) {
      return true;
    }
    // A simple user role check
    if (!isAdmin && item.roles.includes('user')) {
      return true;
    }
    return false;
  });

  const isDashboard = pathname === '/dashboard';

  // Animation state for fade-in
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-[270px] min-w-[220px] max-w-xs flex flex-col transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
        shadow-2xl m-0 p-0
        z-30
      `}
      style={{height: '100vh'}}
    >
      {/* Floating accent */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-bounce pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
      <div className="flex flex-col h-full">
        <SidebarHeader>
          <div className="flex items-center gap-3 p-4">
            <Logo className="w-10 h-10 text-primary drop-shadow-lg" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Felix</h1>
          </div>
        </SidebarHeader>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(buttonVariants({ variant: 'ghost' }), `w-full justify-start text-left gap-3 p-4 rounded-xl h-auto bg-primary/10 group transition-all duration-200
                hover:bg-gradient-to-r hover:from-blue-800/70 hover:to-green-700/70 hover:text-white hover:backdrop-blur-md
                dark:hover:bg-gradient-to-r dark:hover:from-blue-900/80 dark:hover:to-green-800/80 dark:hover:text-white
                `)}> 
                <Avatar className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground">
                  <User className="h-6 w-6" />
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold group-hover:text-accent-foreground">{user.username}</span>
                  <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/90">{user.email}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2 ml-2" align="end" side="bottom" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
            </p>
          </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                  <Link href="/account">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                  </Link>
              </DropdownMenuItem>
               <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4 mr-1 text-yellow-400 dark:text-gray-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="h-4 w-4 mr-1 text-blue-500 dark:text-yellow-300 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span>Theme</span>
                  </span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="backdrop-blur-md bg-white/80 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-xl p-1">
                    <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-400" />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
                      <Moon className="h-4 w-4 text-blue-500 dark:text-yellow-300" />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border border-gray-300 dark:border-gray-700" />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="flex items-center gap-2">
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
        <div className="mt-8" />
        <div className="flex-1 min-h-0 overflow-auto">
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                isActive={item.href === '/dashboard' ? isDashboard : pathname.startsWith(item.href)}
                asChild
                tooltip={item.label}
                    className={`group transition-all duration-200 rounded-xl px-3 py-2 my-1 font-medium
                      text-gray-700 dark:text-gray-200
                      hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:shadow-lg
                      hover:text-gray-900 dark:hover:text-white
                      ${((item.href === '/dashboard' ? isDashboard : pathname.startsWith(item.href))) ? 'text-black dark:text-white font-bold' : ''}
                    `}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
                      <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
                  </div>
                </div>
    </aside>
  );
}
