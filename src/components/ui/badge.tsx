import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#C8102E] text-white',
        secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
        success: 'bg-green-100 text-green-800 border border-green-200',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        danger: 'bg-red-100 text-red-800 border border-red-200',
        destructive: 'bg-red-600 text-white',
        outline: 'border-2 border-[#C8102E] text-[#C8102E]',
        dark: 'bg-[#2A2F3A] text-white',
        live: 'bg-red-600 text-white animate-pulse',
        gold: 'bg-yellow-400 text-yellow-900 border border-yellow-500',
        silver: 'bg-gray-300 text-gray-800 border border-gray-400',
        bronze: 'bg-orange-300 text-orange-900 border border-orange-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
