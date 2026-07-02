import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, Check, Edit3, Trash2, Search, Filter, Eye, X, MapPin, Phone, Settings } from 'lucide-react';
import { useMechanics } from '../hooks/useMechanics';
import * as api from '../api/mechanics';
import type { Mechanic } from '../types';

export default function AdminMechanics() {
  const navigate = useNavigate();
  const { mechanics, loading, refetch } = useMechanics();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [viewMechanicData, setViewMechanicData] = useState<Mechanic | null>(null);
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
    try {
      await api.deleteMechanic(id);
      toast.success('Mechanic deleted successfully');
      setDeleteModalId(null);
      refetch();
    } catch (err) {
      toast.error('Error deleting mechanic');
    }
  };

  const filteredMechanics = mechanics.filter(m => {
    const searchString = `${m.name} ${m.city} ${m.phone?.[0]?.number}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-foreground">Loading mechanics...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          Mechanic Management
        </h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/mechanics/bulk-upload')} 
            className="flex items-center gap-2 px-4 py-2 border border-border bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium transition-colors shadow-sm"
          >
            <Upload size={18} /> Bulk Upload
          </button>
          <button 
            onClick={() => navigate('/admin/mechanics/new')} 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Mechanic
          </button>
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
        
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          <Filter className="w-4 h-4 text-muted-foreground mt-1.5 shrink-0" />
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

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted text-muted-foreground border-b border-border">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">City</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredMechanics.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">No mechanics found matching your criteria.</td>
              </tr>
            ) : (
              filteredMechanics.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 text-foreground font-medium">{m.name}</td>
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
                        onClick={() => setDeleteModalId(m.id)}
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

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Mechanic?</h3>
            <p className="text-muted-foreground text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this mechanic permanently?
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

      {/* View Details Modal */}
      {viewMechanicData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 hide-scrollbar">
            <div className="sticky top-0 bg-card/80 backdrop-blur border-b border-border p-6 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="text-primary" /> Mechanic Details
              </h2>
              <button 
                onClick={() => setViewMechanicData(null)}
                className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">{viewMechanicData.name}</h3>
                <p className="text-muted-foreground">{viewMechanicData.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-sm">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {viewMechanicData.address}, {viewMechanicData.area}<br />
                        {viewMechanicData.city}, {viewMechanicData.state}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">
                        Lat: {viewMechanicData.latitude} | Lng: {viewMechanicData.longitude}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="text-primary mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-sm">Contact</p>
                      {viewMechanicData.phone?.map((p: any, i: number) => (
                        <p key={i} className="text-sm text-muted-foreground">{p.number} {p.isWhatsapp ? '(WhatsApp)' : ''}</p>
                      ))}
                      {viewMechanicData.email?.map((e: string, i: number) => (
                        <p key={i} className="text-sm text-muted-foreground">{e}</p>
                      ))}
                      {viewMechanicData.websiteUrl && (
                        <a href={viewMechanicData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline block mt-1">
                          {viewMechanicData.websiteUrl}
                        </a>
                      )}
                    </div>
                  </div>
                  {viewMechanicData.imageUrl && (
                    <div className="mt-4">
                      <p className="font-semibold text-sm mb-2">Image</p>
                      <img src={viewMechanicData.imageUrl} alt={viewMechanicData.name} className="w-full h-32 object-cover rounded-xl border border-border" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Settings className="text-primary mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-sm mb-1">Services</p>
                      <div className="flex flex-wrap gap-1">
                        {viewMechanicData.services?.map((s: string) => (
                          <span key={s} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium">{s}</span>
                        )) || <span className="text-muted-foreground text-xs">N/A</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="text-primary mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-sm mb-1">Vehicles</p>
                      <div className="flex flex-wrap gap-1">
                        {viewMechanicData.vehicleTypes?.map((v: string) => (
                          <span key={v} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium">{v}</span>
                        )) || <span className="text-muted-foreground text-xs">N/A</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="text-primary mt-1 shrink-0" size={20} />
                    <div>
                      <p className="font-semibold text-sm mb-1">Schedule & Status</p>
                      <p className="text-sm text-muted-foreground mb-1">
                        Days: {viewMechanicData.operatingDays?.join(', ') || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Hours: {viewMechanicData.startTime || 'N/A'} - {viewMechanicData.endTime || 'N/A'}
                      </p>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        viewMechanicData.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        viewMechanicData.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {viewMechanicData.status}
                      </span>
                    </div>
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
