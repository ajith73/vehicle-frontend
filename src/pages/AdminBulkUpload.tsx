import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Download, Upload, AlertCircle, CheckCircle, Save, Edit, Trash2, X } from 'lucide-react';
import { API_URL } from '../api/apiClient';

interface RowData {
  id: string; // internal id for table rendering
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
  vehicleTypes: string; // comma separated
  serviceTypes: string; // comma separated
  operatingDays: string; // comma separated
  operatingHours: string;
  error?: string;
}

export default function AdminBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<RowData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  const [editingRow, setEditingRow] = useState<RowData | null>(null);

  const generateTemplate = () => {
    const wsData = [
      ['name', 'phone', 'address', 'area', 'city', 'state', 'latitude', 'longitude', 'vehicleTypes', 'serviceTypes', 'operatingDays', 'operatingHours'],
      ['Test Mechanic', '9876543210', '123 Main St', 'Downtown', 'Mumbai', 'Maharashtra', '19.0760', '72.8777', 'Bike, Car', 'Puncture Repair', 'Monday, Tuesday', '09:00 - 18:00']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mechanic_upload_template.xlsx');
  };

  const validateRow = (row: any): string | undefined => {
    if (!row.name || !row.phone || !row.address || !row.area || !row.city || !row.state || !row.latitude || !row.longitude || !row.vehicleTypes || !row.serviceTypes) {
      return 'Missing required fields';
    }
    if (isNaN(parseFloat(row.latitude)) || isNaN(parseFloat(row.longitude))) {
      return 'Latitude and Longitude must be numbers';
    }
    const phoneClean = String(row.phone).replace(/\D/g, '');
    if (phoneClean.length !== 10) {
      return 'Phone number must be 10 digits';
    }
    return undefined;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const rawData = XLSX.utils.sheet_to_json(ws) as any[];

      const parsedData: RowData[] = rawData.map((row, index) => {
        const error = validateRow(row);
        return {
          id: `row-${index}-${Date.now()}`,
          name: row.name || '',
          phone: row.phone || '',
          address: row.address || '',
          area: row.area || '',
          city: row.city || '',
          state: row.state || '',
          latitude: row.latitude || '',
          longitude: row.longitude || '',
          vehicleTypes: row.vehicleTypes || '',
          serviceTypes: row.serviceTypes || '',
          operatingDays: row.operatingDays || '',
          operatingHours: row.operatingHours || '',
          error
        };
      });

      setData(parsedData);
      
      // Auto-select valid rows
      const validIds = new Set(parsedData.filter(r => !r.error).map(r => r.id));
      setSelectedIds(validIds);
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedIds);
    if (checked) newSelection.add(id);
    else newSelection.delete(id);
    setSelectedIds(newSelection);
  };

  const handleDeleteRow = (id: string) => {
    setData(data.filter(r => r.id !== id));
    if (selectedIds.has(id)) {
      const newSelection = new Set(selectedIds);
      newSelection.delete(id);
      setSelectedIds(newSelection);
    }
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;

    const error = validateRow(editingRow);
    const updatedRow = { ...editingRow, error };

    setData(data.map(r => r.id === updatedRow.id ? updatedRow : r));
    
    // Auto-select if it became valid
    if (!error) {
      setSelectedIds(prev => new Set(prev).add(updatedRow.id));
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(updatedRow.id);
        return next;
      });
    }
    
    setEditingRow(null);
  };

  const handleBulkSubmit = async () => {
    const selectedRows = data.filter(r => selectedIds.has(r.id));
    if (selectedRows.length === 0) {
      toast('No rows selected');
      return;
    }
    
    const invalidRows = selectedRows.filter(r => r.error);
    if (invalidRows.length > 0) {
      toast('Some selected rows have errors. Please fix them or unselect them before saving.');
      return;
    }

    setLoading(true);

    const payload = selectedRows.map(row => ({
      name: row.name,
      phone: [{ number: String(row.phone).replace(/\D/g, ''), isWhatsapp: false }],
      emails: [],
      address: row.address,
      area: row.area,
      city: row.city,
      state: row.state,
      country: 'India',
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      vehicleTypes: String(row.vehicleTypes).split(',').map(s => s.trim()).filter(Boolean),
      serviceTypes: String(row.serviceTypes).split(',').map(s => s.trim()).filter(Boolean),
      operatingDays: String(row.operatingDays).split(',').map(s => s.trim()).filter(Boolean),
      operatingHours: row.operatingHours || '09:00 - 18:00',
      availability: true
    }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/admin/mechanics/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mechanics: payload })
      });

      if (res.ok) {
        toast('Bulk upload successful!');
        navigate('/admin/mechanics');
      } else {
        const err = await res.json();
        toast(err.error || 'Failed to bulk upload');
      }
    } catch (err) {
      toast('Error connecting to server');
    }
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-full mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
          Bulk Upload Mechanics
        </h2>
        <button 
          onClick={() => navigate('/admin/mechanics')}
          className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg mb-1">Step 1: Download Template</h3>
          <p className="text-sm text-muted-foreground mb-3">Download the excel template and fill it with your data.</p>
          <button 
            onClick={generateTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 font-medium"
          >
            <Download size={18} /> Download Template
          </button>
        </div>
        
        <div className="hidden sm:block w-px h-24 bg-border"></div>

        <div>
          <h3 className="font-semibold text-lg mb-1">Step 2: Upload Data</h3>
          <p className="text-sm text-muted-foreground mb-3">Upload your filled excel file here.</p>
          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium"
          >
            <Upload size={18} /> Select File
          </button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h3 className="font-bold">Preview Data ({data.length} rows)</h3>
            <button 
              onClick={handleBulkSubmit}
              disabled={loading || selectedIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium disabled:opacity-50"
            >
              <Save size={18} /> Save Selected ({selectedIds.size})
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-4 font-medium w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === data.length && data.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Area, City</th>
                  <th className="p-4 font-medium">Vehicles</th>
                  <th className="p-4 font-medium">Status / Errors</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.map((row) => (
                  <tr key={row.id} className={`hover:bg-muted/50 ${row.error ? 'bg-red-50/10 dark:bg-red-950/20' : ''}`}>
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                      />
                    </td>
                    <td className="p-4 text-foreground font-medium">{row.name}</td>
                    <td className="p-4 text-muted-foreground">{row.phone}</td>
                    <td className="p-4 text-muted-foreground">{row.area}, {row.city}</td>
                    <td className="p-4 text-muted-foreground max-w-[200px] truncate" title={row.vehicleTypes}>
                      {row.vehicleTypes}
                    </td>
                    <td className="p-4">
                      {row.error ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium" title={row.error}>
                          <AlertCircle size={16} /> {row.error}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle size={16} /> Valid
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingRow({ ...row })}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded"
                        title="Edit Row"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRow(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded"
                        title="Delete Row"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-2xl mt-10 mb-10">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-bold text-xl">Edit Row Data</h3>
              <button onClick={() => setEditingRow(null)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input type="text" value={editingRow.name} onChange={e => setEditingRow({...editingRow, name: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input type="text" value={editingRow.phone} onChange={e => setEditingRow({...editingRow, phone: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input type="text" value={editingRow.address} onChange={e => setEditingRow({...editingRow, address: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Area</label>
                  <input type="text" value={editingRow.area} onChange={e => setEditingRow({...editingRow, area: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input type="text" value={editingRow.city} onChange={e => setEditingRow({...editingRow, city: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input type="text" value={editingRow.state} onChange={e => setEditingRow({...editingRow, state: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input type="text" value={editingRow.latitude} onChange={e => setEditingRow({...editingRow, latitude: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input type="text" value={editingRow.longitude} onChange={e => setEditingRow({...editingRow, longitude: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Vehicles (comma separated)</label>
                  <input type="text" value={editingRow.vehicleTypes} onChange={e => setEditingRow({...editingRow, vehicleTypes: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Services (comma separated)</label>
                  <input type="text" value={editingRow.serviceTypes} onChange={e => setEditingRow({...editingRow, serviceTypes: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setEditingRow(null)} className="px-4 py-2 border border-border text-foreground rounded font-medium hover:bg-secondary">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90 flex items-center gap-2">
                  <CheckCircle size={18} /> Apply Fix
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
