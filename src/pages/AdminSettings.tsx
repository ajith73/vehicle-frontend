import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { API_URL, apiClient } from '../api/apiClient';
import { Trash2, Plus, Settings, Edit2, X, Check, Save } from 'lucide-react';
import Select from 'react-select';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function AdminSettings() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [savingFeatured, setSavingFeatured] = useState(false);

  const [newVehicle, setNewVehicle] = useState('');
  const [newService, setNewService] = useState('');

  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editingVehicleName, setEditingVehicleName] = useState('');
  
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingServiceName, setEditingServiceName] = useState('');
  
  const [confirmConfig, setConfirmConfig] = useState<{isOpen: boolean, title: string, message: string, type: 'danger'|'warning'|'info'|'success', onConfirm: () => void} | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vData, sData] = await Promise.all([apiClient<any>(`/public/vehicles`), apiClient<any>(`/public/services`)]);
      setVehicles(vData);
      setServices(sData);
      
      // Initialize featured selections
      setFeaturedVehicles(
        vData.filter((v: any) => v.isFeatured)
             .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
             .map((v: any) => ({ value: v.id, label: v.name }))
      );
      setFeaturedServices(
        sData.filter((s: any) => s.isFeatured)
             .sort((a: any, b: any) => a.orderIndex - b.orderIndex)
             .map((s: any) => ({ value: s.id, label: s.name }))
      );
    } catch (err) {
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newVehicle })
      });
      if (res.ok) {
        toast.success('Vehicle added');
        setNewVehicle('');
        fetchData();
      } else {
        toast.error('Failed to add vehicle');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Vehicle Type?',
      message: 'Are you sure you want to delete this vehicle type?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/admin/vehicles/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            toast.success('Vehicle deleted');
            fetchData();
          } else {
            toast.error('Failed to delete vehicle');
          }
        } catch (err) {
          toast.error('Error connecting to server');
        }
      }
    });
  };

  const handleUpdateVehicle = async (id: number) => {
    if (!editingVehicleName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/vehicles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editingVehicleName })
      });
      if (res.ok) {
        toast.success('Vehicle updated');
        setEditingVehicleId(null);
        fetchData();
      } else {
        toast.error('Failed to update vehicle');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newService })
      });
      if (res.ok) {
        toast.success('Service added');
        setNewService('');
        fetchData();
      } else {
        toast.error('Failed to add service');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const handleDeleteService = async (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Service Type?',
      message: 'Are you sure you want to delete this service type?',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/admin/services/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            toast.success('Service deleted');
            fetchData();
          } else {
            toast.error('Failed to delete service');
          }
        } catch (err) {
          toast.error('Error connecting to server');
        }
      }
    });
  };

  const handleUpdateService = async (id: number) => {
    if (!editingServiceName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/services/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: editingServiceName })
      });
      if (res.ok) {
        toast.success('Service updated');
        setEditingServiceId(null);
        fetchData();
      } else {
        toast.error('Failed to update service');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    }
  };

  const handleSaveFeatured = async () => {
    try {
      setSavingFeatured(true);
      const vehicleIds = featuredVehicles.map(v => v.value);
      const serviceIds = featuredServices.map(s => s.value);
      
      const [vRes, sRes] = await Promise.all([
        fetch(`${API_URL}/admin/vehicles/featured`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ ids: vehicleIds })
        }),
        fetch(`${API_URL}/admin/services/featured`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ ids: serviceIds })
        })
      ]);
      
      if (vRes.ok && sRes.ok) {
        toast.success('Featured configuration saved');
        fetchData();
      } else {
        toast.error('Failed to save featured configuration');
      }
    } catch (err) {
      toast.error('Error connecting to server');
    } finally {
      setSavingFeatured(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8 text-primary" />
          Settings Configuration
        </h1>
      </div>

      {/* Featured Configuration Section */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Home Page Configuration</h2>
            <p className="text-sm text-muted-foreground">Select and order the vehicle and service types to highlight on the landing page.</p>
          </div>
          <button
            onClick={handleSaveFeatured}
            disabled={savingFeatured}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {savingFeatured ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            Save Featured
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground">Featured Vehicle Types</label>
            <Select
              isMulti
              options={vehicles.map(v => ({ value: v.id, label: v.name }))}
              value={featuredVehicles}
              onChange={(selected) => setFeaturedVehicles(selected as any)}
              className="text-foreground"
              classNamePrefix="select"
              placeholder="Select and order vehicles..."
              styles={{
                control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'hsl(var(--border))' }),
                menu: (base) => ({ ...base, backgroundColor: 'hsl(var(--card))' }),
                option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'hsl(var(--secondary))' : 'hsl(var(--background))', color: 'hsl(var(--foreground))' }),
                multiValue: (base) => ({ ...base, backgroundColor: 'hsl(var(--primary))', opacity: 0.9 }),
                multiValueLabel: (base) => ({ ...base, color: 'hsl(var(--primary-foreground))' }),
                multiValueRemove: (base) => ({ ...base, color: 'hsl(var(--primary-foreground))', ':hover': { backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' } })
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground">Featured Service Types</label>
            <Select
              isMulti
              options={services.map(s => ({ value: s.id, label: s.name }))}
              value={featuredServices}
              onChange={(selected) => setFeaturedServices(selected as any)}
              className="text-foreground"
              classNamePrefix="select"
              placeholder="Select and order services..."
              styles={{
                control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'hsl(var(--border))' }),
                menu: (base) => ({ ...base, backgroundColor: 'hsl(var(--card))' }),
                option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'hsl(var(--secondary))' : 'hsl(var(--background))', color: 'hsl(var(--foreground))' }),
                multiValue: (base) => ({ ...base, backgroundColor: 'hsl(var(--primary))', opacity: 0.9 }),
                multiValueLabel: (base) => ({ ...base, color: 'hsl(var(--primary-foreground))' }),
                multiValueRemove: (base) => ({ ...base, color: 'hsl(var(--primary-foreground))', ':hover': { backgroundColor: 'rgba(0,0,0,0.2)', color: 'white' } })
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Vehicle Types</h2>
          
          <form onSubmit={handleAddVehicle} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="E.g. Hovercraft"
              value={newVehicle}
              onChange={(e) => setNewVehicle(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!newVehicle.trim()}
              className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="bg-background border border-border rounded-lg max-h-[400px] overflow-y-auto">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                {editingVehicleId === v.id ? (
                  <div className="flex flex-1 items-center gap-2 mr-4">
                    <input
                      type="text"
                      value={editingVehicleName}
                      onChange={(e) => setEditingVehicleName(e.target.value)}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateVehicle(v.id)}
                    />
                    <button onClick={() => handleUpdateVehicle(v.id)} className="text-green-600 hover:bg-green-100 p-1 rounded-md transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingVehicleId(null)} className="text-muted-foreground hover:bg-secondary p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-sm flex-1">{v.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingVehicleId(v.id); setEditingVehicleName(v.name); }}
                        className="text-primary/80 hover:text-primary p-1 rounded-md hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="text-destructive/80 hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {vehicles.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">No vehicles found</div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Service Types</h2>
          
          <form onSubmit={handleAddService} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="E.g. Turbo Replacement"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!newService.trim()}
              className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="bg-background border border-border rounded-lg max-h-[400px] overflow-y-auto">
            {services.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                {editingServiceId === s.id ? (
                  <div className="flex flex-1 items-center gap-2 mr-4">
                    <input
                      type="text"
                      value={editingServiceName}
                      onChange={(e) => setEditingServiceName(e.target.value)}
                      className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdateService(s.id)}
                    />
                    <button onClick={() => handleUpdateService(s.id)} className="text-green-600 hover:bg-green-100 p-1 rounded-md transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditingServiceId(null)} className="text-muted-foreground hover:bg-secondary p-1 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-sm flex-1">{s.name}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); }}
                        className="text-primary/80 hover:text-primary p-1 rounded-md hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="text-destructive/80 hover:text-destructive p-1 rounded-md hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {services.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">No services found</div>
            )}
          </div>
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
    </div>
  );
}
