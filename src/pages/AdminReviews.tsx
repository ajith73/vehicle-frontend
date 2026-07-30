import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Trash2, Shield, Calendar, User, Search, RefreshCw, Edit, Eye, EyeOff, X } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface Review {
  id: number;
  mechanicId: number;
  name: string;
  email: string;
  ratingTimeliness: number;
  ratingFairness: number;
  ratingRecommendation: number;
  isProblemFixed: boolean;
  comments: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  Mechanic: {
    mechanicName: string | null;
    businessName: string | null;
  };
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{title: string, message: string, action: () => void}>({ title: '', message: '', action: () => {} });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/admin/reviews');
      setReviews(data as Review[]);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await apiClient(`/admin/reviews/${id}`, {
        method: 'PUT',
        data: { status }
      });
      toast.success(status === 'Approved' ? 'Review is now visible (Unhidden)' : 'Review is now hidden');
      fetchReviews();
    } catch (error) {
      toast.error(`Failed to update review status`);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    try {
      await apiClient(`/admin/reviews/${editingReview.id}`, {
        method: 'PUT',
        data: {
          comments: editingReview.comments,
          ratingTimeliness: editingReview.ratingTimeliness,
          ratingFairness: editingReview.ratingFairness,
          ratingRecommendation: editingReview.ratingRecommendation,
          isProblemFixed: editingReview.isProblemFixed
        }
      });
      toast.success('Review updated successfully');
      setEditingReview(null);
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiClient(`/admin/reviews/${id}`, { method: 'DELETE' });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const confirmAction = (title: string, message: string, action: () => void) => {
    setDialogConfig({ title, message, action });
    setDialogOpen(true);
  };

  let filteredReviews = reviews.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.Mechanic.businessName || r.Mechanic.mechanicName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  filteredReviews.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Reviews</h1>
          <p className="text-sm text-muted-foreground mt-1">Moderate customer reviews for mechanics.</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search by user or mechanic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium outline-none focus:border-primary flex-1 sm:flex-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
          <button 
            onClick={fetchReviews}
            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors border border-border shrink-0"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-10 bg-secondary/30 rounded-xl border border-border/50">
          No reviews found.
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReviews.map((review) => {
            const avgRating = ((review.ratingTimeliness + review.ratingFairness + review.ratingRecommendation) / 3).toFixed(1);
            return (
              <div key={review.id} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{review.Mechanic.businessName || review.Mechanic.mechanicName || 'Unknown Mechanic'}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      review.status === 'Approved' ? 'bg-green-500/10 text-green-600' :
                      'bg-red-500/10 text-red-600'
                    }`}>
                      {review.status === 'Approved' ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><User size={14} /> {review.name} ({review.email})</div>
                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(review.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Overall</span>
                      <span className="font-bold flex items-center gap-1 text-yellow-500"><Star size={14} className="fill-yellow-500" /> {avgRating}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Problem Fixed?</span>
                      <span className="font-bold text-foreground">{review.isProblemFixed ? '✅ Yes' : '❌ No'}</span>
                    </div>
                  </div>

                  {review.comments && (
                    <div className="bg-secondary/30 p-3 rounded-lg border border-border/50 mt-2 text-sm italic">
                      "{review.comments}"
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => setEditingReview(review)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-lg text-sm font-bold transition-colors"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  {review.status !== 'Approved' ? (
                    <button 
                      onClick={() => handleUpdateStatus(review.id, 'Approved')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <Eye size={16} /> Unhide
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleUpdateStatus(review.id, 'Rejected')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      <EyeOff size={16} /> Hide
                    </button>
                  )}
                  <button 
                    onClick={() => confirmAction('Delete Review', 'Are you sure you want to permanently delete this review?', () => handleDelete(review.id))}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors mt-auto"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-lg flex flex-col animate-in fade-in zoom-in-95 max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-lg font-bold">Edit Review</h2>
              <button onClick={() => setEditingReview(null)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Timeliness Rating (1-5)</label>
                <input type="number" min="1" max="5" required value={editingReview.ratingTimeliness} onChange={e => setEditingReview({...editingReview, ratingTimeliness: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Fairness Rating (1-5)</label>
                <input type="number" min="1" max="5" required value={editingReview.ratingFairness} onChange={e => setEditingReview({...editingReview, ratingFairness: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Recommendation Rating (1-5)</label>
                <input type="number" min="1" max="5" required value={editingReview.ratingRecommendation} onChange={e => setEditingReview({...editingReview, ratingRecommendation: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-border rounded-lg bg-background" />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <input type="checkbox" checked={editingReview.isProblemFixed} onChange={e => setEditingReview({...editingReview, isProblemFixed: e.target.checked})} className="rounded text-primary focus:ring-primary" />
                  Was the problem fixed?
                </label>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1">Comments</label>
                <textarea rows={4} value={editingReview.comments || ''} onChange={e => setEditingReview({...editingReview, comments: e.target.value})} className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none" />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setEditingReview(null)} className="px-4 py-2 font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={() => {
          dialogConfig.action();
          setDialogOpen(false);
        }}
        title={dialogConfig.title}
        message={dialogConfig.message}
      />
    </div>
  );
}
