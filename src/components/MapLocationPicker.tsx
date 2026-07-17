import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, X, Navigation, Check, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { reverseGeocodeName, searchPlaces } from '../api/geocoding';

// Custom Map Marker Icon
const customIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative w-10 h-10 flex items-center justify-center text-primary drop-shadow-md -translate-y-2">
           <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
         </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

interface MapLocationPickerProps {
  initialLocation?: [number, number] | null;
  onSelect: (coords: [number, number], addressName: string) => void;
  onClose: () => void;
}

// Component to handle clicks on map
const MapClickHandler = ({ setCoords }: { setCoords: (c: [number, number]) => void }) => {
  useMapEvents({
    click(e) {
      setCoords([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// Component to auto-center map
const MapCenterer = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
};

export function MapLocationPicker({ initialLocation, onSelect, onClose }: MapLocationPickerProps) {
  // Default to London or somewhere generic if no initial location
  const [coords, setCoords] = useState<[number, number]>(initialLocation || [51.505, -0.09]);
  const [addressName, setAddressName] = useState<string>('Selected Location');
  const [isGeocoding, setIsGeocoding] = useState(false);
  
  const [searchInput, setSearchInput] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchInput.length > 2) {
      const timeout = setTimeout(() => {
        searchPlaces(searchInput)
          .then((data) => {
            setSearchSuggestions(data);
          })
          .catch(err => console.error('Geocoding search error', err));
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchInput]);

  useEffect(() => {
    // Reverse geocode when coords change
    const fetchAddress = async () => {
      setIsGeocoding(true);
      try {
        setAddressName(await reverseGeocodeName(coords));
      } catch (err) {
        setAddressName('Pinned Location');
      } finally {
        setIsGeocoding(false);
      }
    };
    
    // Add a tiny debounce to avoid API spam while dragging
    const timeout = setTimeout(fetchAddress, 500);
    return () => clearTimeout(timeout);
  }, [coords]);

  const handleConfirm = () => {
    onSelect(coords, addressName);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center sm:p-4">
      <div className="bg-card sm:border sm:border-border shadow-2xl sm:rounded-2xl w-full h-full sm:max-w-2xl sm:h-[80vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary w-5 h-5" />
            <h3 className="font-bold text-lg">Pinpoint your location</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-secondary/20">
          
          {/* Map Search Overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-[500]" ref={dropdownRef}>
            <div className="relative bg-background rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border flex items-center px-4 py-3">
              <Search className="w-5 h-5 text-primary mr-3 shrink-0" />
              <input 
                type="text" 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search place, city, or area..." 
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold placeholder:font-medium placeholder:text-muted-foreground"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(''); setSearchSuggestions([]); }} className="ml-2 text-muted-foreground hover:text-primary transition-colors shrink-0 p-1 bg-secondary rounded-full">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            
            {searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl max-h-56 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {searchSuggestions.map((sugg, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCoords([sugg.lat, sugg.lon]);
                      setSearchInput('');
                      setSearchSuggestions([]);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-primary/10 text-sm font-medium border-b border-border last:border-0 transition-colors flex items-start gap-2 group"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity" /> 
                    <span className="truncate flex-1 text-foreground">{sugg.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <MapContainer center={coords} zoom={14} className="w-full h-full z-0">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              className="dark:brightness-75 dark:contrast-125 dark:invert dark:hue-rotate-180 transition-all duration-300"
            />
            <Marker 
              position={coords} 
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  setCoords([position.lat, position.lng]);
                }
              }}
            />
            <MapClickHandler setCoords={setCoords} />
            <MapCenterer coords={coords} />
          </MapContainer>

          {/* Locate Me Button Overlay */}
          <button 
            onClick={handleLocateMe}
            className="absolute bottom-6 right-6 z-[400] bg-background border border-border shadow-lg p-3 rounded-full hover:bg-secondary transition-colors"
            title="Use Current Location"
          >
            <Navigation className="w-5 h-5 text-primary" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="text-primary w-5 h-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Selected Location</span>
              <span className="font-bold text-sm truncate max-w-[200px]">
                {isGeocoding ? 'Locating...' : addressName}
              </span>
            </div>
          </div>
          <button 
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Check className="w-5 h-5" /> Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
