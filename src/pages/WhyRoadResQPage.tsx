import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ShieldCheck, Clock, Wrench, Navigation, ArrowRight, Activity, Smartphone } from 'lucide-react';
import { SEO } from '../components/SEO';

export default function WhyRoadResQPage() {
  const [animationStage, setAnimationStage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationStage((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title="Why RoadResQ | Premium Roadside Assistance"
        description="Learn how RoadResQ is replacing unorganized service chaos with a premium, digitally native dispatch network engineered for sub-45 minute response times."
      />

      {/* Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md px-4 py-2 text-sm font-bold text-foreground shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:bg-primary hover:text-primary-foreground transition-all border border-border hover:-translate-x-1"
        >
          <ArrowRight className="h-4 w-4 rotate-180" /> 
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-8 sm:py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        
        <div className="mx-auto max-w-7xl relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              PHASE 1: TAMIL NADU EMERGENCY GRID
            </div>
            
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl mb-6 leading-[1.1]">
              Intelligent Roadside Assistance for <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Modern Mobility.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We're replacing unorganized service chaos and 3-hour waits with a premium, digitally native dispatch network engineered for sub-45 minute response times across Tamil Nadu.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link to="/map" className="rounded-full bg-foreground px-8 py-4 text-sm font-bold text-background transition-transform hover:scale-105 active:scale-95 shadow-xl">
                Explore Map
              </Link>
              <Link to="/emergency" className="rounded-full border-2 border-border bg-background px-8 py-4 text-sm font-bold text-foreground transition-all hover:border-primary hover:text-primary">
                Emergency SOS
              </Link>
            </div>
            
            <div className="grid grid-cols-3 gap-6 border-t border-border/50 pt-8">
              <div>
                <div className="text-2xl font-black text-foreground">45<span className="text-base text-muted-foreground">m</span></div>
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-1">Guaranteed ETA</div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">100%</div>
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-1">Price Transparency</div>
              </div>
              <div>
                <div className="text-2xl font-black text-foreground">24/7</div>
                <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase mt-1">Active Grid</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-md mx-auto"
          >
            {/* Animated Phone Mockup */}
            <div className="relative rounded-[3rem] border-[8px] border-foreground/10 bg-card shadow-2xl overflow-hidden aspect-[9/16] w-full max-w-[300px] mx-auto flex flex-col">
              <div className="absolute top-0 inset-x-0 h-7 bg-foreground/10 flex justify-center rounded-b-3xl w-1/3 mx-auto z-20"></div>
              
              {/* Map Background Animation */}
              <div className="absolute inset-0 bg-secondary/20 z-0">
                <motion.div 
                  animate={{ 
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'currentColor\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  }}
                />
              </div>

              <AnimatePresence mode="wait">
                {animationStage === 0 && (
                  <motion.div 
                    key="stage0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm"
                  >
                    <Wrench className="w-12 h-12 text-primary animate-bounce mb-4" />
                    <div className="text-xl font-black text-foreground">RoadResQ</div>
                    <div className="text-xs font-bold text-muted-foreground mt-2 tracking-widest">INITIALIZING GRID...</div>
                  </motion.div>
                )}

                {animationStage === 1 && (
                  <motion.div 
                    key="stage1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                  >
                    {/* Animated Map Pins Searching */}
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    >
                      <div className="w-32 h-32 rounded-full border-2 border-primary/50 border-dashed animate-spin-slow" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                    </motion.div>
                    
                    <div className="absolute bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border p-6 rounded-t-[2rem] h-[40%] flex flex-col justify-center">
                      <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 shrink-0" />
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <Activity className="w-6 h-6 text-primary animate-pulse" />
                        <span className="text-base font-bold text-foreground">Searching mechanics...</span>
                      </div>
                      <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wider">Scanning 5km radius</p>
                    </div>
                  </motion.div>
                )}

                {animationStage === 2 && (
                  <motion.div 
                    key="stage2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-10"
                  >
                    {/* Map Area */}
                    <div className="absolute inset-x-0 top-0 h-[45%] relative bg-secondary/20 overflow-hidden rounded-t-[2rem]">
                      {/* Richer Map Background Image */}
                      <div 
                        className="absolute inset-0 opacity-80" 
                        style={{ 
                          backgroundImage: "url('/map_bg.jpg')", 
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center' 
                        }}
                      ></div>
                      
                      {/* Route Line Container */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 drop-shadow-md">
                        <defs>
                          <clipPath id="routeClip">
                            <motion.rect
                              initial={{ x: "0%", y: "20%", width: "100%", height: "80%" }}
                              animate={{ x: "0%", y: "60%", width: "100%", height: "40%" }}
                              transition={{ duration: 3.5, ease: "linear" }}
                            />
                          </clipPath>
                        </defs>

                        {/* Static grey background line for the full path */}
                        <line x1="80%" y1="20%" x2="50%" y2="60%" stroke="currentColor" strokeWidth="4" opacity="0.15" strokeLinecap="round" />
                        
                        {/* Animated primary line reducing as mechanic moves */}
                        <line 
                          x1="80%" y1="20%" x2="50%" y2="60%"
                          stroke="var(--primary)" 
                          strokeWidth="3" 
                          strokeDasharray="6,6"
                          strokeLinecap="round"
                          clipPath="url(#routeClip)"
                        />
                      </svg>

                      {/* User Pin */}
                      <div className="absolute top-[60%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                          <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.3)] relative z-10 border-2 border-background">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      {/* Mechanic Pin Moving */}
                      <motion.div 
                        initial={{ top: "20%", left: "80%" }}
                        animate={{ top: "60%", left: "50%" }}
                        transition={{ duration: 3.5, ease: "linear" }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                      >
                        <div className="bg-green-500 text-white p-2 rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.4)] border-2 border-background transform scale-110">
                          <Wrench className="w-4 h-4" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Enhanced Mechanic Details Bottom Sheet */}
                    <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      className="absolute bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border p-6 rounded-t-[2rem] h-[55%] flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)]"
                    >
                      <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 shrink-0" />
                      
                      <div className="flex-1 overflow-y-auto flex flex-col">
                        <div className="flex items-center gap-4 mb-5">
                          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
                            <Wrench className="w-6 h-6 text-green-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground text-sm">Rajesh Auto Works</h4>
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground mt-1">
                              <span className="flex items-center gap-1 text-foreground"><MapPin className="w-3 h-3 text-primary" /> 2.4 km away</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-secondary/50 rounded-xl p-3 flex justify-between items-center mb-6 border border-border/50">
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">Estimated Time</span>
                            <span className="text-sm font-black text-green-500 flex items-center gap-1"><Clock className="w-3 h-3" /> 12 Mins</span>
                          </div>
                          <div className="w-px h-8 bg-border"></div>
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase text-muted-foreground font-bold tracking-wider mb-0.5">Service</span>
                            <span className="text-sm font-black text-foreground">Breakdown Help</span>
                          </div>
                        </div>

                        <div className="mt-auto">
                          <button className="w-full bg-primary text-primary-foreground text-center py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                            <Smartphone className="w-4 h-4" /> Track Live Location
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Decorative blurs */}
            <div className="absolute -inset-10 bg-primary/20 blur-[100px] -z-10 rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Trust & Latency Section */}
      <section className="px-4 py-20 sm:px-8 bg-card border-y border-border/50">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-3xl font-black text-foreground sm:text-4xl mb-6">Solving the Trust & Latency Collapse</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg mb-16">
            While vehicle registrations skyrocket across Tamil Nadu, the physical support layer remains dangerously broken. RoadResQ is the digital remedy.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: ShieldCheck,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                title: "Eradicating the Trust Deficit",
                desc: "No more aggressive upselling or artificial estimates. RoadResQ enforces strict, pre-approved pricing models validated before the mechanic arrives."
              },
              {
                icon: MapPin,
                color: "text-primary",
                bg: "bg-primary/10",
                title: "Navigating Tier-2 Infrastructure",
                desc: "Our smart dispatch system actively monitors hyper-local restrictions to route mechanics optimally, dodging traffic bottlenecks and closed roads."
              },
              {
                icon: Clock,
                color: "text-green-500",
                bg: "bg-green-500/10",
                title: "Overcoming Operational Latency",
                desc: "Legacy aggregators treat dispatch as a call-center cost. RoadResQ uses algorithmic matching to slash response times from 180 minutes to under 45 minutes."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="rounded-3xl border border-border bg-background p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="px-4 py-24 sm:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20 -z-10" />
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-black text-foreground sm:text-4xl mb-4">Phase 1 Architecture</h2>
          <p className="text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
            An on-demand system engineered explicitly for the digital-first Indian consumer facing critical roadside emergencies.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-border -z-10">
              <motion.div 
                className="h-full bg-primary"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
            </div>

            {[
              { icon: Smartphone, label: "Request Aid", sub: "Stranded driver requests help via our web platform" },
              { icon: Activity, label: "Direct Matching", sub: "Instantly connected with the nearest verified partner" },
              { icon: Wrench, label: "Service & Payment", sub: "Mechanic arrives, fixes the issue, and gets paid directly" }
            ].map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: idx * 0.2, 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 100 
                }}
                className="group flex flex-col items-center bg-card p-8 rounded-[2rem] border border-border shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-colors w-full md:w-1/3 max-w-[280px]"
              >
                <div className="w-20 h-20 rounded-full bg-background border-4 border-card shadow-inner flex items-center justify-center mb-6 relative z-10 group-hover:bg-primary transition-colors duration-300">
                  <step.icon className="w-10 h-10 text-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h4 className="font-black text-foreground mb-3 text-lg text-center">{step.label}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed px-2 text-center">{step.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-8 mb-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[3rem] border border-border/50 bg-card p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-6">Build the Support Grid with Us</h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                We are replacing the unorganized service nightmare with a high-trust, verified gig network. Join RoadResQ and multiply your earning potential through our transparent dispatch system.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/submit" className="w-full sm:w-auto rounded-full bg-foreground px-8 py-4 text-sm font-bold text-background transition-transform hover:scale-105 shadow-xl">
                  Become a Partner
                </Link>
                <Link to="/about" className="w-full sm:w-auto rounded-full border border-border bg-background px-8 py-4 text-sm font-bold text-foreground transition-colors hover:bg-secondary">
                  Read Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
