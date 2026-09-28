function formatTimestamp(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ShipmentAudit({ order }) {
  if (!order) return null;

  const history = Array.isArray(order.history) ? order.history : [];
  const lastEvent = history[history.length - 1];
  const updatedAt = order.updatedAt || lastEvent?.at;

  return (
    <section className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600" aria-label={`Shipment audit timestamps for ${order.id}`}>
      <div className="grid gap-2 sm:grid-cols-2">
        <p><span className="font-semibold text-slate-700">Booked:</span> <time dateTime={order.createdAt || undefined}>{formatTimestamp(order.createdAt)}</time></p>
        <p><span className="font-semibold text-slate-700">Last updated:</span> <time dateTime={updatedAt || undefined}>{formatTimestamp(updatedAt)}</time></p>
      </div>
      {history.length > 0 && (
        <details className="mt-3 border-t border-slate-100 pt-2">
          <summary className="cursor-pointer font-semibold text-blue-800">Activity history ({history.length})</summary>
          <ol className="mt-3 space-y-3 border-l border-slate-200 pl-3">
            {[...history].reverse().map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="relative">
                <p className="font-medium text-slate-800">{entry.event}</p>
                <p className="mt-0.5">{formatTimestamp(entry.at)} · {entry.actor || "system"}</p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}