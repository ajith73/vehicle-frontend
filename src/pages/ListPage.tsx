import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Search, AlertTriangle, Wrench, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient, apiClientWithHeaders } from '../api/apiClient';
import { useLocationContext } from '../contexts/LocationContext';
import { useDataContext } from '../contexts/DataContext';
import { buildMechanicSearchParams, parseMechanicFilterParam, type MechanicSort } from '../utils/mechanicSearch';
import { ListFiltersModal } from '../components/list/ListFiltersModal';
import { MechanicListCard } from '../components/list/MechanicListCard';
import { MechanicDetailsModal } from '../components/shared/MechanicDetailsModal';
import { MechanicListSkeleton } from '../components/list/MechanicListSkeleton';
import { SEO } from '../components/SEO';

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

  const { 
    vehicles, 
    services, 
    isLoadingData,
    cachedMechanics,
    cachedMechanicsTotalCount,
    cachedMechanicsParams,
    setCachedMechanicsData
  } = useDataContext();

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
    if (!isLoadingData) {
      setVehicleOptions(vehicles.map((v: any) => v.name));
      setServiceOptions(services.map((s: any) => s.name));
    }
  }, [vehicles, services, isLoadingData]);

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
        
        const paramsString = params.toString();

        // Check if we can use cached data for the first page
        if (page === 1 && cachedMechanics && cachedMechanicsParams === paramsString) {
          setMechanics(cachedMechanics);
          setTotalCount(cachedMechanicsTotalCount);
          setHasMore(cachedMechanics.length >= limit);
          setLoading(false);
          return;
        }

        if (page === 1) setLoading(true);
        else setIsLoadingMore(true);

        setError(null);

        const { data, headers } = await apiClientWithHeaders<any>(`/public/mechanics?${paramsString}`);

        let newTotalCount = totalCount;
        if (headers && headers['x-total-count']) {
          newTotalCount = parseInt(headers['x-total-count'], 10);
          setTotalCount(newTotalCount);
        } else if (page === 1) {
          // Fallback if header is missing
          newTotalCount = data.length;
          setTotalCount(newTotalCount);
        }

        if (page === 1) {
          setMechanics(data);
          // Cache the initial load
          setCachedMechanicsData(data, newTotalCount, paramsString);
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
  const seoTitle = searchParam
    ? `${searchParam} Mechanics List | RoadResQ`
    : 'Find Mechanics Near You | RoadResQ';
  const seoDescription = searchParam
    ? `Browse mechanics, towing support, and roadside assistance related to ${searchParam}. Refine by vehicle, service, radius, and location in RoadResQ.`
    : 'Search and find top-rated vehicle mechanics, towing services, and roadside assistance nearby.';

  return (
    <div className="relative flex min-h-screen flex-col bg-background pb-20 sm:pb-0">
      <SEO 
        title={seoTitle}
        description={seoDescription}
        url={`https://roadresq.in/list${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
      />
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
            <div className="group relative flex-1">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/30 to-blue-500/30 opacity-0 blur transition duration-500 group-focus-within:opacity-100"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="text"
                  aria-label="Search mechanics"
                  placeholder="Search by name, area, city, vehicle, or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/90 py-3 pl-12 pr-4 text-base shadow-sm backdrop-blur-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              aria-label="Open Filters"
              className="group flex shrink-0 items-center justify-center rounded-xl border border-border bg-card/90 px-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 active:scale-95"
              title="Filters"
            >
              <Filter className="h-5 w-5 text-foreground transition-colors group-hover:text-primary" />
            </button>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              aria-label="Refresh results"
              className="group flex shrink-0 items-center justify-center rounded-xl border border-border bg-card/90 px-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10 active:scale-95"
              title="Refresh results"
            >
              <RefreshCw className={`h-5 w-5 text-foreground transition-all group-hover:text-primary ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {locationMessage && locationSource !== 'geolocation' && (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 shadow-sm backdrop-blur text-sm w-fit mx-auto animate-in fade-in duration-300">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="text-muted-foreground font-medium text-xs sm:text-sm whitespace-nowrap">{locationMessage}</span>
              <button
                onClick={(e) => { e.stopPropagation(); requestLocation(true); }}
                className="font-bold text-primary hover:underline text-xs sm:text-sm ml-1 shrink-0"
              >
                Enable
              </button>
            </div>
          )}
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
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {vehicleParams.length > 0 && <span className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-foreground backdrop-blur-sm">Vehicle: <span className="text-primary">{vehicleParams.join(', ')}</span></span>}
            {serviceParams.length > 0 && <span className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-foreground backdrop-blur-sm">Service: <span className="text-primary">{serviceParams.join(', ')}</span></span>}
            {searchParam && <span className="rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-foreground backdrop-blur-sm">Search: <span className="text-primary">{searchParam}</span></span>}
            {sortBy === 'Available' && <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-green-600 backdrop-blur-sm">Available first</span>}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MechanicListSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-destructive/20 bg-gradient-to-br from-destructive/10 via-card to-card py-16 px-6 sm:px-8 text-center shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-destructive/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive animate-pulse">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-black text-foreground sm:text-2xl">Search Connection Interrupted</h4>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                We encountered an issue fetching the latest mechanic list. This could be due to a temporary network issue or server update.
              </p>
              <div className="mt-2">
                <p className="text-xs font-semibold text-destructive bg-destructive/5 inline-block px-3 py-1 rounded-full border border-destructive/10">
                  {error}
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setRefreshKey(k => k + 1)}
                  className="group flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
                >
                  <RefreshCw className={`h-4 w-4 transition-transform group-hover:rotate-180 duration-500`} />
                  Refresh Connection
                </button>
              </div>
            </div>
          </div>
        ) : mechanics.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 px-6 py-12 text-center backdrop-blur-sm sm:px-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/50 text-muted-foreground">
                <Wrench className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold text-foreground sm:text-2xl">No Mechanics Found</h4>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                {emptyStateReason
                  ? `Nothing matched ${emptyStateReason}. Try broadening one of those filters or changing your location.`
                  : 'Try using a wider radius, another service, or a different location.'}
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setPendingVehicles([]);
                    setPendingServices([]);
                    setSearchParams(buildMechanicSearchParams({ radius: 5, sort: 'Nearest' }));
                  }}
                  className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition-all hover:bg-secondary hover:text-secondary-foreground active:scale-95"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
                >
                  Change Location
                </button>
              </div>
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
