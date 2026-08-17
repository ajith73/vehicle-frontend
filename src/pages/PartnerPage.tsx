import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { SEO } from '../components/SEO';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, Wallet, Clock, ShieldCheck, 
  Settings, Battery, Wrench, Droplets, Star,
  ChevronDown, ChevronUp, UserPlus
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "How do I join the RoadResQ partner program?",
    answer: "It's simple! Click 'Register Now' on this page to create your profile. Once you submit your details and verify your identity, you can start accepting service requests in less than 24 hours."
  },
  {
    question: "How much can I earn as a RoadResQ partner?",
    answer: "Your earnings depend entirely on the number of services you complete. The best part? You keep 100% of what you earn. Customers pay you directly for your services, and we don't take any commission."
  },
  {
    question: "Do I have to work specific hours?",
    answer: "Not at all. You are your own boss! You can log into the partner portal and accept requests whenever it suits your schedule. There are absolutely no mandatory login hours."
  },
  {
    question: "What services can I offer on RoadResQ?",
    answer: "We support a huge variety of vehicle services. Whether you specialize in towing, battery jump-starts, tyre changes, or general engine repair, you can select the exact services you are equipped to handle during your registration."
  },
  {
    question: "Where does RoadResQ currently operate?",
    answer: "We are currently operating across all major cities and towns in Tamil Nadu (including Chennai, Coimbatore, and Madurai). We are growing fast and plan to expand our services all over India very soon!"
  },
  {
    question: "What happens if I need help while on a job?",
    answer: "We've got your back. Our dedicated support team is available to help you. You can reach out directly through the partner web portal or call our emergency hotline for immediate assistance."
  }
];

const CITIES = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", 
  "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul", 
  "Thanjavur", "Ranipet", "Sivakasi", "Karur", "Ooty"
];

const DEFAULT_SERVICES = [
  { name: 'Tyre Change', icon: Settings },
  { name: 'Battery Jump Start', icon: Battery },
  { name: 'Towing', icon: Wrench },
  { name: 'Engine Repair', icon: Wrench },
  { name: 'Fuel Delivery', icon: Droplets },
  { name: 'AC Repair', icon: Settings },
];

const getIconForService = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('battery')) return Battery;
  if (n.includes('tow')) return Wrench;
  if (n.includes('engine')) return Wrench;
  if (n.includes('fuel') || n.includes('oil') || n.includes('coolant')) return Droplets;
  return Settings;
};

const TESTIMONIALS = [
  {
    name: "Ramesh Kumar",
    role: "Expert Tyre Repair",
    rating: 5,
    text: "I've been partnered with RoadResQ for a few months now. Since it's all through the web portal, I didn't even have to install anything. I just get alerts, accept the ones near me, and customers pay me directly. It's totally hassle-free.",
    location: "Coimbatore"
  },
  {
    name: "Manish Yadav",
    role: "Towing Specialist",
    rating: 5,
    text: "What I really like is the freedom. I just log into the portal whenever my garage has some downtime. It brings in extra local customers that I wouldn't have found otherwise, and I keep everything I earn.",
    location: "Chennai"
  },
  {
    name: "Karthik Rajan",
    role: "General Repair",
    rating: 5,
    text: "The support team actually picks up the phone when you need them. I had an issue locating a customer late at night, and they sorted it out instantly. Highly recommend giving it a try if you run a shop.",
    location: "Madurai"
  }
];

