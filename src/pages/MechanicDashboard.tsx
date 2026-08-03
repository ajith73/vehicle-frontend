import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Building, Settings, FileText, Image as ImageIcon, Edit, LogOut, ArrowLeft, ExternalLink, MapPin, Navigation, Check, X, Clock, Info } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { Mechanic } from '../types';
import toast from 'react-hot-toast';

export default function MechanicDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { accountEmail, accountPassword } = location.state || {};

  const [mechanic, setMechanic] = useState<Mechanic | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'contact' | 'business-docs' | 'common-info' | 'services'>('contact');

  // Any pending verification data (unapproved edits)
  const [pendingData, setPendingData] = useState<any>({});

  useEffect(() => {
    const fetchMechanic = async () => {
      try {
        const data = await apiClient<any>(`/public/mechanics/${id}`);
        setMechanic(data);
        
        if (data.pendingVerification && data.pendingVerification.submittedData) {
          setPendingData(data.pendingVerification.submittedData);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data.');
        navigate('/verify-start');
      } finally {
        setLoading(false);
      }
    };
    fetchMechanic();
  }, [id, navigate]);

  const handleEdit = (step: number) => {
    navigate(`/verify-flow/${id}`, {
      state: { accountEmail, accountPassword, initialStep: step, singleEdit: true }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/verify-start');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!mechanic) return null;

  // Merge mechanic data with pending data so user sees their latest edits
  const displayData = { ...mechanic, ...pendingData.__mechanicDetails };
  const allDocs = Object.entries({ ...(mechanic.verificationChecklist || {}), ...pendingData }).filter(([k]) => !k.startsWith('__'));
  
  const commonInfoKeys = ['Profile Photo Link', 'Location (GPS)', 'Emergency Contact', 'Languages Spoken'];
  
  const commonInfo = allDocs.filter(([k]) => commonInfoKeys.includes(k));
  const servicesData = allDocs.filter(([k]) => k.startsWith('Price -') || k.startsWith('Time -') || k === 'Specific Services' || k === 'Additional Service and Price' || k === 'Notes');
  
  const verificationChecklistItems = allDocs.filter(([k, val]) => typeof val === 'boolean');
  const businessDocs = allDocs.filter(([k, val]) => typeof val !== 'boolean' && !commonInfoKeys.includes(k) && !k.startsWith('Price -') && !k.startsWith('Time -') && k !== 'Specific Services' && k !== 'Additional Service and Price' && k !== 'Notes');

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground">Mechanic Dashboard</h1>
            <p className="text-muted-foreground mt-1">Review your business information and manage verification.</p>
            {(accountEmail || (displayData.emails && displayData.emails[0])) && (
              <div className="inline-flex items-center gap-2 mt-3 bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-bold border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                Verified Email: {accountEmail || displayData.emails[0]}
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl transition-colors font-bold w-fit h-fit"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Global Status Banner */}
        {mechanic.pendingVerification?.status === 'Pending' ? (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl mb-8 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-bold">Verification Pending</h4>
              <p className="text-sm mt-1">Your recent edits are currently under review by our team. You can still make changes if needed.</p>
            </div>
          </div>
        ) : mechanic.status === 'Rejected' || mechanic.pendingVerification?.status === 'Rejected' ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-8 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
            <div>
              <h4 className="font-bold">Verification Rejected</h4>
              <p className="text-sm mt-1">
                <span className="font-semibold">Reason:</span> {mechanic.pendingVerification?.remarks || mechanic.rejectionReason || 'No specific reason provided. Please review your details and submit again.'}
              </p>
            </div>
          </div>
        ) : mechanic.status === 'Approved' && (mechanic.verificationLevel ?? 0) >= 1 ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl mb-8 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
            <div>
              <h4 className="font-bold">Fully Verified & Approved</h4>
              <p className="text-sm mt-1">Your business is approved and visible to customers on the platform.</p>
            </div>
          </div>
        ) : (
          <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 p-4 rounded-xl mb-8 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
            <div>
              <h4 className="font-bold">Complete Your Profile</h4>
              <p className="text-sm mt-1">Your business is listed, but not fully verified. Please complete your verification to earn the verified badge.</p>
            </div>
          </div>
        )}

        {/* Verification Checklist */}
        {verificationChecklistItems.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-bold mb-3">Verification Checklist</h3>
            <div className="flex items-start gap-2 mb-5 text-sm text-blue-800 dark:text-blue-200 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>Note:</strong> This checklist is maintained by our administration team. Items will be marked as verified once your submitted documents are processed. You do not need to take any additional action here.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {verificationChecklistItems.map(([key, val]) => (
                <div key={key} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${val ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}`}>
                  {val ? <Check size={16} /> : <Clock size={16} />}
                  <span className="text-sm font-bold capitalize">{String(key)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-muted/10 border-r border-border shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
            {[
              { id: 'contact', label: 'Profile', icon: Building, step: 1 },
              { id: 'business-docs', label: 'Business Docs', icon: FileText, step: 2 },
              { id: 'common-info', label: 'Common Info', icon: ImageIcon, step: 3 },
              { id: 'services', label: 'Services', icon: Settings, step: 4 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap md:whitespace-normal text-left ${
                  activeTab === tab.id 
                    ? 'bg-primary/10 text-primary border-b-2 md:border-b-0 md:border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground md:border-l-4 border-transparent'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 sm:p-8 min-w-0">

            {/* Profile Tab */}
            {activeTab === 'contact' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Building className="text-primary" /> Profile Details
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                      displayData.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                      displayData.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                      'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {displayData.status === 'Approved' ? 'Admin Approved' : displayData.status === 'Pending' ? 'Admin Approval Pending' : 'Admin Rejected'}
                    </span>
                    <button onClick={() => handleEdit(1)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                      <Edit size={16} /> Edit Profile
                    </button>
                  </div>
                </div>
                
                <div className="space-y-8 flex-1">
                  
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    {(displayData.image || displayData.imageUrl) && (
                      <img src={displayData.image || displayData.imageUrl} alt={displayData.businessName || displayData.name} className="w-full md:w-48 h-48 object-cover rounded-xl border border-border shadow-sm shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f1f5f9"/><text x="50" y="50" font-size="50" text-anchor="middle" dominant-baseline="central">🛠️</text></svg>')}` }} />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-foreground">{displayData.businessName || displayData.name}</h3>
                      </div>
                      {displayData.mechanicName && <p className="text-muted-foreground font-medium flex items-center gap-2">Owner: {displayData.mechanicName}</p>}
                      {displayData.mechanicType && <p className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-1 text-xs font-bold text-secondary-foreground">{displayData.mechanicType}</p>}
                      <p className="text-muted-foreground mt-2">{displayData.description || 'No description provided.'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact & Location Section */}
                    <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-6">
                      <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Settings size={18} className="text-primary"/> Contact & Web</h4>
                      <div className="space-y-3">
                        {displayData.phone && Array.isArray(displayData.phone) ? (
                          displayData.phone.map((p: any, i: number) => (
                            <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                              <span className="font-medium text-foreground">{p.isTelephone ? 'Tel:' : 'Phone:'}</span> {p.number || p} 
                              {p.isWhatsapp && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">WhatsApp</span>}
                            </p>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Phone:</span> {displayData.phone || 'N/A'}</p>
                        )}
                        {accountEmail || (displayData.emails && displayData.emails[0]) ? (
                           <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Email:</span> {accountEmail || (displayData.emails && displayData.emails[0])}</p>
                        ) : null}
                        {displayData.websiteUrl && (
                          <a href={displayData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <ExternalLink size={14} /> Visit Website
                          </a>
                        )}
                      </div>

                      <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2 mt-6"><MapPin size={18} className="text-primary"/> Location</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {[displayData.address, displayData.landmark].filter(Boolean).join(', ')}<br />
                          {[displayData.area, displayData.city, displayData.state, displayData.pincode].filter(Boolean).join(', ')}
                        </p>
                        {displayData.latitude && displayData.longitude && (
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-1 rounded inline-block">
                              Lat: {displayData.latitude} | Lng: {displayData.longitude}
                            </p>
                            <br/>
                            <a href={`https://www.google.com/maps?q=${displayData.latitude},${displayData.longitude}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 flex items-center gap-1 w-fit">
                              <Navigation size={12} /> Open in Google Maps
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Services & Operating Info Section */}
                    <div className="bg-muted/10 border border-border rounded-xl p-5 space-y-6">
                      <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2"><Settings size={18} className="text-primary"/> Services & Features</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="font-semibold text-sm mb-2">Supported Vehicles</p>
                          <div className="flex flex-wrap gap-1.5">
                            {displayData.vehicleTypes?.map((v: string) => (
                              <span key={v} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">{v}</span>
                            )) || <span className="text-muted-foreground text-xs">N/A</span>}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm mb-2">Services Provided</p>
                          <div className="flex flex-wrap gap-1.5">
                            {displayData.serviceTypes?.map((s: string) => (
                              <span key={s} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded font-medium">{s}</span>
                            )) || <span className="text-muted-foreground text-xs">N/A</span>}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-sm mb-2">Special Features</p>
                          <div className="flex flex-wrap gap-2">
                            {displayData.evSupport && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-200">EV Support</span>}
                            {displayData.homeService && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">Home Service</span>}
                            {displayData.roadsideAssistance && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">Roadside Assistance</span>}
                          </div>
                        </div>
                      </div>

                      <h4 className="font-bold text-lg border-b border-border pb-2 flex items-center gap-2 mt-6"><Settings size={18} className="text-primary"/> Operating Hours</h4>
                      <div className="space-y-3">
                        <p className="text-sm">
                          <span className="font-semibold block mb-1">Working Days:</span>
                          <span className="text-muted-foreground">{displayData.operatingDays?.join(', ') || 'N/A'}</span>
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold block mb-1">Timings:</span>
                          <span className="text-muted-foreground">
                            {displayData.is24Hours ? '24 Hours Open' : (displayData.operatingHours || (displayData.startTime && displayData.endTime ? `${displayData.startTime} - ${displayData.endTime}` : 'N/A'))}
                          </span>
                        </p>
                        {displayData.holidayWorking && (
                          <p className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 inline-block mt-1">
                            Open on Holidays
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Business Docs Tab */}
            {activeTab === 'business-docs' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Business Docs</h2>
                  <button onClick={() => handleEdit(2)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                    <Edit size={16} /> Edit Docs
                  </button>
                </div>
                
                {businessDocs.length === 0 ? (
                  <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
                    <FileText size={40} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-bold text-foreground">No documents uploaded</h3>
                    <p className="text-muted-foreground text-sm mt-1">Upload your ID proofs and business licenses to get verified.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {businessDocs.map(([key, val]: any) => (
                      <div key={key} className="flex flex-col p-5 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors group h-full">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground line-clamp-2">{String(key).replace(' Link', '')}</p>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-2 border-t border-border flex items-center justify-center">
                          {val && typeof val === 'string' && (val.startsWith('http') || val.startsWith('/') || val.includes('.')) ? (
                            <>
                              {/\.(jpg|jpeg|png|gif|webp)$/i.test(val) || val.toLowerCase().includes('image') ? (
                                <a href={val.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${val}` : (val.startsWith('http') ? val : `https://${val}`)} target="_blank" rel="noopener noreferrer" className="block relative w-full group/img overflow-hidden rounded-lg border border-border">
                                  <img src={val.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${val}` : (val.startsWith('http') ? val : `https://${val}`)} alt={key} className="w-full h-32 object-cover transition-transform group-hover/img:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                    <ExternalLink size={18} className="text-white" />
                                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Preview</span>
                                  </div>
                                </a>
                              ) : (
                                <a href={val.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${val}` : (val.startsWith('http') ? val : `https://${val}`)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-primary/10 text-primary w-full py-3 rounded-lg text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all">
                                  View <ExternalLink size={16} />
                                </a>
                              )}
                            </>
                          ) : key === 'Shop Address' || String(key).toLowerCase().includes('address') ? (
                            <div className="flex flex-col w-full gap-2">
                              <span className="text-sm font-medium px-4 py-2 rounded-lg w-full text-center bg-muted text-foreground whitespace-normal break-words">
                                {String(val)}
                              </span>
                              <a href={`https://www.google.com/maps?q=${encodeURIComponent(String(val))}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-500/10 text-blue-700 dark:text-blue-400 w-full py-2 rounded-lg text-sm font-bold hover:bg-blue-500 hover:text-white transition-all">
                                <Navigation size={14} /> Navigate on Maps
                              </a>
                            </div>
                          ) : (
                            <span className={`text-sm font-medium px-4 py-2 rounded-lg w-full text-center truncate ${val === true ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : val === false ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-muted text-foreground'}`}>
                              {val === true ? 'Verified ✅' : val === false ? 'Not Verified ❌' : String(val)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Common Info Tab */}
            {activeTab === 'common-info' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Common Info</h2>
                  <button onClick={() => handleEdit(3)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                    <Edit size={16} /> Edit Info
                  </button>
                </div>

                {commonInfo.length === 0 ? (
                  <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
                    <ImageIcon size={40} className="mx-auto text-muted-foreground mb-3 opacity-50" />
                    <h3 className="font-bold text-foreground">No common info uploaded</h3>
                    <p className="text-muted-foreground text-sm mt-1">Upload photos of your shop or service vehicle.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {commonInfo.map(([key, val]: any) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-card">
                        <div className="mb-2 sm:mb-0">
                          <p className="font-bold text-sm text-foreground">{key}</p>
                        </div>
                        {key === 'Profile Photo Link' && val && typeof val === 'string' && val.startsWith('http') ? (
                          <div className="shrink-0 flex items-center justify-end">
                            <a href={val} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-full border border-border mt-3 sm:mt-0 w-16 h-16">
                              <img src={val} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                <ExternalLink size={14} className="text-white" />
                              </div>
                            </a>
                          </div>
                        ) : key === 'Location (GPS)' && val ? (
                          <div className="flex items-center gap-3">
                            <span className="text-foreground text-sm font-medium">{String(val)}</span>
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(String(val))}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-500 hover:text-white transition-all shrink-0">
                              <Navigation size={14} /> Navigate
                            </a>
                          </div>
                        ) : val && typeof val === 'string' && val.startsWith('http') ? (
                          <a href={val} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-bold hover:underline break-all flex items-center gap-1"><ExternalLink size={14} /> View Link</a>
                        ) : (
                          <span className="text-foreground text-sm font-medium">{String(val)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Services & Pricing</h2>
                  <button onClick={() => handleEdit(4)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                    <Edit size={16} /> Edit Services
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Vehicles Serviced</span>
                    <div className="flex flex-wrap gap-2">
                      {displayData.vehiclesServiced?.map((v: string) => (
                        <span key={v} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">{v}</span>
                      )) || (displayData.vehicleTypes?.map((v: string) => (
                        <span key={v} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">{v}</span>
                      )) || <span className="text-muted-foreground italic">None selected</span>)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">Specific Services & Prices</span>
                    {servicesData.length === 0 ? (
                      <span className="text-muted-foreground italic block">No pricing submitted</span>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {servicesData.map(([key, val]: any) => {
                          const valStr = String(val);
                          const items = valStr.includes(',') ? valStr.split(',').map(s => s.trim()).filter(Boolean) : [valStr];
                          
                          return (
                            <div key={key} className="p-4 border border-border rounded-xl bg-muted/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <span className="text-sm font-bold text-muted-foreground uppercase pt-2" title={key}>{key}</span>
                              <div className="flex flex-col gap-2 w-full sm:w-auto">
                                {items.map((item, idx) => (
                                  <span key={idx} className="font-black bg-background px-4 py-2 rounded-lg border border-border shadow-sm text-right whitespace-normal sm:whitespace-nowrap break-words text-sm">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
