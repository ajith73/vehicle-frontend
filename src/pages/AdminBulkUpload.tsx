import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Download, Upload, AlertCircle, CheckCircle, Save, Edit, Trash2, X, Eye } from 'lucide-react';
import { API_URL, apiClient } from '../api/apiClient';
import MechanicFormComponent from '../components/MechanicFormComponent';
import { ConfirmDialog } from '../components/ConfirmDialog';

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
  pincode: string;
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
  area?: string;
}

export default function AdminBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<RowData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [viewingRow, setViewingRow] = useState<RowData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'single' | 'bulk' | null; id?: string }>({ isOpen: false, type: null });

  const cleanOptionalText = (value: unknown) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const normalizeDigits = (value: unknown) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\D/g, '');
  };

  const isValidHttpUrl = (value: unknown) => {
    if (typeof value !== 'string') return false;
    const trimmed = value.trim();
    if (!trimmed) return false;

    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const generateTemplate = () => {
    const wsData = [
      ['mechanicType', 'businessName', 'mechanicName', 'phone', 'whatsappNumber', 'telNumber', 'email', 'address', 'pincode', 'city', 'state', 'landmark', 'latitude', 'longitude', 'serviceRadius', 'evSupport', 'homeService', 'roadsideAssistance', 'is24Hours', 'holidayWorking', 'vehicleTypes', 'serviceTypes', 'operatingDays', 'operatingHours', 'description', 'imageUrl', 'websiteUrl', 'googleMapsUrl'],
      ['Workshop / Garage', 'Test Mechanic', 'Raju', '9876543210', '9876543210', '04422223333', 'test@example.com', '123 Main St', '400001', 'Mumbai', 'Maharashtra', 'Near Station', '19.0760', '72.8777', '10', 'FALSE', 'TRUE', 'TRUE', 'FALSE', 'FALSE', 'Bike, Car', 'Puncture Repair', 'Monday, Tuesday', '09:00 - 18:00', 'Best workshop in town', 'https://example.com/img.jpg', 'https://example.com', 'https://goo.gl/maps/...']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'mechanic_upload_template.xlsx');
  };

  const validateRow = (row: any): string | undefined => {
    const bName = row.businessName || row.name;
    if (!bName || (!row.phone && !row.telNumber) || !row.address || !row.city || !row.state || !row.landmark || !row.latitude || !row.longitude || !row.vehicleTypes || !row.serviceTypes) {
      return 'Missing required fields (Name, Address, Landmark, Types, and at least one Phone/Tel Number)';
    }
    if (!row.operatingDays || !String(row.operatingDays).trim() || !row.operatingHours || !String(row.operatingHours).trim()) {
      return 'Operating days and operating hours are required';
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
    if (row.websiteUrl && !isValidHttpUrl(row.websiteUrl)) {
      return 'Invalid Website URL';
    }
    if (row.imageUrl && !isValidHttpUrl(row.imageUrl)) {
      return 'Invalid Image URL';
    }
    if (row.googleMapsUrl && !isValidHttpUrl(row.googleMapsUrl)) {
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
          pincode: row.pincode || row.area || '', // Fallback to area if older template
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
    setDeleteConfirm({ isOpen: true, type: 'single', id });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirm({ isOpen: true, type: 'bulk' });
  };

  const executeDelete = () => {
    if (deleteConfirm.type === 'single' && deleteConfirm.id) {
      const id = deleteConfirm.id;
      setData(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => {
        if (prev.has(id)) {
          const newSelection = new Set(prev);
          newSelection.delete(id);
          return newSelection;
        }
        return prev;
      });
    } else if (deleteConfirm.type === 'bulk') {
      setSelectedIds(prevIds => {
        setData(prevData => prevData.filter(r => !prevIds.has(r.id)));
        return new Set();
      });
    }
    setDeleteConfirm({ isOpen: false, type: null });
  };

  const handleMechanicFormSubmit = (payload: any) => {
    if (!editingRow) return;

    try {
      // Convert complex payload back to flat RowData
      const mappedRow: RowData = {
        ...editingRow,
        mechanicType: payload.mechanicType || 'Workshop / Garage',
        businessName: payload.businessName || payload.name || '',
        mechanicName: payload.mechanicName || '',
        description: payload.description || '',
        imageUrl: payload.image || '',
        websiteUrl: payload.websiteUrl || '',
        address: payload.address || '',
        landmark: payload.landmark || '',
        pincode: payload.pincode || '',
        city: payload.city || '',
        state: payload.state || '',
        latitude: payload.latitude?.toString() || '',
        longitude: payload.longitude?.toString() || '',
        serviceRadius: payload.serviceRadius?.toString() || '',
        evSupport: payload.evSupport ? 'true' : 'false',
        homeService: payload.homeService ? 'true' : 'false',
        roadsideAssistance: payload.roadsideAssistance ? 'true' : 'false',
        is24Hours: payload.is24Hours ? 'true' : 'false',
        holidayWorking: payload.holidayWorking ? 'true' : 'false',
        vehicleTypes: payload.vehicleTypes ? payload.vehicleTypes.join(', ') : '',
        serviceTypes: payload.serviceTypes ? payload.serviceTypes.join(', ') : '',
        operatingDays: payload.operatingDays ? payload.operatingDays.join(', ') : '',
        operatingHours: payload.operatingHours || '',
        googleMapsUrl: editingRow.googleMapsUrl || '',
      };

      const mobilePhones = payload.phone?.filter((p: any) => !p.isTelephone) || [];
      const telPhones = payload.phone?.filter((p: any) => p.isTelephone) || [];

      const firstMobile = mobilePhones[0];
      const firstWhatsapp = mobilePhones.find((p: any) => p.isWhatsapp) || firstMobile;

      mappedRow.phone = firstMobile ? firstMobile.number : '';
      mappedRow.whatsappNumber = firstWhatsapp && firstWhatsapp.isWhatsapp ? firstWhatsapp.number : '';
      mappedRow.telNumber = telPhones.length > 0 ? telPhones[0].number : '';
      mappedRow.email = payload.emails && payload.emails.length > 0 ? payload.emails[0] : '';

      const error = validateRow(mappedRow);
      const updatedRow = { ...mappedRow, error };

      setData(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));

      if (!error) {
        setSelectedIds(prev => new Set(prev).add(updatedRow.id));
        toast.success('Row updated');
      } else {
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(updatedRow.id);
          return next;
        });
        toast.error(error);
      }

      setEditingRow(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update row');
    }
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
        mechanicName: cleanOptionalText(row.mechanicName),
        phone: phones, // Matches model property
        emails: cleanOptionalText(row.email) ? [cleanOptionalText(row.email)] : [],
        address: row.address,
        pincode: cleanOptionalText(row.pincode),
        city: row.city,
        state: row.state,
        country: 'India',
        landmark: cleanOptionalText(row.landmark),
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
        description: cleanOptionalText(row.description),
        image: cleanOptionalText(row.imageUrl),
        websiteUrl: cleanOptionalText(row.websiteUrl),
        googleMapsUrl: cleanOptionalText(row.googleMapsUrl),
        availability: true
      };
    });

    try {
      const response = await apiClient<any>('/admin/mechanics/bulk', {
        method: 'POST',
        data: { mechanics: payload }
      });

      const duplicateEntries = Array.isArray(response.duplicates) ? response.duplicates : [];
      const duplicateIndexMap = new Map<number, string>();
      duplicateEntries.forEach((entry: any) => {
        if (typeof entry?.index === 'number') {
          duplicateIndexMap.set(entry.index, entry.reason || 'Duplicate mechanic already exists');
        }
      });

      const duplicateIds = new Set(
        selectedRows
          .map((row, index) => duplicateIndexMap.has(index) ? row.id : null)
          .filter(Boolean) as string[]
      );
      const savedIds = new Set(
        selectedRows
          .map((row, index) => duplicateIndexMap.has(index) ? null : row.id)
          .filter(Boolean) as string[]
      );

      setData(prev => prev
        .map(row => {
          if (!duplicateIds.has(row.id)) {
            return row;
          }

          const selectedIndex = selectedRows.findIndex(selectedRow => selectedRow.id === row.id);
          return {
            ...row,
            error: duplicateIndexMap.get(selectedIndex) || 'Duplicate mechanic already exists'
          };
        })
        .filter(row => !savedIds.has(row.id))
      );

      setSelectedIds(new Set());

      const remainingRowsCount = data.length - savedIds.size;
      if (savedIds.size === 0) {
        toast.error(response.message || 'No mechanics were saved.');
        return;
      }

      if (remainingRowsCount > 0) {
        toast.success(response.message || `${savedIds.size} record(s) saved. ${remainingRowsCount} row(s) still need review.`);
      } else {
        toast.success(response.message || 'Bulk upload successful!');
        navigate('/admin/mechanics');
      }
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

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="min-w-0">
          <h3 className="font-semibold text-lg mb-1">Step 1: Download Template</h3>
          <p className="text-sm text-muted-foreground mb-3">Download the excel template and fill it with your data.</p>
          <button 
            onClick={generateTemplate}
            className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 font-medium sm:w-auto"
          >
            <Download size={18} /> Download Template
          </button>
        </div>
        
        <div className="hidden lg:block w-px h-24 bg-border justify-self-center"></div>

        <div className="min-w-0">
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
            className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium sm:w-auto"
          >
            <Upload size={18} /> Select File
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Processing Bulk Upload...</p>
        </div>
      )}

      {data.length > 0 && !loading && (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-border flex flex-col gap-4 bg-muted/30">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h3 className="font-bold shrink-0">Preview Data ({data.length} rows)</h3>
            
              <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[360px]">
              {/* Search & Filter */}
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              />
              <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm"
              >
                <option value="All">All</option>
                <option value="Valid">Valid</option>
                <option value="Errors">Errors</option>
              </select>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
              {selectedIds.size > 0 && (
                <button 
                  onClick={handleBulkDelete}
                  className="flex w-full items-center justify-center gap-2 px-4 py-2 border border-red-500/20 bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500 hover:text-white font-medium transition-colors text-sm sm:w-auto"
                >
                  <Trash2 size={16} /> Delete Selected
                </button>
              )}
              <button 
                onClick={handleBulkSubmit}
                disabled={selectedIds.size === 0}
                className="flex w-full items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 font-medium disabled:opacity-50 text-sm sm:w-auto whitespace-nowrap"
              >
                <Save size={16} /> Save Selected ({selectedIds.size})
              </button>
            </div>
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
                  <th className="p-4 font-medium">Location</th>
                  <th className="p-4 font-medium">Vehicles</th>
                  <th className="p-4 font-medium">Status / Errors</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(() => {
                  let filteredData = data;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    filteredData = filteredData.filter(r => 
                      (r.businessName && String(r.businessName).toLowerCase().includes(q)) || 
                      (r.mechanicName && String(r.mechanicName).toLowerCase().includes(q)) || 
                      (r.city && String(r.city).toLowerCase().includes(q)) || 
                      (r.phone && String(r.phone).includes(q))
                    );
                  }
                  if (filterStatus === 'Valid') filteredData = filteredData.filter(r => !r.error);
                  if (filterStatus === 'Errors') filteredData = filteredData.filter(r => r.error);

                  return filteredData.map((row) => (
                    <tr key={row.id} className={`hover:bg-muted/50 ${row.error ? 'bg-red-50/10 dark:bg-red-950/20' : ''}`}>
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(row.id)}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        />
                      </td>
                      <td className="p-4 text-foreground font-medium" title={row.businessName}>
                        {row.businessName && row.businessName.length > 15 ? row.businessName.substring(0, 15) + '...' : row.businessName}
                      </td>
                      <td className="p-4 text-muted-foreground">{row.phone}</td>
                      <td className="p-4 text-muted-foreground" title={`${row.city}, ${row.state}`}>
                        {(() => {
                          const locationStr = `${row.city}, ${row.state}`;
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
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center shrink-0 bg-card/90">
              <h3 className="font-bold text-2xl flex items-center gap-2"><Edit size={24} className="text-primary"/> Edit Row Data</h3>
              <button onClick={() => setEditingRow(null)} className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-muted/10">
              {(() => {
                const mappedInitialData = {
                  mechanicType: editingRow.mechanicType,
                  name: editingRow.businessName || editingRow.name,
                  businessName: editingRow.businessName,
                  mechanicName: editingRow.mechanicName,
                  description: editingRow.description,
                  image: editingRow.imageUrl,
                  websiteUrl: editingRow.websiteUrl,
                  phone: (() => {
                    const mobileNum = normalizeDigits(editingRow.phone);
                    const waNum = normalizeDigits(editingRow.whatsappNumber);
                    const telNum = normalizeDigits(editingRow.telNumber);
                    
                    const phoneArray = [];
                    if (mobileNum) {
                      if (mobileNum === waNum) {
                        phoneArray.push({ number: mobileNum, isWhatsapp: true });
                      } else {
                        phoneArray.push({ number: mobileNum, isWhatsapp: false });
                        if (waNum) phoneArray.push({ number: waNum, isWhatsapp: true });
                      }
                    } else if (waNum) {
                      phoneArray.push({ number: waNum, isWhatsapp: true });
                    }
                    
                    if (telNum) phoneArray.push({ number: telNum, isWhatsapp: false, isTelephone: true });
                    return phoneArray;
                  })(),
                  emails: editingRow.email ? [editingRow.email] : [],
                  address: editingRow.address,
                  landmark: editingRow.landmark,
                  pincode: editingRow.pincode,
                  city: editingRow.city,
                  state: editingRow.state,
                  latitude: parseFloat(editingRow.latitude) || 0,
                  longitude: parseFloat(editingRow.longitude) || 0,
                  serviceRadius: editingRow.serviceRadius ? parseFloat(editingRow.serviceRadius) : null,
                  evSupport: editingRow.evSupport === 'true',
                  homeService: editingRow.homeService === 'true',
                  roadsideAssistance: editingRow.roadsideAssistance === 'true',
                  is24Hours: editingRow.is24Hours === 'true',
                  holidayWorking: editingRow.holidayWorking === 'true',
                  vehicleTypes: editingRow.vehicleTypes ? editingRow.vehicleTypes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                  serviceTypes: editingRow.serviceTypes ? editingRow.serviceTypes.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                  operatingDays: editingRow.operatingDays ? editingRow.operatingDays.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                  operatingHours: editingRow.operatingHours,
                  availability: true
                };

                return (
                  <MechanicFormComponent 
                    isEdit={true} 
                    initialData={mappedInitialData} 
                    onSubmitOverride={handleMechanicFormSubmit} 
                    onCancelOverride={() => setEditingRow(null)}
                    isModal={true}
                  />
                );
              })()}
            </div>
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

                {/* Image Preview */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold border-b border-border pb-2 text-primary">Image</h4>
                  {viewingRow.imageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
                      <img
                        src={viewingRow.imageUrl}
                        alt={viewingRow.businessName || 'Mechanic'}
                        className="h-56 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                          if (fallback) {
                            fallback.classList.remove('hidden');
                          }
                        }}
                      />
                      <div className="hidden h-56 items-center justify-center p-4 text-sm text-muted-foreground">
                        Unable to load image preview
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
                      No image provided
                    </div>
                  )}
                  {viewingRow.imageUrl && (
                    <a
                      href={viewingRow.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block break-all text-sm text-blue-500 hover:underline"
                    >
                      {viewingRow.imageUrl}
                    </a>
                  )}
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
                    <span className="text-sm block">{viewingRow.pincode ? `Pincode: ${viewingRow.pincode}` : `Area: ${viewingRow.area}`}, {viewingRow.city}, {viewingRow.state}</span>
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.type === 'bulk' ? 'Delete selected rows?' : 'Delete this row?'}
        message={deleteConfirm.type === 'bulk'
          ? `This will remove ${selectedIds.size} selected row(s) from the upload table.`
          : 'This row will be removed from the upload table.'}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: null })}
      />
    </div>
  );
}
