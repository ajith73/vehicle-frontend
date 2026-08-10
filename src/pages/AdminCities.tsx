import { useEffect, useState } from 'react';
import { MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import type { DetailedCityStat } from '../types';
import toast from 'react-hot-toast';

export default function AdminCities() {
  const navigate = useNavigate();
  const [cityStats, setCityStats] = useState<DetailedCityStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await authApi.getDashboardStats();
        setCityStats(statsData.detailedCityStats || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load city statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">City Statistics</h1>
            <p className="text-muted-foreground mt-1 font-medium">Detailed breakdown of vehicles and services across all active cities</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cityStats.map((city) => (
            <div key={city.name} className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 bg-muted/30 border-b border-border flex justify-between items-center gap-4">
                <h3 className="font-bold text-foreground flex items-center gap-2 text-lg min-w-0">
                  <MapPin className="w-5 h-5 text-primary shrink-0" />
                  <span className="truncate">{city.name}</span>
                </h3>
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full shrink-0">
                  {city.total} Mechanics
                </span>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Vehicles Section */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    Vehicles
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(city.vehicleTypes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center bg-background/50 rounded-lg p-2 border border-border/50">
                        <span className="text-sm font-medium text-foreground">{type}</span>
                        <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{count}</span>
                      </div>
                    ))}
                    {Object.keys(city.vehicleTypes).length === 0 && (
                      <div className="text-muted-foreground text-sm italic p-2">No vehicle data available</div>
                    )}
                  </div>
                </div>

                <hr className="border-border/50" />

                {/* Services Section */}
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    Services
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(city.serviceTypes)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center bg-background/50 rounded-lg p-2 border border-border/50">
                        <span className="text-sm font-medium text-foreground">{type}</span>
                        <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{count}</span>
                      </div>
                    ))}
                    {Object.keys(city.serviceTypes).length === 0 && (
                      <div className="text-muted-foreground text-sm italic p-2">No service data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {cityStats.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground bg-card rounded-2xl border border-dashed border-border">
              No city statistics available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
