import React from 'react';
import { Phone, Navigation } from 'lucide-react';
import { getDistanceFromLatLonInKm, getEstimatedTimeFromDistance } from '../../utils/mechanicUtils';
import toast from 'react-hot-toast';
import { LazyImage } from '../shared/LazyImage';

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
      className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
      onClick={() => navigateToMechanic(mechanic.id)}
    >
      <div className="flex items-center gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-2xl">
          {mechanic.image || mechanic.imageUrl
            ? <LazyImage src={mechanic.image || mechanic.imageUrl} alt={mechanic.businessName || mechanic.name} />
            : '🛠️'}
            
          {mechanic.verificationLevel > 0 && (
            <div className="absolute top-0 left-0 bg-blue-600 text-white rounded-br-lg p-0.5 shadow-md flex items-center justify-center z-10" title={`Verified Level ${mechanic.verificationLevel}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
          )}
          {(mechanic.rating || mechanic.rating > 0) ? (
            <div className="absolute bottom-0 right-0 bg-black/80 backdrop-blur-sm text-white rounded-tl-lg px-1.5 py-0.5 shadow-md flex items-center gap-0.5 z-10">
              <span className="text-[10px] font-bold leading-none">{mechanic.rating}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <h4 className="truncate font-bold text-foreground">
                {mechanic.businessName || mechanic.name}
              </h4>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Available' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-700'}`}>
              {status}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{distance} km away • {distance !== '?' ? getEstimatedTimeFromDistance(parseFloat(distance)) : '?'}{mechanic.area ? ` • ${mechanic.area}` : ''}</p>
          {previewServices.length > 0 && (
            <p className="mt-1 truncate text-xs text-muted-foreground">{previewServices.join(' • ')}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <a
          href={mechanic.phone ? `tel:${mechanic.phone}` : '#'}
          onClick={(e) => {
            e.stopPropagation();
            if (!mechanic.phone) {
              e.preventDefault();
              toast.error('Phone number not available');
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-bold text-foreground transition-all hover:bg-secondary active:scale-95"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigateToMechanic(mechanic.id);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 shadow-sm hover:shadow-md hover:shadow-primary/20"
        >
          <Navigation className="h-4 w-4" />
          Navigate
        </button>
      </div>
    </div>
  );
}
