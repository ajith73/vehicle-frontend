import React, { useState } from 'react';
import { Car, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { getVehicleIcon } from '../../utils/iconUtils';

interface VehicleSelectorProps {
  vehicles: any[];
  isLoadingOptions: boolean;
  selectedVehicle: string;
  setSelectedVehicle: (val: string) => void;
}

export function VehicleSelector({ vehicles, isLoadingOptions, selectedVehicle, setSelectedVehicle }: VehicleSelectorProps) {
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-8">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
        <Car className="h-6 w-6 text-primary" /> Select Vehicle
      </h3>
      <div className="flex snap-x gap-2 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-5 sm:gap-3 md:grid-cols-6">
        {isLoadingOptions ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-20 w-24 shrink-0 rounded-2xl border-2 border-border/50 bg-secondary/50 animate-pulse sm:h-24 sm:w-full"></div>
          ))
        ) : (
          <>
            <button
              onClick={() => setSelectedVehicle('')}
              className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                selectedVehicle === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <Zap className="mb-1 h-6 w-6" />
              <span className="text-xs font-bold">All</span>
            </button>
            {vehicles
              .filter((vehicle) => showAllVehicles || vehicle.isFeatured || (!showAllVehicles && vehicles.every((item) => !item.isFeatured)))
              .map((vehicle) => {
                const Icon = getVehicleIcon(vehicle.name);
                return (
                  <button
                    key={vehicle.name}
                    onClick={() => setSelectedVehicle(vehicle.name)}
                    className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                      selectedVehicle === vehicle.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="mb-1 h-6 w-6" />
                    <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{vehicle.name}</span>
                  </button>
                );
              })}
            {vehicles.some((vehicle) => vehicle.isFeatured) && vehicles.some((vehicle) => !vehicle.isFeatured) && (
              <button
                onClick={() => setShowAllVehicles(!showAllVehicles)}
                className="flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:text-primary sm:h-24 sm:w-full"
              >
                {showAllVehicles ? <ChevronUp className="mb-1 h-6 w-6" /> : <ChevronDown className="mb-1 h-6 w-6" />}
                <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{showAllVehicles ? 'Show Less' : 'Show More'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
