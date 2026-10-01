import { useState } from "react";
import CountryPhoneField from "./CountryPhoneField.jsx";
import { isValidInternationalPhone } from "../testHelpers/phone.mjs";
import {
  FaBell,
  FaBookOpen,
  FaChartBar,
  FaClipboardList,
  FaClock,
  FaLock,
  FaPalette,
  FaPlane,
  FaUser,
} from "react-icons/fa";

const sections = [
  { key: "preferences", label: "Preferences", icon: FaPalette },
  { key: "profile", label: "Profile & security", icon: FaUser },
  { key: "manual", label: "Operational manual", icon: FaBookOpen },
  { key: "accountability", label: "Staff accountability", icon: FaClipboardList },
  { key: "statistics", label: "Shipment statistics", icon: FaChartBar },
  { key: "airport", label: "Airport procedures", icon: FaPlane },
];

const notificationTypes = [
  { key: "shipments", label: "Shipment activity", description: "Bookings, status updates, and assignment changes." },
  { key: "payments", label: "Payment activity", description: "Transfer reports and payment verification." },
  { key: "security", label: "Security events", description: "PIN checks, account changes, and access alerts." },
];

const airportStages = [
  { title: "1. Booking and cargo declaration", text: "Confirm sender and receiver contacts, route, item description, quantity, weight, selected service, and special handling. Reconcile the declared goods with the physical shipment." },
  { title: "2. Acceptance and packaging check", text: "Check outer packaging, labels, visible damage, and readiness for ordinary handling. Hold items that appear unsafe, inadequately packed, prohibited, or inconsistent with the booking." },
  { title: "3. Security and documentation", text: "Collect required identification, declarations, permits, and carrier documents. Follow current airline, airport, customs, and security instructions; refer uncertain cargo to the responsible authority." },
  { title: "4. Handover and custody record", text: "Record the handover time, staff member, shipment reference, receiving party, and any exceptions. Do not mark a shipment accepted or cleared until the responsible party confirms it." },
  { title: "5. Carrier and airport processing", text: "Track check-in, screening, acceptance, flight allocation, and operational exceptions. Keep estimates clearly distinguished from confirmed milestones." },
  { title: "6. Arrival and last-mile handoff", text: "Verify arrival, receiving hub, rider assignment, recipient details, and custody transfer. Record failed delivery attempts and arrange redelivery through approved procedures." },
  { title: "7. Proof of delivery and closeout", text: "Capture recipient confirmation or other approved proof of delivery. Reconcile shipment status, payment and custody records, and close outstanding exceptions." },
];

function SettingToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? "bg-emerald-700" : "bg-slate-300"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="border-b border-slate-200 pb-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
      <h3 className="mt-2 text-2xl font-bold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function Stat({ label, value, note }) {
  return (
    <div className="border-l-2 border-emerald-600 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-600">{note}</p>
    </div>
  );
}

