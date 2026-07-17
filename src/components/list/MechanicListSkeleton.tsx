import React from 'react';

export function MechanicListSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-border/60 bg-card p-4 shadow-sm sm:p-5 animate-pulse">
      <div className="flex gap-4">
        {/* Image Placeholder */}
        <div className="h-24 w-24 shrink-0 rounded-2xl bg-secondary/50 sm:h-28 sm:w-28" />
        
        {/* Details Placeholder */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <div className="h-5 w-3/4 rounded-md bg-secondary/50" />
              <div className="h-6 w-14 shrink-0 rounded-lg bg-secondary/50" />
            </div>
            <div className="mt-2 h-4 w-full rounded-md bg-secondary/50" />
            <div className="mt-1 h-4 w-4/5 rounded-md bg-secondary/50" />
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <div className="h-5 w-16 rounded bg-secondary/50" />
            <div className="h-5 w-14 rounded bg-secondary/50" />
            <div className="h-5 w-20 rounded bg-secondary/50" />
          </div>
        </div>
      </div>

      {/* Buttons Placeholder */}
      <div className="flex gap-2.5 border-t border-border/40 pt-3">
        <div className="h-11 flex-1 rounded-xl bg-secondary/50" />
        <div className="h-11 flex-1 rounded-xl bg-secondary/50" />
        <div className="h-11 flex-[1.2] rounded-xl bg-secondary/50" />
      </div>
    </div>
  );
}
