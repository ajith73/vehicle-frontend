import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, useMap, useMapEvents, Circle, Tooltip } from 'react-leaflet';
import { X, Phone, MessageCircle, MapPin, Navigation, ChevronLeft, LocateFixed, Mail, Globe, Settings2, MessageSquare, Wrench, Heart, Eye, AlertTriangle, Search } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiClient } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';
import toast from 'react-hot-toast';
import { buildMechanicSearchParams, parseMechanicFilterParam, type MechanicSort } from '../utils/mechanicSearch';
import Select, { type StylesConfig } from 'react-select';

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
const closedIcon = getMarkerIcon('bg-red-500');
const selectedIcon = new L.DivIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex h-12 w-12 items-center justify-center">
           <div class="absolute inset-0 rounded-full bg-blue-500/25 animate-ping"></div>
           <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white border-2 border-white shadow-xl">
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg>
           </div>
         </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 40],
});

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

const getMechanicStatus = (m: any) => m?.currentStatus || (isCurrentlyAvailable(m) ? 'Available' : 'Closed');

const getIconForStatus = (status: string) => {
  if (status === 'Available') return availableIcon;
  return closedIcon;
};

const FEEDBACK_OPTIONS = [
  'Name incorrect',
  'Mobile number not working',
  'Address wrong',
  'Services inaccurate',
  'Permanently closed'
];

const selectStyles: StylesConfig<{ value: string; label: string }, true> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: 'rgb(248 250 252 / 0.15)',
    borderColor: state.isFocused ? 'rgb(59 130 246 / 0.7)' : 'rgb(148 163 184 / 0.35)',
    boxShadow: state.isFocused ? '0 0 0 2px rgb(59 130 246 / 0.18)' : 'none',
    minHeight: 44
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: 'rgb(15 23 42)',
    border: '1px solid rgb(71 85 105)',
    overflow: 'hidden'
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? 'rgb(30 41 59)' : 'rgb(15 23 42)',
    color: 'rgb(241 245 249)',
    cursor: 'pointer'
  }),
  input: (base) => ({
    ...base,
    color: 'rgb(15 23 42)'
  }),
  placeholder: (base) => ({
    ...base,
    color: 'rgb(100 116 139)'
  }),
  singleValue: (base) => ({
    ...base,
    color: 'rgb(15 23 42)'
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'rgb(59 130 246 / 0.15)'
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'rgb(30 64 175)',
    fontWeight: 700
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'rgb(30 64 175)',
    ':hover': {
      backgroundColor: 'rgb(59 130 246 / 0.22)',
      color: 'rgb(30 64 175)'
    }
  })
};

