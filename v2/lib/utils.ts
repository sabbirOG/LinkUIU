import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts ISO date strings to professional relative time (Institutional Standard)
 */
export function formatRelativeTime(date: string | Date | undefined): string {
  if (!date) return 'Pulse Syncing...';
  
  const now = new Date();
  const past = new Date(date);
  
  if (isNaN(past.getTime())) return 'Now';
  
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  if (diffInSeconds < 0) return 'Just Now';
  if (diffInSeconds < 60) return 'Just Now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
