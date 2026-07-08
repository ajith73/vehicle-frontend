import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike, Truck, Bus, Wrench, Droplets, BatteryWarning, ShieldAlert, Navigation, Zap, Search, MapPin, Tractor, Fan, Wind, Battery, Settings, Link as LinkIcon, Thermometer, AlertTriangle, Activity, Fuel, Key, Circle, AlignJustify, Scale, Disc, Sun, Moon, Star, Map, Compass, ChevronDown, ChevronUp, Edit2, Map as MapIcon2 } from 'lucide-react';
import axios from 'axios';
import { API_URL, apiClient } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';
import { MapLocationPicker } from '../components/MapLocationPicker';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const VEHICLE_ICONS: Record<string, any> = {
  'Auto': Zap,
  'Bike': Bike,
  'Bus': Bus,
  'Car': Car,
  'Crane': Tractor,
  'Earth Mover': Tractor,
  'Electric Bike': Zap,
  'Electric Car': Zap,
  'JCB': Tractor,
  'Pickup': Truck,
  'SUV': Car,
  'Scooter': Bike,
  'Tractor': Tractor,
  'Truck': Truck,
  'Van': Truck
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


// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2 - lat1) * (Math.PI / 180);
  var dLon = (lon2 - lon1) * (Math.PI / 180);
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c; 
  return d;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const { userLocation, locationName, setLocation, searchQuery, isLoading } = useLocationContext();
  
  // Local search query for the input bar (syncs with context initially)
  const [localSearch, setLocalSearch] = useState('');
  
  // Dynamic options
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false);

  // Manual location popup state
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (searchQuery) setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vData, sData] = await Promise.all([
          apiClient<any>('/public/vehicles'),
          apiClient<any>('/public/services')
        ]);
        setVehicles(vData);
        setServices(sData);
      } catch (err) {
        console.error('Failed to load settings options', err);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // City suggestions for popup
  useEffect(() => {
    if (locationInput.length > 2) {
      const delayFn = setTimeout(() => {
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationInput)}`)
          .then(res => res.data)
          .then(data => {
            if (Array.isArray(data)) {
              setLocationSuggestions(data.map((item: any) => ({
                matching_full_name: item.display_name,
                lat: item.lat,
                lon: item.lon
              })));
            }
          })
          .catch(err => console.error('Geocoding API error', err));
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setLocationSuggestions([]);
    }
  }, [locationInput]);

  // City suggestions for center search
  const [centerSearchSuggestions, setCenterSearchSuggestions] = useState<any[]>([]);
  useEffect(() => {
    if (localSearch.length > 2 && localSearch !== locationName) {
      const delayFn = setTimeout(() => {
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localSearch)}`)
          .then(res => res.data)
          .then(data => {
            if (Array.isArray(data)) {
              setCenterSearchSuggestions(data.map((item: any) => ({
                matching_full_name: item.display_name,
                lat: item.lat,
                lon: item.lon
              })));
            }
          })
          .catch(err => console.error('Geocoding API error', err));
      }, 500);
      return () => clearTimeout(delayFn);
    } else {
      setCenterSearchSuggestions([]);
    }
  }, [localSearch, locationName]);

  // Fetch Nearby Mechanics
  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const data = await apiClient<any>(`/public/mechanics?vehicleType=${selectedVehicle}&serviceType=${selectedService}`);
        
        let filtered = data;
        
        // If we have search query, filter by it (city, area, name)
        if (localSearch && localSearch !== 'Current Location') {
          filtered = filtered.filter((m: any) => 
            (m.businessName || m.name || '').toLowerCase().includes(localSearch.toLowerCase()) || 
            (m.area || '').toLowerCase().includes(localSearch.toLowerCase()) ||
            (m.city || '').toLowerCase().includes(localSearch.toLowerCase())
          );
        }

        // Sort by distance if user location is available
        if (userLocation) {
          filtered.sort((a: any, b: any) => {
            const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(a.latitude), parseFloat(a.longitude));
            const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(b.latitude), parseFloat(b.longitude));
            return distA - distB;
          });
        }
        
        // Take top 50 (or whatever fits in UI)
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

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-20 sm:pb-0">
      
      {/* 1. Hero Section */}
      <div className="relative pt-6 pb-12 px-4 sm:px-8 bg-card border-b border-border shadow-sm flex flex-col items-center text-center">
        {/* User Greeting & Location */}
        <div className="w-full max-w-3xl mx-auto flex flex-wrap justify-between items-center gap-3 mb-8 relative z-20">
          <div className="flex items-center gap-2 shrink-0">
            {new Date().getHours() >= 18 || new Date().getHours() < 5 ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            <span className="font-bold text-foreground text-base sm:text-lg">{getGreeting()}, User</span>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-full border border-border cursor-pointer hover:bg-secondary/80 transition-colors shrink-0 max-w-full" onClick={() => setShowLocationPopup(true)}>
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-muted-foreground truncate">{locationName}</span>
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground ml-1 hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <h2 className="text-4xl sm:text-6xl font-black text-foreground mb-4 tracking-tight">
            Get Back on the <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Road Faster</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl font-medium mb-8 max-w-xl mx-auto">
            Find the nearest expert mechanics for any vehicle, instantly.
          </p>
          
          <div className="relative max-w-md mx-auto w-full mt-6 flex gap-2">
            <div className="relative flex-1 group z-50">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search area, city..." 
                className="w-full pl-12 pr-12 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 text-[16px] font-medium shadow-sm transition-all relative z-20"
              />
              <button 
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-colors z-30"
              >
                <Navigation className="w-5 h-5" />
              </button>
              
              {/* Dropdown for center search suggestions */}
              {centerSearchSuggestions.length > 0 && (
                <div className="absolute top-[110%] left-0 right-0 bg-card border border-border rounded-xl shadow-2xl max-h-60 overflow-y-auto z-[60] custom-scrollbar">
                  {centerSearchSuggestions.map((sugg, idx) => {
                    const cityName = sugg.matching_full_name.split(',')[0];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setLocation([parseFloat(sugg.lat), parseFloat(sugg.lon)], cityName);
                          setLocalSearch(cityName);
                          setCenterSearchSuggestions([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/10 text-sm font-medium border-b border-border last:border-0 transition-colors text-foreground flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-primary shrink-0" /> {sugg.matching_full_name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button 
              onClick={() => setLocalSearch(locationName)}
              title="Use Current Location"
              className="bg-primary/10 text-primary p-4 rounded-2xl border-2 border-primary/20 hover:bg-primary/20 hover:border-primary/40 transition-colors flex items-center justify-center shrink-0 shadow-sm"
            >
              <Compass className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
        
      {/* 1.5. Vehicle Type Row */}
      <div className="pt-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
          <Car className="text-primary w-6 h-6" /> Select Vehicle
        </h3>
        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="flex sm:grid sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 pb-2 overflow-x-auto snap-x hide-scrollbar">
          {isLoadingOptions ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex-none w-24 sm:w-full h-20 md:h-24 rounded-2xl bg-secondary/50 animate-pulse border-2 border-border/50 shrink-0"></div>
            ))
          ) : (
            <>
              <button
                onClick={() => setSelectedVehicle('')}
                className={`flex-none w-24 sm:w-full flex flex-col items-center justify-center h-20 md:h-24 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 snap-start ${
                  selectedVehicle === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <Zap className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">All</span>
              </button>
          {vehicles
            .filter(v => showAllVehicles || v.isFeatured || (!showAllVehicles && vehicles.every(vi => !vi.isFeatured)))
            .map(v => {
            const Icon = getVehicleIcon(v.name);
            return (
              <button
                key={v.name}
                onClick={() => setSelectedVehicle(v.name)}
                className={`flex-none w-24 sm:w-full flex flex-col items-center justify-center h-20 md:h-24 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 snap-start ${
                  selectedVehicle === v.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-center leading-tight px-1">{v.name}</span>
              </button>
            );
          })}
          {vehicles.some(v => v.isFeatured) && vehicles.some(v => !v.isFeatured) && (
            <button
              onClick={() => setShowAllVehicles(!showAllVehicles)}
              className="flex-none w-24 sm:w-full flex flex-col items-center justify-center h-20 md:h-24 rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground hover:text-primary hover:border-primary/50 transition-all snap-start"
            >
              {showAllVehicles ? <ChevronUp className="w-6 h-6 mb-1" /> : <ChevronDown className="w-6 h-6 mb-1" />}
              <span className="text-[11px] sm:text-xs font-bold text-center leading-tight px-1">{showAllVehicles ? 'Show Less' : 'Show More'}</span>
            </button>
          )}
            </>
          )}
        </div>
      </div>

      {/* 2. Services Row */}
      <div className="pt-8 pb-4 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
          <Wrench className="text-primary w-6 h-6" /> Select Service
        </h3>
        {/* Mobile: Horizontal Scroll, Desktop: Grid */}
        <div className="flex sm:grid sm:grid-cols-5 md:grid-cols-7 gap-2 sm:gap-3 pb-2 overflow-x-auto snap-x hide-scrollbar">
          {isLoadingOptions ? (
            Array(7).fill(0).map((_, i) => (
              <div key={i} className="flex-none w-24 sm:w-full h-20 md:h-24 rounded-2xl bg-secondary/50 animate-pulse border-2 border-border/50 shrink-0"></div>
            ))
          ) : (
            <>
              <button
                onClick={() => setSelectedService('')}
                className={`flex-none w-24 sm:w-full flex flex-col items-center justify-center h-20 md:h-24 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 snap-start ${
                  selectedService === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <Zap className="w-6 h-6 mb-1" />
                <span className="text-xs font-bold">All</span>
              </button>
          {services
            .filter(s => showAllServices || s.isFeatured || (!showAllServices && services.every(si => !si.isFeatured)))
            .map(s => {
            const Icon = getServiceIcon(s.name);
            return (
              <button
                key={s.name}
                onClick={() => setSelectedService(s.name)}
                className={`flex-none w-24 sm:w-full flex flex-col items-center justify-center h-20 md:h-24 rounded-2xl border-2 transition-all hover:scale-[1.02] active:scale-95 snap-start ${
                  selectedService === s.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[11px] sm:text-xs font-bold text-center leading-tight px-1">{s.name}</span>
              </button>
            );
          })}
          {services.some(s => s.isFeatured) && services.some(s => !s.isFeatured) && (
            <button
              onClick={() => setShowAllServices(!showAllServices)}
              className="flex-none w-24 sm:w-full flex flex-col items-center justify-center h-20 md:h-24 rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground hover:text-primary hover:border-primary/50 transition-all snap-start"
            >
              {showAllServices ? <ChevronUp className="w-6 h-6 mb-1" /> : <ChevronDown className="w-6 h-6 mb-1" />}
              <span className="text-[11px] sm:text-xs font-bold text-center leading-tight px-1">{showAllServices ? 'Show Less' : 'Show More'}</span>
            </button>
          )}
            </>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-8 mt-6 max-w-3xl mx-auto w-full">
        <button 
          onClick={() => navigate(`/map?search=${encodeURIComponent(searchQuery)}&vehicle=${selectedVehicle}&service=${selectedService}`)}
          className="w-full py-5 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          <Map className="w-6 h-6" />
          Find Mechanics Now
        </button>
      </div>

      {/* 4. Popular Services */}
      <div className="pt-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
            <Star className="text-yellow-500 w-6 h-6" /> Popular Services
          </h3>
          <button onClick={() => navigate('/list')} className="text-sm font-bold text-primary hover:underline">See All</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['Engine Repair', 'Battery Replacement', 'Tyre Replacement', 'Oil Change'].map(s => {
            const Icon = getServiceIcon(s);
            return (
              <div key={s} onClick={() => navigate(`/list?service=${s}`)} className="bg-card border border-border p-4 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm text-center">{s}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Nearby Mechanics */}
      <div className="pt-10 pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-xl text-foreground flex items-center gap-2">
            <Map className="text-green-500 w-6 h-6" /> Nearby Mechanics
          </h3>
          <button onClick={() => navigate('/list?useLocation=true')} className="text-sm font-bold text-primary hover:underline">View Map</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
           {nearbyMechanics.length > 0 ? nearbyMechanics.slice(0, 5).map((mechanic) => {
             const distance = userLocation ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(mechanic.latitude), parseFloat(mechanic.longitude)).toFixed(1) : '?';
             return (
               <div key={mechanic.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/list?search=${encodeURIComponent(mechanic.businessName || mechanic.name)}`)}>
                 <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                   {mechanic.imageUrl ? <img src={mechanic.imageUrl} alt={mechanic.businessName} className="w-full h-full object-cover" /> : '🛠️'}
                 </div>
                 <div className="min-w-0 flex-1">
                   <h4 className="font-bold text-foreground truncate">{mechanic.businessName || mechanic.name}</h4>
                   <p className="text-xs text-muted-foreground mt-1 truncate">{distance} km away • {mechanic.area}</p>
                 </div>
               </div>
             );
           }) : (
             <div className="col-span-full py-8 text-center text-muted-foreground">
               No mechanics found in this area for the selected filters.
             </div>
           )}
        </div>
      </div>

      {/* 6. Essential Stations (Quick Find) */}
      <div className="pt-2 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <h3 className="font-bold text-xl text-foreground flex items-center gap-2 mb-4">
          <Activity className="text-blue-500 w-6 h-6" /> Essential Stations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button 
            onClick={() => window.open('https://www.google.com/maps/search/fuel+station+near+me', '_blank')}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <Fuel className="w-7 h-7" />
            </div>
            <span className="font-bold text-foreground">Fuel Station ⛽</span>
          </button>
          
          <button 
            onClick={() => window.open('https://www.google.com/maps/search/ev+charging+station+near+me', '_blank')}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <span className="font-bold text-foreground">EV Charging Station ⚡</span>
          </button>
          
          <button 
            onClick={() => window.open('https://www.google.com/maps/search/puc+center+near+me', '_blank')}
            className="bg-card border border-border rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <span className="font-bold text-foreground">PUC Station 🛡️</span>
          </button>
        </div>
      </div>

      {showLocationPopup && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center sm:p-4">
          <div className="bg-card sm:border sm:border-border shadow-xl sm:rounded-2xl p-6 w-full h-full sm:h-auto sm:max-w-md relative flex flex-col justify-center">
            <h3 className="text-xl font-black mb-2 text-primary">Where are you located?</h3>
            <p className="text-sm text-muted-foreground mb-6">We couldn't detect your location automatically. Please enter your city to find mechanics near you.</p>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter city name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                autoFocus
              />
              {locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg max-h-60 overflow-y-auto z-10 custom-scrollbar">
                  {locationSuggestions.map((sugg, idx) => {
                    const cityName = sugg.matching_full_name.split(',')[0];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setLocation([parseFloat(sugg.lat), parseFloat(sugg.lon)], cityName);
                          setShowLocationPopup(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-primary/10 text-sm font-medium border-b border-border last:border-0 transition-colors"
                      >
                        {sugg.matching_full_name}
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
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
              >
                <MapIcon2 className="w-5 h-5" /> 📍 Choose on Map
              </button>
              
              <div className="flex justify-end">
                <button 
                  onClick={() => setShowLocationPopup(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-secondary/80 transition-colors"
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
            setLocation(coords, name);
            setShowMapPicker(false);
          }}
        />
      )}

    </div>
  );
}
