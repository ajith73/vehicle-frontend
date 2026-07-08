import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CalendarClock,
  Globe,
  Image,
  Info,
  Map,
  MapPin,
  Plus,
  Save,
  Search,
  Trash2,
  User,
  Wrench,
  X
} from 'lucide-react';
import { apiClient } from '../api/apiClient';
import { submitMechanicRegistration } from '../api/mechanics';
import type { Mechanic } from '../types';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type SelectOption = { value: string; label: string };
type PhoneEntry = { number: string; isWhatsapp: boolean };
type FormMode = 'pick' | 'form';

type FormState = {
  mechanicType: string;
  businessName: string;
  mechanicName: string;
  landmark: string;
  serviceRadius: number | '';
  evSupport: boolean;
  homeService: boolean;
  roadsideAssistance: boolean;
  is24Hours: boolean;
  holidayWorking: boolean;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  phones: PhoneEntry[];
  emails: string[];
  address: string;
  area: string;
  stateOption: SelectOption | null;
  cityOption: SelectOption | null;
  googleMapsUrl: string;
  latitude: string;
  longitude: string;
  vehicleTypes: SelectOption[];
  serviceTypes: SelectOption[];
  operatingDays: string[];
  startTime: string;
  endTime: string;
  telephone: string;
  availability: boolean;
};

const defaultFormState = (): FormState => ({
  mechanicType: 'Workshop / Garage',
  businessName: '',
  mechanicName: '',
  landmark: '',
  serviceRadius: '',
  evSupport: false,
  homeService: false,
  roadsideAssistance: false,
  is24Hours: false,
  holidayWorking: false,
  description: '',
  imageUrl: '',
  websiteUrl: '',
  phones: [{ number: '', isWhatsapp: false }],
  emails: [''],
  address: '',
  area: '',
  stateOption: null,
  cityOption: null,
  googleMapsUrl: '',
  latitude: '',
  longitude: '',
  vehicleTypes: [],
  serviceTypes: [],
  operatingDays: [...DAYS_OF_WEEK],
  startTime: '09:00',
  endTime: '21:00',
  telephone: '',
  availability: true
});

const toOptionList = (items: any[] = []) => items.map((item) => ({ value: item.name, label: item.name }));

const normalizeMechanic = (mechanic: Mechanic | null): FormState => {
  if (!mechanic) return defaultFormState();

  const phonesData = Array.isArray(mechanic.phone) ? mechanic.phone : [];
  const mobilePhones = phonesData.filter((phone: any) => !phone?.isTelephone);
  const telPhone = phonesData.find((phone: any) => phone?.isTelephone);
  const operatingHours = mechanic.operatingHours || '';
  const [startTime = '09:00', endTime = '21:00'] = operatingHours.split(' - ');

  return {
    mechanicType: mechanic.mechanicType || 'Workshop / Garage',
    businessName: mechanic.businessName || mechanic.name || '',
    mechanicName: mechanic.mechanicName || '',
    landmark: mechanic.landmark || '',
    serviceRadius: mechanic.serviceRadius ?? '',
    evSupport: Boolean(mechanic.evSupport),
    homeService: Boolean(mechanic.homeService),
    roadsideAssistance: Boolean(mechanic.roadsideAssistance),
    is24Hours: Boolean(mechanic.is24Hours),
    holidayWorking: Boolean(mechanic.holidayWorking),
    description: mechanic.description || '',
    imageUrl: mechanic.image || mechanic.imageUrl || '',
    websiteUrl: mechanic.websiteUrl || '',
    phones: mobilePhones.length > 0
      ? mobilePhones.map((phone: any) => ({
          number: phone.number || '',
          isWhatsapp: Boolean(phone.isWhatsapp)
        }))
      : [{ number: '', isWhatsapp: false }],
    emails: Array.isArray(mechanic.emails) && mechanic.emails.length > 0 ? mechanic.emails : [''],
    address: mechanic.address || '',
    area: mechanic.area || '',
    stateOption: mechanic.state ? { value: mechanic.state, label: mechanic.state } : null,
    cityOption: mechanic.city ? { value: mechanic.city, label: mechanic.city } : null,
    googleMapsUrl: '',
    latitude: mechanic.latitude ? String(mechanic.latitude) : '',
    longitude: mechanic.longitude ? String(mechanic.longitude) : '',
    vehicleTypes: Array.isArray(mechanic.vehicleTypes) ? mechanic.vehicleTypes.map((value) => ({ value, label: value })) : [],
    serviceTypes: Array.isArray(mechanic.serviceTypes) ? mechanic.serviceTypes.map((value) => ({ value, label: value })) : [],
    operatingDays: Array.isArray(mechanic.operatingDays) && mechanic.operatingDays.length > 0 ? mechanic.operatingDays : [...DAYS_OF_WEEK],
    startTime,
    endTime,
    telephone: telPhone?.number || '',
    availability: mechanic.availability !== false
  };
};

