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
      return 'pill-delivered'
    case 'Completed':
      return 'pill-completed'
    case 'Canceled':
      return 'pill-canceled'
  }
}

export function statusMeaning(status: PracticeStatus): string {
  switch (status) {
    case 'Delivered':
      return 'Physically delivered. Not closed yet.'
    case 'Completed':
      return 'Closed. Kept in the history and left off upcoming deliveries.'
    case 'Canceled':
      return 'Canceled. Kept in the history and left off upcoming deliveries.'
    case 'Awaiting Payment':
      return 'Waiting in this practice session. No payment is collected here.'
    default:
      return status
  }
}

export function PracticeStatusPill({ status }: { status: PracticeStatus }) {
  return (
    <span className={`pill ${practiceStatusClass(status)}`} title={statusMeaning(status)}>
      {status}
    </span>
  )
}
