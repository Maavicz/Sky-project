export function computeNewId(currentCount) {
  return `SB-2026-${String(currentCount + 1).padStart(3, '0')}`;
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
    { key: "workflow", label: "Workflow" },
    ...(role === "subadmin" ? [{ key: "cooperate", label: "Cooperate" }] : []),
    { key: "forwarding", label: "Shipment Forwarding" },
  ];

  return tabs;
}
