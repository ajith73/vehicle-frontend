export const MECHANIC_DOCS_CONFIG: Record<string, { mandatory: string[], optional: string[] }> = {
  'Individual Mechanic': {
    mandatory: ['Aadhaar / DL / Voter ID Link', 'Selfie Photo Link', 'Current Address'],
    optional: ['Experience Certificate Link', 'Mechanic ID Card Link', 'Profile Photo Link']
  },
  'Workshop / Garage': {
    mandatory: ['Owner ID Proof Link', 'Shop Photo (Front View) Link', 'Shop Address'],
    optional: ['GST Certificate Link', 'Shop Registration Link', 'Trade License Link', 'Inside Shop Photos Link', 'Business Logo Link']
  },
  'Authorized Service Center': {
    mandatory: ['Owner/Manager ID Link', 'Shop Front Photo Link', 'Official Brand Name'],
    optional: ['Brand Authorization Certificate Link', 'GST Certificate Link', 'Business Registration Link', 'Trade License Link']
  },
  'Mobile Mechanic': {
    mandatory: ['Aadhaar / Driving License Link', 'Selfie Link', 'Vehicle Photo Link', 'Vehicle Registration (RC) Link'],
    optional: ['Experience Proof Link', 'Tool Kit Photos Link', 'Police Verification Certificate Link']
  },
  'Towing Company': {
    mandatory: ['Company/Owner ID Link', 'Tow Truck Photo Link', 'RC Book of Tow Vehicle Link', 'Driving License Link'],
    optional: ['Commercial Vehicle Permit Link', 'Insurance Certificate Link', 'GST Link', 'Fleet Photos Link']
  },
  'Fuel Delivery Partner': {
    mandatory: ['Owner ID Link', 'Delivery Vehicle Photo Link', 'Vehicle RC Link'],
    optional: ['Petroleum License Link', 'Business Registration Link', 'GST Link', 'Insurance Link']
  }
};

export const INDIAN_LANGUAGES = [
  { value: 'Hindi', label: 'Hindi' },
  { value: 'English', label: 'English' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Malayalam', label: 'Malayalam' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Urdu', label: 'Urdu' }
];

export const getSelectStyles = (hasError = false) => ({
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 42,
    backgroundColor: 'hsl(var(--background))',
    borderColor: hasError ? '#ef4444' : (state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))'),
    boxShadow: hasError
      ? '0 0 0 1px rgba(239, 68, 68, 0.5)'
      : (state.isFocused ? '0 0 0 2px color-mix(in srgb, hsl(var(--primary)) 18%, transparent)' : 'none'),
    '&:hover': {
      borderColor: hasError ? '#ef4444' : (state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))')
    }
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: 'hsl(var(--card))',
    color: 'hsl(var(--foreground))',
    zIndex: 90
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? 'color-mix(in srgb, hsl(var(--primary)) 12%, hsl(var(--card)))' : 'hsl(var(--card))',
    color: 'hsl(var(--foreground))'
  }),
  multiValue: (base: any) => ({
    ...base,
    backgroundColor: 'hsl(var(--primary))',
    borderRadius: '4px'
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'hsl(var(--primary-foreground))'
  }),
  multiValueRemove: (base: any) => ({
    ...base,
    color: 'hsl(var(--primary-foreground))',
    ':hover': {
      backgroundColor: 'hsl(var(--destructive))',
      color: 'hsl(var(--destructive-foreground))'
    }
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  }),
  input: (base: any) => ({
    ...base,
    color: 'hsl(var(--foreground))'
  })
});
