import { sampleMoneyItems } from '../sample/data'
import { formatMoney, summarizeMoney } from '../lib/money'
import { Notice } from '../components/Notice'
import { SectionIntro } from '../components/SectionIntro'

export function MoneyView() {
  const summary = summarizeMoney(sampleMoneyItems)

  return (
    <div className="stack">
      <SectionIntro eyebrow="Sample week" title="Money">
        Practice income, expenses, and profit. This is a separate sample week
        from the single day on the dashboard.
      </SectionIntro>
      <Notice>
        No bank, card processor, or payment company is connected. These amounts
        are fictional.
      </Notice>
      <div className="stat-grid stat-grid-3">
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.income)}</p>
          <p className="stat-label">Income</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.expenses)}</p>
          <p className="stat-label">Expenses</p>
        </article>
        <article className="stat">
          <p className="stat-value">{formatMoney(summary.profit)}</p>
          <p className="stat-label">Profit</p>
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
