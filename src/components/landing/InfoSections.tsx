import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Fuel, Zap, Droplets, Settings, ArrowRight, ShieldAlert } from 'lucide-react';
import ShareButtons from '../ShareButtons';

export function InfoSections() {
  const navigate = useNavigate();

  return (
    <>
      {/* Support Us Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-2 pb-10 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 via-card to-pink-500/5 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-pink-600 dark:text-pink-400">Support Us</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Help keep our platform running</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Your donations directly fund our server and domain maintenance costs. By contributing, you help us keep this vital emergency roadside assistance network completely free and available 24/7 for everyone who needs it.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-pink-500/20 bg-background/80 p-4 sm:p-5 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Make a contribution</p>
              <p className="text-sm text-muted-foreground">
                Any amount you provide goes a long way toward keeping our services online without interruptions.
              </p>
              <button
                onClick={() => navigate('/donate')}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90 shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:-translate-y-0.5"
              >
                Donate Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Hub Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-2 pb-10 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/15 via-card to-orange-500/5 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-orange-500" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">Emergency Hub</p>
              </div>
              <h3 className="text-2xl font-black text-foreground sm:text-3xl">Roadside Assistance & Emergency Numbers</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Find verified emergency contacts, national highway helplines, and 24/7 manufacturer roadside assistance (RSA) numbers for major car and bike brands across India.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-orange-500/20 bg-background/80 p-4 sm:p-5 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Need urgent help?</p>
              <p className="text-sm text-muted-foreground">
                Quick access to police, ambulance, NHAI, and official service centers.
              </p>
              <button
                onClick={() => navigate('/emergency')}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white transition-all hover:opacity-90 shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:-translate-y-0.5"
              >
                View Emergency Contacts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-2 pb-16 sm:px-8">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
          <Activity className="h-6 w-6 text-blue-500" /> Essential Stations
        </h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <button
            onClick={() => window.open('https://www.google.com/maps/search/petrol+station+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition-transform group-hover:scale-110">
              <Fuel className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-foreground text-center">Petrol Station ⛽</span>
          </button>

          <button
            onClick={() => window.open('https://www.google.com/maps/search/cng+station+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
              <Fuel className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-foreground text-center">CNG Station 🟢</span>
          </button>

          <button
            onClick={() => window.open('https://www.google.com/maps/search/ev+charging+station+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
              <Zap className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-foreground text-center">EV Charging ⚡</span>
          </button>

          <button
            onClick={() => window.open('https://www.google.com/maps/search/car+wash+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500 transition-transform group-hover:scale-110">
              <Droplets className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-foreground text-center">Car Wash 🧽</span>
          </button>

          <button
            onClick={() => window.open('https://www.google.com/maps/search/auto+parts+store+near+me', '_blank')}
            className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md col-span-2 sm:col-span-1"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500/10 text-slate-500 transition-transform group-hover:scale-110">
              <Settings className="h-6 w-6" />
            </div>
            <span className="text-sm font-bold text-foreground text-center">Auto Parts ⚙️</span>
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/30 shadow-sm">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">Mechanic / Service Provider</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Create a new listing or update your existing record</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                If you are a mechanic, workshop, towing partner, or roadside service provider, you can submit your details here.
                Search your current record first, or create a new request if you are not listed yet.
              </p>
              <div className="mt-5 flex flex-col gap-1.5 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛡️</span>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm sm:text-base">Get Verified Badge</h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Build trust with users by getting the "Verified Shield". Verify your phone, location, shop photos, and identity to stand out and become a Premium Partner!
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
              <p className="text-sm font-semibold text-foreground">What happens next?</p>
              <p className="text-sm text-muted-foreground">
                Your submission goes to the Super Admin for review before it becomes live or updates the current listing.
              </p>
              <button 
                onClick={() => navigate('/submit')}
                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Create or Update Record
              </button>
              <button 
                onClick={() => navigate('/verify-start')}
                className="mt-1 inline-flex items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/30 px-5 py-3 text-sm font-black text-blue-700 dark:text-blue-300 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800"
              >
                🛡️ Verify My Business
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-card to-purple-500/5 shadow-sm">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">About Us</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Bridging the gap in emergency assistance</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Discover why we built this platform, how we solve problems for stranded drivers in minutes, and our core mission to empower local mechanics and increase their revenue.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <button
                onClick={() => navigate('/about')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-purple-600 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-purple-700 shadow-[0_8px_30px_rgba(147,51,234,0.3)] hover:-translate-y-1 active:translate-y-0"
              >
                Read Our Story <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-card to-blue-500/5 shadow-sm">
          <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Contact Us</p>
              <h3 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">Connect with the creator</h3>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Reach out to discuss future plans, real-time connectivity, or investment opportunities.
              </p>
            </div>
            <div className="flex flex-col justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white transition-colors hover:bg-blue-700 shadow-[0_8px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 active:translate-y-0"
              >
                Contact Me <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-8 flex flex-col items-center">
        <div className="w-full overflow-hidden rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-card to-green-500/5 shadow-sm p-8 sm:p-10">
          <div className="flex flex-col items-center justify-center text-center">
            <h3 className="mb-4 text-2xl font-black text-foreground sm:text-3xl">Spread the Word</h3>
            <p className="mb-8 text-muted-foreground max-w-2xl text-sm sm:text-base">
              Help us grow! Share RoadResQ with your network so they're never stranded on the road.
            </p>
            <ShareButtons url="https://roadresq.in" title="RoadResQ - 24/7 Roadside Assistance in Tamil Nadu" />
          </div>
        </div>
      </div>
    </>
  );
}
