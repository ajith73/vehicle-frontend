import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, CreditCard, HeartHandshake, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL, apiClient } from '../api/apiClient';

const SUGGESTED_AMOUNTS = [100, 200, 500, 1000];

export default function DonationPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  const handleInitiateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConsentOpen(true);
  };

  const handlePayment = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Processing mock payment...');
    try {
      await apiClient('/public/donation', {
        method: 'POST',
        data: { 
          amount: parseFloat(amount), 
          name,
          paymentReference: 'DUMMY_REF_' + Date.now() // Mock reference
        }
      });
      setIsConsentOpen(false);
      toast.success('Donation successful!', { id: loadingToast });
      setSuccess(true);
    } catch (err) {
      toast.error('Network error processing donation.', { id: loadingToast });
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-4 sm:p-8 pb-[80px] sm:pb-8 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-500/10 via-background to-background -z-10" />
        <div className="max-w-md w-full bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-12 border border-white/10 dark:border-white/5 text-center transform animate-in zoom-in duration-500">
          <div className="mx-auto w-24 h-24 bg-pink-500/20 text-pink-500 rounded-full flex items-center justify-center mb-6">
            <HeartHandshake className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">Thank You!</h2>
          <p className="text-muted-foreground text-lg mb-8">Your generous support helps us keep this platform running and free for everyone.</p>
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
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-73px)] p-4 sm:p-8 pb-[80px] sm:pb-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <div className="max-w-xl w-full bg-card/60 backdrop-blur-xl shadow-2xl rounded-3xl p-6 sm:p-10 border border-white/10 dark:border-white/5">
        <div className="text-center mb-10">
          <div className="mx-auto w-16 h-16 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center mb-6 transform -rotate-6">
            <Heart className="w-8 h-8 fill-pink-500" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">Support Our Mission</h2>
          <p className="text-muted-foreground text-lg">Your donation helps us keep this service free for stranded vehicle owners.</p>
        </div>

        <form onSubmit={handleInitiateDonation} className="flex flex-col gap-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-foreground ml-1">Select Amount (INR)</label>
            <div className="flex flex-wrap gap-3">
              {SUGGESTED_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all duration-300 ${
                    amount === amt.toString()
                      ? 'border-primary bg-primary/10 text-primary shadow-md'
                      : 'border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground bg-background/50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-4 pl-8 rounded-2xl border-2 border-border/50 bg-background/50 text-foreground text-lg font-bold focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                placeholder="Other Amount"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-foreground ml-1">Your Name (Optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-2xl border-2 border-border/50 bg-background/50 text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              placeholder="How should we thank you?"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:shadow-none"
          >
            {loading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                Donate ₹{amount || '0'} <ArrowRight className="w-5 h-5 ml-1" />
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-2">
            <CreditCard className="w-4 h-4" /> Secure mock UPI payment processing
          </div>
        </form>
      </div>
    </div>
      
      {/* Consent Modal */}
      {isConsentOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-[24px] shadow-2xl border border-border overflow-hidden flex flex-col p-6 sm:p-8">
            <h3 className="text-2xl font-black text-foreground mb-4">Confirm Donation</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              By proceeding, you agree that this donation is voluntary and non-refundable. Your support helps us maintain the platform and keep it free for stranded drivers. No goods or services are provided in exchange for this contribution.
            </p>
            
            <label className="flex items-start gap-3 cursor-pointer mb-8">
              <input 
                type="checkbox" 
                className="mt-1 min-w-[20px] w-5 h-5 rounded-md border-2 border-border/50 text-primary focus:ring-primary/50 accent-primary" 
                checked={hasConsented}
                onChange={(e) => setHasConsented(e.target.checked)}
              />
              <span className="text-sm font-medium text-foreground">I understand and consent to make this voluntary donation.</span>
            </label>
            
            <div className="flex gap-3 mt-auto">
              <button 
                onClick={() => setIsConsentOpen(false)}
                className="flex-1 py-3.5 rounded-xl border-2 border-border/50 bg-transparent text-foreground font-bold hover:bg-secondary/50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePayment}
                disabled={!hasConsented || loading}
                className="flex-[2] py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 disabled:shadow-none"
              >
                {loading ? 'Processing...' : `Proceed to Pay ₹${amount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
