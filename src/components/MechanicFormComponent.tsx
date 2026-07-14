import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { User, Phone, MapPin, Wrench, CalendarClock, Plus, Trash2, Save, X, Info, Image, Globe, Map, Loader2 } from 'lucide-react';
import { State, City } from 'country-state-city';
import { apiClient } from '../api/apiClient';

// Default options fetched from backend
// DEFAULT_VEHICLES and DEFAULT_SERVICES are populated dynamically

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const normalizeLocationText = (value: any) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

interface MechanicFormComponentProps {
  id?: string;
  isEdit: boolean;
  initialData?: any;
  onSubmitOverride?: (payload: any) => void | Promise<void>;
  onCancelOverride?: () => void;
  isModal?: boolean;
}

export default function MechanicFormComponent({ id, isEdit, initialData, onSubmitOverride, onCancelOverride, isModal }: MechanicFormComponentProps) {
  const navigate = useNavigate();
  const getSelectStyles = (hasError?: boolean) => ({
    control: (base: any, state: any) => ({
      ...base,
      minHeight: 42,
      backgroundColor: 'var(--background)',
      borderColor: hasError ? '#ef4444' : state.isFocused ? 'var(--primary)' : 'var(--border)',
      boxShadow: hasError
        ? '0 0 0 1px #ef4444'
        : state.isFocused
          ? '0 0 0 2px color-mix(in srgb, var(--primary) 18%, transparent)'
          : 'none',
      '&:hover': {
        borderColor: hasError ? '#ef4444' : state.isFocused ? 'var(--primary)' : 'var(--border)'
      }
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: 'var(--card)',
      color: 'var(--foreground)',
      zIndex: 90
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? 'color-mix(in srgb, var(--primary) 12%, var(--card))' : 'var(--card)',
      color: 'var(--foreground)'
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: 'hsl(var(--primary))',
      borderRadius: '4px'
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: 'hsl(var(--primary-foreground))'
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: 'hsl(var(--primary-foreground))',
      ':hover': {
        backgroundColor: 'hsl(var(--destructive))',
        color: 'hsl(var(--destructive-foreground))'
      }
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'var(--foreground)'
    }),
    input: (base: any) => ({
      ...base,
      color: 'var(--foreground)'
    })
  });

  // Dynamic dropdowns
  const [vehicleOptions, setVehicleOptions] = useState<{value: string, label: string}[]>([]);
  const [serviceOptions, setServiceOptions] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    // Fetch dynamic options
    const fetchOptions = async () => {
      try {
        const [vData, sData] = await Promise.all([apiClient<any>(`/public/vehicles`), apiClient<any>(`/public/services`)]);
        setVehicleOptions(vData.map((v: any) => ({ value: v.name, label: v.name })));
        setServiceOptions(sData.map((s: any) => ({ value: s.name, label: s.name })));
      } catch (err) {
        console.error('Failed to load settings options', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const loadStates = async () => {
      try {
        setStateOptions(
          State.getStatesOfCountry('IN').map((state) => ({
            value: state.isoCode,
            label: state.name
          }))
        );
      } catch (err) {
        console.error('Failed to load state data', err);
      }
    };

    loadStates();
  }, []);

  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEdit);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // States
  const [mechanicType, setMechanicType] = useState('Workshop / Garage');
  const [businessName, setBusinessName] = useState('');
  const [mechanicName, setMechanicName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [serviceRadius, setServiceRadius] = useState<number | ''>('');
  
  const [evSupport, setEvSupport] = useState(false);
  const [homeService, setHomeService] = useState(false);
  const [roadsideAssistance, setRoadsideAssistance] = useState(false);
  const [is24Hours, setIs24Hours] = useState(false);
  const [holidayWorking, setHolidayWorking] = useState(false);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phones, setPhones] = useState([{ number: '', isWhatsapp: false }]);
  const [emails, setEmails] = useState(['']);
  
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [stateOptions, setStateOptions] = useState<{value: string, label: string}[]>([]);
  const [cityOptions, setCityOptions] = useState<{value: string, label: string}[]>([]);
  const [pendingStateName, setPendingStateName] = useState('');
  const [pendingCityName, setPendingCityName] = useState('');
  
  const [stateOption, setStateOption] = useState<{value: string, label: string} | null>(null);
  const [cityOption, setCityOption] = useState<{value: string, label: string} | null>(null);
  
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  const [vehicleTypes, setVehicleTypes] = useState<{value: string, label: string}[]>([
    {value: 'Bike', label: 'Bike'},
    {value: 'Car', label: 'Car'},
    {value: 'Scooter', label: 'Scooter'}
  ]);
  const [serviceTypes, setServiceTypes] = useState<{value: string, label: string}[]>([
    {value: 'Puncture Repair', label: 'Puncture Repair'},
    {value: 'Battery Jumpstart', label: 'Battery Jumpstart'},
    {value: 'Jump Start', label: 'Jump Start'},
    {value: 'Emergency Breakdown', label: 'Emergency Breakdown'},
    {value: 'Tyre Replacement', label: 'Tyre Replacement'},
    {value: 'General Service', label: 'General Service'},
  ]);
  
  const [operatingDays, setOperatingDays] = useState<string[]>(DAYS_OF_WEEK);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('21:00');
  const [telephones, setTelephones] = useState(['']);
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    const loadCities = async () => {
      if (!stateOption) {
        setCityOptions([]);
        return;
      }

      if (stateOption.value.length !== 2) {
        setCityOptions(
          pendingCityName
            ? [{ value: pendingCityName, label: pendingCityName }]
            : []
        );
        return;
      }

      try {
        setCityOptions(
          City.getCitiesOfState('IN', stateOption.value).map((city) => ({
            value: city.name,
            label: city.name
          }))
        );
      } catch (err) {
        console.error('Failed to load city data', err);
        setCityOptions([]);
      }
    };

    loadCities();
  }, [stateOption]);

  useEffect(() => {
    if (!pendingStateName || stateOptions.length === 0) return;

    const normalizedPendingState = normalizeLocationText(pendingStateName);
    const matchedState = stateOptions.find((state) =>
      normalizeLocationText(state.label) === normalizedPendingState ||
      normalizeLocationText(state.value) === normalizedPendingState
    );
    if (matchedState) {
      setStateOption(matchedState);
      return;
    }

    setStateOption({ value: pendingStateName, label: pendingStateName });
  }, [pendingStateName, stateOptions]);

  useEffect(() => {
    if (!pendingCityName) return;

    if (cityOptions.length === 0) {
      setCityOption({ value: pendingCityName, label: pendingCityName });
      return;
    }

    const normalizedPendingCity = normalizeLocationText(pendingCityName);
    const matchedCity = cityOptions.find((city) =>
      normalizeLocationText(city.value) === normalizedPendingCity ||
      normalizeLocationText(city.label) === normalizedPendingCity
    );
    if (matchedCity) {
      setCityOption(matchedCity);
      return;
    }

    setCityOption({ value: pendingCityName, label: pendingCityName });
  }, [pendingCityName, cityOptions]);

  const populateForm = (data: any) => {
    setMechanicType(data.mechanicType || 'Workshop / Garage');
    setBusinessName(data.businessName || data.name || '');
    setMechanicName(data.mechanicName || '');
    setLandmark(data.landmark || '');
    setServiceRadius(data.serviceRadius || '');
    setEvSupport(data.evSupport || false);
    setHomeService(data.homeService || false);
    setRoadsideAssistance(data.roadsideAssistance || false);
    setIs24Hours(data.is24Hours || false);
    setHolidayWorking(data.holidayWorking || false);
    setDescription(data.description || '');
    setImageUrl(data.image || '');
    setWebsiteUrl(data.websiteUrl || '');
    let phonesData = data.phone || [];
    if (typeof phonesData === 'string') try { phonesData = JSON.parse(phonesData); } catch(e) { phonesData = []; }
    const mobilePhones = Array.isArray(phonesData) ? phonesData.filter((p: any) => !p.isTelephone) : [];
    const telPhones = Array.isArray(phonesData) ? phonesData.filter((p: any) => p.isTelephone) : [];
    setPhones(mobilePhones.length ? mobilePhones : [{ number: '', isWhatsapp: false }]);
    setTelephones(telPhones.length ? telPhones.map((t: any) => t.number) : ['']);
    
    let emailsData = data.emails || [];
    if (typeof emailsData === 'string') try { emailsData = JSON.parse(emailsData); } catch(e) { emailsData = []; }
    setEmails(Array.isArray(emailsData) && emailsData.length ? emailsData : ['']);
    setAddress(data.address || '');
    setPincode(data.pincode || '');
    
    const lat = data.latitude?.toString() || '';
    const lng = data.longitude?.toString() || '';
    setLatitude(lat);
    setLongitude(lng);
    if (lat && lng) {
      setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
    }
    
    // Reconstruct vehicle/service types
    let vTypes = data.vehicleTypes || [];
    if (typeof vTypes === 'string') try { vTypes = JSON.parse(vTypes); } catch(e) { vTypes = []; }
    setVehicleTypes(Array.isArray(vTypes) ? vTypes.map((v: any) => ({ value: String(v), label: String(v) })) : []);
    
    let sTypes = data.serviceTypes || [];
    if (typeof sTypes === 'string') try { sTypes = JSON.parse(sTypes); } catch(e) { sTypes = []; }
    setServiceTypes(Array.isArray(sTypes) ? sTypes.map((s: any) => ({ value: String(s), label: String(s) })) : []);
    
    let opDays = data.operatingDays || [];
    if (typeof opDays === 'string') {
      try { 
        opDays = JSON.parse(opDays); 
      } catch(e) { 
        opDays = opDays.split(',').map((s: string) => s.trim()); 
      }
    }
    setOperatingDays(Array.isArray(opDays) ? opDays.map((d: string) => {
      // Normalize day name to match DAYS_OF_WEEK exactly
      const normalized = String(d).trim();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    }) : []);
    
    if (data.operatingHours && typeof data.operatingHours === 'string') {
      const [sTime, eTime] = data.operatingHours.split(/\s*-\s*/);
      if (sTime) setStartTime(sTime.trim());
      if (eTime) setEndTime(eTime.trim());
    }
    
    setAvailability(data.availability !== undefined ? data.availability : true);
    
    // Explicitly set state option immediately to ensure it displays even before options load
    if (data.state) {
      if (stateOptions.length > 0) {
        const normalizedPendingState = normalizeLocationText(data.state);
        const matchedState = stateOptions.find((state) =>
          normalizeLocationText(state.label) === normalizedPendingState ||
          normalizeLocationText(state.value) === normalizedPendingState
        );
        setStateOption(matchedState || { value: data.state, label: data.state });
      } else {
        setStateOption({ value: data.state, label: data.state });
      }
    } else {
      setStateOption(null);
    }
    
    if (data.city) {
      setCityOption({ value: data.city, label: data.city });
    } else {
      setCityOption(null);
    }
    
    setPendingStateName(data.state || '');
    setPendingCityName(data.city || '');
  };

  useEffect(() => {
    if (initialData) {
      try {
        populateForm(initialData);
      } catch (e) {
        console.error('Error populating form with initialData:', e);
      }
      setIsFetching(false);
    } else if (isEdit && id) {
      const fetchMechanic = async () => {
        try {
          const data = await apiClient<any>(`/admin/mechanics/${id}`);
          console.log('Fetched mechanic data:', data);
          populateForm(data);
          console.log('Successfully populated form');
        } catch (err) {
          console.error('Error in fetchMechanic or populateForm:', err);
          toast.error('Failed to load mechanic data');
        } finally {
          setIsFetching(false);
        }
      };
      fetchMechanic();
    } else {
      setIsFetching(false);
    }
  }, [id, isEdit, initialData]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    if (!businessName) newErrors.businessName = 'Business Name is required';
    
    const hasValidPhone = phones.some(p => p.number && p.number.length >= 5);
    const hasValidTel = telephones.some(t => t && t.length >= 5);
    if (!hasValidPhone && !hasValidTel) newErrors.phones = 'Either Phone Number or Tel Number is required';
    
    if (!address) newErrors.address = 'Street Address is required';
    if (!landmark) newErrors.landmark = 'Landmark is required';
    if (!stateOption) newErrors.stateOption = 'State is required';
    if (!cityOption) newErrors.cityOption = 'City is required';
    
    if (!googleMapsUrl) newErrors.googleMapsUrl = 'Google Maps URL is required';
    if (!latitude || !longitude) newErrors.coordinates = 'Coordinates are required';
    
    if (vehicleTypes.length === 0) newErrors.vehicleTypes = 'At least one supported vehicle is required';
    if (serviceTypes.length === 0) newErrors.serviceTypes = 'At least one service is required';
    if (operatingDays.length === 0) newErrors.operatingDays = 'Select at least one operating day';
    if (!is24Hours && (!startTime || !endTime)) newErrors.operatingHours = 'Operating hours are required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMapsUrlParse = (url: string) => {
    setGoogleMapsUrl(url);
    // Parse google maps URL for @lat,lng
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match && match.length >= 3) {
      setLatitude(match[1]);
      setLongitude(match[2]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = validate();
    if (!isValid) {
      toast.error('Please fix the highlighted errors before saving');
      window.scrollTo(0, 0);
      return;
    }
    
    setLoading(true);
    
    try {
      const cleanString = (val: string) => val.trim() === '' ? undefined : val.trim();
      
      const finalPhones = phones.filter(p => p.number && p.number.trim() !== '');
      telephones.forEach(tel => {
        if (tel.trim() !== '') {
          finalPhones.push({ number: tel.trim(), isWhatsapp: false, isTelephone: true } as any);
        }
      });
      
      const payload = {
        mechanicType,
        name: businessName, // Legacy fallback
        businessName,
        mechanicName: cleanString(mechanicName),
        description: cleanString(description),
        image: cleanString(imageUrl),
        websiteUrl: cleanString(websiteUrl),
        phone: finalPhones,
        emails: emails.filter(e => e.trim() !== ''),
        address,
        landmark: cleanString(landmark),
        pincode: cleanString(pincode),
        city: cityOption?.value || '',
        state: stateOption?.label || '',
        country: 'India',
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        serviceRadius: serviceRadius ? parseFloat(serviceRadius.toString()) : null,
        vehicleTypes: vehicleTypes.map(v => v.value),
        serviceTypes: serviceTypes.map(s => s.value),
        evSupport,
        homeService,
        roadsideAssistance,
        is24Hours,
        holidayWorking,
        operatingDays,
        operatingHours: is24Hours ? '00:00 - 23:59' : `${startTime} - ${endTime}`,
        availability
      };

      if (onSubmitOverride) {
        await Promise.resolve(onSubmitOverride(payload));
        return;
      }

      const response = await apiClient<any>(isEdit ? `/admin/mechanics/${id}` : '/admin/mechanics', {
        method: isEdit ? 'PUT' : 'POST',
        data: payload
      });

      toast(response.message || (isEdit ? 'Update request submitted' : 'Mechanic created successfully'));
      navigate('/admin/mechanics');
    } catch (err) {
      setErrors({ global: err instanceof Error ? err.message : 'An error occurred while saving' });
      toast.error(err instanceof Error ? err.message : 'An error occurred while saving');
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded md:col-span-2"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
          <div className="h-32 bg-muted rounded mt-6"></div>
          <div className="h-12 bg-muted rounded mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`mx-auto w-full pb-12 ${isModal ? '' : 'max-w-4xl'}`}>
      {!isModal && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Wrench className="text-primary" size={32} />
            {isEdit ? 'Edit Mechanic' : 'Add New Mechanic'}
          </h2>
          <button 
            type="button"
            onClick={onCancelOverride || (() => navigate('/admin/mechanics'))}
            className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors font-medium"
          >
            <X size={20} />
            Cancel
          </button>
        </div>
      )}

      {errors.global && <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200">{errors.global}</div>}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <User className="text-primary" size={24} /> Basic Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-3">Mechanic Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Individual Mechanic', 'Workshop / Garage', 'Authorized Service Center', 
                    'Mobile Mechanic', 'Towing Company', 'Fuel Delivery Partner'
                  ].map(type => (
                    <label key={type} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${mechanicType === type ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary/50'}`}>
                      <input 
                        type="radio" 
                        name="mechanicType" 
                        value={type} 
                        checked={mechanicType === type}
                        onChange={e => setMechanicType(e.target.value)}
                        className="accent-primary w-4 h-4"
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Business Name <span className="text-red-500">*</span></label>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Raju Auto Works" className={`w-full p-2 rounded border bg-background focus:border-primary outline-none ${errors.businessName ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`} />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium mb-1">Mechanic Name</label>
                <input type="text" value={mechanicName} onChange={e => setMechanicName(e.target.value)} placeholder="e.g. Raju Bhai" className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Info size={16}/> Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none min-h-[100px]"
                  placeholder="Describe the mechanic shop or services offered..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Image size={16}/> Image URL</label>
                <input type="url" placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1"><Globe size={16}/> Website URL</label>
                <input type="url" placeholder="https://..." value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
              </div>
            </div>

            {/* Phones */}
            <div className="pt-2 border-t border-border mt-4">
              <label className="block text-sm font-medium mb-2">Phone Numbers <span className="text-red-500 font-normal text-xs ml-1">(At least one Phone or Tel Number required) *</span></label>
              {phones.map((phone, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className={`flex items-center rounded bg-muted/30 w-full sm:w-auto overflow-hidden border ${errors.phones ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`}>
                    <span className="px-3 text-muted-foreground border-r border-border">+91</span>
                    <input 
                      type="text" 
                      placeholder="10-digit number"
                      maxLength={10}
                      value={phone.number} 
                      onChange={e => {
                        const newPhones = [...phones];
                        newPhones[idx].number = e.target.value.replace(/\D/g, '');
                        setPhones(newPhones);
                      }} 
                      className="p-2 bg-transparent outline-none flex-1 min-w-[150px]" 
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap bg-muted/20 px-3 rounded border border-border">
                    <input 
                      type="checkbox" 
                      className="accent-primary"
                      checked={phone.isWhatsapp} 
                      onChange={e => {
                        const newPhones = [...phones];
                        newPhones[idx].isWhatsapp = e.target.checked;
                        setPhones(newPhones);
                      }} 
                    />
                    WhatsApp Available
                  </label>
                  {phones.length > 1 && (
                    <button type="button" onClick={() => setPhones(phones.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-3 rounded ml-auto sm:ml-0 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              {errors.phones && <p className="text-red-500 text-xs mt-1">{errors.phones}</p>}
              <button type="button" onClick={() => setPhones([...phones, { number: '', isWhatsapp: false }])} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-1">
                <Plus size={16} /> Add Another Phone
              </button>
            </div>

            {/* Tel Number */}
            <div className="pt-2">
              <label className="block text-sm font-medium mb-1">Tel Numbers</label>
              {telephones.map((tel, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className={`flex items-center rounded bg-muted/30 overflow-hidden w-full sm:w-auto flex-1 border ${errors.phones ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`}>
                    <input 
                      type="text" 
                      value={tel} 
                      onChange={e => {
                        const newTels = [...telephones];
                        newTels[idx] = e.target.value.replace(/\D/g, '');
                        setTelephones(newTels);
                      }} 
                      placeholder="e.g. 9104422223333" 
                      className="flex-1 p-2 bg-transparent outline-none" 
                      maxLength={15}
                    />
                  </div>
                  {telephones.length > 1 && (
                    <button type="button" onClick={() => setTelephones(telephones.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-3 rounded sm:ml-0 transition-colors py-2 border border-border sm:border-none">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setTelephones([...telephones, ''])} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-1">
                <Plus size={16} /> Add Another Tel Number
              </button>
            </div>

            {/* Emails */}
            <div className="pt-2">
              <label className="block text-sm font-medium mb-1">Email Addresses</label>
              {emails.map((email, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input 
                    type="email" 
                    placeholder="example@mail.com"
                    value={email} 
                    onChange={e => {
                      const newEmails = [...emails];
                      newEmails[idx] = e.target.value;
                      setEmails(newEmails);
                    }} 
                    className="flex-1 p-2 rounded border border-border bg-background outline-none focus:border-primary" 
                  />
                  {emails.length > 1 && (
                    <button type="button" onClick={() => setEmails(emails.filter((_, i) => i !== idx))} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-3 rounded transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEmails([...emails, ''])} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-1">
                <Plus size={16} /> Add Another Email
              </button>
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <MapPin className="text-primary" size={24} /> Location Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Street Address <span className="text-red-500">*</span></label>
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className={`w-full p-2 rounded border bg-background focus:border-primary outline-none ${errors.address ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`} />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Landmark <span className="text-red-500">*</span></label>
              <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} className={`w-full p-2 rounded border bg-background focus:border-primary outline-none ${errors.landmark ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`} placeholder="e.g. Near City Mall" />
              {errors.landmark && <p className="text-red-500 text-xs mt-1">{errors.landmark}</p>}
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input type="text" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, ''))} maxLength={6} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" value="India" disabled className="w-full p-2 rounded border border-border bg-muted text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
              <Select 
                options={stateOptions}
                value={stateOption}
                onChange={(option) => {
                  setStateOption(option as any);
                  setPendingCityName('');
                  setCityOption(null); // Reset city when state changes
                }}
                isClearable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Search and select state..."
                styles={getSelectStyles(Boolean(errors.stateOption))}
              />
              {errors.stateOption && <p className="text-red-500 text-xs mt-1">{errors.stateOption}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
              <Select 
                options={cityOptions}
                value={cityOption}
                onChange={(option) => setCityOption(option as any)}
                isDisabled={!stateOption}
                isClearable={true}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Search and select city..."
                styles={getSelectStyles(Boolean(errors.cityOption))}
              />
              {errors.cityOption && <p className="text-red-500 text-xs mt-1">{errors.cityOption}</p>}
            </div>
            
            {/* Map Link */}
            <div className="md:col-span-2 pt-4 border-t border-border mt-2">
              <label className="block text-sm font-medium mb-1 flex items-center gap-1 text-primary">
                <Map size={16} /> Google Maps URL (Auto-fills Coordinates) <span className="text-red-500">*</span>
              </label>
              <input 
                type="url" 
                placeholder="Paste Google Maps link here to auto-fill latitude and longitude..." 
                value={googleMapsUrl} 
                onChange={e => handleMapsUrlParse(e.target.value)} 
                className={`w-full p-2 rounded border bg-background focus:border-primary outline-none shadow-inner ${errors.googleMapsUrl ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`} 
              />
              {errors.googleMapsUrl && <p className="text-red-500 text-xs mt-1">{errors.googleMapsUrl}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
              <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} className={`w-full p-2 rounded border bg-background focus:border-primary outline-none ${errors.coordinates ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-500">*</span></label>
              <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} className={`w-full p-2 rounded border bg-background focus:border-primary outline-none ${errors.coordinates ? 'border-red-500 ring-1 ring-red-500' : 'border-border'}`} />
            </div>
            {errors.coordinates && <p className="text-red-500 text-xs md:col-span-2 -mt-2">{errors.coordinates}</p>}
          </div>
        </div>

        {/* Services & Vehicles */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <Wrench className="text-primary" size={24} /> Technical Capabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supported Vehicles <span className="text-red-500">*</span></label>
                  <Select
                    isMulti
                    name="vehicleTypes"
                    options={vehicleOptions}
                    className="basic-multi-select text-sm"
                    value={vehicleTypes}
                    onChange={(newValue) => setVehicleTypes(newValue as any)}
                    placeholder="Select or type to create new..."
                    classNamePrefix="react-select"
                    styles={getSelectStyles(Boolean(errors.vehicleTypes))}
                  />
                  {errors.vehicleTypes && <p className="text-red-500 text-xs mt-1">{errors.vehicleTypes}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Services Provided <span className="text-red-500">*</span></label>
                  <Select
                    isMulti
                    name="serviceTypes"
                    options={serviceOptions}
                    className="basic-multi-select text-sm"
                    value={serviceTypes}
                    onChange={(newValue) => setServiceTypes(newValue as any)}
                    placeholder="Select or type to create new..."
                    classNamePrefix="react-select"
                    styles={getSelectStyles(Boolean(errors.serviceTypes))}
                  />
                  {errors.serviceTypes && <p className="text-red-500 text-xs mt-1">{errors.serviceTypes}</p>}
              </div>
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium mb-1">Service Radius (km)</label>
              <select value={serviceRadius} onChange={e => setServiceRadius(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none">
                <option value="">Not Specified</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
              </select>
            </div>

            <div className="md:col-span-1 flex flex-col justify-center gap-3 mt-2 md:mt-0">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={evSupport} onChange={e => setEvSupport(e.target.checked)} className="accent-primary w-4 h-4" />
                Electric Vehicle (EV) Service
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={homeService} onChange={e => setHomeService(e.target.checked)} className="accent-primary w-4 h-4" />
                Home Service Available
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={roadsideAssistance} onChange={e => setRoadsideAssistance(e.target.checked)} className="accent-primary w-4 h-4" />
                24x7 Roadside Assistance
              </label>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <CalendarClock className="text-primary" size={24} /> Availability Schedule
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Operating Days <span className="text-red-500">*</span></label>
              <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition-colors ${errors.operatingDays ? 'border border-red-500 bg-red-50 dark:bg-red-950/30 ring-1 ring-red-500' : ''}`}>
                {DAYS_OF_WEEK.map(day => (
                  <label key={day} className={`px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                    operatingDays.includes(day) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:bg-secondary'
                  }`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={operatingDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) setOperatingDays([...operatingDays, day]);
                        else setOperatingDays(operatingDays.filter(d => d !== day));
                      }}
                    />
                {day.substring(0, 3)}
                  </label>
                ))}
              </div>
              {errors.operatingDays && <p className="text-red-500 text-xs mt-2">{errors.operatingDays}</p>}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6">
              {!is24Hours && (
                <div className="flex gap-4 items-center flex-1">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Opening Time <span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      required={!is24Hours}
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className={`w-full p-2 rounded border bg-background focus:border-primary outline-none dark:[&::-webkit-calendar-picker-indicator]:invert ${errors.operatingHours ? 'border-red-500 ring-1 ring-red-500 bg-red-50/50 dark:bg-red-950/30' : 'border-border'}`}
                    />
                  </div>
                  <span className="text-muted-foreground mt-5">to</span>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">Closing Time <span className="text-red-500">*</span></label>
                    <input
                      type="time"
                      required={!is24Hours}
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className={`w-full p-2 rounded border bg-background focus:border-primary outline-none dark:[&::-webkit-calendar-picker-indicator]:invert ${errors.operatingHours ? 'border-red-500 ring-1 ring-red-500 bg-red-50/50 dark:bg-red-950/30' : 'border-border'}`}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex flex-col justify-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={is24Hours} onChange={e => setIs24Hours(e.target.checked)} className="accent-primary w-4 h-4" />
                  Open 24 Hours
                </label>
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={holidayWorking} onChange={e => setHolidayWorking(e.target.checked)} className="accent-primary w-4 h-4" />
                  Holiday Working
                </label>
              </div>
            </div>
            
            <div className="pt-2">
              {errors.operatingHours && <p className="text-red-500 text-xs mb-3">{errors.operatingHours}</p>}
              <label className="flex items-center gap-3 text-foreground cursor-pointer font-medium p-4 bg-muted/20 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                <input 
                  type="checkbox" 
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                  className="w-5 h-5 accent-primary"
                />
                Currently Available & Active
              </label>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-md transition-transform active:scale-[0.99]"
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
          {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update Mechanic Details' : 'Save Mechanic Details')}
        </button>

      </form>
    </div>
  );
}
