import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Eye, Edit3, X } from 'lucide-react';
import * as api from '../api/mechanics';
import type { UpdateRequest } from '../types';

export default function AdminUpdateRequests() {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewUpdateData, setViewUpdateData] = useState<UpdateRequest | null>(null);
  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUpdateRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch update requests', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;
    try {
      if (action === 'approve') {
        await api.approveUpdateRequest(id);
      } else {
        await api.rejectUpdateRequest(id);
      }
      toast(`Successfully ${action}d request`);
      fetchRequests();
    } catch (err) {
      toast.error('Error communicating with server');
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Mechanic Update Requests</h2>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="p-4 font-medium">Mechanic</th>
                <th className="p-4 font-medium">Requested By</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No update requests found</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-foreground">{req.Mechanic?.name}</p>
                      <p className="text-xs text-muted-foreground">ID: {req.mechanicId}</p>
                    </td>
                    <td className="p-4 text-foreground">{req.Requestor?.username || 'Unknown'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${req.status === 'Approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}
                      `}>
                        {req.status === 'Pending Update Approval' && <AlertCircle size={14} />}
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewUpdateData(req)}
                          className="p-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                          title="View Proposed Changes"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/mechanics/${req.mechanicId}/edit`)}
                          className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                          title="Edit Mechanic Directly"
                        >
                          <Edit3 size={16} />
                        </button>
                        
                        {req.status === 'Pending Update Approval' && (
                          <>
                            <button 
                              onClick={() => handleAction(req.id, 'approve')}
                              className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                              title="Approve Update"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, 'reject')}
                              className="p-2 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                              title="Reject Update"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Update Modal */}
      {viewUpdateData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar">
            <div className="sticky top-0 bg-card/80 backdrop-blur border-b border-border p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="text-primary" /> Proposed Changes
              </h2>
              <button 
                onClick={() => setViewUpdateData(null)}
                className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-bold text-muted-foreground">Target Mechanic: <span className="text-foreground">{viewUpdateData.Mechanic?.name}</span> (ID: {viewUpdateData.mechanicId})</p>
                <p className="text-sm font-bold text-muted-foreground">Requested By: <span className="text-foreground">{viewUpdateData.Requestor?.username}</span></p>
              </div>
              <div className="bg-muted p-4 rounded-xl border border-border">
                <div className="text-sm">
                  {(() => {
                    try {
                      // If it's a stringified JSON string (SQLite default), parse it first
                      const data = typeof viewUpdateData.updatedData === 'string' 
                        ? JSON.parse(viewUpdateData.updatedData) 
                        : viewUpdateData.updatedData;
                      
                      if (!data || typeof data !== 'object') return <p>{String(data)}</p>;
                      
                      return (
                        <div className="space-y-3">
                          {Object.entries(data).map(([key, value]) => (
                            <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 border-b border-border/50 pb-2 last:border-0">
                              <span className="font-bold text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <span className="sm:col-span-2 text-foreground font-medium">
                                {Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (e) {
                      return <p className="text-red-500">Error parsing data.</p>;
                    }
                  })()}
                </div>
              </div>
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
