import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { User, Phone, MapPin, Wrench, CalendarClock, Plus, Trash2, Save, X, Info, Image, Globe, Map } from 'lucide-react';
import { State, City } from 'country-state-city';
import { API_URL } from '../api/apiClient';

const INDIAN_STATES = State.getStatesOfCountry('IN').map(s => ({ value: s.isoCode, label: s.name }));

const DEFAULT_VEHICLES = [
  { value: 'Two-Wheeler / Bike', label: 'Two-Wheeler / Bike' },
  { value: 'Three-Wheeler / Auto', label: 'Three-Wheeler / Auto' },
  { value: 'Four-Wheeler / Car', label: 'Four-Wheeler / Car' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Bus', label: 'Bus' },
  { value: 'Tractor', label: 'Tractor' },
  { value: 'JCB', label: 'JCB' }
];

const DEFAULT_SERVICES = [
  { value: 'Puncture Repair', label: 'Puncture Repair' },
  { value: 'Battery Jumpstart', label: 'Battery Jumpstart' },
  { value: 'Engine Diagnostics', label: 'Engine Diagnostics' },
  { value: 'Towing Services', label: 'Towing Services' },
  { value: 'Fuel Delivery', label: 'Fuel Delivery' },
  { value: 'Accident Recovery', label: 'Accident Recovery' }
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MechanicForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [phones, setPhones] = useState([{ number: '', isWhatsapp: false }]);
  const [emails, setEmails] = useState(['']);
  
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  
  const [stateOption, setStateOption] = useState<{value: string, label: string} | null>(null);
  const [cityOption, setCityOption] = useState<{value: string, label: string} | null>(null);
  
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  const [vehicleTypes, setVehicleTypes] = useState<{value: string, label: string}[]>([]);
  const [serviceTypes, setServiceTypes] = useState<{value: string, label: string}[]>([]);
  
  const [operatingDays, setOperatingDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    if (isEdit) {
      const fetchMechanic = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_URL}/admin/mechanics/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setName(data.name || '');
            setDescription(data.description || '');
            setImageUrl(data.image || '');
            setWebsiteUrl(data.websiteUrl || '');
            setPhones(data.phone || [{ number: '', isWhatsapp: false }]);
            setEmails(data.emails?.length ? data.emails : ['']);
            setAddress(data.address || '');
            setArea(data.area || '');
            setLatitude(data.latitude?.toString() || '');
            setLongitude(data.longitude?.toString() || '');
            
            // Reconstruct vehicle/service types
            setVehicleTypes(data.vehicleTypes?.map((v: string) => ({ value: v, label: v })) || []);
            setServiceTypes(data.serviceTypes?.map((s: string) => ({ value: s, label: s })) || []);
            setOperatingDays(data.operatingDays || []);
            
            if (data.operatingHours) {
              const [sTime, eTime] = data.operatingHours.split(' - ');
              if (sTime) setStartTime(sTime);
              if (eTime) setEndTime(eTime);
            }
            
            setAvailability(data.availability);
            
            // For state and city, we have the state label stored. Need to find ISO code for react-select value
            const stateObj = State.getStatesOfCountry('IN').find(s => s.name === data.state);
            if (stateObj) {
              setStateOption({ value: stateObj.isoCode, label: stateObj.name });
              setCityOption({ value: data.city, label: data.city });
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchMechanic();
    }
  }, [id, isEdit]);

  const validate = () => {
    if (!name) return 'Name is required';
    if (phones.some(p => !p.number)) return 'All phone fields must be filled or removed';
    if (!address || !area || !stateOption || !cityOption) return 'Complete address is required';
    if (!latitude || !longitude) return 'Coordinates are required';
    if (vehicleTypes.length === 0) return 'At least one supported vehicle is required';
    if (serviceTypes.length === 0) return 'At least one service is required';
    if (operatingDays.length === 0) return 'Select at least one operating day';
    return null;
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
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      window.scrollTo(0, 0);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const url = isEdit 
        ? `${API_URL}/admin/mechanics/${id}`
        : `${API_URL}/admin/mechanics`;
      
      const payload = {
        name,
        description,
        image: imageUrl,
        websiteUrl,
        phone: phones,
        emails: emails.filter(e => e.trim() !== ''),
        vehicleTypes: vehicleTypes.map(v => v.value),
        serviceTypes: serviceTypes.map(s => s.value),
        address,
        area,
        city: cityOption?.value,
        state: stateOption?.label,
        country: 'India',
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        operatingDays,
        operatingHours: `${startTime} - ${endTime}`,
        availability
      };

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast(isEdit ? 'Update request submitted' : 'Mechanic created successfully');
        navigate('/admin/mechanics');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to save mechanic');
        window.scrollTo(0, 0);
      }
    } catch (err) {
      setError('An error occurred while saving');
      window.scrollTo(0, 0);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full pb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Wrench className="text-primary" size={32} />
          {isEdit ? 'Edit Mechanic' : 'Add New Mechanic'}
        </h2>
        <button 
          onClick={() => navigate('/admin/mechanics')}
          className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary transition-colors font-medium"
        >
          <X size={20} />
          Cancel
        </button>
      </div>

      {error && <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-lg shadow-sm border border-red-200">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <User className="text-primary" size={24} /> Basic Information
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Business / Mechanic Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
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
              <label className="block text-sm font-medium mb-2">Phone Numbers <span className="text-red-500">*</span></label>
              {phones.map((phone, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
                  <div className="flex items-center border border-border rounded bg-muted/30 w-full sm:w-auto overflow-hidden">
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
              <button type="button" onClick={() => setPhones([...phones, { number: '', isWhatsapp: false }])} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline mt-1">
                <Plus size={16} /> Add Another Phone
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
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Area / Locality <span className="text-red-500">*</span></label>
              <input type="text" value={area} onChange={e => setArea(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" value="India" disabled className="w-full p-2 rounded border border-border bg-muted text-muted-foreground cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State <span className="text-red-500">*</span></label>
              <Select 
                options={INDIAN_STATES}
                value={stateOption}
                onChange={(option) => {
                  setStateOption(option as any);
                  setCityOption(null); // Reset city when state changes
                }}
                className="react-select-container text-black"
                classNamePrefix="react-select"
                placeholder="Search and select state..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City <span className="text-red-500">*</span></label>
              <Select 
                options={stateOption ? City.getCitiesOfState('IN', stateOption.value).map(c => ({ value: c.name, label: c.name })) : []}
                value={cityOption}
                onChange={(option) => setCityOption(option as any)}
                isDisabled={!stateOption}
                className="react-select-container text-black"
                classNamePrefix="react-select"
                placeholder="Search and select city..."
              />
            </div>
            
            {/* Map Link */}
            <div className="md:col-span-2 pt-4 border-t border-border mt-2">
              <label className="block text-sm font-medium mb-1 flex items-center gap-1 text-primary">
                <Map size={16} /> Google Maps URL (Auto-fills Coordinates)
              </label>
              <input 
                type="url" 
                placeholder="Paste Google Maps link here to auto-fill latitude and longitude..." 
                value={googleMapsUrl} 
                onChange={e => handleMapsUrlParse(e.target.value)} 
                className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none shadow-inner" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Latitude <span className="text-red-500">*</span></label>
              <input type="text" value={latitude} onChange={e => setLatitude(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude <span className="text-red-500">*</span></label>
              <input type="text" value={longitude} onChange={e => setLongitude(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
            </div>
          </div>
        </div>

        {/* Services & Vehicles */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 border-b border-border pb-2">
            <Wrench className="text-primary" size={24} /> Technical Capabilities
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Supported Vehicles <span className="text-red-500">*</span></label>
              <CreatableSelect
                isMulti
                options={DEFAULT_VEHICLES}
                value={vehicleTypes}
                onChange={(newValue) => setVehicleTypes(newValue as any)}
                placeholder="Select or type to create new..."
                className="react-select-container text-black"
                classNamePrefix="react-select"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Services Provided <span className="text-red-500">*</span></label>
              <CreatableSelect
                isMulti
                options={DEFAULT_SERVICES}
                value={serviceTypes}
                onChange={(newValue) => setServiceTypes(newValue as any)}
                placeholder="Select or type to create new..."
                className="react-select-container text-black"
                classNamePrefix="react-select"
              />
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
              <div className="flex flex-wrap gap-2">
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
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 rounded border border-border bg-background focus:border-primary outline-none" />
              </div>
            </div>
            
            <div className="pt-2">
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
          <Save size={24} />
          {loading ? 'Saving...' : 'Save Mechanic Details'}
        </button>

      </form>
    </div>
  );
}
