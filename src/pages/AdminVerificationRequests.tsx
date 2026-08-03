import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Search, ShieldCheck, Eye, X, FileText, Phone, MapPin, Settings, Globe, ImageIcon, UserCircle, RefreshCw, Trash2, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Mechanic } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useVerificationRequests } from '../hooks/useVerificationRequests';

interface VerificationRequestData {
  id: number;
  mechanicId: number;
  shopPhotosLink?: string;
  ownerIdentityLink?: string;
  submittedData: Record<string, string>;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
  createdAt: string;
  Mechanic?: Mechanic;
}

export default function AdminVerificationRequests() {
  const { requests, loading, refetch, updateRequestStatus, deleteRequest } = useVerificationRequests();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewModalData, setViewModalData] = useState<{ reqId: number, dataEntries: any[], proposedDetails: any, newUserId: any, mechanic?: Mechanic } | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'business-docs' | 'common-info' | 'services' | 'account'>('profile');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'warning' | 'danger' | 'info';
    requireInput?: boolean;
    inputPlaceholder?: string;
    action: (input?: string) => void;
  }>({ title: '', message: '', type: 'info', action: () => {} });

  const userRole = localStorage.getItem('role');

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

  const confirmAction = (
    title: string, 
    message: string, 
    action: (input?: string) => void, 
    type: 'success' | 'warning' | 'danger' | 'info' = 'warning',
    requireInput = false,
    inputPlaceholder = ''
  ) => {
    setDialogConfig({ title, message, action, type, requireInput, inputPlaceholder });
    setDialogOpen(true);
  };

  const handleApprove = async (id: number) => {
    const loadingToast = toast.loading('Approving request...');
    try {
      await updateRequestStatus(id, 'Approved');
      toast.success('Approved successfully', { id: loadingToast });
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve', { id: loadingToast });
    }
  };

  const handleReject = async (id: number, reason?: string) => {
    const loadingToast = toast.loading('Rejecting request...');
    try {
      await updateRequestStatus(id, 'Rejected', reason);
      toast.success('Rejected successfully', { id: loadingToast });
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject', { id: loadingToast });
    }
  };

  const handleDelete = async (id: number) => {
    const loadingToast = toast.loading('Deleting request...');
    try {
      await deleteRequest(id);
      toast.success('Deleted successfully', { id: loadingToast });
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete', { id: loadingToast });
    }
  };

  const handleBulkApprove = async () => {
    const loadingToast = toast.loading('Approving requests...');
    try {
      await Promise.all(selectedIds.map(id => updateRequestStatus(id, 'Approved')));
      toast.success('Approved successfully', { id: loadingToast });
    } catch (e) {
      toast.error('Failed to approve some requests', { id: loadingToast });
    }
  };

  const handleBulkReject = async (reason?: string) => {
    if (!reason) return;
    const loadingToast = toast.loading('Rejecting requests...');
    try {
      await Promise.all(selectedIds.map(id => updateRequestStatus(id, 'Rejected', reason)));
      toast.success('Rejected successfully', { id: loadingToast });
    } catch (e) {
      toast.error('Failed to reject some requests', { id: loadingToast });
    }
  };

  const handleBulkDelete = async () => {
    const loadingToast = toast.loading('Deleting requests...');
    try {
      await Promise.all(selectedIds.map(id => deleteRequest(id)));
      toast.success('Deleted successfully', { id: loadingToast });
    } catch (e) {
      toast.error('Failed to delete some requests', { id: loadingToast });
    }
  };

  let filteredRequests = requests.filter(req => {
    const s = search.toLowerCase();
    return (
      req.Mechanic?.businessName?.toLowerCase().includes(s) ||
      req.Mechanic?.name?.toLowerCase().includes(s) ||
      (req.Mechanic?.phone && JSON.stringify(req.Mechanic.phone).toLowerCase().includes(s))
    );
  });

  filteredRequests.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

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

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Verification Requests</h1>
          <p className="text-muted-foreground">Manage mechanic verification submissions.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-muted/20">
          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by mechanic name or phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium outline-none focus:border-primary shrink-0"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            <button 
              onClick={refetch}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-lg hover:bg-muted transition-colors font-medium"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
            </button>

            {selectedIds.length > 0 && userRole === 'Super Admin' && (
              <div className="flex items-center gap-2 ml-auto lg:ml-2 pl-2 lg:border-l border-border/50 overflow-x-auto">
                <span className="text-sm font-bold text-muted-foreground whitespace-nowrap hidden sm:inline-block">
                  {selectedIds.length} selected
                </span>
                <button 
                  onClick={() => confirmAction('Approve Selected', `Are you sure you want to approve ${selectedIds.length} request(s)?`, handleBulkApprove, 'success')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white text-sm font-medium transition-colors shrink-0"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button 
                  onClick={() => confirmAction('Reject Selected', `Enter reason for rejecting ${selectedIds.length} request(s):`, handleBulkReject, 'warning', true, 'Reason for rejection...')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white text-sm font-medium transition-colors shrink-0"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button 
                  onClick={() => confirmAction('Delete Selected', `Are you sure you want to completely DELETE ${selectedIds.length} request(s)? This cannot be undone.`, handleBulkDelete, 'danger')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 text-gray-600 rounded-lg hover:bg-gray-500 hover:text-white text-sm font-medium transition-colors shrink-0"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <th className="p-4 font-medium w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredRequests.length && filteredRequests.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Mechanic Info</th>
                <th className="p-4 font-medium">Submitted Documents & Info</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No verification requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => {
                  // Merge legacy fields if they exist
                  const submittedDataRaw = req.submittedData || {};
                  const dataEntries = Object.entries(submittedDataRaw).filter(([k]) => !k.startsWith('__'));
                  const proposedDetails = (submittedDataRaw as any).__mechanicDetails;
                  const newUserId = (submittedDataRaw as any).__userId;

                  if (req.shopPhotosLink && !dataEntries.some(([k]) => k.includes('Shop Photo'))) {
                    dataEntries.push(['Shop Photos (Legacy)', req.shopPhotosLink]);
                  }
                  if (req.ownerIdentityLink && !dataEntries.some(([k]) => k.includes('Identity'))) {
                    dataEntries.push(['Owner Identity (Legacy)', req.ownerIdentityLink]);
                  }

                  return (
                    <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 align-top">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(req.id)}
                          onChange={() => toggleSelect(req.id)}
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="p-4 text-muted-foreground align-top whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 align-top">
                        <div className="font-medium text-foreground">{req.Mechanic?.businessName || req.Mechanic?.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <ShieldCheck size={12} className={(req.Mechanic?.verificationLevel ?? 0) > 0 ? "text-blue-500" : "text-muted-foreground"} />
                          Lvl {req.Mechanic?.verificationLevel || 0} ({req.Mechanic?.mechanicType || 'Unknown'})
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">ID: {req.mechanicId}</div>
                      </td>
                      <td className="p-4 align-top">
                        <button 
                          onClick={() => {
                            setViewModalData({ reqId: req.id, dataEntries, proposedDetails, newUserId, mechanic: req.Mechanic });
                            setActiveModalTab('profile');
                          }}
                          className="flex items-center gap-2 text-primary hover:text-primary/80 bg-primary/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye size={16} /> View Data
                        </button>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {req.status === 'Approved' && <CheckCircle size={12} />}
                          {req.status === 'Rejected' && <XCircle size={12} />}
                          {req.status === 'Pending' && <Clock size={12} />}
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex justify-end gap-2 text-muted-foreground flex-nowrap">
                          {req.status === 'Pending' && userRole === 'Super Admin' && (
                            <>
                              <button 
                                onClick={() => confirmAction('Approve Request', 'Are you sure you want to approve this verification request?', () => handleApprove(req.id), 'success')}
                                className="p-2 hover:bg-green-500/10 hover:text-green-600 rounded-lg transition-colors text-green-500"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button 
                                onClick={() => confirmAction('Reject Request', 'Enter reason for rejection:', (input) => handleReject(req.id, input), 'warning', true, 'Reason for rejection...')}
                                className="p-2 hover:bg-orange-500/10 hover:text-orange-600 rounded-lg transition-colors text-orange-500"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {userRole === 'Super Admin' && (
                            <button 
                              onClick={() => confirmAction('Delete Request', 'Are you sure you want to completely delete this request? This cannot be undone.', () => handleDelete(req.id), 'danger')}
                              className="p-2 hover:bg-red-500/10 hover:text-red-600 rounded-lg transition-colors text-red-500"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Data Modal */}
      {viewModalData && (() => {
        const commonInfoKeys = ['Profile Photo Link', 'Location (GPS)', 'Emergency Contact', 'Languages Spoken'];
        const commonInfo = viewModalData.dataEntries.filter(([k]: any) => commonInfoKeys.includes(k));
        const servicesDataDocs = viewModalData.dataEntries.filter(([k]: any) => k.startsWith('Price -') || k.startsWith('Time -') || k === 'Specific Services' || k === 'Additional Service and Price' || k === 'Notes');
        const businessDocs = viewModalData.dataEntries.filter(([k, val]: any) => typeof val !== 'boolean' && !commonInfoKeys.includes(k) && !k.startsWith('Price -') && !k.startsWith('Time -') && k !== 'Specific Services' && k !== 'Additional Service and Price' && k !== 'Notes');
        const data = viewModalData.proposedDetails || {};

        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-4xl min-h-[60vh] max-h-[80vh] flex flex-col md:flex-row animate-in fade-in zoom-in-95 overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-muted/10 border-r border-border shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
              <div className="p-4 border-b border-border hidden md:block">
                <h2 className="text-lg font-bold">Request #{viewModalData.reqId}</h2>
              </div>
              <button
                onClick={() => setActiveModalTab('profile')}
                className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap md:whitespace-normal text-left ${
                  activeModalTab === 'profile'
                    ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground md:border-l-4 border-transparent'
                }`}
              >
                <Building size={18} /> Profile
              </button>
              <button
                onClick={() => setActiveModalTab('business-docs')}
                className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap md:whitespace-normal text-left ${
                  activeModalTab === 'business-docs'
                    ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground md:border-l-4 border-transparent'
                }`}
              >
                <FileText size={18} /> Business Docs
              </button>
              <button
                onClick={() => setActiveModalTab('common-info')}
                className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap md:whitespace-normal text-left ${
                  activeModalTab === 'common-info'
                    ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground md:border-l-4 border-transparent'
                }`}
              >
                <ImageIcon size={18} /> Common Info
              </button>
              <button
                onClick={() => setActiveModalTab('services')}
                className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap md:whitespace-normal text-left ${
                  activeModalTab === 'services'
                    ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground md:border-l-4 border-transparent'
                }`}
              >
                <Settings size={18} /> Services
              </button>
              {viewModalData.newUserId && (
                <button
                  onClick={() => setActiveModalTab('account')}
                  className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap md:whitespace-normal text-left ${
                    activeModalTab === 'account'
                      ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary' 
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground md:border-l-4 border-transparent'
                  }`}
                >
                  <ShieldCheck size={18} /> Account Info
                </button>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 max-h-[80vh]">
              <div className="flex justify-between items-center p-4 border-b border-border bg-card">
                <h2 className="text-lg font-bold md:hidden">Req #{viewModalData.reqId}</h2>
                <div className="hidden md:block">
                  <h3 className="font-bold text-foreground">
                    {activeModalTab === 'profile' ? 'Profile Details' : 
                     activeModalTab === 'business-docs' ? 'Business Documents' :
                     activeModalTab === 'common-info' ? 'Common Info' :
                     activeModalTab === 'services' ? 'Services & Operating Hours' :
                     'Account Info'}
                  </h3>
                </div>
                <button onClick={() => setViewModalData(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 text-sm bg-card">
                
                {activeModalTab === 'profile' && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {data.image && (
                          <img
                            src={data.image}
                            alt={data.businessName || data.name || 'Mechanic'}
                            className="w-full md:w-32 h-32 object-cover rounded-xl border border-border shadow-sm shrink-0"
                          />
                        )}
                        {!data.image && (
                          <div className="w-full md:w-32 h-32 rounded-xl border border-border bg-muted/20 flex items-center justify-center shrink-0">
                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                          </div>
                        )}

                        <div className="flex-1 space-y-2">
                          <h3 className="text-xl font-bold text-foreground">{data.businessName || data.name || 'Mechanic Update'}</h3>
                          {data.mechanicName && (
                            <p className="text-muted-foreground font-medium flex items-center gap-2">
                              <UserCircle size={16} /> Owner: {data.mechanicName}
                            </p>
                          )}
                          <p className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">
                            {data.mechanicType || 'Mechanic Update'}
                          </p>
                          <p className="text-muted-foreground text-sm mt-1">{data.description || 'No description provided.'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-muted/10 border border-border rounded-xl p-4 space-y-4">
                          <h4 className="font-bold border-b border-border pb-2 flex items-center gap-2"><Phone size={16} className="text-primary" /> Contact & Web</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {data.phone?.length > 0 ? data.phone.map((phone: any, index: number) => {
                              const pVal = typeof phone === 'string' ? phone : (phone.number || '—');
                              const isTel = typeof phone === 'object' && phone.isTelephone;
                              const isWa = typeof phone === 'object' && phone.isWhatsapp;
                              return (
                                <p key={index}>
                                  <span className="font-medium text-foreground">{isTel ? 'Tel:' : 'Phone:'}</span> {pVal}
                                  {isWa && <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">WhatsApp</span>}
                                </p>
                              );
                            }) : <p>No phone details provided.</p>}
                            
                            {data.emails?.length > 0 && data.emails.map((email: string, index: number) => (
                              <p key={index}><span className="font-medium text-foreground">Email:</span> {email}</p>
                            ))}
                            {data.websiteUrl && (
                              <a href={data.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 mt-1">
                                <Globe size={14} /> Visit Website
                              </a>
                            )}
                          </div>

                          <h4 className="font-bold border-b border-border pb-2 flex items-center gap-2 pt-2"><MapPin size={16} className="text-primary" /> Location</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="leading-relaxed">
                              {formatValue(data.address)}<br />
                              {data.landmark ? <>Landmark: {data.landmark}<br /></> : null}
                              {data.pincode ? `Pincode: ${data.pincode}` : (data.area ? `Area: ${data.area}` : '')}<br />
                              {formatValue(data.city)}, {formatValue(data.state)}
                            </p>
                            <div className="pt-1">
                              <p className="text-[10px] text-muted-foreground font-mono bg-secondary px-2 py-1 rounded inline-block">
                                Lat: {formatValue(data.latitude)} | Lng: {formatValue(data.longitude)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/10 border border-border rounded-xl p-4 space-y-4">
                          <h4 className="font-bold border-b border-border pb-2 flex items-center gap-2"><Settings size={16} className="text-primary" /> Services & Features</h4>
                          <div className="space-y-3">
                            <div>
                              <p className="font-semibold text-xs mb-1">Supported Vehicles</p>
                              <div className="flex flex-wrap gap-1.5">
                                {data.vehicleTypes?.length > 0
                                  ? data.vehicleTypes.map((vehicle: string) => (
                                      <span key={vehicle} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium">{vehicle}</span>
                                    ))
                                  : <span className="text-muted-foreground text-xs">N/A</span>}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-xs mb-1">Services Provided</p>
                              <div className="flex flex-wrap gap-1.5">
                                {data.serviceTypes?.length > 0
                                  ? data.serviceTypes.map((service: string) => (
                                      <span key={service} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium">{service}</span>
                                    ))
                                  : <span className="text-muted-foreground text-xs">N/A</span>}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-xs mb-1">Special Features</p>
                              <div className="flex flex-wrap gap-2">
                                {data.evSupport && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">EV Support</span>}
                                {data.homeService && <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">Home Service</span>}
                                {data.roadsideAssistance && <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Roadside Assistance</span>}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/10 border border-border rounded-xl p-4 space-y-4">
                          <h4 className="font-bold border-b border-border pb-2 flex items-center gap-2"><Clock size={16} className="text-primary" /> Operating Hours</h4>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                              <span className="font-semibold block text-foreground">Working Days:</span>
                              {data.operatingDays?.join(', ') || 'N/A'}
                            </p>
                            <p>
                              <span className="font-semibold block text-foreground">Timings:</span>
                              {formatValue(data.operatingHours)}
                            </p>
                            <p>
                              <span className="font-semibold block text-foreground">Coverage Radius:</span>
                              {data.serviceRadius ? `${data.serviceRadius} km` : 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeModalTab === 'business-docs' && (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {businessDocs.length === 0 ? (
                        <span className="text-muted-foreground italic col-span-full bg-muted/20 p-4 rounded-xl border border-border/50">No business documents provided</span>
                      ) : (
                        businessDocs.map(([key, val]: any) => (
                          <div key={key} className="flex flex-col gap-1 p-4 bg-muted/20 border border-border/50 rounded-xl">
                            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{key}</span>
                            {val && typeof val === 'string' && val.startsWith('http') ? (
                              <div className="mt-2">
                                <a href={val} target="_blank" rel="noopener noreferrer" className="block w-full border border-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity shadow-sm bg-muted relative group h-32">
                                  <img 
                                    src={val} 
                                    alt={key} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    <FileText size={32} />
                                  </div>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg"><Eye size={16} /> View File</span>
                                  </div>
                                </a>
                              </div>
                            ) : (
                              <span className="text-foreground font-medium break-words mt-1">{String(val) || '-'}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeModalTab === 'common-info' && (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {commonInfo.length === 0 ? (
                        <span className="text-muted-foreground italic col-span-full bg-muted/20 p-4 rounded-xl border border-border/50">No common info provided</span>
                      ) : (
                        commonInfo.map(([key, val]: any) => (
                          <div key={key} className="flex flex-col gap-1 p-4 bg-muted/20 border border-border/50 rounded-xl">
                            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{key}</span>
                            {key === 'Location (GPS)' && val && typeof val === 'string' && val.startsWith('http') ? (
                              <div className="mt-2">
                                <a href={val} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors">
                                  <MapPin size={18} /> Open in Maps
                                </a>
                              </div>
                            ) : val && typeof val === 'string' && val.startsWith('http') ? (
                              <div className="mt-2">
                                <a href={val} target="_blank" rel="noopener noreferrer" className="block w-full border border-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity shadow-sm bg-muted relative group h-32">
                                  <img 
                                    src={val} 
                                    alt={key} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                                    }}
                                  />
                                  <div className="fallback-icon hidden absolute inset-0 flex items-center justify-center text-muted-foreground">
                                    <FileText size={32} />
                                  </div>
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white font-medium flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg"><Eye size={16} /> View File</span>
                                  </div>
                                </a>
                              </div>
                            ) : (
                              <span className="text-foreground font-medium break-words mt-1">{String(val) || '-'}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeModalTab === 'services' && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="grid grid-cols-1 gap-4">
                      {servicesDataDocs.length > 0 ? (
                        <div className="bg-muted/10 border border-border rounded-xl p-4 space-y-4">
                          <h4 className="font-bold border-b border-border pb-2 flex items-center gap-2"><FileText size={16} className="text-primary" /> Service Pricing & Details</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {servicesDataDocs.map(([key, val]: any) => (
                              <div key={key} className="flex flex-col gap-1 p-3 bg-muted/20 border border-border/50 rounded-xl">
                                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{key}</span>
                                {key === 'Additional Service and Price' && typeof val === 'string' ? (
                                  <div className="flex flex-col gap-1 mt-1">
                                    {val.split(',').map((service, index) => (
                                      <span key={index} className="text-foreground font-medium break-words bg-secondary/50 px-2 py-1 rounded text-sm">{service.trim()}</span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-foreground font-medium break-words mt-1">{String(val) || '-'}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic col-span-full bg-muted/20 p-4 rounded-xl border border-border/50">No service pricing details provided</span>
                      )}
                    </div>
                  </div>
                )}

                {activeModalTab === 'account' && viewModalData.newUserId && (
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="bg-muted/10 border border-border rounded-xl p-6 flex flex-col items-center text-center">
                      <ShieldCheck size={48} className="text-blue-500 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Claiming Account</h3>
                      <p className="text-muted-foreground mb-4">This request aims to bind the following user ID as the owner.</p>
                      <span className="text-xl font-mono bg-blue-500/10 text-blue-600 px-4 py-2 rounded-lg font-bold border border-blue-500/20">
                        User ID: {viewModalData.newUserId}
                      </span>
                    </div>
                  </div>
                )}

              </div>
              <div className="p-4 border-t border-border flex justify-end bg-muted/10">
                <button onClick={() => setViewModalData(null)} className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      <ConfirmDialog 
        isOpen={dialogOpen}
        onCancel={() => setDialogOpen(false)}
        onConfirm={(input) => {
          dialogConfig.action(input);
          setDialogOpen(false);
        }}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        requireInput={dialogConfig.requireInput}
        inputPlaceholder={dialogConfig.inputPlaceholder}
      />
    </div>
  );
}
