import { useRef } from "react";
import { FaBoxOpen, FaMapMarkerAlt, FaTimes, FaTruckMoving } from "react-icons/fa";

function formatTimestamp(value) {
  if (!value) return "Unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unavailable";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-3 border-b border-slate-100 py-2.5 last:border-0 sm:grid-cols-[9rem_1fr]">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="break-words text-sm font-medium text-slate-900">{value || "Not provided"}</dd>
    </div>
  );
}

function statusStyle(status) {
  if (["Delivered", "Paid"].includes(status)) return "bg-emerald-100 text-emerald-900";
  if (["Pending", "Pending Payment", "Awaiting Transfer", "Awaiting Rider Assignment"].includes(status)) return "bg-amber-100 text-amber-950";
  return "bg-sky-100 text-sky-950";
}

export default function ShipmentPreview({ order, className = "", triggerLabel = "Preview details" }) {
  const dialogRef = useRef(null);
  if (!order) return null;

  const history = Array.isArray(order.history) ? [...order.history].reverse() : [];

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className={`rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
          className={`inline-flex min-h-9 items-center justify-center rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-800 transition hover:border-blue-400 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        aria-label={`Preview shipment ${order.id}`}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`shipment-preview-${order.id}`}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto max-h-[88vh] w-[min(92vw,52rem)] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60"
        className="m-auto max-h-[90vh] w-[min(94vw,60rem)] overflow-y-auto rounded-2xl border-0 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/70 backdrop:backdrop-blur-sm"
      >
        <div className="sticky top-0 z-10 bg-slate-950 px-5 py-5 text-white sm:px-8 sm:py-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400 text-slate-950"><FaBoxOpen className="text-xl" /></span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Shipment record</p>
                <h2 id={`shipment-preview-${order.id}`} className="mt-1 break-all text-2xl font-bold">{order.id}</h2>
              </div>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-300" aria-label="Close shipment preview" autoFocus>
              <FaTimes />
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <div className="flex min-w-0 items-center gap-2 text-slate-200">
              <FaMapMarkerAlt className="shrink-0 text-emerald-300" />
              <p className="break-words text-base font-medium">{order.route || "Route not provided"}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${statusStyle(order.status)}`}>{order.status || "Status unavailable"}</span>
          </div>
        </div>
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Payment", value: order.paymentStatus || "Not recorded", icon: FaTruckMoving },
              { label: "Assigned to", value: order.assignedTo || "Unassigned", icon: FaBoxOpen },
              { label: "Service", value: order.service || "Not provided", icon: FaTruckMoving },
              { label: "Collection", value: order.collectionPoint || "Not provided", icon: FaMapMarkerAlt },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="min-w-0 border-l-2 border-emerald-500 pl-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <p className="mt-1 flex items-center gap-2 break-words text-sm font-semibold text-slate-900"><Icon className="shrink-0 text-emerald-700" />{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-8 p-5 sm:grid-cols-2 sm:p-8">
          <section>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <FaBoxOpen className="text-emerald-700" />
              <h3 className="font-bold text-slate-900">Cargo details</h3>
            </div>
            <dl className="mt-2">
              <Detail label="Description" value={order.itemDescription} />
              <Detail label="Quantity" value={order.quantity} />
              <Detail label="Weight" value={order.weight ? `${order.weight} kg` : "Not provided"} />
              <Detail label="Dimensions" value={order.dimensions} />
              <Detail label="Handling notes" value={order.handlingNotes} />
            </dl>
          </section>
          <section>
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <FaTruckMoving className="text-emerald-700" />
              <h3 className="font-bold text-slate-900">People &amp; accountability</h3>
            </div>
            <dl className="mt-2">
              <Detail label="Sender" value={order.customerName} />
              <Detail label="Sender contact" value={order.contact} />
              <Detail label="Email" value={order.customerEmail} />
              <Detail label="Receiver" value={order.receiverName} />
              <Detail label="Receiver contact" value={order.receiverContact} />
              <Detail label="Booked" value={formatTimestamp(order.createdAt)} />
              <Detail label="Last updated" value={formatTimestamp(order.updatedAt || history[0]?.at)} />
              <Detail label="Terms acceptance" value={order.termsAcceptance ? `Version ${order.termsAcceptance.version} · ${formatTimestamp(order.termsAcceptance.acceptedAt)}` : "Not recorded"} />
            </dl>
          </section>
          <section className="sm:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <h3 className="font-bold text-slate-900">Activity timeline</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{history.length} event{history.length === 1 ? "" : "s"}</span>
            </div>
            {history.length ? (
              <ol className="mt-4 space-y-0 border-l-2 border-emerald-200 pl-4">
                {history.map((entry, index) => (
                  <li key={`${entry.at}-${index}`} className="relative pb-5 last:pb-0">
                    <span className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 ring-1 ring-emerald-200" />
                    <p className="text-sm font-semibold text-slate-900">{entry.event}</p>
                    <p className="mt-1 text-xs text-slate-500"><time dateTime={entry.at}>{formatTimestamp(entry.at)}</time> · {entry.actor || "system"}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-600">No activity has been recorded for this shipment.</p>
            )}
          </section>
        </div>
      </dialog>
    </>
  );
}