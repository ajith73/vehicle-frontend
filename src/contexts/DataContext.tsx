import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../api/apiClient';

interface DataContextType {
  vehicles: any[];
  services: any[];
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

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
    <DataContext.Provider value={{ vehicles, services, isLoadingData, refreshData: fetchData }}>
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
