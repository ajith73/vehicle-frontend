import { Link, Navigate, useParams } from 'react-router-dom';
import { MapPin, Wrench, Car, ArrowRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PublicLinkGrid } from '../components/seo/PublicLinkGrid';
import { TrustSignalsSection } from '../components/seo/TrustSignalsSection';
import { citySeoMap, citySeoConfigs, serviceSeoConfigs } from '../content/seoLocations';

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

      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <MapPin className="h-4 w-4" />
              City Coverage Page
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              Find mechanics in {city.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">
              RoadResQ helps people searching for mechanics in {city.name}, {city.region}. Whether you need a car mechanic, bike mechanic, towing support, puncture repair, or general roadside help, this page is designed to make local search clearer and faster.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/list?search=${encodeURIComponent(city.name)}`} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90">
                Open mechanic list <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={`/map?search=${encodeURIComponent(city.name)}`} className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-5 py-3 text-sm font-black text-foreground transition-colors hover:bg-secondary">
                Open map search
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-foreground sm:text-3xl">Why this {city.name} page matters</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              Searchers often type phrases like <strong>mechanics in {city.name}</strong>, <strong>car mechanic in {city.name}</strong>, or <strong>bike mechanic near me in {city.name}</strong>. This landing page gives crawlers and users stronger local context, nearby areas, and service intent instead of a thin generic page.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {city.highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border border-border bg-background/70 p-4">
                  <Wrench className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-foreground">Coverage around {city.name}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Public search pages should mention localities and nearby areas that real users search for.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {city.nearbyAreas.map((area) => (
                <Link key={area} to={`/list?search=${encodeURIComponent(area)}`} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-secondary/80">
                  {area}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-foreground">Common services people search</h2>
            <div className="mt-5 space-y-3">
              {city.services.map((service) => (
                <div key={service} className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-foreground">
                  {service} in {city.name}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-foreground">Vehicle support intent</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {city.vehicleTypes.map((vehicle) => (
                <div key={vehicle} className="rounded-2xl border border-border bg-background/70 p-4">
                  <Car className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">{vehicle} mechanic in {city.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicLinkGrid
        title={`Service-location pages for ${city.name}`}
        description={`These landing pages help users and search engines understand service intent in ${city.name}.`}
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
