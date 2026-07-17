import React from 'react';

export function MechanicCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm animate-pulse">
      <div className="flex items-center gap-4">
        {/* Image placeholder */}
        <div className="h-16 w-16 shrink-0 rounded-xl bg-secondary/80"></div>
        
        <div className="min-w-0 flex-1">
          {/* Title and badge placeholder */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="h-4 w-3/4 rounded-md bg-secondary/80"></div>
            <div className="h-4 w-12 shrink-0 rounded-full bg-secondary/80"></div>
          </div>
          
          {/* Distance/Area placeholder */}
          <div className="h-3 w-1/2 rounded-md bg-secondary/60 mb-2"></div>
          
          {/* Services placeholder */}
          <div className="h-3 w-2/3 rounded-md bg-secondary/60"></div>
        </div>
      </div>
      
      {/* Buttons placeholder */}
      <div className="mt-4 flex gap-2">
        <div className="flex-1 h-9 rounded-xl bg-secondary/70"></div>
        <div className="flex-1 h-9 rounded-xl bg-primary/20"></div>
      </div>
    </div>
  );
}