const toggleMultiValue = (value: string, selected: string[]) =>
  selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleParams = parseMechanicFilterParam(searchParams.get('vehicle'));
  const serviceParams = parseMechanicFilterParam(searchParams.get('service'));
  const search = searchParams.get('search') || '';
  const routeTo = searchParams.get('routeTo');
  const radiusParam = Number(searchParams.get('radius') || '5');
  const sortParam = (searchParams.get('sort') as MechanicSort) || 'Nearest';
  
  const [mechanics, setMechanics] = useState<any[]>([]);
  const { userLocation, isLoading: locationLoading, locationSource, locationMessage, requestLocation } = useLocationContext();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  
  const [mechanicsLoading, setMechanicsLoading] = useState(true);
  
  const [selectedMechanic, setSelectedMechanic] = useState<any | null>(null);
  
  // Sheet states: 0 = collapsed (25%), 1 = half (50%), 2 = full (100%)
  const [sheetState, setSheetState] = useState<0 | 1 | 2>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [filterTouchStart, setFilterTouchStart] = useState<number | null>(null);
  const [filterDragOffset, setFilterDragOffset] = useState(0);
  
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [drivingDistance, setDrivingDistance] = useState<string | null>(null);
  const [drivingTime, setDrivingTime] = useState<string | null>(null);
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMechanicForDetails, setSelectedMechanicForDetails] = useState<any | null>(null);
  
  // Controls state
  const [showControls, setShowControls] = useState(false);
  const [radius, setRadius] = useState<number>(Number.isFinite(radiusParam) ? radiusParam : 5);
  const [routeOption, setRouteOption] = useState<'Fastest' | 'Shortest' | 'Avoid Toll'>('Fastest');
  const [sortBy, setSortBy] = useState<'Nearest' | 'Available'>(sortParam === 'Available' ? 'Available' : 'Nearest');

  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [searchDraft, setSearchDraft] = useState(search);
  const [pendingVehicles, setPendingVehicles] = useState<string[]>(vehicleParams);
  const [pendingServices, setPendingServices] = useState<string[]>(serviceParams);

  const vehicleSelectOptions = vehicleOptions.map((item) => ({ value: item, label: item }));
  const serviceSelectOptions = serviceOptions.map((item) => ({ value: item, label: item }));

  const toggleFeedbackOption = (option: string) => {
    setSelectedFeedback(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleFeedbackSubmit = async () => {
    try {
      const type = 'Mechanic Data Issue';
      const description = `Mechanic ID: ${selectedMechanic?.id}\nBusiness: ${selectedMechanic?.businessName || selectedMechanic?.name}\nIssues: ${selectedFeedback.join(', ')}\nAdditional Details: ${feedbackText}`;
      
      await apiClient('/public/feedback', { method: 'POST', data: { type, description } });
      
      setIsFeedbackOpen(false);
      setSelectedFeedback([]);
      setFeedbackText('');
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  // Route Fetching
  useEffect(() => {
    if (!selectedMechanic || !userLocation) {
      setRouteCoords([]);
      setDrivingDistance(null);
      return;
    }

    const fetchRoute = async () => {
      try {
        const data = await apiClient<any>('/public/route', {
          method: 'POST',
          data: {
            startLat: userLocation[0],
            startLng: userLocation[1],
            endLat: selectedMechanic.latitude,
            endLng: selectedMechanic.longitude,
            routeOption
          }
        });

        if (data.routeCoords?.length > 0) {
          const coords = data.routeCoords as [number, number][];
          setRouteCoords(coords);
          setDrivingDistance(String(data.distanceKm));

          const durationMins = data.durationMinutes as number;
          setDrivingTime(durationMins > 60
            ? `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`
            : `${durationMins} min`);
          if (mapInstance) {
            mapInstance.fitBounds(coords, { padding: [50, 50] });
          }
        }
      } catch (err) {
        toast.error('Route service is temporarily unavailable. Please try again.');
      }
    };
    
    fetchRoute();
  }, [selectedMechanic, userLocation?.[0], userLocation?.[1], routeOption]);

  const locateUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.flyTo(userLocation, 14);
    }
  };

  useEffect(() => {
    setRadius(Number.isFinite(radiusParam) ? radiusParam : 5);
    setSortBy(sortParam === 'Available' ? 'Available' : 'Nearest');
    setSearchDraft(search);
    setPendingVehicles(vehicleParams);
    setPendingServices(serviceParams);
  }, [radiusParam, sortParam, search, searchParams]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vehicleData, serviceData] = await Promise.all([
          apiClient<any>('/public/vehicles'),
          apiClient<any>('/public/services')
        ]);
        setVehicleOptions(vehicleData.map((item: any) => item.name));
        setServiceOptions(serviceData.map((item: any) => item.name));
      } catch (err) {
        console.error('Failed to load map filter options', err);
      }
    };

    fetchOptions();
  }, [radiusParam, sortParam]);

  useEffect(() => {
    const fetchMechanics = async () => {
      setMechanicsLoading(true);
      try {
        const params = buildMechanicSearchParams({
          vehicle: vehicleParams,
          service: serviceParams,
          search
        });
        let data = await apiClient<any>(`/public/mechanics?${params.toString()}`);
        
        // Add status and distance
        data = data.map((m: any) => ({
          ...m,
          currentStatus: getMechanicStatus(m),
          distance: userLocation ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], m.latitude, m.longitude) : 999999
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
  }, [search, userLocation, routeTo, locationLoading, searchParams]);

  // Derived state: filtered and sorted mechanics
  const visibleMechanics = useMemo(() => {
    let filtered = userLocation ? mechanics.filter(m => m.distance <= radius) : mechanics;

    filtered.sort((a, b) => {
      if (sortBy === 'Available') {
        if (a.currentStatus === 'Available' && b.currentStatus !== 'Available') return -1;
        if (a.currentStatus !== 'Available' && b.currentStatus === 'Available') return 1;
      }
      return a.distance - b.distance;
    });
    return filtered;
  }, [mechanics, radius, sortBy]);

  const visibleInBoundsCount = useMemo(() => {
    if (!mapBounds) return visibleMechanics.length;
    return visibleMechanics.filter((mechanic) => mapBounds.contains([mechanic.latitude, mechanic.longitude])).length;
  }, [visibleMechanics, mapBounds]);

  const syncQuery = (updates: {
    search?: string;
    vehicle?: string[];
    service?: string[];
    radius?: number;
    sort?: 'Nearest' | 'Available';
    routeTo?: string | number | null;
  }) => {
    const params = buildMechanicSearchParams({
      search: updates.search ?? search,
      vehicle: updates.vehicle ?? vehicleParams,
      service: updates.service ?? serviceParams,
      radius: updates.radius ?? radius,
      sort: updates.sort ?? sortBy,
      routeTo: updates.routeTo === null ? undefined : updates.routeTo ?? routeTo ?? undefined
    });
    navigate(`/map?${params.toString()}`, { replace: true });
  };

  const openExternalNavigation = (mechanic = selectedMechanic) => {
    if (!mechanic) return;
    const destination = `${mechanic.latitude},${mechanic.longitude}`;
    const origin = userLocation ? `&origin=${encodeURIComponent(`${userLocation[0]},${userLocation[1]}`)}` : '';
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${origin}`, '_blank', 'noopener,noreferrer');
  };

  const positionedVisibleMechanics = useMemo(() => {
    const grouped = new Map<string, any[]>();
    visibleMechanics.forEach((mechanic) => {
      const key = `${mechanic.latitude.toFixed(6)},${mechanic.longitude.toFixed(6)}`;
      const existing = grouped.get(key) || [];
      existing.push(mechanic);
      grouped.set(key, existing);
    });

    return visibleMechanics.map((mechanic) => {
      const key = `${mechanic.latitude.toFixed(6)},${mechanic.longitude.toFixed(6)}`;
      const group = grouped.get(key) || [mechanic];
      const index = group.findIndex((item) => item.id === mechanic.id);

      if (group.length <= 1 || index === -1) {
        return { ...mechanic, displayLatitude: mechanic.latitude, displayLongitude: mechanic.longitude };
      }

      const angle = (Math.PI * 2 * index) / group.length;
      const offset = 0.00018;
      return {
        ...mechanic,
        displayLatitude: mechanic.latitude + Math.cos(angle) * offset,
        displayLongitude: mechanic.longitude + Math.sin(angle) * offset
      };
    });
  }, [visibleMechanics]);

  const selectedMechanicPosition = useMemo(() => {
    if (!selectedMechanic) return null;
    const positioned = positionedVisibleMechanics.find((mechanic) => mechanic.id === selectedMechanic.id);
    return positioned
      ? [positioned.displayLatitude, positioned.displayLongitude] as [number, number]
      : [selectedMechanic.latitude, selectedMechanic.longitude] as [number, number];
  }, [positionedVisibleMechanics, selectedMechanic]);

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
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentY = e.targetTouches[0].clientY;
    const delta = currentY - touchStart;
    setDragOffset(Math.max(-120, Math.min(180, delta)));
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
    setDragOffset(0);
  };

  const handleFilterTouchStart = (e: React.TouchEvent) => {
    setFilterTouchStart(e.targetTouches[0].clientY);
    setFilterDragOffset(0);
  };

  const handleFilterTouchMove = (e: React.TouchEvent) => {
    if (filterTouchStart === null) return;
    const delta = e.targetTouches[0].clientY - filterTouchStart;
    setFilterDragOffset(Math.max(0, Math.min(220, delta)));
  };

  const handleFilterTouchEnd = (e: React.TouchEvent) => {
    if (filterTouchStart === null) return;
    const distance = e.changedTouches[0].clientY - filterTouchStart;
    if (distance > 80) {
      setShowControls(false);
    }
    setFilterTouchStart(null);
    setFilterDragOffset(0);
  };

  const getSheetHeightClass = () => {
    if (sheetState === 0) return 'h-[35vh] sm:h-auto';
    if (sheetState === 1) return 'h-[50vh] sm:h-auto';
    return 'h-[90vh] sm:h-auto';
  };


  const isLoading = locationLoading || mechanicsLoading;
  const loadingMessage = locationLoading 
    ? 'Getting your location...' 
    : 'Finding mechanics near you...';

  return (
    <div className="flex-1 w-full relative bg-background flex flex-col min-h-0">
      {locationMessage && (
        <div className="absolute left-4 right-4 top-4 z-[1200] sm:left-1/2 sm:right-auto sm:w-[520px] sm:-translate-x-1/2">
          <div className="rounded-2xl border border-amber-500/30 bg-card/95 p-4 shadow-xl backdrop-blur">
            {/* <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-500/15 p-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  {locationSource === 'ip' ? 'Approximate location in use' : 'Location unavailable'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{locationMessage}</p>
              </div>
              <button
                onClick={() => requestLocation()}
                className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Retry
              </button>
            </div> */}
          </div>
        </div>
      )}

      <div className="absolute left-4 top-4 z-[390] max-w-[calc(100%-5rem)] rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-lg backdrop-blur sm:left-4 sm:right-auto sm:max-w-sm">
        <p className="text-sm font-bold text-foreground">
          {visibleMechanics.length} mechanics match your filters
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {visibleInBoundsCount} currently visible in this map area
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-muted-foreground">
          {vehicleParams.length > 0 && <span className="rounded-full bg-secondary px-2.5 py-1">Vehicle: {vehicleParams.length}</span>}
          {serviceParams.length > 0 && <span className="rounded-full bg-secondary px-2.5 py-1">Service: {serviceParams.length}</span>}
        </div>
      </div>

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
          title={userLocation ? 'Center on my location' : 'Location not available'}
        >
          <LocateFixed className="w-6 h-6" />
        </button>
      </div>

      {showControls && (
        <>
        <div className="fixed inset-0 z-[390] bg-black/35 backdrop-blur-[1px] sm:hidden" onClick={() => setShowControls(false)}></div>
        <div
          className="fixed inset-x-0 bottom-0 z-[400] max-h-[78vh] overflow-y-auto rounded-t-[28px] border border-border bg-card p-4 shadow-2xl animate-in slide-in-from-bottom-8 sm:absolute sm:inset-auto sm:top-20 sm:right-4 sm:w-[340px] sm:max-h-[82vh] sm:rounded-2xl sm:slide-in-from-top-4"
          onTouchStart={handleFilterTouchStart}
          onTouchMove={handleFilterTouchMove}
          onTouchEnd={handleFilterTouchEnd}
          style={filterDragOffset !== 0 ? { transform: `translateY(${filterDragOffset}px)` } : undefined}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted sm:hidden"></div>
          <div className="mb-4 rounded-xl border border-border bg-secondary/30 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Current Filters</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{search ? `Search: ${search}` : 'No text search applied'}</p>
            <p className="mt-1 text-xs text-muted-foreground">{vehicleParams.length > 0 ? `${vehicleParams.length} vehicles` : 'Any vehicle'} • {serviceParams.length > 0 ? `${serviceParams.length} services` : 'Any service'} • {radius === 50000 ? 'Any distance' : `${radius} km`} • {sortBy}</p>
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-foreground">Vehicle Type</label>
            <Select
              isMulti
              isSearchable
              placeholder="Select vehicle types"
              options={vehicleSelectOptions}
              value={vehicleSelectOptions.filter((option) => pendingVehicles.includes(option.value))}
              onChange={(selected) => {
                const nextValues = selected.map((option) => option.value);
                setPendingVehicles(nextValues);
                syncQuery({ vehicle: nextValues, service: pendingServices, routeTo: null });
              }}
              className="text-sm"
              classNamePrefix="map-filter-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-bold text-foreground">Service Type</label>
            <Select
              isMulti
              isSearchable
              placeholder="Select service types"
              options={serviceSelectOptions}
              value={serviceSelectOptions.filter((option) => pendingServices.includes(option.value))}
              onChange={(selected) => {
                const nextValues = selected.map((option) => option.value);
                setPendingServices(nextValues);
                syncQuery({ vehicle: pendingVehicles, service: nextValues, routeTo: null });
              }}
              className="text-sm"
              classNamePrefix="map-filter-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
            />
          </div>
          <div className="mb-4">
            <p className="font-bold mb-2">Search Radius</p>
            <div className="flex flex-wrap gap-2">
              {[1, 3, 5, 10, 50, 50000].map(r => (
                <button 
                  key={r}
                  onClick={() => {
                    setRadius(r);
                    syncQuery({ radius: r });
                  }}
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
                  onClick={() => {
                    const nextSort = s as 'Nearest' | 'Available';
                    setSortBy(nextSort);
                    syncQuery({ sort: nextSort });
                  }}
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
          <button
            onClick={() => {
              setRouteOption('Fastest');
              setRadius(5);
              setSortBy('Nearest');
              setPendingVehicles([]);
              setPendingServices([]);
              navigate(`/map?${buildMechanicSearchParams({ radius: 5, sort: 'Nearest' }).toString()}`, { replace: true });
            }}
            className="w-full rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary"
          >
            Reset Controls
          </button>
        </div>
        </>
      )}

      <MapContainer 
        center={userLocation || [20.5937, 78.9629]} 
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
        <ChangeView center={userLocation || [20.5937, 78.9629]} />
        <MapBoundsListener setBounds={setMapBounds} />
        
        {/* Radius Circle */}
        {userLocation && <Circle center={userLocation} radius={radius * 1000} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 1 }} />}
        
        {userLocation && <Marker position={userLocation} icon={userIcon} />}

        {positionedVisibleMechanics.filter((mechanic) => mechanic.id !== selectedMechanic?.id).map((mechanic) => (
          <Marker 
            key={mechanic.id} 
            position={[mechanic.displayLatitude, mechanic.displayLongitude]}
            icon={getIconForStatus(mechanic.currentStatus)}
            eventHandlers={{
              click: () => {
                setSelectedMechanic(mechanic);
                setSheetState(1);
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -22]} opacity={0.95}>
              <div className="min-w-[130px]">
                <p className="font-semibold">{mechanic.businessName || mechanic.name}</p>
                <p className="text-xs text-muted-foreground">{mechanic.area}</p>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {selectedMechanic && selectedMechanicPosition && (
          <Marker
            position={selectedMechanicPosition}
            icon={selectedIcon}
            zIndexOffset={1000}
            eventHandlers={{
              click: () => {
                setSheetState(1);
              }
            }}
          >
            <Tooltip direction="top" offset={[0, -24]} opacity={1} permanent={false}>
              <div className="min-w-[140px]">
                <p className="font-semibold">{selectedMechanic.businessName || selectedMechanic.name}</p>
                <p className="text-xs text-muted-foreground">{selectedMechanic.area}</p>
              </div>
            </Tooltip>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline positions={routeCoords} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.8 }} />
        )}
      </MapContainer>

      {/* Mechanic Details - Bottom Sheet (Mobile) / Side Panel (Desktop) */}
      {selectedMechanic && (
        <>

          <div 
            className={`fixed sm:absolute bottom-0 sm:bottom-[10%] sm:left-4 sm:top-1/2 sm:-translate-y-1/2 w-full sm:w-[400px] z-[500] flex flex-col pointer-events-none rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl pb-safe pb-[72px] sm:pb-0 ${getSheetHeightClass()} ${touchStart !== null ? 'transition-none' : 'transition-all duration-300'}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={dragOffset !== 0 ? { transform: `translateY(${dragOffset}px)` } : undefined}
          >
            <div className="bg-card border-t sm:border border-border flex flex-col pointer-events-auto h-full w-full">
              {/* Mobile handle */}
              <div className="w-full flex justify-center py-3 sm:hidden cursor-pointer shrink-0" onClick={() => setSheetState(prev => prev === 2 ? 1 : 2)}>
                <div className="w-12 h-1.5 bg-muted rounded-full"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
                <div className="p-4 sm:p-5 flex gap-4 relative">
                  {selectedMechanic.image ? (
                    <div 
                      className="relative shrink-0 overflow-hidden rounded-xl w-20 h-20 group/img cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                      onClick={(e) => { e.stopPropagation(); setSelectedMechanicForDetails(selectedMechanic); setIsDetailsOpen(true); }}
                    >
                      <img src={selectedMechanic.image} alt={selectedMechanic.businessName || selectedMechanic.name} className="w-full h-full object-cover bg-secondary group-hover/img:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <Eye className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center shrink-0 relative group/img cursor-pointer shadow-sm hover:shadow-md overflow-hidden transition-colors"
                      onClick={(e) => { e.stopPropagation(); setSelectedMechanicForDetails(selectedMechanic); setIsDetailsOpen(true); }}
                    >
                      <Wrench className="w-8 h-8 text-muted-foreground/30" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                        <Eye className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground mb-1 leading-tight truncate">{selectedMechanic.businessName || selectedMechanic.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                      <MapPin className="w-4 h-4 shrink-0" /> {selectedMechanic.landmark ? `${selectedMechanic.landmark}, ` : ''}{selectedMechanic.area}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-secondary rounded-md">
                        <div className={`w-2 h-2 rounded-full ${getMechanicStatus(selectedMechanic) === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        {getMechanicStatus(selectedMechanic)}
                      </div>
                      <div className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md whitespace-nowrap">
                        {drivingTime ? `${drivingTime} ` : ''}{userLocation ? `(${getDistanceFromLatLonInKm(userLocation[0], userLocation[1], selectedMechanic.latitude, selectedMechanic.longitude).toFixed(1)} km)` : ''}
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
                     openExternalNavigation(selectedMechanic);
                   }} className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 border border-border shadow-sm transition-colors shrink-0">
                     <Navigation className="w-5 h-5" />
                   </button>
                </div>

                {/* Community Action Buttons */}
                <div className="flex gap-3 px-4 py-3 shrink-0 border-b border-border/50">
                  <button onClick={() => setIsFeedbackOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/50 text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 transition-colors shadow-[0_0_8px_rgba(249,115,22,0.3)] animate-pulse">
                    <MessageSquare className="w-4 h-4 text-primary" /> Feedback
                  </button>
                  <button onClick={() => navigate('/donate')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-pink-500/50 text-pink-500 font-bold text-sm bg-pink-500/5 hover:bg-pink-500/10 transition-colors shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse">
                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500/50" /> Donate
                  </button>
                </div>

                {/* Extended Details for sheetState > 0 */}
                {(sheetState > 0) && (
                  <div className="p-4 sm:p-5 animate-in fade-in duration-300">
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> Nearby Mechanics
                      </h4>
                      <p className="mb-3 text-xs text-muted-foreground">
                        Closest alternatives to this mechanic based on current map results.
                      </p>
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

      {/* Feedback Popup Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-[24px] shadow-2xl border border-border overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/30">
              <div>
                <h3 className="font-bold text-lg text-foreground">Report an Issue</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Help us improve the data for this mechanic.</p>
              </div>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <label className="block text-sm font-bold text-foreground mb-2">What is wrong?</label>
              <div className="flex flex-wrap gap-2 mb-5">
                {FEEDBACK_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleFeedbackOption(option)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                      selectedFeedback.includes(option) 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <label className="block text-sm font-bold text-foreground mb-2">Additional Details (Optional)</label>
              <textarea
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Tell us more about the issue..."
                className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
              />
            </div>
            
            <div className="p-4 border-t border-border/50 bg-muted/10">
              <button 
                onClick={handleFeedbackSubmit}
                disabled={selectedFeedback.length === 0 && feedbackText.trim() === ''}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mechanic Details Modal */}
      {isDetailsOpen && selectedMechanicForDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDetailsOpen(false)}>
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
                    <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getMechanicStatus(selectedMechanicForDetails) === 'Available' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                    <span className="font-bold text-sm text-foreground">{getMechanicStatus(selectedMechanicForDetails)}</span>
                  </div>
                </div>
                {userLocation && (
                  <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Distance</span>
                    <span className="font-bold text-sm text-foreground text-primary">{getDistanceFromLatLonInKm(userLocation[0], userLocation[1], selectedMechanicForDetails.latitude, selectedMechanicForDetails.longitude).toFixed(1)} km away</span>
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
               <button onClick={() => { setIsDetailsOpen(false); setSheetState(1); }} className="flex-[1.5] bg-primary text-primary-foreground h-12 rounded-xl flex justify-center items-center hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 font-bold text-sm gap-2">
                 <Navigation size={18} /> Navigate
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
