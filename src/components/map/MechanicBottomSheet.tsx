import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Wrench, MapPin, Phone, MessageCircle, MessageSquare, Mail, Globe, Navigation, Heart, ChevronLeft, X } from 'lucide-react';
import { getMechanicStatus, getDistanceFromLatLonInKm } from '../../utils/mechanicUtils';
import L from 'leaflet';

interface MechanicBottomSheetProps {
  selectedMechanic: any;
  setSelectedMechanic: (mechanic: any | null) => void;
  nearbyMechanics: any[];
  sheetState: 0 | 1 | 2;
  setSheetState: (state: 0 | 1 | 2 | ((prev: 0 | 1 | 2) => 0 | 1 | 2)) => void;
  userLocation: [number, number] | null;
  drivingTime: string | null;
  touchStart: number | null;
  dragOffset: number;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  setIsDetailsOpen: (open: boolean) => void;
  setSelectedMechanicForDetails: (mechanic: any) => void;
  openExternalNavigation: (mechanic: any) => void;
  setIsFeedbackOpen: (open: boolean) => void;
  mapInstance: L.Map | null;
}

export function MechanicBottomSheet({
  selectedMechanic,
  setSelectedMechanic,
  nearbyMechanics,
  sheetState,
  setSheetState,
  userLocation,
  drivingTime,
  touchStart,
  dragOffset,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  setIsDetailsOpen,
  setSelectedMechanicForDetails,
  openExternalNavigation,
  setIsFeedbackOpen,
  mapInstance
}: MechanicBottomSheetProps) {
  const navigate = useNavigate();

  if (!selectedMechanic) return null;

  const getSheetHeightClass = () => {
    if (sheetState === 0) return 'h-[35vh] sm:h-auto sm:max-h-[calc(100vh-14rem)]';
    if (sheetState === 1) return 'h-[50vh] sm:h-auto sm:max-h-[calc(100vh-14rem)]';
    return 'h-[80vh] sm:h-[calc(100vh-14rem)]';
  };

  return (
    <div 
      className={`fixed sm:absolute bottom-[72px] sm:bottom-auto sm:left-6 sm:top-32 w-full sm:w-[450px] lg:w-[500px] z-[500] flex flex-col pointer-events-none rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl pb-safe sm:pb-0 ${getSheetHeightClass()} ${touchStart !== null ? 'transition-none' : 'transition-all duration-300'}`}
      style={dragOffset !== 0 ? { transform: `translateY(${dragOffset}px)` } : undefined}
    >
      <div className="bg-card border-t sm:border border-border flex flex-col pointer-events-auto flex-1 min-h-0 w-full sm:pt-4 relative">
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedMechanic(null); }}
          className="absolute top-3 right-4 sm:top-4 sm:right-5 p-2 bg-secondary/50 hover:bg-secondary rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
        </button>
        {/* Mobile handle - The ONLY draggable part */}
        <div 
          className="w-full flex justify-center py-5 sm:hidden cursor-pointer touch-none shrink-0" 
          onClick={() => setSheetState(prev => prev === 2 ? 1 : 2)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className="w-12 h-1.5 bg-muted rounded-full"></div>
        </div>
        
        {/* The Single Scrollable Container */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-6">
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 flex gap-4 relative">
            {selectedMechanic.image ? (
              <div 
                className="relative shrink-0 overflow-hidden rounded-xl w-20 h-20 group/img cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                onClick={(e) => { e.stopPropagation(); setSelectedMechanicForDetails(selectedMechanic); setIsDetailsOpen(true); }}
              >
                <img src={selectedMechanic.image} alt={selectedMechanic.businessName || selectedMechanic.name} className="w-full h-full object-cover bg-secondary group-hover/img:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <Eye className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </div>
            ) : (
              <div 
                className="w-20 h-20 bg-secondary rounded-xl flex items-center justify-center shrink-0 relative group/img cursor-pointer shadow-sm hover:shadow-md overflow-hidden transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedMechanicForDetails(selectedMechanic); setIsDetailsOpen(true); }}
              >
                <Wrench className="w-8 h-8 text-muted-foreground/30" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <Eye className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0 pr-10">
              <h3 className="text-lg font-bold text-foreground mb-1 leading-tight truncate">{selectedMechanic.businessName || selectedMechanic.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                <MapPin className="w-4 h-4 shrink-0" /> {selectedMechanic.landmark ? `${selectedMechanic.landmark}, ` : ''}{selectedMechanic.area}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-secondary rounded-md">
                  <div className={`w-2 h-2 rounded-full ${getMechanicStatus(selectedMechanic) === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {getMechanicStatus(selectedMechanic)}
                </div>
                <div className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-md whitespace-nowrap">
                  {drivingTime ? `${drivingTime} ` : ''}{userLocation ? `(${getDistanceFromLatLonInKm(userLocation[0], userLocation[1], selectedMechanic.latitude, selectedMechanic.longitude).toFixed(1)} km)` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Action Icons Row */}
          <div className="flex justify-around items-center px-4 py-3 border-y border-border/50 gap-2 shrink-0">
             {selectedMechanic.phone?.[0] && (
               <a href={`tel:${selectedMechanic.phone[0].number}`} className="p-3 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors shrink-0">
                 <Phone className="w-5 h-5" />
               </a>
             )}
             {selectedMechanic.phone?.[0]?.isWhatsapp && (
               <a href={`https://wa.me/91${selectedMechanic.phone[0].number}`} target="_blank" rel="noreferrer" className="p-3 bg-green-500/10 text-green-600 rounded-full hover:bg-green-500/20 transition-colors shrink-0">
                 <MessageCircle className="w-5 h-5" />
               </a>
             )}
             {selectedMechanic.phone?.[0] && (
               <a href={`sms:${selectedMechanic.phone[0].number}`} className="p-3 bg-blue-500/10 text-blue-600 rounded-full hover:bg-blue-500/20 transition-colors shrink-0">
                 <MessageSquare className="w-5 h-5" />
               </a>
             )}
             {selectedMechanic.email && (
               <a href={`mailto:${selectedMechanic.email}`} className="p-3 bg-orange-500/10 text-orange-600 rounded-full hover:bg-orange-500/20 transition-colors shrink-0">
                 <Mail className="w-5 h-5" />
               </a>
             )}
             {selectedMechanic.websiteUrl && (
               <a href={selectedMechanic.websiteUrl} target="_blank" rel="noreferrer" className="p-3 bg-purple-500/10 text-purple-600 rounded-full hover:bg-purple-500/20 transition-colors shrink-0">
                 <Globe className="w-5 h-5" />
               </a>
             )}
             <button onClick={() => {
               openExternalNavigation(selectedMechanic);
             }} className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 border border-border shadow-sm transition-colors shrink-0">
               <Navigation className="w-5 h-5" />
             </button>
          </div>

          {/* Community Action Buttons */}
          <div className="flex gap-3 px-4 py-3 shrink-0 border-b border-border/50">
            <button onClick={() => setIsFeedbackOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/50 text-primary font-bold text-sm bg-primary/5 hover:bg-primary/10 transition-colors shadow-[0_0_8px_rgba(249,115,22,0.3)] animate-pulse">
              <MessageSquare className="w-4 h-4 text-primary" /> Feedback
            </button>
            <button onClick={() => navigate('/donate')} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-pink-500/50 text-pink-500 font-bold text-sm bg-pink-500/5 hover:bg-pink-500/10 transition-colors shadow-[0_0_8px_rgba(236,72,153,0.5)] animate-pulse">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500/50" /> Donate
            </button>
          </div>

          {/* Extended Details for sheetState > 0 */}
          {(sheetState > 0) && (
            <div className="p-4 sm:p-5 animate-in fade-in duration-300">
              <div className="mb-4">
                <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Nearby Mechanics
                </h4>
                <p className="mb-3 text-xs text-muted-foreground">
                  Closest alternatives to this mechanic based on current map results.
                </p>
                <div className="flex flex-col gap-3">
                  {nearbyMechanics.map((m: any) => (
                    <div 
                      key={m.id}
                      onClick={() => {
                        setSelectedMechanic(m);
                        setSheetState(1);
                        mapInstance?.flyTo([m.latitude, m.longitude], 15);
                      }}
                      className="bg-background border border-border rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {m.image ? (
                        <img src={m.image} alt={m.businessName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                          <Wrench className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm text-foreground truncate">{m.businessName || m.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">{m.distToSelected?.toFixed(1)} km away • {m.area}</p>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                    </div>
                  ))}
                  {nearbyMechanics.length === 0 && (
                    <p className="text-sm text-muted-foreground">No other mechanics nearby.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
