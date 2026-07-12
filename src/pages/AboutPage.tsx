import { Shield, Target, Zap, HeartHandshake, Clock, Users, ShieldCheck, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 z-0"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 sm:py-28 text-center">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl mb-6">
            Emergency Roadside Assistance, <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Simplified.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl font-medium">
            We are bridging the gap between stranded drivers and expert mechanics, making roadside emergencies less stressful and resolving them in just a few minutes.
          </p>
        </div>
      </div>

      {/* The Problem & Our Solution */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-foreground">Why We Built This</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vehicle breakdowns are unexpected and highly stressful. Finding a reliable, nearby mechanic quickly can be incredibly difficult, especially in unfamiliar areas or outside regular business hours.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our platform solves this problem by providing instant, location-based access to verified mechanics, towing services, and roadside assistance professionals around you. No endless searching, no waiting—just fast, easy access to help when you need it the most.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Fast Resolution</h3>
              <p className="text-sm text-muted-foreground">Find nearby mechanics instantly and resolve your emergencies in minutes, not hours.</p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">Trusted Network</h3>
              <p className="text-sm text-muted-foreground">Access verified and reviewed professionals to ensure your vehicle is in safe hands.</p>
            </div>
          </div>
        </div>
      </div>

      {/* For Users & Mechanics */}
      <div className="bg-secondary/30 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-foreground">For Drivers</h3>
              <p className="text-muted-foreground leading-relaxed">
                Whether you've got a flat tire, a dead battery, or an engine failure, our application gives you easy, instant access to a network of professionals. Easily filter by vehicle type and required services to find the exact help you need without the hassle of making countless phone calls.
              </p>
            </div>
            <div className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                <HeartHandshake className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-foreground">For Mechanics</h3>
              <p className="text-muted-foreground leading-relaxed">
                We empower local mechanics and service providers by increasing your visibility to drivers in immediate need. By joining our platform, you can increase your daily service requests, build your reputation through reviews, and significantly boost your revenue with zero upfront marketing costs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Identity */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-24 text-center">
        <h2 className="text-3xl font-black text-foreground mb-12">Our Core Identity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-8 shadow-sm transition-transform hover:-translate-y-1">
            <Target className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Our Mission</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To provide immediate, reliable, and accessible roadside assistance to everyone by seamlessly connecting stranded individuals with qualified professionals through innovative technology.
            </p>
          </div>
          <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 via-card to-card p-8 shadow-sm transition-transform hover:-translate-y-1">
            <Zap className="h-8 w-8 text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Our Vision</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To become the global standard for emergency vehicle repair, ensuring no driver ever feels unsafe or helpless during a breakdown, while empowering local mechanics to thrive.
            </p>
          </div>
          <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-card to-card p-8 shadow-sm transition-transform hover:-translate-y-1">
            <ShieldCheck className="h-8 w-8 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Core Values</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Reliability:</strong> Always there when you need us.<br />
              <strong>Transparency:</strong> Honest reviews and clear communication.<br />
              <strong>Empathy:</strong> Understanding the stress of emergencies and acting with urgency.
            </p>
          </div>
        </div>
      </div>

      {/* Legal Links */}
      <div className="bg-card border-t border-border mt-auto">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Legal & Privacy</h3>
            <p className="text-sm text-muted-foreground">Read more about our terms of service and how we handle your data.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/terms')}
              className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" /> Terms & Conditions
            </button>
            <button 
              onClick={() => navigate('/privacy')}
              className="flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-foreground hover:bg-secondary/80 transition-colors"
            >
              <Lock className="h-4 w-4" /> Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
