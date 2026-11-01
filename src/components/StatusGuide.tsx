export function StatusGuide() {
  return (
    <section className="card" aria-label="Delivered and completed">
      <p className="card-title">Delivered and completed</p>
      <p className="card-body">
        Delivered means the order was physically delivered. It is not closed,
        so it still counts as open work and can stay on the upcoming list.
      </p>
      <p className="card-body">
        Completed means the order is closed. It stays in the history and drops
        off upcoming deliveries.
      </p>
      <p className="card-body">
        Canceled orders also stay in the history and drop off upcoming
        deliveries. They are not counted as completed work.
      </p>
    </section>
  )
}
