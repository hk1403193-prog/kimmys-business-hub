type SectionIntroProps = {
  eyebrow?: string
  title: string
  children: string
}

export function SectionIntro({
  eyebrow = 'Fictional sample',
  title,
  children,
}: SectionIntroProps) {
  return (
    <header className="intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{children}</p>
    </header>
  )
}