export default function AdminSettings({ settings, orders, activeUser, onUpdateSettings, onChangePassword }) {
  const [section, setSection] = useState("preferences");
  const [profileDraft, setProfileDraft] = useState({
    name: settings.profile?.name || activeUser,
    email: settings.profile?.email || "",
    phone: settings.profile?.phone || "",
  });
  const [passwordDraft, setPasswordDraft] = useState({ current: "", next: "", confirm: "" });
  const [pinDraft, setPinDraft] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState(settings.schedule);
  const [notice, setNotice] = useState("");

  const allEvents = orders.flatMap((order) => (order.history || []).map((entry) => ({ ...entry, shipmentId: order.id })))
    .sort((first, second) => new Date(second.at).getTime() - new Date(first.at).getTime());
  const delivered = orders.filter((order) => order.status === "Delivered").length;
  const inTransit = orders.filter((order) => ["In Flight", "Picked Up", "At Airport"].includes(order.status)).length;
  const awaitingPayment = orders.filter((order) => ["Pending Payment", "Awaiting Transfer"].includes(order.status) || order.paymentStatus === "Awaiting Transfer").length;

  const changePassword = (event) => {
    event.preventDefault();
    const result = onChangePassword(passwordDraft.current, passwordDraft.next, passwordDraft.confirm);
    setNotice(result.message);
    if (result.ok) setPasswordDraft({ current: "", next: "", confirm: "" });
  };

  const savePin = (event) => {
    event.preventDefault();
    if (!/^\d{4,8}$/.test(pinDraft)) {
      setNotice("Enter a PIN containing 4 to 8 digits.");
      return;
    }
    onUpdateSettings({ handoffPin: pinDraft });
    setPinDraft("");
    setNotice("Shipment handoff PIN saved.");
  };

  const saveProfile = (event) => {
    event.preventDefault();
    if (profileDraft.phone && !isValidInternationalPhone(profileDraft.phone)) {
      setNotice("Enter a valid phone number with its country calling code.");
      return;
    }
    onUpdateSettings({ profile: profileDraft });
    setNotice("Profile details saved on this device.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)]">
      <nav aria-label="Admin settings sections" className="flex gap-2 overflow-x-auto xl:flex-col xl:overflow-visible">
        {sections.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setSection(key); setNotice(""); }}
            aria-current={section === key ? "page" : undefined}
            className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${section === key ? "bg-slate-900 text-white" : "bg-white text-slate-700 hover:bg-slate-100"}`}
          >
            <Icon />{label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8">
        {notice && <p role="status" className="mb-5 rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-900">{notice}</p>}

        {section === "preferences" && (
          <div className="space-y-8">
            <SectionHeading eyebrow="Workspace" title="Preferences" description="Control admin notifications, workspace appearance, and your weekly working schedule." />
            <section>
              <div className="flex items-center gap-2"><FaBell className="text-blue-700" /><h4 className="font-semibold text-slate-900">Notifications</h4></div>
              <div className="mt-4 divide-y divide-slate-100">
                {notificationTypes.map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between gap-5 py-4">
                    <div><p className="text-sm font-semibold text-slate-900">{label}</p><p className="mt-1 text-sm text-slate-600">{description}</p></div>
                    <SettingToggle checked={settings.notifications[key] !== false} onChange={(checked) => onUpdateSettings({ notifications: { ...settings.notifications, [key]: checked } })} label={`${label} notifications`} />
                  </div>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2"><FaPalette className="text-blue-700" /><h4 className="font-semibold text-slate-900">Admin background</h4></div>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { key: "mist", name: "Mist", color: "#f5f8ff" },
                  { key: "white", name: "White", color: "#ffffff" },
                  { key: "cool-gray", name: "Cool gray", color: "#e8edf1" },
                ].map((choice) => (
                  <button key={choice.key} type="button" onClick={() => onUpdateSettings({ backgroundColor: choice.key })} aria-pressed={settings.backgroundColor === choice.key} className={`flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${settings.backgroundColor === choice.key ? "border-blue-700 ring-2 ring-blue-200" : "border-slate-200 hover:border-slate-400"}`}>
                    <span aria-hidden="true" className="h-5 w-5 rounded border border-slate-300" style={{ backgroundColor: choice.color }} />{choice.name}
                  </button>
                ))}
              </div>
            </section>
            <section>
              <div className="flex items-center gap-2"><FaClock className="text-blue-700" /><h4 className="font-semibold text-slate-900">Working schedule</h4></div>
              <p className="mt-1 text-sm text-slate-600">Set the working days and local operating hours shown to this admin user.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                  const selected = scheduleDraft.days.includes(day);
                  return <button key={day} type="button" aria-pressed={selected} onClick={() => setScheduleDraft((current) => ({ ...current, days: selected ? current.days.filter((value) => value !== day) : [...current.days, day] }))} className={`min-h-10 min-w-12 rounded-lg border px-3 text-sm font-semibold ${selected ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{day}</button>;
                })}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">Start time<input type="time" value={scheduleDraft.start} onChange={(event) => setScheduleDraft((current) => ({ ...current, start: event.target.value }))} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
                <label className="text-sm font-medium text-slate-700">End time<input type="time" value={scheduleDraft.end} onChange={(event) => setScheduleDraft((current) => ({ ...current, end: event.target.value }))} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
                <label className="text-sm font-medium text-slate-700">Time zone<select value={scheduleDraft.timezone} onChange={(event) => setScheduleDraft((current) => ({ ...current, timezone: event.target.value }))} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3"><option value="Africa/Lagos">Africa/Lagos (WAT)</option><option value="UTC">UTC</option></select></label>
              </div>
              <button type="button" onClick={() => { onUpdateSettings({ schedule: scheduleDraft }); setNotice("Working schedule saved."); }} className="mt-4 min-h-11 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Save schedule</button>
            </section>
          </div>
        )}

        {section === "profile" && (
          <div className="space-y-8">
            <SectionHeading eyebrow="Account" title="Profile & security" description="Maintain your staff contact details and account credentials." />
            <form onSubmit={saveProfile} className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Display name<input value={profileDraft.name} onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
              <label className="text-sm font-medium text-slate-700">Work email<input type="email" value={profileDraft.email} onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
              <CountryPhoneField id="admin-profile-phone" label="Phone" value={profileDraft.phone} onChange={(phone) => setProfileDraft({ ...profileDraft, phone })} />
              <div className="flex items-end"><button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Save profile</button></div>
            </form>
            <form onSubmit={changePassword} className="grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
              <div className="sm:col-span-2"><h4 className="font-semibold text-slate-900">Change password</h4><p className="mt-1 text-sm text-slate-600">Use at least 8 characters. You must provide your current password.</p></div>
              <label className="text-sm font-medium text-slate-700">Current password<input type="password" autoComplete="current-password" value={passwordDraft.current} onChange={(event) => setPasswordDraft({ ...passwordDraft, current: event.target.value })} required className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
              <label className="text-sm font-medium text-slate-700">New password<input type="password" autoComplete="new-password" value={passwordDraft.next} onChange={(event) => setPasswordDraft({ ...passwordDraft, next: event.target.value })} required minLength={8} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
              <label className="text-sm font-medium text-slate-700">Confirm new password<input type="password" autoComplete="new-password" value={passwordDraft.confirm} onChange={(event) => setPasswordDraft({ ...passwordDraft, confirm: event.target.value })} required minLength={8} className="mt-1 block min-h-11 w-full rounded-lg border border-slate-300 px-3" /></label>
              <div className="flex items-end"><button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Change password</button></div>
            </form>
            <form onSubmit={savePin} className="space-y-4 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2"><FaLock className="text-blue-700" /><h4 className="font-semibold text-slate-900">Shipment handoff PIN</h4></div>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">Set a 4–8 digit PIN required before staff can assign or push a shipment to another person or approve a handoff. This prototype stores the PIN in this browser only; production use requires server-side verification and access controls.</p>
              <div className="flex flex-wrap gap-3">
                <input type="password" inputMode="numeric" autoComplete="new-password" maxLength={8} pattern="[0-9]{4,8}" aria-label="New shipment handoff PIN" placeholder={settings.handoffPin ? "Replace current PIN" : "Set a 4–8 digit PIN"} value={pinDraft} onChange={(event) => setPinDraft(event.target.value.replace(/\D/g, "").slice(0, 8))} className="min-h-11 w-56 rounded-lg border border-slate-300 px-3" />
                <button type="submit" className="min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">Save handoff PIN</button>
                {settings.handoffPin && <span className="self-center text-sm font-medium text-emerald-800">PIN is set</span>}
              </div>
            </form>
          </div>
        )}

        {section === "manual" && (
          <div className="space-y-5">
            <SectionHeading eyebrow="Standard operating procedures" title="Operational manual" description="A practical checklist for booking, custody, exceptions, communication, and closeout. Follow current carrier and airport rules for each shipment." />
            {[
              ["Booking acceptance", "Confirm the shipment reference, route, service, contact details, cargo declaration, selected delivery option, and accepted terms before scheduling movement."],
              ["Cargo custody", "Record each custody handoff with shipment ID, date/time, releasing person, receiving person, location, condition, and any exception. Do not rely on verbal handoffs alone."],
              ["Payments and dispatch", "Display verified company transfer instructions. Keep transfers pending until reconciled against the account. Do not dispatch based only on a customer-submitted receipt."],
              ["Shipment updates", "Record status transitions promptly with actor and timestamp. Separate estimated milestones from confirmed carrier/airport events and preserve exception notes."],
              ["Customer communication", "Use the recorded sender and receiver contacts for confirmation, pickup coordination, delays, additional charges, and proof-of-delivery follow-up."],
              ["Exceptions and escalation", "Hold suspicious, damaged, undocumented, prohibited, or unsafe cargo. Escalate to the operations lead and relevant carrier/airport authority; record the decision and next action."],
              ["Privacy and access", "Use customer data only for delivery operations. Restrict shipment details, payment records, and staff credentials to authorized work roles."],
            ].map(([title, text]) => <article key={title} className="border-l-2 border-blue-700 py-1 pl-4"><h4 className="font-semibold text-slate-900">{title}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{text}</p></article>)}
          </div>
        )}

        {section === "accountability" && (
          <div className="space-y-5">
            <SectionHeading eyebrow="Audit trail" title="Staff accountability records" description="Recorded shipment actions, staff actor, and event time. This browser-based record is operationally useful but is not tamper-proof." />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3">Date &amp; time</th><th className="px-3 py-3">Staff</th><th className="px-3 py-3">Shipment</th><th className="px-3 py-3">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {allEvents.length ? allEvents.map((event, index) => <tr key={`${event.shipmentId}-${event.at}-${index}`}><td className="whitespace-nowrap px-3 py-3 text-slate-600">{new Date(event.at).toLocaleString()}</td><td className="px-3 py-3 font-medium text-slate-900">{event.actor || "system"}</td><td className="px-3 py-3 font-semibold text-blue-800">{event.shipmentId}</td><td className="px-3 py-3 text-slate-700">{event.event}</td></tr>) : <tr><td colSpan="4" className="px-3 py-8 text-center text-slate-500">No shipment events recorded.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === "statistics" && (
          <div className="space-y-6">
            <SectionHeading eyebrow="Operations overview" title="Shipment statistics" description="A live summary of the shipment records currently stored in this workspace." />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat label="Total shipments" value={orders.length} note="All recorded bookings" />
              <Stat label="Delivered" value={delivered} note="Status is delivered" />
              <Stat label="In transit" value={inTransit} note="Picked up, airport, or in flight" />
              <Stat label="Awaiting payment" value={awaitingPayment} note="Reported or pending transfer" />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <section><h4 className="font-semibold text-slate-900">Status breakdown</h4><dl className="mt-3 divide-y divide-slate-100">{Object.entries(orders.reduce((counts, order) => ({ ...counts, [order.status || "Unknown"]: (counts[order.status || "Unknown"] || 0) + 1 }), {})).map(([status, count]) => <div key={status} className="flex justify-between py-3 text-sm"><dt className="text-slate-600">{status}</dt><dd className="font-bold text-slate-900">{count}</dd></div>)}</dl></section>
              <section><h4 className="font-semibold text-slate-900">Recent activity</h4><p className="mt-2 text-sm leading-6 text-slate-600">The accountability section contains the event-level record for each shipment, including its staff actor and timestamp.</p><p className="mt-3 text-sm font-medium text-slate-800">Recorded events: {allEvents.length}</p></section>
            </div>
          </div>
        )}

        {section === "airport" && (
          <div className="space-y-5">
            <SectionHeading eyebrow="Staff education" title="Airport logistics procedures" description="Use this operational sequence as a training reference. Carrier acceptance, airport screening, customs decisions, and dangerous-goods requirements are governed by current authorities and carrier procedures." />
            <div className="space-y-4">
              {airportStages.map(({ title, text }) => <article key={title} className="grid gap-2 border-b border-slate-100 pb-4 sm:grid-cols-[15rem_1fr]"><h4 className="font-semibold text-slate-900">{title}</h4><p className="text-sm leading-6 text-slate-600">{text}</p></article>)}
            </div>
            <p className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-950">Safety reminder: staff must not independently approve restricted or dangerous goods. Stop handling and escalate to the designated supervisor and authorized carrier/airport personnel.</p>
          </div>
        )}
      </div>
    </div>
  );
}