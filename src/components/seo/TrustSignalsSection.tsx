import { ShieldCheck, Star, MapPin, Clock3 } from 'lucide-react';

const trustItems = [
  {
    icon: ShieldCheck,
    title: 'Verification-aware listings',
    description: 'RoadResQ is designed to highlight reviewed, updated, and admin-approved mechanic information wherever possible.'
  },
  {
    icon: Star,
    title: 'Feedback-driven improvements',
    description: 'Drivers can report incorrect phone numbers, wrong addresses, closed workshops, and listing issues for follow-up.'
  },
  {
    icon: MapPin,
    title: 'Local coverage intent',
    description: 'City and area search flows are built for people searching nearby mechanics, towing, and roadside help in real situations.'
  },
  {
    icon: Clock3,
    title: 'Fast-response use cases',
    description: 'The product is structured around urgent needs like punctures, jump starts, towing support, and emergency breakdown help.'
  }
];

export function TrustSignalsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
      <div className="rounded-[2rem] border border-border/50 bg-gradient-to-br from-card to-secondary/20 p-8 shadow-sm sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <h2 className="text-2xl font-black text-foreground sm:text-3xl relative z-10">Why drivers can trust the platform</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base relative z-10">
          Search visibility alone is not enough. Public pages should clearly explain how RoadResQ handles coverage, listing quality, and service expectations for real roadside situations.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 relative z-10">
          {trustItems.map((item) => (
            <article key={item.title} className="group rounded-2xl border border-border/40 bg-background/50 p-6 hover:bg-background transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.05)] hover:border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
