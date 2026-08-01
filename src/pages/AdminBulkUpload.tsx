import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Download, Upload, Save, Trash2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import MechanicFormComponent from '../components/MechanicFormComponent';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { 
  type RowData, 
  generateTemplate, 
  parseExcelFile, 
  validateRow,
  normalizeDigits,
  cleanOptionalText
} from '../utils/bulkUploadUtils';
import BulkUploadTable from '../components/admin/BulkUploadTable';
import BulkUploadViewModal from '../components/admin/BulkUploadViewModal';

export default function AdminBulkUpload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [data, setData] = useState<RowData[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [editingRow, setEditingRow] = useState<RowData | null>(null);
  const [viewingRow, setViewingRow] = useState<RowData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'single' | 'bulk' | null; id?: string }>({ isOpen: false, type: null });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      
      // Auto-select valid rows
      const validIds = new Set(parsedData.filter(r => !r.error).map(r => r.id));
      setSelectedIds(validIds);
    } catch (error) {
      toast.error('Failed to parse excel file');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
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
      const mobileNum = row.phone ? String(row.phone).replace(/\D/g, '') : '';
      const waNum = row.whatsappNumber ? String(row.whatsappNumber).replace(/\D/g, '') : '';
      const telNum = row.telNumber ? String(row.telNumber).replace(/\D/g, '') : '';

      if (mobileNum) {
        if (mobileNum === waNum) {
          phones.push({ number: mobileNum, isWhatsapp: true });
        } else {
          phones.push({ number: mobileNum, isWhatsapp: false });
          if (waNum) phones.push({ number: waNum, isWhatsapp: true });
        }
      } else if (waNum) {
        phones.push({ number: waNum, isWhatsapp: true });
      }

      if (telNum) phones.push({ number: telNum, isWhatsapp: false, isTelephone: true } as any);

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
        setLoading(false);
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

  if (editingRow) {
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
      vehicleTypes: editingRow.vehicleTypes || '',
      serviceTypes: editingRow.serviceTypes || '',
      operatingDays: editingRow.operatingDays || '',
      operatingHours: editingRow.operatingHours,
      availability: true
    };

    return (
      <div className="p-4 sm:p-8 max-w-full mx-auto pb-12">
        <MechanicFormComponent 
          isEdit={true} 
          initialData={mappedInitialData} 
          onSubmitOverride={handleMechanicFormSubmit} 
          onCancelOverride={() => setEditingRow(null)}
          isModal={false}
          submitButtonText="Save Changes to Table (Not Saved to DB yet)"
        />
      </div>
    );
  }

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
          
          <BulkUploadTable 
            data={data}
            selectedIds={selectedIds}
            searchQuery={searchQuery}
            filterStatus={filterStatus}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            onViewRow={setViewingRow}
            onEditRow={setEditingRow}
            onDeleteRow={handleDeleteRow}
          />
        </div>
      )}


      {/* View Modal */}
      {viewingRow && (
        <BulkUploadViewModal 
          viewingRow={viewingRow}
          onClose={() => setViewingRow(null)}
        />
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
