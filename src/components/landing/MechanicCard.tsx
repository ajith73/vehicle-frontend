import React from 'react';
import { getDistanceFromLatLonInKm } from '../../utils/mechanicUtils';

interface MechanicCardProps {
  mechanic: any;
  userLocation: [number, number] | null;
  navigateToMechanic: (id: number) => void;
}

export function MechanicCard({ mechanic, userLocation, navigateToMechanic }: MechanicCardProps) {
  const distance = userLocation
    ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(mechanic.latitude), parseFloat(mechanic.longitude)).toFixed(1)
    : '?';
  const status = mechanic.currentStatus || 'Available';
  const previewServices = Array.isArray(mechanic.serviceTypes) ? mechanic.serviceTypes.slice(0, 2) : [];

  return (
    <div
      className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
      onClick={() => navigateToMechanic(mechanic.id)}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-2xl">
          {mechanic.image || mechanic.imageUrl
            ? <img src={mechanic.image || mechanic.imageUrl} alt={mechanic.businessName || mechanic.name} className="h-full w-full object-cover" />
            : '🛠️'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="truncate font-bold text-foreground">{mechanic.businessName || mechanic.name}</h4>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Available' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-700'}`}>
              {status}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{distance} km away • {mechanic.area}</p>
          {previewServices.length > 0 && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{previewServices.join(' • ')}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToMechanic(mechanic.id);
          }}
          className="flex-1 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
        >
          View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToMechanic(mechanic.id);
          }}
          className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
        >
          Navigate
        </button>
      </div>
    </div>
  );
}
