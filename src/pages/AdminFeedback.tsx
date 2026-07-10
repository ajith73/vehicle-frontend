import { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare, Trash2, Filter, Search, ArrowUpDown, RefreshCw, ChevronDown } from 'lucide-react';
import { useFeedback } from '../hooks/useFeedback';
import * as api from '../api/feedback';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';

const ITEMS_PER_PAGE = 10;

export default function AdminFeedback() {
  const { feedback, loading, refetch } = useFeedback();
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'warning'|'info'|'success', onConfirm: () => void} | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
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
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Feedback?',
      message: 'This action cannot be undone. Are you sure you want to delete this feedback permanently?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteFeedback(id);
          toast.success('Feedback deleted');
          refetch();
        } catch (err) {
          toast.error('Error deleting feedback');
        }
      }
    });
  };

  let filteredFeedback = feedback.filter(item => {
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const currentStatus = (item.status === 'New' || !item.status) ? 'Pending' : item.status;
    const matchesStatus = statusFilter === 'All' || currentStatus === statusFilter;
    return matchesType && matchesStatus;
  });

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredFeedback = filteredFeedback.filter(item => 
      item.description?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.id.toString().includes(q)
    );
  }

  filteredFeedback.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleBulkAction = async (action: 'delete' | string) => {
    if (selectedIds.length === 0) return;
    
    if (action === 'delete') {
      setConfirmConfig({
        isOpen: true,
        title: 'Delete Feedback?',
        message: `Are you sure you want to delete ${selectedIds.length} item(s)?`,
        type: 'danger',
        onConfirm: async () => {
          try {
            await Promise.all(selectedIds.map(id => api.deleteFeedback(id)));
            toast.success(`Successfully deleted ${selectedIds.length} item(s)`);
            setSelectedIds([]);
            refetch();
          } catch (err) {
            toast.error('Error during bulk delete');
          }
        }
      });
    } else {
      // It's a status update
      setConfirmConfig({
        isOpen: true,
        title: 'Update Status?',
        message: `Are you sure you want to update ${selectedIds.length} item(s) to "${action}"?`,
        type: 'info',
        onConfirm: async () => {
          try {
            await Promise.all(selectedIds.map(id => api.updateFeedbackStatus(id, action)));
            toast.success(`Successfully updated ${selectedIds.length} item(s)`);
            setSelectedIds([]);
            setBulkStatusOpen(false);
            refetch();
          } catch (err) {
            toast.error('Error during bulk update');
          }
        }
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFeedback.length && filteredFeedback.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFeedback.map(f => f.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 bg-muted/50 rounded-lg w-1/3 animate-pulse"></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-32 animate-pulse"></div>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-96 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="text-primary" /> User Feedback
        </h2>
        {selectedIds.length > 0 && role === 'Super Admin' && (
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 items-center">
            <div className="relative">
              <button 
                onClick={() => setBulkStatusOpen(!bulkStatusOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-sm"
              >
                Update Status ({selectedIds.length}) <ChevronDown size={16} />
              </button>
              {bulkStatusOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {['Pending', 'In Progress', 'Updated', 'Not Need Update'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleBulkAction(status)}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => handleBulkAction('delete')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors shadow-sm"
            >
              <Trash2 size={18} /> Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        {/* Search, Sort, Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="p-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap"
            title="Toggle Sort Order"
          >
            <ArrowUpDown size={16} />
            <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
          </button>
          <button 
            onClick={() => refetch()}
            className="p-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground"
            title="Refresh Data"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Type Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Filter className="w-4 h-4 text-muted-foreground mt-1.5 shrink-0" />
          <span className="text-xs font-bold text-muted-foreground mt-1.5 shrink-0 mr-2">Type:</span>
          {['All', 'Bug Report', 'Suggestion', 'Other'].map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setCurrentPage(1); }}
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
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
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

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <div className="overflow-x-auto min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                {role === 'Super Admin' && (
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.length === filteredFeedback.length && filteredFeedback.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </th>
                )}
                <th className="p-4 font-medium w-1/4">Type & Date</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium w-48">Status</th>
                {role === 'Super Admin' && <th className="p-4 font-medium w-24">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedFeedback.length === 0 ? (
                <tr><td colSpan={role === 'Super Admin' ? 5 : 4} className="p-8 text-center text-muted-foreground">No feedback found matching your criteria.</td></tr>
              ) : (
                paginatedFeedback.map((item) => (
                  <tr key={item.id} className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(item.id) ? 'bg-primary/5' : ''}`}>
                    {role === 'Super Admin' && (
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </td>
                    )}
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
                        onClick={() => handleDelete(item.id)}
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredFeedback.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>

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
