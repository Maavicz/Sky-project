import { FaBell, FaShieldAlt } from "react-icons/fa";

export default function AlertsPanel({ notifications, fraudAlerts }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-blue-700">
          <FaBell />
          <h3 className="text-xl font-semibold text-slate-900">Notifications</h3>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-sm text-slate-600">No recent notifications.</p>
          ) : (
            notifications.map((note) => (
              <div key={note.id} className="rounded-3xl bg-slate-50 p-4 text-slate-700">
                <p className="font-semibold">{note.title}</p>
                <p className="mt-1 text-sm">{note.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center gap-2 text-blue-700">
          <FaShieldAlt />
          <h3 className="text-xl font-semibold text-slate-900">Risk alerts</h3>
        </div>
        <div className="mt-4 space-y-3">
          {fraudAlerts.filter((alert) => alert.active).length === 0 ? (
            <p className="text-sm text-slate-600">No active risk alerts at the moment.</p>
          ) : (
            fraudAlerts.filter((alert) => alert.active).map((alert) => (
              <div key={alert.id} className="rounded-3xl bg-rose-50 p-4 text-slate-700">
                <p className="font-semibold">Order {alert.orderId}</p>
                <p className="mt-1 text-sm">{alert.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
