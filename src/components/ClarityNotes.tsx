export function StatusMeaning() {
  return (
    <details className="fold">
      <summary>Delivered and Completed</summary>
      <div className="fold-body">
        <p className="card-body">
          Delivered means the order was physically delivered. It is still open
          until you close it.
        </p>
        <p className="card-body">
          Completed means the order is closed. It stays in the history and
          leaves upcoming deliveries.
        </p>
        <p className="card-body">
          Canceled orders leave the route, the workload, and upcoming
          deliveries. They stay in the order history.
        </p>
      </div>
    </details>
  )
}

export function RevenueNote() {
  return (
    <p className="card-meta">
      Expected service revenue is still open, including orders marked
      Delivered. Completed service revenue is closed. Neither amount is money
      collected.
    </p>
  )
}
