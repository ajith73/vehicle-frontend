import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Search, MapPin, Phone, MessageCircle, Navigation, ChevronLeft, ChevronDown } from 'lucide-react';
import { API_URL } from '../api/apiClient';

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

export default function ListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleParam = searchParams.get('vehicle') || '';
  const serviceParam = searchParams.get('service') || '';
  const searchParam = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([20.5937, 78.9629]);
  
  // Dynamic options
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vRes, sRes] = await Promise.all([
          fetch(`${API_URL}/public/vehicles`),
          fetch(`${API_URL}/public/services`)
        ]);
        const vData = await vRes.json();
        const sData = await sRes.json();
        setVehicleOptions(vData.map((v: any) => v.name));
        setServiceOptions(sData.map((s: any) => s.name));
      } catch (err) {
        console.error('Failed to load settings options', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    // 1. Get Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
        () => console.warn('Could not get location'),
        { timeout: 10000 }
      );
    }

    // 2. Fetch Mechanics
    const fetchMechanics = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/public/mechanics?vehicleType=${vehicleParam}&serviceType=${serviceParam}`);
        let data = await res.json();
        
        // Sort by distance
        data.sort((a: any, b: any) => {
          const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], a.latitude, a.longitude);
          const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], b.latitude, b.longitude);
          return distA - distB;
        });
        
        setMechanics(data.slice(0, 50));
      } catch (err) {
        console.error('Failed to fetch mechanics', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMechanics();
  }, [vehicleParam, serviceParam, userLocation[0], userLocation[1]]);

  // Filter local search query
  const filteredMechanics = mechanics.filter(m => 
    (m.businessName || m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-20 sm:pb-0">
      
      {/* 1. Header & Search Area */}
      <div className="pt-6 pb-4 px-4 sm:px-8 bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors active:scale-95">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Mechanics
            </h2>
          </div>
          
          {/* iOS-Style Segmented Control (List/Map) */}
          <div className="bg-secondary p-1 rounded-xl flex items-center shadow-inner">
            <button className="px-4 py-1.5 rounded-lg bg-background text-foreground shadow font-bold text-sm">
              List
            </button>
            <button 
              onClick={() => navigate(`/map?vehicle=${vehicleParam}&service=${serviceParam}`)} 
              className="px-4 py-1.5 rounded-lg text-muted-foreground font-bold text-sm hover:text-foreground transition-colors"
            >
              Map
            </button>
          </div>
        </div>
        
        {/* Search & Filters */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by name, area, or city..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base shadow-sm transition-all"
            />
          </div>
          
          {/* Filter Chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto snap-x hide-scrollbar pb-2">
            <div className="relative shrink-0">
              <select 
                className="appearance-none bg-secondary/50 border border-border text-foreground text-sm font-bold px-4 py-2.5 pr-10 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                value={vehicleParam}
                onChange={(e) => navigate(`/list?vehicle=${e.target.value}&service=${serviceParam}`)}
              >
                <option value="">Any Vehicle</option>
                {vehicleOptions.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-4 h-4" />
            </div>
            
            <div className="relative shrink-0">
              <select 
                className="appearance-none bg-secondary/50 border border-border text-foreground text-sm font-bold px-4 py-2.5 pr-10 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                value={serviceParam}
                onChange={(e) => navigate(`/list?vehicle=${vehicleParam}&service=${e.target.value}`)}
              >
                <option value="">Any Service</option>
                {serviceOptions.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mechanics List */}
      <div className="flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-foreground">
            {vehicleParam || serviceParam ? 'Filtered Results' : 'Nearby Mechanics'}
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMechanics.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-2xl border border-border">
            <Wrench className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No mechanics found matching your criteria.</p>
            <button 
              onClick={() => navigate('/list')}
              className="mt-4 px-4 py-2 bg-secondary text-secondary-foreground font-bold rounded-lg hover:bg-secondary/80"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMechanics.map(mechanic => {
              const dist = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], mechanic.latitude, mechanic.longitude).toFixed(1);
              return (
                  <div key={mechanic.id} className="bg-card border border-border/60 rounded-[24px] p-4 sm:p-5 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                  <div className="flex gap-4">
                    {mechanic.image ? (
                      <div className="relative shrink-0 overflow-hidden rounded-2xl w-24 h-24 sm:w-28 sm:h-28">
                        <img src={mechanic.image} alt={mechanic.businessName || mechanic.name} className="w-full h-full object-cover bg-secondary group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-secondary/50 flex items-center justify-center shrink-0 border border-border/50 group-hover:bg-primary/5 transition-colors duration-300">
                        <Wrench className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="font-bold text-foreground text-lg leading-tight truncate group-hover:text-primary transition-colors">{mechanic.businessName || mechanic.name}</h4>
                          <span className="text-xs font-black bg-primary/10 text-primary px-2.5 py-1 rounded-lg shrink-0">
                            {dist} km
                          </span>
                        </div>
                        <p className="text-[13px] text-muted-foreground truncate flex items-center gap-1.5 font-medium">
                          <MapPin size={14} className="shrink-0 text-primary/70" /> <span className="truncate">{mechanic.landmark ? `${mechanic.landmark}, ` : ''}{mechanic.area}</span>
                        </p>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                         <span className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded text-[10px] font-bold border border-green-500/20 tracking-wide uppercase">Available</span>
                         {mechanic.is24Hours && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 rounded text-[10px] font-bold border border-blue-500/20 tracking-wide uppercase">24/7</span>}
                         {mechanic.evSupport && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-[10px] font-bold border border-emerald-500/20 tracking-wide uppercase">EV Ready</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons Row */}
                  <div className="flex gap-2.5 pt-3 border-t border-border/40">
                     {mechanic.phone?.[0] && (
                      <a href={`tel:${mechanic.phone[0].number}`} className="flex-1 bg-secondary/80 hover:bg-primary hover:text-primary-foreground text-foreground h-11 rounded-xl flex justify-center items-center active:scale-95 transition-all font-bold text-[13px] gap-2 border border-border/50">
                        <Phone size={16} /> <span className="hidden sm:inline">Call</span>
                      </a>
                     )}
                     {mechanic.phone?.[0]?.isWhatsapp && (
                      <a href={`https://wa.me/91${mechanic.phone[0].number}`} target="_blank" rel="noreferrer" className="flex-1 bg-secondary/80 hover:bg-green-600 hover:text-white text-foreground h-11 rounded-xl flex justify-center items-center active:scale-95 transition-all font-bold text-[13px] gap-2 border border-border/50">
                        <MessageCircle size={16} /> <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                     )}
                     <button onClick={() => navigate(`/map?vehicle=${vehicleParam}&service=${serviceParam}&routeTo=${mechanic.id}`)} className="flex-[1.2] bg-primary text-primary-foreground h-11 rounded-xl flex justify-center items-center hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 font-bold text-[13px] gap-2">
                       <Navigation size={16} /> <span>Navigate</span>
                     </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
