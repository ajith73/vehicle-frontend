import { ArrowLeft, Mail, User, Target, ArrowRight, ShieldCheck, Wrench, MessageSquare, Siren, HeartHandshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';

export default function ContactPage() {
  const navigate = useNavigate();
  const nextSteps = [
    {
      to: '/about',
      label: 'About RoadResQ',
      description: 'Learn the product direction and platform purpose.',
      icon: ShieldCheck,
      iconClasses: 'bg-blue-500/10 text-blue-500'
    },
    {
      to: '/submit',
      label: 'Submit or update a mechanic record',
      description: 'Create a new listing request or improve an existing one.',
      icon: Wrench,
      iconClasses: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      to: '/feedback',
      label: 'Send feedback or corrections',
      description: 'Report wrong details, coverage gaps, or UX issues.',
      icon: MessageSquare,
      iconClasses: 'bg-amber-500/10 text-amber-500'
    },
    {
      to: '/emergency',
      label: 'Emergency contact hub',
      description: 'Open urgent help and roadside support resources.',
      icon: Siren,
      iconClasses: 'bg-rose-500/10 text-rose-500'
    },
    {
      to: '/list',
      label: 'Browse mechanic listings',
      description: 'Search mechanics, services, and nearby help faster.',
      icon: ArrowRight,
      iconClasses: 'bg-violet-500/10 text-violet-500'
    },
    {
      to: '/donate',
      label: 'Support the platform',
      description: 'Help keep the service running and accessible.',
      icon: HeartHandshake,
      iconClasses: 'bg-pink-500/10 text-pink-500'
    }
  ];

  return (
    <div className="min-h-[100dvh] bg-background pt-8 sm:pt-12 px-4 pb-12 sm:px-6 lg:px-8">
      <SEO
        title="Contact RoadResQ | Support, Collaboration, and Coverage Discussions"
        description="Contact RoadResQ for support, platform questions, collaboration, local coverage discussions, and future roadside assistance partnerships."
        url="https://roadresq.in/contact"
      />
      <div className="mx-auto max-w-3xl mt-12 sm:mt-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">Contact Me</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect with the creator behind RoadResQ. Let's talk about the future of roadside assistance.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="p-6 sm:p-10 space-y-10">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Who am I?</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    I am a Software Engineer based in Coimbatore, Tamil Nadu.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Future Plan & Investment</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    Any investor who wants to collaborate, please contact me. My future plan is to connect users to mechanics in real-time, solving problems end-to-end with lesser time and lesser cost.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Email</h3>
                  <p className="mt-2 text-muted-foreground">
                    <a href="mailto:support@roadresq.in" className="text-primary hover:underline font-medium">
                      support@roadresq.in
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <section className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-secondary/30 shadow-sm">
            <div className="p-6 sm:p-8">
              <div className="max-w-2xl">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Helpful Next Steps</p>
                <h2 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
                  Continue with the right public action
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                  If you are looking for support, listing visibility, or local mechanic discovery, these are usually the best next steps from the contact screen.
                </p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {nextSteps.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => navigate(item.to)}
                    className="group flex items-start gap-4 rounded-2xl border border-border/70 bg-background/75 p-4 text-left transition-all hover:border-primary/40 hover:bg-background hover:shadow-md"
                  >
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.iconClasses}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-black text-foreground sm:text-base">{item.label}</h3>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
