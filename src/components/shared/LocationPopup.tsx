import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Map as MapIcon2 } from 'lucide-react';
import { searchPlaces, type PlaceSuggestion } from '../../api/geocoding';

interface LocationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  setLocation: (coords: [number, number], name: string, source: 'manual') => void;
  setShowMapPicker: (val: boolean) => void;
}

export function LocationPopup({ isOpen, onClose, setLocation, setShowMapPicker }: LocationPopupProps) {
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLocationSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (locationInput.length <= 2) {
      setLocationSuggestions([]);
      return;
    }

    const delayFn = setTimeout(() => {
      searchPlaces(locationInput)
        .then((data) => setLocationSuggestions(data))
        .catch((err) => console.error('Geocoding API error', err));
    }, 500);

    return () => clearTimeout(delayFn);
  }, [locationInput]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-full w-full flex-col justify-center bg-card p-6 shadow-xl sm:h-auto sm:max-w-md sm:rounded-2xl sm:border sm:border-border">
        <h3 className="mb-2 text-xl font-black text-primary">Where are you located?</h3>
        <p className="mb-6 text-sm text-muted-foreground">Choose a city or pin your area on the map to improve nearby results and routing.</p>
        <div className="relative" ref={dropdownRef}>
          <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Enter city name..."
            className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            autoFocus
          />
          {locationSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-lg custom-scrollbar">
              {locationSuggestions.map((suggestion, idx) => {
                const cityName = suggestion.name.split(',')[0];
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setLocation([suggestion.lat, suggestion.lon], cityName, 'manual');
                      onClose();
                    }}
                    className="w-full border-b border-border px-4 py-3 text-left text-sm font-medium transition-colors last:border-0 hover:bg-primary/10"
                  >
                    {suggestion.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => {
              onClose();
              setShowMapPicker(true);
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-bold text-primary transition-colors hover:bg-primary/20"
          >
            <MapIcon2 className="h-5 w-5" /> 📍 Choose on Map
          </button>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary/80"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
