import { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, MapPin, Edit2, AlertTriangle, Search, Navigation, Compass, Star, Map as MapIcon, Loader2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { searchPlaces, type PlaceSuggestion } from '../api/geocoding';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { useLocationContext } from '../contexts/LocationContext';
import { useDataContext } from '../contexts/DataContext';
import { getServiceIcon } from '../utils/iconUtils';
import { getDistanceFromLatLonInKm, getMechanicStatus } from '../utils/mechanicUtils';
import { VehicleSelector } from '../components/landing/VehicleSelector';
import { ServiceSelector } from '../components/landing/ServiceSelector';
import { MechanicCard } from '../components/landing/MechanicCard';
import { InfoSections } from '../components/landing/InfoSections';
import { LocationPopup } from '../components/shared/LocationPopup';
import { MechanicCardSkeleton } from '../components/landing/MechanicCardSkeleton';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';


const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const {
    userLocation,
    locationName,
    setLocation,
    searchQuery,
    isLoading,
    locationSource,
    locationMessage,
    requestLocation
  } = useLocationContext();

  const [localSearch, setLocalSearch] = useState('');
  const { vehicles, services, isLoadingData } = useDataContext();
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [isLocationMessageExpanded, setIsLocationMessageExpanded] = useState(true);
  const [centerSearchSuggestions, setCenterSearchSuggestions] = useState<PlaceSuggestion[]>([]);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [isFetchingMechanics, setIsFetchingMechanics] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setCenterSearchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locationBadge = isLoading
    ? { label: 'Detecting location...', classes: 'border-primary/30 bg-primary/10 text-primary', isLoading: true }
    : locationSource === 'geolocation'
      ? { label: 'Precise location', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700', isLoading: false }
      : locationSource === 'ip'
        ? { label: 'Approximate location', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-700', isLoading: false }
        : locationSource === 'manual'
          ? { label: 'Manual location', classes: 'border-blue-500/30 bg-blue-500/10 text-blue-700', isLoading: false }
          : { label: 'Location unavailable', classes: 'border-border bg-secondary/60 text-muted-foreground', isLoading: false };

  const popularServices = (services.filter((service) => service.isFeatured).slice(0, 5).length > 0
    ? services.filter((service) => service.isFeatured).slice(0, 4)
    : services.slice(0, 4));

  useEffect(() => {
    if (searchQuery) setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isLoadingData) return;
    setIsLoadingOptions(false);
  }, [isLoadingData]);

  useEffect(() => {
    if (locationMessage) {
      setIsLocationMessageExpanded(true);
      const timer = setTimeout(() => {
        setIsLocationMessageExpanded(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [locationMessage]);

  useEffect(() => {
    if (localSearch.length <= 2 || localSearch === locationName) {
      setCenterSearchSuggestions([]);
      return;
    }

    const delayFn = setTimeout(() => {
      searchPlaces(localSearch)
        .then((data) => setCenterSearchSuggestions(data))
        .catch((err) => console.error('Geocoding API error', err));
    }, 500);

    return () => clearTimeout(delayFn);
  }, [localSearch, locationName]);

  useEffect(() => {
    const fetchMechanics = async () => {
      setIsFetchingMechanics(true);
      setFetchError(false);
      try {
        const searchParam = locationName === 'Current Location' ? '' : locationName;
        const data = await apiClient<any>(`/public/mechanics?vehicleType=${selectedVehicle}&serviceType=${selectedService}&search=${encodeURIComponent(searchParam)}`);

        let filtered = data.map((mechanic: any) => ({
          ...mechanic,
          currentStatus: getMechanicStatus(mechanic)
        }));

        if (userLocation) {
          filtered.sort((a: any, b: any) => {
            const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(a.latitude), parseFloat(a.longitude));
            const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(b.latitude), parseFloat(b.longitude));
            return distA - distB;
          });
        }

        setNearbyMechanics(filtered.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch nearby mechanics', err);
        setFetchError(true);
        toast.error('Failed to load nearby mechanics.');
      } finally {
        setIsFetchingMechanics(false);
      }
    };

    const delayFn = setTimeout(() => {
      if (!isLoading) {
        fetchMechanics();
      }
    }, 500);

    return () => clearTimeout(delayFn);
  }, [selectedVehicle, selectedService, userLocation, locationName, isLoading]);

  const handleSearch = () => {
    navigate(`/list?search=${encodeURIComponent(localSearch)}&vehicle=${selectedVehicle}&service=${selectedService}`);
  };

  const handleFindMechanicsNow = () => {
    navigate(`/map?search=${encodeURIComponent(localSearch)}&vehicle=${selectedVehicle}&service=${selectedService}`);
  };

  const navigateToMechanic = (mechanicId: number) => {
    navigate(`/map?vehicle=${selectedVehicle}&service=${selectedService}&routeTo=${mechanicId}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative pb-20 sm:pb-0">
      <div className="relative flex flex-col items-center border-b border-border bg-card px-4 pt-6 pb-12 text-center shadow-sm sm:px-8">
        <div className="relative z-20 mb-6 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            {new Date().getHours() >= 18 || new Date().getHours() < 5
              ? <Moon className="h-5 w-5 text-indigo-400" />
              : <Sun className="h-5 w-5 text-yellow-500" />}
            <span className="text-base font-bold text-foreground sm:text-lg">{getGreeting()}, User</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex max-w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setShowLocationPopup(true)}
              aria-label="Change location"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">{locationName}</span>
              <Edit2 className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-primary" />
            </button>

            {/* Mobile Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-border bg-secondary/50 text-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="relative z-20 mb-6 flex flex-col items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${locationBadge.classes}`}>
            {locationBadge.isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span>{locationBadge.label}</span>
          </div>
          {locationMessage && (
            <button 
              onClick={() => !isLocationMessageExpanded && setIsLocationMessageExpanded(true)}
              className={`mx-auto flex max-w-2xl gap-3 rounded-2xl border border-amber-500/30 bg-card/90 px-4 py-3 text-left shadow-sm backdrop-blur transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isLocationMessageExpanded ? 'items-start cursor-default' : 'items-center cursor-pointer hover:bg-card w-fit'}`}
              aria-label={isLocationMessageExpanded ? "Location alert" : "Expand location alert"}
            >
              <AlertTriangle className={`${isLocationMessageExpanded ? 'mt-0.5' : ''} h-4 w-4 shrink-0 text-amber-600`} />
              
              {isLocationMessageExpanded ? (
                <div className="min-w-0 flex-1 animate-in fade-in duration-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm text-muted-foreground">{locationMessage}</p>
                  {locationSource !== 'geolocation' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Try device location
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0 animate-in fade-in duration-300">
                  {locationSource !== 'geolocation' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                      className="shrink-0 text-sm font-bold text-primary hover:underline"
                    >
                      Enable device location
                    </button>
                  )}
                </div>
              )}
            </button>
          )}
        </div>

        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20"></div>
        <div className="relative z-10 w-full max-w-3xl">
          <h2 className="mb-4 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            Get Back on the <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Road Faster</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg font-medium text-muted-foreground sm:text-xl">
            Find the nearest expert mechanics for any vehicle, instantly.
          </p>

          <div className="relative mx-auto mt-6 flex w-full max-w-md gap-2" ref={searchDropdownRef}>
            <div className="relative z-50 flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search area, city..."
                className="relative z-20 w-full rounded-2xl border-2 border-border bg-background py-4 pl-12 pr-12 text-[16px] font-medium shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-xl bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Navigation className="h-5 w-5" />
              </button>

              {centerSearchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[110%] z-[60] max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl custom-scrollbar">
                  {centerSearchSuggestions.map((suggestion, idx) => {
                    const cityName = suggestion.name.split(',')[0];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setLocation([suggestion.lat, suggestion.lon], cityName, 'manual');
                          setLocalSearch(cityName);
                          setCenterSearchSuggestions([]);
                        }}
                        className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors last:border-0 hover:bg-primary/10"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        {suggestion.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={() => setLocalSearch(locationName)}
              title="Use Current Location"
              className="flex shrink-0 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 p-4 text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/20"
            >
              <Compass className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <VehicleSelector 
        vehicles={vehicles} 
        isLoadingOptions={isLoadingOptions} 
        selectedVehicle={selectedVehicle} 
        setSelectedVehicle={setSelectedVehicle} 
      />

      <ServiceSelector 
        services={services} 
        isLoadingOptions={isLoadingOptions} 
        selectedService={selectedService} 
        setSelectedService={setSelectedService} 
      />

      <div className="mx-auto mt-6 w-full max-w-3xl px-4 sm:px-8">
        <button
          onClick={handleFindMechanicsNow}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-lg font-black text-primary-foreground shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1 hover:bg-primary/90 active:translate-y-0"
        >
          <MapIcon className="h-6 w-6" />
          Find Mechanics Now
        </button>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Star className="h-6 w-6 text-yellow-500" /> Popular Services
          </h3>
          <button onClick={() => navigate('/list')} className="text-sm font-bold text-primary hover:underline">See All</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {popularServices.map((service) => {
            const Icon = getServiceIcon(service.name);
            return (
              <button
                key={service.id || service.name}
                onClick={() => navigate(`/list?service=${encodeURIComponent(service.name)}`)}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`Search mechanics for ${service.name}`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-center text-sm font-bold">{service.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-12 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MapIcon className="h-6 w-6 text-green-500" /> Nearby Mechanics
          </h3>
          <button onClick={() => navigate(`/map?vehicle=${selectedVehicle}&service=${selectedService}`)} className="text-sm font-bold text-primary hover:underline">View Map</button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {isFetchingMechanics ? (
            Array.from({ length: 3 }).map((_, i) => <MechanicCardSkeleton key={i} />)
          ) : fetchError ? (
            <div className="col-span-full rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-3" />
              <p className="text-base font-bold text-red-600 dark:text-red-400">Failed to load nearby mechanics.</p>
              <p className="mt-2 text-sm text-red-500/80">Please check your connection and try again.</p>
              <button
                onClick={() => {
                  setSelectedService('');
                }}
                className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500/20"
              >
                Reset Filters
              </button>
            </div>
          ) : nearbyMechanics.length > 0 ? (
            nearbyMechanics.slice(0, 5).map((mechanic) => (
              <MechanicCard 
                key={mechanic.id} 
                mechanic={mechanic} 
                userLocation={userLocation} 
                navigateToMechanic={navigateToMechanic} 
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-border bg-card px-6 py-8 text-center">
              <p className="text-base font-bold text-foreground">No nearby mechanics found for the current filters.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing the selected service, switching vehicle type, or choosing a different location to widen the search.
              </p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setSelectedService('');
                    setSelectedVehicle('');
                    setLocalSearch('');
                  }}
                  className="rounded-xl border border-border bg-secondary/70 px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowLocationPopup(true)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Change Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <InfoSections />

      <LocationPopup 
        isOpen={showLocationPopup} 
        onClose={() => setShowLocationPopup(false)} 
        setLocation={(coords, name, source) => {
          setLocation(coords, name, source);
          setLocalSearch(name);
        }} 
        setShowMapPicker={setShowMapPicker} 
      />

      {showMapPicker && (
        <MapLocationPicker
          initialLocation={userLocation}
          onClose={() => setShowMapPicker(false)}
          onSelect={(coords, name) => {
            setLocation(coords, name, 'manual');
            setLocalSearch(name);
            setShowMapPicker(false);
          }}
        />
      )}


      
      <footer className="py-6 text-center text-sm font-semibold text-muted-foreground mt-4 border-t border-border/50">
        © 2026 RoadResQ. All Rights Reserved.
      </footer>
    </div>
  );
}
