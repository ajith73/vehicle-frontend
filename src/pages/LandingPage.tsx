import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Bike, Truck, Bus, Wrench, Droplets, BatteryWarning, ShieldAlert, Navigation, Zap, Search, SlidersHorizontal, MapPin, Phone, MessageCircle, ExternalLink, X } from 'lucide-react';

const VEHICLES = [
  { name: 'Bike', icon: Bike },
  { name: 'Car', icon: Car },
  { name: 'Auto', icon: Zap },
  { name: 'Truck', icon: Truck },
  { name: 'Bus', icon: Bus },
  { name: 'Other', icon: Navigation }
];

const SERVICES = [
  { name: 'Puncture', icon: Droplets },
  { name: 'Battery', icon: BatteryWarning },
  { name: 'Engine Issue', icon: Wrench },
  { name: 'Fuel Delivery', icon: Droplets },
  { name: 'Towing', icon: Truck },
  { name: 'Accident Help', icon: ShieldAlert },
  { name: 'Other', icon: Navigation }
];

// Helper to calculate distance
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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

  const handleSearch = () => {
    navigate(`/list?vehicle=${selectedVehicle}&service=${selectedService}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-20 sm:pb-0">
      
      {/* 1. Hero Section */}
      <div className="relative pt-12 pb-16 px-4 sm:px-8 bg-card border-b border-border shadow-sm overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <h2 className="text-4xl sm:text-6xl font-black text-foreground mb-4 tracking-tight">
            Get Back on the <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Road Faster</span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl font-medium mb-8 max-w-xl mx-auto">
            Find the nearest expert mechanics for any vehicle, instantly.
          </p>
          
          <div className="relative max-w-md mx-auto w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search area, city, or mechanic..." 
              className="w-full pl-12 pr-4 py-4 bg-background border-2 border-border rounded-2xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 text-base font-medium shadow-sm transition-all"
              onClick={() => navigate('/list')}
            />
            <button 
              onClick={() => navigate('/list')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Navigation className="w-5 h-5" />
            </button>
          </div>
          <div className="max-w-md mx-auto w-full mt-3 flex justify-center">
            <button 
              onClick={() => navigate('/list?useLocation=true')}
              className="flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
            >
              <MapPin className="w-4 h-4" /> Use Current Location
            </button>
          </div>
        </div>
      </div>
        
      {/* 1.5. Vehicle Type Row */}
      <div className="pt-10 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
          <Car className="text-primary w-6 h-6" /> Select Vehicle
        </h3>
        {/* Mobile: Swipeable, Desktop: Grid */}
        <div className="flex md:grid md:grid-cols-6 gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2">
          <button
            onClick={() => setSelectedVehicle('')}
            className={`snap-start shrink-0 flex flex-col items-center justify-center w-24 h-28 md:w-full md:h-32 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedVehicle === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            <Zap className="w-8 h-8 mb-3" />
            <span className="text-xs sm:text-sm font-bold">All</span>
          </button>
          {VEHICLES.map(v => (
            <button
              key={v.name}
              onClick={() => setSelectedVehicle(v.name)}
              className={`snap-start shrink-0 flex flex-col items-center justify-center w-24 h-28 md:w-full md:h-32 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                selectedVehicle === v.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <v.icon className="w-8 h-8 mb-3" />
              <span className="text-xs sm:text-sm font-bold text-center leading-tight px-1">{v.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Services Row */}
      <div className="pt-8 pb-4 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <h3 className="font-bold text-xl mb-4 text-foreground flex items-center gap-2">
          <Wrench className="text-primary w-6 h-6" /> Select Service
        </h3>
        <div className="flex md:grid md:grid-cols-7 gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-2">
          <button
            onClick={() => setSelectedService('')}
            className={`snap-start shrink-0 flex flex-col items-center justify-center w-24 h-28 md:w-full md:h-32 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
              selectedService === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            <Zap className="w-8 h-8 mb-3" />
            <span className="text-xs sm:text-sm font-bold">All</span>
          </button>
          {SERVICES.map(s => (
            <button
              key={s.name}
              onClick={() => setSelectedService(s.name)}
              className={`snap-start shrink-0 flex flex-col items-center justify-center w-24 h-28 md:w-full md:h-32 rounded-3xl border-2 transition-all hover:scale-[1.02] active:scale-95 ${
                selectedService === s.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <s.icon className="w-8 h-8 mb-3" />
              <span className="text-xs sm:text-sm font-bold text-center leading-tight px-1">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 mt-6 mb-12 max-w-3xl mx-auto w-full">
        <button 
          onClick={handleSearch}
          className="w-full py-5 bg-primary text-primary-foreground font-black text-lg rounded-2xl shadow-[0_8px_30px_rgba(59,130,246,0.3)] hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-6 h-6" />
          Find Mechanics Now
        </button>
      </div>
    </div>
  );
}
