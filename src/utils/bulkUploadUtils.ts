import * as XLSX from 'xlsx';

export interface RowData {
  id: string; // internal id for table rendering
  name?: string; // fallback for older templates
  rating?: string | number;
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
  googlePlaceId?: string;
  error?: string;
  area?: string;
  categories?: string[];
  categoryName?: string;
}

export const cleanOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const normalizeDigits = (value: unknown) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '');
};

export const isValidHttpUrl = (value: unknown) => {
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

export const generateTemplate = () => {
  const wsData = [
    ['mechanicType', 'businessName', 'mechanicName', 'phone', 'whatsappNumber', 'telNumber', 'email', 'address', 'pincode', 'city', 'state', 'landmark', 'latitude', 'longitude', 'serviceRadius', 'evSupport', 'homeService', 'roadsideAssistance', 'is24Hours', 'holidayWorking', 'vehicleTypes', 'serviceTypes', 'operatingDays', 'operatingHours', 'description', 'imageUrl', 'websiteUrl', 'googleMapsUrl'],
    ['Workshop / Garage', 'Test Mechanic', 'Raju', '9876543210', '9876543210', '04422223333', 'test@example.com', '123 Main St', '400001', 'Mumbai', 'Maharashtra', 'Near Station', '19.0760', '72.8777', '10', 'FALSE', 'TRUE', 'TRUE', 'FALSE', 'FALSE', 'Bike, Car', 'Puncture Repair', 'Monday, Tuesday', '09:00 - 18:00', 'Best workshop in town', 'https://example.com/img.jpg', 'https://example.com', 'https://goo.gl/maps/...']
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');
  XLSX.writeFile(wb, 'mechanic_upload_template.xlsx');
};

export const validateRow = (row: any): string | undefined => {
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

export const parseExcelFile = (file: File): Promise<RowData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
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
        resolve(parsedData);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};
