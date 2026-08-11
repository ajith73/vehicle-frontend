import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Wrench, MapPin } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PublicLinkGrid } from '../components/seo/PublicLinkGrid';
import { TrustSignalsSection } from '../components/seo/TrustSignalsSection';
import { citySeoMap, serviceSeoMap } from '../content/seoLocations';

export default function ServiceCityLandingPage() {
  const { serviceSlug, citySlug } = useParams();
  const service = serviceSlug ? serviceSeoMap[serviceSlug] : null;
  const city = citySlug ? citySeoMap[citySlug] : null;

  if (!service || !city) {
    return <Navigate to="/" replace />;
  }

  const pageTitle = `${service.name} in ${city.name} | RoadResQ`;
  const pageDescription = `Find ${service.shortLabel} support in ${city.name}, ${city.region}. Explore local workshop discovery, roadside search intent, and quick access to nearby mechanic help.`;
  const canonical = `https://roadresq.in/services/${service.slug}/in/${city.slug}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I find ${service.shortLabel} support in ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Use RoadResQ to search ${service.shortLabel} support in ${city.name}. You can refine by service, vehicle need, and local search area to find nearby help faster.`
        }
      },
      {
        '@type': 'Question',
        name: `Why is local ${service.shortLabel} content important for ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `People often search with city and service keywords together. A dedicated page for ${service.shortLabel} in ${city.name} gives clearer relevance, better internal linking, and more useful local context.`
        }
      }
    ]
  };

  let queryParams = `?search=${encodeURIComponent(city.name)}`;
  if (service.vehicleTypes && service.vehicleTypes.length > 0) {
    queryParams += `&vehicle=${encodeURIComponent(service.vehicleTypes.join(','))}`;
  }
  if (service.serviceTypes && service.serviceTypes.length > 0) {
    queryParams += `&service=${encodeURIComponent(service.serviceTypes.join(','))}`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20 sm:pb-0">
      <SEO title={pageTitle} description={pageDescription} url={canonical} keywords={`${service.shortLabel} in ${city.name}, ${service.keywords.join(', ')}, ${city.name} roadside assistance`} schema={faqSchema} />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/15 z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary shadow-sm animate-pulse">
              <MapPin className="h-4 w-4" />
              Service + City Guide
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {service.name}
              </span>{' '}
              in {city.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl font-medium">
              This specialized guide is designed for users searching for <strong>{service.shortLabel} in {city.name}</strong>, <strong>{service.keywords[0]}</strong>, and local emergency roadside assistance options. Find verified mechanics and quick solutions nearby.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to={`/list${queryParams}`}
                className="group inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
              >
                Open filtered mechanic list 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={`/map${queryParams}`}
                className="inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm px-6 py-4 text-sm font-black text-foreground shadow-sm transition-all hover:bg-secondary hover:scale-[1.02] active:scale-95"
              >
                Open filtered map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Info & Local Signals Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">What this page explains</h2>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Key highlights of our coverage and expectations for {service.shortLabel}.</p>
            <div className="mt-6 space-y-3">
              {service.trustPoints.map((point) => (
                <div
                  key={point}
                  className="group flex items-center justify-between rounded-2xl border border-border/40 bg-background/40 px-5 py-4 text-sm font-bold text-foreground transition-all hover:border-primary/20 hover:bg-background"
                >
                  <span>{point}</span>
                  <div className="h-2 w-2 rounded-full bg-primary/20 transition-all group-hover:bg-primary group-hover:scale-125" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/50 bg-gradient-to-br from-card to-secondary/10 p-8 shadow-sm sm:p-10 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">Local search signals for {city.name}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Explore localized search targets linking key neighborhoods and sub-regions within {city.name} for {service.name} services.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {city.nearbyAreas.map((area) => (
                <Link
                  key={area}
                  to={`/list?search=${encodeURIComponent(area)}${queryParams.replace('?search=' + encodeURIComponent(city.name), '')}`}
                  className="rounded-xl border border-border/40 bg-background/50 px-4 py-2.5 text-xs font-bold text-foreground transition-all hover:border-primary/30 hover:bg-primary/5 hover:-translate-y-0.5"
                >
                  {service.name} near {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Snippet Friendly Q&A */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-8">
        <div className="rounded-[2rem] border border-border/50 bg-card/50 backdrop-blur-sm p-8 shadow-sm sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">Snippet-friendly answers</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">Quick answers regarding {service.shortLabel} and roadside assistance infrastructure.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="group rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-background transition-all hover:shadow-[0_4px_20px_rgba(var(--primary),0.05)] hover:border-primary/20">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">Who should use this page?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Drivers in {city.name} searching for {service.shortLabel}, workshop help, breakdown support, or local service discovery can use this page as a city-specific entry point before moving into the list or map experience.
              </p>
            </article>
            <article className="group rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-background transition-all hover:shadow-[0_4px_20px_rgba(var(--primary),0.05)] hover:border-primary/20">
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">How does RoadResQ improve trust?</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                RoadResQ supports update requests, feedback reporting, and listing review flows so incorrect local information can be corrected over time instead of remaining stale.
              </p>
            </article>
          </div>
        </div>
      </section>

      <TrustSignalsSection />

      <PublicLinkGrid
        title={`Explore more pages for ${city.name}`}
        description={`Move between city and service-intent pages to improve discovery and internal linking.`}
        links={[
          { to: `/cities/${city.slug}`, label: `Mechanics in ${city.name}` },
          { to: `/list?search=${encodeURIComponent(city.name)}`, label: `${city.name} mechanic list` },
          { to: `/map?search=${encodeURIComponent(city.name)}`, label: `${city.name} mechanic map` }
        ]}
      />
    </div>
  );
}
