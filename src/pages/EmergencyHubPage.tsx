import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldAlert, HeartPulse, Shield, Car, Bike, Info, Siren, Navigation, ShieldCheck, MessageSquare, ArrowRight, MapPin, Clock3, Wrench } from 'lucide-react';
import { SEO } from '../components/SEO';

const EMERGENCY_SECTIONS = [
  {
    title: 'Emergency Numbers',
    icon: ShieldAlert,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    items: [
      { name: 'Police / All-in-One', number: '112', primary: true },
      { name: 'Ambulance', number: '108', primary: true },
      { name: 'Fire', number: '101' },
      { name: 'Women Helpline', number: '181' }
    ]
  },
  {
    title: 'Highway Assistance',
    icon: Shield,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    items: [
      { name: 'National Highway Helpline (NHAI)', number: '1033', primary: true }
    ]
  },
  {
    title: 'Manufacturer Roadside Assistance (Cars)',
    icon: Car,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    items: [
      { name: 'Maruti Suzuki', number: '1800-102-1800' },
      { name: 'Hyundai', number: '1800-102-4645' },
      { name: 'Tata Motors', number: '1800-209-6688' },
      { name: 'Mahindra', number: '1800-102-7006' },
      { name: 'Kia', number: '1800-108-5000' },
      { name: 'Toyota', number: '1800-102-5001' },
      { name: 'Honda Cars', number: '1800-103-3121' }
    ]
  },
  {
    title: 'Manufacturer Roadside Assistance (Bikes)',
    icon: Bike,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    items: [
      { name: 'Hero MotoCorp', number: '1800-266-0018' },
      { name: 'TVS', number: '1800-258-7111' },
      { name: 'Bajaj', number: '1800-103-5858' },
      { name: 'Royal Enfield', number: '1800-210-0007' },
      { name: 'KTM', number: '1800-267-0268' },
      { name: 'Yamaha', number: '1800-420-1600' },
      { name: 'Suzuki', number: '1800-121-7996' }
    ]
  },
  {
    title: 'Insurance Roadside Assistance Providers',
    icon: HeartPulse,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    items: [
      { name: 'ICICI Lombard', number: '1800-2666' },
      { name: 'HDFC ERGO', number: '022-6234-6234' },
      { name: 'Tata AIG', number: '022-6489-8282' },
      { name: 'ACKO', number: '1800-266-2256' }
    ]
  }
];

