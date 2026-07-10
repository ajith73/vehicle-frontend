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
import MechanicFormComponent from './MechanicFormComponent';
import type { Mechanic } from '../types';
import { State, City } from 'country-state-city';

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
            <div className="flex min-h-0 flex-1 flex-col">
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
                    <MechanicFormComponent 
                      isEdit={!!selectedMechanic}
                      initialData={selectedMechanic}
                      onSubmitOverride={async (payload) => {
                        setSubmitting(true);
                        setError('');
                        try {
                          await submitMechanicRegistration({
                            ...payload,
                            existingMechanicId: selectedMechanic?.id
                          });
                          toast.success(selectedMechanic ? 'Update request sent to Super Admin' : 'New mechanic request sent to Super Admin');
                          onClose();
                        } catch (submitError) {
                          setError(submitError instanceof Error ? submitError.message : 'Failed to submit request.');
                          window.scrollTo(0, 0);
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      onCancelOverride={() => setMode('pick')}
                      isModal={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
