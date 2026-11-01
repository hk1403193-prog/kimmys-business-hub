import { addDays, formatPracticeDate } from '../domain/dates'
import { completedOnDate, routeForDate } from '../domain/schedule'
import { calculateWorkload, summarizeDayWorkload } from '../domain/workload'
import { calculateServiceQuote } from '../domain/pricing'
import { formatMoney } from '../lib/money'
import { stepValue } from '../lib/quote'
import { useState } from 'react'
import { useOperations } from '../state/OperationsProvider'
import { Notice } from '../components/Notice'
import { PracticeStatusPill } from '../components/PracticeStatusPill'
import { SectionIntro } from '../components/SectionIntro'
import { StatusGuide } from '../components/StatusGuide'
import { Stepper } from '../components/Stepper'

export function DeliveriesView() {
  const { state, reorder, updateWorkload } = useOperations()
  const [date, setDate] = useState(state.today)
  const stops = routeForDate(
    state.orders,
    date,
    state.routeIdsByDate[date] ?? [],
  )
  const closed = completedOnDate(state.orders, date)
  const workload = stops.map((order) =>
    calculateWorkload(state.workloadRules, order.scenario),
  )
  const day = summarizeDayWorkload(state.orders, state.workloadRules, date)

  return (
    <div className="stack">
      <SectionIntro title="Deliveries">
        A practice plan for one day. Move stops earlier or later by hand.
      </SectionIntro>
      <Notice>
        Planning minutes are a workload guess. They are not a driving time, and
        no map service is connected.
      </Notice>
      <StatusGuide />
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
          {stops.length} {stops.length === 1 ? 'stop' : 'stops'} left
        </p>
        <p className="hero-copy">
          Remaining workload: {day.remainingPoints} points ·{' '}
          {day.remainingMinutes} planning minutes. Full day:{' '}
          {day.totalPoints} points · {day.totalMinutes} minutes. Closed
          workload: {day.completedPoints} points · {day.completedMinutes}{' '}
          minutes.
        </p>
      </section>
      <h2>Still open</h2>
      {stops.length === 0 ? (
        <p className="card-meta">No open stops on this day.</p>
      ) : (
        <ol className="card-list">
          {stops.map((stop, index) => {
            const work = workload[index]
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
      <section className="stack" aria-labelledby="closed-route-title">
        <h2 id="closed-route-title">Closed on this day</h2>
        <p className="card-meta">
          Completed orders stay in the history. They are not part of the
          remaining route.
        </p>
        {closed.length === 0 ? (
          <p className="card-meta">No completed orders on this day.</p>
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
                    {stop.serviceType} · {stop.deliveryWindow}
                  </p>
                  <p className="card-body">
                    Closed workload: {work.points} points · {work.minutes}{' '}
                    planning minutes · {formatMoney(earnings.earnings)} service
                    fee. Not money collected.
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
