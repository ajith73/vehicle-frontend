import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { ArrowLeft, Shield, Eye, Users, Lock, HelpCircle } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const lastUpdated = 'August 2026';

  return (
    <div className="flex-1 w-full bg-background flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <SEO
        title="Privacy Policy | RoadResQ"
        description="Review the RoadResQ privacy policy covering location data, voluntary submissions, platform security, and how roadside assistance search data is used."
        url="https://roadresq.in/privacy"
        keywords="RoadResQ privacy policy, roadside assistance privacy, mechanic platform data policy"
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-medium">
            Last Updated: {lastUpdated} • We care deeply about protecting your personal and location data.
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
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">1. Information We Collect</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                To connect you effectively with nearby mechanic services, we collect minimal but necessary details:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Location Coordinates:</strong> With your permission, we access your device GPS or approximate IP location to calculate search distances. Location is processed instantly and is never logged permanently.
                </li>
                <li>
                  <strong>Contact Details:</strong> When submitting feedback, updating dynamic listings, or using support requests, we collect your name, phone number, and email.
                </li>
                <li>
                  <strong>Device Data:</strong> We audit basic analytics (browser versions, operating system, and crash reports) to improve Platform speed.
                </li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">2. How We Use Information</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                We strictly use your information to operate and improve RoadResQ. 
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-sm text-muted-foreground">
                <li>To show locations of nearby workshops and list towing routes.</li>
                <li>To contact you regarding feedback or dynamic listing reports.</li>
                <li>To optimize the crawler paths of search engine bots (SEO) for district directories.</li>
                <li>We do not sell, rent, or monetize your search history or private details to third-party ad networks.</li>
              </ul>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">3. Information Sharing</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                We only share your contact number or approximate location with independent mechanics when you manually choose to click their contact buttons or explicitly request call dispatch details. Once you leave our platform, any interactions are governed by the mechanic's own privacy habits.
              </p>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">4. Security & Protection</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                We safeguard your submissions with modern SSL/TLS encryption for all api connections. We secure database access protocols and purge local cached location logs regularly. However, remember that no digital transmission is completely invulnerable to external compromise.
              </p>
            </section>

            <section className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground">5. Cookies & Local Preference Storage</h2>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                RoadResQ does not target intrusive tracking cookies. We utilize browser LocalStorage solely to remember basic user preferences, such as your theme toggle state (dark/light mode) or your last manually confirmed location search filters, ensuring a smoother reload.
              </p>
            </section>
          </div>

          {/* Quick Summary Sidebar */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
              <h3 className="font-bold text-foreground mb-3 text-sm uppercase tracking-wider">Privacy Commit</h3>
              <div className="space-y-4 text-xs text-muted-foreground">
                <div className="border-b border-border/60 pb-3">
                  <p className="font-bold text-foreground mb-1">Temporary GPS</p>
                  <p>Location search parameters are deleted instantly after use.</p>
                </div>
                <div className="border-b border-border/60 pb-3">
                  <p className="font-bold text-foreground mb-1">No Ad Networks</p>
                  <p>We do not bundle any marketing SDKs or commercial tracking.</p>
                </div>
                <div className="border-b border-border/60 pb-3">
                  <p className="font-bold text-foreground mb-1">Data Correction</p>
                  <p>Request listing removal or changes instantly via feedback form.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/10 to-secondary/15 p-5 shadow-sm">
              <h3 className="font-bold text-foreground mb-2 text-sm">Have data questions?</h3>
              <p className="text-xs text-muted-foreground mb-4">Contact our administrator team to query or purge your submission records.</p>
              <button 
                onClick={() => navigate('/feedback')}
                className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-xs font-bold transition-all hover:bg-primary/90"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
