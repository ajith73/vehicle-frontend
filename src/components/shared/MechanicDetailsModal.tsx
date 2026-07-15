import React from 'react';
import { X, Wrench, MapPin, Info, Star, Phone, MessageSquare, MessageCircle, Mail, Globe, Navigation } from 'lucide-react';
import { getMechanicStatus, getDistanceFromLatLonInKm } from '../../utils/mechanicUtils';

interface MechanicDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMechanicForDetails: any;
  userLocation: [number, number] | null;
  onNavigate: () => void;
}

export function MechanicDetailsModal({
  isOpen,
  onClose,
  selectedMechanicForDetails,
  userLocation,
  onNavigate
}: MechanicDetailsModalProps) {
  if (!isOpen || !selectedMechanicForDetails) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-card w-full max-w-lg rounded-[24px] shadow-2xl border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-48 sm:h-56 shrink-0 bg-secondary/50">
          {selectedMechanicForDetails.image ? (
            <img src={selectedMechanicForDetails.image} alt="Mechanic" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Wrench className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-md transition-colors shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex justify-between items-end gap-3">
              <div className="min-w-0">
                <h3 className="font-black text-2xl text-white truncate leading-tight drop-shadow-md">
                  {selectedMechanicForDetails.businessName || selectedMechanicForDetails.name}
                </h3>
                <p className="text-white/80 text-sm flex items-center gap-1.5 mt-1 font-medium drop-shadow-md">
                  <MapPin size={14} className="text-primary" /> {selectedMechanicForDetails.landmark ? `${selectedMechanicForDetails.landmark}, ` : ''}{selectedMechanicForDetails.area}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Current Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${getMechanicStatus(selectedMechanicForDetails) === 'Available' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}></div>
                <span className="font-bold text-sm text-foreground">{getMechanicStatus(selectedMechanicForDetails)}</span>
              </div>
            </div>
            {(userLocation || (selectedMechanicForDetails.dist !== null && selectedMechanicForDetails.dist !== undefined)) && (
              <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-1.5">Distance</span>
                <span className="font-bold text-sm text-foreground text-primary">
                  {selectedMechanicForDetails.dist !== undefined 
                    ? selectedMechanicForDetails.dist?.toFixed(1) 
                    : userLocation 
                      ? getDistanceFromLatLonInKm(userLocation[0], userLocation[1], selectedMechanicForDetails.latitude, selectedMechanicForDetails.longitude).toFixed(1)
                      : '?'} km away
                </span>
              </div>
            )}
          </div>
          
          {selectedMechanicForDetails.mechanicType && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Wrench size={16} className="text-primary" /> Mechanic Type
              </h4>
              <span className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                {selectedMechanicForDetails.mechanicType}
              </span>
            </div>
          )}

          {selectedMechanicForDetails.description && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Info size={16} className="text-primary" /> Description
              </h4>
              <p className="rounded-xl border border-border/30 bg-secondary/20 p-4 text-sm leading-relaxed text-muted-foreground">
                {selectedMechanicForDetails.description}
              </p>
            </div>
          )}

          {selectedMechanicForDetails.remarks && (selectedMechanicForDetails.status === 'Rejected' || selectedMechanicForDetails.status === 'Inactive') && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-destructive">
                <Info size={16} /> Remarks ({selectedMechanicForDetails.status})
              </h4>
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm leading-relaxed text-destructive-foreground">
                {selectedMechanicForDetails.remarks}
              </p>
            </div>
          )}

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
              <MapPin size={16} className="text-primary" /> Location Details
            </h4>
            <div className="rounded-xl border border-border/30 bg-secondary/20 p-4 text-sm leading-relaxed text-muted-foreground flex flex-col gap-2">
              {selectedMechanicForDetails.address && <p><strong>Address:</strong> {selectedMechanicForDetails.address}</p>}
              {selectedMechanicForDetails.landmark && <p><strong>Landmark:</strong> {selectedMechanicForDetails.landmark}</p>}
              {(selectedMechanicForDetails.city || selectedMechanicForDetails.state || selectedMechanicForDetails.pincode) && (
                <p>
                  <strong>Location:</strong> {[selectedMechanicForDetails.city, selectedMechanicForDetails.state, selectedMechanicForDetails.pincode].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
          </div>

          {(selectedMechanicForDetails.evSupport || selectedMechanicForDetails.is24Hours || selectedMechanicForDetails.homeService || selectedMechanicForDetails.roadsideAssistance || selectedMechanicForDetails.holidayWorking) && (
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
                <Star size={16} className="text-primary" /> Special Features
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedMechanicForDetails.is24Hours && <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600">24/7 Available</span>}
                {selectedMechanicForDetails.evSupport && <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600">EV Support</span>}
                {selectedMechanicForDetails.homeService && <span className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-600">Home Service</span>}
                {selectedMechanicForDetails.roadsideAssistance && <span className="rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-600">Roadside Assistance</span>}
                {selectedMechanicForDetails.holidayWorking && <span className="rounded-lg border border-pink-500/20 bg-pink-500/10 px-3 py-1.5 text-xs font-bold text-pink-600">Open on Holidays</span>}
              </div>
            </div>
          )}

          {((selectedMechanicForDetails.phone?.length > 0) || (selectedMechanicForDetails.emails?.length > 0) || selectedMechanicForDetails.websiteUrl) && (
            <div>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <Phone size={16} className="text-primary" /> Contact Information
              </h4>
              <div className="flex flex-col gap-4 rounded-xl border border-border/30 bg-secondary/10 p-4 shadow-sm">
                {(() => {
                  let phoneCount = 0;
                  let telCount = 0;
                  return selectedMechanicForDetails.phone?.map((p: any, idx: number) => {
                    let label = '';
                    if (p.isTelephone) {
                      telCount++;
                      label = telCount === 1 ? 'Primary Landline' : telCount === 2 ? 'Secondary Landline' : `Secondary Landline ${telCount - 1}`;
                    } else {
                      phoneCount++;
                      label = phoneCount === 1 ? 'Primary Contact' : phoneCount === 2 ? 'Secondary Contact' : `Secondary Contact ${phoneCount - 1}`;
                    }
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col gap-3">
                          <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            <span className="text-muted-foreground">👤</span> {label}
                          </span>
                          <div className="flex flex-wrap gap-2.5">
                            <a href={`tel:${p.number}`} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-blue-500/10 px-4 py-2.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-blue-500/25 active:scale-95" title="Call">
                              <Phone size={16} /> Call
                            </a>
                            {p.isWhatsapp && (
                              <a href={`https://wa.me/91${p.number}`} target="_blank" rel="noreferrer" className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-green-500/10 px-4 py-2.5 text-sm font-bold text-green-600 transition-all hover:bg-green-500 hover:text-white shadow-sm hover:shadow-green-500/25 active:scale-95" title="WhatsApp">
                                <MessageCircle size={16} /> WhatsApp
                              </a>
                            )}
                            {!p.isTelephone && (
                              <a href={`sms:${p.number}`} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-purple-500/10 px-4 py-2.5 text-sm font-bold text-purple-600 transition-all hover:bg-purple-500 hover:text-white shadow-sm hover:shadow-purple-500/25 active:scale-95" title="SMS">
                                <MessageSquare size={16} /> SMS
                              </a>
                            )}
                          </div>
                        </div>
                        {idx < selectedMechanicForDetails.phone.length - 1 && <hr className="border-border/50" />}
                      </React.Fragment>
                    );
                  });
                })()}

                {selectedMechanicForDetails.phone?.length > 0 && selectedMechanicForDetails.emails?.length > 0 && (
                  <hr className="border-border/50" />
                )}
                
                {selectedMechanicForDetails.emails?.map((email: string, idx: number) => {
                  const label = idx === 0 ? 'Primary Email' : idx === 1 ? 'Secondary Email' : `Secondary Email ${idx}`;
                  return (
                    <React.Fragment key={`email-${idx}`}>
                      <div className="flex flex-col gap-3">
                        <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <span className="text-muted-foreground">✉️</span> {label}
                        </span>
                        <div className="flex flex-wrap gap-2.5">
                          <a href={`mailto:${email}`} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2.5 text-sm font-bold text-orange-600 transition-all hover:bg-orange-500 hover:text-white shadow-sm hover:shadow-orange-500/25 active:scale-95" title="Email">
                            <Mail size={16} /> Send Email
                          </a>
                        </div>
                      </div>
                      {idx < selectedMechanicForDetails.emails.length - 1 && <hr className="border-border/50" />}
                    </React.Fragment>
                  );
                })}

                {(selectedMechanicForDetails.phone?.length > 0 || selectedMechanicForDetails.emails?.length > 0) && selectedMechanicForDetails.websiteUrl && (
                  <hr className="border-border/50" />
                )}
                
                {selectedMechanicForDetails.websiteUrl && (
                  <div className="flex flex-col gap-3">
                    <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span className="text-muted-foreground">🌐</span> Website
                    </span>
                    <div className="flex flex-wrap gap-2.5">
                      <a href={selectedMechanicForDetails.websiteUrl.startsWith('http') ? selectedMechanicForDetails.websiteUrl : `https://${selectedMechanicForDetails.websiteUrl}`} target="_blank" rel="noreferrer" className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-teal-500/10 px-4 py-2.5 text-sm font-bold text-teal-600 transition-all hover:bg-teal-500 hover:text-white shadow-sm hover:shadow-teal-500/25 active:scale-95" title="Website">
                        <Globe size={16} /> Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {selectedMechanicForDetails.vehicleTypes && selectedMechanicForDetails.vehicleTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Navigation size={16} className="text-primary"/> Supported Vehicles</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMechanicForDetails.vehicleTypes.map((v: string) => (
                  <span key={v} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-bold">{v}</span>
                ))}
              </div>
            </div>
          )}

          {selectedMechanicForDetails.serviceTypes && selectedMechanicForDetails.serviceTypes.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2"><Wrench size={16} className="text-primary"/> Services Offered</h4>
              <div className="flex flex-wrap gap-2">
                {selectedMechanicForDetails.serviceTypes.map((s: string) => (
                  <span key={s} className="bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs font-medium text-foreground">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="shrink-0 p-4 border-t border-border/50 bg-muted/10 flex gap-2">
           {selectedMechanicForDetails.phone?.[0] && (
             <a href={`tel:${selectedMechanicForDetails.phone[0].number}`} className="flex-1 bg-secondary/80 hover:bg-primary hover:text-primary-foreground text-foreground h-12 rounded-xl flex justify-center items-center active:scale-95 transition-all font-bold text-sm gap-2 border border-border/50">
               <Phone size={18} /> Call
             </a>
           )}
           <button onClick={() => { onClose(); onNavigate(); }} className="flex-[1.5] bg-primary text-primary-foreground h-12 rounded-xl flex justify-center items-center hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20 font-bold text-sm gap-2">
             <Navigation size={18} /> Navigate
           </button>
        </div>
      </div>
    </div>
  );
}
