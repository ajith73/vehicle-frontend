import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, Lightbulb, MessageCircle, Star, AlertTriangle, Send, CheckCircle2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { apiClient } from '../api/apiClient';

const FEEDBACK_TYPES = [
  { name: 'Bug Report', icon: Bug, prompt: 'Tell us what broke, where it happened, and how we can reproduce it.' },
  { name: 'Wrong Mechanic Information', icon: AlertTriangle, prompt: 'Report incorrect phone numbers, addresses, timing, services, or closed shops.' },
  { name: 'Request Location Coverage', icon: MapPin, prompt: 'Let us know your area and the details of any missing mechanic shops we should add to our platform.' },
  { name: 'Suggestion', icon: Lightbulb, prompt: 'Share an idea that would make the platform more useful in real roadside situations.' },
  { name: 'UI Improvement', icon: Star, prompt: 'Point out screens that feel confusing, crowded, slow, or hard to use.' },
  { name: 'Other', icon: MessageCircle, prompt: 'Anything else you want the team to know.' }
];

const MECHANIC_FEEDBACK_SUGGESTIONS = [
  'Wrong phone number',
  'Address or landmark is incorrect',
  'Business is permanently closed',
  'Service types are inaccurate',
  'Operating hours are wrong',
  'Mechanic is duplicated',
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [type, setType] = useState(FEEDBACK_TYPES[0].name);
  const [description, setDescription] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [mechanicSearch, setMechanicSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [mechanics, setMechanics] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPublicMechanics = async () => {
      try {
        const data = await apiClient<any>('/public/mechanics');
        setMechanics(data);
      } catch (e) {
        console.error('Failed to load mechanics', e);
      }
    };
    fetchPublicMechanics();
  }, []);
  
  const showMechanicSelect = type === 'Wrong Mechanic Information';
  const selectedType = FEEDBACK_TYPES.find((item) => item.name === type) || FEEDBACK_TYPES[0];
  const filteredMechanicOptions = mechanicSearch.trim().length < 2
    ? []
    : mechanics
        .filter((m) => {
          const haystack = `${m.businessName || m.name || ''} ${m.area || ''} ${m.city || ''}`.toLowerCase();
          return haystack.includes(mechanicSearch.trim().toLowerCase());
        })
        .slice(0, 8)
        .map((m) => ({
          value: m.id.toString(),
          label: `${m.businessName || m.name}${m.area ? `, ${m.area}` : ''}${m.city ? `, ${m.city}` : ''}`
        }));

  const applySuggestion = (suggestion: string) => {
    setDescription((current) => {
      if (!current.trim()) return `${suggestion}: `;
      if (current.includes(suggestion)) return current;
      return `${suggestion}\n${current}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Submitting feedback...');
    try {
      let finalDescription = description;
      if (showMechanicSelect && mechanicId) {
        const selectedMechanic = mechanics.find(m => m.id.toString() === mechanicId);
        const mechanicName = selectedMechanic ? (selectedMechanic.businessName || selectedMechanic.name) : mechanicId;
        finalDescription = `[Mechanic: ${mechanicName} (ID: ${mechanicId})]\n${description}`;
      }
      
      await apiClient('/public/feedback', {
        method: 'POST',
        data: { 
          type, 
          description: finalDescription
        }
      });
      toast.success('Feedback submitted successfully!', { id: loadingToast });
      setSuccess(true);
      // Reset form but don't close modal until they click ok
      setDescription('');
      setMechanicId('');
      setMechanicSearch('');
    } catch (err) {
      toast.error('Network error submitting feedback.', { id: loadingToast });
    }
    setLoading(false);
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-4 sm:p-8 pb-[80px] sm:pb-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <div className="max-w-xl w-full bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/10 dark:border-white/5">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">We Value Your Input</h2>
          <p className="text-muted-foreground text-lg">Help us improve the platform for everyone.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground ml-1">Feedback Category</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEEDBACK_TYPES.map(t => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setType(t.name);
                    setDescription('');
                    setMechanicId('');
                    setMechanicSearch('');
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                    type === t.name
                      ? 'border-primary bg-primary/10 text-primary shadow-md'
                      : 'border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-background/50'
                  }`}
                >
                  <t.icon className="w-5 h-5 shrink-0" />
                  <span className="font-semibold text-sm leading-tight">{t.name}</span>
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border/50 bg-background/50 p-4 text-sm text-muted-foreground">
              {selectedType.prompt}
            </div>
          </div>

          {showMechanicSelect && (
            <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-bold text-foreground ml-1">Select Mechanic (Optional)</label>
              <p className="text-sm text-muted-foreground">Start typing at least 2 characters to search suggestions. We will not show the full mechanic list by default.</p>
              <Select
                options={filteredMechanicOptions}
                value={mechanicId ? filteredMechanicOptions.find((option) => option.value === mechanicId) || null : null}
                onChange={(selected: any) => setMechanicId(selected ? selected.value : '')}
                onInputChange={(value, meta) => {
                  if (meta.action === 'input-change') setMechanicSearch(value);
                }}
                isClearable
                isSearchable
                placeholder="Type mechanic name, area, or city..."
                noOptionsMessage={() => mechanicSearch.trim().length < 2 ? 'Type 2 or more characters to search' : 'No matching mechanics found'}
                unstyled
                classNames={{
                  control: (state) => 
                    `p-2 rounded-2xl border-2 transition-all outline-none bg-background/50 text-foreground ${state.isFocused ? 'border-primary ring-4 ring-primary/10' : 'border-border/50'}`,
                  menu: () => "bg-card border border-border mt-2 rounded-xl overflow-hidden shadow-xl z-50",
                  option: (state) => `p-3 rounded-lg cursor-pointer transition-colors ${state.isFocused ? 'bg-primary/10 text-primary' : 'hover:bg-secondary text-foreground'}`,
                  input: () => "text-foreground",
                  singleValue: () => "text-foreground font-medium",
                  placeholder: () => "text-muted-foreground",
                  menuList: () => "p-1.5 flex flex-col gap-1",
                  clearIndicator: () => "text-muted-foreground hover:text-foreground p-1",
                  dropdownIndicator: () => "text-muted-foreground hover:text-foreground p-1",
                }}
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {MECHANIC_FEEDBACK_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                    className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground ml-1">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="w-full p-4 rounded-2xl border-2 border-border/50 bg-background/50 text-foreground resize-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !description.trim() || (showMechanicSelect && !mechanicId)}
            className="mt-4 flex items-center justify-center gap-2 w-full px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-primary/20"
          >
            {loading ? 'Submitting...' : (
              <>
                <Send size={20} /> Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>

      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-card shadow-2xl rounded-3xl p-8 sm:p-12 border border-border text-center transform animate-in zoom-in-95 duration-500">
            <div className="mx-auto w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-4">Thank You!</h2>
            <p className="text-muted-foreground text-lg mb-8">Your feedback is incredibly valuable to us and has been recorded successfully.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setSuccess(false)} 
                className="flex-1 px-6 py-3 bg-secondary text-secondary-foreground font-bold rounded-xl hover:bg-secondary/80 transition-all"
              >
                Submit More
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
