import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldAlert, HeartPulse, Shield, Car, Bike, Info } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background pb-12">
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
      </div>
    </div>
  );
}
