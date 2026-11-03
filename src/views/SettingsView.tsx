import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { notesStatusMessage } from '../auth/notes'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { OrderSyncNotice } from '../components/OrderSyncNotice'
import { SectionIntro } from '../components/SectionIntro'
import { SwitchRow } from '../components/SwitchRow'

export function SettingsView() {
  const { state, toggleHours, toggleService, toggleArea } = useOperations()
  const { email, signOut, readPracticeNotes } = useAuth()
  const { hours, services, areas } = state
  const [lockMessage, setLockMessage] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  async function checkLock() {
    setChecking(true)
    const result = await readPracticeNotes()
    setChecking(false)
    setLockMessage(notesStatusMessage(result))
  }

  return (
    <div className="stack">
      <SectionIntro title="Settings">
        Practice hours, services, areas, and payment choices. Switches last
        until you refresh.
      </SectionIntro>
      <Notice>
        Nothing here is published. Card processing stays disconnected.
        Records on this screen stay fictional.
      </Notice>
      <section className="stack" aria-labelledby="account-title">
        <h2 id="account-title">Owner account</h2>
        <article className="card">
          <p className="card-title">{email ?? 'Owner account'}</p>
          <p className="card-body">
            Sign-out closes the command center on this device. It does not
            remove the authenticator.
          </p>
          <button className="btn btn-secondary" type="button" onClick={() => void signOut()}>
            Sign out
          </button>
        </article>
        <article className="card">
          <p className="card-title">Practice database lock</p>
          <p className="card-body">
            This checks the fictional practice-notes table. It is allowed only
            for the verified owner. Customer records are not stored here.
            Practice orders use a separate table. This notes check is unchanged.
          </p>
          <button
            className="btn btn-secondary"
            type="button"
            disabled={checking}
            onClick={() => void checkLock()}
          >
            {checking ? 'Checking…' : 'Check protected table'}
          </button>
          {lockMessage ? <p className="card-body">{lockMessage}</p> : null}
        </article>
        <OrderSyncNotice />
      </section>
      <section className="stack" aria-labelledby="hours-title">
        <h2 id="hours-title">Hours</h2>
        {hours.map((item) => (
          <SwitchRow
            key={item.day}
            label={item.day}
            detail={item.open ? item.hours : 'Closed in this sample'}
            on={item.open}
            onToggle={() => toggleHours(item.day)}
          />
        ))}
      </section>
      <section className="stack" aria-labelledby="services-title">
        <h2 id="services-title">Services</h2>
        {services.map((item) => (
          <SwitchRow
            key={item.id}
            label={item.label}
            detail={item.detail}
            on={item.on}
            onToggle={() => toggleService(item.id)}
          />
        ))}
      </section>
      <section className="stack" aria-labelledby="areas-title">
        <h2 id="areas-title">Service areas</h2>
        {areas.map((item) => (
          <SwitchRow
            key={item.id}
            label={item.label}
            detail={item.detail}
            on={item.on}
            onToggle={() => toggleArea(item.id)}
          />
        ))}
      </section>
      <section className="stack" aria-labelledby="payments-title">
        <h2 id="payments-title">Payments</h2>
        <article className="card">
          <p className="card-title">Pay on delivery</p>
          <p className="card-body">Sample choice. Shown as available for the layout.</p>
        </article>
        <article className="card">
          <p className="card-title">Cash</p>
          <p className="card-body">Sample choice. No cash drawer is connected.</p>
        </article>
        <article className="card">
          <div className="card-top">
            <p className="card-title">Card processing</p>
            <span className="pill pill-new">Not connected</span>
          </div>
          <p className="card-body">
            No payment company is linked. This session does not track payments
            received or unpaid balances, and it cannot take a card payment.
          </p>
        </article>
      </section>
    </div>
  )
}
