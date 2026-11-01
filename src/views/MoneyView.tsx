import { sampleMoneyItems } from '../sample/data'
import { summarizeOperations } from '../domain/dashboard'
import { formatMoney, summarizeMoney } from '../lib/money'
import { useOperations } from '../state/OperationsProvider'
import { RevenueNote } from '../components/ClarityNotes'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'

export function MoneyView() {
  const { state } = useOperations()
  const live = summarizeOperations(
    state.orders,
    state.rules,
    state.workloadRules,
    state.today,
  )
  const summary = summarizeMoney(sampleMoneyItems)

  return (
    <div className="stack">
      <SectionIntro title="Money">
        Service revenue from the fictional orders in this session.
      </SectionIntro>
      <Notice>
        No bank, card processor, or payment company is connected. These totals
        are service fees, not money collected.
      </Notice>
      <div className="stat-grid">
        <article className="stat">
          <p className="stat-value">{formatMoney(live.expectedRevenue)}</p>
          <p className="stat-label">Expected service revenue</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(live.completedRevenue)}</p>
          <p className="stat-label">Completed service revenue</p>
        </article>
      </div>
      <RevenueNote />
      <h2>Illustrative sample week</h2>
      <p className="card-meta">
        This snapshot is fixed practice bookkeeping. It does not follow the
        orders above.
      </p>
      <div className="stat-grid stat-grid-3">
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.income)}</p>
          <p className="stat-label">Illustrative income</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.expenses)}</p>
          <p className="stat-label">Illustrative expenses</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.profit)}</p>
          <p className="stat-label">Illustrative profit</p>
        </article>
      </div>
      <ul className="card-list">
        {sampleMoneyItems.map((item) => (
          <li key={item.id} className="card card-row">
            <div>
              <p className="card-title">{item.label}</p>
              <p className="card-meta">{item.kind}</p>
            </div>
            <p className={item.kind === 'Income' ? 'money-in' : 'money-out'}>
              {item.kind === 'Expense' ? '−' : ''}
              {formatMoney(item.amount)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
