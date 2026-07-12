import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  AlignJustify,
  ArrowRight,
  Battery,
  BatteryWarning,
  Bike,
  Bus,
  Car,
  ChevronDown,
  ChevronUp,
  Circle,
  Compass,
  Disc,
  Droplets,
  Edit2,
  Fan,
  Fuel,
  Key,
  Link as LinkIcon,
  Map,
  Map as MapIcon2,
  MapPin,
  Moon,
  Navigation,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  Star,
  Sun,
  Thermometer,
  Tractor,
  Truck,
  Wind,
  Wrench,
  Zap
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { searchPlaces, type PlaceSuggestion } from '../api/geocoding';
import { MapLocationPicker } from '../components/MapLocationPicker';
import { useLocationContext } from '../contexts/LocationContext';

const MechanicSubmissionModal = lazy(() => import('../components/MechanicSubmissionModal'));

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const VEHICLE_ICONS: Record<string, any> = {
  Auto: Zap,
  Bike,
  Bus,
  Car,
  Crane: Tractor,
  'Earth Mover': Tractor,
  'Electric Bike': Zap,
  'Electric Car': Zap,
  JCB: Tractor,
  Pickup: Truck,
  SUV: Car,
  Scooter: Bike,
  Tractor,
  Truck,
  Van: Truck
};

const SERVICE_ICONS: Record<string, any> = {
  'AC Repair': Fan,
  'Accident Recovery': ShieldAlert,
  'Air Filter Replacement': Wind,
  'Battery Jumpstart': BatteryWarning,
  'Battery Replacement': Battery,
  'Brake Service': Disc,
  'Chain Adjustment': LinkIcon,
  'Clutch Repair': Disc,
  'Coolant Top-up': Thermometer,
  'Electrical Repair': Zap,
  'Emergency Breakdown': AlertTriangle,
  'Engine Diagnostics': Activity,
  'Engine Repair': Wrench,
  'Fuel Delivery': Fuel,
  'General Service': Settings,
  'Jump Start': BatteryWarning,
  'Key Lockout Assistance': Key,
  'Oil Change': Droplets,
  'Puncture Repair': Circle,
  'Spark Plug Replacement': Zap,
  'Suspension Repair': Settings,
  'Towing Services': Truck,
  'Tyre Replacement': Circle,
  'Wheel Alignment': AlignJustify,
  'Wheel Balancing': Scale
};

