import React, { useEffect, useState } from 'react';
import Select, { type StylesConfig } from 'react-select';
import { X, Search } from 'lucide-react';
import { buildMechanicSearchParams } from '../../utils/mechanicSearch';
import { useNavigate } from 'react-router-dom';

const selectStyles: StylesConfig<{ value: string; label: string }, true> = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 44,
    backgroundColor: 'hsl(var(--background))',
    borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 18%, transparent)' : 'none'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    border: '1px solid hsl(var(--border))',
    zIndex: 9999
  }),
  menuPortal: (base: any) => ({
    ...base,
    zIndex: 9999
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card)))' : 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    cursor: 'pointer'
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--secondary)))'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))',
    fontWeight: 700
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))',
    ':hover': {
      backgroundColor: 'color-mix(in srgb, hsl(var(--destructive)) 20%, transparent)',
      color: 'hsl(var(--destructive))'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  input: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'hsl(var(--muted-foreground))'
  })
};

interface MapFiltersControlProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
  search: string;
  vehicleParams: string[];
  serviceParams: string[];
  radius: number;
  availability: 'All' | 'Available' | 'Not Available';
  routeOption: 'Fastest' | 'Shortest' | 'Avoid Toll';
  vehicleSelectOptions: { value: string; label: string }[];
  serviceSelectOptions: { value: string; label: string }[];
  pendingVehicles: string[];
  setPendingVehicles: (v: string[]) => void;
  pendingServices: string[];
  setPendingServices: (s: string[]) => void;
  syncQuery: (updates: any) => void;
  setRadius: (r: number) => void;
  setAvailability: (a: 'All' | 'Available' | 'Not Available') => void;
  setRouteOption: (o: 'Fastest' | 'Shortest' | 'Avoid Toll') => void;
  filterDragOffset: number;
  handleFilterTouchStart: (e: React.TouchEvent) => void;
  handleFilterTouchMove: (e: React.TouchEvent) => void;
  handleFilterTouchEnd: (e: React.TouchEvent) => void;
}

export function MapFiltersControl({
  showControls,
  setShowControls,
  search,
  vehicleParams,
  serviceParams,
  radius,
  availability,
  routeOption,
  vehicleSelectOptions,
  serviceSelectOptions,
  pendingVehicles,
  setPendingVehicles,
  pendingServices,
  setPendingServices,
  syncQuery,
  setRadius,
  setAvailability,
  setRouteOption,
  filterDragOffset,
  handleFilterTouchStart,
  handleFilterTouchMove,
  handleFilterTouchEnd
}: MapFiltersControlProps) {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    if (showControls) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showControls]);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        syncQuery({ search: localSearch });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search, syncQuery]);

  if (!showControls) return null;

  return (
    <>
      <div className="fixed inset-0 z-[590] bg-black/35 backdrop-blur-[1px] sm:hidden" onClick={() => setShowControls(false)}></div>
      <div
        className="fixed inset-x-0 bottom-0 z-[600] max-h-[78vh] overflow-y-auto rounded-t-[28px] border border-border bg-card p-4 shadow-2xl animate-in slide-in-from-bottom-8 sm:absolute sm:inset-auto sm:top-20 sm:right-4 sm:w-[340px] sm:max-h-[82vh] sm:rounded-2xl sm:slide-in-from-top-4"
        onTouchStart={handleFilterTouchStart}
        onTouchMove={handleFilterTouchMove}
        onTouchEnd={handleFilterTouchEnd}
        style={filterDragOffset !== 0 ? { transform: `translateY(${filterDragOffset}px)` } : undefined}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted sm:hidden"></div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Filters</h3>
          <button 
            onClick={() => setShowControls(false)}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search mechanics..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mb-4 pr-8 rounded-xl border border-border bg-secondary/30 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current Summary</p>
          <p className="mt-1 text-xs text-muted-foreground">{vehicleParams.length > 0 ? `${vehicleParams.length} vehicles` : 'Any vehicle'} • {serviceParams.length > 0 ? `${serviceParams.length} services` : 'Any service'} • {radius === 50000 ? 'Any distance' : `${radius} km`} • {availability}</p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-foreground">Vehicle Type</label>
          <Select
            isMulti
            isSearchable
            placeholder="Select vehicle types"
            options={vehicleSelectOptions}
            value={vehicleSelectOptions.filter((option) => pendingVehicles.includes(option.value))}
            onChange={(selected) => {
              const nextValues = selected.map((option) => option.value);
              setPendingVehicles(nextValues);
              syncQuery({ vehicle: nextValues, service: pendingServices, routeTo: null });
            }}
            className="text-sm"
            classNamePrefix="map-filter-select"
            styles={selectStyles}
            menuPortalTarget={document.body}
          />
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-bold text-foreground">Service Type</label>
          <Select
            isMulti
            isSearchable
            placeholder="Select service types"
            options={serviceSelectOptions}
            value={serviceSelectOptions.filter((option) => pendingServices.includes(option.value))}
            onChange={(selected) => {
              const nextValues = selected.map((option) => option.value);
              setPendingServices(nextValues);
              syncQuery({ vehicle: pendingVehicles, service: nextValues, routeTo: null });
            }}
            className="text-sm"
            classNamePrefix="map-filter-select"
            styles={selectStyles}
            menuPortalTarget={document.body}
          />
        </div>
        <div className="mb-4">
          <p className="font-bold mb-2">Search Radius</p>
          <div className="flex flex-wrap gap-2">
            {[1, 3, 5, 10, 50, 50000].map(r => (
              <button 
                key={r}
                onClick={() => {
                  setRadius(r);
                  syncQuery({ radius: r });
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold ${radius === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                {r === 50000 ? 'Any' : `${r}km`}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="font-bold mb-2">Availability</p>
          <div className="flex gap-2">
            {['All', 'Available', 'Not Available'].map(a => (
              <button 
                key={a}
                onClick={() => {
                  setAvailability(a as any);
                  syncQuery({ availability: a });
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold ${availability === a ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <p className="font-bold mb-2">Route Option</p>
          <div className="flex flex-wrap gap-2">
            {['Fastest', 'Shortest', 'Avoid Toll'].map(r => (
              <button 
                key={r}
                onClick={() => setRouteOption(r as any)}
                className={`px-3 py-1 rounded-full text-xs font-bold ${routeOption === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => {
            setRouteOption('Fastest');
            setRadius(5);
            setAvailability('All');
            setPendingVehicles([]);
            setPendingServices([]);
            navigate(`/map?${buildMechanicSearchParams({ radius: 5, availability: 'All' }).toString()}`, { replace: true });
          }}
          className="w-full mt-6 rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary"
        >
          Reset Controls
        </button>
      </div>
    </>
  );
}
