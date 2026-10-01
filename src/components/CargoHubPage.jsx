import { FaArrowLeft, FaBoxOpen, FaChartLine, FaPlane, FaUsers } from "react-icons/fa";
import { getHubStaff, getRouteHubDirection } from "../testHelpers/appLogic.mjs";
import ShipmentPreview from "./ShipmentPreview.jsx";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

function dateLabel(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
}

function HubStat({ label, value, note, accent = "blue" }) {
  const accents = {
    blue: "border-blue-700 text-blue-900",
    green: "border-emerald-700 text-emerald-900",
    amber: "border-amber-600 text-amber-900",
    slate: "border-slate-600 text-slate-900",
  };
  return (
    <div className={`min-w-0 border-l-2 bg-white p-4 shadow-sm ring-1 ring-slate-200 ${accents[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className="mt-2 break-words text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}

function ShipmentQueue({ title, orders, direction, hub, onUpdateStage }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{direction === "incoming" ? "Arrivals" : "Departures"}</p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">{title}</h3>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">{orders.length}</span>
      </div>
      {orders.length === 0 ? (
        <p className="py-6 text-sm text-slate-500">No shipments currently match this hub.</p>
      ) : (
        <div className="mt-2 divide-y divide-slate-100">
          {orders.map((order) => {
            const arrived = Boolean(order.hubArrivalAt);
            const departed = Boolean(order.hubDepartureAt);
            return (
              <article key={order.id} className="py-4 first:pt-3 last:pb-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">{order.id}</p>
                    <p className="mt-1 text-sm text-slate-600">{order.route}</p>
                    <p className="mt-1 text-xs text-slate-500">{order.customerName || "Customer"} · {order.itemDescription || "Cargo details not recorded"}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">{order.status || "Pending"}</span>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <p>{direction === "incoming" ? `Hub arrival: ${dateLabel(order.hubArrivalAt)}` : `Hub departure: ${dateLabel(order.hubDepartureAt)}`}</p>
                    <p className="mt-1">Service: {order.service || "Not specified"} · Method: {order.collectionPoint || "Not specified"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ShipmentPreview order={order} />
                    {direction === "incoming" && !arrived && order.status !== "Delivered" && <button type="button" onClick={() => onUpdateStage(order, "arrived", hub)} className="min-h-9 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Mark arrived</button>}
                    {direction === "incoming" && arrived && !order.readyForPickupAt && <button type="button" onClick={() => onUpdateStage(order, "ready", hub)} className="min-h-9 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50">Ready for pickup</button>}
                    {direction === "outgoing" && !departed && <button type="button" onClick={() => onUpdateStage(order, "departed", hub)} className="min-h-9 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">Mark departed</button>}
                    {order.readyForPickupAt && <span className="self-center text-xs font-semibold text-emerald-800">Ready for client pickup</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function CargoHubPage({ hub, orders, flightSchedules, subadminProfiles, paymentHistory, onClose, onUpdateStage }) {
  const routedOrders = orders.map((order) => ({ ...order, hubDirection: getRouteHubDirection(order.route, hub.location) }));
  const incoming = routedOrders.filter((order) => order.hubDirection === "incoming");
  const outgoing = routedOrders.filter((order) => order.hubDirection === "outgoing");
  const hubFlights = flightSchedules
    .map((flight) => ({ ...flight, hubDirection: getRouteHubDirection(flight.route, hub.location) }))
    .filter((flight) => flight.hubDirection);
  const staff = getHubStaff(subadminProfiles, hub.location);
  const managers = staff.filter((person) => /manager|lead|hod|director|ceo/i.test(`${person.role} ${person.positionStatus}`));
  const paidOrders = [...incoming, ...outgoing].filter((order) => order.paymentStatus === "Paid");
  const paidHistory = paymentHistory.filter((payment) => getRouteHubDirection(payment.route, hub.location));
  const revenue = paidHistory.reduce((total, payment) => total + Number(payment.amount || 0), 0)
    || paidOrders.reduce((total, order) => total + Number(order.quoteAmount || 0), 0);
  const revenueOrders = paidHistory.length || paidOrders.filter((order) => Number(order.quoteAmount || 0) > 0).length;
  const revenueAvailable = revenueOrders > 0;
  const pending = [...incoming, ...outgoing].filter((order) => ["Pending", "Pending Payment", "Awaiting Transfer", "Picked Up"].includes(order.status));
  const upcomingFlights = hubFlights.filter((flight) => !["Cancelled", "Departed"].includes(flight.status));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">Cargo hub operations</p>
            <h2 className="mt-2 text-3xl font-bold">{hub.name}</h2>
            <p className="mt-2 text-slate-300">{hub.location} · {hub.status} · Capacity {hub.occupied}/{hub.capacity}</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"><FaArrowLeft /> All hubs</button>
        </div>
      </section>

      <section aria-label="Hub revenue and traffic" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HubStat label="Registered shipments" value={incoming.length + outgoing.length} note="Inbound and outbound routes" />
        <HubStat label="Incoming" value={incoming.length} note="Deliveries routed to this hub" accent="green" />
        <HubStat label="Outgoing" value={outgoing.length} note="Shipments routed from this hub" accent="amber" />
        <HubStat label="Confirmed revenue" value={revenueAvailable ? money(revenue) : "—"} note={revenueAvailable ? `${revenueOrders} paid shipments with recorded amounts` : `${paidOrders.length} paid shipments; amounts not recorded`} accent="slate" />
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ShipmentQueue title="Incoming deliveries & client pickups" orders={incoming} direction="incoming" hub={hub} onUpdateStage={onUpdateStage} />
        <ShipmentQueue title="Outgoing deliveries" orders={outgoing} direction="outgoing" hub={hub} onUpdateStage={onUpdateStage} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Airport operations</p><h3 className="mt-1 text-lg font-bold text-slate-950">Departures &amp; arrivals</h3></div>
            <FaPlane className="text-xl text-blue-700" />
          </div>
          {hubFlights.length === 0 ? <p className="py-6 text-sm text-slate-500">No flight routes currently reference this hub.</p> : (
            <div className="mt-2 divide-y divide-slate-100">
              {hubFlights.map((flight) => (
                <div key={flight.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div><p className="font-semibold text-slate-900">{flight.airline} · {flight.id}</p><p className="mt-1 text-sm text-slate-600">{flight.route}</p><p className="mt-1 text-xs text-slate-500">{flight.hubDirection === "incoming" ? "Arrival to this hub" : "Departure from this hub"} · Scheduled {flight.hubDirection === "incoming" ? flight.arrival : flight.departure}</p></div>
                  <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${flight.status === "Cancelled" ? "bg-rose-100 text-rose-800" : flight.status === "Delayed" || flight.status === "Weather Watch" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800"}`}>{flight.status}</span><span className="text-xs text-slate-500">Gate {flight.gate}</span></div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">Flight schedule records reflect the operational feed currently configured in the admin dashboard. Confirm actual departure/arrival with the carrier.</p>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-2"><FaUsers className="text-blue-700" /><h3 className="font-bold text-slate-950">Hub staff</h3></div>
            <p className="mt-1 text-xs text-slate-500">Matched by active sub-admin work location.</p>
            {staff.length === 0 ? <p className="mt-4 text-sm text-slate-500">No active staff profiles assigned to {hub.location}.</p> : <div className="mt-3 space-y-3">{staff.map((person) => <div key={person.id} className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3"><div><p className="text-sm font-semibold text-slate-900">{person.fullName}</p><p className="text-xs text-slate-500">{person.role} · {person.username}</p></div>{managers.some((manager) => manager.id === person.id) && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-800">Manager</span>}</div>)}</div>}
          </section>
          <section className="rounded-2xl bg-emerald-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">Revenue review</p>
            <p className="mt-2 text-3xl font-bold">{revenueAvailable ? money(revenue) : "Amount unavailable"}</p>
            <p className="mt-1 text-sm text-emerald-100">Confirmed revenue from recorded paid shipments on routes touching this hub.</p>
            <div className="mt-4 flex justify-between border-t border-white/15 pt-3 text-sm"><span className="text-emerald-100">Pending shipments</span><strong>{pending.length}</strong></div>
            <div className="mt-2 flex justify-between text-sm"><span className="text-emerald-100">Upcoming flight movements</span><strong>{upcomingFlights.length}</strong></div>
          </section>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Client pickups &amp; audit</p><h3 className="mt-1 text-lg font-bold text-slate-950">Booking history at {hub.name}</h3></div><span className="text-sm text-slate-500">{incoming.length + outgoing.length} route-matched records</span></div>
        {incoming.length + outgoing.length === 0 ? <p className="py-6 text-sm text-slate-500">No booking history for this hub yet.</p> : <div className="mt-2 overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-left text-sm"><thead className="text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Booking</th><th className="px-3 py-3">Client / receiver</th><th className="px-3 py-3">Direction</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Booked</th><th className="px-3 py-3">Pickup method</th></tr></thead><tbody className="divide-y divide-slate-100">{[...incoming, ...outgoing].map((order) => <tr key={order.id}><td className="px-3 py-3 font-semibold text-blue-800"><ShipmentPreview order={order} triggerLabel={order.id} className="border-0 bg-transparent px-0 py-0 text-blue-800 underline underline-offset-2 hover:bg-transparent" /></td><td className="px-3 py-3 text-slate-700">{order.customerName || "Customer"}<span className="block text-xs text-slate-500">{order.receiverName || "Receiver not provided"}</span></td><td className="px-3 py-3 text-slate-600">{order.hubDirection === "incoming" ? "Incoming" : "Outgoing"}</td><td className="px-3 py-3 text-slate-700">{order.status || "Pending"}</td><td className="whitespace-nowrap px-3 py-3 text-slate-600">{dateLabel(order.createdAt)}</td><td className="px-3 py-3 text-slate-600">{order.collectionPoint || "Not set"}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}