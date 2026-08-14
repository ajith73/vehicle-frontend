import React, { useState } from 'react';
import { Wrench, Zap, ChevronUp, ChevronDown } from 'lucide-react';

import acRepair from '../../assets/specificServices/acRepair.png';
import accidentRecovery from '../../assets/specificServices/accidentRecovery.png';
import airFilterReplacement from '../../assets/specificServices/airFilterReplacement.png';
import batteryJumpstart from '../../assets/specificServices/batteryJumpstart.png';
import batteryReplacement from '../../assets/specificServices/batteryReplacement.png';
import brakeService from '../../assets/specificServices/brakeService.png';
import chainAdjustment from '../../assets/specificServices/chainAdjustment.png';
import clutchRepair from '../../assets/specificServices/clutchRepair.png';
import coolantTopup from '../../assets/specificServices/coolantTopup.png';
import electricalRepair from '../../assets/specificServices/electricalRepair.png';
import emergencyBreakdown from '../../assets/specificServices/emergencyBreakdown.png';
import engineDiagnostics from '../../assets/specificServices/engineDiagnostics.png';
import engineRepair from '../../assets/specificServices/engineRepair.png';
import fuelDelivery from '../../assets/specificServices/fuelDelivery.png';
import generalService from '../../assets/specificServices/generalService.png';
import jumpStart from '../../assets/specificServices/jumpStart.png';
import keyLockoutAssistance from '../../assets/specificServices/keyLockoutAssistance.png';
import oilChange from '../../assets/specificServices/oilChange.png';
import punctureRepair from '../../assets/specificServices/punctureRepair.png';
import sparkPlugReplacement from '../../assets/specificServices/sparkPlugReplacement.png';
import suspensionRepair from '../../assets/specificServices/suspensionRepair.png';
import towingServices from '../../assets/specificServices/towingServices.png';
import tyreReplacement from '../../assets/specificServices/tyreReplacement.png';
import wheelAlignment from '../../assets/specificServices/wheelAlignment.png';
import wheelBalancing from '../../assets/specificServices/wheelBalancing.png';

const SERVICE_IMAGES: Record<string, string> = {
  'AC Repair': acRepair,
  'Accident Recovery': accidentRecovery,
  'Air Filter Replacement': airFilterReplacement,
  'Battery Jumpstart': batteryJumpstart,
  'Battery Replacement': batteryReplacement,
  'Brake Service': brakeService,
  'Chain Adjustment': chainAdjustment,
  'Clutch Repair': clutchRepair,
  'Coolant Top-up': coolantTopup,
  'Electrical Repair': electricalRepair,
  'Emergency Breakdown': emergencyBreakdown,
  'Engine Diagnostics': engineDiagnostics,
  'Engine Repair': engineRepair,
  'Fuel Delivery': fuelDelivery,
  'General Service': generalService,
  'Jump Start': jumpStart,
  'Key Lockout Assistance': keyLockoutAssistance,
  'Oil Change': oilChange,
  'Puncture Repair': punctureRepair,
  'Spark Plug Replacement': sparkPlugReplacement,
  'Suspension Repair': suspensionRepair,
  'Towing Services': towingServices,
  'Tyre Replacement': tyreReplacement,
  'Wheel Alignment': wheelAlignment,
  'Wheel Balancing': wheelBalancing,
};

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
              <Zap className="mb-2 h-8 w-8 sm:h-10 sm:w-10 text-current" />
              <span className="text-xs font-bold">All</span>
            </button>
            {services
              .filter((service) => showAllServices || service.isFeatured || (!showAllServices && services.every((item) => !item.isFeatured)))
              .map((service) => {
                const imageSrc = SERVICE_IMAGES[service.name] || generalService;
                return (
                  <button
                    key={service.name}
                    onClick={() => setSelectedService(service.name)}
                    className={`flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 transition-all active:scale-95 hover:scale-[1.02] sm:h-24 sm:w-full ${
                      selectedService === service.name ? 'border-primary bg-primary/10 text-primary shadow-md' : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                    }`}
                  >
                    <img src={imageSrc} alt={service.name} className="mb-2 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain" />
                    <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{service.name}</span>
                  </button>
                );
              })}
            {services.some((service) => service.isFeatured) && services.some((service) => !service.isFeatured) && (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="flex h-20 w-24 snap-start flex-none flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-all hover:border-primary/50 hover:text-primary sm:h-24 sm:w-full"
              >
                {showAllServices ? <ChevronUp className="mb-2 h-8 w-8 sm:h-10 sm:w-10" /> : <ChevronDown className="mb-2 h-8 w-8 sm:h-10 sm:w-10" />}
                <span className="px-1 text-center text-[11px] font-bold leading-tight sm:text-xs">{showAllServices ? 'Show Less' : 'Show More'}</span>
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
