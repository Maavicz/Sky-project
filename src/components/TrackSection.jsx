import { FaSearch } from "react-icons/fa";
import ShipmentAudit from "./ShipmentAudit.jsx";
import ShipmentPreview from "./ShipmentPreview.jsx";

export default function TrackSection({ trackingInput, setTrackingInput, trackPackage, trackingResult, trackingDetails }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-blue-700">
          <FaSearch />
          <h2 className="text-2xl font-semibold text-slate-900">Track Your Package</h2>
        </div>
        <p className="mt-2 text-slate-600">Enter your tracking number to get the latest status.</p>
        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Enter Tracking Number"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
          />
          <button
            onClick={trackPackage}
            className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
          >
            Track Shipment
          </button>
          {trackingResult && (
            <div className="rounded-3xl bg-blue-50 p-4 text-slate-900 shadow-sm">
              <span className="font-semibold">Status:</span> {trackingResult}
            </div>
          )}
        </div>
        {trackingDetails ? (
          <div className="mt-8 rounded-[1.75rem] bg-slate-50 p-6 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Tracking details</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{trackingDetails.currentLocation}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700">ETA: {trackingDetails.estimatedDelivery}</span>
            </div>
            <div className="mt-6 space-y-4">
              {trackingDetails.timeline.map((event, index) => (
                <div key={index} className="rounded-3xl bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">{event.label}</p>
                  <p className="mt-1 text-sm text-slate-600">{event.time}</p>
                </div>
              ))}
            </div>
            <ShipmentPreview order={trackingDetails.shipment || trackingDetails} className="mt-4" />
            <ShipmentAudit order={trackingDetails} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
