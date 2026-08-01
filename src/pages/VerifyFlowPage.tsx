import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, ShieldCheck, FileText, ChevronRight, Loader2, Info, Crosshair, Settings } from 'lucide-react';
import Select from 'react-select';
import MechanicFormComponent from '../components/MechanicFormComponent';
import { apiClient } from '../api/apiClient';
import type { Mechanic } from '../types';
import toast from 'react-hot-toast';

import { MECHANIC_DOCS_CONFIG, INDIAN_LANGUAGES, getSelectStyles } from '../config/verifyConfig';

const COMMON_FIELDS = [
  'Profile Photo Link',
  'Location (GPS)',
  'Emergency Contact',
  'Languages Spoken'
];

const OtpInput = ({ prefix, value, onChange, disabled }: { prefix: string, value: string[], onChange: (val: string[]) => void, disabled: boolean }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const v = e.target.value;
    if (/[^0-9]/.test(v)) return;
    const newOtp = [...value];
    newOtp[index] = v.substring(v.length - 1);
    onChange(newOtp);
    if (v && index < 5) {
      document.getElementById(`${prefix}-otp-${index + 1}`)?.focus();
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      document.getElementById(`${prefix}-otp-${index - 1}`)?.focus();
    }
  };
  return (
    <div className="flex gap-2">
      {value.map((v, i) => (
        <input 
          key={i} id={`${prefix}-otp-${i}`} type="text" maxLength={1} value={v} 
          onChange={e => handleChange(e, i)} onKeyDown={e => handleKeyDown(e, i)}
          disabled={disabled}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  )
}

export default function VerifyFlowPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accountEmail, accountPassword, initialStep, singleEdit } = location.state || {};
  
  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentStep, setCurrentStep] = useState(initialStep || 1);
  const [submitting, setSubmitting] = useState(false);


  
  // Step 2 & 3: Dynamic Data
  const [submittedData, setSubmittedData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step 1: Captured payload from MechanicFormComponent
  const [mechanicDetailsPayload, setMechanicDetailsPayload] = useState<any>(null);

  const [selectedOptionalDocs, setSelectedOptionalDocs] = useState<{value: string, label: string}[]>([]);
  const [specificServicesList, setSpecificServicesList] = useState<{value: string, label: string}[]>([]);

  const [verificationId, setVerificationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchMechanic = async () => {
      try {
        const [mechanicData, servicesData] = await Promise.all([
          apiClient<any>(`/public/mechanics/${id}`),
          apiClient<any>('/public/specific-services')
        ]);
        // Ensure the verified account email is pre-filled into the form
        if (accountEmail) {
          const existingEmails = mechanicData.emails || [];
          if (!existingEmails.includes(accountEmail)) {
            mechanicData.emails = [accountEmail, ...existingEmails];
          }
        }
        
        // Resume from pending verification
        if (mechanicData.pendingVerification) {
          const pv = mechanicData.pendingVerification;
          setVerificationId(pv.id);
          const sData = { ...(mechanicData.verificationChecklist || {}), ...(pv.submittedData || {}) };
          setSubmittedData(sData);
          if (sData.__mechanicDetails) {
            setMechanicDetailsPayload(sData.__mechanicDetails);
            Object.assign(mechanicData, sData.__mechanicDetails);
          }
          if (pv.id && !initialStep) {
            setCurrentStep(2);
          }
        } else if (mechanicData.verificationChecklist) {
          setSubmittedData(mechanicData.verificationChecklist);
        }
        
        setMechanic(mechanicData);
        setSpecificServicesList(servicesData.map((s: any) => ({ value: s.name, label: s.name })));
      } catch (err) {
        toast.error('Could not load data.');
        navigate('/verify-start');
      } finally {
        setLoading(false);
      }
    };
    fetchMechanic();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!mechanic) return null;

  const typeConfig = MECHANIC_DOCS_CONFIG[mechanic.mechanicType || 'Workshop / Garage'] || MECHANIC_DOCS_CONFIG['Workshop / Garage'];

  const handleFieldChange = (field: string, value: string) => {
    setSubmittedData(prev => ({ ...prev, [field]: value }));
  };

  const handleSingleEditSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 2) {
      const missingMandatory = typeConfig.mandatory.filter((field: string) => !submittedData[field] || submittedData[field].trim() === '');
      const missingOptional = selectedOptionalDocs.map((o: any) => o.value).filter((field: string) => !submittedData[field] || submittedData[field].trim() === '');
      const missing = [...missingMandatory, ...missingOptional];
      missing.forEach(m => newErrors[m] = 'Required');

      const isValidUrl = (string: string) => { try { new URL(string.includes('://') ? string : `https://${string}`); return string.includes('.') && string.trim().length > 4; } catch (_) { return false; } };
      const allFields = [...typeConfig.mandatory, ...selectedOptionalDocs.map((o: any) => o.value)];
      allFields.forEach((field: string) => {
        if (field.includes('Link')) {
          const val = submittedData[field];
          if (val && !isValidUrl(val.trim())) newErrors[field] = 'Invalid URL';
        }
      });
    } else if (currentStep === 3) {
      const missingCommon = COMMON_FIELDS.filter(f => !submittedData[f] || submittedData[f].trim() === '');
      missingCommon.forEach(m => newErrors[m] = 'Required');
      const isValidUrl = (string: string) => { try { new URL(string.includes('://') ? string : `https://${string}`); return string.includes('.') && string.trim().length > 4; } catch (_) { return false; } };
      if (submittedData['Profile Photo Link'] && !isValidUrl(submittedData['Profile Photo Link'])) newErrors['Profile Photo Link'] = 'Invalid URL';
      const emergencyContact = submittedData['Emergency Contact']?.trim() || '';
      if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) newErrors['Emergency Contact'] = 'Invalid phone';
      const location = submittedData['Location (GPS)']?.trim() || '';
      if (location && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location) && !isValidUrl(location)) newErrors['Location (GPS)'] = 'Invalid GPS format or URL';
    } else if (currentStep === 4) {
      const val = submittedData['Specific Services'];
      const selectedServices = Array.isArray(val) ? val : (val || '').split(', ').filter(Boolean);
      if (selectedServices.length === 0) newErrors['Specific Services'] = 'Please select at least one service';
      selectedServices.forEach(serviceName => {
        const priceKey = `Price - ${serviceName}`;
        if (!submittedData[priceKey] || submittedData[priceKey].trim() === '') newErrors[priceKey] = 'Price is required';
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      if (verificationId) {
        await apiClient(`/public/mechanics/${id}/submit-verification/${verificationId}`, {
          method: 'PUT',
          data: { submittedData, isFinalSubmit: false }
        });
      } else {
        await apiClient(`/public/mechanics/${id}/submit-verification`, {
          method: 'POST',
          data: { 
            submittedData,
            mechanicDetails: mechanicDetailsPayload,
            accountInfo: (accountEmail && accountPassword) ? {
              email: accountEmail,
              password: accountPassword
            } : undefined
          }
        });
      }
      toast.success('Updated successfully!');
      navigate(`/mechanic-dashboard/${id}`);
    } catch (err) {
      toast.error('Failed to update.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      const missingMandatory = typeConfig.mandatory.filter((field: string) => !submittedData[field] || submittedData[field].trim() === '');
      const missingOptional = selectedOptionalDocs.map(o => o.value).filter((field: string) => !submittedData[field] || submittedData[field].trim() === '');
      
      const missing = [...missingMandatory, ...missingOptional];
      const newErrors: Record<string, string> = {};
      missing.forEach(m => newErrors[m] = 'Required');

      const isValidUrl = (string: string) => {
        try {
          new URL(string.includes('://') ? string : `https://${string}`);
          return string.includes('.') && string.trim().length > 4;
        } catch (_) {
          return false;
        }
      };

      const allFields = [...typeConfig.mandatory, ...selectedOptionalDocs.map((o: any) => o.value)];
      allFields.forEach((field: string) => {
        if (field.includes('Link')) {
          const val = submittedData[field];
          if (val && !isValidUrl(val.trim())) {
            newErrors[field] = 'Invalid URL';
          }
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fix the highlighted fields.');
        return;
      }
      setErrors({});

      if (verificationId) {
        setSubmitting(true);
        try {
          await apiClient(`/public/mechanics/${id}/submit-verification/${verificationId}`, {
            method: 'PUT',
            data: { submittedData }
          });
          setCurrentStep(3);
        } catch (err) {
          toast.error('Failed to save document details.');
        } finally {
          setSubmitting(false);
        }
        return;
      }
    } else if (currentStep === 3) {
      const newErrors: Record<string, string> = {};
      const missingCommon = COMMON_FIELDS.filter(f => !submittedData[f] || submittedData[f].trim() === '');
      missingCommon.forEach(m => newErrors[m] = 'Required');

      const isValidUrl = (string: string) => {
        try {
          new URL(string.includes('://') ? string : `https://${string}`);
          return string.includes('.') && string.trim().length > 4;
        } catch (_) {
          return false;
        }
      };

      if (submittedData['Profile Photo Link'] && !isValidUrl(submittedData['Profile Photo Link'])) {
        newErrors['Profile Photo Link'] = 'Invalid URL';
      }

      const emergencyContact = submittedData['Emergency Contact']?.trim() || '';
      if (emergencyContact && !/^\d{10}$/.test(emergencyContact)) {
        newErrors['Emergency Contact'] = 'Invalid phone';
      }

      const location = submittedData['Location (GPS)']?.trim() || '';
      if (location && !/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(location) && !isValidUrl(location)) {
        newErrors['Location (GPS)'] = 'Invalid GPS format or URL';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fix the highlighted fields.');
        return;
      }
      setErrors({});
      
      if (verificationId) {
        setSubmitting(true);
        try {
          await apiClient(`/public/mechanics/${id}/submit-verification/${verificationId}`, {
            method: 'PUT',
            data: { submittedData }
          });
          setCurrentStep(4);
        } catch (err) {
          toast.error('Failed to save common info.');
        } finally {
          setSubmitting(false);
        }
        return;
      }
    }
    setCurrentStep((prev: number) => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    const val = submittedData['Specific Services'];
    const selectedServices = Array.isArray(val) ? val : (val || '').split(', ').filter(Boolean);
    const newErrors: Record<string, string> = {};

    if (selectedServices.length === 0) {
      newErrors['Specific Services'] = 'Please select at least one service';
    }

    selectedServices.forEach(serviceName => {
      const priceKey = `Price - ${serviceName}`;
      if (!submittedData[priceKey] || submittedData[priceKey].trim() === '') {
        newErrors[priceKey] = 'Price is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please provide a price for all selected services.');
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      if (verificationId) {
        await apiClient(`/public/mechanics/${id}/submit-verification/${verificationId}`, {
          method: 'PUT',
          data: { 
            submittedData,
            isFinalSubmit: true
          }
        });
      } else {
        await apiClient(`/public/mechanics/${id}/submit-verification`, {
          method: 'POST',
          data: { 
            submittedData,
            mechanicDetails: mechanicDetailsPayload,
            accountInfo: (accountEmail && accountPassword) ? {
              email: accountEmail,
              password: accountPassword
            } : undefined
          }
        });
      }
      toast.success('Verification request submitted successfully!');
      navigate('/');
    } catch (err) {
      toast.error('Failed to submit verification request.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderInput = (field: string, mandatory: boolean) => (
    <div key={field}>
      <label className="block text-sm font-medium mb-1">
        {field} {mandatory && <span className="text-red-500">*</span>}
      </label>
      <input 
        type="text" 
        placeholder={field.includes('Link') ? 'https://link-to-document' : `Enter ${field}`}
        value={submittedData[field] || ''}
        onChange={e => {
          handleFieldChange(field, e.target.value);
          if (errors[field]) setErrors(prev => ({...prev, [field]: ''}));
        }}
        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 outline-none transition-all ${errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 ring-1 ring-red-500/50' : (mandatory && !submittedData[field]) ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-border focus:border-primary focus:ring-primary/20'}`}
      />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button 
          onClick={() => navigate(`/mechanic-dashboard/${id}`)} 
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-2xl p-6 sm:p-10 shadow-sm">
          {/* Progress Bar */}
          {!singleEdit && (
            <div className="mb-10">
              <div className="flex items-center justify-between relative z-10">
              {[
                { step: 1, label: 'Contact', icon: ShieldCheck },
                { step: 2, label: 'Business Docs', icon: FileText },
                { step: 3, label: 'Common Info', icon: Info },
                { step: 4, label: 'Services', icon: Settings }
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center gap-2 bg-card px-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${currentStep > s.step ? 'bg-green-500 text-white' : currentStep === s.step ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-muted text-muted-foreground'}`}>
                    {currentStep > s.step ? <Check size={20} /> : <s.icon size={20} />}
                  </div>
                  <span className={`text-xs font-bold ${currentStep >= s.step ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
                </div>
              ))}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-muted -z-10">
                <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentStep - 1) / 3) * 100}%` }}></div>
              </div>
            </div>
          </div>
          )}

          <h2 className="text-2xl font-black mb-2">
            Verify {mechanic.businessName || mechanic.name}
          </h2>
          <p className="text-muted-foreground mb-6 pb-4 border-b border-border">Provider Type: <span className="font-semibold text-primary">{mechanic.mechanicType}</span></p>

          {/* STEP 1: Contact */}
          {currentStep === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 -mx-4 sm:-mx-10 mt-4 p-4">
              <MechanicFormComponent 
                isEdit={true}
                isModal={true}
                initialData={mechanic}
                submitButtonText={singleEdit ? "Update Profile" : "Proceed to Documents"}
                onSubmitOverride={async (payload) => {
                  setSubmitting(true);
                  try {
                    let newVerificationId = verificationId;
                    if (verificationId) {
                      await apiClient(`/public/mechanics/${id}/submit-verification/${verificationId}`, {
                        method: 'PUT',
                        data: { submittedData, mechanicDetails: payload }
                      });
                    } else {
                      const res = await apiClient<any>(`/public/mechanics/${id}/submit-verification`, {
                        method: 'POST',
                        data: { 
                          mechanicDetails: payload,
                          accountInfo: (accountEmail && accountPassword) ? {
                            email: accountEmail,
                            password: accountPassword
                          } : undefined
                        }
                      });
                      newVerificationId = res.verification.id;
                    }
                    
                    if (singleEdit) {
                      toast.success('Profile updated successfully!');
                      navigate(`/mechanic-dashboard/${id}`);
                    } else {
                      setVerificationId(newVerificationId);
                      setMechanicDetailsPayload(payload);
                      setCurrentStep(2);
                    }
                  } catch (err) {
                    toast.error('Failed to save mechanic details.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              />
            </div>
          )}

          {/* STEP 2: Business Docs */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Step 2: {mechanic.mechanicType} Documents</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Please provide links (Google Drive, Dropbox, etc.) for the following documents.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-lg border-b border-border pb-2">Mandatory Documents</h4>
                {typeConfig.mandatory.map((field: string) => renderInput(field, true))}

                <h4 className="font-bold text-lg border-b border-border pb-2 mt-6">Optional Documents</h4>
                <p className="text-sm text-muted-foreground mb-2">Select any optional documents you would like to provide (they will be marked as required once selected).</p>
                <Select
                  isMulti
                  options={typeConfig.optional.map((f: string) => ({ value: f, label: f }))}
                  value={selectedOptionalDocs}
                  onChange={(selected: any) => setSelectedOptionalDocs(selected || [])}
                  styles={getSelectStyles()}
                  placeholder="Select optional documents to upload..."
                />
                <div className="space-y-4">
                  {selectedOptionalDocs.map(opt => renderInput(opt.value, true))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {!singleEdit && (
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-4 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={singleEdit ? handleSingleEditSubmit : handleNext}
                  disabled={submitting}
                  className={`${singleEdit ? 'flex-1 bg-primary text-primary-foreground hover:bg-primary/90' : 'flex-[2] bg-foreground text-background hover:bg-foreground/90'} py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50`}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : singleEdit ? 'Update Documents' : <>Next Step <ChevronRight size={20} /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Common Info */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Step 3: Common Information</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Additional details shared across all provider types.
                </p>
              </div>

              <div className="space-y-4">
                {COMMON_FIELDS.filter(f => !typeConfig.mandatory.includes(f) && !typeConfig.optional.includes(f)).map((field: string) => {
                  if (field === 'Location (GPS)') {
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1">{field} <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Latitude, Longitude"
                            value={submittedData[field] || ''}
                            onChange={e => {
                              handleFieldChange(field, e.target.value);
                              if (errors[field]) setErrors(prev => ({...prev, [field]: ''}));
                            }}
                            className={`w-full p-3 pr-12 rounded-xl border bg-background focus:ring-2 outline-none transition-all ${errors[field] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 ring-1 ring-red-500/50' : 'border-border focus:border-primary focus:ring-primary/20'}`}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              if (navigator.geolocation) {
                                toast.loading('Getting location...', { id: 'geo' });
                                navigator.geolocation.getCurrentPosition(
                                  (pos) => {
                                    handleFieldChange(field, `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`);
                                    toast.success('Location acquired!', { id: 'geo' });
                                  },
                                  () => toast.error('Failed to get location', { id: 'geo' })
                                );
                              } else {
                                toast.error('Geolocation not supported');
                              }
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            <Crosshair size={20} />
                          </button>
                        </div>
                        {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                      </div>
                    );
                  }
                  if (field === 'Emergency Contact') {
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1">{field} <span className="text-red-500">*</span></label>
                        <div className={`flex items-center rounded-xl bg-background border focus-within:ring-2 overflow-hidden transition-all ${errors[field] ? 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20 ring-1 ring-red-500/50' : 'border-border focus-within:border-primary focus-within:ring-primary/20'}`}>
                          <span className={`px-4 font-medium border-r ${errors[field] ? 'text-red-500 border-red-500' : 'text-muted-foreground border-border'}`}>+91</span>
                          <input 
                            type="text" 
                            placeholder="10-digit mobile number"
                            maxLength={10}
                            value={submittedData[field] || ''}
                            onChange={e => {
                              handleFieldChange(field, e.target.value.replace(/\D/g, ''));
                              if (errors[field]) setErrors(prev => ({...prev, [field]: ''}));
                            }}
                            className="w-full p-3 bg-transparent outline-none"
                          />
                        </div>
                        {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                      </div>
                    );
                  }
                  if (field === 'Languages Spoken') {
                    return (
                      <div key={field}>
                        <label className="block text-sm font-medium mb-1">{field} <span className="text-red-500">*</span></label>
                        <Select
                          isMulti
                          options={INDIAN_LANGUAGES}
                          value={INDIAN_LANGUAGES.filter(l => (submittedData[field] || '').includes(l.value))}
                          onChange={(selected: any) => {
                            handleFieldChange(field, selected.map((s: any) => s.value).join(', '));
                            if (errors[field]) setErrors(prev => ({...prev, [field]: ''}));
                          }}
                          styles={getSelectStyles(!!errors[field])}
                          placeholder="Select languages..."
                        />
                        {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                      </div>
                    );
                  }
                  return renderInput(field, true);
                })}
              </div>

              <div className="flex gap-4 pt-4">
                {!singleEdit && (
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-4 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={singleEdit ? handleSingleEditSubmit : handleNext}
                  disabled={submitting}
                  className={`${singleEdit ? 'flex-1 bg-primary text-primary-foreground hover:bg-primary/90' : 'flex-[2] bg-foreground text-background hover:bg-foreground/90'} py-4 font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50`}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : singleEdit ? 'Update Info' : <>Next Step <ChevronRight size={20} /></>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Services */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Step 4: Services</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Select specific services you offer and add any additional details.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specific Services <span className="text-red-500">*</span></label>
                  <Select
                    isMulti
                    options={specificServicesList}
                    value={specificServicesList.filter(s => {
                      const val = submittedData['Specific Services'];
                      const arr = Array.isArray(val) ? val : (val || '').split(', ').filter(Boolean);
                      return arr.includes(s.value);
                    })}
                    onChange={(selected: any) => {
                      handleFieldChange('Specific Services', (selected || []).map((s: any) => s.value).join(', '));
                      if (errors['Specific Services']) setErrors(prev => ({...prev, 'Specific Services': ''}));
                    }}
                    styles={getSelectStyles(!!errors['Specific Services'])}
                    placeholder="Select specific services..."
                  />
                  {errors['Specific Services'] && <p className="text-red-500 text-xs mt-1">{errors['Specific Services']}</p>}
                </div>
                
                {/* Dynamic Price Inputs for Selected Services */}
                {(() => {
                  const val = submittedData['Specific Services'];
                  const servicesArr = Array.isArray(val) ? val : (val || '').split(', ').filter(Boolean);
                  return servicesArr.map((serviceName: string) => {
                    const priceKey = `Price - ${serviceName}`;
                  return (
                    <div key={priceKey} className="pl-4 border-l-2 border-primary/30 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-sm font-medium mb-1">Price for <span className="font-bold text-primary">{serviceName}</span> <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter price..."
                        value={submittedData[priceKey] || ''}
                        onChange={e => {
                          handleFieldChange(priceKey, e.target.value);
                          if (errors[priceKey]) setErrors(prev => ({...prev, [priceKey]: ''}));
                        }}
                        className={`w-full p-3 rounded-xl border bg-background focus:ring-2 outline-none transition-all ${errors[priceKey] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 ring-1 ring-red-500/50' : 'border-border focus:border-primary focus:ring-primary/20'}`}
                      />
                      {errors[priceKey] && <p className="text-red-500 text-xs mt-1">{errors[priceKey]}</p>}
                    </div>
                  );
                });
                })()}
                <div>
                  <label className="block text-sm font-medium mb-1">Additional Service and Price</label>
                  <textarea
                    placeholder="E.g., Oil Change - $50..."
                    value={submittedData['Additional Service and Price'] || ''}
                    onChange={e => handleFieldChange('Additional Service and Price', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    placeholder="Any additional notes..."
                    value={submittedData['Notes'] || ''}
                    onChange={e => handleFieldChange('Notes', e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {!singleEdit && (
                  <button 
                    onClick={() => setCurrentStep(3)}
                    className="flex-1 py-4 border border-border text-foreground font-bold rounded-xl hover:bg-muted transition-colors"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={singleEdit ? handleSingleEditSubmit : handleSubmit}
                  disabled={submitting}
                  className={`${singleEdit ? 'flex-1' : 'flex-[2]'} py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50`}
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (singleEdit ? 'Update Services' : <><ShieldCheck size={24} /> Submit Verification</>)}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
