import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Search, AlertTriangle, Wrench, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, apiClientWithHeaders } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';
import { buildMechanicSearchParams, parseMechanicFilterParam, type MechanicSort } from '../utils/mechanicSearch';
import { ListFiltersModal } from '../components/list/ListFiltersModal';
import { MechanicListCard } from '../components/list/MechanicListCard';
import { MechanicDetailsModal } from '../components/shared/MechanicDetailsModal';
import { MechanicListSkeleton } from '../components/list/MechanicListSkeleton';

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const limit = 50;
  const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);
  const [serviceOptions, setServiceOptions] = useState<string[]>([]);
  const [pendingVehicles, setPendingVehicles] = useState<string[]>(vehicleParams);
  const [pendingServices, setPendingServices] = useState<string[]>(serviceParams);
  const [isLocationMessageExpanded, setIsLocationMessageExpanded] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

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

  const updateQuery = useCallback((updates: {
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
  }, [searchQuery, vehicleParams, serviceParams, radius, sortBy, setSearchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== searchParam) {
        updateQuery({ search: searchQuery });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchParam, updateQuery]);

  useEffect(() => {
    setPage(1);
    setMechanics([]);
    setHasMore(true);
  }, [searchParam, searchParams, radius, sortBy, userLocation, refreshKey]);

  useEffect(() => {
    const fetchMechanics = async () => {
      if (page === 1) setLoading(true);
      else setIsLoadingMore(true);

      try {
        const params = buildMechanicSearchParams({
          search: searchParam,
          vehicle: vehicleParams,
          service: serviceParams,
          lat: userLocation ? userLocation[0] : undefined,
          lng: userLocation ? userLocation[1] : undefined,
          radius,
          sort: sortBy,
          page,
          limit
        });
        setError(null);

        const { data, headers } = await apiClientWithHeaders<any>(`/public/mechanics?${params.toString()}`);

        if (headers && headers['x-total-count']) {
          setTotalCount(parseInt(headers['x-total-count'], 10));
        } else if (page === 1) {
          // Fallback if header is missing
          setTotalCount(data.length);
        }

        if (page === 1) {
          setMechanics(data);
        } else {
          setMechanics(prev => [...prev, ...data]);
        }

        if (data.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error('Failed to fetch mechanics', err);
        setError('Failed to fetch mechanics. Please try again.');
        toast.error('Failed to fetch mechanics');
      } finally {
        if (page === 1) setLoading(false);
        else setIsLoadingMore(false);
      }
    };

    if (!locationLoading) {
      fetchMechanics();
    }
  }, [searchParam, searchParams, userLocation, locationLoading, radius, sortBy, page, refreshKey]);

  // Infinite Scroll via Intersection Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && !loading && !isLoadingMore && hasMore) {
        setPage(p => p + 1);
      }
    },
    [loading, isLoadingMore, hasMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [handleObserver, observerTarget.current]);

  const displayedMechanics = mechanics;
  const hasMoreResults = hasMore;
  const resultSummary = userLocation
    ? `${totalCount} mechanics within ${radius} km`
    : `${totalCount} mechanics found`;
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
                aria-label="Search mechanics"
                placeholder="Search by name, area, city, vehicle, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/30 py-3 pl-12 pr-4 text-base shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              aria-label="Open Filters"
              className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-secondary px-4 transition-colors hover:bg-secondary/80"
              title="Filters"
            >
              <Filter className="h-5 w-5 text-foreground" />
            </button>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              aria-label="Refresh results"
              className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-secondary px-4 transition-colors hover:bg-secondary/80"
              title="Refresh results"
            >
              <RefreshCw className={`h-5 w-5 text-foreground ${loading ? 'animate-spin' : ''}`} />
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
              <div className="min-w-0 flex-1 animate-in fade-in duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{locationLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{locationMessage}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                  className="shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
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
            <p className="text-sm text-muted-foreground">{loading && page === 1 ? 'Loading mechanics...' : resultSummary}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
            {vehicleParams.length > 0 && <span className="rounded-full bg-secondary px-3 py-1">Vehicle: {vehicleParams.join(', ')}</span>}
            {serviceParams.length > 0 && <span className="rounded-full bg-secondary px-3 py-1">Service: {serviceParams.join(', ')}</span>}
            {searchParam && <span className="rounded-full bg-secondary px-3 py-1">Search: {searchParam}</span>}
            {sortBy === 'Available' && <span className="rounded-full bg-secondary px-3 py-1">Available first</span>}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MechanicListSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-50 py-10 px-6 sm:px-8 text-center text-red-600">
            <AlertTriangle className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="mt-4 rounded-lg bg-red-100 px-4 py-2 font-bold text-red-700 hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : mechanics.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-10 px-6 sm:px-8 text-center text-muted-foreground">
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
              {displayedMechanics.map((mechanic) => (
                <MechanicListCard
                  key={mechanic.id}
                  mechanic={mechanic}
                  onOpenDetails={(m) => {
                    setSelectedMechanicForDetails(m);
                    setIsDetailsOpen(true);
                  }}
                  onNavigate={(id) => {
                    navigate(`/map?${buildMechanicSearchParams({ search: searchParam, vehicle: vehicleParams, service: serviceParams, radius, sort: sortBy, routeTo: id }).toString()}`);
                  }}
                />
              ))}
            </div>

            <div ref={observerTarget} className="py-8 text-center">
              {isLoadingMore ? (
                <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <span>Loading more mechanics...</span>
                </div>
              ) : hasMoreResults ? (
                <div className="h-6" /> // spacer
              ) : (
                <p className="text-sm text-muted-foreground">You have reached the end of the results list.</p>
              )}
            </div>
          </>
        )}
      </div>

      <ListFiltersModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        searchQuery={searchQuery}
        pendingVehicles={pendingVehicles}
        setPendingVehicles={setPendingVehicles}
        pendingServices={pendingServices}
        setPendingServices={setPendingServices}
        radius={radius}
        setRadius={setRadius}
        sortBy={sortBy}
        setSortBy={setSortBy}
        vehicleSelectOptions={vehicleSelectOptions}
        serviceSelectOptions={serviceSelectOptions}
        onReset={() => {
          setSearchQuery('');
          setRadius(5);
          setSortBy('Nearest');
          setPendingVehicles([]);
          setPendingServices([]);
          setSearchParams(buildMechanicSearchParams({ radius: 5, sort: 'Nearest' }));
        }}
        onApply={() => {
          updateQuery({ search: searchQuery, vehicle: pendingVehicles, service: pendingServices, radius, sort: sortBy });
        }}
      />

      <MechanicDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        selectedMechanicForDetails={selectedMechanicForDetails}
        userLocation={userLocation}
        onNavigate={() => {
          navigate(`/map?${buildMechanicSearchParams({ search: searchParam, vehicle: vehicleParams, service: serviceParams, radius, sort: sortBy, routeTo: selectedMechanicForDetails.id }).toString()}`);
        }}
      />
    </div>
  );
}