export default function EmergencyHubPage() {
  const navigate = useNavigate();
  const trustItems = [
    {
      icon: ShieldCheck,
      title: 'Verified emergency-first direction',
      description: 'This page prioritizes emergency numbers and escalation paths before pushing users into mechanic discovery.'
    },
    {
      icon: MessageSquare,
      title: 'Feedback-driven corrections',
      description: 'Drivers can report incorrect listing details and help improve local service accuracy after the emergency phase.'
    },
    {
      icon: Clock3,
      title: 'Built for time-critical use',
      description: 'The platform flow is designed around urgent roadside moments where safety, clarity, and fast next steps matter most.'
    },
    {
      icon: Wrench,
      title: 'Fast follow-up into recovery',
      description: 'Once the immediate risk is handled, users can move into towing, workshop discovery, and nearby mechanic support.'
    }
  ];
  const followUpLinks = [
    {
      to: '/list',
      label: 'Find nearby mechanics',
      description: 'Move from emergency response into workshop and service discovery.',
      icon: Wrench,
      iconClasses: 'bg-blue-500/10 text-blue-500'
    },
    {
      to: '/map',
      label: 'Open mechanic map',
      description: 'See nearby mechanic locations and continue with routing support.',
      icon: MapPin,
      iconClasses: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      to: '/feedback',
      label: 'Report incorrect listing details',
      description: 'Flag wrong numbers, closed businesses, or outdated records.',
      icon: MessageSquare,
      iconClasses: 'bg-amber-500/10 text-amber-500'
    },
    {
      to: '/contact',
      label: 'Contact RoadResQ',
      description: 'Reach out for support, collaboration, or platform questions.',
      icon: ArrowRight,
      iconClasses: 'bg-violet-500/10 text-violet-500'
    },
    {
      to: '/about',
      label: 'Learn how the platform works',
      description: 'Understand the product direction and public support model.',
      icon: Shield,
      iconClasses: 'bg-rose-500/10 text-rose-500'
    },
    {
      to: '/submit',
      label: 'Add a missing service provider',
      description: 'Help expand local emergency and roadside support coverage.',
      icon: Car,
      iconClasses: 'bg-cyan-500/10 text-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      <SEO
        title="Emergency Roadside Help Numbers in India | RoadResQ"
        description="Access important emergency and roadside help numbers including police, ambulance, highway assistance, manufacturer roadside support, and insurance assistance."
        url="https://roadresq.in/emergency"
      />
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-foreground">Emergency Hub</h1>
          <p className="text-xs text-muted-foreground font-medium">Verified Assistance Numbers</p>
        </div>
      </div>

      <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Warning Banner */}
        <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <Info className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-600 dark:text-amber-500 mb-1">In case of a severe accident</h3>
            <p className="text-sm text-amber-700/90 dark:text-amber-500/80 leading-relaxed">
              Always prioritize medical and police emergencies. Contact <span className="font-black">112</span> or <span className="font-black">108</span> immediately before worrying about vehicle recovery. Keep your location ready.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="grid gap-6">
          {EMERGENCY_SECTIONS.map((section, idx) => (
            <div key={idx} className="bg-card rounded-[24px] border border-border shadow-xl overflow-hidden">
              <div className={`p-5 flex items-center gap-4 border-b border-border/50 bg-secondary/30`}>
                <div className={`p-3 rounded-2xl ${section.bg} ${section.color}`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-black text-foreground">{section.title}</h2>
              </div>
              <div className="p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {section.items.map((item: any, itemIdx) => (
                  <div key={itemIdx} className={`flex items-center justify-between p-4 rounded-xl border ${item.primary ? 'bg-primary/5 border-primary/20' : 'bg-background border-border/50'} hover:border-primary/50 transition-colors group`}>
                    <span className={`font-bold ${item.primary ? 'text-primary' : 'text-foreground'}`}>
                      {item.name}
                    </span>
                    
                    {item.noLink ? (
                      <span className="text-xs sm:text-sm font-semibold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg">
                        {item.number}
                      </span>
                    ) : (
                      <a 
                        href={`tel:${item.number.replace(/-/g, '')}`} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm transition-all shadow-sm ${item.primary ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}
                      >
                        <Phone className="w-4 h-4" /> {item.number}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-card to-orange-500/10 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-red-600 dark:text-red-400">
                <Siren className="h-4 w-4" />
                Quick answers
              </div>
              <h2 className="mt-4 text-2xl font-black text-foreground sm:text-3xl">Quick answers for emergency search intent</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                These answers are designed for high-stress situations where users need immediate clarity before moving into mechanic search, towing, or workshop follow-up.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="rounded-2xl border border-border/60 bg-background/75 p-5 shadow-sm">
                <h3 className="text-base font-black text-foreground sm:text-lg">When should I use this page?</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  This page is for urgent situations where you need emergency numbers first, or when you want a fallback before locating a nearby mechanic, towing service, or roadside assistance provider through the rest of the platform.
                </p>
              </article>
              <article className="rounded-2xl border border-border/60 bg-background/75 p-5 shadow-sm">
                <h3 className="text-base font-black text-foreground sm:text-lg">What should I do after calling?</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  Once safety is handled, use the mechanic list or map to continue with vehicle recovery, workshop discovery, towing coordination, or follow-up service in your area.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/20 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Trust Signals</p>
              <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Why drivers can trust the platform</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Emergency pages need more than numbers. They should also explain why the platform is useful before, during, and after a roadside incident.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {trustItems.map((item) => (
                <article key={item.title} className="rounded-2xl border border-border/60 bg-background/75 p-5 shadow-sm transition-colors hover:border-primary/30">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-card to-yellow-500/10 shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">After the emergency</p>
              <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Emergency follow-up pages</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                After immediate safety steps, these pages help users continue into local recovery, listing corrections, and service discovery with more confidence.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {followUpLinks.map((item) => (
                <button
                  key={item.to}
                  onClick={() => navigate(item.to)}
                  className="group flex items-start gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 text-left transition-all hover:border-orange-400/40 hover:bg-background hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconClasses}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-black text-foreground sm:text-base">{item.label}</h3>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
