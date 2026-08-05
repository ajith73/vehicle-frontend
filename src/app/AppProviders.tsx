import type { ReactNode } from 'react';
import { LocationProvider } from '../contexts/LocationContext';
import { DataProvider } from '../contexts/DataContext';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <DataProvider>
        <LocationProvider>{children}</LocationProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
