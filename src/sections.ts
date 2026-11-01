export const sectionIds = [
  'dashboard',
  'orders',
  'customers',
  'quotes',
  'deliveries',
  'money',
  'partners',
  'marketing',
  'reports',
  'settings',
] as const

export type SectionId = (typeof sectionIds)[number]

export type Section = {
  id: SectionId
  label: string
  description: string
  navLabel: string
}

export const sections: readonly Section[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Daily overview',
    navLabel: 'Home',
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Create, update, and track sample orders',
    navLabel: 'Orders',
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Customer management',
    navLabel: 'Customers',
  },
  {
    id: 'quotes',
    label: 'Quotes & Pricing',
    description: 'Editable practice fees and earnings',
    navLabel: 'Quotes',
  },
  {
    id: 'deliveries',
    label: 'Deliveries',
    description: 'Daily plan and manual stop order',
    navLabel: 'Route',
  },
  {
    id: 'money',
    label: 'Money',
    description: 'Income, expenses, and profit',
    navLabel: 'Money',
  },
  {
    id: 'partners',
    label: 'Partners',
    description: 'Local business partnerships',
    navLabel: 'Partners',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Campaigns and follow-ups',
    navLabel: 'Marketing',
  },
  {
    id: 'reports',
    label: 'Reports',
    description: 'Business performance',
    navLabel: 'Reports',
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Hours, services, areas, and payments',
    navLabel: 'Settings',
  },
]

export const primaryNav: readonly SectionId[] = [
  'dashboard',
  'orders',
  'deliveries',
  'money',
]

export function isSectionId(value: string): value is SectionId {
  return (sectionIds as readonly string[]).includes(value)
}

export function getSection(id: SectionId): Section {
  const section = sections.find((item) => item.id === id)

  if (!section) {
    return sections[0]
  }

  return section
}
