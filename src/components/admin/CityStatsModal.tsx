import { X, MapPin } from 'lucide-react';
import type { DetailedCityStat } from '../../types';

interface CityStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cityStats: DetailedCityStat[];
}

export function CityStatsModal({ isOpen, onClose, cityStats }: CityStatsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col border border-border animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">All Cities Statistics</h2>
            <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of vehicles and services across all active cities</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityStats.map((city) => (
              <div key={city.name} className="bg-muted/30 rounded-xl border border-border overflow-hidden">
                <div className="p-4 bg-muted/50 border-b border-border flex justify-between items-center">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {city.name}
                  </h3>
                  <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {city.total} Mechanics
                  </span>
                </div>
                
                <div className="p-4 space-y-4">
                  {/* Vehicles Section */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Vehicles</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                      {Object.entries(city.vehicleTypes)
                        .sort((a, b) => b[1] - a[1])
                        .map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm">
                          <span className="text-foreground">{type}</span>
                          <span className="font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-md text-xs border border-border">{count}</span>
                        </div>
                      ))}
                      {Object.keys(city.vehicleTypes).length === 0 && (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>

                  {/* Services Section */}
                  <div>
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Services</h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                      {Object.entries(city.serviceTypes)
                        .sort((a, b) => b[1] - a[1])
                        .map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center text-sm">
                          <span className="text-foreground truncate mr-2" title={type}>{type}</span>
                          <span className="font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-md text-xs border border-border shrink-0">{count}</span>
                        </div>
                      ))}
                      {Object.keys(city.serviceTypes).length === 0 && (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {cityStats.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No city statistics available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
