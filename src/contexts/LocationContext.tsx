import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { reverseGeocodeName } from '../api/geocoding';

export type LocationSource = 'geolocation' | 'ip' | 'manual' | 'none';

interface LocationContextType {
  userLocation: [number, number] | null;
  locationName: string;
  searchQuery: string;
  setLocation: (coords: [number, number] | null, name: string, source?: LocationSource) => void;
  requestLocation: () => Promise<void>;
  isLoading: boolean;
  locationSource: LocationSource;
  locationMessage: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState('Current Location');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [locationSource, setLocationSource] = useState<LocationSource>('none');
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const setLocation = (coords: [number, number] | null, name: string, source: LocationSource = 'manual') => {
    setUserLocation(coords);
    setLocationName(name);
    setSearchQuery(name);
    setLocationSource(source);
    setLocationMessage(
      source === 'manual'
        ? 'Using the location you selected manually. You can switch back to device location anytime.'
        : null
    );
  };

  const fetchIpLocation = async () => {
    try {
      const res = await axios.get('https://get.geojs.io/v1/ip/geo.json');
      const data = res.data;
      if (data && data.city) {
        setLocation([parseFloat(data.latitude), parseFloat(data.longitude)], data.city, 'ip');
        setLocationMessage('Using an approximate network-based location. Enable device location for more accurate nearby results and routing.');
      } else {
        setLocationSource('none');
        setLocationMessage('Location access is unavailable. You can still browse mechanics, but nearby distances and routing may be less accurate.');
      }
    } catch (err) {
      console.warn('IP location fetch failed', err);
      setLocationSource('none');
      setLocationMessage('We could not determine your location automatically. You can still browse mechanics, but nearby distances and routing may be unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            const city = await reverseGeocodeName([lat, lon]);
            setLocation([lat, lon], city, 'geolocation');
            setLocationMessage(null);
            setIsLoading(false);
          } catch (err) {
            console.error('Failed to get location name', err);
            await fetchIpLocation();
          }
        },
        async () => {
          console.warn('Could not get geolocation, falling back to IP');
          setLocationMessage('Location permission was denied or unavailable. Falling back to an approximate network-based location.');
          await fetchIpLocation();
        },
        { timeout: 10000 }
      );
    } else {
      await fetchIpLocation();
    }
  };

  useEffect(() => {
    if (!hasRequested) {
      setHasRequested(true);
      requestLocation();
    }
  }, [hasRequested]);

  return (
    <LocationContext.Provider value={{ userLocation, locationName, searchQuery, setLocation, requestLocation, isLoading, locationSource, locationMessage }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
