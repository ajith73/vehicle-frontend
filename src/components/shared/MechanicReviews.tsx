import React, { useState, useEffect } from 'react';
import { StarRating } from '../StarRating';
import { getVisitorId, generateFingerprint } from '../../utils/fingerprint';
import { toast } from 'react-hot-toast';


import { apiClient } from '../../api/apiClient';

interface Review {
  id: number;
  name: string;
  ratingTimeliness: number;
  ratingFairness: number;
  ratingRecommendation: number;
  isProblemFixed: boolean;
  comments: string;
  createdAt: string;
}

interface MechanicReviewsProps {
  mechanicId: number;
}

export const MechanicReviews: React.FC<MechanicReviewsProps> = ({ mechanicId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    ratingTimeliness: 0,
    ratingFairness: 0,
    ratingRecommendation: 0,
    isProblemFixed: true,
    comments: ''
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiClient<Review[]>(`/public/mechanics/${mechanicId}/reviews`);
      setReviews(data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [mechanicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.ratingTimeliness === 0 || formData.ratingFairness === 0 || formData.ratingRecommendation === 0) {
      toast.error('Please provide ratings for all questions');
      return;
    }
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading('Submitting review...');

    try {
      const visitorId = getVisitorId();
      const fingerprint = generateFingerprint();

      await apiClient(`/public/mechanics/${mechanicId}/reviews`, {
        method: 'POST',
        data: {
          ...formData,
          visitorId,
          fingerprint
        }
      });

      toast.success('Review submitted successfully!', { id: loadingToast });
      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        ratingTimeliness: 0,
        ratingFairness: 0,
        ratingRecommendation: 0,
        isProblemFixed: true,
        comments: ''
      });
      fetchReviews();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const overallRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.ratingTimeliness + r.ratingFairness + r.ratingRecommendation) / 3, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="mt-6 border-t border-border/50 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Customer Reviews</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-lg">
            <span className="font-bold text-lg">{overallRating}</span>
            <StarRating rating={Math.round(Number(overallRating))} readOnly size="sm" />
            <span className="text-xs font-medium">({reviews.length})</span>
          </div>
        )}
      </div>

      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold py-3 px-4 rounded-xl transition-colors mb-6"
        >
          Write a Review
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-secondary/30 p-5 rounded-2xl border border-border/50 mb-6 space-y-4">
          <h4 className="font-bold text-foreground mb-2">Share your experience</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Your Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="John Doe" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="john@example.com" 
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium">Did the mechanic arrive on time?</span>
              <StarRating rating={formData.ratingTimeliness} onRatingChange={val => setFormData(prev => ({ ...prev, ratingTimeliness: val }))} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium">Did they charge fairly?</span>
              <StarRating rating={formData.ratingFairness} onRatingChange={val => setFormData(prev => ({ ...prev, ratingFairness: val }))} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm font-medium">Would you recommend them?</span>
              <StarRating rating={formData.ratingRecommendation} onRatingChange={val => setFormData(prev => ({ ...prev, ratingRecommendation: val }))} />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <span className="text-sm font-medium">Was the problem fixed?</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isProblemFixed: true }))} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${formData.isProblemFixed ? 'bg-green-500 text-white shadow-sm' : 'bg-background border border-border text-muted-foreground'}`}>Yes</button>
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, isProblemFixed: false }))} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${!formData.isProblemFixed ? 'bg-red-500 text-white shadow-sm' : 'bg-background border border-border text-muted-foreground'}`}>No</button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase mb-1">Comments (Optional)</label>
            <textarea 
              value={formData.comments}
              onChange={e => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={3} 
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" 
              placeholder="Tell us more about your experience..." 
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-background border border-border hover:bg-secondary text-foreground font-semibold py-2.5 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-6">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-6 bg-secondary/20 rounded-xl border border-border/30">
          No reviews yet. Be the first to review this mechanic!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => {
            const avgRating = Math.round((review.ratingTimeliness + review.ratingFairness + review.ratingRecommendation) / 3);
            return (
              <div key={review.id} className="bg-background border border-border/50 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h5 className="font-bold text-foreground">{review.name}</h5>
                    <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StarRating rating={avgRating} readOnly size="sm" />
                    {review.isProblemFixed ? (
                      <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">Fixed</span>
                    ) : (
                      <span className="text-[10px] font-bold text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">Not Fixed</span>
                    )}
                  </div>
                </div>
                {review.comments && (
                  <p className="text-sm text-muted-foreground mt-3 italic">"{review.comments}"</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
