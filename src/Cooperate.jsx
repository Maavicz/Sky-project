import { useState, useMemo } from "react";
import { FaTruckMoving, FaHistory, FaSearch, FaPaperPlane, FaStream } from "react-icons/fa";

export default function Cooperate({ orders = [], booking = {}, setBooking = () => {}, handleBook = () => {} }) {
  const [tab, setTab] = useState("delivery");
  const [selectedOrderId, setSelectedOrderId] = useState(orders?.[0]?.id || "");

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) || orders[0] || null, [orders, selectedOrderId]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Cooperate Dashboard</h2>

      <div className="flex items-center gap-2">
        <button onClick={() => setTab("delivery")} className={`rounded-md px-3 py-2 ${tab==="delivery"?"bg-blue-600 text-white":"bg-white ring-1 ring-slate-200"}`}>
          <FaTruckMoving className="inline mr-2"/> Delivery
        </button>
        <button onClick={() => setTab("history")} className={`rounded-md px-3 py-2 ${tab==="history"?"bg-blue-600 text-white":"bg-white ring-1 ring-slate-200"}`}>
          <FaHistory className="inline mr-2"/> History
        </button>
        <button onClick={() => setTab("tracking")} className={`rounded-md px-3 py-2 ${tab==="tracking"?"bg-blue-600 text-white":"bg-white ring-1 ring-slate-200"}`}>
          <FaSearch className="inline mr-2"/> Tracking
        </button>
        <button onClick={() => setTab("booking")} className={`rounded-md px-3 py-2 ${tab==="booking"?"bg-blue-600 text-white":"bg-white ring-1 ring-slate-200"}`}>
          <FaPaperPlane className="inline mr-2"/> Booking
        </button>
        <button onClick={() => setTab("timeline")} className={`rounded-md px-3 py-2 ${tab==="timeline"?"bg-blue-600 text-white":"bg-white ring-1 ring-slate-200"}`}>
          <FaStream className="inline mr-2"/> Timeline
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <aside className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h3 className="font-medium">Shipments</h3>
          <div className="mt-3 space-y-2">
            {orders.map((o) => (
              <button key={o.id} onClick={() => setSelectedOrderId(o.id)} className={`w-full text-left rounded-md px-3 py-2 ${selectedOrderId===o.id?"bg-sky-50 ring-1 ring-sky-200":"hover:bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{o.id}</div>
                    <div className="text-xs text-slate-500">{o.route || o.createdAt}</div>
                  </div>
                  <div className="text-xs text-slate-600">{o.status || o.paymentStatus || 'Unknown'}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          {tab === "delivery" && (
            <div>
              <h3 className="text-lg font-semibold">Delivery Overview</h3>
              <p className="mt-2 text-sm text-slate-600">Selected shipment: {selectedOrder?.id || "—"}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="mt-1 font-medium">{selectedOrder?.status || "Pending"}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-xs text-slate-500">Assigned</p>
                  <p className="mt-1 font-medium">{selectedOrder?.assignedTo || "Unassigned"}</p>
                </div>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div>
              <h3 className="text-lg font-semibold">History</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between rounded-md p-2 hover:bg-slate-50">
                    <div>
                      <div className="font-medium">{o.id}</div>
                      <div className="text-xs text-slate-500">{o.route}</div>
                    </div>
                    <div className="text-xs text-slate-600">{o.status}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "tracking" && (
            <div>
              <h3 className="text-lg font-semibold">Tracking</h3>
              <p className="mt-2 text-sm text-slate-600">Enter a tracking ID in the main Track page to populate detailed timeline, or select a shipment here.</p>
              {selectedOrder && (
                <div className="mt-4 rounded-md border p-4">
                  <div className="text-sm font-medium">{selectedOrder.id}</div>
                  <div className="text-xs text-slate-500">{selectedOrder.route}</div>
                  <div className="mt-3 text-sm">Status: <span className="font-semibold">{selectedOrder.status}</span></div>
                </div>
              )}
            </div>
          )}

          {tab === "booking" && (
            <div>
              <h3 className="text-lg font-semibold">Quick Booking</h3>
              <p className="mt-2 text-sm text-slate-600">Create a booking for the cooperative workflow.</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <input value={booking.name || ""} onChange={(e)=>setBooking({...booking,name:e.target.value})} className="rounded-md border p-2" placeholder="Customer name" />
                <input value={booking.pickup} onChange={(e)=>setBooking({...booking,pickup:e.target.value})} className="rounded-md border p-2" placeholder="Pickup" />
                <input value={booking.delivery} onChange={(e)=>setBooking({...booking,delivery:e.target.value})} className="rounded-md border p-2" placeholder="Delivery" />
                <input value={booking.weight} onChange={(e)=>setBooking({...booking,weight:e.target.value})} className="rounded-md border p-2" placeholder="Weight (kg)" />
                <input value={booking.contact} onChange={(e)=>setBooking({...booking,contact:e.target.value})} className="rounded-md border p-2" placeholder="Contact" />
              </div>
              <div className="mt-3">
                <button onClick={handleBook} className="rounded-md bg-blue-600 px-4 py-2 text-white">Submit booking</button>
              </div>
            </div>
          )}

          {tab === "timeline" && (
            <div>
              <h3 className="text-lg font-semibold">Timeline</h3>
              <p className="mt-2 text-sm text-slate-500">Shows current pickup date & time and source/status indicators.</p>

              {selectedOrder ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-md border p-4">
                    <div className="text-xs text-slate-500">Pickup (current)</div>
                    <div className="mt-1 font-medium">{new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}</div>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="mt-1 font-medium">{selectedOrder.status || "Pending"}</div>
                  </div>

                  <div className="rounded-md border p-4">
                    <div className="text-xs text-slate-500">Source messages</div>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      <li>{selectedOrder.status === "Pending" ? "Pending pickup" : "Update from SkyBridge"}</li>
                      <li>{selectedOrder.newsletter ? "Newsletter: SkyBridge" : "No newsletter"}</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No shipment selected.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
