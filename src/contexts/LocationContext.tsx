import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import { reverseGeocodeName } from '../api/geocoding';

export type LocationSource = 'geolocation' | 'ip' | 'manual' | 'none';

interface LocationContextType {
  userLocation: [number, number] | null;
  locationName: string;
  searchQuery: string;
  setLocation: (coords: [number, number] | null, name: string, source?: LocationSource) => void;
  requestLocation: (showToast?: boolean) => Promise<void>;
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
    setLocationMessage(null);
  };

  const fetchIpLocation = async () => {
    try {
      const res = await axios.get('https://get.geojs.io/v1/ip/geo.json');
      const data = res.data;
      if (data && data.city) {
        setLocation([parseFloat(data.latitude), parseFloat(data.longitude)], data.city, 'ip');
        setLocationMessage('Approximate location used');
      } else {
        setLocationSource('none');
        setLocationMessage('Location unavailable');
      }
    } catch (err) {
      console.warn('IP location fetch failed', err);
      setLocationSource('none');
      setLocationMessage('Could not determine location.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async (showToast = false) => {
    if (showToast) {
       setIsLoading(true);
       try {
         const permission = await navigator.permissions.query({ name: 'geolocation' });
         if (permission.state === 'denied') {
           import('react-hot-toast').then(({ default: toast }) => {
             toast.error('Location is blocked in your browser settings. Please enable it to use device location.');
           });
           setIsLoading(false);
           return;
         }
       } catch (e) {
         // permissions API not supported in all browsers
       }
    } else {
       setIsLoading(true);
    }

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
          setLocationMessage('Location denied. Using approximate.');
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
