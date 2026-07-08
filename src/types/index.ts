export interface User {
  id: number;
  username: string;
  role: string;
  allowedScreens: string[];
  createdAt: string;
}

export interface Mechanic {
  id: number;
  name?: string;
  businessName?: string;
  mechanicName?: string;
  mechanicType?: string;
  phone: any; // Can be string or array of objects
  alternatePhone?: string;
  email?: any;
  emails?: any;
  state: string;
  district: string;
  city: string;
  country?: string;
  mapLink?: string;
  experience?: string;
  specializedVehicle?: string;
  vehicleTypes?: any[];
  serviceTypes?: any[];
  servicesAvailable?: string;
  status: string;
  description?: string;
  address?: string;
  landmark?: string;
  area?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  evSupport?: boolean;
  homeService?: boolean;
  roadsideAssistance?: boolean;
  is24Hours?: boolean;
  holidayWorking?: boolean;
  operatingDays?: any[];
  operatingHours?: string;
  availability?: boolean;
  websiteUrl?: string;
  image?: string;
  imageUrl?: string;
  services?: any[];
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: number;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  id: number;
  name: string;
  amount: number;
  createdAt: string;
}

export interface UpdateRequest {
  id: number;
  mechanicId: number;
  updatedData: Partial<Mechanic>;
  status: string;
  createdAt: string;
  Mechanic?: Mechanic;
  Requestor?: { username: string };
}

export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  details: string;
  createdAt: string;
  User?: { username: string };
}
