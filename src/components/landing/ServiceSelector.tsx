import React, { useState } from 'react';
import { Wrench, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { getServiceIcon } from '../../utils/iconUtils';

interface ServiceSelectorProps {
  services: any[];
  isLoadingOptions: boolean;
  selectedService: string;
  setSelectedService: (val: string) => void;
}

export function ServiceSelector({ services, isLoadingOptions, selectedService, setSelectedService }: ServiceSelectorProps) {
  const [showAllServices, setShowAllServices] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-4 sm:px-8">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
        <Wrench className="h-6 w-6 text-primary" /> Select Service
      </h3>
      <div className="flex snap-x gap-2 overflow-x-auto pb-2 hide-scrollbar sm:grid sm:grid-cols-5 sm:gap-3 md:grid-cols-7">
        {isLoadingOptions ? (
          Array(7).fill(0).map((_, i) => (
            <div key={i} className="h-20 w-24 shrink-0 rounded-2xl border-2 border-border/50 bg-secondary/50 animate-pulse sm:h-24 sm:w-full"></div>
          ))
        ) : (
          <>
            <button
              onClick={() => setSelectedService('')}
              className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                selectedService === '' ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
              }`}
            >
              <Zap className="mb-1 h-6 w-6" />
              <span className="text-xs font-bold">All</span>
            </button>
            {services
              .filter((service) => showAllServices || service.isFeatured || (!showAllServices && services.every((item) => !item.isFeatured)))
              .map((service) => {
                const Icon = getServiceIcon(service.name);
                return (
                  <button
                    key={service.name}
                    onClick={() => setSelectedService(service.name)}
                    className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                      selectedService === service.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <Icon className="mb-1 h-6 w-6" />
                    <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{service.name}</span>
                  </button>
                );
              })}
            {services.some((service) => service.isFeatured) && services.some((service) => !service.isFeatured) && (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:text-primary sm:h-24 sm:w-full"
              >
                {showAllServices ? <ChevronUp className="mb-1 h-6 w-6" /> : <ChevronDown className="mb-1 h-6 w-6" />}
                <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{showAllServices ? 'Show Less' : 'Show More'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
