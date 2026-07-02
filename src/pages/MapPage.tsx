import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { X, Phone, MessageCircle, ExternalLink, MapPin, Navigation, ChevronLeft, LocateFixed, Mail, Globe, Clock, Settings2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_URL } from '../api/apiClient';

// Icons
const userIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-[pulse_2s_ease-in-out_infinite]"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const getMarkerIcon = (colorClass: string) => new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
           <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 ${colorClass} rotate-45 border-r-2 border-b-2 border-white"></div>
         </div>`,
  iconSize: [32, 36],
  iconAnchor: [16, 36],
});

const availableIcon = getMarkerIcon('bg-green-500');
const busyIcon = getMarkerIcon('bg-yellow-500');
const closedIcon = getMarkerIcon('bg-red-500');

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center[0], center[1], map]);
  return null;
}

// Map Bounds Component
function MapBoundsListener({ setBounds }: { setBounds: (bounds: L.LatLngBounds) => void }) {
  const map = useMapEvents({
    moveend: () => {
      setBounds(map.getBounds());
    }
  });
  
  useEffect(() => {
    setBounds(map.getBounds());
  }, [map, setBounds]);
  
  return null;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; 
  var dLat = (lat2 - lat1) * (Math.PI / 180);
  var dLon = (lon2 - lon1) * (Math.PI / 180);
  var a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; 
}

const isCurrentlyAvailable = (mechanic: any) => {
  if (!mechanic) return false;
  if (mechanic.availability === false) return false;
  if (!mechanic.operatingDays || !mechanic.operatingHours) return mechanic.availability !== false;

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[new Date().getDay()];
  if (!mechanic.operatingDays.includes(currentDay)) return false;

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
  // Mock logic: randomly make 20% busy if they are available
  // In real app, this would come from backend (m.currentStatus === 'Busy')
  if (m.currentStatus === 'Busy' || (m.id % 5 === 0)) return 'Busy'; 
  return 'Available';
};

const getIconForStatus = (status: string) => {
  if (status === 'Available') return availableIcon;
  if (status === 'Busy') return busyIcon;
  return closedIcon;
};

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicle = searchParams.get('vehicle');
  const service = searchParams.get('service');
  const routeTo = searchParams.get('routeTo');
  
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number]>([20.5937, 78.9629]); 
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  
  const [mechanicsLoading, setMechanicsLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Finding your location...');
  
  const [selectedMechanic, setSelectedMechanic] = useState<any | null>(null);
  
  // Sheet states: 0 = collapsed (25%), 1 = half (50%), 2 = full (100%)
  const [sheetState, setSheetState] = useState<0 | 1 | 2>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [drivingDistance, setDrivingDistance] = useState<string | null>(null);
  const [drivingTime, setDrivingTime] = useState<string | null>(null);
  
  // Controls state
  const [showControls, setShowControls] = useState(false);
  const [radius, setRadius] = useState<number>(50000); // Default very large (Any)
  const [routeOption, setRouteOption] = useState<'Fastest' | 'Shortest' | 'Avoid Toll'>('Fastest');
  const [sortBy, setSortBy] = useState<'Nearest' | 'Available'>('Nearest');

  // Route Fetching
  useEffect(() => {
    if (!selectedMechanic || !userLocation) {
      setRouteCoords([]);
      setDrivingDistance(null);
      return;
    }

    const fetchRoute = async () => {
      try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedMechanic.longitude},${selectedMechanic.latitude}?overview=full&geometries=geojson&alternatives=true`);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          // Sort routes based on option
          let bestRoute = data.routes[0];
          if (routeOption === 'Shortest') {
            bestRoute = data.routes.reduce((prev: any, curr: any) => prev.distance < curr.distance ? prev : curr);
          } else if (routeOption === 'Fastest') {
            bestRoute = data.routes.reduce((prev: any, curr: any) => prev.duration < curr.duration ? prev : curr);
          } // Note: Avoid Toll is hard to implement with public OSRM, so we fallback to fastest

          const coords = bestRoute.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
          setRouteCoords(coords);
          
          const distKm = (bestRoute.distance / 1000).toFixed(1);
          setDrivingDistance(distKm);

          const durationMins = Math.round(bestRoute.duration / 60);
          if (durationMins > 60) {
            setDrivingTime(`${Math.floor(durationMins / 60)}h ${durationMins % 60}m`);
          } else {
            setDrivingTime(`${durationMins} min`);
          }

          if (mapInstance) {
            mapInstance.fitBounds(coords, { padding: [50, 50] });
          }
        }
      } catch (err) {
        console.error("Failed to fetch route", err);
      }
    };
    
    fetchRoute();
  }, [selectedMechanic, userLocation[0], userLocation[1], routeOption]);

  const locateUser = () => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      setLoadingMessage('Finding your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newCoords);
          if (mapInstance) {
            mapInstance.flyTo(newCoords, 14);
          }
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        },
        { timeout: 10000 }
      );
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setLocationLoading(false);
          setLoadingMessage('Fetching nearby mechanics...');
        },
        () => {
          setLocationLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchMechanics = async () => {
      setMechanicsLoading(true);
      try {
        const res = await fetch(`${API_URL}/public/mechanics?vehicleType=${vehicle || ''}&serviceType=${service || ''}`);
        let data = await res.json();
        
        // Add status and distance
        data = data.map((m: any) => ({
          ...m,
          currentStatus: getMechanicStatus(m),
          distance: getDistanceFromLatLonInKm(userLocation[0], userLocation[1], m.latitude, m.longitude)
        }));

        setMechanics(data);
        
        if (routeTo) {
          const target = data.find((m: any) => m.id.toString() === routeTo);
          if (target) {
            setSelectedMechanic(target);
            setSheetState(0);
            if (mapInstance) {
              mapInstance.flyTo([target.latitude, target.longitude], 14);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch mechanics', err);
      } finally {
        setMechanicsLoading(false);
      }
    };
    if (!locationLoading) fetchMechanics();
  }, [vehicle, service, userLocation[0], userLocation[1], routeTo, locationLoading]);

  // Derived state: filtered and sorted mechanics
  const visibleMechanics = useMemo(() => {
    let filtered = mechanics.filter(m => m.distance <= radius);
    
    // Bounds filtering optimization
    if (mapBounds) {
      filtered = filtered.filter(m => mapBounds.contains([m.latitude, m.longitude]));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'Available') {
        if (a.currentStatus === 'Available' && b.currentStatus !== 'Available') return -1;
        if (a.currentStatus !== 'Available' && b.currentStatus === 'Available') return 1;
      }
      return a.distance - b.distance;
    });
    return filtered;
  }, [mechanics, radius, sortBy, mapBounds]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientY;
    const distance = touchStart - touchEnd;
    
    if (distance > 50) {
      // Swipe Up
      setSheetState(prev => Math.min(prev + 1, 2) as 0 | 1 | 2);
    } else if (distance < -50) {
      // Swipe Down
      if (sheetState > 0) {
        setSheetState(prev => (prev - 1) as 0 | 1 | 2);
      } else {
        setSelectedMechanic(null);
        setRouteCoords([]);
        setDrivingDistance(null);
      }
    }
    setTouchStart(null);
  };

  const getSheetHeightClass = () => {
    if (sheetState === 0) return 'h-[30vh] md:h-auto';
    if (sheetState === 1) return 'h-[60vh] md:h-auto';
    return 'h-[95vh] md:h-auto';
  };

  const isLoading = locationLoading || mechanicsLoading;

  return (
    <div className="flex-1 w-full relative bg-background flex flex-col min-h-0">
      {isLoading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-5 p-8 bg-card rounded-3xl shadow-2xl border border-border/50 animate-in zoom-in-95 duration-300">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-lg font-bold text-foreground animate-pulse">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
        <button 
          onClick={() => navigate(-1)}
          className="pointer-events-auto bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <button 
            onClick={() => setShowControls(!showControls)}
            className={`bg-card p-3 rounded-full shadow-lg border border-border transition-colors ${showControls ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-primary'}`}
          >
            <Settings2 size={24} />
          </button>
          
          <button 
            onClick={locateUser}
            className="bg-card p-3 rounded-full shadow-lg border border-border hover:bg-secondary transition-colors text-primary"
          >
            <LocateFixed size={24} />
          </button>

          {showControls && (
            <div className="bg-card p-4 rounded-2xl shadow-xl border border-border animate-in slide-in-from-right-4 text-sm w-64 mt-2">
              <div className="mb-4">
                <p className="font-bold mb-2">Search Radius</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 5, 10, 50, 50000].map(r => (
                    <button 
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${radius === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                    >
                      {r === 50000 ? 'Any' : `${r}km`}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="font-bold mb-2">Sort By</p>
                <div className="flex gap-2">
                  {['Nearest', 'Available'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setSortBy(s as any)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${sortBy === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="font-bold mb-2">Route Option</p>
                <div className="flex flex-wrap gap-2">
                  {['Fastest', 'Shortest', 'Avoid Toll'].map(r => (
                    <button 
                      key={r}
                      onClick={() => setRouteOption(r as any)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${routeOption === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MapContainer 
        center={userLocation} 
        zoom={13} 
        className="flex-1 w-full z-0"
        ref={setMapInstance}
      >
        <ChangeView center={userLocation} />
        <MapBoundsListener setBounds={setMapBounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Radius Circle */}
        <Circle center={userLocation} radius={radius * 1000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />
        
        <Marker position={userLocation} icon={userIcon} />

        <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
          {visibleMechanics.map((mechanic) => (
            <Marker 
              key={mechanic.id} 
              position={[mechanic.latitude, mechanic.longitude]}
              icon={getIconForStatus(mechanic.currentStatus)}
              eventHandlers={{
                click: () => {
                  setSelectedMechanic(mechanic);
                  setSheetState(0);
                }
              }}
            />
          ))}
        </MarkerClusterGroup>

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }} />
        )}
      </MapContainer>

      {/* Floating Bottom Sheet */}
      {selectedMechanic && (
        <>
          {sheetState === 2 && (
            <div 
              className="absolute inset-0 z-[900] bg-background/50 backdrop-blur-sm sm:hidden animate-in fade-in"
              onClick={() => setSheetState(0)}
            />
          )}
          
          <div 
            className={`absolute bottom-0 left-0 right-0 md:left-4 md:top-24 md:bottom-auto md:w-[420px] z-[1000] bg-card border-t md:border border-border shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-2xl rounded-t-3xl md:rounded-3xl overflow-hidden transition-all duration-300 ease-out flex flex-col ${getSheetHeightClass()} animate-in slide-in-from-bottom-full md:slide-in-from-left-8`}
          >
            {/* Drag Handle */}
            <div 
              className="w-full pt-4 pb-3 flex justify-center cursor-pointer touch-none md:hidden bg-card z-10 shrink-0"
              onClick={() => setSheetState(prev => (prev === 2 ? 0 : 2))}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-14 h-1.5 bg-muted-foreground/30 rounded-full"></div>
            </div>

            <div className="overflow-y-auto hide-scrollbar flex-1 pb-10">
              {selectedMechanic.image && (
                <div className="relative">
                  <img 
                    src={selectedMechanic.image} 
                    alt={selectedMechanic.name} 
                    className={`${sheetState === 2 ? 'h-56' : 'h-32'} w-full object-cover transition-all duration-300`} 
                  />
                  <button 
                    onClick={() => { setSelectedMechanic(null); setRouteCoords([]); }}
                    className="absolute top-3 right-3 p-2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-md rounded-full md:flex hidden"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-2xl leading-tight pr-4">{selectedMechanic.name}</h3>
                  {!selectedMechanic.image && (
                    <button 
                      onClick={() => { setSelectedMechanic(null); setRouteCoords([]); }}
                      className="p-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full shrink-0 md:flex hidden"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
                
                <div className="flex justify-between items-center mb-5">
                  <p className="text-sm text-muted-foreground flex items-center gap-1 truncate max-w-[60%]">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{selectedMechanic.area}, {selectedMechanic.city}</span>
                  </p>
                  
                  {/* Status & ETA */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${selectedMechanic.currentStatus === 'Available' ? 'bg-green-500/10 text-green-600 border-green-500/20' : selectedMechanic.currentStatus === 'Busy' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                      {selectedMechanic.currentStatus}
                    </span>
                    
                    {drivingDistance && drivingTime && (
                      <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2">
                        <span className="font-bold text-sm flex items-center gap-1"><span className="text-base">🚗</span> {drivingTime}</span>
                        <span className="text-primary/30 font-bold">|</span>
                        <span className="font-bold text-sm flex items-center gap-1"><span className="text-base">📍</span> {drivingDistance} km</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${selectedMechanic.latitude},${selectedMechanic.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-14 h-14 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Navigation size={24} />
                  </a>
                  {selectedMechanic.phone?.map((p: any, i: number) => (
                    <React.Fragment key={i}>
                      <a href={`tel:${p.number}`} className="w-14 h-14 shrink-0 flex items-center justify-center bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 active:scale-95">
                        <Phone size={24} />
                      </a>
                      {p.isWhatsapp && (
                        <a href={`https://wa.me/91${p.number}`} target="_blank" rel="noreferrer" className="w-14 h-14 shrink-0 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 active:scale-95">
                          <MessageCircle size={24} />
                        </a>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Badges / Details (Visible when expanded or half) */}
                {(sheetState > 0) && (
                  <div className="animate-in fade-in duration-300">
                    {selectedMechanic.vehicleTypes && (
                      <div className="mb-6">
                        <p className="font-bold mb-2">Supported Vehicles</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedMechanic.vehicleTypes.map((v: any, i: number) => (
                            <span key={i} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold">{v.type || v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedMechanic.services && (
                      <div className="mb-6">
                        <p className="font-bold mb-2">Services</p>
                        <div className="flex gap-2 flex-wrap">
                          {selectedMechanic.services.map((s: any, i: number) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-semibold">{s.name || s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedMechanic.description && (
                      <div className="mb-6">
                        <p className="font-bold mb-2">About</p>
                        <p className="text-muted-foreground text-sm">{selectedMechanic.description}</p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
