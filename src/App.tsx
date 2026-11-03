import { useEffect, useState } from 'react'
import { useAuth } from './auth/AuthProvider'
import { AppShell } from './components/AppShell'
import { sampleStripLabel } from './state/orderSync'
import { useOperations } from './state/OperationsProvider'
import { isSectionId, type SectionId } from './sections'
import { CustomersView } from './views/CustomersView'
import { DashboardView } from './views/DashboardView'
import { DeliveriesView } from './views/DeliveriesView'
import { MarketingView } from './views/MarketingView'
import { MoneyView } from './views/MoneyView'
import { OrdersView } from './views/OrdersView'
import { PartnersView } from './views/PartnersView'
import { QuotesView } from './views/QuotesView'
import { ReportsView } from './views/ReportsView'
import { SettingsView } from './views/SettingsView'

function readSection(): SectionId {
  const value = window.location.hash.replace(/^#/, '')
  return isSectionId(value) ? value : 'dashboard'
}

export function App() {
  const { email, signOut } = useAuth()
  const { orderSync } = useOperations()
  const [section, setSection] = useState<SectionId>(readSection)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    function onPopState() {
      setSection(readSection())
      setMoreOpen(false)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function openSection(id: SectionId) {
    setSection(id)
    setMoreOpen(false)

    if (window.location.hash !== `#${id}`) {
      window.history.pushState(null, '', `#${id}`)
    }
  }

  return (
    <AppShell
      section={section}
      moreOpen={moreOpen}
      email={email}
      sampleStrip={sampleStripLabel(orderSync)}
      onSignOut={() => void signOut()}
      onOpen={openSection}
      onMore={() => setMoreOpen(true)}
      onCloseMore={() => setMoreOpen(false)}
    >
      {renderSection(section, openSection)}
    </AppShell>
  )
}

function renderSection(
  section: SectionId,
  onOpen: (id: SectionId) => void,
) {
  switch (section) {
    case 'dashboard':
      return <DashboardView onOpen={onOpen} />
    case 'orders':
      return <OrdersView />
    case 'customers':
      return <CustomersView />
    case 'quotes':
      return <QuotesView onOpen={onOpen} />
    case 'deliveries':
      return <DeliveriesView />
    case 'money':
      return <MoneyView />
    case 'partners':
      return <PartnersView />
    case 'marketing':
      return <MarketingView />
    case 'reports':
      return <ReportsView />
    case 'settings':
      return <SettingsView />
  }
}
