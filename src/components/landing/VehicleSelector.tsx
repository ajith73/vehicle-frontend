import React, { useState } from 'react';
import { Zap, ChevronUp, ChevronDown, Car } from 'lucide-react';
import autoRickshaw from '../../assets/vehicles/autoRickshaw.png';
import bike from '../../assets/vehicles/bike.png';
import bus from '../../assets/vehicles/bus.png';
import car from '../../assets/vehicles/car.png';
import crane from '../../assets/vehicles/crane.png';
import earthMover from '../../assets/vehicles/earthMover.png';
import electricBike from '../../assets/vehicles/electricBike.png';
import electricCar from '../../assets/vehicles/electricCar.png';
import jcb from '../../assets/vehicles/jcb.png';
import pickup from '../../assets/vehicles/pickup.png';
import scooter from '../../assets/vehicles/scooter.png';
import suv from '../../assets/vehicles/suv.png';
import tractor from '../../assets/vehicles/tractor.png';
import truck from '../../assets/vehicles/truck.png';
import van from '../../assets/vehicles/van.png';

const VEHICLE_IMAGES: Record<string, string> = {
  'Auto': autoRickshaw,
  'Bike': bike,
  'Bus': bus,
  'Car': car,
  'Crane': crane,
  'Earth Mover': earthMover,
  'Electric Bike': electricBike,
  'Electric Car': electricCar,
  'JCB': jcb,
  'Pickup': pickup,
  'SUV': suv,
  'Scooter': scooter,
  'Tractor': tractor,
  'Truck': truck,
  'Van': van,
};

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
              <Zap className="mb-2 h-8 w-8 sm:h-10 sm:w-10 text-current" />
              <span className="text-xs font-bold">All</span>
            </button>
            {vehicles
              .filter((vehicle) => showAllVehicles || vehicle.isFeatured || (!showAllVehicles && vehicles.every((item) => !item.isFeatured)))
              .map((vehicle) => {
                const imageSrc = VEHICLE_IMAGES[vehicle.name] || car;
                return (
                  <button
                    key={vehicle.name}
                    onClick={() => setSelectedVehicle(vehicle.name)}
                    className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                      selectedVehicle === vehicle.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <img src={imageSrc} alt={vehicle.name} className="mb-2 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
                    <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{vehicle.name}</span>
                  </button>
                );
              })}
            {vehicles.some((vehicle) => vehicle.isFeatured) && vehicles.some((vehicle) => !vehicle.isFeatured) && (
              <button
                onClick={() => setShowAllVehicles(!showAllVehicles)}
                className="flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:text-primary sm:h-24 sm:w-full"
              >
                {showAllVehicles ? <ChevronUp className="mb-2 h-8 w-8 sm:h-10 sm:w-10" /> : <ChevronDown className="mb-2 h-8 w-8 sm:h-10 sm:w-10" />}
                <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{showAllVehicles ? 'Show Less' : 'Show More'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
