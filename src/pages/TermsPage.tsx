import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowLeft, ShieldCheck, Clock, FileText, Landmark, Scale, AlertTriangle, RefreshCw } from 'lucide-react';

export default function TermsPage() {
  const navigate = useNavigate();
  const lastUpdated = 'August 2026';

  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <SEO
        title="Terms and Conditions | RoadResQ"
        description="Read the RoadResQ terms and conditions for roadside assistance discovery, mechanic listings, platform usage, and payment responsibility."
        url="https://roadresq.in/terms"
        keywords="RoadResQ terms, roadside assistance terms, mechanic platform conditions"
      />
      
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-card border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 z-0" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-8 text-center sm:text-left">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-medium">
            Last Updated: {lastUpdated} • Please read these terms carefully before using RoadResQ.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr,280px]">
          {/* Main Legal Content */}
          <div className="space-y-8">
            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">1. Introduction & Acceptance</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                Welcome to RoadResQ. By accessing our website, mobile application, or any associated service (collectively, the "Platform"), you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you are prohibited from using the Platform and must discontinue use immediately.
              </p>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">2. Intermediary Service Disclaimer</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                RoadResQ is strictly a directory and location-matching technology platform. We connect drivers in need of assistance with independent third-party mechanics, garages, and towing service providers.
              </p>
              <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-600 dark:text-amber-500 flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>
                  <strong>CRITICAL:</strong> RoadResQ does not employ mechanics, own repair workshops, or supply emergency roadside services directly. We have no control over, and assume no responsibility for, the quality, safety, legality, timing, or performance of services rendered by any listed third-party provider.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Landmark className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">3. Service Contracts & Payments</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                When you request assistance, you are entering into a direct contract with the independent mechanic. 
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-muted-foreground">
                <li>All service costs, spare parts pricing, towing rates, and payment methods must be negotiated directly between you and the mechanic.</li>
                <li>RoadResQ charges 0% commission on repairs and does not process payments for roadside repairs or towing transactions.</li>
                <li>Users are responsible for verifying pricing with the technician prior to starting any vehicle diagnostic or repair work.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">4. Mechanic Listings & Verification</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                We make reasonable efforts to verify profile details submitted by mechanics. However, we cannot guarantee the ongoing credentials, licensing, or active status of listed businesses.
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-muted-foreground">
                <li>Mechanics registering on the Platform must provide true, accurate, and current information.</li>
                <li>We reserve the right to remove any listing immediately if reports of poor quality, fraud, or incorrect contact details are verified.</li>
                <li>Drivers are encouraged to use the "Feedback" button to report wrong coordinates, incorrect phone numbers, or closed workshops.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">5. Limitation of Liability</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                To the maximum extent permitted by applicable law, RoadResQ, its administrators, and its affiliates shall not be liable for any direct, indirect, consequential, exemplary, or special damages. This includes, but is not limited to, damage to vehicles during towing/repair, highway delays, personal injury, or financial disputes arising from services discovered through the Platform.
              </p>
            </section>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Quick Summary</h3>
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="border-b border-border/60 pb-3">
                  <p className="font-bold text-foreground mb-1">Intermediary Only</p>
                  <p>RoadResQ is a free matchmaker. We don't perform repairs.</p>
                </div>
                <div className="border-b border-border/60 pb-3">
                  <p className="font-bold text-foreground mb-1">Direct Payments</p>
                  <p>Pay the mechanic directly. We collect no commission.</p>
                </div>
                <div className="border-b border-border/60 pb-3">
                  <p className="font-bold text-foreground mb-1">Listing Accuracy</p>
                  <p>Always verify details before arranging a tow or dispatch.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-secondary/15 p-5 shadow-sm">
              <h3 className="font-bold text-foreground mb-2 text-sm">Need to report a listing?</h3>
              <p className="text-xs text-muted-foreground mb-4">Help us keep the directory clean. Report bad numbers or invalid shops.</p>
              <button 
                onClick={() => navigate('/feedback')}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-bold transition-all hover:bg-primary/90"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