const buildPayload = (form: FormState) => {
  const finalPhones = form.phones
    .filter((phone) => phone.number.trim() !== '')
    .map((phone) => ({
      number: phone.number.trim(),
      isWhatsapp: phone.isWhatsapp
    }));

  if (form.telephone.trim() !== '') {
    finalPhones.push({
      number: form.telephone.trim(),
      isWhatsapp: false,
      isTelephone: true
    } as any);
  }

  return {
    mechanicType: form.mechanicType,
    name: form.businessName,
    businessName: form.businessName,
    mechanicName: form.mechanicName,
    description: form.description,
    image: form.imageUrl,
    websiteUrl: form.websiteUrl,
    phone: finalPhones,
    emails: form.emails.filter((email) => email.trim() !== ''),
    address: form.address,
    landmark: form.landmark,
    area: form.area,
    city: form.cityOption?.value || '',
    state: form.stateOption?.label || '',
    country: 'India',
    latitude: parseFloat(form.latitude),
    longitude: parseFloat(form.longitude),
    serviceRadius: form.serviceRadius === '' ? null : form.serviceRadius,
    vehicleTypes: form.vehicleTypes.map((vehicle) => vehicle.value),
    serviceTypes: form.serviceTypes.map((service) => service.value),
    evSupport: form.evSupport,
    homeService: form.homeService,
    roadsideAssistance: form.roadsideAssistance,
    is24Hours: form.is24Hours,
    holidayWorking: form.holidayWorking,
    operatingDays: form.operatingDays,
    operatingHours: form.is24Hours ? '00:00 - 23:59' : `${form.startTime} - ${form.endTime}`,
    availability: form.availability
  };
};

const validateForm = (form: FormState) => {
  if (!form.businessName.trim()) return 'Business name is required.';
  const hasValidPhone = form.phones.some((phone) => phone.number.trim().length >= 5);
  const hasValidTel = form.telephone.trim().length >= 5;
  if (!hasValidPhone && !hasValidTel) return 'Add at least one phone number or tel number.';
  if (!form.address.trim() || !form.area.trim() || !form.stateOption || !form.cityOption) {
    return 'Complete address, state, and city are required.';
  }
  if (!form.latitude.trim() || !form.longitude.trim()) return 'Latitude and longitude are required.';
  if (Number.isNaN(Number(form.latitude)) || Number.isNaN(Number(form.longitude))) {
    return 'Latitude and longitude must be valid numbers.';
  }
  if (form.vehicleTypes.length === 0) return 'Select at least one supported vehicle.';
  if (form.serviceTypes.length === 0) return 'Select at least one service.';
  if (form.operatingDays.length === 0) return 'Select at least one operating day.';
  if (!form.is24Hours && (!form.startTime || !form.endTime)) return 'Operating hours are required.';
  return null;
};

const searchSelectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 46,
    backgroundColor: 'var(--background)',
    borderColor: state.isFocused ? 'var(--primary)' : 'var(--border)',
    boxShadow: state.isFocused ? '0 0 0 2px color-mix(in srgb, var(--primary) 18%, transparent)' : 'none'
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'var(--card)',
    color: 'var(--foreground)',
    zIndex: 80
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'color-mix(in srgb, var(--primary) 12%, var(--card))' : 'var(--card)',
    color: 'var(--foreground)'
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'color-mix(in srgb, var(--primary) 12%, var(--secondary))'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'var(--foreground)'
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--foreground)'
  }),
  input: (base: any) => ({
    ...base,
    color: 'var(--foreground)'
  })
};

interface MechanicSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MechanicSubmissionModal({ isOpen, onClose }: MechanicSubmissionModalProps) {
  const [mode, setMode] = useState<FormMode>('pick');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Mechanic[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [vehicleOptions, setVehicleOptions] = useState<SelectOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
  const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const modalTitle = useMemo(
    () => (selectedMechanic ? 'Update your mechanic record' : 'Create a mechanic update request'),
    [selectedMechanic]
  );

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      try {
        const [vehicleData, serviceData] = await Promise.all([
          apiClient<any>('/public/vehicles'),
          apiClient<any>('/public/services')
        ]);
        setVehicleOptions(toOptionList(vehicleData));
        setServiceOptions(toOptionList(serviceData));
      } catch (loadError) {
        console.error('Failed to load mechanic submission options', loadError);
      }
    };

    const loadStates = async () => {
      try {
        const { default: State } = await import('country-state-city/lib/state');
        setStateOptions(
          State.getStatesOfCountry('IN').map((state) => ({
            value: state.isoCode,
            label: state.name
          }))
        );
      } catch (loadError) {
        console.error('Failed to load state data', loadError);
      }
    };