export default function PartnerPage() {
  const navigate = useNavigate();
  const [hours, setHours] = useState(25);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [services, setServices] = useState<{name: string, icon: any}[]>(DEFAULT_SERVICES);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await apiClient<any>('/public/specific-services');
        if (data && data.length > 0) {
          const formatted = data.map((s: any) => ({
            name: s.name,
            icon: getIconForService(s.name)
          }));
          setServices(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, []);

  const calculateEarnings = () => {
    // Assuming an average of ₹1000/hr
    return (hours * 1000 * 4).toLocaleString('en-IN');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Become a Partner Mechanic | RoadResQ"
        description="Join the RoadResQ partner network. Provide emergency vehicle assistance, tyre changes, and towing services across Tamil Nadu. Set your own hours and keep 100% of your earnings."
        url="https://roadresq.in/partner"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-background to-pink-500/10" />
        <div className="absolute top-1/4 -left-64 h-96 w-96 rounded-full bg-purple-500/20 blur-[128px]" />
        <div className="absolute bottom-1/4 -right-64 h-96 w-96 rounded-full bg-pink-500/20 blur-[128px]" />
        
        <div className="container relative mx-auto px-4 sm:px-6 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-8">
            <motion.div 
              className="flex-1 text-center md:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-600 dark:text-green-400 mb-6">
                <CheckCircle2 className="h-4 w-4" /> Sign up is free
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-6">
                Earn <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">₹800–₹1,200/hr</span><br />
                as a Partner Mechanic
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto md:mx-0">
                Drive when you want. Earn what you need. Join the RoadResQ network to provide emergency vehicle assistance and build a successful business on your terms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/submit')}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-base font-black text-white transition-all hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:-translate-y-1 active:translate-y-0"
                >
                  Register Now <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex-1 relative flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative w-72 h-[600px] rounded-[3rem] border-8 border-gray-900 bg-gray-900 shadow-2xl overflow-hidden hidden sm:block">
                <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-black p-6 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
                    <div className="h-10 w-10 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Searching for requests...</h3>
                  <div className="mt-8 p-4 rounded-xl bg-gray-800 w-full border border-gray-700">
                    <p className="text-gray-400 text-sm mb-1">Today's Earnings</p>
                    <p className="text-white text-3xl font-black">₹3,900</p>
                  </div>
                </div>
              </div>
              
              {/* Floating element */}
              <motion.div 
                className="absolute -right-4 md:-right-12 top-1/3 p-4 rounded-2xl bg-background border border-border shadow-xl hidden lg:flex items-center gap-3"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">New request</p>
                  <p className="text-sm font-bold">Tyre Change • 2km</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Why mechanics choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">RoadResQ</span>
            </h2>
            <p className="text-muted-foreground">More flexibility, steady income, and full control over your work.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div 
              className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              {...fadeInUp}
            >
              <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Keep 100% of your earnings</h3>
              <p className="text-muted-foreground text-sm">
                Customers pay you directly for your services. We don't take any commission from your hard-earned money.
              </p>
            </motion.div>
            
            <motion.div 
              className="p-6 rounded-3xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <div className="h-12 w-12 rounded-2xl bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your schedule, your rules</h3>
              <p className="text-muted-foreground text-sm">
                No shifts, no minimum hours. Open the app when you want to work, close it when you're done.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              How much could you make in a week with RoadResQ?
            </h2>
          </motion.div>

          <motion.div 
            className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-lg"
            {...fadeInUp}
          >
            <div>
              <label className="block text-sm font-bold text-foreground mb-4">
                I want to work for
              </label>
              <div className="flex items-center gap-4 mb-6">
                <input 
                  type="range" 
                  min="5" 
                  max="60" 
                  step="5"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span className="text-lg font-black min-w-[60px] text-right">{hours} hrs</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Drag the slider to adjust your expected working hours per week.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
              </div>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wider">
                Estimated Earnings
              </p>
              <div className="text-4xl md:text-5xl font-black text-foreground mb-2">
                ₹{calculateEarnings()} <span className="text-lg md:text-xl text-muted-foreground font-medium">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on an average of ₹1000/hr. Actual earnings may vary based on location, time, and service type.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              3 steps to your first payout
            </h2>
            <p className="text-muted-foreground">Get started quickly and complete your setup in under 24 hours.</p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-border -translate-y-1/2 rounded-full" />
            
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                {
                  step: 1,
                  title: "Register Online",
                  desc: "Fill out a quick form. We just need some basic details and your contact information.",
                  icon: UserPlus
                },
                {
                  step: 2,
                  title: "Verify Your Identity",
                  desc: (
                    <>
                      Upload a photo of your ID and wait for quick approval. Please ensure you have the{" "}
                      <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                        required documents
                      </a>
                      . This usually takes less than 24 hours.
                    </>
                  ),
                  icon: ShieldCheck
                },
                {
                  step: 3,
                  title: "Start Earning",
                  desc: "Log in to our partner web portal or install our PWA on your phone, go online, and accept your first rescue request!",
                  icon: Wallet
                }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm relative"
                  {...fadeInUp}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center font-black text-lg border-4 border-background">
                    {item.step}
                  </div>
                  <div className="h-16 w-16 mx-auto rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Multiple Services */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 text-center mb-12">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Multiple services, one app
            </h2>
            <p className="text-muted-foreground">Choose the services you want to provide based on your skills.</p>
          </motion.div>
        </div>
        
        <div className="flex flex-wrap gap-4 px-4 pb-8 justify-center max-w-5xl mx-auto">
          {services.map((service, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2 px-6 py-4 rounded-full border border-border bg-card shadow-sm whitespace-nowrap hover:shadow-md transition-shadow hover:-translate-y-0.5"
              {...fadeInUp}
              transition={{ delay: (i % 10) * 0.05 }}
            >
              <service.icon className="h-5 w-5 text-purple-500" />
              <span className="font-bold text-sm">{service.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Hear from our top partners
            </h2>
            <p className="text-muted-foreground">Real stories from mechanics who use RoadResQ daily.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <motion.div 
                key={i}
                className="bg-card border border-border rounded-3xl p-8 shadow-sm flex flex-col"
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} • {t.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">
                  "{t.text}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Partner opportunities across Tamil Nadu
            </h2>
            <p className="text-muted-foreground">We currently operate across Tamil Nadu, with plans to expand all over India soon!</p>
          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">Active Cities</p>
            <div className="flex flex-wrap gap-3">
              {CITIES.map((city, i) => (
                <div 
                  key={i}
                  className="px-4 py-2 rounded-xl bg-muted/50 border border-border text-sm font-semibold hover:bg-muted transition-colors cursor-default"
                >
                  {city}
                </div>
              ))}
              <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-sm font-semibold">
                + more added weekly
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <motion.div 
            className="text-center mb-12"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
              Common questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, i) => (
              <motion.div 
                key={i}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                initial={false}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-bold text-foreground">{item.question}</span>
                  {activeFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 bg-gradient-to-br from-purple-900 to-pink-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIzIiBmaWxsPSIjZmZmZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8">
            Ready to start earning?
          </h2>
          <button
            onClick={() => navigate('/submit')}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-black text-purple-900 transition-all hover:bg-gray-100 shadow-xl hover:-translate-y-1 active:translate-y-0"
          >
            Register Now <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
