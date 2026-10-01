export function computeNewId(currentCount) {
  return `SB-2026-${String(currentCount + 1).padStart(3, '0')}`;
}

export function canAccessTracking(role = "guest") {
  const normalizedRole = String(role ?? "guest").trim().toLowerCase();
  return ["client", "admin", "subadmin"].includes(normalizedRole);
}

export function verifyShipmentHandoffPin(savedPin, enteredPin) {
  return /^\d{4,8}$/.test(String(savedPin ?? "")) && String(savedPin) === String(enteredPin ?? "");
}

function normalizeHubLocation(value) {
  const location = String(value ?? "").trim().toLowerCase();
  if (["ph", "phc", "port harcourt", "port-harcourt"].includes(location)) return "PHC";
  if (["los", "lagos"].includes(location)) return "LOS";
  if (["abj", "abuja"].includes(location)) return "ABJ";
  return location;
}

export function getRouteHubDirection(route, hub) {
  const endpoints = String(route ?? "").split(/\s*(?:→|->|\bto\b)\s*/i);
  if (endpoints.length < 2) return null;
  const origin = normalizeHubLocation(endpoints[0]);
  const destination = normalizeHubLocation(endpoints[1]);
  const hubCode = normalizeHubLocation(hub);
  if (destination === hubCode) return "incoming";
  if (origin === hubCode) return "outgoing";
  return null;
}

export function getHubStaff(profiles = [], hub) {
  const hubCode = normalizeHubLocation(hub);
  return profiles.filter((profile) => normalizeHubLocation(profile.workLocation) === hubCode && profile.status === "Active");
}

export function appendShipmentEvent(order, changes, event, { actor = "system", at = new Date().toISOString() } = {}) {
  const history = Array.isArray(order.history) ? order.history : [];
  const statusChanged = Object.hasOwn(changes, "status") && changes.status !== order.status;

  return {
    ...order,
    ...changes,
    updatedAt: at,
    ...(statusChanged ? { statusUpdatedAt: at } : {}),
    history: [...history, { at, actor, event }],
  };
}

export function ensureShipmentAudit(order, fallbackAt = new Date().toISOString()) {
  if (Array.isArray(order.history) && order.history.length > 0) {
    return {
      ...order,
      createdAt: order.createdAt ?? null,
      updatedAt: order.updatedAt || order.history[order.history.length - 1].at || fallbackAt,
    };
  }

  const originalTimestamp = order.createdAt || order.updatedAt || null;
  const recordTimestamp = originalTimestamp || fallbackAt;
  return {
    ...order,
    createdAt: originalTimestamp,
    updatedAt: order.updatedAt || recordTimestamp,
    history: [{
      at: recordTimestamp,
      actor: "system",
      event: originalTimestamp
        ? "Existing shipment migrated to audit history"
        : "Legacy shipment imported; original booking date unavailable",
    }],
  };
}

export function getFutureFlightSchedulePreview(daysWindow = 14) {
  const flightTemplate = [
    { id: "AP-204", airline: "Air Peace", route: "PHC → LOS", region: "Local" },
    { id: "EK-315", airline: "Emirates", route: "ABJ → DXB", region: "International" },
    { id: "NG-118", airline: "Arik Air", route: "LOS → ABJ", region: "Local" },
    { id: "LH-440", airline: "Lufthansa", route: "LOS → FRA", region: "International" },
    { id: "AF-218", airline: "Air France", route: "ABJ → CDG", region: "International" },
  ];

  const windowDays = Math.max(7, Number(daysWindow) || 14);
  const baseDate = new Date();
  const schedules = [];

  flightTemplate.forEach((flight, index) => {
    const dayOffset = (index + 1) * 2;
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayOffset);

    if (date.getTime() - baseDate.getTime() > windowDays * 24 * 60 * 60 * 1000) {
      return;
    }

    const time = ["06:40", "09:15", "11:30", "14:20", "18:55", "20:40"][index % 6];
    schedules.push({
      ...flight,
      takeoffDate: date.toISOString().slice(0, 10),
      takeoffTime: time,
      window: `${Math.ceil((date - baseDate) / (1000 * 60 * 60 * 24)) + 1} day(s)`,
    });
  });

  return schedules;
}

export function getAdminTabs(role = "admin") {
  const tabs = [
    { key: "overview", label: "Overview" },
    ...(role === "admin" ? [{ key: "flight-schedules", label: "Flight Schedules" }] : []),
    ...(role === "admin" ? [{ key: "client-details", label: "Client Details" }] : []),
    ...(role === "admin" ? [{ key: "profiles", label: "Sub-admin Profiles" }] : []),
    ...(role === "admin" ? [{ key: "settings", label: "Settings" }] : []),
    { key: "workflow", label: "Workflow" },
    ...(role === "subadmin" ? [{ key: "cooperate", label: "Cooperate" }] : []),
    { key: "forwarding", label: "Shipment Forwarding" },
  ];

  return tabs;
}
