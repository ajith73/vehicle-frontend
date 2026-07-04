import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents, Circle } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { X, Phone, MessageCircle, ExternalLink, MapPin, Navigation, ChevronLeft, LocateFixed, Mail, Globe, Clock, Settings2, MessageSquare, Wrench } from 'lucide-react';
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
  const [radius, setRadius] = useState<number>(5); // Default 5km
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
            setSheetState(1);
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

    filtered.sort((a, b) => {
      if (sortBy === 'Available') {
        if (a.currentStatus === 'Available' && b.currentStatus !== 'Available') return -1;
        if (a.currentStatus !== 'Available' && b.currentStatus === 'Available') return 1;
      }
      return a.distance - b.distance;
    });
    return filtered;
  }, [mechanics, radius, sortBy]);

  // Derived state: nearby alternatives to selected mechanic
  const nearbyMechanics = useMemo(() => {
    if (!selectedMechanic || !mechanics.length) return [];
    const withDistance = mechanics
      .filter(m => m.id !== selectedMechanic.id)
      .map(m => ({
        ...m,
        distToSelected: getDistanceFromLatLonInKm(selectedMechanic.latitude, selectedMechanic.longitude, m.latitude, m.longitude)
      }));
    withDistance.sort((a, b) => a.distToSelected - b.distToSelected);
    return withDistance.slice(0, 5);
  }, [selectedMechanic, mechanics]);

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
    if (sheetState === 0) return 'h-[35vh] sm:h-auto';
    if (sheetState === 1) return 'h-[50vh] sm:h-auto';
    return 'h-[90vh] sm:h-auto';
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

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-card text-foreground p-3 rounded-full shadow-lg border border-border hover:bg-secondary/50 transition-colors w-12 h-12 flex items-center justify-center"
        >
          <Settings2 className="w-6 h-6" />
        </button>
        <button
          onClick={locateUser}
          className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors w-12 h-12 flex items-center justify-center"
        >
          <LocateFixed className="w-6 h-6" />
        </button>
      </div>

      {showControls && (
        <div className="absolute top-20 right-4 z-[400] bg-card p-4 rounded-2xl shadow-xl border border-border animate-in slide-in-from-top-4 text-sm w-64">
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

      <MapContainer 
        center={userLocation} 
        zoom={13} 
        className="flex-1 w-full z-0"
        ref={setMapInstance}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
          className="dark:brightness-75 dark:contrast-125 dark:invert dark:hue-rotate-180 transition-all duration-300"
        />
        <ChangeView center={userLocation} />
        <MapBoundsListener setBounds={setMapBounds} />
        
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
                  setSheetState(1);
                }
              }}
            />
          ))}
        </MarkerClusterGroup>

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }} />
        )}
      </MapContainer>

      {/* Mechanic Details - Bottom Sheet (Mobile) / Side Panel (Desktop) */}
      {selectedMechanic && (
        <>

          <div 
            className={`fixed sm:absolute bottom-0 sm:bottom-[10%] sm:left-4 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-[400px] z-[500] flex flex-col pointer-events-none rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform translate-y-0 pb-safe pb-[72px] sm:pb-0 ${getSheetHeightClass()}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="bg-card border-t sm:border border-border flex flex-col pointer-events-auto h-full w-full">
              {/* Mobile handle */}
              <div className="w-full flex justify-center py-3 sm:hidden cursor-pointer shrink-0" onClick={() => setSheetState(prev => prev === 2 ? 1 : 2)}>
                <div className="w-12 h-1.5 bg-muted rounded-full"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
                <div className="p-4 sm:p-5 flex gap-4 relative">
                  {selectedMechanic.image ? (
                    <img src={selectedMechanic.image} alt={selectedMechanic.businessName || selectedMechanic.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center shrink-0">
                      <Wrench className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-1 leading-tight truncate">{selectedMechanic.businessName || selectedMechanic.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 shrink-0" /> {selectedMechanic.landmark ? `${selectedMechanic.landmark}, ` : ''}{selectedMechanic.area}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-secondary rounded-md">
                        <div className={`w-2 h-2 rounded-full ${getMechanicStatus(selectedMechanic) === 'Available' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        {getMechanicStatus(selectedMechanic)}
                      </div>
                      <div className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md whitespace-nowrap">
                        {drivingTime ? `${drivingTime} ` : ''}({getDistanceFromLatLonInKm(userLocation[0], userLocation[1], selectedMechanic.latitude, selectedMechanic.longitude).toFixed(1)} km)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Icons Row */}
                <div className="flex justify-around items-center px-4 py-3 border-y border-border/50 gap-2 shrink-0">
                   {selectedMechanic.phone?.[0] && (
                     <a href={`tel:${selectedMechanic.phone[0].number}`} className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors shrink-0">
                       <Phone className="w-5 h-5" />
                     </a>
                   )}
                   {selectedMechanic.phone?.[0]?.isWhatsapp && (
                     <a href={`https://wa.me/91${selectedMechanic.phone[0].number}`} target="_blank" rel="noreferrer" className="p-3 bg-green-500/10 text-green-600 rounded-full hover:bg-green-500/20 transition-colors shrink-0">
                       <MessageCircle className="w-5 h-5" />
                     </a>
                   )}
                   {selectedMechanic.phone?.[0] && (
                     <a href={`sms:${selectedMechanic.phone[0].number}`} className="p-3 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition-colors shrink-0">
                       <MessageSquare className="w-5 h-5" />
                     </a>
                   )}
                   {selectedMechanic.email && (
                     <a href={`mailto:${selectedMechanic.email}`} className="p-3 bg-orange-500/10 text-orange-600 rounded-full hover:bg-orange-500/20 transition-colors shrink-0">
                       <Mail className="w-5 h-5" />
                     </a>
                   )}
                   {selectedMechanic.websiteUrl && (
                     <a href={selectedMechanic.websiteUrl} target="_blank" rel="noreferrer" className="p-3 bg-purple-500/10 text-purple-600 rounded-full hover:bg-purple-500/20 transition-colors shrink-0">
                       <Globe className="w-5 h-5" />
                     </a>
                   )}
                   <button onClick={() => {
                     setRouteCoords([]);
                     navigate(`/map?routeTo=${selectedMechanic.id}`);
                   }} className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 border border-border shadow-sm transition-colors shrink-0">
                     <Navigation className="w-5 h-5" />
                   </button>
                </div>

                {/* Extended Details for sheetState > 0 */}
                {(sheetState > 0) && (
                  <div className="p-4 sm:p-5 animate-in fade-in duration-300">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> Nearby Mechanics
                      </h4>
                      <div className="flex flex-col gap-3">
                        {nearbyMechanics.map((m: any) => (
                          <div 
                            key={m.id}
                            onClick={() => {
                              setSelectedMechanic(m);
                              setSheetState(1);
                              mapInstance?.flyTo([m.latitude, m.longitude], 15);
                            }}
                            className="bg-background border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                          >
                            {m.image ? (
                              <img src={m.image} alt={m.businessName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                                <Wrench className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-foreground truncate">{m.businessName || m.name}</h5>
                              <p className="text-xs text-muted-foreground truncate">{m.distToSelected?.toFixed(1)} km away • {m.area}</p>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                          </div>
                        ))}
                        {nearbyMechanics.length === 0 && (
                          <p className="text-sm text-muted-foreground">No other mechanics nearby.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
