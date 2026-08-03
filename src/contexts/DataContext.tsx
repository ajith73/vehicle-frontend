import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../api/apiClient';

interface DataContextType {
  vehicles: any[];
  services: any[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
  cachedMechanics: any[] | null;
  cachedMechanicsTotalCount: number;
  cachedMechanicsParams: string | null;
  setCachedMechanicsData: (data: any[], totalCount: number, params: string) => void;
  cachedMapMechanics: any[] | null;
  cachedMapMechanicsParams: string | null;
  setCachedMapMechanicsData: (data: any[], params: string) => void;
  cachedLandingMechanics: any[] | null;
  cachedLandingMechanicsParams: string | null;
  setCachedLandingMechanicsData: (data: any[], params: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [cachedMechanics, setCachedMechanics] = useState<any[] | null>(null);
  const [cachedMechanicsTotalCount, setCachedMechanicsTotalCount] = useState<number>(0);
  const [cachedMechanicsParams, setCachedMechanicsParams] = useState<string | null>(null);
  
  const [cachedMapMechanics, setCachedMapMechanics] = useState<any[] | null>(null);
  const [cachedMapMechanicsParams, setCachedMapMechanicsParams] = useState<string | null>(null);

  const [cachedLandingMechanics, setCachedLandingMechanics] = useState<any[] | null>(null);
  const [cachedLandingMechanicsParams, setCachedLandingMechanicsParams] = useState<string | null>(null);

  const setCachedMechanicsData = (data: any[], totalCount: number, params: string) => {
    setCachedMechanics(data);
    setCachedMechanicsTotalCount(totalCount);
    setCachedMechanicsParams(params);
  };

  const setCachedMapMechanicsData = (data: any[], params: string) => {
    setCachedMapMechanics(data);
    setCachedMapMechanicsParams(params);
  };

  const setCachedLandingMechanicsData = (data: any[], params: string) => {
    setCachedLandingMechanics(data);
    setCachedLandingMechanicsParams(params);
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [vData, sData] = await Promise.all([
        apiClient<any>('/public/vehicles'),
        apiClient<any>('/public/services')
      ]);
      setVehicles(vData);
      setServices(sData);
    } catch (err) {
      console.error('Failed to fetch vehicles and services:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ 
      vehicles, 
      services, 
      isLoadingData, 
      refreshData: fetchData,
      cachedMechanics,
      cachedMechanicsTotalCount,
      cachedMechanicsParams,
      setCachedMechanicsData,
      cachedMapMechanics,
      cachedMapMechanicsParams,
      setCachedMapMechanicsData,
      cachedLandingMechanics,
      cachedLandingMechanicsParams,
      setCachedLandingMechanicsData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
