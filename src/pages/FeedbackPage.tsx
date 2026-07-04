import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, Lightbulb, MessageCircle, Star, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../api/apiClient';

const FEEDBACK_TYPES = [
  { name: 'Bug Report', icon: Bug },
  { name: 'Wrong Mechanic Information', icon: AlertTriangle },
  { name: 'Suggestion', icon: Lightbulb },
  { name: 'UI Improvement', icon: Star },
  { name: 'Other', icon: MessageCircle }
];

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [type, setType] = useState(FEEDBACK_TYPES[0].name);
  const [description, setDescription] = useState('');
  const [mechanicId, setMechanicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [mechanics, setMechanics] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchPublicMechanics = async () => {
      try {
        const res = await fetch(`${API_URL}/public/mechanics`);
        if (res.ok) {
          const data = await res.json();
          setMechanics(data);
        }
      } catch (e) {
        console.error('Failed to load mechanics', e);
      }
    };
    fetchPublicMechanics();
  }, []);
  
  const showMechanicSelect = type === 'Wrong Mechanic Information';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading('Submitting feedback...');
    try {
      const res = await fetch(`${API_URL}/public/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          description,
          mechanicId: showMechanicSelect && mechanicId ? parseInt(mechanicId) : undefined 
        })
      });
      if (res.ok) {
        toast.success('Feedback submitted successfully!', { id: loadingToast });
        setSuccess(true);
      } else {
        toast.error('Failed to submit feedback.', { id: loadingToast });
      }
    } catch (err) {
      toast.error('Network error submitting feedback.', { id: loadingToast });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-4 sm:p-8 pb-[80px] sm:pb-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-background to-background -z-10" />
        <div className="max-w-md w-full bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-12 border border-white/10 dark:border-white/5 text-center transform animate-in zoom-in duration-500">
          <div className="mx-auto w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">Thank You!</h2>
          <p className="text-muted-foreground text-lg mb-8">Your feedback is incredibly valuable to us and has been recorded successfully.</p>
          <button 
            onClick={() => navigate('/')} 
            className="w-full px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
                  onClick={() => setType(t.name)}
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
          </div>

          {showMechanicSelect && (
            <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
              <label className="block text-sm font-bold text-foreground ml-1">Select Mechanic (Optional)</label>
              <select
                value={mechanicId}
                onChange={(e) => setMechanicId(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-border/50 bg-background/50 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
              >
                <option value="">-- Choose a mechanic --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.businessName || m.name} - {m.area}</option>
                ))}
              </select>
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
            disabled={loading || !description}
            className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:shadow-none"
          >
            {loading ? (
              <span className="animate-pulse">Submitting...</span>
            ) : (
              <>
                Submit Feedback <Send className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
