import React, { useEffect } from 'react';
import Select from 'react-select';
import { X } from 'lucide-react';
import type { MechanicSort } from '../../utils/mechanicSearch';

const multiSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 48,
    backgroundColor: 'hsl(var(--background))',
    borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 18%, transparent)' : 'none'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    zIndex: 130
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card)))' : 'hsl(var(--card))',
    color: 'hsl(var(--foreground))'
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--secondary)))'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  input: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  })
};

interface ListFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  pendingVehicles: string[];
  setPendingVehicles: (val: string[]) => void;
  pendingServices: string[];
  setPendingServices: (val: string[]) => void;
  radius: number;
  setRadius: (val: number) => void;
  sortBy: MechanicSort;
  setSortBy: (val: MechanicSort) => void;
  vehicleSelectOptions: { value: string; label: string }[];
  serviceSelectOptions: { value: string; label: string }[];
  onReset: () => void;
  onApply: () => void;
}

export function ListFiltersModal({
  isOpen,
  onClose,
  searchQuery,
  pendingVehicles,
  setPendingVehicles,
  pendingServices,
  setPendingServices,
  radius,
  setRadius,
  sortBy,
  setSortBy,
  vehicleSelectOptions,
  serviceSelectOptions,
  onReset,
  onApply
}: ListFiltersModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
      <div className="flex h-full w-full flex-col bg-card shadow-2xl animate-in slide-in-from-bottom-10 sm:h-auto sm:max-w-md sm:rounded-[24px] sm:border sm:border-border sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 p-5">
          <h3 className="text-lg font-bold text-foreground">Filter & Sort</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:max-h-[60vh]">
          <div className="rounded-2xl border border-border bg-secondary/20 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Current Filters</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-foreground">
              <span className="rounded-full bg-card px-3 py-1 border border-border">{searchQuery.trim() ? `Search: ${searchQuery}` : 'No search text'}</span>
              <span className="rounded-full bg-card px-3 py-1 border border-border">{pendingVehicles.length > 0 ? pendingVehicles.join(', ') : 'Any vehicle'}</span>
              <span className="rounded-full bg-card px-3 py-1 border border-border">{pendingServices.length > 0 ? pendingServices.join(', ') : 'Any service'}</span>
              <span className="rounded-full bg-card px-3 py-1 border border-border">{radius} km</span>
              <span className="rounded-full bg-card px-3 py-1 border border-border">{sortBy}</span>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-foreground">Sort By</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('Nearest')}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition-colors ${sortBy === 'Nearest' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
              >
                Nearest
              </button>
              <button
                onClick={() => setSortBy('Available')}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition-colors ${sortBy === 'Available' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
              >
                Available First
              </button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-bold text-foreground">Search Radius</label>
              <span className="text-sm font-bold text-primary">{radius} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-foreground">Vehicle Type</label>
            <Select
              isMulti
              options={vehicleSelectOptions}
              value={vehicleSelectOptions.filter((option) => pendingVehicles.includes(option.value))}
              onChange={(selected) => setPendingVehicles(selected.map((option) => option.value))}
              styles={multiSelectStyles}
              placeholder="Search and select vehicle types..."
              closeMenuOnSelect={false}
            />
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold text-foreground">Service Type</label>
            <Select
              isMulti
              options={serviceSelectOptions}
              value={serviceSelectOptions.filter((option) => pendingServices.includes(option.value))}
              onChange={(selected) => setPendingServices(selected.map((option) => option.value))}
              styles={multiSelectStyles}
              placeholder="Search and select service types..."
              closeMenuOnSelect={false}
            />
          </div>
        </div>

        <div className="border-t border-border/50 bg-muted/10 p-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                onReset();
                onClose();
              }}
              className="flex-1 rounded-xl border border-border bg-secondary/60 py-3 font-bold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
            >
              Reset
            </button>
            <button
              onClick={() => {
                onApply();
                onClose();
              }}
              className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
