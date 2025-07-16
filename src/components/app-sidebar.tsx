
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

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-semibold text-primary">Felix</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                isActive={item.href === '/dashboard' ? isDashboard : pathname.startsWith(item.href)}
                asChild
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(buttonVariants({ variant: 'ghost' }), "w-full justify-start text-left gap-3 p-2 rounded-lg h-auto bg-primary/10 hover:bg-accent hover:text-accent-foreground group")}>
              <Avatar className="h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground">
                <User className="h-6 w-6" />
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold group-hover:text-accent-foreground">{user.username}</span>
                <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/90">{user.email}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mb-2 ml-2" align="end" forceMount>
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
                <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
