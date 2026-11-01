import { dayWorkload } from '../domain/dashboard'
import { addDays, formatPracticeDate } from '../domain/dates'
import { completedForDate, routeForDate } from '../domain/schedule'
import { calculateWorkload } from '../domain/workload'
import { calculateServiceQuote } from '../domain/pricing'
import { formatMoney } from '../lib/money'
import { stepValue } from '../lib/quote'
import { useState } from 'react'
import { useOperations } from '../state/OperationsProvider'
import { StatusMeaning } from '../components/ClarityNotes'
import { Notice } from '../components/Notice'
import { PracticeStatusPill } from '../components/PracticeStatusPill'
import { SectionIntro } from '../components/SectionIntro'
import { Stepper } from '../components/Stepper'

export function DeliveriesView() {
  const { state, reorder, updateWorkload } = useOperations()
  const [date, setDate] = useState(state.today)
  const stops = routeForDate(
    state.orders,
    date,
    state.routeIdsByDate[date] ?? [],
  )
  const closed = completedForDate(state.orders, date)
  const load = dayWorkload(state.orders, state.workloadRules, date)

  return (
    <div className="stack">
      <SectionIntro title="Deliveries">
        A practice plan for one day. Move stops earlier or later by hand.
      </SectionIntro>
      <Notice>
        Planning minutes are a workload guess. They are not a driving time, and
        no map service is connected.
      </Notice>
      <StatusMeaning />
      <div className="pair">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setDate((current) => addDays(current, -1))}
        >
          Previous day
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setDate((current) => addDays(current, 1))}
        >
          Next day
        </button>
      </div>
      <section className="hero" aria-label="Sample day plan">
        <p className="eyebrow">{formatPracticeDate(date, state.today)}</p>
        <p className="hero-stat">
          {stops.length === 1 ? '1 stop left' : `${stops.length} stops left`}
        </p>
        <p className="hero-copy">
          {load.remainingPoints} points left · {load.totalPoints} points total ·{' '}
          {load.completedPoints} points completed
        </p>
        <p className="hero-copy">
          {load.remainingMinutes} planning minutes left · {load.totalMinutes}{' '}
          total
        </p>
        <p className="hero-copy">
          Delivered orders stay in the remaining stops until you mark them
          Completed.
        </p>
      </section>
      {stops.length === 0 ? (
        <p className="card-meta">No open sample stops on this day.</p>
      ) : (
        <ol className="card-list">
          {stops.map((stop, index) => {
            const work = calculateWorkload(state.workloadRules, stop.scenario)
            const earnings = calculateServiceQuote(state.rules, stop.scenario)

            return (
              <li key={stop.id} className="card">
                <p className="eyebrow">Stop {index + 1}</p>
                <div className="card-top">
                  <p className="card-title">{stop.customer}</p>
                  <PracticeStatusPill status={stop.status} />
                </div>
                <p className="card-meta">
                  {stop.serviceType} · {stop.priority} priority
                </p>
                <p className="card-meta">
                  Pickup {stop.pickupWindow} · Delivery {stop.deliveryWindow}
                </p>
                <p className="card-meta">
                  {stop.pickupPlace} to {stop.deliveryPlace}
                </p>
                <p className="card-body">
                  {work.points} points · {work.minutes} planning minutes ·{' '}
                  {formatMoney(earnings.earnings)} service fee
                </p>
                <div className="pair">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => reorder(date, index, -1)}
                    disabled={index === 0}
                  >
                    Earlier
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => reorder(date, index, 1)}
                    disabled={index === stops.length - 1}
                  >
                    Later
                  </button>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      <section className="stack" aria-labelledby="closed-stops-title">
        <h2 id="closed-stops-title">Completed history</h2>
        <p className="card-meta">
          Closed orders stay on the record for this day. They are not upcoming
          stops.
        </p>
        {closed.length === 0 ? (
          <p className="card-meta">No completed sample orders on this day.</p>
        ) : (
          <ul className="card-list">
            {closed.map((stop) => {
              const work = calculateWorkload(state.workloadRules, stop.scenario)
              const earnings = calculateServiceQuote(state.rules, stop.scenario)

              return (
                <li key={stop.id} className="card">
                  <div className="card-top">
                    <p className="card-title">{stop.customer}</p>
                    <PracticeStatusPill status={stop.status} />
                  </div>
                  <p className="card-meta">
                    {stop.serviceType} · Delivery {stop.deliveryWindow}
                  </p>
                  <p className="card-body">
                    {work.points} completed points · {work.minutes} planning
                    minutes · {formatMoney(earnings.earnings)} service fee
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <details className="fold">
        <summary>Edit planning rules</summary>
        <div className="fold-body">
          <p className="card-meta">
            These numbers only estimate the practice workload. They do not
            calculate a route.
          </p>
          <Stepper
            label="Base points"
            value={`${state.workloadRules.basePoints}`}
            onLess={() =>
              updateWorkload({
                ...state.workloadRules,
                basePoints: stepValue(state.workloadRules.basePoints, -1, 0, 20),
              })
            }
            onMore={() =>
              updateWorkload({
                ...state.workloadRules,
                basePoints: stepValue(state.workloadRules.basePoints, 1, 0, 20),
              })
            }
            lessDisabled={state.workloadRules.basePoints <= 0}
            moreDisabled={state.workloadRules.basePoints >= 20}
          />
          <Stepper
            label="Points per extra stop"
            value={`${state.workloadRules.pointsPerExtraStop}`}
            onLess={() =>
              updateWorkload({
                ...state.workloadRules,
                pointsPerExtraStop: stepValue(
                  state.workloadRules.pointsPerExtraStop,
                  -1,
                  0,
                  10,
                ),
              })
            }
            onMore={() =>
              updateWorkload({
                ...state.workloadRules,
                pointsPerExtraStop: stepValue(
                  state.workloadRules.pointsPerExtraStop,
                  1,
                  0,
                  10,
                ),
              })
            }
            lessDisabled={state.workloadRules.pointsPerExtraStop <= 0}
            moreDisabled={state.workloadRules.pointsPerExtraStop >= 10}
          />
          <Stepper
            label="Base planning minutes"
            value={`${state.workloadRules.baseMinutes}`}
            onLess={() =>
              updateWorkload({
                ...state.workloadRules,
                baseMinutes: stepValue(
                  state.workloadRules.baseMinutes,
                  -5,
                  0,
                  180,
                ),
              })
            }
            onMore={() =>
              updateWorkload({
                ...state.workloadRules,
                baseMinutes: stepValue(
                  state.workloadRules.baseMinutes,
                  5,
                  0,
                  180,
                ),
              })
            }
            lessDisabled={state.workloadRules.baseMinutes <= 0}
            moreDisabled={state.workloadRules.baseMinutes >= 180}
          />
          <Stepper
            label="Minutes per shopping item"
            value={`${state.workloadRules.minutesPerItem}`}
            onLess={() =>
              updateWorkload({
                ...state.workloadRules,
                minutesPerItem: stepValue(
                  state.workloadRules.minutesPerItem,
                  -1,
                  0,
                  30,
                ),
              })
            }
            onMore={() =>
              updateWorkload({
                ...state.workloadRules,
                minutesPerItem: stepValue(
                  state.workloadRules.minutesPerItem,
                  1,
                  0,
                  30,
                ),
              })
            }
            lessDisabled={state.workloadRules.minutesPerItem <= 0}
            moreDisabled={state.workloadRules.minutesPerItem >= 30}
          />
        </div>
      </details>
    </div>
  )
}
