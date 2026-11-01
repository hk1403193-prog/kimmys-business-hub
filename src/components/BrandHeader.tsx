type BrandHeaderProps = {
  compact: boolean
}

export function BrandHeader({ compact }: BrandHeaderProps) {
  return (
    <div className={compact ? 'brand brand-compact' : 'brand'}>
      <div className="wrap brand-copy">
        <p className="eyebrow">Private owner preview</p>
        <p className="brand-name">Kimmy&apos;s</p>
        {compact ? null : (
          <p className="brand-legal">Personal Concierge &amp; Delivery</p>
        )}
        <p className="brand-tag">Local People Helping Local People</p>
      </div>
      <div className="leopard" aria-hidden="true" />
    </div>
  )
}
