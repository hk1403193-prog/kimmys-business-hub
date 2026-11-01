type SwitchRowProps = {
  label: string
  detail: string
  on: boolean
  onToggle: () => void
}

export function SwitchRow({ label, detail, on, onToggle }: SwitchRowProps) {
  return (
    <div className="switch-row">
      <div>
        <p className="switch-label">{label}</p>
        <p className="switch-detail">{detail}</p>
      </div>
      <button
        type="button"
        className={on ? 'btn btn-primary' : 'btn btn-secondary'}
        aria-pressed={on}
        onClick={onToggle}
      >
        {on ? 'On' : 'Off'}
      </button>
    </div>
  )
}
