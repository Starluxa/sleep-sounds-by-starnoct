'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Sound Card Skeleton Component
export function SoundCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

// Mix Card Skeleton Component
export function MixCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-3" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8 rounded-full flex-1" />
          <Skeleton className="h-8 w-8 rounded-full flex-1" />
          <Skeleton className="h-8 w-8 rounded-full flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-current border-t-transparent text-primary`}
      />
    </div>
  );
}

// Page Loading Overlay Component
export function PageLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <LoadingSpinner size="lg" />
        <span className="mt-4 text-lg font-medium text-foreground">Loading...</span>
      </div>
    </div>
  );
}