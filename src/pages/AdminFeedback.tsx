import { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Trash2, Filter } from 'lucide-react';
import { useFeedback } from '../hooks/useFeedback';
import * as api from '../api/feedback';

export default function AdminFeedback() {
  const { feedback, loading, refetch } = useFeedback();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const role = localStorage.getItem('role');

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.updateFeedbackStatus(id, newStatus);
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteFeedback(id);
      toast.success('Feedback deleted');
      setDeleteModalId(null);
      refetch();
    } catch (err) {
      toast.error('Error deleting feedback');
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const currentStatus = (item.status === 'New' || !item.status) ? 'Pending' : item.status;
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesType && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="text-primary" /> User Feedback
        </h2>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        {/* Type Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Filter className="w-4 h-4 text-muted-foreground mt-1.5 shrink-0" />
          <span className="text-xs font-bold text-muted-foreground mt-1.5 shrink-0 mr-2">Type:</span>
          {['All', 'Bug Report', 'Suggestion', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                typeFilter === type 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Status Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Filter className="w-4 h-4 text-muted-foreground mt-1.5 shrink-0" />
          <span className="text-xs font-bold text-muted-foreground mt-1.5 shrink-0 mr-2">Status:</span>
          {['All', 'Pending', 'In Progress', 'Updated', 'Not Need Update'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                statusFilter === status 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 font-medium w-1/4">Type & Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium w-48">Status</th>
                {role === 'Super Admin' && <th className="p-4 font-medium w-24">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFeedback.length === 0 ? (
                <tr><td colSpan={role === 'Super Admin' ? 4 : 3} className="p-8 text-center text-muted-foreground">No feedback found</td></tr>
              ) : (
                filteredFeedback.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{item.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 text-foreground whitespace-pre-wrap text-sm">{item.description}</td>
                    <td className="p-4">
                      <select
                        value={(item.status === 'New' || !item.status) ? 'Pending' : item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        className={`text-xs font-bold rounded-lg px-2 py-1.5 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                          item.status === 'Updated' ? 'bg-green-100 text-green-700 border-green-200' :
                          item.status === 'In Progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                          item.status === 'Not Need Update' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Updated">Updated</option>
                        <option value="Not Need Update">Not Need Update</option>
                      </select>
                    </td>
                    {role === 'Super Admin' && (
                      <td className="p-4">
                        <button 
                        onClick={() => setDeleteModalId(item.id)}
                        className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Delete Feedback"
                      >
                        <Trash2 size={16} />
                      </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Feedback?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this feedback permanently?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModalId(null)}
                className="flex-1 py-2.5 rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(deleteModalId)}
                className="flex-1 py-2.5 rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Style for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
