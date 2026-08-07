import { Link, Navigate, useParams } from 'react-router-dom';
import { 
  MapPin, Wrench, Car, ArrowRight,
  TrafficCone, Zap, Milestone, Activity,
  Bike, Truck
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { PublicLinkGrid } from '../components/seo/PublicLinkGrid';
import { TrustSignalsSection } from '../components/seo/TrustSignalsSection';
import { citySeoMap, citySeoConfigs, serviceSeoConfigs } from '../content/seoLocations';

function getHighlightIcon(highlight: string) {
  const text = highlight.toLowerCase();
  if (text.includes('traffic') || text.includes('commuter') || text.includes('movement') || text.includes('flow')) {
    return TrafficCone;
  }
  if (text.includes('demand') || text.includes('search') || text.includes('intent') || text.includes('need') || text.includes('urgency')) {
    return Zap;
  }
  if (text.includes('metro') || text.includes('coverage') || text.includes('city') || text.includes('transit')) {
    return MapPin;
  }
  if (text.includes('highway') || text.includes('route') || text.includes('road') || text.includes('travel')) {
    return Milestone;
  }
  if (text.includes('fast') || text.includes('quick') || text.includes('speed') || text.includes('time')) {
    return Activity;
  }
  return Wrench;
}

function getVehicleIcon(vehicle: string) {
  const text = vehicle.toLowerCase();
  if (text.includes('bike') || text.includes('scooter') || text.includes('two-wheeler')) {
    return Bike;
  }
  if (text.includes('truck') || text.includes('heavy') || text.includes('commercial')) {
    return Truck;
  }
  return Car;
}

export default function CityLandingPage() {
  const { citySlug } = useParams();
  const city = citySlug ? citySeoMap[citySlug] : null;

  if (!city) {
    return <Navigate to="/" replace />;
  }

  const pageTitle = `Mechanics in ${city.name} | RoadResQ`;
  const pageDescription = `Find mechanics in ${city.name}, ${city.region}. Search car mechanics, bike mechanics, towing help, puncture repair, jump start support, and nearby roadside assistance.`;
  const canonical = `https://roadresq.in/cities/${city.slug}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How can I find mechanics in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use RoadResQ to search mechanics, workshops, towing support, and roadside assistance in ${city.name}. You can also refine by vehicle type and service need.`
        }
      },
      {
        '@type': 'Question',
        name: `What kinds of roadside help are useful in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Drivers in ${city.name} commonly look for puncture repair, battery jump start, towing, local workshop support, and general breakdown help depending on the vehicle and situation.`
        }
      }
    ]
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20 sm:pb-0">
      <SEO title={pageTitle} description={pageDescription} url={canonical} keywords={`mechanics in ${city.name}, car mechanic in ${city.name}, bike mechanic in ${city.name}, towing in ${city.name}, roadside assistance ${city.name}`} schema={faqSchema} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/15 z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-sm animate-pulse">
              <MapPin className="h-4 w-4" />
              City Coverage Guide
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              Find mechanics in{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {city.name}
              </span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-medium">
              RoadResQ bridges the gap to reliable mechanics in {city.name}, {city.region}. Find a car mechanic, bike mechanic, towing provider, flat tire puncture repair, or emergency battery jump-start in just a few clicks.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={`/list?search=${encodeURIComponent(city.name)}`}
                className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
              >
                Open mechanic list 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={`/map?search=${encodeURIComponent(city.name)}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-6 py-4 text-sm font-black text-foreground shadow-sm transition-all hover:bg-secondary hover:scale-[1.02] active:scale-95"
              >
                Open map search
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why & Coverage Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-[2rem] border border-border/50 bg-gradient-to-br from-card to-secondary/10 p-8 shadow-sm sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">Why this {city.name} guide matters</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Drivers frequently search for <strong>mechanics in {city.name}</strong>, <strong>car mechanic in {city.name}</strong>, or <strong>bike mechanic near me in {city.name}</strong>. This dedicated resource provides targeted local details, nearby suburbs, and service coverage to make emergency situations easier.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {city.highlights.map((highlight) => {
                const HighlightIcon = getHighlightIcon(highlight);
                return (
                  <div key={highlight} className="group rounded-2xl border border-border/40 bg-background/50 p-5 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(var(--primary),0.05)] hover:border-primary/20 hover:bg-background">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <HighlightIcon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground leading-snug">{highlight}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm sm:p-10 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">Major Towns & Cities in {city.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore key towns, suburbs, and major municipalities within the {city.name} district for targeted roadside assistance.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {city.nearbyAreas.map((area) => (
                <Link
                  key={area}
                  to={`/list?search=${encodeURIComponent(area)}`}
                  className="rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5"
                >
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services & Vehicle support */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">Common services people search</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Most requested emergency operations in {city.name}.</p>
            <div className="mt-6 space-y-3">
              {city.services.map((service) => (
                <div
                  key={service}
                  className="group flex items-center justify-between rounded-2xl border border-border/40 bg-background/40 px-5 py-4 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:bg-background"
                >
                  <span>{service} in {city.name}</span>
                  <div className="h-2 w-2 rounded-full bg-primary/20 transition-all group-hover:bg-primary group-hover:scale-125" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">Vehicle support intent</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Dedicated roadside workshops categorized by vehicle configuration.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {city.vehicleTypes.map((vehicle) => {
                const VehicleIcon = getVehicleIcon(vehicle);
                return (
                  <div
                    key={vehicle}
                    className="group rounded-2xl border border-border/40 bg-background/40 p-5 transition-all duration-300 hover:border-primary/20 hover:bg-background hover:shadow-[0_4px_20px_rgba(var(--primary),0.05)]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <VehicleIcon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-bold text-foreground leading-snug">{vehicle} mechanic in {city.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <PublicLinkGrid
        title={`Service-location pages for ${city.name}`}
        description={`These landing pages help users and search engines find service-specific help in ${city.name}.`}
        links={serviceSeoConfigs.map((service) => ({
          to: `/services/${service.slug}/in/${city.slug}`,
          label: `${service.name} in ${city.name}`
        }))}
      />

      <TrustSignalsSection />

      <PublicLinkGrid
        title="More Tamil Nadu city pages"
        description="Browse other dedicated city landing pages to strengthen internal linking and regional coverage."
        links={citySeoConfigs.filter((item) => item.slug !== city.slug).map((item) => ({
          to: `/cities/${item.slug}`,
          label: `Mechanics in ${item.name}`
        }))}
      />
    </div>
  );
}
