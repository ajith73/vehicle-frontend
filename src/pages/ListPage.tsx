import { useEffect, useState } from 'react';
import Select from 'react-select';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  Eye,
  Filter,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
  Wrench,
  X
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';
import { buildMechanicSearchParams, parseMechanicFilterParam, type MechanicSort } from '../utils/mechanicSearch';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
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

const getMechanicStatus = (mechanic: any) => mechanic?.currentStatus || 'Available';

const multiSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 48,
    backgroundColor: 'hsl(var(--background))',
    borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
    boxShadow: state.isFocused ? '0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 18%, transparent)' : 'none'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    zIndex: 130
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card)))' : 'hsl(var(--card))',
    color: 'hsl(var(--foreground))'
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--secondary)))'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  input: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  })
};

export default function ListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const vehicleParams = parseMechanicFilterParam(searchParams.get('vehicle'));
  const serviceParams = parseMechanicFilterParam(searchParams.get('service'));
  const searchParam = searchParams.get('search') || '';
  const radiusParam = Number(searchParams.get('radius') || '5');
  const sortParam = (searchParams.get('sort') as MechanicSort) || 'Nearest';

  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [radius, setRadius] = useState<number>(Number.isFinite(radiusParam) ? radiusParam : 5);
  const [sortBy, setSortBy] = useState<MechanicSort>(sortParam === 'Available' ? 'Available' : 'Nearest');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedMechanicForDetails, setSelectedMechanicForDetails] = useState<any | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<string[]>(vehicleParams);
  const [pendingServices, setPendingServices] = useState<string[]>(serviceParams);
  const [isLocationMessageExpanded, setIsLocationMessageExpanded] = useState(true);

  const {
    userLocation,
    isLoading: locationLoading,
    locationSource,
    locationMessage,
    requestLocation
  } = useLocationContext();

  useEffect(() => {
    setSearchQuery(searchParam);
    setPendingVehicles(vehicleParams);
    setPendingServices(serviceParams);
    setRadius(Number.isFinite(radiusParam) ? radiusParam : 5);
    setSortBy(sortParam === 'Available' ? 'Available' : 'Nearest');
  }, [searchParam, searchParams, radiusParam, sortParam]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [vehicleData, serviceData] = await Promise.all([
          apiClient<any>('/public/vehicles'),
          apiClient<any>('/public/services')
        ]);
        setVehicleOptions(vehicleData.map((vehicle: any) => vehicle.name));
        setServiceOptions(serviceData.map((service: any) => service.name));
      } catch (err) {
        console.error('Failed to load settings options', err);
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

  const updateQuery = (updates: {
    search?: string;
    vehicle?: string[];
    service?: string[];
    radius?: number;
    sort?: MechanicSort;
    routeTo?: string | number;
  }) => {
    const params = buildMechanicSearchParams({
      search: updates.search ?? searchQuery,
      vehicle: updates.vehicle ?? vehicleParams,
      service: updates.service ?? serviceParams,
      radius: updates.radius ?? radius,
      sort: updates.sort ?? sortBy,
      routeTo: updates.routeTo
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const fetchMechanics = async () => {
      setLoading(true);
      try {
        const params = buildMechanicSearchParams({
          search: searchParam,
          vehicle: vehicleParams,
          service: serviceParams
        });
        const data = await apiClient<any>(`/public/mechanics?${params.toString()}`);

        let processedData = data.map((mechanic: any) => ({
          ...mechanic,
          dist: userLocation
            ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], mechanic.latitude, mechanic.longitude)
            : null
        }));

        if (userLocation) {
          processedData = processedData.filter((mechanic: any) => mechanic.dist === null || mechanic.dist <= radius);
        }

        processedData.sort((a: any, b: any) => {
          if (sortBy === 'Available') {
            const statusA = getMechanicStatus(a);
            const statusB = getMechanicStatus(b);
            if (statusA === 'Available' && statusB !== 'Available') return -1;
            if (statusA !== 'Available' && statusB === 'Available') return 1;
          }

          if (a.dist === null && b.dist === null) return 0;
          if (a.dist === null) return 1;
          if (b.dist === null) return -1;
          return a.dist - b.dist;
        });

        setMechanics(processedData);
      } catch (err) {
        console.error('Failed to fetch mechanics', err);
      } finally {
        setLoading(false);
      }
    };

    if (!locationLoading) {
      fetchMechanics();
    }
  }, [searchParam, searchParams, userLocation, locationLoading, radius, sortBy]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchParam, searchParams, radius, sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 500) {
        setVisibleCount((prev) => Math.min(prev + 10, mechanics.length));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mechanics.length]);

  const displayedMechanics = mechanics.slice(0, visibleCount);
  const hasMoreResults = displayedMechanics.length < mechanics.length;
  const resultSummary = userLocation
    ? `${mechanics.length} mechanics within ${radius} km`
    : `${mechanics.length} mechanics found`;
  const emptyStateReason = [
    searchParam ? `search "${searchParam}"` : null,
    vehicleParams.length > 0 ? `vehicle "${vehicleParams.join(', ')}"` : null,
    serviceParams.length > 0 ? `service "${serviceParams.join(', ')}"` : null,
    userLocation ? `radius ${radius} km` : null
  ].filter(Boolean).join(', ');

  const locationLabel = locationSource === 'geolocation'
    ? 'Precise location in use'
    : locationSource === 'manual'
      ? 'Manual location in use'
      : locationSource === 'ip'
        ? 'Approximate location in use'
        : 'Location unavailable';

  const mapQuery = buildMechanicSearchParams({
    search: searchParam,
    vehicle: vehicleParams,
    service: serviceParams,
    radius,
    sort: sortBy
  }).toString();

  const vehicleSelectOptions = vehicleOptions.map((vehicle) => ({ value: vehicle, label: vehicle }));
  const serviceSelectOptions = serviceOptions.map((service) => ({ value: service, label: service }));

  return (
    <div className="relative flex min-h-screen flex-col bg-background pb-20 sm:pb-0">
      <div className="sticky top-0 z-10 border-b border-border bg-card px-4 pt-6 pb-4 shadow-sm sm:px-8">
        <div className="mx-auto mb-4 flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full transition-colors hover:bg-secondary active:scale-95">
              <ChevronLeft size={24} />
            </button>
            <h2 className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-2xl font-black text-transparent">
              Mechanics
            </h2>
          </div>

          <div className="flex items-center rounded-xl bg-secondary p-1 shadow-inner">
            <button className="rounded-lg bg-background px-4 py-1.5 text-sm font-bold text-foreground shadow">
              List
            </button>
            <button
              onClick={() => navigate(`/map?${mapQuery}`)}
              className="rounded-lg px-4 py-1.5 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
            >
              Map
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, area, city, vehicle, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateQuery({ search: searchQuery });
                }}
                onBlur={() => {
                  if (searchQuery !== searchParam) updateQuery({ search: searchQuery });
                }}
                className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-12 pr-4 text-base shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-secondary px-4 transition-colors hover:bg-secondary/80"
            >
              <Filter className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex-1 w-full max-w-7xl px-4 py-6 sm:px-8">
        {locationMessage && (
          <div 
            onClick={() => !isLocationMessageExpanded && setIsLocationMessageExpanded(true)}
            className={`mb-5 flex gap-3 rounded-2xl border border-amber-500/30 bg-card p-4 shadow-sm transition-all duration-300 ${isLocationMessageExpanded ? 'items-start cursor-default' : 'items-center cursor-pointer hover:bg-card/80 w-fit'}`}
          >
            <div className={`rounded-xl bg-amber-500/15 p-2 text-amber-600 ${!isLocationMessageExpanded && 'shrink-0'}`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            
            {isLocationMessageExpanded ? (
              <div className="min-w-0 flex-1 animate-in fade-in duration-300">
                <p className="text-sm font-semibold text-foreground">{locationLabel}</p>
                <p className="mt-1 text-sm text-muted-foreground">{locationMessage}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                  className="mt-3 shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0 animate-in fade-in duration-300">
                <button
                  onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                  className="shrink-0 text-sm font-bold text-primary hover:underline"
                >
                  Enable device location
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {vehicleParams.length > 0 || serviceParams.length > 0 || searchParam ? 'Filtered Results' : 'Nearby Mechanics'}
            </h3>
            <p className="text-sm text-muted-foreground">{resultSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            {vehicleParams.length > 0 && <span className="rounded-full bg-secondary px-3 py-1">Vehicle: {vehicleParams.join(', ')}</span>}
            {serviceParams.length > 0 && <span className="rounded-full bg-secondary px-3 py-1">Service: {serviceParams.join(', ')}</span>}
            {searchParam && <span className="rounded-full bg-secondary px-3 py-1">Search: {searchParam}</span>}
            {sortBy === 'Available' && <span className="rounded-full bg-secondary px-3 py-1">Available first</span>}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : mechanics.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-10 text-center text-muted-foreground">
            <Wrench className="mx-auto mb-3 h-12 w-12 opacity-20" />
            <p className="font-semibold text-foreground">No mechanics found for these filters.</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
              {emptyStateReason
                ? `Nothing matched ${emptyStateReason}. Try broadening one of those filters or changing your location.`
                : 'Try using a wider radius, another service, or a different location.'}
            </p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPendingVehicles([]);
                  setPendingServices([]);
                  setSearchParams(buildMechanicSearchParams({ radius: 5, sort: 'Nearest' }));
                }}
                className="rounded-lg bg-secondary px-4 py-2 font-bold text-secondary-foreground hover:bg-secondary/80"
              >
                Clear Filters
              </button>
              <button
                onClick={() => navigate('/')}
                className="rounded-lg bg-primary px-4 py-2 font-bold text-primary-foreground hover:bg-primary/90"
              >
                Change Location
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedMechanics.map((mechanic) => {
                const status = getMechanicStatus(mechanic);
                return (
                  <div key={mechanic.id} className="group flex cursor-pointer flex-col gap-4 rounded-[24px] border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 sm:p-5">
                    <div className="flex gap-4">
                      {mechanic.image ? (
                        <div
                          className="group/img relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md sm:h-28 sm:w-28"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMechanicForDetails(mechanic);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <img src={mechanic.image} alt={mechanic.businessName || mechanic.name} className="h-full w-full object-cover bg-secondary transition-transform duration-500 group-hover/img:scale-110" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/img:opacity-100">
                            <Eye className="h-8 w-8 text-white drop-shadow-md" />
                          </div>
                        </div>
                      ) : (
                        <div
                          className="group/img relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-secondary/50 shadow-sm transition-colors duration-300 hover:shadow-md group-hover:bg-primary/5 sm:h-28 sm:w-28"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMechanicForDetails(mechanic);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Wrench className="h-8 w-8 text-muted-foreground/30" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/img:opacity-100">
                            <Eye className="h-8 w-8 text-white drop-shadow-md" />
                          </div>
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                        <div>
                          <div className="mb-1.5 flex items-start justify-between gap-2">
                            <h4 className="truncate text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">{mechanic.businessName || mechanic.name}</h4>
                            {mechanic.dist !== null && (
                              <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                                {mechanic.dist.toFixed(1)} km
                              </span>
                            )}
                          </div>
                          <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-muted-foreground">
                            <MapPin size={14} className="shrink-0 text-primary/70" />
                            <span className="truncate">{mechanic.landmark ? `${mechanic.landmark}, ` : ''}{mechanic.area}</span>
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            status === 'Available'
                              ? 'border-green-500/20 bg-green-500/10 text-green-600'
                              : 'border-red-500/20 bg-red-500/10 text-red-600'
                          }`}>
                            {status}
                          </span>
                          {mechanic.is24Hours && <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">24/7</span>}
                          {mechanic.evSupport && <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">EV Ready</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 border-t border-border/40 pt-3">
                      {mechanic.phone?.[0] && (
                        <a href={`tel:${mechanic.phone[0].number}`} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/80 text-[13px] font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-95">
                          <Phone size={16} /> <span className="hidden sm:inline">Call</span>
                        </a>
                      )}
                      {mechanic.phone?.[0]?.isWhatsapp && (
                        <a href={`https://wa.me/91${mechanic.phone[0].number}`} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/80 text-[13px] font-bold text-foreground transition-all hover:bg-green-600 hover:text-white active:scale-95">
                          <MessageCircle size={16} /> <span className="hidden sm:inline">WhatsApp</span>
                        </a>
                      )}
                      <button
                        onClick={() => navigate(`/map?${buildMechanicSearchParams({ search: searchParam, vehicle: vehicleParams, service: serviceParams, radius, sort: sortBy, routeTo: mechanic.id }).toString()}`)}
                        className="flex h-11 flex-[1.2] items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                      >
                        <Navigation size={16} /> <span>Navigate</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="py-8 text-center">
              {hasMoreResults ? (
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span>Showing {displayedMechanics.length} of {mechanics.length} mechanics. Scroll to load more.</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">You have reached the end of the results list.</p>
              )}
            </div>
          </>
        )}
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
          <div className="flex h-full w-full flex-col bg-card shadow-2xl animate-in slide-in-from-bottom-10 sm:h-auto sm:max-w-md sm:rounded-[24px] sm:border sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 p-5">
              <h3 className="text-lg font-bold text-foreground">Filter & Sort</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5 sm:max-h-[60vh]">
              <div className="rounded-2xl border border-border bg-secondary/20 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-muted-foreground">Current Filters</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-foreground">
                  <span className="rounded-full bg-card px-3 py-1">{searchQuery.trim() ? `Search: ${searchQuery}` : 'No search text'}</span>
                  <span className="rounded-full bg-card px-3 py-1">{pendingVehicles.length > 0 ? pendingVehicles.join(', ') : 'Any vehicle'}</span>
                  <span className="rounded-full bg-card px-3 py-1">{pendingServices.length > 0 ? pendingServices.join(', ') : 'Any service'}</span>
                  <span className="rounded-full bg-card px-3 py-1">{radius} km</span>
                  <span className="rounded-full bg-card px-3 py-1">{sortBy}</span>
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Sort By</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy('Nearest')}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition-colors ${sortBy === 'Nearest' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
                  >
                    Nearest
                  </button>
                  <button
                    onClick={() => setSortBy('Available')}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-bold transition-colors ${sortBy === 'Available' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary'}`}
                  >
                    Available First
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">Search Radius</label>
                  <span className="text-sm font-bold text-primary">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Vehicle Type</label>
                <Select
                  isMulti
                  options={vehicleSelectOptions}
                  value={vehicleSelectOptions.filter((option) => pendingVehicles.includes(option.value))}
                  onChange={(selected) => setPendingVehicles(selected.map((option) => option.value))}
                  styles={multiSelectStyles}
                  placeholder="Search and select vehicle types..."
                  closeMenuOnSelect={false}
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-foreground">Service Type</label>
                <Select
                  isMulti
                  options={serviceSelectOptions}
                  value={serviceSelectOptions.filter((option) => pendingServices.includes(option.value))}
                  onChange={(selected) => setPendingServices(selected.map((option) => option.value))}
                  styles={multiSelectStyles}
                  placeholder="Search and select service types..."
                  closeMenuOnSelect={false}
                />
              </div>
            </div>

            <div className="border-t border-border/50 bg-muted/10 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRadius(5);
                    setSortBy('Nearest');
                    setPendingVehicles([]);
                    setPendingServices([]);
                    setSearchParams(buildMechanicSearchParams({ radius: 5, sort: 'Nearest' }));
                    setIsFilterOpen(false);
                  }}
                  className="flex-1 rounded-xl border border-border bg-secondary/60 py-3 font-bold text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    updateQuery({ search: searchQuery, vehicle: pendingVehicles, service: pendingServices, radius, sort: sortBy });
                    setIsFilterOpen(false);
                  }}
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailsOpen && selectedMechanicForDetails && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4" onClick={() => setIsDetailsOpen(false)}>
          <div className="flex h-full w-full max-w-lg flex-col bg-card shadow-2xl animate-in zoom-in-95 duration-200 sm:h-auto sm:max-h-[90vh] sm:rounded-[24px] sm:border border-border" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-48 shrink-0 bg-secondary/50 sm:h-56">
              {selectedMechanicForDetails.image ? (
                <img src={selectedMechanicForDetails.image} alt="Mechanic" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Wrench className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <button onClick={() => setIsDetailsOpen(false)} className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 shadow-lg backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-2xl font-black leading-tight text-white drop-shadow-md">
                      {selectedMechanicForDetails.businessName || selectedMechanicForDetails.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-white/80 drop-shadow-md">
                      <MapPin size={14} className="text-primary" /> {selectedMechanicForDetails.landmark ? `${selectedMechanicForDetails.landmark}, ` : ''}{selectedMechanicForDetails.area}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Current Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${getMechanicStatus(selectedMechanicForDetails) === 'Available' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                    <span className="text-sm font-bold text-foreground">{getMechanicStatus(selectedMechanicForDetails)}</span>
                  </div>
                </div>
                {selectedMechanicForDetails.dist !== null && selectedMechanicForDetails.dist !== undefined && (
                  <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4">
                    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-muted-foreground">Distance</span>
                    <span className="text-sm font-bold text-primary">{selectedMechanicForDetails.dist.toFixed(1)} km away</span>
                  </div>
                )}
              </div>

              {selectedMechanicForDetails.address && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><MapPin size={16} className="text-primary" /> Full Address</h4>
                  <p className="rounded-xl border border-border/30 bg-secondary/20 p-4 text-sm leading-relaxed text-muted-foreground">
                    {selectedMechanicForDetails.address}
                  </p>
                </div>
              )}

              {selectedMechanicForDetails.vehicleTypes?.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><Navigation size={16} className="text-primary" /> Supported Vehicles</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMechanicForDetails.vehicleTypes.map((vehicle: string) => (
                      <span key={vehicle} className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">{vehicle}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMechanicForDetails.serviceTypes?.length > 0 && (
                <div>
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground"><Wrench size={16} className="text-primary" /> Services Offered</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMechanicForDetails.serviceTypes.map((service: string) => (
                      <span key={service} className="rounded-lg border border-border bg-secondary/80 px-3 py-1.5 text-xs font-medium text-foreground">{service}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 gap-2 border-t border-border/50 bg-muted/10 p-4">
              {selectedMechanicForDetails.phone?.[0] && (
                <a href={`tel:${selectedMechanicForDetails.phone[0].number}`} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/80 text-sm font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-95">
                  <Phone size={18} /> Call
                </a>
              )}
              <button
                onClick={() => navigate(`/map?${buildMechanicSearchParams({ search: searchParam, vehicle: vehicleParams, service: serviceParams, radius, sort: sortBy, routeTo: selectedMechanicForDetails.id }).toString()}`)}
                className="flex h-12 flex-[1.5] items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
              >
                <Navigation size={18} /> Navigate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
