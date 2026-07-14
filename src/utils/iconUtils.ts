import {
  Activity, AlertTriangle, AlignJustify, Battery, BatteryWarning,
  Bike, Bus, Car, Circle, Disc, Droplets, Fan, Fuel, Key,
  Link as LinkIcon, Navigation, Scale, Settings, ShieldAlert,
  Thermometer, Tractor, Truck, Wind, Wrench, Zap
} from 'lucide-react';

export const VEHICLE_ICONS: Record<string, any> = {
  Auto: Zap,
  Bike,
  Bus,
  Car,
  Crane: Tractor,
  'Earth Mover': Tractor,
  'Electric Bike': Zap,
  'Electric Car': Zap,
  JCB: Tractor,
  Pickup: Truck,
  SUV: Car,
  Scooter: Bike,
  Tractor,
  Truck,
  Van: Truck
};

export const SERVICE_ICONS: Record<string, any> = {
  'AC Repair': Fan,
  'Accident Recovery': ShieldAlert,
  'Air Filter Replacement': Wind,
  'Battery Jumpstart': BatteryWarning,
  'Battery Replacement': Battery,
  'Brake Service': Disc,
  'Chain Adjustment': LinkIcon,
  'Clutch Repair': Disc,
  'Coolant Top-up': Thermometer,
  'Electrical Repair': Zap,
  'Emergency Breakdown': AlertTriangle,
  'Engine Diagnostics': Activity,
  'Engine Repair': Wrench,
  'Fuel Delivery': Fuel,
  'General Service': Settings,
  'Jump Start': BatteryWarning,
  'Key Lockout Assistance': Key,
  'Oil Change': Droplets,
  'Puncture Repair': Circle,
  'Spark Plug Replacement': Zap,
  'Suspension Repair': Settings,
  'Towing Services': Truck,
  'Tyre Replacement': Circle,
  'Wheel Alignment': AlignJustify,
  'Wheel Balancing': Scale
};

export const getVehicleIcon = (name: string) => VEHICLE_ICONS[name] || Navigation;
export const getServiceIcon = (name: string) => SERVICE_ICONS[name] || Wrench;
