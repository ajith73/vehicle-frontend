import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Eye, Edit3, X, Search, ArrowUpDown, RefreshCw, Trash2, UserCircle, Phone, MapPin, Settings, Clock, Globe, Image as ImageIcon } from 'lucide-react';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  
  let filteredRequests = requests.filter(req => statusFilter === 'All' || req.status === statusFilter);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filteredRequests = filteredRequests.filter(req => 
      req.Mechanic?.name?.toLowerCase().includes(q) ||
      getRequestTitle(req).toLowerCase().includes(q) ||
      (req.mechanicId ? req.mechanicId.toString().includes(q) : false) ||
      req.requesterDisplayName?.toLowerCase().includes(q) ||
      req.Requestor?.username?.toLowerCase().includes(q) ||
      req.id.toString().includes(q)
    );
  }

  filteredRequests.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

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

  const handleDelete = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Request',
      message: 'Are you sure you want to permanently delete this update request?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteUpdateRequest(id);
          toast.success('Update request deleted successfully');
          fetchRequests();
        } catch (err) {
          toast.error('Failed to delete request');
        }
      }
    });
  };

  const parseUpdatedData = (updatedData: UpdateRequest['updatedData']) => {
    if (typeof updatedData === 'string') {
      return JSON.parse(updatedData);
    }

    return updatedData;
  };

  const getRequestTitle = (req: UpdateRequest) => {
    const data = parseUpdatedData(req.updatedData) as any;
    return data?.businessName || data?.name || req.Mechanic?.name || 'New mechanic request';
  };

  const isNewMechanicRequest = (req: UpdateRequest) => !req.mechanicId;

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value
        .map((item: any) =>
          typeof item === 'object'
            ? (item.number
                ? `${item.number}${item.isWhatsapp ? ' (WhatsApp)' : ''}${item.isTelephone ? ' (Tel)' : ''}`
                : JSON.stringify(item))
            : String(item)
        )
        .join(', ');
    }

    if (typeof value === 'object' && value !== null) return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  };

  const formatPhoneEntry = (phone: any) => {
    if (!phone) return '—';
    if (typeof phone === 'string') return phone;

    const parts = [phone.number || '—'];
    if (phone.isWhatsapp) parts.push('WhatsApp');
    if (phone.isTelephone) parts.push('Tel');
    return parts.join(' • ');
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 bg-muted/50 rounded-lg w-1/3 animate-pulse"></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-14 animate-pulse"></div>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm h-96 animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-start xl:justify-between">
        <h2 className="text-3xl font-bold text-foreground">Mechanic Update Requests</h2>
        {selectedIds.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:w-auto">
            <button 
              onClick={() => handleBulkAction('approve')}
              className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors shadow-sm"
            >
              <CheckCircle size={18} /> Approve Selected ({selectedIds.length})
            </button>
            <button 
              onClick={() => handleBulkAction('reject')}
              className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors shadow-sm"
            >
              <XCircle size={18} /> Reject Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 pb-1">
            {['All', 'Pending Update Approval', 'Approved', 'Rejected'].map((status) => (
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] xl:w-auto xl:min-w-[380px]">
            <div className="relative w-full min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button 
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              className="flex items-center justify-center gap-1 px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground text-sm whitespace-nowrap"
              title="Toggle Sort Order"
            >
              <ArrowUpDown size={16} />
              <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            </button>
            <button 
              onClick={fetchRequests}
              className="flex items-center justify-center px-3 py-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
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
                      <p className="font-bold text-foreground">{getRequestTitle(req)}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.mechanicId ? `Mechanic ID: ${req.mechanicId}` : 'New mechanic listing request'}
                      </p>
                    </td>
                    <td className="p-4 text-foreground">{req.requesterDisplayName || req.Requestor?.username || 'Public User'}</td>
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
                        {req.mechanicId && (
                          <button 
                            onClick={() => navigate(`/admin/mechanics/${req.mechanicId}/edit`)}
                            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            title="Edit Mechanic Directly"
                          >
                            <Edit3 size={16} />
                          </button>
                        )}
                        
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
                        {req.status === 'Rejected' && (
                          <button 
                            onClick={() => handleDelete(req.id)}
                            className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                            title="Delete Rejected Request"
                          >
                            <Trash2 size={16} />
                          </button>
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
          <div className="bg-card w-full h-full sm:h-auto sm:max-h-[90vh] max-w-4xl overflow-y-auto sm:rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar flex flex-col">
            <div className="sticky top-0 bg-card/90 backdrop-blur border-b border-border p-4 sm:p-6 flex justify-between items-center z-10">
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
            <div className="p-4 sm:p-6 space-y-8 flex-1">
              {(() => {
                try {
                  const data = parseUpdatedData(viewUpdateData.updatedData);

                  if (!data || typeof data !== 'object') {
                    return (
                      <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm text-foreground">
                        {String(data)}
                      </div>
                    );
                  }

                  const sections: Record<string, string[]> = {
                    'Basic Info': ['mechanicType', 'name', 'businessName', 'mechanicName', 'description', 'image', 'websiteUrl', 'availability'],
                    Contact: ['phone', 'emails'],
                    Location: ['address', 'landmark', 'pincode', 'area', 'city', 'state', 'latitude', 'longitude'],
                    'Services & Operations': ['serviceRadius', 'evSupport', 'homeService', 'roadsideAssistance', 'is24Hours', 'holidayWorking', 'vehicleTypes', 'serviceTypes', 'operatingDays', 'operatingHours']
                  };

                  return (
                    <>
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {data.image && (
                          <img
                            src={data.image}
                            alt={data.businessName || data.name || 'Mechanic'}
                            className="w-full md:w-48 h-48 object-cover rounded-xl border border-border shadow-sm shrink-0"
                          />
                        )}
                        {!data.image && (
                          <div className="w-full md:w-48 h-48 rounded-xl border border-border bg-muted/20 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                          </div>
                        )}

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-2xl font-bold text-foreground">{data.businessName || data.name || viewUpdateData.Mechanic?.name || 'Mechanic Update'}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              viewUpdateData.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              viewUpdateData.status === 'Pending Update Approval' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {viewUpdateData.status}
                            </span>
                          </div>
                          {data.mechanicName && (
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                              <UserCircle size={16} /> Owner: {data.mechanicName}
                            </p>
                          )}
                          <p className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
                            {data.mechanicType || 'Mechanic Update'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Target Mechanic: <span className="font-semibold text-foreground">
                              {isNewMechanicRequest(viewUpdateData) ? 'New listing request' : (viewUpdateData.Mechanic?.name || 'Existing mechanic')}
                            </span>
                            {viewUpdateData.mechanicId ? ` (ID: ${viewUpdateData.mechanicId})` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">Requested By: <span className="font-semibold text-foreground">{viewUpdateData.requesterDisplayName || viewUpdateData.Requestor?.username || 'Public User'}</span></p>
                          <p className="text-muted-foreground mt-2">{data.description || 'No description provided.'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-6">
                          <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Phone size={18} className="text-primary" /> Contact & Web</h4>
                          <div className="space-y-3 text-sm text-muted-foreground">
                            {data.phone?.length > 0 ? data.phone.map((phone: any, index: number) => (
                              <p key={index}>
                                <span className="font-medium text-foreground">{phone.isTelephone ? 'Tel:' : 'Phone:'}</span> {formatPhoneEntry(phone)}
                              </p>
                            )) : <p>No phone details provided.</p>}
                            {data.emails?.length > 0 && data.emails.map((email: string, index: number) => (
                              <p key={index}><span className="font-medium text-foreground">Email:</span> {email}</p>
                            ))}
                            {data.websiteUrl && (
                              <a href={data.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                                <Globe size={14} /> Visit Website
                              </a>
                            )}
                          </div>

                          <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><MapPin size={18} className="text-primary" /> Location</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="leading-relaxed">
                              {formatValue(data.address)}<br />
                              {data.landmark ? <>Landmark: {data.landmark}<br /></> : null}
                              {data.pincode ? `Pincode: ${data.pincode}` : (data.area ? `Area: ${data.area}` : 'Area: —')}<br />
                              {formatValue(data.city)}, {formatValue(data.state)}
                            </p>
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded inline-block">
                                Lat: {formatValue(data.latitude)} | Lng: {formatValue(data.longitude)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-6">
                          <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Settings size={18} className="text-primary" /> Services & Features</h4>
                          <div className="space-y-4">
                            <div>
                              <p className="font-semibold text-sm mb-2">Supported Vehicles</p>
                              <div className="flex flex-wrap gap-1.5">
                                {data.vehicleTypes?.length > 0
                                  ? data.vehicleTypes.map((vehicle: string) => (
                                      <span key={vehicle} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">{vehicle}</span>
                                    ))
                                  : <span className="text-muted-foreground text-xs">N/A</span>}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm mb-2">Services Provided</p>
                              <div className="flex flex-wrap gap-1.5">
                                {data.serviceTypes?.length > 0
                                  ? data.serviceTypes.map((service: string) => (
                                      <span key={service} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">{service}</span>
                                    ))
                                  : <span className="text-muted-foreground text-xs">N/A</span>}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm mb-2">Special Features</p>
                              <div className="flex flex-wrap gap-2">
                                {data.evSupport && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">EV Support</span>}
                                {data.homeService && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">Home Service</span>}
                                {data.roadsideAssistance && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Roadside Assistance</span>}
                                {!data.evSupport && !data.homeService && !data.roadsideAssistance && (
                                  <span className="text-muted-foreground text-xs">No special features listed.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Clock size={18} className="text-primary" /> Operating Hours</h4>
                          <div className="space-y-3 text-sm">
                            <p>
                              <span className="font-semibold block mb-1">Working Days:</span>
                              <span className="text-muted-foreground">{data.operatingDays?.join(', ') || 'N/A'}</span>
                            </p>
                            <p>
                              <span className="font-semibold block mb-1">Timings:</span>
                              <span className="text-muted-foreground">{formatValue(data.operatingHours)}</span>
                            </p>
                            <p>
                              <span className="font-semibold block mb-1">Coverage Radius:</span>
                              <span className="text-muted-foreground">{data.serviceRadius ? `${data.serviceRadius} km` : 'Not specified'}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                    </>
                  );
                } catch (error) {
                  return <p className="text-red-500">Error parsing data.</p>;
                }
              })()}
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
