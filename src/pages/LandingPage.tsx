import { Suspense, lazy, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, MapPin, Edit2, AlertTriangle, Search, Navigation, Compass, Star, Map as MapIcon, Loader2, Wrench, ChevronRight, ShieldCheck, Filter, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { searchPlaces, type PlaceSuggestion } from '../api/geocoding';
import { useLocationContext } from '../contexts/LocationContext';
import { useDataContext } from '../contexts/DataContext';
import { getServiceIcon } from '../utils/iconUtils';
import { getDistanceFromLatLonInKm, getMechanicStatus } from '../utils/mechanicUtils';
import { VehicleSelector } from '../components/landing/VehicleSelector';
import { ServiceSelector } from '../components/landing/ServiceSelector';
import { MechanicCard } from '../components/landing/MechanicCard';
import { InfoSections } from '../components/landing/InfoSections';
import { LocationPopup } from '../components/shared/LocationPopup';
import { MechanicCardSkeleton } from '../components/landing/MechanicCardSkeleton';
import { useTheme } from '../contexts/ThemeContext';
import { SEO } from '../components/SEO';
import toast from 'react-hot-toast';

const MapLocationPicker = lazy(() =>
  import('../components/MapLocationPicker').then((module) => ({ default: module.MapLocationPicker }))
);

const topCityLinks = [
  { name: 'Coimbatore', href: '/list?search=Coimbatore' },
  { name: 'Chennai', href: '/list?search=Chennai' },
  { name: 'Madurai', href: '/list?search=Madurai' },
  { name: 'Trichy', href: '/list?search=Tiruchirappalli' },
  { name: 'Salem', href: '/list?search=Salem' },
  { name: 'Erode', href: '/list?search=Erode' },
];

const quickInternalLinks = [
  { label: 'Explore mechanic list', href: '/list' },
  { label: 'Open live map', href: '/map' },
  { label: 'Emergency contacts', href: '/emergency' },
  { label: 'Submit mechanic record', href: '/submit' },
  { label: 'About RoadResQ', href: '/about' },
  { label: 'Contact RoadResQ', href: '/contact' },
];

const faqItems = [
  {
    question: 'How can I find mechanics near me in Coimbatore or other Tamil Nadu cities?',
    answer: 'Use the search box, select your vehicle and service type, then open the map or list view. RoadResQ helps drivers discover nearby mechanics, towing partners, puncture repair support, battery jump-start help, and emergency roadside services across major Tamil Nadu locations.'
  },
  {
    question: 'Does RoadResQ only support cars?',
    answer: 'No. The platform is designed for multiple vehicle types including cars, bikes, scooters, autos, trucks, vans, SUVs, tractors, and selected electric vehicles depending on mechanic support.'
  },
  {
    question: 'Can I use RoadResQ when my live location is unavailable?',
    answer: 'Yes. You can search by area, city, or manually set a location. That helps if device GPS is denied, unstable, or unavailable while travelling.'
  },
  {
    question: 'Are mechanics on RoadResQ available for emergency roadside help?',
    answer: 'Some mechanics and service providers offer emergency support such as towing, puncture repair, jump-start, fuel delivery, or on-site service. Availability can vary by location, service type, and business hours.'
  },
  {
    question: 'How can a mechanic or workshop get listed on RoadResQ?',
    answer: 'Mechanics, workshops, towing partners, and roadside service providers can submit a new record or request updates to an existing listing. Submissions go through review before they are published live.'
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const {
    userLocation,
    locationName,
    setLocation,
    searchQuery,
    isLoading,
    locationSource,
    locationMessage,
    requestLocation
  } = useLocationContext();

  const [localSearch, setLocalSearch] = useState('');
  const { 
    vehicles, 
    services, 
    isLoadingData,
    cachedLandingMechanics,
    cachedLandingMechanicsParams,
    setCachedLandingMechanicsData 
  } = useDataContext();
  const [nearbyMechanics, setNearbyMechanics] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [isLocationMessageExpanded, setIsLocationMessageExpanded] = useState(true);
  const [centerSearchSuggestions, setCenterSearchSuggestions] = useState<PlaceSuggestion[]>([]);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const [isFetchingMechanics, setIsFetchingMechanics] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setCenterSearchSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const locationBadge = isLoading
    ? { label: 'Detecting location...', classes: 'border-primary/30 bg-primary/10 text-primary', isLoading: true }
    : locationSource === 'geolocation'
      ? { label: 'Precise location', classes: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700', isLoading: false }
      : locationSource === 'ip'
        ? { label: 'Approximate location', classes: 'border-amber-500/30 bg-amber-500/10 text-amber-700', isLoading: false }
        : locationSource === 'manual'
          ? { label: 'Manual location', classes: 'border-blue-500/30 bg-blue-500/10 text-blue-700', isLoading: false }
          : { label: 'Location unavailable', classes: 'border-border bg-secondary/60 text-muted-foreground', isLoading: false };

  const popularServices = (services.filter((service) => service.isFeatured).slice(0, 5).length > 0
    ? services.filter((service) => service.isFeatured).slice(0, 4)
    : services.slice(0, 4));

  useEffect(() => {
    if (searchQuery) setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (isLoadingData) return;
    setIsLoadingOptions(false);
  }, [isLoadingData]);

  useEffect(() => {
    if (locationMessage) {
      setIsLocationMessageExpanded(true);
      const timer = setTimeout(() => {
        setIsLocationMessageExpanded(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [locationMessage]);

  useEffect(() => {
    if (localSearch.length <= 2 || localSearch === locationName) {
      setCenterSearchSuggestions([]);
      return;
    }

    const delayFn = setTimeout(() => {
      searchPlaces(localSearch)
        .then((data) => setCenterSearchSuggestions(data))
        .catch((err) => console.error('Geocoding API error', err));
    }, 500);

    return () => clearTimeout(delayFn);
  }, [localSearch, locationName]);

  useEffect(() => {
    const fetchMechanics = async () => {
      setIsFetchingMechanics(true);
      setFetchError(false);
      try {
        const searchParam = locationName === 'Current Location' ? '' : locationName;
        const paramsString = `vehicleType=${selectedVehicle}&serviceType=${selectedService}&search=${encodeURIComponent(searchParam)}`;
        
        let data: any[] = [];
        
        if (cachedLandingMechanics && cachedLandingMechanicsParams === paramsString) {
          data = cachedLandingMechanics;
        } else {
          data = await apiClient<any>(`/public/mechanics?${paramsString}`);
          setCachedLandingMechanicsData(data, paramsString);
        }

        let filtered = data.map((mechanic: any) => ({
          ...mechanic,
          currentStatus: getMechanicStatus(mechanic)
        }));

        if (userLocation) {
          filtered.sort((a: any, b: any) => {
            const distA = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(a.latitude), parseFloat(a.longitude));
            const distB = getDistanceFromLatLonInKm(userLocation[0], userLocation[1], parseFloat(b.latitude), parseFloat(b.longitude));
            return distA - distB;
          });
        }

        setNearbyMechanics(filtered.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch nearby mechanics', err);
        setFetchError(true);
        toast.error('Failed to load nearby mechanics.');
      } finally {
        setIsFetchingMechanics(false);
      }
    };

    const delayFn = setTimeout(() => {
      if (!isLoading) {
        fetchMechanics();
      }
    }, 500);

    return () => clearTimeout(delayFn);
  }, [selectedVehicle, selectedService, userLocation, locationName, isLoading]);

  const handleSearch = () => {
    navigate(`/list?search=${encodeURIComponent(localSearch)}&vehicle=${selectedVehicle}&service=${selectedService}`);
  };

  const handleFindMechanicsNow = () => {
    navigate(`/map?search=${encodeURIComponent(localSearch)}&vehicle=${selectedVehicle}&service=${selectedService}`);
  };

  const navigateToMechanic = (mechanicId: number) => {
    navigate(`/map?vehicle=${selectedVehicle}&service=${selectedService}&routeTo=${mechanicId}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative pb-20 sm:pb-0">
      <SEO 
        title="RoadResQ | Find Mechanics Near You Across Tamil Nadu"
        description="Find nearby mechanics, towing partners, puncture repair, jump-start, fuel delivery, and emergency roadside assistance across Coimbatore, Chennai, Madurai, Trichy, Salem, Erode, and more Tamil Nadu cities."
        keywords="mechanics near me, mechanic near me in Coimbatore, roadside assistance Tamil Nadu, towing service near me, puncture repair near me, bike mechanic near me, car mechanic open now, emergency breakdown help, RoadResQ"
        url="https://roadresq.in/"
        schema={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "name": "RoadResQ",
              "url": "https://roadresq.in/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://roadresq.in/list?search={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            },
            {
              "@type": "Organization",
              "name": "RoadResQ",
              "url": "https://roadresq.in/",
              "logo": "https://roadresq.in/apple-touch-icon.png",
              "description": "RoadResQ helps drivers find nearby mechanics, towing partners, and emergency roadside assistance across Tamil Nadu."
            },
            {
              "@type": "FAQPage",
              "mainEntity": faqItems.map((item) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": item.answer
                }
              }))
            }
          ]
        }}
      />
      <div className="relative flex flex-col items-center border-b border-border bg-card px-4 pt-6 pb-12 text-center shadow-sm sm:px-8">
        <div className="relative z-20 mb-6 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="text-base font-bold text-foreground sm:text-lg">Find nearby mechanic help fast</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex max-w-full shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              onClick={() => setShowLocationPopup(true)}
              aria-label="Change location"
            >
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate text-xs font-semibold text-muted-foreground sm:text-sm">{locationName}</span>
              <Edit2 className="ml-1 h-3.5 w-3.5 text-muted-foreground transition-colors hover:text-primary" />
            </button>

            {/* Mobile Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded-full border border-border bg-secondary/50 text-foreground transition-colors hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="relative z-20 mb-6 flex flex-col items-center gap-3">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-all ${locationBadge.classes}`}>
            {locationBadge.isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <MapPin className="h-3.5 w-3.5" />
            )}
            <span>{locationBadge.label}</span>
          </div>
          {locationMessage && (
            <button 
              onClick={() => !isLocationMessageExpanded && setIsLocationMessageExpanded(true)}
              className={`mx-auto flex max-w-2xl gap-3 rounded-2xl border border-amber-500/30 bg-card/90 px-4 py-3 text-left shadow-sm backdrop-blur transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 ${isLocationMessageExpanded ? 'items-start cursor-default' : 'items-center cursor-pointer hover:bg-card w-fit'}`}
              aria-label={isLocationMessageExpanded ? "Location alert" : "Expand location alert"}
            >
              <AlertTriangle className={`${isLocationMessageExpanded ? 'mt-0.5' : ''} h-4 w-4 shrink-0 text-amber-600`} />
              
              {isLocationMessageExpanded ? (
                <div className="min-w-0 flex-1 animate-in fade-in duration-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm text-muted-foreground">{locationMessage}</p>
                  {locationSource !== 'geolocation' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); requestLocation(); }}
                      className="text-sm font-bold text-primary hover:underline"
                    >
                      Try device location
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-1 min-w-0 animate-in fade-in duration-300">
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
            </button>
          )}
        </div>

        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20"></div>
        <div className="relative z-10 w-full max-w-3xl">
          <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
            Get Back on the <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Road Faster</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg font-medium text-muted-foreground sm:text-xl">
            Find the nearest expert mechanics for any vehicle, instantly.
          </p>

          <div className="relative mx-auto mt-6 flex w-full max-w-md gap-2" ref={searchDropdownRef}>
            <div className="relative z-50 flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search area, city..."
                className="relative z-20 w-full rounded-2xl border-2 border-border bg-background py-4 pl-12 pr-12 text-[16px] font-medium shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 z-30 -translate-y-1/2 rounded-xl bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Navigation className="h-5 w-5" />
              </button>

              {centerSearchSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[110%] z-[60] max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl custom-scrollbar">
                  {centerSearchSuggestions.map((suggestion, idx) => {
                    const cityName = suggestion.name.split(',')[0];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setLocation([suggestion.lat, suggestion.lon], cityName, 'manual');
                          setLocalSearch(cityName);
                          setCenterSearchSuggestions([]);
                        }}
                        className="flex w-full items-center gap-2 border-b border-border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors last:border-0 hover:bg-primary/10"
                      >
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        {suggestion.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={() => setLocalSearch(locationName)}
              title="Use Current Location"
              className="flex shrink-0 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/10 p-4 text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/20"
            >
              <Compass className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <VehicleSelector 
        vehicles={vehicles} 
        isLoadingOptions={isLoadingOptions} 
        selectedVehicle={selectedVehicle} 
        setSelectedVehicle={setSelectedVehicle} 
      />

      <ServiceSelector 
        services={services} 
        isLoadingOptions={isLoadingOptions} 
        selectedService={selectedService} 
        setSelectedService={setSelectedService} 
      />

      <div className="mx-auto mt-6 w-full max-w-3xl px-4 sm:px-8">
        <button
          onClick={handleFindMechanicsNow}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-5 text-lg font-black text-primary-foreground shadow-[0_8px_30px_rgba(59,130,246,0.3)] transition-all hover:-translate-y-1 hover:bg-primary/90 active:translate-y-0"
        >
          <MapIcon className="h-6 w-6" />
          Find Mechanics Now
        </button>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Star className="h-6 w-6 text-yellow-500" /> Popular Services
          </h3>
          <button onClick={() => navigate('/list')} className="text-sm font-bold text-primary hover:underline">See All</button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {isLoadingData ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex h-[106px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm animate-pulse">
                <div className="h-12 w-12 rounded-full bg-secondary/80"></div>
                <div className="h-4 w-20 rounded bg-secondary/80 mt-1"></div>
              </div>
            ))
          ) : (
            popularServices.map((service) => {
              const Icon = getServiceIcon(service.name);
              return (
                <button
                  key={service.id || service.name}
                  onClick={() => navigate(`/list?service=${encodeURIComponent(service.name)}`)}
                  className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label={`Search mechanics for ${service.name}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-center text-sm font-bold">{service.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-12 sm:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <MapIcon className="h-6 w-6 text-green-500" /> Nearby Mechanics
          </h3>
          <button onClick={() => navigate(`/map?vehicle=${selectedVehicle}&service=${selectedService}`)} className="text-sm font-bold text-primary hover:underline">View Map</button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {isFetchingMechanics || isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <MechanicCardSkeleton key={i} />)
          ) : fetchError ? (
            <div className="col-span-full rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-8 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-3" />
              <p className="text-base font-bold text-red-600 dark:text-red-400">Failed to load nearby mechanics.</p>
              <p className="mt-2 text-sm text-red-500/80">Please check your connection and try again.</p>
              <button
                onClick={() => {
                  setSelectedService('');
                }}
                className="mt-4 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500/20"
              >
                Reset Filters
              </button>
            </div>
          ) : nearbyMechanics.length > 0 ? (
            nearbyMechanics.slice(0, 5).map((mechanic) => (
              <MechanicCard 
                key={mechanic.id} 
                mechanic={mechanic} 
                userLocation={userLocation} 
                navigateToMechanic={navigateToMechanic} 
              />
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-border bg-card px-6 py-8 text-center">
              <p className="text-base font-bold text-foreground">No nearby mechanics found for the current filters.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try changing the selected service, switching vehicle type, or choosing a different location to widen the search.
              </p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    setSelectedService('');
                    setSelectedVehicle('');
                    setLocalSearch('');
                  }}
                  className="rounded-xl border border-border bg-secondary/70 px-4 py-2 text-sm font-bold text-foreground hover:bg-secondary"
                >
                  Clear Filters
                </button>
                <button
                  onClick={() => setShowLocationPopup(true)}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Change Location
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <InfoSections />

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8" aria-labelledby="how-roadresq-works-heading">
        <div className="rounded-[2rem] border border-border/50 bg-gradient-to-b from-card to-secondary/20 p-8 shadow-sm sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <h2 id="how-roadresq-works-heading" className="text-2xl font-black text-foreground sm:text-3xl relative z-10 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </span>
            How RoadResQ helps
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3 relative z-10">
            <div className="group rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-background transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Search by location</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Start with your current location, a city search, or a manually selected map point to find mechanics and emergency help near the area you actually need.
              </p>
            </div>
            <div className="group rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-background transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <Filter className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Filter by vehicle & service</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Narrow results using vehicle type and service filters so drivers do not waste time calling the wrong business for their breakdown.
              </p>
            </div>
            <div className="group rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-background transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <ArrowUpRight className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Support better local discovery</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">
                Mechanics and workshops can request new listings or updates, helping the directory stay more complete, more local, and more useful over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8" aria-labelledby="internal-links-heading">
        <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm sm:p-8">
          <h2 id="internal-links-heading" className="text-2xl font-black text-foreground sm:text-3xl">
            Explore RoadResQ
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Use these quick internal links to move between the most important public pages on the platform.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickInternalLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group relative overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(var(--primary),0.08)] hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-between">
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8" aria-labelledby="faq-heading">
        <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <h2 id="faq-heading" className="text-2xl font-black text-foreground sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              These answers are written for drivers, workshops, and search users looking for nearby mechanic help, roadside assistance, and verified local service providers.
            </p>
            <div className="mt-8 space-y-4">
              {faqItems.map((item) => (
                <article key={item.question} className="rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-secondary/20 transition-colors group">
                  <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors mt-0.5">Q</div>
                    <div>
                      <h3 className="text-base font-bold text-foreground sm:text-lg leading-tight group-hover:text-primary transition-colors">{item.question}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 sm:px-8" aria-labelledby="roadside-assistance-heading">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/30 p-8 shadow-xl sm:p-12">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <h2 id="roadside-assistance-heading" className="text-2xl font-black text-foreground sm:text-4xl leading-tight">
              24/7 roadside assistance, nearby mechanics, and emergency vehicle help across Tamil Nadu
            </h2>
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-foreground/80 sm:text-base">
              <p>
                RoadResQ is built for drivers who need fast help when a bike, car, auto, SUV, truck, van, or electric vehicle breaks down on the road. Instead of wasting time jumping between random directories and map results, users can quickly search nearby mechanics, compare services, check locations, and move to the map or list view that best matches the situation. Whether you need general service, puncture repair, towing support, battery jump-start help, fuel delivery, brake work, AC repair, or emergency breakdown assistance, the goal is to make local discovery faster and clearer.
              </p>
              <p>
                The platform is especially useful for location-based searches such as mechanic near me in Coimbatore, towing service near me in Chennai, bike mechanic in Madurai, or roadside assistance in Trichy and Salem. Users can search by city, area, or manually chosen map point, then filter by service type and vehicle type to narrow down results. This helps people find relevant businesses in the right place instead of scanning broad, mixed, or outdated results.
              </p>
              <p>
                RoadResQ also supports workshops, independent mechanics, mobile mechanics, towing partners, and other roadside service providers who want better visibility. Listings can be submitted or updated for review so the platform stays useful for both stranded drivers and local businesses. If your goal is to find mechanics near you quickly, compare options on a map, or reach emergency support faster, this landing page is the starting point for that journey.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/list" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/25">
                Browse Mechanics
              </Link>
              <Link to="/map" className="rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-sm px-6 py-3 text-sm font-bold text-foreground hover:bg-primary/10 hover:border-primary/40 transition-all">
                Open Map Search
              </Link>
              <Link to="/emergency" className="rounded-full border-2 border-destructive/20 bg-destructive/5 backdrop-blur-sm px-6 py-3 text-sm font-bold text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all">
                Emergency Help
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8" aria-labelledby="city-searches-heading">
        <div className="rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm sm:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-secondary/10 to-background opacity-50" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h2 id="city-searches-heading" className="text-2xl font-black text-foreground sm:text-3xl">
                Popular city searches
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                These internal links help drivers jump directly into city-based mechanic discovery flows for major Tamil Nadu locations.
              </p>
            </div>
            <Link to="/list" className="shrink-0 group flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20">
              View all results <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3">
            {topCityLinks.map((city) => (
              <Link
                key={city.name}
                to={city.href}
                className="rounded-full border border-border/40 bg-background/80 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:-translate-y-0.5"
              >
                Mechanics in {city.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LocationPopup 
        isOpen={showLocationPopup} 
        onClose={() => setShowLocationPopup(false)} 
        setLocation={(coords, name, source) => {
          setLocation(coords, name, source);
          setLocalSearch(name);
        }} 
        setShowMapPicker={setShowMapPicker} 
      />

      {showMapPicker && (
        <Suspense fallback={null}>
          <MapLocationPicker
            initialLocation={userLocation}
            onClose={() => setShowMapPicker(false)}
            onSelect={(coords, name) => {
              setLocation(coords, name, 'manual');
              setLocalSearch(name);
              setShowMapPicker(false);
            }}
          />
        </Suspense>
      )}
      
      <footer className="py-6 text-center text-sm font-semibold text-muted-foreground mt-4 border-t border-border/50">
        © 2026 RoadResQ. All Rights Reserved.
      </footer>
    </div>
  );
}
