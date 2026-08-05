import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import type { Mechanic } from '../types';

import { useMechanicSearch } from '../hooks/useMechanicSearch';
import MechanicSearch from '../components/verify/MechanicSearch';
import ClaimMechanicFlow from '../components/verify/ClaimMechanicFlow';
import DirectLoginFlow from '../components/verify/DirectLoginFlow';
import { SEO } from '../components/SEO';

export default function VerifyStartPage() {
  const navigate = useNavigate();
  
  const {
    query,
    setQuery,
    suggestions,
    loadingSuggestions
  } = useMechanicSearch();

  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [showDirectLogin, setShowDirectLogin] = useState(false);

  const handleSelectMechanic = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setQuery('');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SEO
        title="Verify Your Business | RoadResQ"
        description="Mechanics and service providers can verify or claim their RoadResQ business profile to manage their listing securely."
        url="https://roadresq.in/verify-start"
        keywords="verify mechanic profile, claim RoadResQ business, mechanic verification"
        noindex
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} /> Back to Home
        </button>
        
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm mb-6">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black text-foreground mb-3">Verify Your Business</h1>
            {!selectedMechanic ? (
              <p className="text-muted-foreground max-w-lg mx-auto">
                Get the Verified Shield to build trust with customers. Search for your existing business below to start the verification process.
              </p>
            ) : (
              <p className="text-muted-foreground max-w-lg mx-auto">
                Claim your business profile by verifying your email and setting up a secure password.
              </p>
            )}
          </div>

          {!selectedMechanic && !showDirectLogin ? (
            <MechanicSearch
              query={query}
              setQuery={setQuery}
              suggestions={suggestions}
              loadingSuggestions={loadingSuggestions}
              onSelectMechanic={handleSelectMechanic}
              setShowDirectLogin={setShowDirectLogin}
            />
          ) : showDirectLogin ? (
            <DirectLoginFlow onClose={() => setShowDirectLogin(false)} />
          ) : (
            <ClaimMechanicFlow
              selectedMechanic={selectedMechanic}
              setSelectedMechanic={setSelectedMechanic}
            />
          )}
        </div>
      </div>
    </div>
  );
}
