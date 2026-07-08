import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Download, Upload, AlertCircle, CheckCircle, Save, Edit, Trash2, X, Eye } from 'lucide-react';
import { API_URL, apiClient } from '../api/apiClient';

interface RowData {
  id: string; // internal id for table rendering
  name?: string; // fallback for older templates
  mechanicType: string;
  businessName: string;
  mechanicName: string;
  phone: string;
  whatsappNumber: string;
  telNumber: string;
  email: string;
  address: string;
  area: string;
  city: string;
  state: string;
  landmark: string;
  latitude: string;
  longitude: string;
  serviceRadius: string;
  evSupport: string;
  homeService: string;
  roadsideAssistance: string;
  is24Hours: string;
  holidayWorking: string;
  vehicleTypes: string; // comma separated
  serviceTypes: string; // comma separated
  operatingDays: string; // comma separated
  operatingHours: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  googleMapsUrl: string;
  error?: string;
}

export default function AdminBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<RowData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [viewingRow, setViewingRow] = useState<RowData | null>(null);

  const generateTemplate = () => {
    const wsData = [
      ['mechanicType', 'businessName', 'mechanicName', 'phone', 'whatsappNumber', 'telNumber', 'email', 'address', 'area', 'city', 'state', 'landmark', 'latitude', 'longitude', 'serviceRadius', 'evSupport', 'homeService', 'roadsideAssistance', 'is24Hours', 'holidayWorking', 'vehicleTypes', 'serviceTypes', 'operatingDays', 'operatingHours', 'description', 'imageUrl', 'websiteUrl', 'googleMapsUrl'],
      ['Workshop / Garage', 'Test Mechanic', 'Raju', '9876543210', '9876543210', '04422223333', 'test@example.com', '123 Main St', 'Downtown', 'Mumbai', 'Maharashtra', 'Near Station', '19.0760', '72.8777', '10', 'FALSE', 'TRUE', 'TRUE', 'FALSE', 'FALSE', 'Bike, Car', 'Puncture Repair', 'Monday, Tuesday', '09:00 - 18:00', 'Best workshop in town', 'https://example.com/img.jpg', 'https://example.com', 'https://goo.gl/maps/...']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mechanic_upload_template.xlsx');
  };

  const validateRow = (row: any): string | undefined => {
    const bName = row.businessName || row.name;
    if (!bName || (!row.phone && !row.telNumber) || !row.address || !row.area || !row.city || !row.state || !row.latitude || !row.longitude || !row.vehicleTypes || !row.serviceTypes) {
      return 'Missing required fields (Name, Address, Types, and at least one Phone/Tel Number)';
    }
    if (isNaN(parseFloat(row.latitude)) || isNaN(parseFloat(row.longitude))) {
      return 'Latitude and Longitude must be numbers';
    }
    const phoneClean = row.phone ? String(row.phone).replace(/\D/g, '') : '';
    const telClean = row.telNumber ? String(row.telNumber).replace(/\D/g, '') : '';
    if (phoneClean && phoneClean.length !== 10) {
      return 'Mobile phone number must be 10 digits';
    }
    if (telClean && telClean.length < 5) {
      return 'Tel number must be valid';
    }
    if (row.email && !/^\S+@\S+\.\S+$/.test(String(row.email))) {
      return 'Invalid email format';
    }
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (row.websiteUrl && !urlPattern.test(String(row.websiteUrl))) {
      return 'Invalid Website URL';
    }
    if (row.imageUrl && !urlPattern.test(String(row.imageUrl))) {
      return 'Invalid Image URL';
    }
    if (row.googleMapsUrl && !urlPattern.test(String(row.googleMapsUrl))) {
      return 'Invalid Google Maps URL';
    }
    if (row.serviceRadius && isNaN(parseInt(row.serviceRadius, 10))) {
      return 'Service radius must be a valid number';
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
          mechanicType: row.mechanicType || 'Workshop / Garage',
          businessName: row.businessName || row.name || '',
          mechanicName: row.mechanicName || '',
          phone: row.phone || '',
          whatsappNumber: row.whatsappNumber || '',
          telNumber: row.telNumber || '',
          email: row.email || '',
          address: row.address || '',
          area: row.area || '',
          city: row.city || '',
          state: row.state || '',
          landmark: row.landmark || '',
          latitude: row.latitude || '',
          longitude: row.longitude || '',
          serviceRadius: row.serviceRadius || '',
          evSupport: String(row.evSupport).toLowerCase() === 'true' || String(row.evSupport).toLowerCase() === 'yes' ? 'true' : 'false',
          homeService: String(row.homeService).toLowerCase() === 'true' || String(row.homeService).toLowerCase() === 'yes' ? 'true' : 'false',
          roadsideAssistance: String(row.roadsideAssistance).toLowerCase() === 'true' || String(row.roadsideAssistance).toLowerCase() === 'yes' ? 'true' : 'false',
          is24Hours: String(row.is24Hours).toLowerCase() === 'true' || String(row.is24Hours).toLowerCase() === 'yes' ? 'true' : 'false',
          holidayWorking: String(row.holidayWorking).toLowerCase() === 'true' || String(row.holidayWorking).toLowerCase() === 'yes' ? 'true' : 'false',
          vehicleTypes: row.vehicleTypes || '',
          serviceTypes: row.serviceTypes || '',
          operatingDays: row.operatingDays || '',
          operatingHours: row.operatingHours || '',
          description: row.description || '',
          imageUrl: row.imageUrl || '',
          websiteUrl: row.websiteUrl || '',
          googleMapsUrl: row.googleMapsUrl || '',
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

    const payload = selectedRows.map(row => {
      const phones = [];
      if (row.phone) phones.push({ number: String(row.phone).replace(/\D/g, ''), isWhatsapp: false });
      if (row.whatsappNumber) phones.push({ number: String(row.whatsappNumber).replace(/\D/g, ''), isWhatsapp: true });
      if (row.telNumber) phones.push({ number: String(row.telNumber).replace(/\D/g, ''), isWhatsapp: false, isTelephone: true } as any);

      // Normalize mechanicType to match backend Enums
      let normalizedMechanicType = row.mechanicType || 'Workshop / Garage';
      if (normalizedMechanicType === 'Freelance Mechanic' || normalizedMechanicType === 'Mechanic') {
        normalizedMechanicType = 'Individual Mechanic';
      } else if (normalizedMechanicType === 'Service Center') {
        normalizedMechanicType = 'Authorized Service Center';
      }

      return {
        mechanicType: normalizedMechanicType,
        name: row.businessName || row.name, // Ensure compatibility with backend models if needed
        businessName: row.businessName,
        mechanicName: row.mechanicName,
        phone: phones, // Matches model property
        emails: row.email ? [row.email] : [],
        address: row.address,
        area: row.area,
        city: row.city,
        state: row.state,
        country: 'India',
        landmark: row.landmark,
        latitude: parseFloat(row.latitude),
        longitude: parseFloat(row.longitude),
        serviceRadius: row.serviceRadius ? parseInt(row.serviceRadius, 10) : null,
        evSupport: row.evSupport === 'true',
        homeService: row.homeService === 'true',
        roadsideAssistance: row.roadsideAssistance === 'true',
        is24Hours: row.is24Hours === 'true',
        holidayWorking: row.holidayWorking === 'true',
        vehicleTypes: row.vehicleTypes ? String(row.vehicleTypes).split(',').map(s => s.trim()).filter(Boolean) : [],
        serviceTypes: row.serviceTypes ? String(row.serviceTypes).split(',').map(s => s.trim()).filter(Boolean) : [],
        operatingDays: row.operatingDays ? String(row.operatingDays).split(',').map(s => s.trim()).filter(Boolean) : [],
        operatingHours: row.operatingHours || '09:00 - 18:00',
        description: row.description,
        image: row.imageUrl,
        websiteUrl: row.websiteUrl,
        googleMapsUrl: row.googleMapsUrl,
        availability: true
      };
    });

    try {
      await apiClient('/admin/mechanics/bulk', {
        method: 'POST',
        data: { mechanics: payload }
      });

      toast('Bulk upload successful!');
      navigate('/admin/mechanics');
    } catch (err: any) {
      toast(err.message || 'Error connecting to server');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-full mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-8">
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
                    <td className="p-4 text-foreground font-medium" title={row.businessName}>
                      {row.businessName && row.businessName.length > 10 ? row.businessName.substring(0, 10) + '...' : row.businessName}
                    </td>
                    <td className="p-4 text-muted-foreground">{row.phone}</td>
                    <td className="p-4 text-muted-foreground" title={`${row.area}, ${row.city}`}>
                      {(() => {
                        const locationStr = `${row.area}, ${row.city}`;
                        return locationStr.length > 15 ? locationStr.substring(0, 15) + '...' : locationStr;
                      })()}
                    </td>
                    <td className="p-4 text-muted-foreground max-w-[200px] truncate" title={row.vehicleTypes}>
                      {row.vehicleTypes}
                    </td>
                    <td className="p-4 max-w-[200px] whitespace-normal break-words">
                      {row.error ? (
                        <span className="flex items-start gap-1 text-red-600 text-sm font-medium" title={row.error}>
                          <AlertCircle size={16} className="shrink-0 mt-0.5" /> <span>{row.error}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle size={16} /> Valid
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => setViewingRow({ ...row })}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 rounded"
                        title="View Row"
                      >
                        <Eye size={18} />
                      </button>
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
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-xl">Edit Row Data</h3>
              <button onClick={() => setEditingRow(null)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-border pb-2 text-primary">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mechanic Type</label>
                      <select value={editingRow.mechanicType} onChange={e => setEditingRow({...editingRow, mechanicType: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none">
                        <option value="Workshop / Garage">Workshop / Garage</option>
                        <option value="Individual Mechanic">Individual Mechanic</option>
                        <option value="Authorized Service Center">Authorized Service Center</option>
                        <option value="Mobile Mechanic">Mobile Mechanic</option>
                        <option value="Towing Company">Towing Company</option>
                        <option value="Fuel Delivery Partner">Fuel Delivery Partner</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Business Name <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.businessName} onChange={e => setEditingRow({...editingRow, businessName: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Mechanic Name</label>
                      <input type="text" value={editingRow.mechanicName} onChange={e => setEditingRow({...editingRow, mechanicName: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea rows={2} value={editingRow.description} onChange={e => setEditingRow({...editingRow, description: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-border pb-2 text-primary">Contact & Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Mobile Phone</label>
                      <input type="text" value={editingRow.phone} onChange={e => setEditingRow({...editingRow, phone: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">WhatsApp</label>
                      <input type="text" value={editingRow.whatsappNumber} onChange={e => setEditingRow({...editingRow, whatsappNumber: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tel Number</label>
                      <input type="text" value={editingRow.telNumber} onChange={e => setEditingRow({...editingRow, telNumber: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input type="email" value={editingRow.email} onChange={e => setEditingRow({...editingRow, email: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Image URL</label>
                      <input type="text" value={editingRow.imageUrl} onChange={e => setEditingRow({...editingRow, imageUrl: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Website URL</label>
                      <input type="text" value={editingRow.websiteUrl} onChange={e => setEditingRow({...editingRow, websiteUrl: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Google Maps URL</label>
                      <input type="text" value={editingRow.googleMapsUrl} onChange={e => setEditingRow({...editingRow, googleMapsUrl: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-border pb-2 text-primary">Location</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium mb-1">Address <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.address} onChange={e => setEditingRow({...editingRow, address: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Area <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.area} onChange={e => setEditingRow({...editingRow, area: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.city} onChange={e => setEditingRow({...editingRow, city: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.state} onChange={e => setEditingRow({...editingRow, state: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Landmark</label>
                      <input type="text" value={editingRow.landmark} onChange={e => setEditingRow({...editingRow, landmark: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.latitude} onChange={e => setEditingRow({...editingRow, latitude: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.longitude} onChange={e => setEditingRow({...editingRow, longitude: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                  </div>
                </div>

                {/* Services & Offerings */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 border-b border-border pb-2 text-primary">Services & Operations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Vehicles (comma separated) <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.vehicleTypes} onChange={e => setEditingRow({...editingRow, vehicleTypes: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Services (comma separated) <span className="text-red-500">*</span></label>
                      <input type="text" value={editingRow.serviceTypes} onChange={e => setEditingRow({...editingRow, serviceTypes: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Operating Days (comma separated)</label>
                      <input type="text" value={editingRow.operatingDays} onChange={e => setEditingRow({...editingRow, operatingDays: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Operating Hours</label>
                      <input type="text" value={editingRow.operatingHours} onChange={e => setEditingRow({...editingRow, operatingHours: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Service Radius (km)</label>
                      <input type="text" value={editingRow.serviceRadius} onChange={e => setEditingRow({...editingRow, serviceRadius: e.target.value})} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
                    </div>
                  </div>
                  
                  {/* Toggles */}
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingRow.evSupport === 'true'} onChange={e => setEditingRow({...editingRow, evSupport: e.target.checked ? 'true' : 'false'})} className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4" />
                      <span className="text-sm font-medium">EV Support</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingRow.homeService === 'true'} onChange={e => setEditingRow({...editingRow, homeService: e.target.checked ? 'true' : 'false'})} className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4" />
                      <span className="text-sm font-medium">Home Service</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingRow.roadsideAssistance === 'true'} onChange={e => setEditingRow({...editingRow, roadsideAssistance: e.target.checked ? 'true' : 'false'})} className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4" />
                      <span className="text-sm font-medium">Roadside Assist</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingRow.is24Hours === 'true'} onChange={e => setEditingRow({...editingRow, is24Hours: e.target.checked ? 'true' : 'false'})} className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4" />
                      <span className="text-sm font-medium">24 Hours</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingRow.holidayWorking === 'true'} onChange={e => setEditingRow({...editingRow, holidayWorking: e.target.checked ? 'true' : 'false'})} className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4" />
                      <span className="text-sm font-medium">Holiday Working</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-border flex justify-end gap-3 shrink-0 bg-card rounded-b-xl">
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

      {/* View Modal */}
      {viewingRow && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center shrink-0">
              <h3 className="font-bold text-xl">View Row Data</h3>
              <button onClick={() => setViewingRow(null)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Basic Info</h4>
                  <div>
                    <span className="block text-sm text-muted-foreground">Type</span>
                    <span className="font-medium">{viewingRow.mechanicType || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Business Name</span>
                    <span className="font-medium">{viewingRow.businessName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Mechanic Name</span>
                    <span className="font-medium">{viewingRow.mechanicName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Description</span>
                    <p className="text-sm">{viewingRow.description || 'N/A'}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Contact</h4>
                  <div>
                    <span className="block text-sm text-muted-foreground">Mobile Phone</span>
                    <span className="font-medium">{viewingRow.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">WhatsApp</span>
                    <span className="font-medium">{viewingRow.whatsappNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Tel Number</span>
                    <span className="font-medium">{viewingRow.telNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Email</span>
                    <span className="font-medium">{viewingRow.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-muted-foreground">Website</span>
                    <a href={viewingRow.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline break-all">{viewingRow.websiteUrl || 'N/A'}</a>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Location</h4>
                  <div>
                    <span className="block text-sm text-muted-foreground">Address</span>
                    <span className="text-sm block">{viewingRow.address}, {viewingRow.landmark}</span>
                    <span className="text-sm block">{viewingRow.area}, {viewingRow.city}, {viewingRow.state}</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="block text-sm text-muted-foreground">Lat</span>
                      <span className="font-medium">{viewingRow.latitude || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-muted-foreground">Lng</span>
                      <span className="font-medium">{viewingRow.longitude || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Services Info */}
                <div className="space-y-4 md:col-span-2 lg:col-span-3">
                  <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Services & Offerings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="block text-sm text-muted-foreground">Vehicles</span>
                      <span className="font-medium text-sm">{viewingRow.vehicleTypes || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-muted-foreground">Services</span>
                      <span className="font-medium text-sm">{viewingRow.serviceTypes || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="block text-sm text-muted-foreground">Operating Days & Hours</span>
                      <span className="font-medium block text-sm">{viewingRow.operatingDays || 'N/A'}</span>
                      <span className="font-medium block text-sm">{viewingRow.operatingHours || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Toggles Display */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {viewingRow.evSupport === 'true' && <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full border border-green-200 dark:border-green-800">EV Support</span>}
                    {viewingRow.homeService === 'true' && <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full border border-blue-200 dark:border-blue-800">Home Service</span>}
                    {viewingRow.roadsideAssistance === 'true' && <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 text-xs rounded-full border border-orange-200 dark:border-orange-800">Roadside Assist</span>}
                    {viewingRow.is24Hours === 'true' && <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-full border border-purple-200 dark:border-purple-800">24/7 Hours</span>}
                    {viewingRow.holidayWorking === 'true' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs rounded-full border border-yellow-200 dark:border-yellow-800">Holiday Working</span>}
                  </div>
                </div>

              </div>
            </div>
            
            <div className="p-4 border-t border-border flex justify-end shrink-0 bg-card rounded-b-xl">
              <button onClick={() => setViewingRow(null)} className="px-4 py-2 bg-primary text-primary-foreground rounded font-medium hover:bg-primary/90">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
