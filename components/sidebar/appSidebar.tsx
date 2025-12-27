'use client';
import { Github, Moon, Sun, LogOut as Logout } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import LogOut from '@/components/auth/components/logOut';
import { NAVIGATION_ITEMS } from '@/lib/utils';
import { Button } from '../ui/button';

const AppSidebar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState();
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/dashboard');
  };

  if (!mounted || !session) return null;
  const user = session.user;
  const userName = user.name || 'GUEST';
  const userEmail = user.email || '';
  const userAvatar = user.image || '';

  const userInitials = userName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-4 px-2 py-6">
          <div className="flex items-center gap-4 px-3 py-4 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent/70 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">
                Connected Account
              </p>
              <p className="text-sm font-medium text-sidebar-foreground/90">
                @{userName}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground px-3 mb-2 uppercase tracking-wider">
            Navigation
          </p>
        </div>
        <SidebarMenu className="gap-1">
          {NAVIGATION_ITEMS.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`h-11 px-3 rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? 'bg-primary/10 text-primary font-semibold border border-primary/20 shadow-sm'
                    : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-14 px-3 rounded-xl data-[state=open]:bg-accent hover:bg-accent/50 transition-all duration-200 border border-transparent hover:border-border/40"
                >
                  <Avatar className="h-10 w-10 rounded-lg border-2 border-primary/20 shadow-sm">
                    <AvatarImage
                      src={userAvatar || '/placeholder.svg'}
                      alt={userName}
                    />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 text-left min-w-0 ml-1">
                    <span className="truncate font-semibold text-sm text-foreground">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-64 rounded-xl p-2"
                align="end"
                side="right"
                sideOffset={8}
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-foreground">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="cursor-pointer px-3 py-2.5 rounded-lg hover:bg-accent transition-colors"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4 mr-3 shrink-0" />
                  ) : (
                    <Moon className="w-4 h-4 mr-3 shrink-0" />
                  )}
                  <span className="text-sm font-medium">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer px-3 py-2.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-destructive">
                  <Logout className="w-4 h-4 mr-3 shrink-0" />
                  <LogOut className="text-sm font-medium">Sign Out</LogOut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
