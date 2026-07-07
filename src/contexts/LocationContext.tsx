import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface LocationContextType {
  userLocation: [number, number] | null;
  locationName: string;
  searchQuery: string;
  setLocation: (coords: [number, number] | null, name: string) => void;
  requestLocation: () => Promise<void>;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState('Current Location');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);

  const setLocation = (coords: [number, number] | null, name: string) => {
    setUserLocation(coords);
    setLocationName(name);
    setSearchQuery(name);
  };

  const fetchIpLocation = async () => {
    try {
      const res = await axios.get('https://get.geojs.io/v1/ip/geo.json');
      const data = res.data;
      if (data && data.city) {
        setLocation([parseFloat(data.latitude), parseFloat(data.longitude)], data.city);
      }
    } catch (err) {
      console.warn('IP location fetch failed', err);
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
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = res.data;
            const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.state_district || 'Your Location';
            setLocation([lat, lon], city);
            setIsLoading(false);
          } catch (err) {
            console.error('Failed to get location name', err);
            await fetchIpLocation();
          }
        },
        async () => {
          console.warn('Could not get geolocation, falling back to IP');
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
    <LocationContext.Provider value={{ userLocation, locationName, searchQuery, setLocation, requestLocation, isLoading }}>
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
