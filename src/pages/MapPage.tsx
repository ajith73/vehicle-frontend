import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip } from 'react-leaflet';
import { Settings2, LocateFixed, AlertTriangle, Plus, Minus, Compass } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { apiClient } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';
import { useDataContext } from '../contexts/DataContext';
import toast from 'react-hot-toast';
import { buildMechanicSearchParams, parseMechanicFilterParam, type MechanicSort } from '../utils/mechanicSearch';
import { getDistanceFromLatLonInKm, getMechanicStatus } from '../utils/mechanicUtils';
import { userIcon, getIconForStatus, selectedIcon, createClusterIcon } from '../components/map/MapIcons';
import { ChangeView, MapBoundsListener } from '../components/map/MapHelpers';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { MapFiltersControl } from '../components/map/MapFiltersControl';
import { FeedbackModal } from '../components/map/FeedbackModal';
import { MechanicDetailsModal } from '../components/shared/MechanicDetailsModal';
import { MechanicBottomSheet } from '../components/map/MechanicBottomSheet';

export default function MapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const vehicleParams = parseMechanicFilterParam(searchParams.get('vehicle'));
  const serviceParams = parseMechanicFilterParam(searchParams.get('service'));
  const search = searchParams.get('search') || '';
  const routeTo = searchParams.get('routeTo');
  const radiusParam = Number(searchParams.get('radius') || '5');
  const availabilityParam = (searchParams.get('availability') as 'All' | 'Available' | 'Not Available') || 'All';
  
  const [mechanics, setMechanics] = useState<any[]>([]);
  const { userLocation, isLoading: locationLoading, locationSource, locationMessage, requestLocation } = useLocationContext();
  const [isLocationMessageExpanded, setIsLocationMessageExpanded] = useState(true);
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
  const [availability, setAvailability] = useState<'All' | 'Available' | 'Not Available'>(availabilityParam);

  // Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  
  const { vehicles, services } = useDataContext();
  const [pendingVehicles, setPendingVehicles] = useState<string[]>(vehicleParams);
  const [pendingServices, setPendingServices] = useState<string[]>(serviceParams);

  const vehicleSelectOptions = useMemo(() => vehicles.map((item) => ({ value: item.name, label: item.name })), [vehicles]);
  const serviceSelectOptions = useMemo(() => services.map((item) => ({ value: item.name, label: item.name })), [services]);

  useEffect(() => {
    if (locationMessage) {
      setIsLocationMessageExpanded(true);
      const timer = setTimeout(() => {
        setIsLocationMessageExpanded(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [locationMessage]);

  // Route Fetching
  useEffect(() => {
    if (!selectedMechanic || !userLocation) {
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

  useEffect(() => {
    setRadius(Number.isFinite(radiusParam) ? radiusParam : 5);
    setAvailability(availabilityParam);
    setPendingVehicles(vehicleParams);
    setPendingServices(serviceParams);
  }, [radiusParam, availabilityParam, search, searchParams]);

  useEffect(() => {
    const fetchMechanics = async () => {
      setMechanicsLoading(true);
      try {
        const params = buildMechanicSearchParams({
          vehicle: vehicleParams,
          service: serviceParams,
          search,
          lat: userLocation ? userLocation[0] : undefined,
          lng: userLocation ? userLocation[1] : undefined,
          radius: radius,
          availability: availability,
          limit: 1000
        });
        let data = await apiClient<any>(`/public/mechanics?${params.toString()}`);
        
        // Ensure distance is populated if not provided by backend (fallback)
        data = data.map((m: any) => ({
          ...m,
          currentStatus: getMechanicStatus(m),
          distance: m.dist !== undefined ? m.dist : (userLocation ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], m.latitude, m.longitude) : 999999)
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
        toast.error('Failed to load mechanics. Please try again.');
      } finally {
        setMechanicsLoading(false);
      }
    };
    if (!locationLoading) fetchMechanics();
  }, [search, userLocation, routeTo, locationLoading, searchParams]);

  // Derived state: filtered mechanics (backend handles most of this now, but we keep fallback filter)
  const visibleMechanics = useMemo(() => {
    let filtered = userLocation ? mechanics.filter(m => m.distance <= radius) : mechanics;

    if (availability === 'Available') {
      filtered = filtered.filter(m => m.currentStatus === 'Available');
    } else if (availability === 'Not Available') {
      filtered = filtered.filter(m => m.currentStatus !== 'Available');
    }

    filtered.sort((a, b) => a.distance - b.distance);
    return filtered;
  }, [mechanics, radius, availability]);

  const visibleInBoundsCount = useMemo(() => {
    if (!mapBounds) return visibleMechanics.length;
    return visibleMechanics.filter((mechanic) => mapBounds.contains([mechanic.latitude, mechanic.longitude])).length;
  }, [visibleMechanics, mapBounds]);

  const syncQuery = (updates: {
    search?: string;
    vehicle?: string[];
    service?: string[];
    radius?: number;
    availability?: 'All' | 'Available' | 'Not Available';
    routeTo?: string | number | null;
  }) => {
    const params = buildMechanicSearchParams({
      search: updates.search ?? search,
      vehicle: updates.vehicle ?? vehicleParams,
      service: updates.service ?? serviceParams,
      radius: updates.radius ?? radius,
      availability: updates.availability ?? availability,
      routeTo: updates.routeTo === null ? undefined : updates.routeTo ?? routeTo ?? undefined
    });
    navigate(`/map?${params.toString()}`, { replace: true });
  };

  const locateUser = () => {
    if (userLocation && mapInstance) {
      mapInstance.setView(userLocation, 14);
    } else {
      requestLocation();
    }
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


  const isLoading = locationLoading || mechanicsLoading;
  const loadingMessage = locationLoading 
    ? 'Getting your location...' 
    : 'Finding mechanics near you...';

  return (
    <div className="flex-1 w-full relative bg-background flex flex-col min-h-0">
      {locationMessage && (
        <div className="absolute left-4 right-4 top-4 z-[1200] sm:left-1/2 sm:right-auto sm:w-[520px] sm:-translate-x-1/2">
          <div 
            onClick={() => !isLocationMessageExpanded && setIsLocationMessageExpanded(true)}
            className={`rounded-2xl border border-amber-500/30 bg-card/95 p-4 shadow-xl backdrop-blur transition-all duration-300 ${isLocationMessageExpanded ? 'cursor-default' : 'cursor-pointer hover:bg-card w-fit sm:mx-auto'}`}
          >
            {isLocationMessageExpanded ? (
              <div className="flex items-start gap-3 animate-in fade-in duration-300">
                <div className="rounded-xl bg-amber-500/15 p-2 text-amber-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {locationSource === 'ip' ? 'Approximate location in use' : 'Location unavailable'}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{locationMessage}</p>
                </div>
                {locationSource !== 'geolocation' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                    className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                <div className="rounded-xl bg-amber-500/15 p-2 text-amber-600 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
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
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000]">
          <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-full shadow-lg border border-border/50 animate-in fade-in duration-300 zoom-in-95">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={() => setShowControls(!showControls)}
          aria-label="Map Settings and Filters"
          className="bg-card text-foreground p-2 rounded-full shadow-lg border border-border hover:bg-secondary/50 transition-colors w-10 h-10 flex items-center justify-center"
        >
          <Settings2 className="w-5 h-5" />
        </button>
        <button
          onClick={locateUser}
          aria-label="Center on my location"
          className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors w-10 h-10 flex items-center justify-center"
          title={userLocation ? 'Center on my location' : 'Location not available'}
        >
          <LocateFixed className="w-5 h-5" />
        </button>

        
        <div className="flex flex-col rounded-full shadow-lg border border-border overflow-hidden bg-card mt-1">
          <button
            onClick={() => mapInstance?.zoomIn()}
            aria-label="Zoom In"
            className="text-foreground p-2 hover:bg-secondary/50 transition-colors w-10 h-10 flex items-center justify-center border-b border-border"
            title="Zoom In"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => mapInstance?.zoomOut()}
            aria-label="Zoom Out"
            className="text-foreground p-2 hover:bg-secondary/50 transition-colors w-10 h-10 flex items-center justify-center"
            title="Zoom Out"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <MapFiltersControl
        showControls={showControls}
        setShowControls={setShowControls}
        search={search}
        vehicleParams={vehicleParams}
        serviceParams={serviceParams}
        radius={radius}
        availability={availability}
        routeOption={routeOption}
        vehicleSelectOptions={vehicleSelectOptions}
        serviceSelectOptions={serviceSelectOptions}
        pendingVehicles={pendingVehicles}
        setPendingVehicles={setPendingVehicles}
        pendingServices={pendingServices}
        setPendingServices={setPendingServices}
        syncQuery={syncQuery}
        setRadius={setRadius}
        setAvailability={setAvailability}
        setRouteOption={setRouteOption}
        filterDragOffset={filterDragOffset}
        handleFilterTouchStart={handleFilterTouchStart}
        handleFilterTouchMove={handleFilterTouchMove}
        handleFilterTouchEnd={handleFilterTouchEnd}
      />

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

        <MarkerClusterGroup chunkedLoading maxClusterRadius={60} iconCreateFunction={createClusterIcon}>
          {positionedVisibleMechanics.filter((mechanic) => mechanic.id !== selectedMechanic?.id).map((mechanic) => (
            <Marker 
              key={mechanic.id} 
              position={[mechanic.displayLatitude, mechanic.displayLongitude]}
              icon={getIconForStatus(mechanic.currentStatus)}
              eventHandlers={{
                click: () => {
                  setSelectedMechanic(mechanic);
                  setSheetState(1);
                  setShowControls(false);
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
        </MarkerClusterGroup>

        {selectedMechanic && selectedMechanicPosition && (
          <Marker
            position={selectedMechanicPosition}
            icon={selectedIcon}
            zIndexOffset={1000}
            eventHandlers={{
              click: () => {
                setSheetState(1);
                setShowControls(false);
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

      <MechanicBottomSheet
        selectedMechanic={selectedMechanic}
        setSelectedMechanic={setSelectedMechanic}
        nearbyMechanics={nearbyMechanics}
        sheetState={sheetState}
        setSheetState={setSheetState}
        userLocation={userLocation}
        drivingTime={drivingTime}
        touchStart={touchStart}
        dragOffset={dragOffset}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
        setIsDetailsOpen={setIsDetailsOpen}
        setSelectedMechanicForDetails={setSelectedMechanicForDetails}
        openExternalNavigation={openExternalNavigation}
        setIsFeedbackOpen={setIsFeedbackOpen}
        mapInstance={mapInstance}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        selectedMechanic={selectedMechanic}
      />

      <MechanicDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        selectedMechanicForDetails={selectedMechanicForDetails}
        userLocation={userLocation}
        onNavigate={() => setSheetState(1)}
      />
    </div>
  );
}
