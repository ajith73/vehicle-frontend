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

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20 sm:pb-0">
      <SEO title={pageTitle} description={pageDescription} url={canonical} keywords={`${service.shortLabel} in ${city.name}, ${service.keywords.join(', ')}, ${city.name} roadside assistance`} schema={faqSchema} />

      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <MapPin className="h-4 w-4" />
              Service + City Landing Page
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              {service.name} in {city.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              This page is built for users searching phrases like <strong>{service.shortLabel} in {city.name}</strong>, <strong>{service.keywords[0]}</strong>, and other local roadside or workshop help terms. It adds stronger local relevance, clearer service intent, and more crawlable internal links.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/list?search=${encodeURIComponent(city.name)}&service=${encodeURIComponent(service.name)}`} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90">
                Open filtered mechanic list <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={`/map?search=${encodeURIComponent(city.name)}&service=${encodeURIComponent(service.name)}`} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-black text-foreground transition-colors hover:bg-secondary">
                Open filtered map
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-foreground">What this page explains</h2>
            <div className="mt-5 space-y-3">
              {service.trustPoints.map((point) => (
                <div key={point} className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground">
                  {point}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-foreground">Local search signals for {city.name}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Good GEO content uses city wording, locality references, nearby area context, and service-specific phrases instead of generic text alone.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {city.nearbyAreas.map((area) => (
                <Link key={area} to={`/list?search=${encodeURIComponent(area)}&service=${encodeURIComponent(service.name)}`} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary/80">
                  {service.name} near {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-foreground">Snippet-friendly answers</h2>
          <div className="mt-6 space-y-4">
            <article className="rounded-2xl border border-border bg-background/70 p-5">
              <h3 className="text-base font-black text-foreground sm:text-lg">Who should use this page?</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
                Drivers in {city.name} searching for {service.shortLabel}, workshop help, breakdown support, or local service discovery can use this page as a city-specific entry point before moving into the list or map experience.
              </p>
            </article>
            <article className="rounded-2xl border border-border bg-background/70 p-5">
              <h3 className="text-base font-black text-foreground sm:text-lg">How does RoadResQ improve trust?</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">
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
