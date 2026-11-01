type StepperProps = {
  label: string
  value: string
  onLess: () => void
  onMore: () => void
  lessDisabled?: boolean
  moreDisabled?: boolean
}

export function Stepper({
  label,
  value,
  onLess,
  onMore,
  lessDisabled = false,
  moreDisabled = false,
}: StepperProps) {
  return (
    <div className="stepper">
      <div>
        <p className="stepper-label">{label}</p>
        <p className="stepper-value">{value}</p>
      </div>
      <div className="stepper-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onLess}
          disabled={lessDisabled}
          aria-label={`${label} less`}
        >
          Less
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onMore}
          disabled={moreDisabled}
          aria-label={`${label} more`}
        >
          More
        </button>
      </div>
    </div>
  )
}
