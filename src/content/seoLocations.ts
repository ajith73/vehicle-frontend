export type CitySeoConfig = {
  slug: string;
  name: string;
  region: string;
  nearbyAreas: string[];
  highlights: string[];
  services: string[];
  vehicleTypes: string[];
};

export type ServiceSeoConfig = {
  slug: string;
  name: string;
  shortLabel: string;
  keywords: string[];
  trustPoints: string[];
};

export const citySeoConfigs: CitySeoConfig[] = [
  {
    slug: 'coimbatore',
    name: 'Coimbatore',
    region: 'Tamil Nadu',
    nearbyAreas: ['Gandhipuram', 'RS Puram', 'Peelamedu', 'Singanallur'],
    highlights: ['Industrial and commuter traffic', 'Two-wheeler and car service demand', 'High search intent for roadside help'],
    services: ['Puncture repair', 'Battery jump start', 'Emergency towing', 'General mechanic support'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'SUV']
  },
  {
    slug: 'chennai',
    name: 'Chennai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Velachery', 'Tambaram', 'Anna Nagar', 'OMR'],
    highlights: ['Large metro coverage', 'Heavy commuter traffic', 'Strong need for fast local matching'],
    services: ['Car mechanic', 'Bike mechanic', 'Towing support', 'Breakdown assistance'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Van']
  },
  {
    slug: 'madurai',
    name: 'Madurai',
    region: 'Tamil Nadu',
    nearbyAreas: ['Anna Nagar', 'KK Nagar', 'Mattuthavani', 'Thiruparankundram'],
    highlights: ['Mixed urban and highway movement', 'Tour and family travel routes', 'Local workshop discovery need'],
    services: ['Towing', 'Puncture support', 'Battery support', 'General service'],
    vehicleTypes: ['Car', 'Bike', 'Auto', 'SUV']
  },
  {
    slug: 'trichy',
    name: 'Trichy',
    region: 'Tamil Nadu',
    nearbyAreas: ['Srirangam', 'Thillai Nagar', 'Cantonment', 'KK Nagar'],
    highlights: ['Transit city search demand', 'Regional road travel support', 'Quick mechanic visibility matters'],
    services: ['Roadside assistance', 'Mechanic search', 'Tyre help', 'Towing'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'Van']
  },
  {
    slug: 'salem',
    name: 'Salem',
    region: 'Tamil Nadu',
    nearbyAreas: ['Fairlands', 'Suramangalam', 'Hasthampatti', 'Ammapet'],
    highlights: ['Highway-linked local searches', 'Commercial and family vehicle movement', 'Repair urgency during travel'],
    services: ['Emergency mechanic', 'Battery jump start', 'Tow support', 'Workshop search'],
    vehicleTypes: ['Car', 'Bike', 'Truck', 'SUV']
  },
  {
    slug: 'erode',
    name: 'Erode',
    region: 'Tamil Nadu',
    nearbyAreas: ['Perundurai', 'Sathy Road', 'Surampatti', 'Veerappanchatram'],
    highlights: ['Strong intercity travel flow', 'Small workshop discovery gap', 'Useful for local and passing drivers'],
    services: ['Mechanic listings', 'Puncture repair', 'Breakdown support', 'Towing'],
    vehicleTypes: ['Car', 'Bike', 'Scooter', 'Truck']
  }
];

export const serviceSeoConfigs: ServiceSeoConfig[] = [
  {
    slug: 'car-mechanic',
    name: 'Car Mechanic',
    shortLabel: 'car mechanic',
    keywords: ['car mechanic near me', 'car service shop', 'car breakdown help'],
    trustPoints: ['Car-focused repair support', 'Nearby workshop discovery', 'Fast search-to-contact flow']
  },
  {
    slug: 'bike-mechanic',
    name: 'Bike Mechanic',
    shortLabel: 'bike mechanic',
    keywords: ['bike mechanic near me', 'two wheeler repair', 'motorcycle roadside help'],
    trustPoints: ['Bike and scooter repair visibility', 'Two-wheeler roadside support', 'Local shop discovery']
  },
  {
    slug: 'towing',
    name: 'Towing Service',
    shortLabel: 'towing service',
    keywords: ['towing near me', 'vehicle towing', 'breakdown towing support'],
    trustPoints: ['Breakdown recovery support', 'Emergency tow discovery', 'Useful during non-drivable breakdowns']
  }
];

export const citySeoMap = Object.fromEntries(citySeoConfigs.map((city) => [city.slug, city]));
export const serviceSeoMap = Object.fromEntries(serviceSeoConfigs.map((service) => [service.slug, service]));
