import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Button({ className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) {
  const variants = {
    primary: 'bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200',
    secondary: 'bg-slate-900 text-white font-bold hover:bg-slate-800 shadow-lg shadow-slate-200',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-500 font-bold'
  };
  
  return (
    <button 
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm transition-all focus:outline-none disabled:pointer-events-none active:scale-95',
        variants[variant],
        className
      )} 
      {...props} 
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl', className)} {...props} />
  );
}

export function Badge({ className, variant = 'neutral', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'neutral' | 'available' | 'occupied' | 'limited' }) {
  const variants = {
    neutral: 'bg-slate-100 text-slate-600',
    available: 'bg-green-500 text-white',
    occupied: 'bg-red-500 text-white',
    limited: 'bg-yellow-500 text-white'
  };
  
  return (
    <span className={cn('inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm', variants[variant], className)} {...props} />
  );
}
