import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Building, Settings, FileText, Image as ImageIcon, Edit, LogOut, ArrowLeft, ExternalLink, MapPin, Navigation } from 'lucide-react';
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
      state: { accountEmail, accountPassword, initialStep: step }
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
  const businessDocs = allDocs.filter(([k]) => !commonInfoKeys.includes(k) && !k.startsWith('Price -') && !k.startsWith('Time -') && k !== 'Specific Services' && k !== 'Additional Service and Price' && k !== 'Notes');

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
        {mechanic.status === 'Approved' ? (
          <div className="bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 p-4 rounded-xl mb-8 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
            <div>
              <h4 className="font-bold">Fully Verified & Approved</h4>
              <p className="text-sm mt-1">Your business is approved and visible to customers on the platform.</p>
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
        ) : mechanic.status === 'Pending' ? (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl mb-8 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 animate-pulse" />
            <div>
              <h4 className="font-bold">Verification Pending</h4>
              <p className="text-sm mt-1">Your recent edits are currently under review by our team. You can still make changes if needed.</p>
            </div>
          </div>
        ) : null}

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 bg-muted/10 border-r border-border shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
            {[
              { id: 'contact', label: 'Contact', icon: Building, step: 1 },
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

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Contact & Profile</h2>
                  <button onClick={() => handleEdit(1)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors">
                    <Edit size={16} /> Edit Contact
                  </button>
                </div>
                
                <div className="space-y-8">
                  {/* Basic Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Business Name</span>
                        <p className="font-medium text-foreground">{displayData.businessName || displayData.name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Mechanic / Owner Name</span>
                        <p className="font-medium text-foreground">{displayData.mechanicName || 'Not specified'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Business Type</span>
                        <p className="font-medium text-foreground">{displayData.mechanicType || 'Not specified'}</p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Description</span>
                        <p className="font-medium text-foreground">{displayData.description || 'No description provided.'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Primary Phone</span>
                        <p className="font-medium text-foreground">
                          {Array.isArray(displayData.phone) 
                            ? (typeof displayData.phone[0] === 'object' ? displayData.phone[0].number : displayData.phone[0])
                            : (typeof displayData.phone === 'object' ? displayData.phone?.number : displayData.phone) || 'Not specified'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Email Address</span>
                        <p className="font-medium text-foreground">{accountEmail || (displayData.emails && displayData.emails[0]) || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Website</span>
                        <p className="font-medium text-foreground">
                          {displayData.websiteUrl ? (
                            <a href={displayData.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{displayData.websiteUrl}</a>
                          ) : 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location Info */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Full Address</span>
                        <p className="font-medium text-foreground">
                          {[displayData.address, displayData.landmark, displayData.city, displayData.state, displayData.pincode].filter(Boolean).join(', ') || 'Not specified'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Service Radius</span>
                        <p className="font-medium text-foreground">{displayData.serviceRadius ? `${displayData.serviceRadius} km` : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Operations & Features */}
                  <div>
                    <h3 className="text-lg font-bold mb-4 border-b border-border pb-2">Operations & Features</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Operating Days</span>
                        <p className="font-medium text-foreground">
                          {Array.isArray(displayData.operatingDays) ? displayData.operatingDays.join(', ') : (displayData.operatingDays || 'Not specified')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Operating Hours</span>
                        <p className="font-medium text-foreground">
                          {displayData.startTime && displayData.endTime ? `${displayData.startTime} - ${displayData.endTime}` : (displayData.operatingHours || 'Not specified')}
                        </p>
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Special Features</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {displayData.evSupport && <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-sm font-bold">EV Support</span>}
                          {displayData.homeService && <span className="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">Home Service</span>}
                          {displayData.roadsideAssistance && <span className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-sm font-bold">Roadside Assistance</span>}
                          {displayData.is24Hours && <span className="bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full text-sm font-bold">24/7 Service</span>}
                          {displayData.holidayWorking && <span className="bg-pink-500/10 text-pink-600 px-3 py-1 rounded-full text-sm font-bold">Open on Holidays</span>}
                          {!displayData.evSupport && !displayData.homeService && !displayData.roadsideAssistance && !displayData.is24Hours && !displayData.holidayWorking && (
                            <span className="text-muted-foreground italic text-sm">No special features specified</span>
                          )}
                        </div>
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
                  <div className="space-y-4">
                    {businessDocs.map(([key, val]: any) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-card hover:border-primary/50 transition-colors group">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:scale-110 transition-transform">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{String(key).replace(' Link', '')}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px] sm:max-w-[300px] truncate">
                              {val && typeof val === 'string' && val.startsWith('http') ? val : 'Uploaded Document'}
                            </p>
                          </div>
                        </div>
                        {val && typeof val === 'string' && val.startsWith('http') ? (
                          <div className="shrink-0 flex items-center justify-end">
                            {/\.(jpg|jpeg|png|gif|webp)$/i.test(val) || val.toLowerCase().includes('image') ? (
                              <a href={val} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-lg border border-border mt-3 sm:mt-0">
                                <img src={val} alt={key} className="h-24 w-32 object-cover transition-transform group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                  <ExternalLink size={18} className="text-white" />
                                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">Preview</span>
                                </div>
                              </a>
                            ) : (
                              <a href={val} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-primary-foreground transition-all w-fit">
                                Open Document <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-foreground text-sm font-medium bg-muted px-4 py-2 rounded-lg w-fit shrink-0">{String(val)}</span>
                        )}
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
                        {servicesData.map(([key, val]: any) => (
                          <div key={key} className="p-3 border border-border rounded-xl bg-muted/50">
                            <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">{key}</span>
                            <span className="block font-medium">{String(val)}</span>
                          </div>
                        ))}
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
