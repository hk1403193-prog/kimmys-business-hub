export const sampleHours: SampleHours[] = [
  { day: 'Monday', hours: '9:30 AM – 3:00 PM', open: true },
  { day: 'Tuesday', hours: '8:00 AM – 4:00 PM', open: true },
  { day: 'Wednesday', hours: '9:30 AM – 3:00 PM', open: true },
  { day: 'Thursday', hours: '8:00 AM – 4:00 PM', open: true },
  { day: 'Friday', hours: '9:30 AM – 3:00 PM', open: true },
  { day: 'Saturday', hours: '8:00 AM – 12:00 PM', open: true },
  { day: 'Sunday', hours: 'Closed', open: false },
]

export const sampleServices: SampleToggle[] = [
  {
    id: 'service-grocery',
    label: 'Grocery shopping & delivery',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-restaurant',
    label: 'Restaurant pickup & delivery',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-pharmacy',
    label: 'Pharmacy pickup',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-retail',
    label: 'Retail & store pickup',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-errands',
    label: 'Errands',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-post',
    label: 'Post office',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-business',
    label: 'Local business deliveries',
    detail: 'Matches live site.',
    on: true,
  },
  {
    id: 'service-recurring',
    label: 'Scheduled & recurring',
    detail: 'Matches live site.',
    on: true,
  },
]

export const sampleAreas: SampleToggle[] = [
  {
    id: 'area-many',
    label: 'Many',
    detail: 'Base service area — $10.',
    on: true,
  },
  {
    id: 'area-toledo',
    label: 'Toledo Town',
    detail: 'Nearby town — $15 total.',
    on: true,
  },
  {
    id: 'area-fisher',
    label: 'Fisher',
    detail: 'Nearby town — $15 total.',
    on: true,
  },
  {
    id: 'area-florien',
    label: 'Florien',
    detail: 'Nearby town — $15 total.',
    on: true,
  },
  {
    id: 'area-negreet',
    label: 'Negreet',
    detail: 'Nearby town — $15 total.',
    on: true,
  },
  {
    id: 'area-zwolle',
    label: 'Zwolle',
    detail: 'Nearby town — $15 total.',
    on: true,
  },
  {
    id: 'area-robeline',
    label: 'Robeline',
    detail: 'Nearby town — $15 total.',
    on: true,
  },
]

export const samplePartners: SamplePartner[] = [
  {
    id: 'P-1',
    name: 'The Blonde Barista',
    kind: 'Restaurant / Coffee',
    note: 'Real local partner from live site.',
    status: 'Active',
  },
  {
    id: 'P-2',
    name: 'Troy’s Butcher Shop',
    kind: 'Retail / Meat',
    note: 'Real local partner from live site.',
    status: 'Active',
  },
  {
    id: 'P-3',
    name: 'Local Market',
    kind: 'Grocery',
    note: 'Placeholder for general grocery pickups.',
    status: 'Sample active',
  },
]
