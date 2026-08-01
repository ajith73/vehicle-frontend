import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Mechanic } from '../../types';

interface MechanicSearchProps {
  query: string;
  setQuery: (val: string) => void;
  suggestions: Mechanic[];
  loadingSuggestions: boolean;
  onSelectMechanic: (mechanic: Mechanic) => void;
  setShowDirectLogin: (show: boolean) => void;
}

const MechanicSearch: React.FC<MechanicSearchProps> = ({
  query,
  setQuery,
  suggestions,
  loadingSuggestions,
  onSelectMechanic,
  setShowDirectLogin
}) => {
  const navigate = useNavigate();

  return (
    <div className="relative max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by business name or phone number..." 
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-border bg-background shadow-inner focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-base sm:text-lg"
          />
        </div>
        <div className="text-muted-foreground font-medium text-sm">or</div>
        <button 
          onClick={() => setShowDirectLogin(true)}
          className="w-full sm:w-auto px-6 py-4 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl transition-colors whitespace-nowrap"
        >
          Login
        </button>
      </div>

      {query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10">
          {loadingSuggestions ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Searching records...</div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-[300px] overflow-y-auto">
              {suggestions.map((mechanic) => (
                <li key={mechanic.id} className="border-b border-border last:border-0">
                  <button 
                    onClick={() => onSelectMechanic(mechanic)}
                    className="w-full text-left px-4 py-3 hover:bg-secondary/50 transition-colors flex flex-col gap-1"
                  >
                    <span className="font-bold text-foreground">{mechanic.businessName || mechanic.name}</span>
                    <span className="text-xs text-muted-foreground">{mechanic.address}, {mechanic.city}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-4">No matching records found.</p>
              <button 
                onClick={() => navigate('/submit')}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Create New Record
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MechanicSearch;
