import React from 'react';
import { Eye, MapPin, Phone, MessageCircle, Navigation, Wrench } from 'lucide-react';
import { getMechanicStatus } from '../../utils/mechanicUtils';

interface MechanicListCardProps {
  mechanic: any;
  onOpenDetails: (mechanic: any) => void;
  onNavigate: (id: number) => void;
}

export function MechanicListCard({ mechanic, onOpenDetails, onNavigate }: MechanicListCardProps) {
  const status = getMechanicStatus(mechanic);

  return (
    <div className="group flex cursor-pointer flex-col gap-4 rounded-[24px] border border-border/60 bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 sm:p-5">
      <div className="flex gap-4">
        {mechanic.image ? (
          <div
            className="group/img relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-md sm:h-28 sm:w-28"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(mechanic);
            }}
          >
            <img src={mechanic.image} alt={mechanic.businessName || mechanic.name} className="h-full w-full object-cover bg-secondary transition-transform duration-500 group-hover/img:scale-110" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/img:opacity-100">
              <Eye className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div
            className="group/img relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-border/50 bg-secondary/50 shadow-sm transition-colors duration-300 hover:shadow-md group-hover:bg-primary/5 sm:h-28 sm:w-28"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(mechanic);
            }}
          >
            <Wrench className="h-8 w-8 text-muted-foreground/30" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover/img:opacity-100">
              <Eye className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
          <div>
            <div className="mb-1.5 flex items-start justify-between gap-2">
              <h4 className="truncate text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">{mechanic.businessName || mechanic.name}</h4>
              {mechanic.dist !== null && mechanic.dist !== undefined && (
                <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
                  {mechanic.dist.toFixed(1)} km
                </span>
              )}
            </div>
            <p className="flex items-center gap-1.5 truncate text-[13px] font-medium text-muted-foreground">
              <MapPin size={14} className="shrink-0 text-primary/70" />
              <span className="truncate">{mechanic.landmark ? `${mechanic.landmark}, ` : ''}{mechanic.area}</span>
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              status === 'Available'
                ? 'border-green-500/20 bg-green-500/10 text-green-600'
                : 'border-red-500/20 bg-red-500/10 text-red-600'
            }`}>
              {status}
            </span>
            {mechanic.is24Hours && <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-600">24/7</span>}
            {mechanic.evSupport && <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">EV Ready</span>}
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 border-t border-border/40 pt-3">
        {mechanic.phone?.[0] && (
          <a href={`tel:${mechanic.phone[0].number}`} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/80 text-[13px] font-bold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-95">
            <Phone size={16} /> <span className="hidden sm:inline">Call</span>
          </a>
        )}
        {mechanic.phone?.[0]?.isWhatsapp && (
          <a href={`https://wa.me/91${mechanic.phone[0].number}`} target="_blank" rel="noreferrer" className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/80 text-[13px] font-bold text-foreground transition-all hover:bg-green-600 hover:text-white active:scale-95">
            <MessageCircle size={16} /> <span className="hidden sm:inline">WhatsApp</span>
          </a>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(mechanic.id);
          }}
          className="flex h-11 flex-[1.2] items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-bold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95"
        >
          <Navigation size={16} /> <span>Navigate</span>
        </button>
      </div>
    </div>
  );
}