    loadOptions();
    loadStates();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const params = new URLSearchParams({ search: query.trim() });
        const results = await apiClient<Mechanic[]>(`/public/mechanics?${params.toString()}`);
        setSuggestions(results.slice(0, 6));
      } catch (loadError) {
        console.error('Failed to load mechanic suggestions', loadError);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, query]);

  useEffect(() => {
    const loadCities = async () => {
      if (!form.stateOption) {
        setCityOptions([]);
        return;
      }

      try {
        const { default: City } = await import('country-state-city/lib/city');
        const matchedState = stateOptions.find((option) => option.label === form.stateOption?.label);
        if (!matchedState?.value) {
          setCityOptions([]);
          return;
        }

        const options = City.getCitiesOfState('IN', matchedState.value).map((city) => ({
          value: city.name,
          label: city.name
        }));

        setCityOptions(options);
      } catch (loadError) {
        console.error('Failed to load city data', loadError);
        setCityOptions([]);
      }
    };

    loadCities();
  }, [form.stateOption, stateOptions]);

  useEffect(() => {
    if (!form.stateOption || !selectedMechanic?.city || cityOptions.length === 0) return;
    if (form.cityOption) return;

    const matchedCity = cityOptions.find((city) => city.value === selectedMechanic.city);
    if (matchedCity) {
      setForm((current) => ({ ...current, cityOption: matchedCity }));
    }
  }, [cityOptions, form.cityOption, form.stateOption, selectedMechanic]);

  useEffect(() => {
    if (!isOpen) {
      setMode('pick');
      setQuery('');
      setSuggestions([]);
      setSelectedMechanic(null);
      setForm(defaultFormState());
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleMapsUrlParse = (url: string) => {
    updateForm('googleMapsUrl', url);
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match && match.length >= 3) {
      updateForm('latitude', match[1]);
      updateForm('longitude', match[2]);
    }
  };

  const startNewRecord = () => {
    setSelectedMechanic(null);
    setForm(defaultFormState());
    setMode('form');
    setError('');
  };

  const startEditRecord = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setForm(normalizeMechanic(mechanic));
    setMode('form');
    setError('');
    setQuery(mechanic.businessName || mechanic.name || '');
    setSuggestions([]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitMechanicRegistration({
        ...buildPayload(form),
        existingMechanicId: selectedMechanic?.id
      });

      toast.success(selectedMechanic ? 'Update request sent to Super Admin' : 'New mechanic request sent to Super Admin');
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-background/80 backdrop-blur-sm">
      <div className="flex h-full w-full items-end justify-center sm:items-center sm:p-6">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-card shadow-2xl sm:h-[90vh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-lg font-black text-foreground sm:text-2xl">{mode === 'pick' ? 'Claim or create your mechanic listing' : modalTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === 'pick'
                  ? 'Search your workshop or mechanic name first. If you do not find it, create a new record request.'
                  : 'Review the details carefully. Your submission will go to the Super Admin for approval.'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {mode === 'pick' ? (
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-background/60 p-5 shadow-sm">
                <label className="mb-2 block text-sm font-bold text-foreground">Search existing mechanic or service provider</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Type workshop name, mechanic name, area, or city"
                    className="w-full rounded-2xl border border-border bg-card py-3 pl-12 pr-4 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {loadingSuggestions && (
                    <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
                      Searching existing listings...
                    </div>
                  )}

                  {!loadingSuggestions && suggestions.map((mechanic) => (
                    <button
                      key={mechanic.id}
                      onClick={() => startEditRecord(mechanic)}
                      className="flex w-full items-start justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{mechanic.businessName || mechanic.name}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {[mechanic.area, mechanic.city, mechanic.mechanicType].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Choose</span>
                    </button>
                  ))}

                  {!loadingSuggestions && query.trim().length >= 2 && suggestions.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-5 text-sm text-muted-foreground">
                      No matching approved record found. You can create a new mechanic/service provider request below.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm font-semibold text-foreground">Do not see your record?</p>
                  <p className="mt-1 text-sm text-muted-foreground">Create a new listing request and submit the full details for review.</p>
                  <button
                    onClick={startNewRecord}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    Create new record
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mx-auto max-w-4xl space-y-6 pb-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {selectedMechanic ? `Editing existing record: ${selectedMechanic.businessName || selectedMechanic.name}` : 'Creating a new mechanic record'}
                      </p>
                      <p className="text-xs text-muted-foreground">This request will be reviewed by the Super Admin before it goes live.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('pick')}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                      {error}
                    </div>
                  )}

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-foreground">
                      <User className="h-5 w-5 text-primary" />
                      Basic Information
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-3 block text-sm font-medium">Mechanic Type</label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {[
                            'Individual Mechanic',
                            'Workshop / Garage',
                            'Authorized Service Center',
                            'Mobile Mechanic',
                            'Towing Company',
                            'Fuel Delivery Partner'
                          ].map((type) => (
                            <label
                              key={type}
                              className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${
                                form.mechanicType === type
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:bg-secondary/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="mechanicType"
                                value={type}
                                checked={form.mechanicType === type}
                                onChange={(event) => updateForm('mechanicType', event.target.value)}
                                className="h-4 w-4 accent-primary"
                              />
                              <span className="font-medium">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">Business Name</label>
                        <input
                          value={form.businessName}
                          onChange={(event) => updateForm('businessName', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="e.g. Raju Auto Works"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Mechanic Name</label>
                        <input
                          value={form.mechanicName}
                          onChange={(event) => updateForm('mechanicName', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="e.g. Raju Bhai"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                          <Info className="h-4 w-4" />
                          Description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(event) => updateForm('description', event.target.value)}
                          className="min-h-[100px] w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="Describe the shop, services, strengths, or emergency support."
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                          <Image className="h-4 w-4" />
                          Image URL
                        </label>
                        <input
                          value={form.imageUrl}
                          onChange={(event) => updateForm('imageUrl', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium">
                          <Globe className="h-4 w-4" />
                          Website URL
                        </label>
                        <input
                          value={form.websiteUrl}
                          onChange={(event) => updateForm('websiteUrl', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="mt-5 border-t border-border pt-5">
                      <label className="mb-2 block text-sm font-medium">Phone Numbers</label>
                      {form.phones.map((phone, index) => (
                        <div key={index} className="mb-2 flex flex-col gap-2 sm:flex-row">
                          <div className="flex flex-1 items-center overflow-hidden rounded-xl border border-border bg-background">
                            <span className="border-r border-border px-3 text-muted-foreground">+91</span>
                            <input
                              value={phone.number}
                              onChange={(event) => {
                                const nextPhones = [...form.phones];
                                nextPhones[index] = { ...nextPhones[index], number: event.target.value.replace(/\D/g, '') };
                                updateForm('phones', nextPhones);
                              }}
                              className="min-w-0 flex-1 p-3 outline-none"
                              maxLength={10}
                              placeholder="10-digit mobile number"
                            />
                          </div>
                          <label className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-3 text-sm">
                            <input
                              type="checkbox"
                              checked={phone.isWhatsapp}
                              onChange={(event) => {
                                const nextPhones = [...form.phones];
                                nextPhones[index] = { ...nextPhones[index], isWhatsapp: event.target.checked };
                                updateForm('phones', nextPhones);
                              }}
                              className="h-4 w-4 accent-primary"
                            />
                            WhatsApp available
                          </label>
                          {form.phones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => updateForm('phones', form.phones.filter((_, phoneIndex) => phoneIndex !== index))}
                              className="rounded-xl border border-red-300 px-3 py-3 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateForm('phones', [...form.phones, { number: '', isWhatsapp: false }])}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                      >
                        <Plus className="h-4 w-4" />
                        Add another phone
                      </button>
                    </div>

                    <div className="mt-5">
                      <label className="mb-1 block text-sm font-medium">Tel Number</label>
                      <input
                        value={form.telephone}
                        onChange={(event) => updateForm('telephone', event.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                        placeholder="e.g. 044 2222 3333"
                      />
                    </div>

                    <div className="mt-5">
                      <label className="mb-1 block text-sm font-medium">Email Addresses</label>
                      {form.emails.map((email, index) => (
                        <div key={index} className="mb-2 flex gap-2">
                          <input
                            value={email}
                            onChange={(event) => {
                              const nextEmails = [...form.emails];
                              nextEmails[index] = event.target.value;
                              updateForm('emails', nextEmails);
                            }}
                            className="flex-1 rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                            placeholder="example@mail.com"
                          />
                          {form.emails.length > 1 && (
                            <button
                              type="button"
                              onClick={() => updateForm('emails', form.emails.filter((_, emailIndex) => emailIndex !== index))}
                              className="rounded-xl border border-red-300 px-3 py-3 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => updateForm('emails', [...form.emails, ''])}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                      >
                        <Plus className="h-4 w-4" />
                        Add another email
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-foreground">
                      <MapPin className="h-5 w-5 text-primary" />
                      Location Details
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium">Street Address</label>
                        <input
                          value={form.address}
                          onChange={(event) => updateForm('address', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Landmark</label>
                        <input
                          value={form.landmark}
                          onChange={(event) => updateForm('landmark', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="e.g. Near City Mall"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Area / Locality</label>
                        <input
                          value={form.area}
                          onChange={(event) => updateForm('area', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">State</label>
                        <Select
                          options={stateOptions}
                          value={form.stateOption}
                          onChange={(option) => {
                            updateForm('stateOption', option as SelectOption | null);
                            updateForm('cityOption', null);
                          }}
                          styles={searchSelectStyles}
                          placeholder="Search and select state..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">City</label>
                        <Select
                          options={cityOptions}
                          value={form.cityOption}
                          onChange={(option) => updateForm('cityOption', option as SelectOption | null)}
                          isDisabled={!form.stateOption}
                          styles={searchSelectStyles}
                          placeholder="Search and select city..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-primary">
                          <Map className="h-4 w-4" />
                          Google Maps URL
                        </label>
                        <input
                          value={form.googleMapsUrl}
                          onChange={(event) => handleMapsUrlParse(event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                          placeholder="Paste a Google Maps link to auto-fill latitude and longitude"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Latitude</label>
                        <input
                          value={form.latitude}
                          onChange={(event) => updateForm('latitude', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Longitude</label>
                        <input
                          value={form.longitude}
                          onChange={(event) => updateForm('longitude', event.target.value)}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-foreground">
                      <Wrench className="h-5 w-5 text-primary" />
                      Technical Capabilities
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Supported Vehicles</label>
                        <Select
                          isMulti
                          options={vehicleOptions}
                          value={form.vehicleTypes}
                          onChange={(value) => updateForm('vehicleTypes', value as SelectOption[])}
                          styles={searchSelectStyles}
                          placeholder="Search and select vehicles..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Services Provided</label>
                        <Select
                          isMulti
                          options={serviceOptions}
                          value={form.serviceTypes}
                          onChange={(value) => updateForm('serviceTypes', value as SelectOption[])}
                          styles={searchSelectStyles}
                          placeholder="Search and select services..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Service Radius</label>
                        <select
                          value={form.serviceRadius}
                          onChange={(event) => updateForm('serviceRadius', event.target.value === '' ? '' : Number(event.target.value))}
                          className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                        >
                          <option value="">Not Specified</option>
                          <option value={2}>2 km</option>
                          <option value={5}>5 km</option>
                          <option value={10}>10 km</option>
                          <option value={20}>20 km</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-center gap-3 rounded-2xl bg-background/70 p-4">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={form.evSupport} onChange={(event) => updateForm('evSupport', event.target.checked)} className="h-4 w-4 accent-primary" />
                          Electric vehicle service
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={form.homeService} onChange={(event) => updateForm('homeService', event.target.checked)} className="h-4 w-4 accent-primary" />
                          Home service available
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={form.roadsideAssistance} onChange={(event) => updateForm('roadsideAssistance', event.target.checked)} className="h-4 w-4 accent-primary" />
                          24x7 roadside assistance
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <h4 className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-lg font-bold text-foreground">
                      <CalendarClock className="h-5 w-5 text-primary" />
                      Availability Schedule
                    </h4>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Operating Days</label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label
                            key={day}
                            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors ${
                              form.operatingDays.includes(day)
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background hover:bg-secondary'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={form.operatingDays.includes(day)}
                              onChange={(event) => {
                                if (event.target.checked) {
                                  updateForm('operatingDays', [...form.operatingDays, day]);
                                } else {
                                  updateForm('operatingDays', form.operatingDays.filter((item) => item !== day));
                                }
                              }}
                              className="hidden"
                            />
                            {day.slice(0, 3)}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-5 lg:flex-row">
                      {!form.is24Hours && (
                        <div className="flex-1 rounded-2xl bg-background/70 p-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                            <div>
                              <label className="mb-1 block text-sm font-medium">Opening Time</label>
                              <input
                                type="time"
                                value={form.startTime}
                                onChange={(event) => updateForm('startTime', event.target.value)}
                                className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                              />
                            </div>
                            <span className="pb-3 text-center text-sm text-muted-foreground">to</span>
                            <div>
                              <label className="mb-1 block text-sm font-medium">Closing Time</label>
                              <input
                                type="time"
                                value={form.endTime}
                                onChange={(event) => updateForm('endTime', event.target.value)}
                                className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col justify-center gap-3 rounded-2xl bg-background/70 p-4 lg:min-w-[260px]">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={form.is24Hours} onChange={(event) => updateForm('is24Hours', event.target.checked)} className="h-4 w-4 accent-primary" />
                          Open 24 hours
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={form.holidayWorking} onChange={(event) => updateForm('holidayWorking', event.target.checked)} className="h-4 w-4 accent-primary" />
                          Holiday working
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input type="checkbox" checked={form.availability} onChange={(event) => updateForm('availability', event.target.checked)} className="h-4 w-4 accent-primary" />
                          Currently available and active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-card px-4 py-4 sm:px-6">
                <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-border px-4 py-3 text-sm font-bold text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {submitting ? 'Submitting...' : 'Send to Super Admin'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
