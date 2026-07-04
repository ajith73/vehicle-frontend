import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Eye, Edit3, X } from 'lucide-react';
import * as api from '../api/mechanics';
import type { UpdateRequest } from '../types';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';

const ITEMS_PER_PAGE = 10;

export default function AdminUpdateRequests() {
  const [requests, setRequests] = useState<UpdateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewUpdateData, setViewUpdateData] = useState<UpdateRequest | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'warning'|'info'|'success', onConfirm: () => void} | null>(null);
  const navigate = useNavigate();

  const filteredRequests = requests.filter(req => statusFilter === 'All' || req.status === statusFilter);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
    setConfirmConfig({
      isOpen: true,
      title: action === 'approve' ? 'Approve Update?' : 'Reject Update?',
      message: `Are you sure you want to ${action} this request?`,
      type: action === 'approve' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          if (action === 'approve') {
            await api.approveUpdateRequest(id);
          } else {
            await api.rejectUpdateRequest(id);
          }
          toast.success(`Successfully ${action}d request`);
          fetchRequests();
        } catch (err) {
          toast.error('Error communicating with server');
        }
      }
    });
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: action === 'approve' ? 'Approve Updates?' : 'Reject Updates?',
      message: `Are you sure you want to ${action} ${selectedIds.length} request(s)?`,
      type: action === 'approve' ? 'success' : 'danger',
      onConfirm: async () => {
        try {
          if (action === 'approve') {
            await Promise.all(selectedIds.map(id => api.approveUpdateRequest(id)));
          } else {
            await Promise.all(selectedIds.map(id => api.rejectUpdateRequest(id)));
          }
          toast.success(`Successfully ${action}d ${selectedIds.length} request(s)`);
          setSelectedIds([]);
          fetchRequests();
        } catch (err) {
          toast.error('Error during bulk action');
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRequests.length && filteredRequests.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRequests.map(r => r.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground">Mechanic Update Requests</h2>
        {selectedIds.length > 0 && (
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkAction('approve')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm"
            >
              <CheckCircle size={18} /> Approve Selected ({selectedIds.length})
            </button>
            <button 
              onClick={() => handleBulkAction('reject')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors shadow-sm"
            >
              <XCircle size={18} /> Reject Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {['All', 'Pending Update Approval', 'Approved', 'Rejected'].map((status) => (
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
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium">Mechanic</th>
                <th className="p-4 font-medium">Requested By</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedRequests.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No update requests found</td></tr>
              ) : (
                paginatedRequests.map((req) => (
                  <tr key={req.id} className={`hover:bg-muted/50 transition-colors ${selectedIds.includes(req.id) ? 'bg-primary/5' : ''}`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(req.id)}
                        onChange={() => toggleSelect(req.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </td>
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredRequests.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
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
                                {Array.isArray(value) 
                                  ? value.map((v: any) => typeof v === 'object' ? (v.number ? `${v.number}${v.isWhatsapp ? ' (WhatsApp)' : ''}` : JSON.stringify(v)) : String(v)).join(', ') 
                                  : typeof value === 'object' ? JSON.stringify(value) : String(value)}
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

      <ConfirmDialog 
        isOpen={!!confirmConfig?.isOpen}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
        type={confirmConfig?.type || 'warning'}
        onConfirm={() => {
          if (confirmConfig?.onConfirm) confirmConfig.onConfirm();
        }}
        onCancel={() => setConfirmConfig(null)}
      />

      {/* Global Style for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
