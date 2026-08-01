import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle, Eye, RefreshCw, Save } from 'lucide-react';
import * as api from '../../api/mechanics';
import type { Mechanic } from '../../types';

interface MechanicVerificationPanelProps {
  mechanic: Mechanic;
  onUpdate: () => void;
}

const MechanicVerificationPanel: React.FC<MechanicVerificationPanelProps> = ({ mechanic, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<any>(
    typeof mechanic.verificationChecklist === 'string' 
      ? JSON.parse(mechanic.verificationChecklist || '{}') 
      : mechanic.verificationChecklist || {}
  );

  const toggleItem = (key: string) => {
    setChecklist((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const items = ['phone', 'location', 'shopPhotos', 'identity', 'services'];
      const completedCount = items.filter(k => checklist[k]).length;
      let level = completedCount; 
      if (completedCount === 5) level = 6; // All completed = Level 6 (Premium)

      await api.updateVerification(mechanic.id!, level, checklist);
      toast.success(`Verification Level updated to ${level}`);
      onUpdate();
    } catch (err) {
      toast.error('Failed to update verification');
    } finally {
      setLoading(false);
    }
  };

  const items = [
    { key: 'phone', label: 'Phone & Business Name Verified' },
    { key: 'location', label: 'Location & GPS Verified' },
    { key: 'shopPhotos', label: 'Shop Photos Verified', link: mechanic.shopPhotosLink },
    { key: 'identity', label: 'Owner Identity Verified', link: mechanic.ownerIdentityLink },
    { key: 'services', label: 'Services & Price List Verified', link: mechanic.priceListLink },
  ];

  const completedCount = items.filter(i => checklist[i.key]).length;
  const progressPercent = (completedCount / items.length) * 100;

  return (
    <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-4 mt-6">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <h4 className="font-bold text-lg flex items-center gap-2"><CheckCircle size={18} className="text-primary"/> Verification Status</h4>
        <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded">Level {mechanic.verificationLevel || 0}</span>
      </div>
      
      {/* Progressive Bar */}
      <div className="w-full bg-secondary rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <p className="text-xs text-muted-foreground text-right">{completedCount} of {items.length} completed</p>

      <div className="space-y-3 mt-4">
        {items.map(item => (
          <div key={item.key} className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-primary rounded cursor-pointer"
                checked={!!checklist[item.key]}
                onChange={() => toggleItem(item.key)}
              />
              <span className={`text-sm font-medium ${checklist[item.key] ? 'text-foreground' : 'text-muted-foreground'}`}>{item.label}</span>
            </label>
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                <Eye size={12}/> View Doc
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button 
          onClick={handleSave} 
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          Save Verification
        </button>
      </div>
    </div>
  );
};

export default MechanicVerificationPanel;
