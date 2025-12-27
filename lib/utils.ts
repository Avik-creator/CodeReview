import { clsx, type ClassValue } from 'clsx';
import { BookOpen, BookOpenCheck, Github, Settings } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NAVIGATION_ITEMS = [
  { title: 'Dashboard', url: '/dashboard', icon: BookOpen },
  { title: 'Respository', url: '/dashboard/repository', icon: Github },
  { title: 'Reviews', url: '/dashboard/reviews', icon: BookOpenCheck },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
];
