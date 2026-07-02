import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, Search, MapPin, Phone, MessageCircle, Navigation, ChevronLeft } from 'lucide-react';
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
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number]>([20.5937, 78.9629]);

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
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
          <div className="flex gap-2 mt-3 overflow-x-auto snap-x hide-scrollbar pb-1">
            <button 
              onClick={() => navigate('/list')}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${!vehicleParam && !serviceParam ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
            >
              All
            </button>
            {['Bike', 'Car', 'Auto', 'Truck', 'Bus'].map(v => (
              <button
                key={v}
                onClick={() => navigate(`/list?vehicle=${v}&service=${serviceParam}`)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-bold border transition-colors ${vehicleParam === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}
              >
                {v}
              </button>
            ))}
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
                <div key={mechanic.id} className="bg-card border border-border rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                  {mechanic.image ? (
                    <img src={mechanic.image} alt={mechanic.name} className="w-20 h-20 rounded-xl object-cover shrink-0 bg-secondary" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Wrench className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-foreground truncate">{mechanic.name}</h4>
                        <span className="text-xs font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded-md shrink-0">
                          {dist} km
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1 flex items-center gap-1">
                        <MapPin size={10} /> {mechanic.area}, {mechanic.city}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                       {mechanic.phone?.[0] && (
                        <a href={`tel:${mechanic.phone[0].number}`} className="flex-1 bg-primary/10 text-primary h-11 rounded-xl flex justify-center items-center hover:bg-primary/20 active:scale-95 transition-all">
                          <Phone size={18} />
                        </a>
                       )}
                       {mechanic.phone?.[0]?.isWhatsapp && (
                        <a href={`https://wa.me/91${mechanic.phone[0].number}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-500/10 text-green-600 dark:text-green-400 h-11 rounded-xl flex justify-center items-center hover:bg-green-500/20 active:scale-95 transition-all">
                          <MessageCircle size={18} />
                        </a>
                       )}
                       <button onClick={() => navigate(`/map?vehicle=${vehicleParam}&service=${serviceParam}&routeTo=${mechanic.id}`)} className="flex-1 bg-secondary text-secondary-foreground h-11 rounded-xl flex justify-center items-center hover:bg-secondary/80 active:scale-95 transition-all shadow-sm">
                         <Navigation size={18} />
                       </button>
                    </div>
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
