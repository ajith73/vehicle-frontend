import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/apiClient';

const FEEDBACK_OPTIONS = [
  'Name incorrect',
  'Mobile number not working',
  'Address wrong',
  'Services inaccurate',
  'Permanently closed'
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMechanic: any;
}

export function FeedbackModal({ isOpen, onClose, selectedMechanic }: FeedbackModalProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleFeedbackOption = (option: string) => {
    setSelectedFeedback(prev => 
      prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
    );
  };

  const handleFeedbackSubmit = async () => {
    try {
      const type = 'Mechanic Data Issue';
      const description = `Mechanic ID: ${selectedMechanic?.id}\nBusiness: ${selectedMechanic?.businessName || selectedMechanic?.name}\nIssues: ${selectedFeedback.join(', ')}\nAdditional Details: ${feedbackText}`;
      
      await apiClient('/public/feedback', { method: 'POST', data: { type, description } });
      
      onClose();
      setSelectedFeedback([]);
      setFeedbackText('');
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-[24px] shadow-2xl border border-border overflow-hidden flex flex-col">
        <div className="p-5 border-b border-border/50 flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="font-bold text-lg text-foreground">Report an Issue</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Help us improve the data for this mechanic.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary/80 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto max-h-[60vh]">
          <label className="block text-sm font-bold text-foreground mb-2">What is wrong?</label>
          <div className="flex flex-wrap gap-2 mb-5">
            {FEEDBACK_OPTIONS.map(option => (
              <button
                key={option}
                onClick={() => toggleFeedbackOption(option)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${
                  selectedFeedback.includes(option) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary/50 text-secondary-foreground border-border hover:bg-secondary'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          
          <label className="block text-sm font-bold text-foreground mb-2">Additional Details (Optional)</label>
          <textarea
            value={feedbackText}
            onChange={e => setFeedbackText(e.target.value)}
            placeholder="Tell us more about the issue..."
            className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
          />
        </div>
        
        <div className="p-4 border-t border-border/50 bg-muted/10">
          <button 
            onClick={handleFeedbackSubmit}
            disabled={selectedFeedback.length === 0 && feedbackText.trim() === ''}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