const getVehicleIcon = (name: string) => VEHICLE_ICONS[name] || Navigation;
const getServiceIcon = (name: string) => SERVICE_ICONS[name] || Wrench;

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const getMechanicStatus = (mechanic: any) => {
  if (mechanic.currentStatus) return mechanic.currentStatus;
  if (mechanic.availability === false) return 'Closed';
  return 'Available';
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
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showMechanicSubmissionModal, setShowMechanicSubmissionModal] = useState(false);
  const [isLocationMessageExpanded, setIsLocationMessageExpanded] = useState(true);
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [centerSearchSuggestions, setCenterSearchSuggestions] = useState<PlaceSuggestion[]>([]);

  const locationBadge = locationSource === 'geolocation'
    ? { label: 'Precise location', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700' }
    : locationSource === 'ip'
      ? { label: 'Approximate location', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-700' }
      : locationSource === 'manual'
        ? { label: 'Manual location', classes: 'border-blue-500/30 bg-blue-500/10 text-blue-700' }
        : { label: 'Location unavailable', classes: 'border-border bg-secondary/60 text-muted-foreground' };

  const popularServices = (services.filter((service) => service.isFeatured).slice(0, 4).length > 0
    ? services.filter((service) => service.isFeatured).slice(0, 4)
    : services.slice(0, 4));

  useEffect(() => {
    if (searchQuery) setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vehicleData, serviceData] = await Promise.all([
          apiClient<any>('/public/vehicles'),
          apiClient<any>('/public/services')
        ]);
        setVehicles(vehicleData);
        setServices(serviceData);
      } catch (err) {
        console.error('Failed to load settings options', err);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchOptions();
  }, []);

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
    if (locationInput.length <= 2) {
      setLocationSuggestions([]);
      return;
    }

    const delayFn = setTimeout(() => {
      searchPlaces(locationInput)
        .then((data) => setLocationSuggestions(data))
        .catch((err) => console.error('Geocoding API error', err));
    }, 500);

    return () => clearTimeout(delayFn);
  }, [locationInput]);

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
      try {
        const data = await apiClient<any>(`/public/mechanics?vehicleType=${selectedVehicle}&serviceType=${selectedService}`);

        let filtered = data.map((mechanic: any) => ({
          ...mechanic,
          currentStatus: getMechanicStatus(mechanic)
        }));

        if (localSearch && localSearch !== 'Current Location') {
          filtered = filtered.filter((mechanic: any) =>
            (mechanic.businessName || mechanic.name || '').toLowerCase().includes(localSearch.toLowerCase()) ||
            (mechanic.area || '').toLowerCase().includes(localSearch.toLowerCase()) ||
            (mechanic.city || '').toLowerCase().includes(localSearch.toLowerCase())
          );
        }

        if (userLocation) {
          filtered.sort((a: any, b: any) => {
            const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(a.latitude), parseFloat(a.longitude));
            const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(b.latitude), parseFloat(b.longitude));
            return distA - distB;
          });
        }

        setNearbyMechanics(filtered.slice(0, 50));
      } catch (err) {
        console.error('Failed to fetch nearby mechanics', err);
      }
    };

    if (!isLoading) {
      fetchMechanics();
    }
  }, [selectedVehicle, selectedService, userLocation, localSearch, isLoading]);

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
          <div
            className="flex max-w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary/80"
            onClick={() => setShowLocationPopup(true)}
          >
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">{locationName}</span>
            <Edit2 className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-primary" />
          </div>
        </div>

        <div className="relative z-20 mb-6 flex flex-col items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${locationBadge.classes}`}>
            <MapPin className="h-3.5 w-3.5" />
            <span>{locationBadge.label}</span>
          </div>
          {locationMessage && (
            <div 
              onClick={() => !isLocationMessageExpanded && setIsLocationMessageExpanded(true)}
              className={`mx-auto flex max-w-2xl gap-3 rounded-2xl border border-amber-500/30 bg-card/90 px-4 py-3 text-left shadow-sm backdrop-blur transition-all duration-300 ${isLocationMessageExpanded ? 'items-start cursor-default' : 'items-center cursor-pointer hover:bg-card w-fit'}`}
            >
              <AlertTriangle className={`${isLocationMessageExpanded ? 'mt-0.5' : ''} h-4 w-4 shrink-0 text-amber-600`} />
              
              {isLocationMessageExpanded ? (
                <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                  <p className="text-sm text-muted-foreground">{locationMessage}</p>
                  {locationSource !== 'geolocation' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                      className="mt-2 text-sm font-bold text-primary hover:underline"
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
            </div>
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

          <div className="relative mx-auto mt-6 flex w-full max-w-md gap-2">
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

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Car className="h-6 w-6 text-primary" /> Select Vehicle
        </h3>
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-5 sm:gap-3 md:grid-cols-6">
          {isLoadingOptions ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-20 w-24 shrink-0 rounded-2xl border-2 border-border/50 bg-secondary/50 animate-pulse sm:h-24 sm:w-full"></div>
            ))
          ) : (
            <>
              <button
                onClick={() => setSelectedVehicle('')}
                className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                  selectedVehicle === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <Zap className="mb-1 h-6 w-6" />
                <span className="text-xs font-bold">All</span>
              </button>
              {vehicles
                .filter((vehicle) => showAllVehicles || vehicle.isFeatured || (!showAllVehicles && vehicles.every((item) => !item.isFeatured)))
                .map((vehicle) => {
                  const Icon = getVehicleIcon(vehicle.name);
                  return (
                    <button
                      key={vehicle.name}
                      onClick={() => setSelectedVehicle(vehicle.name)}
                      className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                        selectedVehicle === vehicle.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <Icon className="mb-1 h-6 w-6" />
                      <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{vehicle.name}</span>
                    </button>
                  );
                })}
              {vehicles.some((vehicle) => vehicle.isFeatured) && vehicles.some((vehicle) => !vehicle.isFeatured) && (
                <button
                  onClick={() => setShowAllVehicles(!showAllVehicles)}
                  className="flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:text-primary sm:h-24 sm:w-full"
                >
                  {showAllVehicles ? <ChevronUp className="mb-1 h-6 w-6" /> : <ChevronDown className="mb-1 h-6 w-6" />}
                  <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{showAllVehicles ? 'Show Less' : 'Show More'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-4 sm:px-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Wrench className="h-6 w-6 text-primary" /> Select Service
        </h3>
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-5 sm:gap-3 md:grid-cols-7">
          {isLoadingOptions ? (
            Array(7).fill(0).map((_, i) => (
              <div key={i} className="h-20 w-24 shrink-0 rounded-2xl border-2 border-border/50 bg-secondary/50 animate-pulse sm:h-24 sm:w-full"></div>
            ))
          ) : (
            <>
              <button
                onClick={() => setSelectedService('')}
                className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                  selectedService === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <Zap className="mb-1 h-6 w-6" />
                <span className="text-xs font-bold">All</span>
              </button>
              {services
                .filter((service) => showAllServices || service.isFeatured || (!showAllServices && services.every((item) => !item.isFeatured)))
                .map((service) => {
                  const Icon = getServiceIcon(service.name);
                  return (
                    <button
                      key={service.name}
                      onClick={() => setSelectedService(service.name)}
                      className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                        selectedService === service.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <Icon className="mb-1 h-6 w-6" />
                      <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{service.name}</span>
                    </button>
                  );
                })}
              {services.some((service) => service.isFeatured) && services.some((service) => !service.isFeatured) && (
                <button
                  onClick={() => setShowAllServices(!showAllServices)}
                  className="flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:text-primary sm:h-24 sm:w-full"
                >
                  {showAllServices ? <ChevronUp className="mb-1 h-6 w-6" /> : <ChevronDown className="mb-1 h-6 w-6" />}
                  <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{showAllServices ? 'Show Less' : 'Show More'}</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mx-auto mt-6 w-full max-w-3xl px-4 sm:px-8">
        <button
          onClick={handleFindMechanicsNow}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-lg font-black text-primary-foreground shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1 hover:bg-primary/90 active:translate-y-0"
        >
          <Map className="h-6 w-6" />
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {popularServices.map((service) => {
            const Icon = getServiceIcon(service.name);
            return (
              <div
                key={service.id || service.name}
                onClick={() => navigate(`/list?service=${encodeURIComponent(service.name)}`)}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:bg-secondary/30"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-center text-sm font-bold">{service.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-12 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Map className="h-6 w-6 text-green-500" /> Nearby Mechanics
          </h3>
          <button onClick={() => navigate(`/map?vehicle=${selectedVehicle}&service=${selectedService}`)} className="text-sm font-bold text-primary hover:underline">View Map</button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {nearbyMechanics.length > 0 ? nearbyMechanics.slice(0, 5).map((mechanic) => {
            const distance = userLocation
              ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(mechanic.latitude), parseFloat(mechanic.longitude)).toFixed(1)
              : '?';
            const status = mechanic.currentStatus || 'Available';
            const previewServices = Array.isArray(mechanic.serviceTypes) ? mechanic.serviceTypes.slice(0, 2) : [];

            return (
              <div
                key={mechanic.id}
                className="cursor-pointer rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                onClick={() => navigateToMechanic(mechanic.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary text-2xl">
                    {mechanic.image || mechanic.imageUrl
                      ? <img src={mechanic.image || mechanic.imageUrl} alt={mechanic.businessName || mechanic.name} className="h-full w-full object-cover" />
                      : '🛠️'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="truncate font-bold text-foreground">{mechanic.businessName || mechanic.name}</h4>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${status === 'Available' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-700'}`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{distance} km away • {mechanic.area}</p>
                    {previewServices.length > 0 && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">{previewServices.join(' • ')}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToMechanic(mechanic.id);
                    }}
                    className="flex-1 rounded-xl border border-border bg-secondary/70 px-3 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToMechanic(mechanic.id);
                    }}
                    className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Navigate
                  </button>
                </div>
              </div>
            );
          }) : (
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
      
      {/* Support Us Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-2 pb-10 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-rose-500/5 shadow-sm">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">Support Us</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Help keep our platform running</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Your donations directly fund our server and domain maintenance costs. By contributing, you help us keep this vital emergency roadside assistance network completely free and available 24/7 for everyone who needs it.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">Make a contribution</p>
              <p className="text-sm text-muted-foreground">
                Any amount you provide goes a long way toward keeping our services online without interruptions.
              </p>
              <button
                onClick={() => navigate('/donate')}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-rose-700"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-2 pb-16 sm:px-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Activity className="h-6 w-6 text-blue-500" /> Essential Stations
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => window.open('https://www.google.com/maps/search/fuel+station+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110">
              <Fuel className="h-7 w-7" />
            </div>
            <span className="font-bold text-foreground">Fuel Station ⛽</span>
          </button>

          <button
            onClick={() => window.open('https://www.google.com/maps/search/ev+charging+station+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
              <Zap className="h-7 w-7" />
            </div>
            <span className="font-bold text-foreground">EV Charging Station ⚡</span>
          </button>

          <button
            onClick={() => window.open('https://www.google.com/maps/search/puc+center+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <span className="font-bold text-foreground">PUC Station 🛡️</span>
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/30 shadow-sm">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Mechanic / Service Provider</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Create a new listing or update your existing record</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                If you are a mechanic, workshop, towing partner, or roadside service provider, you can submit your details here.
                Search your current record first, or create a new request if you are not listed yet.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">What happens next?</p>
              <p className="text-sm text-muted-foreground">
                Your submission goes to the Super Admin for review before it becomes live or updates the current listing.
              </p>
              <button
                onClick={() => setShowMechanicSubmissionModal(true)}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create or Update Record
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-card to-purple-500/5 shadow-sm">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">About Us</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Bridging the gap in emergency assistance</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Discover why we built this platform, how we solve problems for stranded drivers in minutes, and our core mission to empower local mechanics and increase their revenue.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <button
                onClick={() => navigate('/about')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-purple-700 shadow-[0_8px_30px_rgba(147,51,234,0.3)] hover:-translate-y-1 active:translate-y-0"
              >
                Read Our Story <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLocationPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm sm:p-4">
          <div className="relative flex h-full w-full flex-col justify-center bg-card p-6 shadow-xl sm:h-auto sm:max-w-md sm:rounded-2xl sm:border sm:border-border">
            <h3 className="mb-2 text-xl font-black text-primary">Where are you located?</h3>
            <p className="mb-6 text-sm text-muted-foreground">Choose a city or pin your area on the map to improve nearby results and routing.</p>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter city name..."
                className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
              {locationSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-2 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-lg custom-scrollbar">
                  {locationSuggestions.map((suggestion, idx) => {
                    const cityName = suggestion.name.split(',')[0];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setLocation([suggestion.lat, suggestion.lon], cityName, 'manual');
                          setShowLocationPopup(false);
                        }}
                        className="w-full border-b border-border px-4 py-3 text-left text-sm font-medium transition-colors last:border-0 hover:bg-primary/10"
                      >
                        {suggestion.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowLocationPopup(false);
                  setShowMapPicker(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <MapIcon2 className="h-5 w-5" /> 📍 Choose on Map
              </button>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowLocationPopup(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors hover:bg-secondary/80"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMapPicker && (
        <MapLocationPicker
          initialLocation={userLocation}
          onClose={() => setShowMapPicker(false)}
          onSelect={(coords, name) => {
            setLocation(coords, name, 'manual');
            setShowMapPicker(false);
          }}
        />
      )}

      <Suspense fallback={null}>
        <MechanicSubmissionModal
          isOpen={showMechanicSubmissionModal}
          onClose={() => setShowMechanicSubmissionModal(false)}
        />
      </Suspense>
    </div>
  );
}
