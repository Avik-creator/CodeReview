'use client';
import {
  Github,
  BookOpen,
  Settings,
  Moon,
  Sun,
  LogOut as Logout,
} from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import LogOut from '@/components/auth/components/logOut';

const AppSidebar = () => {
  return <div>App Sidebar</div>;
};

export default AppSidebar;
