import type { PracticeStatus } from '../domain/types'

export function practiceStatusClass(status: PracticeStatus): string {
  switch (status) {
    case 'New':
      return 'pill-new'
    case 'Quoted':
    case 'Awaiting Payment':
      return 'pill-accepted'
    case 'Confirmed':
    case 'Shopping':
    case 'Picked Up':
      return 'pill-shopping'
    case 'Out for Delivery':
      return 'pill-out'
    case 'Delivered':
    case 'Completed':
      return 'pill-delivered'
    case 'Canceled':
      return 'pill-canceled'
  }
}

export function PracticeStatusPill({ status }: { status: PracticeStatus }) {
  return <span className={`pill ${practiceStatusClass(status)}`}>{status}</span>
}
