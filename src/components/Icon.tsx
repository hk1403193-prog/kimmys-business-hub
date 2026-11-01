import type { ReactNode } from 'react'
import type { SectionId } from '../sections'

type IconName = SectionId | 'more'

type IconProps = {
  name: IconName
}

export function Icon({ name }: IconProps) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {iconShapes[name]}
    </svg>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const iconShapes: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" {...stroke} />
      <rect x="13" y="4" width="7" height="7" rx="1.5" {...stroke} />
      <rect x="4" y="13" width="7" height="7" rx="1.5" {...stroke} />
      <rect x="13" y="13" width="7" height="7" rx="1.5" {...stroke} />
    </>
  ),
  orders: (
    <>
      <path d="M8 4.5h8l1 2H7l1-2Z" {...stroke} />
      <path d="M7 6.5h10v13H7v-13Z" {...stroke} />
      <path d="M9.5 11h5M9.5 14.5h5" {...stroke} />
    </>
  ),
  customers: (
    <>
      <circle cx="9" cy="9" r="2.2" {...stroke} />
      <circle cx="15.5" cy="9.5" r="1.8" {...stroke} />
      <path d="M4.8 17.5c.6-2.2 2.2-3.3 4.2-3.3s3.6 1.1 4.2 3.3" {...stroke} />
      <path d="M13.2 14.4c1.3-.3 2.6.1 3.4 1.1.7.8 1 1.6 1.2 2" {...stroke} />
    </>
  ),
  quotes: (
    <>
      <path d="M5 7.5h9.5a3 3 0 0 1 0 6H8" {...stroke} />
      <path d="M8 13.5h7.2a2.6 2.6 0 0 1 0 5.2H6" {...stroke} />
      <path d="M7 5.5v13" {...stroke} />
    </>
  ),
  deliveries: (
    <>
      <path d="M12 20s5-4.4 5-8.2A5 5 0 0 0 7 11.8C7 15.6 12 20 12 20Z" {...stroke} />
      <circle cx="12" cy="11.5" r="1.6" {...stroke} />
    </>
  ),
  money: (
    <>
      <circle cx="12" cy="12" r="7.2" {...stroke} />
      <path d="M12 7.2v9.6" {...stroke} />
      <path
        d="M14.6 9.1c-.3-.8-1.2-1.3-2.4-1.3-1.4 0-2.3.7-2.3 1.7 0 2.2 4.8 1.1 4.8 3.5 0 1-.9 1.8-2.4 1.8-1.2 0-2.1-.5-2.5-1.4"
        {...stroke}
      />
    </>
  ),
  partners: (
    <>
      <path d="M4 19.5h16" {...stroke} />
      <path d="M6 19.5V8.5L12 5l6 3.5v11" {...stroke} />
      <path d="M10 19.5v-4h4v4" {...stroke} />
    </>
  ),
  marketing: (
    <>
      <path d="M5 10.5v3l9 3.5V7L5 10.5Z" {...stroke} />
      <path d="M14 9.2c1.4.7 2.3 1.6 2.3 2.8S15.4 14.1 14 14.8" {...stroke} />
      <path d="M8 13.5v2.2c0 .8.5 1.5 1.3 1.8" {...stroke} />
    </>
  ),
  reports: (
    <>
      <path d="M5 19.5h14" {...stroke} />
      <path d="M7.5 16.5v-4M12 16.5V7.5M16.5 16.5v-6" {...stroke} />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" {...stroke} />
      <path
        d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.7 6.7l1.6 1.6M15.7 15.7l1.6 1.6M17.3 6.7l-1.6 1.6M8.3 15.7l-1.6 1.6"
        {...stroke}
      />
    </>
  ),
  more: (
    <>
      <circle cx="7" cy="12" r="1.2" fill="currentColor" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      <circle cx="17" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
}
