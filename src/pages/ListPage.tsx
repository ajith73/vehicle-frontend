import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Search, MapPin, Phone, MessageCircle, Navigation, ChevronLeft, ChevronDown, Filter, X, Eye } from 'lucide-react';
import { API_URL, apiClient } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';

const isCurrentlyAvailable = (mechanic: any) => {
  if (mechanic.is24Hours) return true;
  if (!mechanic.operatingHours) return true;
  
  try {
    const [openStr, closeStr] = mechanic.operatingHours.split('-').map((s: string) => s.trim());
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const openParts = openStr.split(':');
    const openMinutes = parseInt(openParts[0]) * 60 + parseInt(openParts[1]);
    
    const closeParts = closeStr.split(':');
    const closeMinutes = parseInt(closeParts[0]) * 60 + parseInt(closeParts[1]);

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } catch(e) {
    return true;
  }
};

const getMechanicStatus = (m: any) => {
  if (!isCurrentlyAvailable(m)) return 'Closed';
  if (m.currentStatus === 'Busy' || (m.id % 5 === 0)) return 'Busy'; 
  return 'Available';
};

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
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [radius, setRadius] = useState<number>(5);
  const [sortBy, setSortBy] = useState<'Nearest' | 'Available'>('Nearest');
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMechanicForDetails, setSelectedMechanicForDetails] = useState<any | null>(null);

  const { userLocation, isLoading: locationLoading } = useLocationContext();
  
  // Dynamic options
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vData, sData] = await Promise.all([
          apiClient<any>('/public/vehicles'),
          apiClient<any>('/public/services')
        ]);
        setVehicleOptions(vData.map((v: any) => v.name));
        setServiceOptions(sData.map((s: any) => s.name));
      } catch (err) {
        console.error('Failed to load settings options', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    // Location handled by LocationContext

    // 2. Fetch Mechanics
    const fetchMechanics = async () => {
      setLoading(true);
      try {
        const data = await apiClient<any>(`/public/mechanics?vehicleType=${vehicleParam}&serviceType=${serviceParam}`);
        
        // Sort by distance if location available
        let processedData = [...data];
        if (userLocation) {
          processedData.forEach((m: any) => {
            m.dist = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], m.latitude, m.longitude);
          });
          
          processedData = processedData.filter(m => m.dist <= radius);
          
          processedData.sort((a: any, b: any) => {
            if (sortBy === 'Available') {
              const statusA = getMechanicStatus(a);
              const statusB = getMechanicStatus(b);
              if (statusA === 'Available' && statusB !== 'Available') return -1;
              if (statusA !== 'Available' && statusB === 'Available') return 1;
            }
            return a.dist - b.dist;
          });
        }
        
        setMechanics(processedData.slice(0, 50));
      } catch (err) {
        console.error('Failed to fetch mechanics', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!locationLoading) {
      fetchMechanics();
    }
  }, [vehicleParam, serviceParam, userLocation, locationLoading, radius, sortBy]);

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
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by name, area, or city..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-secondary/30 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base shadow-sm transition-all"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="px-4 bg-secondary border border-border rounded-xl hover:bg-secondary/80 transition-colors flex items-center justify-center shrink-0"
            >
              <Filter className="w-5 h-5 text-foreground" />
            </button>
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
              const dist = userLocation ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], mechanic.latitude, mechanic.longitude).toFixed(1) : null;
              return (
                  <div key={mechanic.id} className="bg-card border border-border/60 rounded-[24px] p-4 sm:p-5 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                  <div className="flex gap-4">
                    {mechanic.image ? (
                      <div 
                        className="relative shrink-0 overflow-hidden rounded-2xl w-24 h-24 sm:w-28 sm:h-28 group/img cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                        onClick={(e) => { e.stopPropagation(); setSelectedMechanicForDetails(mechanic); setIsDetailsOpen(true); }}
                      >
                        <img src={mechanic.image} alt={mechanic.businessName || mechanic.name} className="w-full h-full object-cover bg-secondary group-hover/img:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <Eye className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-secondary/50 flex items-center justify-center shrink-0 border border-border/50 group-hover:bg-primary/5 transition-colors duration-300 relative group/img overflow-hidden cursor-pointer shadow-sm hover:shadow-md"
                        onClick={(e) => { e.stopPropagation(); setSelectedMechanicForDetails(mechanic); setIsDetailsOpen(true); }}
                      >
                        <Wrench className="w-8 h-8 text-muted-foreground/30" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                          <Eye className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <h4 className="font-bold text-foreground text-lg leading-tight truncate group-hover:text-primary transition-colors">{mechanic.businessName || mechanic.name}</h4>
                          {dist !== null && (
                            <span className="text-xs font-black bg-primary/10 text-primary px-2.5 py-1 rounded-lg shrink-0">
                              {dist} km
                            </span>
                          )}
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

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full sm:max-w-md rounded-[24px] shadow-2xl border border-border overflow-hidden flex flex-col mb-16 sm:mb-0 animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/30">
              <h3 className="font-bold text-lg text-foreground">Filter & Sort</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Sort By</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSortBy('Nearest')}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-colors ${sortBy === 'Nearest' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
                  >
                    Nearest
                  </button>
                  <button 
                    onClick={() => setSortBy('Available')}
                    className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-colors ${sortBy === 'Available' ? 'bg-primary/10 border-primary text-primary' : 'bg-secondary/50 border-border text-muted-foreground hover:bg-secondary'}`}
                  >
                    Available First
                  </button>
                </div>
              </div>

              {/* Radius */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-foreground">Search Radius</label>
                  <span className="text-sm font-bold text-primary">{radius} km</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="50" 
                  value={radius} 
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Vehicle Type</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-secondary/50 border border-border text-foreground text-sm font-bold px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                    value={vehicleParam}
                    onChange={(e) => navigate(`/list?vehicle=${e.target.value}&service=${serviceParam}`)}
                  >
                    <option value="">Any Vehicle</option>
                    {vehicleOptions.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-5 h-5" />
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-bold text-foreground mb-3">Service Type</label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-secondary/50 border border-border text-foreground text-sm font-bold px-4 py-3 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                    value={serviceParam}
                    onChange={(e) => navigate(`/list?vehicle=${vehicleParam}&service=${e.target.value}`)}
                  >
                    <option value="">Any Service</option>
                    {serviceOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-border/50 bg-muted/10">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mechanic Details Modal */}
      {isDetailsOpen && selectedMechanicForDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDetailsOpen(false)}>
          <div 
            className="bg-card w-full max-w-lg rounded-[24px] shadow-2xl border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header / Cover */}
            <div className="relative h-48 sm:h-56 bg-secondary/50">
              {selectedMechanicForDetails.image ? (
                <img src={selectedMechanicForDetails.image} alt="Mechanic" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Wrench className="w-16 h-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <button 
                onClick={() => setIsDetailsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-md transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex justify-between items-end gap-3">
                  <div className="min-w-0">
                    <h3 className="font-black text-2xl text-white truncate leading-tight drop-shadow-md">
                      {selectedMechanicForDetails.businessName || selectedMechanicForDetails.name}
                    </h3>
                    <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1 font-medium drop-shadow-md">
                      <MapPin size={14} className="text-primary" /> {selectedMechanicForDetails.landmark ? `${selectedMechanicForDetails.landmark}, ` : ''}{selectedMechanicForDetails.area}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Current Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getMechanicStatus(selectedMechanicForDetails) === 'Available' ? 'bg-green-500 shadow-green-500/50' : 'bg-yellow-500 shadow-yellow-500/50'}`}></div>
                    <span className="font-bold text-sm text-foreground">{getMechanicStatus(selectedMechanicForDetails)}</span>
                  </div>
                </div>
                {selectedMechanicForDetails.dist !== undefined && (
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Distance</span>
                    <span className="font-bold text-sm text-foreground text-primary">{selectedMechanicForDetails.dist.toFixed(1)} km away</span>
                  </div>
                )}
              </div>
              
              {/* Detailed Data */}
              {selectedMechanicForDetails.address && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><MapPin size={16} className="text-primary"/> Full Address</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-4 rounded-xl border border-border/30">
                    {selectedMechanicForDetails.address}
                  </p>
                </div>
              )}
              
              {selectedMechanicForDetails.vehicleTypes && selectedMechanicForDetails.vehicleTypes.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Navigation size={16} className="text-primary"/> Supported Vehicles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMechanicForDetails.vehicleTypes.map((v: string) => (
                      <span key={v} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold">{v}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMechanicForDetails.serviceTypes && selectedMechanicForDetails.serviceTypes.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Wrench size={16} className="text-primary"/> Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMechanicForDetails.serviceTypes.map((s: string) => (
                      <span key={s} className="bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-foreground">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-border/50 bg-muted/10 flex gap-2">
               {selectedMechanicForDetails.phone?.[0] && (
                 <a href={`tel:${selectedMechanicForDetails.phone[0].number}`} className="flex-1 bg-secondary/80 hover:bg-primary hover:text-primary-foreground text-foreground h-12 rounded-xl flex justify-center items-center active:scale-95 transition-all font-bold text-sm gap-2 border border-border/50">
                   <Phone size={18} /> Call
                 </a>
               )}
               <button onClick={() => navigate(`/map?routeTo=${selectedMechanicForDetails.id}`)} className="flex-[1.5] bg-primary text-primary-foreground h-12 rounded-xl flex justify-center items-center hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 font-bold text-sm gap-2">
                 <Navigation size={18} /> Navigate
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
