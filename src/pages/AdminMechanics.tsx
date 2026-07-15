import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Check, Edit3, Trash2, Search, Filter, Eye, X, MapPin, Phone, Settings, CheckCircle, XCircle, AlertCircle, Clock, UserCircle, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useMechanics } from '../hooks/useMechanics';
import * as api from '../api/mechanics';
import type { Mechanic } from '../types';
import { Pagination } from '../components/Pagination';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getMechanicStatus } from '../utils/mechanicUtils';

const ITEMS_PER_PAGE = 10;

export default function AdminMechanics() {
  const navigate = useNavigate();
  const { mechanics, loading, refetch } = useMechanics();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [sortBy, setSortBy] = useState('Newest First');
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [viewMechanicData, setViewMechanicData] = useState<Mechanic | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'warning'|'info'|'success', requireInput?: boolean, inputPlaceholder?: string, onConfirm: (val?: string) => void} | null>(null);
  const role = localStorage.getItem('role');

  const handleApprove = async (id: number) => {
    try {
      await api.approveMechanic(id);
      toast.success('Mechanic approved successfully');
      refetch();
    } catch (err) {
      toast.error('Error approving');
    }
  };

  const handleDelete = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Mechanic?',
      message: 'This action cannot be undone. Are you sure you want to delete this mechanic permanently?',
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting mechanic...');
        try {
          await api.deleteMechanic(id);
          toast.success('Mechanic deleted successfully', { id: loadingToast });
          refetch();
        } catch (err) {
          toast.error('Error deleting mechanic', { id: loadingToast });
        }
      }
    });
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedIds.length === 0) return;
    
    const needsRemark = newStatus === 'Rejected' || newStatus === 'Inactive';
    
    setConfirmConfig({
      isOpen: true,
      title: 'Update Status?',
      message: `Are you sure you want to mark ${selectedIds.length} mechanic(s) as ${newStatus}?`,
      type: 'info',
      requireInput: needsRemark,
      inputPlaceholder: `Enter reason for marking as ${newStatus}...`,
      onConfirm: async (remarks?: string) => {
        const loadingToast = toast.loading(`Updating ${selectedIds.length} mechanics...`);
        try {
          await api.bulkUpdateMechanicsStatus(selectedIds, newStatus, remarks);
          toast.success(`Successfully updated ${selectedIds.length} mechanic(s) to ${newStatus}`, { id: loadingToast });
          setSelectedIds([]);
          refetch();
        } catch (err) {
          toast.error('Error during bulk update', { id: loadingToast });
        }
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Mechanics?',
      message: `This action cannot be undone. Are you sure you want to delete ${selectedIds.length} mechanic(s) permanently?`,
      type: 'danger',
      onConfirm: async () => {
        const loadingToast = toast.loading(`Deleting ${selectedIds.length} mechanics...`);
        try {
          await Promise.all(selectedIds.map(id => api.deleteMechanic(id)));
          toast.success(`Successfully deleted ${selectedIds.length} mechanic(s)`, { id: loadingToast });
          setSelectedIds([]);
          refetch();
        } catch (err) {
          toast.error('Error during bulk delete. Some mechanics may not have been deleted.', { id: loadingToast });
        }
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMechanics.length && filteredMechanics.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMechanics.map(m => m.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  let result = mechanics.filter(m => {
    const searchString = `${m.businessName || m.name} ${m.mechanicName || ''} ${m.city} ${m.phone?.[0]?.number || ''} ${m.phone?.map((p: any) => p.number).join(' ') || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesType = typeFilter === 'All Types' || m.mechanicType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (sortBy === 'Newest First') {
    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } else if (sortBy === 'Oldest First') {
    result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
  } else if (sortBy === 'Name A-Z') {
    result.sort((a, b) => (a.businessName || a.name || '').localeCompare(b.businessName || b.name || ''));
  } else if (sortBy === 'Name Z-A') {
    result.sort((a, b) => (b.businessName || b.name || '').localeCompare(a.businessName || a.name || ''));
  }

  const filteredMechanics = result;

  const totalPages = Math.ceil(filteredMechanics.length / ITEMS_PER_PAGE);
  const paginatedMechanics = filteredMechanics.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToXLSX = () => {
    try {
      const dataToExport = filteredMechanics.map(m => ({
        ID: m.id,
        'Business Name': m.businessName || m.name,
        'Mechanic Name': m.mechanicName || '',
        Type: m.mechanicType,
        Status: m.status,
        Availability: getMechanicStatus(m),
        'Vehicle Types': m.vehicleTypes?.join(', ') || m.specializedVehicle || '',
        'Services': m.services?.join(', ') || m.serviceTypes?.join(', ') || m.servicesAvailable || '',
        Phone: Array.isArray(m.phone) ? m.phone.map((p: any) => p.number).join(', ') : (m.phone || m.alternatePhone || ''),
        Email: Array.isArray(m.emails) ? m.emails.join(', ') : (m.email || ''),
        Address: m.address || '',
        Landmark: m.landmark || '',
        Area: m.area || '',
        City: m.city || '',
        District: m.district || '',
        State: m.state || '',
        Country: m.country || '',
        Pincode: m.pincode || '',
        'Operating Days': m.operatingDays?.join(', ') || '',
        'Operating Hours': m.operatingHours || (m.startTime ? `${m.startTime} - ${m.endTime}` : ''),
        'Is 24x7': (m.is24Hours || m.is24x7) ? 'Yes' : 'No',
        'Holiday Working': m.holidayWorking ? 'Yes' : 'No',
        'EV Support': m.evSupport ? 'Yes' : 'No',
        'Home Service': m.homeService ? 'Yes' : 'No',
        'Roadside Assistance': m.roadsideAssistance ? 'Yes' : 'No',
        'Service Radius (km)': m.serviceRadius || '',
        Experience: m.experience || '',
        Description: m.description || '',
        'Website URL': m.websiteUrl || '',
        'Map Link': m.mapLink || '',
        Latitude: m.latitude || '',
        Longitude: m.longitude || '',
        'Created At': m.createdAt ? new Date(m.createdAt).toLocaleDateString() : ''
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mechanics");
      XLSX.writeFile(wb, "mechanics_export.xlsx");
      toast.success('Export successful');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const exportSingleToXLSX = (mechanic: any) => {
    try {
      const dataToExport = [{
        ID: mechanic.id,
        'Business Name': mechanic.businessName || mechanic.name,
        'Mechanic Name': mechanic.mechanicName || '',
        Type: mechanic.mechanicType,
        Status: mechanic.status,
        Availability: getMechanicStatus(mechanic),
        'Vehicle Types': mechanic.vehicleTypes?.join(', ') || mechanic.specializedVehicle || '',
        'Services': mechanic.services?.join(', ') || mechanic.serviceTypes?.join(', ') || mechanic.servicesAvailable || '',
        Phone: Array.isArray(mechanic.phone) ? mechanic.phone.map((p: any) => p.number).join(', ') : (mechanic.phone || mechanic.alternatePhone || ''),
        Email: Array.isArray(mechanic.emails) ? mechanic.emails.join(', ') : (mechanic.email || ''),
        Address: mechanic.address || '',
        Landmark: mechanic.landmark || '',
        Area: mechanic.area || '',
        City: mechanic.city || '',
        District: mechanic.district || '',
        State: mechanic.state || '',
        Country: mechanic.country || '',
        Pincode: mechanic.pincode || '',
        'Operating Days': mechanic.operatingDays?.join(', ') || '',
        'Operating Hours': mechanic.operatingHours || (mechanic.startTime ? `${mechanic.startTime} - ${mechanic.endTime}` : ''),
        'Is 24x7': (mechanic.is24Hours || mechanic.is24x7) ? 'Yes' : 'No',
        'Holiday Working': mechanic.holidayWorking ? 'Yes' : 'No',
        'EV Support': mechanic.evSupport ? 'Yes' : 'No',
        'Home Service': mechanic.homeService ? 'Yes' : 'No',
        'Roadside Assistance': mechanic.roadsideAssistance ? 'Yes' : 'No',
        'Service Radius (km)': mechanic.serviceRadius || '',
        Experience: mechanic.experience || '',
        Description: mechanic.description || '',
        'Website URL': mechanic.websiteUrl || '',
        'Map Link': mechanic.mapLink || '',
        Latitude: mechanic.latitude || '',
        Longitude: mechanic.longitude || '',
        'Created At': mechanic.createdAt ? new Date(mechanic.createdAt).toLocaleDateString() : ''
      }];

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Mechanic Details");
      XLSX.writeFile(wb, `mechanic_${mechanic.id}_export.xlsx`);
      toast.success('Export successful');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse pb-12">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-muted rounded w-24"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between gap-4">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
          <div className="p-0">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 p-4 border-b border-border">
                <div className="w-6 h-6 bg-muted rounded"></div>
                <div className="w-1/4 h-6 bg-muted rounded"></div>
                <div className="w-1/4 h-6 bg-muted rounded"></div>
                <div className="w-1/6 h-6 bg-muted rounded"></div>
                <div className="w-1/6 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-4 mb-8 xl:flex-row xl:items-start xl:justify-between">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          Mechanic Management
        </h2>
        <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
          {selectedIds.length > 0 && role === 'Super Admin' && (
            <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-3 xl:justify-end">
              <button 
                onClick={() => handleBulkStatusUpdate('Approved')}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white text-sm font-medium transition-colors"
              >
                <CheckCircle size={16} /> Approve
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('Pending')}
                className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 rounded-lg hover:bg-yellow-500 hover:text-white text-sm font-medium transition-colors"
              >
                <Clock size={16} /> Pending
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('Rejected')}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white text-sm font-medium transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('Inactive')}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/10 text-gray-600 rounded-lg hover:bg-gray-500 hover:text-white text-sm font-medium transition-colors"
              >
                <AlertCircle size={16} /> Inactive
              </button>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white text-sm font-medium transition-colors border border-red-500/20"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 xl:w-auto">
            <button 
              onClick={() => navigate('/admin/mechanics/bulk-upload')} 
              className="flex w-full items-center justify-center gap-2 px-4 py-2 border border-border bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium transition-colors shadow-sm"
            >
              <Upload size={18} /> Bulk Upload
            </button>
            <button 
              onClick={() => navigate('/admin/mechanics/new')} 
              className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm"
            >
              <Plus size={18} /> Add Mechanic
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search mechanics by name, city, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        {/* Filters and Sorting */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex flex-1 flex-col gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-semibold text-muted-foreground">Status:</span>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {['All', 'Approved', 'Pending', 'Rejected', 'Inactive'].map((status) => (
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:w-auto xl:min-w-[420px]">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Type:</span>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full bg-background border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All Types">All Types</option>
                <option value="Individual Mechanic">Individual Mechanic</option>
                <option value="Workshop / Garage">Workshop / Garage</option>
                <option value="Authorized Service Center">Authorized Service Center</option>
                <option value="Mobile Mechanic">Mobile Mechanic</option>
                <option value="Towing Company">Towing Company</option>
                <option value="Fuel Delivery Partner">Fuel Delivery Partner</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-muted-foreground">Sort:</span>
              <select 
                value={sortBy} 
                onChange={e => setSortBy(e.target.value)}
                className="w-full bg-background border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
                <option value="Name A-Z">Name A-Z</option>
                <option value="Name Z-A">Name Z-A</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
           <span className="font-semibold text-foreground text-sm">{filteredMechanics.length} Mechanics Found</span>
           <div className="flex gap-2">
             <button 
               onClick={() => refetch()} 
               className="flex items-center justify-center p-1.5 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
               title="Refresh Data"
             >
               <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
             </button>
             {role === 'Super Admin' && (
               <button 
                 onClick={exportToXLSX} 
                 className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
               >
                 <Download size={16} /> Export XLSX
               </button>
             )}
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
            <tr className="bg-muted text-muted-foreground border-b border-border">
              {role === 'Super Admin' && (
                <th className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredMechanics.length && filteredMechanics.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">City</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedMechanics.length === 0 ? (
              <tr>
                <td colSpan={role === 'Super Admin' ? 6 : 5} className="p-8 text-center text-muted-foreground">No mechanics found matching your criteria.</td>
              </tr>
            ) : (
              paginatedMechanics.map((m) => (
                <tr key={m.id} className={`hover:bg-muted/30 transition-colors ${selectedIds.includes(m.id) ? 'bg-primary/5' : ''}`}>
                  {role === 'Super Admin' && (
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleSelect(m.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="p-4 text-foreground font-medium">{m.businessName || m.name}</td>
                  <td className="p-4 text-muted-foreground">{m.phone?.[0]?.number || 'N/A'}</td>
                  <td className="p-4 text-muted-foreground">{m.city || 'N/A'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      m.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      m.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    {m.status === 'Pending' && role === 'Super Admin' && (
                      <button 
                        onClick={() => handleApprove(m.id)}
                        className="p-2 bg-green-500/10 text-green-600 rounded-lg hover:bg-green-500 hover:text-white transition-colors"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => setViewMechanicData(m)}
                      className="p-2 bg-blue-500/10 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/mechanics/${m.id}/edit`)}
                      className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    {role === 'Super Admin' && (
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredMechanics.length}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      </div>

      <ConfirmDialog 
        isOpen={!!confirmConfig?.isOpen}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
        type={confirmConfig?.type || 'warning'}
        requireInput={confirmConfig?.requireInput}
        inputPlaceholder={confirmConfig?.inputPlaceholder}
        onConfirm={(val) => {
          if (confirmConfig?.onConfirm) confirmConfig.onConfirm(val);
        }}
        onCancel={() => setConfirmConfig(null)}
      />

    {/* View Details Modal */}
      {viewMechanicData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full h-full sm:h-auto sm:max-h-[90vh] max-w-4xl overflow-y-auto sm:rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar flex flex-col">
            <div className="sticky top-0 bg-card/90 backdrop-blur border-b border-border p-4 sm:p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="text-primary" /> Mechanic Details
              </h2>
              <div className="flex items-center gap-2">
                {role === 'Super Admin' && (
                  <button 
                    onClick={() => exportSingleToXLSX(viewMechanicData)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                    title="Export to XLSX"
                  >
                    <Download size={16} /> Export
                  </button>
                )}
                <button 
                  onClick={() => setViewMechanicData(null)}
                  className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-8 flex-1">
              
              {/* Header Section */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {viewMechanicData.image && (
                  <img src={viewMechanicData.image} alt={viewMechanicData.businessName || viewMechanicData.name} className="w-full md:w-48 h-48 object-cover rounded-xl border border-border shadow-sm shrink-0" />
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold text-foreground">{viewMechanicData.businessName || viewMechanicData.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      viewMechanicData.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      viewMechanicData.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {viewMechanicData.status}
                    </span>
                    {(() => {
                      const availStatus = getMechanicStatus(viewMechanicData);
                      const isAvail = availStatus === 'Available' || availStatus === 'Open';
                      return (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          isAvail ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {availStatus}
                        </span>
                      );
                    })()}
                  </div>
                  {viewMechanicData.mechanicName && <p className="text-muted-foreground font-medium flex items-center gap-2"><UserCircle size={16}/> Owner: {viewMechanicData.mechanicName}</p>}
                  <p className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">{viewMechanicData.mechanicType}</p>
                  <p className="text-muted-foreground mt-2">{viewMechanicData.description || 'No description provided.'}</p>
                  {viewMechanicData.remarks && (viewMechanicData.status === 'Rejected' || viewMechanicData.status === 'Inactive') && (
                    <div className="mt-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                      <p className="text-xs font-bold text-red-600 mb-1">Remarks ({viewMechanicData.status})</p>
                      <p className="text-sm text-red-700">{viewMechanicData.remarks}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact & Location Section */}
                <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-6">
                  <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Phone size={18} className="text-primary"/> Contact & Web</h4>
                  <div className="space-y-3">
                    {viewMechanicData.phone?.map((p: any, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="font-medium text-foreground">{p.isTelephone ? 'Tel:' : 'Phone:'}</span> {p.number} 
                        {p.isWhatsapp && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">WhatsApp</span>}
                      </p>
                    ))}
                    {viewMechanicData.emails?.map((e: string, i: number) => (
                      <p key={i} className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Email:</span> {e}</p>
                    ))}
                    {viewMechanicData.websiteUrl && (
                      <a href={viewMechanicData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                        Visit Website
                      </a>
                    )}
                  </div>

                  <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2 mt-6"><MapPin size={18} className="text-primary"/> Location</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {viewMechanicData.address}<br />
                      {viewMechanicData.landmark && <>Landmark: {viewMechanicData.landmark}<br/></>}
                      {viewMechanicData?.pincode ? `Pincode: ${viewMechanicData?.pincode}` : (viewMechanicData.area && `Area: ${viewMechanicData.area}`)}<br />
                      {viewMechanicData.city}, {viewMechanicData.state}
                    </p>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded inline-block">
                        Lat: {viewMechanicData.latitude} | Lng: {viewMechanicData.longitude}
                      </p>
                      <br/>
                      <a href={`https://www.google.com/maps?q=${viewMechanicData.latitude},${viewMechanicData.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                </div>

                {/* Services & Operating Info Section */}
                <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-6">
                  <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Settings size={18} className="text-primary"/> Services & Features</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-sm mb-2">Supported Vehicles</p>
                      <div className="flex flex-wrap gap-1.5">
                        {viewMechanicData.vehicleTypes?.map((v: string) => (
                          <span key={v} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">{v}</span>
                        )) || <span className="text-muted-foreground text-xs">N/A</span>}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Services Provided</p>
                      <div className="flex flex-wrap gap-1.5">
                        {viewMechanicData.serviceTypes?.map((s: string) => (
                          <span key={s} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">{s}</span>
                        )) || <span className="text-muted-foreground text-xs">N/A</span>}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-2">Special Features</p>
                      <div className="flex flex-wrap gap-2">
                        {viewMechanicData.evSupport && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">EV Support</span>}
                        {viewMechanicData.homeService && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">Home Service</span>}
                        {viewMechanicData.roadsideAssistance && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Roadside Assistance</span>}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2 mt-6"><Clock size={18} className="text-primary"/> Operating Hours</h4>
                  <div className="space-y-3">
                    <p className="text-sm">
                      <span className="font-semibold block mb-1">Working Days:</span>
                      <span className="text-muted-foreground">{viewMechanicData.operatingDays?.join(', ') || 'N/A'}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold block mb-1">Timings:</span>
                      <span className="text-muted-foreground">
                        {viewMechanicData.is24Hours ? '24 Hours Open' : (viewMechanicData.operatingHours || 'N/A')}
                      </span>
                    </p>
                    {viewMechanicData.holidayWorking && (
                      <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 inline-block mt-1">
                        Open on Holidays
                      </p>
                    )}
                  </div>
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
