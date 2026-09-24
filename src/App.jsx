import { useState, useEffect, useMemo, useRef } from "react";
import { validateBooking } from "./testHelpers/validation.mjs";
import { getAdminTabs, getFutureFlightSchedulePreview } from "./testHelpers/appLogic.mjs";
import {
  FaBell,
  FaBoxOpen,
  FaChartBar,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaEnvelope,
  FaExchangeAlt,
  FaFacebookF,
  FaInstagram,
  FaPaperPlane,
  FaPhoneAlt,
  FaPlane,
  FaRoute,
  FaSearch,
  FaSignOutAlt,
  FaTruckMoving,
  FaUserShield,
  FaShieldAlt,
  FaUsers,
  FaWarehouse,
  FaMapMarkerAlt,
  FaLinkedinIn,
} from "react-icons/fa";
import heroImage from "../imagery/happy-new-month.png";
import Field from "./components/Field.jsx";
import LoginForm from "./components/LoginForm.jsx";
import Toasts from "./components/Toasts.jsx";
import Card from "./components/Card.jsx";
import TrackSection from "./components/TrackSection.jsx";
import AlertsPanel from "./components/AlertsPanel.jsx";
import Cooperate from "./Cooperate.jsx";

const services = [
  {
    title: "Same-day & next-day flights",
    description:
      "Move packages faster with air-integrated delivery across major Nigerian cities.",
  },
  {
    title: "Airport partnership model",
    description:
      "We partner with airlines like Air Peace and FAAN-managed airports for seamless logistics.",
  },
  {
    title: "Live shipment tracking",
    description: "Track every shipment from pickup to delivery with instant status updates.",
  },
  {
    title: "Asset-light freight network",
    description:
      "Our flexible, asset-light model keeps costs low while maintaining high reliability.",
  },
];

const faq = [
  {
    question: "How quickly can I receive my delivery?",
    answer: "We offer same-day and next-day delivery on key Nigerian routes when shipments are booked before cutoff times.",
  },
  {
    question: "Can I track my shipment in real time?",
    answer: "Yes. Use the Track page and enter your tracking ID to view the latest status update instantly.",
  },
  {
    question: "Which cities do you cover?",
    answer: "Our primary network covers Port Harcourt, Lagos, and Abuja, with partner support for airport-connected delivery.",
  },
];

const deliveryStats = [
  { value: "2,400+", label: "Deliveries completed" },
  { value: "96%", label: "On-time performance" },
  { value: "18", label: "Active route corridors" },
  { value: "4.9/5", label: "Customer satisfaction" },
];

const cityCoverage = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu", "Kano"];

const testimonials = [
  {
    quote: "Their team handled a time-critical shipment from Port Harcourt to Lagos without any delays. The tracking updates were clear and consistent.",
    name: "Michael A.",
    role: "Operations Manager, CEE Logistics",
  },
  {
    quote: "We booked a same-day move for urgent medical supplies and the communication from Skybridge Nexus was exceptional from pickup to delivery.",
    name: "Grace T.",
    role: "Procurement Lead, Healthline Nigeria",
  },
  {
    quote: "The network is dependable and professional. Their airport partnerships make cargo handoff feel seamless and stress-free.",
    name: "Daniel O.",
    role: "Sales Director, PrimeCommerce",
  },
];

const whyChooseUs = [
  {
    title: "Fast delivery windows",
    description: "Same-day and next-day cargo services for high-priority routes and urgent freight.",
    icon: FaPlane,
  },
  {
    title: "Airport-ready logistics",
    description: "Strong connections with airline and airport operations to keep cargo moving efficiently.",
    icon: FaRoute,
  },
  {
    title: "Real-time visibility",
    description: "Track every shipment from pickup to final handoff with live operational updates.",
    icon: FaSearch,
  },
];

const initialAccounts = {
  admin: { role: "admin", password: "1234", status: "Active" },
  subadmin: { role: "subadmin", password: "sub123", status: "Active" },
  client: { role: "client", password: "corp123", status: "Active" },
};

const initialTasks = [
  { id: "TSK-001", shipment: "SB-2026-001", task: "Confirm pickup", assignee: "Team A", status: "Open" },
  { id: "TSK-002", shipment: "SB-2026-002", task: "Prepare airway bill", assignee: "Team B", status: "In Progress" },
  { id: "TSK-003", shipment: "SB-2026-003", task: "Schedule forwarding", assignee: "Team C", status: "Open" },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [role, setRole] = useState("guest");
  const [adminTab, setAdminTab] = useState("overview");
  const [login, setLogin] = useState({ user: "", pass: "" });
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingResult, setTrackingResult] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [subadminProfiles, setSubadminProfiles] = useState([]);
  const [activeUser, setActiveUser] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [clientOrderSearch, setClientOrderSearch] = useState("");
  const [subadminForm, setSubadminForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profileImage: "",
    departments: [],
    adminFeatures: [],
    role: "Rider A",
    workLocation: "Lagos",
    positionStatus: "Entry",
    jobType: "Permanent",
    dateOfEntry: new Date().toISOString().split("T")[0],
  });
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [profileNotice, setProfileNotice] = useState("");
  const [forwardTargets, setForwardTargets] = useState({});
  const [autoAssign, setAutoAssign] = useState(false);
  const [flightFilter, setFlightFilter] = useState("all");
  const [flightSearch, setFlightSearch] = useState("");
  const [futureFlightWindow, setFutureFlightWindow] = useState(14);
  const [flightSchedules, setFlightSchedules] = useState([
    { id: "AP-204", airline: "Air Peace", route: "PHC → LOS", region: "Local", status: "On Time", departure: "17:50", arrival: "18:40", eta: "18:40", weather: "Clear", gate: "C12", notes: "Boarding progressing normally", risk: "Low" },
    { id: "EK-315", airline: "Emirates", route: "ABJ → DXB", region: "International", status: "Weather Watch", departure: "19:10", arrival: "21:15", eta: "21:15", weather: "Thunderstorm risk", gate: "B03", notes: "Possible delay window due to weather advisory", risk: "Medium" },
    { id: "NG-118", airline: "Arik Air", route: "LOS → ABJ", region: "Local", status: "Delayed", departure: "19:45", arrival: "20:55", eta: "20:55", weather: "Light rain", gate: "A09", notes: "Airport congestion caused a 35-minute delay", risk: "Medium" },
    { id: "LH-440", airline: "Lufthansa", route: "LOS → FRA", region: "International", status: "On Time", departure: "20:55", arrival: "23:10", eta: "23:10", weather: "Clear", gate: "D21", notes: "Cargo uplift and customs clearance proceeding", risk: "Low" },
    { id: "AF-218", airline: "Air France", route: "ABJ → CDG", region: "International", status: "Cancelled", departure: "18:30", arrival: "—", eta: "—", weather: "Heavy rain", gate: "—", notes: "Temporary cancellation due to severe weather and operational reset", risk: "High" },
  ]);

  const [booking, setBooking] = useState({ name: "", pickup: "", delivery: "", weight: "", contact: "" });
  const [recentBookingId, setRecentBookingId] = useState("");
  const [paymentStage, setPaymentStage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: "", expiry: "", cvv: "" });
  const [notifications, setNotifications] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [warehouses, setWarehouses] = useState([
    { id: "WH-001", name: "Port Harcourt Cargo Hub", location: "PHC", occupied: 88, capacity: 120, status: "Operational" },
    { id: "WH-002", name: "Lagos Air Cargo Depot", location: "LOS", occupied: 104, capacity: 140, status: "Operational" },
    { id: "WH-003", name: "Abuja Transit Warehouse", location: "ABJ", occupied: 59, capacity: 80, status: "Operational" },
  ]);
  const [warehouseItems, setWarehouseItems] = useState([
    { id: "WHI-001", orderId: "SB-2026-001", description: "Consumer electronics", warehouse: "Port Harcourt Cargo Hub", status: "Awaiting dispatch" },
    { id: "WHI-002", orderId: "SB-2026-002", description: "Medical supplies", warehouse: "Lagos Air Cargo Depot", status: "Cleared" },
    { id: "WHI-003", orderId: "SB-2026-003", description: "Apparel consignment", warehouse: "Abuja Transit Warehouse", status: "Received" },
  ]);
  const [clientRegistration, setClientRegistration] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [clientNotice, setClientNotice] = useState("");
  const [showClientRegistration, setShowClientRegistration] = useState(false);

  const [orders, setOrders] = useState([
    { id: "SB-2026-001", status: "In Flight", route: "PH → Lagos", assignedTo: "Unassigned", pendingApproval: false, paymentStatus: "Paid", cargoStage: "In transit", airportStatus: "Cleared", flagged: false },
    { id: "SB-2026-002", status: "Delivered", route: "PH → Abuja", assignedTo: "Unassigned", pendingApproval: false, paymentStatus: "Paid", cargoStage: "Delivered", airportStatus: "Completed", flagged: false },
    { id: "SB-2026-003", status: "At Airport", route: "PH → Lagos", assignedTo: "Unassigned", pendingApproval: false, paymentStatus: "Pending", cargoStage: "Airport processing", airportStatus: "Awaiting clearance", flagged: false },
  ]);

  // Persist key names
  const STORAGE_KEYS = {
    accounts: "sb_accounts_v1",
    orders: "sb_orders_v1",
    subadmins: "sb_subadmins_v1",
  };

  // Load persisted state on mount
  useEffect(() => {
    try {
      const persistedAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
      const persistedOrders = localStorage.getItem(STORAGE_KEYS.orders);
      const persistedSubadmins = localStorage.getItem(STORAGE_KEYS.subadmins);
      if (persistedAccounts) setAccounts(JSON.parse(persistedAccounts));
      if (persistedOrders) setOrders(JSON.parse(persistedOrders));
      if (persistedSubadmins) setSubadminProfiles(JSON.parse(persistedSubadmins));
    } catch (e) {
      console.warn("Failed to load persisted state:", e);
    }
  }, []);

  // Save important state slices when they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.accounts, JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
    } catch {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.subadmins, JSON.stringify(subadminProfiles));
    } catch {}
  }, [subadminProfiles]);

  // Performance: memoize derived lists
  const memoActiveSubadmins = useMemo(() => subadminProfiles.filter((p) => p.status === "Active"), [subadminProfiles]);
  const analyticsMetrics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.paymentStatus === "Paid" ? 2500 : 0),
      0
    );
    const pendingPayments = orders.filter((order) => order.paymentStatus === "Pending").length;
    const fraudCount = fraudAlerts.filter((alert) => alert.active).length;
    return {
      totalRevenue,
      pendingPayments,
      fraudCount,
      warehouseUsed: warehouses.reduce((sum, warehouse) => sum + warehouse.occupied, 0),
      warehouseCapacity: warehouses.reduce((sum, warehouse) => sum + warehouse.capacity, 0),
    };
  }, [orders, fraudAlerts, warehouses]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    return Object.entries(accounts)
      .filter(([username]) => username !== "client")
      .filter(([username, account]) => {
        if (!term) return true;
        return (
          username.toLowerCase().includes(term) ||
          account.role.toLowerCase().includes(term)
        );
      });
  }, [accounts, userSearch]);
  const filteredProfiles = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return subadminProfiles;
    return subadminProfiles.filter((profile) =>
      profile.username.toLowerCase().includes(term) ||
      profile.fullName.toLowerCase().includes(term) ||
      profile.departments.some((dept) => dept.toLowerCase().includes(term))
    );
  }, [subadminProfiles, userSearch]);
  const trackingDebounceRef = useRef(null);

  const handleLogin = ({ user, pass }) => {
    if (!user.trim() || !pass) {
      pushToast({ type: "error", message: "Please enter username and password" });
      return;
    }

    const account = accounts[user.trim()];
    if (!account) {
      pushToast({ type: "error", message: "Invalid login ❌" });
      return;
    }

    // simple password check (client-side demo only)
    if (account.password !== pass) {
      pushToast({ type: "error", message: "Invalid login ❌" });
      return;
    }

    if (account.status !== "Active") {
      pushToast({ type: "error", message: account.status === "Suspended" ? "This account is suspended. Contact the admin." : "This account has been terminated." });
      return;
    }

    setRole(account.role);
    setActiveUser(user.trim());
    setAdminTab("overview");
    setLogin({ user: "", pass: "" });
    setPage(account.role === "client" ? "client" : "admin");
  };

  const handleClientPortalLogin = ({ user, pass }) => {
    if (!user.trim() || !pass) {
      pushToast({ type: "error", message: "Please enter username and password" });
      return;
    }

    const account = accounts[user.trim()];
    if (!account || account.role !== "client") {
      pushToast({ type: "error", message: "This portal is for corporate clients only." });
      return;
    }

    if (account.password !== pass) {
      pushToast({ type: "error", message: "Invalid login ❌" });
      return;
    }

    if (account.status !== "Active") {
      pushToast({ type: "error", message: account.status === "Suspended" ? "This account is suspended. Contact the admin." : "This account has been terminated." });
      return;
    }

    setRole("client");
    setActiveUser(user.trim());
    setAdminTab("overview");
    setLogin({ user: "", pass: "" });
    setPage("client");
  };

  const handleLogout = () => {
    setRole("guest");
    setActiveUser("");
    navigateTo("home");
    setAdminTab("overview");
    setLogin({ user: "", pass: "" });
  };

  // Simple client-side auth guard helper
  const requireRole = (allowedRoles) => {
    if (!Array.isArray(allowedRoles)) allowedRoles = [allowedRoles];
    return allowedRoles.includes(role);
  };

  const pagePermissions = {
    admin: ["admin", "subadmin"],
  };

  // Navigation helper that enforces auth for pages that require roles
  const navigateTo = (targetPage, opts = {}) => {
    const { require = pagePermissions[targetPage] ?? null } = opts;
    if (require && !requireRole(require)) {
      pushToast({ type: "error", message: "You do not have permission to access that page." });
      setPage("login");
      return;
    }
    setPage(targetPage);
  };

  // Simple toast system (client-side). Use `pushToast({type:'info'|'success'|'error', message})`
  const [toasts, setToasts] = useState([]);
  const pushToast = (t) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, t.duration || 4000);
  };

  const createNotification = (notification) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setNotifications((prev) => [{ id, ...notification }, ...prev].slice(0, 5));
  };

  const createFraudAlert = (orderId, message) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setFraudAlerts((prev) => [{ id, orderId, message, active: true }, ...prev]);
  };

  const trackPackage = () => {
    // Debounced lookup
    if (trackingDebounceRef.current) clearTimeout(trackingDebounceRef.current);
    trackingDebounceRef.current = setTimeout(() => {
      const found = orders.find((o) => o.id.toUpperCase() === trackingInput.toUpperCase());
      if (found) {
        setTrackingResult(`${found.status} — ${found.route}`);
        setTrackingDetails({
          orderId: found.id,
          status: found.status,
          route: found.route,
          currentLocation:
            found.status === "Delivered"
              ? "Destination hub"
              : found.status === "At Airport"
              ? "Airport cargo terminal"
              : "Inbound distribution center",
          timeline: [
            { label: "Order received", time: "08:12" },
            { label: "Picked up", time: "09:30" },
            { label: "In transit", time: "12:45" },
            { label: found.status, time: "15:20" },
          ],
          estimatedDelivery: found.status === "Delivered" ? "Delivered" : "Today 18:00",
        });
      } else {
        setTrackingResult("Not Found ❌");
        setTrackingDetails(null);
      }
    }, 250);
  };

  const handleBook = () => {
    const formIsValid = validateBooking(booking);
    if (!formIsValid.ok) {
      pushToast({ type: "error", message: "Please enter a valid customer name, route, weight, and phone number." });
      return;
    }

    const newId = `SB-2026-${String(orders.length + 1).padStart(3, '0')}`;
    const autoAssignedTo = memoActiveSubadmins[0]?.username || "Unassigned";
    const newOrder = {
      id: newId,
      status: "Pending",
      route: `${booking.pickup} → ${booking.delivery}`,
      assignedTo: autoAssignedTo,
      pendingApproval: false,
      weight: booking.weight,
      contact: booking.contact,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    setRecentBookingId(newId);
    setBooking({ name: "", pickup: "", delivery: "", weight: "", contact: "" });
    setPaymentStage(true);
    setTrackingInput(newId);
    setTrackingResult("Pending");
    pushToast({ type: "success", message: `Booking submitted! Your tracking ID is ${newId}` });
  };

  const handlePaymentDone = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === recentBookingId
          ? { ...order, paymentStatus: "Paid", status: "In Flight", cargoStage: "Airport processing" }
          : order
      )
    );
    createNotification({
      title: "Payment confirmed",
      message: `Payment for booking ${recentBookingId} was confirmed. Shipment is now in transit.`,
      type: "success",
    });
    setPaymentStage(false);
    setTrackingResult("In Flight — processing at airport");
    setTrackingDetails({
      orderId: recentBookingId,
      status: "In Flight",
      route: orders.find((o) => o.id === recentBookingId)?.route || "Unknown route",
      currentLocation: "Airport cargo terminal",
      timeline: [
        { label: "Payment confirmed", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ],
      estimatedDelivery: "Today 18:00",
    });
    navigateTo("track");
    window.open(`https://wa.me/2349165000149?text=Hello%20Skybridge%20Nexus%20Logistics%2C%20I%20have%20completed%20payment%20for%20booking%20${recentBookingId}.`, "_blank", "noopener,noreferrer");
  };

  const updateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
  };

  const assignOrderToSubadmin = (id, targetUsername) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const nextAssignedTo = targetUsername && targetUsername !== "Unassigned" ? targetUsername : "Unassigned";
        return { ...order, assignedTo: nextAssignedTo, pendingApproval: false, pendingForwardTo: "" };
      })
    );
    const selectedProfile = subadminProfiles.find((profile) => profile.username === targetUsername);
    setProfileNotice(selectedProfile ? `Shipment ${id} assigned to ${selectedProfile.fullName}` : `Shipment ${id} assignment updated`);
  };

  const forwardShipment = (id, targetUsername) => {
    if (!targetUsername || targetUsername === "Unassigned") {
      setProfileNotice("Choose a sub-admin before forwarding.");
      return;
    }
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        return {
          ...order,
          pendingApproval: true,
          pendingForwardTo: targetUsername,
        };
      })
    );
    const selectedProfile = subadminProfiles.find((profile) => profile.username === targetUsername);
    setProfileNotice(selectedProfile ? `Shipment ${id} forwarded to ${selectedProfile.fullName} for approval.` : `Shipment ${id} forwarding requested.`);
  };

  const approveShipmentAssignment = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              assignedTo: order.pendingForwardTo || order.assignedTo,
              pendingForwardTo: "",
              pendingApproval: false,
            }
          : order
      )
    );
    setProfileNotice(`Shipment ${id} approved for handoff.`);
  };

  const declineShipmentAssignment = (id) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              pendingForwardTo: "",
              pendingApproval: false,
            }
          : order
      )
    );
    setProfileNotice(`Shipment ${id} forwarding declined and returned to current assignee.`);
  };

  // Auto-assign logic: assign unassigned orders to active subadmin profiles
  const assignUnassignedOrders = () => {
    const available = activeSubadminProfiles.map((p) => p.username);
    if (!available || available.length === 0) {
      pushToast({ type: "error", message: "No active sub-admins available for auto-assignment." });
      return;
    }
    let idx = 0;
    setOrders((prev) =>
      prev.map((o) => {
        if (!o.assignedTo || o.assignedTo === "Unassigned") {
          const assignTo = available[idx % available.length];
          idx += 1;
          return { ...o, assignedTo: assignTo, pendingApproval: false };
        }
        return o;
      })
    );
    pushToast({ type: "success", message: "Auto-assigned unassigned shipments." });
  };

  // When autoAssign is toggled on, run assign immediately; also run when new orders arrive
  useEffect(() => {
    if (!autoAssign) return;
    assignUnassignedOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAssign]);

  useEffect(() => {
    if (!autoAssign) return;
    assignUnassignedOrders();
    // only trigger when orders length changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders.length]);

  useEffect(() => {
    const statusCycle = ["On Time", "Weather Watch", "Delayed", "Gate Change", "Departed", "Cancelled"];
    const weatherCycle = ["Clear", "Light rain", "Thunderstorm risk", "Crosswind advisory", "Fog alert", "Clear"];
    const noteCycle = [
      "Operations are steady and cargo handoff remains on schedule.",
      "Weather checks are active and route monitoring remains elevated.",
      "Ground operations updated the departure window for coordination.",
      "Gate assignment shifted to support fueling and cargo load timing.",
      "Flight has departed and cargo is now in transit.",
      "Operational cancellation is active; dispatch teams are rerouting.",
    ];

    const intervalId = setInterval(() => {
      setFlightSchedules((prev) =>
        prev.map((flight, index) => {
          const nextStatus = statusCycle[(index + Math.floor(Date.now() / 18000)) % statusCycle.length];
          const isCancelled = nextStatus === "Cancelled";
          const isDeparted = nextStatus === "Departed";
          const liveEta = isCancelled || isDeparted ? "—" : flight.eta;
          return {
            ...flight,
            status: nextStatus,
            weather: isCancelled ? "Severe weather" : weatherCycle[(index + Math.floor(Date.now() / 18000)) % weatherCycle.length],
            eta: liveEta,
            gate: isCancelled ? "—" : flight.gate,
            notes: noteCycle[(index + Math.floor(Date.now() / 18000)) % noteCycle.length],
            risk: nextStatus === "Cancelled" ? "High" : nextStatus === "Delayed" || nextStatus === "Weather Watch" ? "Medium" : "Low",
          };
        })
      );
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const assignTask = (id, team) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, assignee: team, status: "Assigned" } : task))
    );
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: newStatus } : task))
    );
  };

  const handleSubadminPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSubadminForm((prev) => ({ ...prev, profileImage: reader.result || "" }));
    };
    reader.readAsDataURL(file);
  };

  const createSubadminProfile = () => {
    if (!subadminForm.fullName.trim() || subadminForm.departments.length === 0) {
      pushToast({ type: "error", message: "Please provide a full name and select at least one department." });
      return;
    }

    const departments = subadminForm.departments;

    const baseUsername = subadminForm.fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "") || "subadmin";

    const usedUsernames = new Set([
      ...Object.keys(accounts),
      ...subadminProfiles.map((profile) => profile.username),
    ]);

    let username = baseUsername;
    let suffix = 1;
    while (usedUsernames.has(username)) {
      username = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    const generatedPassword = `${Math.random().toString(36).slice(-6)}${Math.random().toString(36).slice(-2).toUpperCase()}`;
    const newProfile = {
      id: `SUB-${Date.now().toString().slice(-4)}`,
      fullName: subadminForm.fullName.trim(),
      email: subadminForm.email.trim(),
      phoneNumber: subadminForm.phoneNumber.trim(),
      profileImage: subadminForm.profileImage,
      departments,
      adminFeatures: subadminForm.adminFeatures,
      role: subadminForm.role,
      workLocation: subadminForm.workLocation,
      positionStatus: subadminForm.positionStatus,
      jobType: subadminForm.jobType,
      dateOfEntry: subadminForm.dateOfEntry,
      status: "Active",
      username,
      password: generatedPassword,
      createdAt: new Date().toLocaleDateString(),
    };

    setSubadminProfiles((prev) => [newProfile, ...prev]);
    setAccounts((prev) => ({
      ...prev,
      [username]: { role: "subadmin", password: generatedPassword, status: "Active", profileId: newProfile.id },
    }));
    setProfileNotice(`Profile created successfully. Username: ${username} | Password: ${generatedPassword}`);
    pushToast({ type: "success", message: `Sub-admin profile created: ${username}` });
    setSubadminForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      profileImage: "",
      departments: [],
      adminFeatures: [],
      role: "Rider A",
      workLocation: "Lagos",
      positionStatus: "Entry",
      jobType: "Permanent",
      dateOfEntry: new Date().toISOString().split("T")[0],
    });
  };

  const updateSubadminStatus = (profileId, nextStatus) => {
    setSubadminProfiles((prev) => prev.map((profile) => (profile.id === profileId ? { ...profile, status: nextStatus } : profile)));
    setAccounts((prev) => {
      const updated = { ...prev };
      Object.entries(updated).forEach(([username, account]) => {
        if (account.profileId === profileId) {
          updated[username] = { ...account, status: nextStatus };
        }
      });
      return updated;
    });
  };

  const startEditingProfile = (profile) => {
    setEditingProfileId(profile.id);
    setSubadminForm({
      fullName: profile.fullName,
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      profileImage: profile.profileImage || "",
      departments: profile.departments,
      adminFeatures: profile.adminFeatures || [],
      role: profile.role,
      workLocation: profile.workLocation,
      positionStatus: profile.positionStatus,
      jobType: profile.jobType,
      dateOfEntry: profile.dateOfEntry,
    });
    setProfileNotice(`Editing ${profile.fullName}`);
  };

  const saveProfileChanges = () => {
    if (!editingProfileId) return;
    if (!subadminForm.fullName.trim() || subadminForm.departments.length === 0) {
      pushToast({ type: "error", message: "Please provide a full name and select at least one department." });
      return;
    }

    setSubadminProfiles((prev) =>
      prev.map((profile) =>
        profile.id === editingProfileId
          ? { ...profile, ...subadminForm, departments: subadminForm.departments }
          : profile
      )
    );
    setProfileNotice(`Profile updated successfully for ${subadminForm.fullName.trim()}`);
    setEditingProfileId(null);
    setSubadminForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      profileImage: "",
      departments: [],
      adminFeatures: [],
      role: "Rider A",
      workLocation: "Lagos",
      positionStatus: "Entry",
      jobType: "Permanent",
      dateOfEntry: new Date().toISOString().split("T")[0],
    });
  };

  const registerClientPortal = () => {
    if (!clientRegistration.companyName.trim() || !clientRegistration.contactName.trim() || !clientRegistration.email.trim() || !clientRegistration.phone.trim()) {
      pushToast({ type: "error", message: "Please complete all corporate registration fields." });
      return;
    }

    const baseUsername = clientRegistration.companyName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "") || "corporate";

    const usedUsernames = new Set(Object.keys(accounts));
    let username = baseUsername;
    let suffix = 1;
    while (usedUsernames.has(username)) {
      username = `${baseUsername}${suffix}`;
      suffix += 1;
    }

    const generatedPassword = `${Math.random().toString(36).slice(-6)}${Math.random().toString(36).slice(-2).toUpperCase()}`;
    setAccounts((prev) => ({
      ...prev,
      [username]: { role: "client", password: generatedPassword, status: "Active" },
    }));
    setClientNotice(`Corporate profile created. Username: ${username} | Password: ${generatedPassword}`);
    setClientRegistration({ companyName: "", contactName: "", email: "", phone: "" });
    setShowClientRegistration(false);
    setLogin({ user: username, pass: generatedPassword });
    setRole("client");
    navigateTo("client", { require: ["client"] });
  };

  const departmentOptions = ["Admin", "HR/CRM", "ICT", "Surveillance", "Operations/Dispatch"];
  const featureOptions = [
    "Shipment assignment",
    "Shipment forwarding",
    "Task management",
    "Reporting dashboard",
    "Client booking oversight",
    "Profile management",
    "Tracking and status",
    "Financial approvals",
  ];
  const adminTabs = getAdminTabs(role);
  const flightScheduleSummary = useMemo(() => {
    const total = flightSchedules.length;
    const local = flightSchedules.filter((flight) => flight.region === "Local").length;
    const international = flightSchedules.filter((flight) => flight.region === "International").length;
    const disrupted = flightSchedules.filter((flight) => ["Delayed", "Cancelled", "Weather Watch"].includes(flight.status)).length;
    return { total, local, international, disrupted };
  }, [flightSchedules]);
  const filteredFlights = useMemo(() => {
    const searchTerm = flightSearch.trim().toLowerCase();
    return flightSchedules.filter((flight) => {
      const matchesFilter = flightFilter === "all" || flight.region.toLowerCase() === flightFilter;
      const matchesSearch =
        !searchTerm ||
        flight.airline.toLowerCase().includes(searchTerm) ||
        flight.route.toLowerCase().includes(searchTerm) ||
        flight.id.toLowerCase().includes(searchTerm) ||
        flight.status.toLowerCase().includes(searchTerm);
      return matchesFilter && matchesSearch;
    });
  }, [flightSchedules, flightFilter, flightSearch]);
  const futureFlightSchedules = useMemo(
    () => getFutureFlightSchedulePreview(futureFlightWindow),
    [futureFlightWindow]
  );
  const futureFlightCalendar = useMemo(() => {
    const base = new Date();
    const lastSevenDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(base);
      date.setDate(base.getDate() + index);
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        flights: [],
      };
    });

    futureFlightSchedules.forEach((flight) => {
      const day = lastSevenDays.find((entry) => entry.key === flight.takeoffDate);
      if (day) {
        day.flights.push(flight);
      }
    });

    return lastSevenDays;
  }, [futureFlightSchedules]);
  const flightRecommendation = useMemo(() => {
    const urgent = flightSchedules.find((flight) => flight.status === "Cancelled" || flight.status === "Delayed");
    if (!urgent) return "All scheduled flights remain stable. Continue with standard cargo handoff and pre-arrival checks.";
    return `${urgent.airline} on ${urgent.route} requires immediate dispatch coordination due to ${urgent.status.toLowerCase()} conditions.`;
  }, [flightSchedules]);
  const currentSubadminProfile = role === "subadmin"
    ? subadminProfiles.find((profile) => profile.username === activeUser) || null
    : null;
  const activeSubadminProfiles = subadminProfiles.filter((profile) => profile.status === "Active");
  const visibleOrders = role === "subadmin"
    ? orders.filter((o) => o.assignedTo === activeUser || o.pendingForwardTo === activeUser)
    : orders;
  const currentOverviewOrders = role === "subadmin" ? visibleOrders : orders;
  const filteredOrders = useMemo(() => {
    const term = orderSearch.trim().toLowerCase();
    if (!term) return visibleOrders;
    return visibleOrders.filter((order) =>
      order.id.toLowerCase().includes(term) ||
      order.route.toLowerCase().includes(term) ||
      order.status.toLowerCase().includes(term) ||
      (order.assignedTo || "").toLowerCase().includes(term)
    );
  }, [visibleOrders, orderSearch]);
  const filteredClientOrders = useMemo(() => {
    const term = clientOrderSearch.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      order.id.toLowerCase().includes(term) ||
      order.route.toLowerCase().includes(term) ||
      order.status.toLowerCase().includes(term) ||
      (order.assignedTo || "").toLowerCase().includes(term)
    );
  }, [orders, clientOrderSearch]);
  const getSubadminLabel = (username) => {
    if (!username || username === "Unassigned") return "Unassigned";
    const profile = subadminProfiles.find((item) => item.username === username);
    return profile ? `${profile.fullName} (${profile.username})` : username;
  };
  const roleOptions = ["Rider A", "Rider B", "Operations Manager A", "Operations Manager B", "Operations Manager C", "Operations Manager D", "ICT", "Workforce1", "Workforce2", "Workforce3"];
  const locationOptions = ["Lagos", "Abuja", "Port Harcourt"];

  return (
    <div className="min-h-screen bg-[#f5f8ff] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-200">
              <FaPlane className="text-lg" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">SkyBridge</p>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-800">Logistics</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            <button onClick={() => navigateTo("home")} className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
              <FaPlane /> Home
            </button>
            <button onClick={() => navigateTo("track")} className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
              <FaSearch /> Track
            </button>
            <button onClick={() => navigateTo("book")} className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
              <FaPaperPlane /> Book
            </button>
            <button
              onClick={() => {
                if (role === "admin" || role === "subadmin") {
                  pushToast({ type: "info", message: "Please logout of admin before using the corporate client portal." });
                } else {
                  navigateTo("client");
                }
              }}
              className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
            >
              <FaUsers /> Client Portal
            </button>
            <button
              onClick={() => {
                if (role === "admin" || role === "subadmin") {
                  navigateTo("admin");
                } else {
                  navigateTo("login");
                }
              }}
              className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
            >
              <FaUserShield /> {role === "guest" ? "Admin login" : "Admin dashboard"}
            </button>
            {role !== "guest" && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200"
              >
                <FaSignOutAlt /> Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
        {page === "home" && (
          <>
            <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#f3f7ff] p-6 shadow-[0_30px_80px_rgba(59,130,246,0.08)] sm:p-8 lg:p-10">
              <div className="absolute -right-12 -top-12 h-60 w-60 rounded-full bg-blue-200/40 blur-3xl" />
              <div className="absolute left-0 top-1/3 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
              <div className="relative grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="space-y-8">
                  <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200">
                    <FaTruckMoving className="mr-2" />
                    Operational clarity for modern cargo teams
                  </div>
                  <div className="space-y-6">
                    <h1 className="max-w-xl text-4xl font-bold tracking-[-0.06em] text-slate-900 sm:text-5xl lg:text-6xl">
                      Move freight with the speed of a startup and the trust of a platform.
                    </h1>
                    <p className="max-w-xl text-lg leading-8 text-slate-600">
                      Skybridge Nexus Logistics combines premium airport coordination, real-time tracking, and smarter delivery operations for businesses that need dependable movement at scale.
                    </p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        onClick={() => navigateTo("track")}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800"
                      >
                        <FaSearch /> Track a shipment
                      </button>
                      <button
                        onClick={() => navigateTo("book")}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:text-blue-700"
                      >
                        <FaPaperPlane /> Book delivery
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Network</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">PHC · LOS · ABJ</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Partners</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">Air Peace · FAAN</p>
                    </div>
                    <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Speed</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">Same / next day</p>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-blue-500/15 blur-2xl" />
                  <div className="absolute -top-6 right-4 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
                  <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 shadow-[0_35px_90px_rgba(15,23,42,0.18)]">
                    <img
                      src={heroImage}
                      alt="Skybridge Nexus branded cargo imagery"
                      className="h-[430px] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent"></div>
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md text-white shadow-xl">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">Skybridge Nexus Logistics LTD</p>
                      <p className="mt-2 max-w-xs text-lg font-semibold">
                        Live cargo tracking, delivery automation, and premium route operations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-14 rounded-[2rem] bg-gradient-to-r from-[#0f172a] via-[#172554] to-[#1d4ed8] p-8 text-white shadow-[0_30px_80px_rgba(37,99,235,0.22)] ring-1 ring-blue-400/20">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-100">Built for growth</p>
                  <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">A logistics stack that feels as polished as your product.</h2>
                  <p className="mt-4 max-w-xl text-base text-blue-50">
                    From airport dispatch to final-mile visibility, we help modern brands move goods with less friction and more confidence.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                  <button onClick={() => navigateTo("book")} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-lg transition hover:bg-slate-100">
                    <FaPaperPlane className="mr-2" /> Book a shipment
                  </button>
                  <button onClick={() => navigateTo("track")} className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
                    <FaSearch className="mr-2" /> Track delivery
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-14 grid gap-6 lg:grid-cols-4">
              {services.map((item, index) => {
                const icons = [FaPlane, FaRoute, FaSearch, FaBoxOpen];
                const Icon = icons[index];
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-blue-100 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(37,99,235,0.08)] hover:ring-1 hover:ring-blue-200">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100">
                      <Icon />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
            </section>

            <section className="mt-14 rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-900 to-sky-900 p-8 text-white shadow-2xl ring-1 ring-blue-200/20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Our success numbers</p>
                  <h2 className="mt-3 text-3xl font-semibold">Deliveries, cities, and performance that build trust.</h2>
                </div>
                <div className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-blue-100 shadow-inner shadow-white/5">
                  24/7 operational support
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {deliveryStats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:bg-white/10">
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                    <p className="mt-2 text-sm text-blue-100">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Cities served</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Coverage across Nigeria’s key freight corridors.</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {cityCoverage.map((city) => (
                    <div key={city} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                      <span className="font-medium text-slate-800">{city}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Active</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-gradient-to-br from-emerald-50 to-blue-50 p-8 shadow-xl ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">Why clients stay</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Reliable logistics with real visibility.</h2>
                <ul className="mt-6 space-y-4 text-slate-700">
                  <li className="flex items-start gap-3"><span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">✓</span><span>Dedicated airport and forwarding coordination for urgent cargo movement.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">✓</span><span>Transparent delivery tracking and live updates from pickup to final handoff.</span></li>
                  <li className="flex items-start gap-3"><span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">✓</span><span>Strong support for retail, healthcare, manufacturing, and corporate cargo clients.</span></li>
                </ul>
              </div>
            </section>

            <section className="mt-14 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Why choose us</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Built around dependable freight execution.</h2>
                </div>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {whyChooseUs.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-sm">
                      <Icon />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Testimonials</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">What our customers say.</h2>
                </div>
                <div className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                  Trusted by businesses and growing brands
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {testimonials.map((item) => (
                  <div key={item.name} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
                    <div className="mb-4 flex gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={`${item.name}-${index}`}>★</span>
                      ))}
                    </div>
                    <p className="text-base leading-8 text-slate-700">“{item.quote}”</p>
                    <div className="mt-6 border-t border-slate-200 pt-4">
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">{item.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-14 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] bg-blue-800 p-8 text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Our promise</p>
                <h2 className="mt-4 text-3xl font-semibold">Transparent pricing and Nigerian city-to-city coverage.</h2>
                <p className="mt-4 leading-8 text-slate-100">
                  Get fast, reliable delivery using commercial flights with real tracking, live status updates, and dedicated support throughout every shipment.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Route</p>
                    <p className="mt-2 text-lg font-semibold">Port Harcourt → Lagos</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/80 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Delivery</p>
                    <p className="mt-2 text-lg font-semibold">Same-day & next-day</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[2rem] bg-white p-8 shadow-2xl ring-1 ring-slate-200">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live service</p>
                <h2 className="mt-4 text-3xl font-semibold text-slate-900">Track your shipment instantly.</h2>
                <p className="mt-4 text-slate-600">
                  Enter your airway bill or tracking reference and view the latest location update as your package moves through the logistics network.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => navigateTo("track")}
                    className="inline-flex justify-center rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                  >
                    Track now
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-14 rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <div className="grid gap-6 lg:grid-cols-3">
                {faq.map((item) => (
                  <div key={item.question} className="rounded-[1.5rem] bg-slate-50 p-6">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">FAQ</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{item.question}</h3>
                    <p className="mt-3 text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <footer className="mt-14 rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl ring-1 ring-white/10">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.9fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">SkyBridge Nexus</p>
                  <h3 className="mt-4 text-2xl font-semibold">Logistics with speed, structure, and trust.</h3>
                  <p className="mt-4 max-w-md text-slate-300">
                    We connect businesses across Nigeria with dependable air, road, and cargo logistics support backed by real-time shipment visibility.
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Company</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    <li className="transition hover:text-white">About us</li>
                    <li className="transition hover:text-white">Our services</li>
                    <li className="transition hover:text-white">Tracking</li>
                    <li className="transition hover:text-white">Client portal</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Contact</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    <li className="flex items-center gap-2"><FaPhoneAlt className="text-blue-400" /> 09165000149</li>
                    <li className="flex items-center gap-2"><FaEnvelope className="text-blue-400" /> contact@skybridgenexus.com</li>
                    <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-blue-400" /> Port Harcourt, Lagos, Abuja</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Follow us</p>
                  <div className="mt-4 flex items-center gap-3">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-600"><FaFacebookF /></a>
                    <a href="https://www.instagram.com/skybridge_nexus/" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-pink-600"><FaInstagram /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition duration-200 hover:-translate-y-0.5 hover:bg-blue-500"><FaLinkedinIn /></a>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-white/10 pt-6 text-sm text-slate-400">
                © 2026 SkyBridge Nexus Logistics LTD. All rights reserved.
              </div>
            </footer>
          </>
        )}
        <Toasts toasts={toasts} />
        
        

        {page === "track" && (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <TrackSection
              trackingInput={trackingInput}
              setTrackingInput={setTrackingInput}
              trackPackage={trackPackage}
              trackingResult={trackingResult}
              trackingDetails={trackingDetails}
            />
            <AlertsPanel notifications={notifications} fraudAlerts={fraudAlerts} />
          </div>
        )}

        {page === "book" && (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:max-w-3xl sm:mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Book a delivery</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Ready to ship with Skybridge Nexus?</h2>
              </div>
              <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                Port Harcourt · Lagos · Abuja
              </div>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-blue-700">
                  <FaCheckCircle />
                  <h3 className="font-semibold text-slate-900">Why choose us</h3>
                </div>
                <ul className="mt-4 space-y-3 text-slate-600">
                  <li>• Same-day or next-day air delivery</li>
                  <li>• Airline and airport-friendly process</li>
                  <li>• Transparent tracking and pricing</li>
                </ul>
              </div>
              <div className="rounded-3xl bg-slate-50 p-6">
                <div className="flex items-center gap-2 text-blue-700">
                  <FaClock />
                  <h3 className="font-semibold text-slate-900">Service details</h3>
                </div>
                <p className="mt-4 text-slate-600">
                  Book cargo movement using our airport-integrated network and get fast handling, customs support, and shipment visibility throughout the journey.
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-blue-50 p-6 text-slate-900 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Contact</p>
                <p className="mt-3 text-xl font-semibold">09165000149</p>
                <p className="mt-2 text-slate-600">contact@skybridgenexus.com</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Office</p>
                <p className="mt-3 text-xl font-semibold">Port Harcourt, Lagos, Abuja</p>
                <p className="mt-2 text-slate-600">Fast collection and airport delivery support.</p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-semibold text-slate-900">Book Your Shipment</h3>
              <p className="mt-2 text-slate-600">Fill in the details to schedule your delivery.</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  id="customer-name"
                  label="Customer Name"
                  value={booking.name}
                  onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  placeholder="e.g. Ada Okafor"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <label className="block text-sm">
                  <div className="font-medium">Pickup Location</div>
                  <select
                    aria-label="Pickup Location"
                    className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={booking.pickup}
                    onChange={(e) => setBooking({ ...booking, pickup: e.target.value })}
                  >
                    <option value="">Select Pickup Location</option>
                    <option value="PHC">Port Harcourt</option>
                    <option value="LOS">Lagos</option>
                    <option value="ABJ">Abuja</option>
                  </select>
                </label>
                <select
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={booking.delivery}
                  onChange={(e) => setBooking({ ...booking, delivery: e.target.value })}
                >
                  <option value="">Select Delivery Location</option>
                  <option value="PHC">Port Harcourt</option>
                  <option value="LOS">Lagos</option>
                  <option value="ABJ">Abuja</option>
                </select>
                <Field
                  id="weight"
                  label="Package Weight (kg)"
                  value={booking.weight}
                  onChange={(e) => setBooking({ ...booking, weight: e.target.value })}
                  placeholder="e.g. 2.5"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <Field
                  id="contact"
                  label="Contact Number"
                  value={booking.contact}
                  onChange={(e) => setBooking({ ...booking, contact: e.target.value })}
                  placeholder="e.g. 08012345678"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                onClick={handleBook}
                className="mt-6 w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
              >
                Submit Booking
              </button>
            </div>
            {recentBookingId && !paymentStage && (
              <div className="mt-6 rounded-[1.75rem] bg-slate-50 p-6 ring-1 ring-slate-200 text-slate-900">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Booking confirmed</p>
                <p className="mt-3 text-lg font-semibold">Your tracking ID is {recentBookingId}</p>
                <p className="mt-2 text-slate-600">Use this ID on the Track page for status updates.</p>
              </div>
            )}

            {paymentStage && (
              <div className="mt-6 rounded-[1.75rem] border border-blue-200 bg-blue-50 p-6 text-slate-900 shadow-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Payment required</p>
                <h3 className="mt-3 text-xl font-semibold">Complete your booking payment</h3>
                <p className="mt-2 text-slate-600">Your shipment has been reserved. Please confirm payment to activate the booking and notify our team.</p>
                <div className="mt-6 space-y-4">
                  <select
                    className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card Payment">Card Payment</option>
                    <option value="POS Payment">POS Payment</option>
                  </select>
                  <button
                    onClick={handlePaymentDone}
                    className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                  >
                    I have paid · Contact CRM
                  </button>
                  <p className="text-sm text-slate-600">A WhatsApp message will be sent to our CRM line: 09165000149.</p>
                </div>
              </div>
            )}
            <div className="mt-6 text-center">
              <p className="text-slate-600 mb-4">Or use our detailed booking form:</p>
              <button
                onClick={() => window.open('https://forms.gle/3RJp7A6wmToqwHJi6', '_blank')}
                className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-400 hover:text-blue-700"
              >
                Open Google Booking Form
              </button>
            </div>
          </div>
        )}

        {page === "login" && role !== "admin" && role !== "subadmin" && (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:max-w-md sm:mx-auto">
            <div className="flex items-center gap-2 text-blue-700">
              <FaUserShield />
              <h2 className="text-2xl font-semibold text-slate-900">Admin / Sub-admin Login</h2>
            </div>
            <p className="mt-2 text-slate-600">Sign in to manage shipments, assign tasks, and route forwarding.</p>
            <LoginForm onSubmit={handleLogin} submitText="Login" />
          </div>
        )}

        {page === "client" && role === "guest" && (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:max-w-md sm:mx-auto">
            <div className="flex items-center gap-2 text-blue-700">
              <FaUsers />
              <h2 className="text-2xl font-semibold text-slate-900">Corporate Client Portal</h2>
            </div>
            <p className="mt-2 text-slate-600">Login to book shipments and track your corporate cargo.</p>
            {!showClientRegistration ? (
              <div className="mt-6 space-y-4">
                <LoginForm onSubmit={handleClientPortalLogin} submitText="Enter Portal" />
                <button
                  onClick={() => setShowClientRegistration(true)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-400 hover:text-blue-700"
                >
                  Create Corporate Profile
                </button>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <input
                  placeholder="Company name"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={clientRegistration.companyName}
                  onChange={(e) => setClientRegistration({ ...clientRegistration, companyName: e.target.value })}
                />
                <input
                  placeholder="Contact person"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={clientRegistration.contactName}
                  onChange={(e) => setClientRegistration({ ...clientRegistration, contactName: e.target.value })}
                />
                <input
                  placeholder="Email"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={clientRegistration.email}
                  onChange={(e) => setClientRegistration({ ...clientRegistration, email: e.target.value })}
                />
                <input
                  placeholder="Phone number"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={clientRegistration.phone}
                  onChange={(e) => setClientRegistration({ ...clientRegistration, phone: e.target.value })}
                />
                <button
                  onClick={registerClientPortal}
                  className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                >
                  Create Profile & Login
                </button>
                <button
                  onClick={() => setShowClientRegistration(false)}
                  className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-400 hover:text-blue-700"
                >
                  Back to login
                </button>
              </div>
            )}
            {clientNotice && (
              <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
                {clientNotice}
              </div>
            )}
          </div>
        )}

        {page === "client" && role === "client" && (
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-blue-700">
                <FaUsers />
                <h2 className="text-3xl font-semibold text-slate-900">Corporate Client Portal</h2>
              </div>
              <p className="mt-2 text-slate-600">Book shipments, track corporate cargo, and view recent activity.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Book a corporate shipment</h3>
                <p className="mt-2 text-slate-600">Schedule cargo movement with corporate support and priority routing.</p>
                <div className="mt-6 space-y-4">
                  <input
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Customer Name"
                    value={booking.name}
                    onChange={(e) => setBooking({ ...booking, name: e.target.value })}
                  />
                  <select
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={booking.pickup}
                    onChange={(e) => setBooking({ ...booking, pickup: e.target.value })}
                  >
                    <option value="">Select Pickup Location</option>
                    <option value="PHC">Port Harcourt</option>
                    <option value="LOS">Lagos</option>
                    <option value="ABJ">Abuja</option>
                  </select>
                  <select
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={booking.delivery}
                    onChange={(e) => setBooking({ ...booking, delivery: e.target.value })}
                  >
                    <option value="">Select Delivery Location</option>
                    <option value="PHC">Port Harcourt</option>
                    <option value="LOS">Lagos</option>
                    <option value="ABJ">Abuja</option>
                  </select>
                  <input
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Package Weight (kg)"
                    value={booking.weight}
                    onChange={(e) => setBooking({ ...booking, weight: e.target.value })}
                  />
                  <input
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Contact Number"
                    value={booking.contact}
                    onChange={(e) => setBooking({ ...booking, contact: e.target.value })}
                  />
                  <button
                    onClick={handleBook}
                    className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                  >
                    Submit Corporate Booking
                  </button>
                </div>
              </div>
              <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">Track a shipment</h3>
                <p className="mt-2 text-slate-600">Use your corporate tracking reference to view delivery progress.</p>
                <div className="mt-6 space-y-4">
                  <input
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Enter Tracking Number"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    aria-label="Tracking number"
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
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-50 p-6 shadow-xl ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent corporate activity</p>
                  <p className="mt-2 text-slate-600">Search and review corporate bookings in real time.</p>
                </div>
                <input
                  type="search"
                  value={clientOrderSearch}
                  onChange={(e) => setClientOrderSearch(e.target.value)}
                  placeholder="Search bookings..."
                  className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-80"
                  aria-label="Search corporate bookings"
                />
              </div>
              <div className="mt-4 grid gap-3">
                {filteredClientOrders.length === 0 ? (
                  <div className="rounded-3xl bg-white p-4 text-slate-700 shadow-sm ring-1 ring-slate-200">
                    No corporate bookings matched your search.
                  </div>
                ) : (
                  filteredClientOrders.slice(-5).map((order) => (
                    <div key={order.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="font-semibold text-slate-900">{order.id}</p>
                      <p className="text-sm text-slate-600">{order.route} · {order.status}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {page === "admin" && (role === "admin" || role === "subadmin") && (
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {role === "subadmin" && currentSubadminProfile?.profileImage ? (
                    <img
                      src={currentSubadminProfile.profileImage}
                      alt={currentSubadminProfile.fullName}
                      className="h-16 w-16 rounded-full border border-slate-200 object-cover shadow-sm"
                    />
                  ) : role === "subadmin" ? (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 shadow-sm">
                      <FaUserShield className="text-xl" />
                    </div>
                  ) : null}
                  <div>
                    <h2 className="text-3xl font-semibold text-slate-900">{role === "admin" ? "Admin Dashboard" : `${currentSubadminProfile?.fullName || "Sub-admin"} Dashboard`}</h2>
                    <p className="mt-2 text-slate-600">Manage workflow, assign tasks, and forward shipments.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {adminTabs.map((tab) => {
                    const iconMap = {
                      overview: FaClipboardList,
                      "flight-schedules": FaPlane,
                      "client-details": FaUsers,
                      profiles: FaUsers,
                      workflow: FaExchangeAlt,
                      cooperate: FaChartBar,
                      forwarding: FaRoute,
                    };
                    const Icon = iconMap[tab.key] || FaClipboardList;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setAdminTab(tab.key)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${adminTab === tab.key ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                      >
                        <Icon /> {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {adminTab === "flight-schedules" && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-4">
                  <Card title="Flights tracked" value={flightScheduleSummary.total} icon={FaPlane} accent="from-blue-500 to-cyan-500" />
                  <Card title="Local ops" value={flightScheduleSummary.local} icon={FaTruckMoving} accent="from-emerald-500 to-green-400" />
                  <Card title="International" value={flightScheduleSummary.international} icon={FaRoute} accent="from-violet-500 to-purple-500" />
                  <Card title="Disruptions" value={flightScheduleSummary.disrupted} icon={FaBell} accent="from-amber-500 to-orange-400" />
                </div>

                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">Live flight operations</h3>
                      <p className="mt-2 text-slate-600">Monitor airline activity, weather risk, cancellations, and route disruptions that affect cargo movement.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all", label: "All" },
                        { key: "local", label: "Local" },
                        { key: "international", label: "International" },
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => setFlightFilter(filter.key)}
                          className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] ${flightFilter === filter.key ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    <input
                      value={flightSearch}
                      onChange={(e) => setFlightSearch(e.target.value)}
                      placeholder="Search airline, flight, or route"
                      className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 md:max-w-xs"
                    />
                  </div>

                  <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-700">Dispatch recommendation</p>
                    <p className="mt-2 font-medium">{flightRecommendation}</p>
                  </div>

                  <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-slate-900">Future takeoff calendar</h4>
                        <p className="text-sm text-slate-600">Upcoming departures across the next days and weeks.</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[7, 14, 30].map((days) => (
                          <button
                            key={days}
                            onClick={() => setFutureFlightWindow(days)}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] ${futureFlightWindow === days ? "bg-blue-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
                          >
                            {days}d
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <div className="grid min-w-[760px] grid-cols-7 gap-3">
                        {futureFlightCalendar.map((day) => (
                          <div key={day.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="rounded-t-2xl bg-slate-100 px-3 py-2 text-center">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{day.label}</p>
                              <p className="mt-1 text-sm font-semibold text-slate-900">{day.dateLabel}</p>
                            </div>
                            <div className="space-y-2 p-2">
                              {day.flights.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-400">
                                  No flights
                                </div>
                              ) : (
                                day.flights.map((flight) => (
                                  <div key={`${flight.id}-${flight.takeoffDate}`} className="rounded-xl border border-blue-100 bg-blue-50 p-2 text-left">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-blue-700">{flight.airline}</p>
                                    <p className="mt-1 text-xs font-semibold text-slate-900">{flight.id}</p>
                                    <p className="mt-1 text-[11px] text-slate-600">{flight.route}</p>
                                    <div className="mt-2 rounded-lg bg-white px-2 py-1 text-[10px] font-medium text-blue-900">
                                      {flight.takeoffTime}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {filteredFlights.map((flight) => (
                      <div key={flight.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{flight.airline}</p>
                            <p className="mt-2 text-lg font-semibold text-slate-900">{flight.id}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${flight.status === "Cancelled" ? "bg-rose-100 text-rose-700" : flight.status === "Delayed" || flight.status === "Weather Watch" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {flight.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Route</p>
                            <p className="mt-2 font-semibold">{flight.route}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Region</p>
                            <p className="mt-2 font-semibold">{flight.region}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Departure</p>
                            <p className="mt-2 font-semibold">{flight.departure}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Arrival</p>
                            <p className="mt-2 font-semibold">{flight.arrival}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">ETA</p>
                            <p className="mt-2 font-semibold">{flight.eta}</p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Weather</p>
                            <p className="mt-2 font-semibold">{flight.weather}</p>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl bg-white p-3 text-sm text-slate-700">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Operational note</p>
                          <p className="mt-2">{flight.notes}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-600">
                          <span>Gate: {flight.gate}</span>
                          <span>Risk: {flight.risk}</span>
                        </div>
                      </div>
                    ))}
                    {filteredFlights.length === 0 && (
                      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 xl:col-span-2">
                        No matching flight schedules found for the current filters.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "client-details" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Client details</h3>
                  <p className="mt-2 text-slate-600">Review booked clients and recent shipment activity at a glance.</p>
                  <div className="mt-6 space-y-4">
                    {orders.length === 0 ? (
                      <div className="rounded-3xl bg-slate-50 p-4 text-slate-600">No client bookings are available yet.</div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{order.id}</p>
                              <p className="text-sm text-slate-600">{order.route}</p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{order.status}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">Assigned to: {order.assignedTo || "Unassigned"}</p>
                          <p className="text-sm text-slate-600">Contact: {order.contact || "Not provided"}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Recent client activity</h3>
                  <div className="mt-6 space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="rounded-3xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{order.id}</p>
                        <p className="mt-1 text-sm text-slate-600">{order.route} · {order.status}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "overview" && (
              <>
                <div className="grid gap-6 lg:grid-cols-4">
                  <Card title="Total" value={currentOverviewOrders.length} icon={FaBoxOpen} accent="from-blue-500 to-cyan-500" />
                  <Card title="Delivered" value={currentOverviewOrders.filter((o) => o.status === "Delivered").length} icon={FaCheckCircle} accent="from-emerald-500 to-green-400" />
                  <Card title="In Transit" value={currentOverviewOrders.filter((o) => o.status === "In Flight").length} icon={FaPlane} accent="from-sky-500 to-blue-500" />
                  <Card title="Pending" value={currentOverviewOrders.filter((o) => o.status === "Pending" || o.pendingApproval).length} icon={FaClock} accent="from-amber-500 to-orange-400" />
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <Card title="Revenue" value={`₦${analyticsMetrics.totalRevenue.toLocaleString()}`} icon={FaChartBar} accent="from-green-500 to-emerald-500" />
                  <Card title="Pending payments" value={analyticsMetrics.pendingPayments} icon={FaBell} accent="from-orange-500 to-yellow-500" />
                  <Card title="Fraud alerts" value={analyticsMetrics.fraudCount} icon={FaShieldAlt} accent="from-rose-500 to-pink-500" />
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{warehouse.name}</h3>
                          <p className="mt-1 text-sm text-slate-600">{warehouse.location}</p>
                        </div>
                        <FaWarehouse className="text-2xl text-blue-700" />
                      </div>
                      <div className="mt-4 space-y-2 text-slate-600">
                        <p>Occupied: {warehouse.occupied}/{warehouse.capacity}</p>
                        <p>Status: {warehouse.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {role === "subadmin" && (
                  <><div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">Quick operations</h3>
                        <p className="mt-1 text-sm text-slate-600">Move quickly between tracking, booking, and shipment handoff.</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={() => navigateTo("track")} className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Track shipment</button>
                      <button onClick={() => navigateTo("book")} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:border-blue-400 hover:text-blue-700">Book shipment</button>
                      <button onClick={() => setAdminTab("forwarding")} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">Open forwarding</button>
                    </div>
                  </div><div className="ml-4 flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="text-xs text-slate-500">Auto-assign</span>
                        <button
                          onClick={() => setAutoAssign((s) => !s)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAssign ? "bg-blue-600" : "bg-slate-200"}`}
                          aria-pressed={autoAssign}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoAssign ? "translate-x-5" : "translate-x-1"}`} />
                        </button>
                      </label>
                    </div></>
                )}
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Shipment bookings</h3>
                        <p className="text-sm text-slate-600">Filter booking records by tracking ID, route, status, or assignee.</p>
                      </div>
                      <input
                        type="search"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search bookings..."
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 sm:w-80"
                        aria-label="Search bookings"
                      />
                    </div>
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-slate-600">Tracking</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-600">Route</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                          {role === "admin" && <th className="px-4 py-3 text-left font-semibold text-slate-600">Assign</th>}
                          <th className="px-4 py-3 text-left font-semibold text-slate-600">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={role === "admin" ? 5 : 4} className="px-4 py-8 text-center text-slate-500">
                              No bookings matched your search.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o, i) => (
                            <tr key={i}>
                              <td className="px-4 py-4 text-slate-900">{o.id}</td>
                              <td className="px-4 py-4 text-slate-900">{o.route}</td>
                              <td className="px-4 py-4 text-slate-900">{o.pendingApproval ? "Pending Approval" : o.status}</td>
                              {role === "admin" ? (
                                <td className="px-4 py-4 text-slate-900">
                                  <select
                                    value={o.assignedTo || "Unassigned"}
                                    onChange={(e) => assignOrderToSubadmin(o.id, e.target.value)}
                                    className="w-full rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                                  >
                                    <option value="Unassigned">Unassigned</option>
                                    {activeSubadminProfiles.map((profile) => (
                                      <option key={profile.id} value={profile.username}>{profile.fullName}</option>
                                    ))}
                                  </select>
                                </td>
                              ) : null}
                              <td className="px-4 py-4 space-x-2">
                                <button
                                  onClick={() => updateStatus(o.id, "Picked Up")}
                                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                                >
                                  Pickup
                                </button>
                                <button
                                  onClick={() => updateStatus(o.id, "In Flight")}
                                  className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200"
                                >
                                  Flight
                                </button>
                                <button
                                  onClick={() => updateStatus(o.id, "Delivered")}
                                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                                >
                                  Done
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="space-y-6">
                    <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-sky-600 p-6 text-white shadow-xl">
                      <div className="flex items-center gap-2">
                        <FaClipboardList />
                        <h3 className="text-xl font-semibold">Operations snapshot</h3>
                      </div>
                      <div className="mt-6 space-y-3">
                        <div className="rounded-3xl bg-white/15 p-4">
                          <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Priority queue</p>
                          <p className="mt-2 text-lg font-semibold">{currentOverviewOrders.filter((o) => o.status === "Pending" || o.pendingApproval).length} shipments awaiting action</p>
                        </div>
                        <div className="rounded-3xl bg-white/15 p-4">
                          <p className="text-sm uppercase tracking-[0.2em] text-blue-100">Next handoff</p>
                          <p className="mt-2 text-lg font-semibold">Lagos and Abuja forwarding windows are open</p>
                        </div>
                      </div>
                    </div>

                    {role === "admin" && (
                      <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">View all users</h3>
                            <p className="mt-1 text-sm text-slate-600">Quick view of registered accounts and sub-admin profiles.</p>
                          </div>
                        </div>
                        <div className="mt-5 space-y-4">
                          <input
                            type="search"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            placeholder="Search users by username, role, name, or department..."
                            className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            aria-label="Search users"
                          />
                          {filteredUsers.length === 0 && filteredProfiles.length === 0 ? (
                            <div className="rounded-3xl bg-slate-100 p-4 text-slate-700">No users matched your search.</div>
                          ) : null}
                          {filteredUsers.map(([username, account]) => (
                            <div key={username} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{username}</p>
                                  <p className="text-sm text-slate-600">{account.role === "admin" ? "Administrator" : account.role === "subadmin" ? (subadminProfiles.find(p => p.username === username)?.fullName || "Sub-admin") : account.role}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${account.status === "Active" ? "bg-emerald-100 text-emerald-700" : account.status === "Suspended" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                  {account.status}
                                </span>
                              </div>
                            </div>
                          ))}
                          {filteredProfiles.map((profile) => (
                            <div key={profile.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-900">{profile.fullName}</p>
                                  <p className="text-sm text-slate-600">{profile.username} · {profile.departments.join(", ")}</p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${profile.status === "Active" ? "bg-emerald-100 text-emerald-700" : profile.status === "Suspended" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                  {profile.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {adminTab === "profiles" && (
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaUserShield />
                    <h3 className="text-xl font-semibold text-slate-900">Create sub-admin profile</h3>
                  </div>
                  <p className="mt-2 text-slate-600">Register a new sub-admin, define their role details, and automatically issue login credentials.</p>
                  <div className="mt-6 space-y-4">
                    <input
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Full name"
                      value={subadminForm.fullName}
                      onChange={(e) => setSubadminForm({ ...subadminForm, fullName: e.target.value })}
                    />
                    <input
                      type="email"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Email address"
                      value={subadminForm.email}
                      onChange={(e) => setSubadminForm({ ...subadminForm, email: e.target.value })}
                    />
                    <input
                      type="tel"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="Phone number"
                      value={subadminForm.phoneNumber}
                      onChange={(e) => setSubadminForm({ ...subadminForm, phoneNumber: e.target.value })}
                    />
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                      <label className="block text-sm font-semibold text-slate-700">Profile picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSubadminPhotoChange}
                        className="mt-2 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
                      />
                      {subadminForm.profileImage && (
                        <img
                          src={subadminForm.profileImage}
                          alt="Selected profile preview"
                          className="mt-4 h-20 w-20 rounded-full border border-slate-200 object-cover shadow-sm"
                        />
                      )}
                    </div>
                    <div>
                      <p className="mb-3 text-sm font-semibold text-slate-700">Departments</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {departmentOptions.map((dept) => (
                          <label key={dept} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={subadminForm.departments.includes(dept)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSubadminForm({ ...subadminForm, departments: [...subadminForm.departments, dept] });
                                } else {
                                  setSubadminForm({ ...subadminForm, departments: subadminForm.departments.filter((d) => d !== dept) });
                                }
                              }}
                              className="rounded border border-slate-300"
                            />
                            <span className="text-sm text-slate-700">{dept}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-700">Admin feature access</p>
                        <span className="text-xs text-slate-500">Select only the capabilities needed</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {featureOptions.map((feature) => (
                          <label key={feature} className="flex items-center gap-2 cursor-pointer rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition hover:border-blue-300">
                            <input
                              type="checkbox"
                              checked={subadminForm.adminFeatures.includes(feature)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSubadminForm({ ...subadminForm, adminFeatures: [...subadminForm.adminFeatures, feature] });
                                } else {
                                  setSubadminForm({ ...subadminForm, adminFeatures: subadminForm.adminFeatures.filter((item) => item !== feature) });
                                }
                              }}
                              className="h-4 w-4 rounded border border-slate-300 text-blue-700 focus:ring-blue-500"
                            />
                            <span>{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <select
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={subadminForm.role}
                      onChange={(e) => setSubadminForm({ ...subadminForm, role: e.target.value })}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <select
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={subadminForm.workLocation}
                      onChange={(e) => setSubadminForm({ ...subadminForm, workLocation: e.target.value })}
                    >
                      {locationOptions.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <select
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={subadminForm.positionStatus}
                        onChange={(e) => setSubadminForm({ ...subadminForm, positionStatus: e.target.value })}
                      >
                        {['Entry','Team Lead','Manager','HOD','Director','CEO'].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      <select
                        className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={subadminForm.jobType}
                        onChange={(e) => setSubadminForm({ ...subadminForm, jobType: e.target.value })}
                      >
                        {['Contract','Permanent','Temporary','ATP'].map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="date"
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      value={subadminForm.dateOfEntry}
                      onChange={(e) => setSubadminForm({ ...subadminForm, dateOfEntry: e.target.value })}
                    />
                    <button
                      onClick={editingProfileId ? saveProfileChanges : createSubadminProfile}
                      className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                    >
                      {editingProfileId ? "Save profile changes" : "Create profile and credentials"}
                    </button>
                    {editingProfileId && (
                      <button
                        onClick={() => {
                          setEditingProfileId(null);
                          setSubadminForm({
                            fullName: "",
                            email: "",
                            phoneNumber: "",
                            profileImage: "",
                            departments: [],
                            adminFeatures: [],
                            role: "Rider A",
                            workLocation: "Lagos",
                            positionStatus: "Entry",
                            jobType: "Permanent",
                            dateOfEntry: new Date().toISOString().split("T")[0],
                          });
                        }}
                        className="w-full rounded-3xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-400 hover:text-blue-700"
                      >
                        Cancel edit
                      </button>
                    )}
                    {profileNotice && (
                      <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
                        {profileNotice}
                      </div>
                    )}
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Registered sub-admin accounts</h3>
                  <p className="mt-2 text-slate-600">Manage active, suspended, or terminated personnel accounts from here.</p>
                  <div className="mt-6 space-y-4">
                    {subadminProfiles.length === 0 ? (
                      <div className="rounded-3xl bg-slate-50 p-5 text-slate-600">No sub-admin profiles created yet.</div>
                    ) : (
                      subadminProfiles.map((profile) => (
                        <div key={profile.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {profile.profileImage ? (
                                <img
                                  src={profile.profileImage}
                                  alt={profile.fullName}
                                  className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                  <FaUserShield />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900">{profile.fullName}</p>
                                <p className="mt-1 text-sm text-slate-600">{profile.username}</p>
                              </div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.status === "Active" ? "bg-emerald-100 text-emerald-700" : profile.status === "Suspended" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                              {profile.status}
                            </span>
                          </div>
                          <div>
                            <p className="mt-3 text-sm text-slate-600">Departments: {profile.departments.join(", ")}</p>
                            <p className="text-sm text-slate-600">Email: {profile.email || "—"}</p>
                            <p className="text-sm text-slate-600">Phone: {profile.phoneNumber || "—"}</p>
                            <p className="text-sm text-slate-600">Role: {profile.role}</p>
                            <p className="text-sm text-slate-600">Location: {profile.workLocation}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {profile.adminFeatures && profile.adminFeatures.length > 0 ? (
                                profile.adminFeatures.map((feature) => (
                                  <span key={feature} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{feature}</span>
                                ))
                              ) : (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">No admin access selected</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                            <span className="rounded-full bg-white px-3 py-1">{profile.role}</span>
                            <span className="rounded-full bg-white px-3 py-1">{profile.workLocation}</span>
                            <span className="rounded-full bg-white px-3 py-1">{profile.jobType}</span>
                            <span className="rounded-full bg-white px-3 py-1">Entry: {profile.dateOfEntry}</span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button onClick={() => startEditingProfile(profile)} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200">Edit</button>
                            <button onClick={() => updateSubadminStatus(profile.id, "Active")} className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">Activate</button>
                            <button onClick={() => updateSubadminStatus(profile.id, "Suspended")} className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-200">Suspend</button>
                            <button onClick={() => updateSubadminStatus(profile.id, "Terminated")} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200">Terminate</button>
                          </div>
                          <div className="mt-4 rounded-2xl bg-white p-3 text-sm text-slate-700">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Generated login</p>
                            <p className="mt-2 font-semibold">Username: {profile.username}</p>
                            <p className="mt-1">Password: {profile.password}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "workflow" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Task assignment</h3>
                  <p className="mt-2 text-slate-600">Assign shipments and coordinate team workflow.</p>
                  <div className="mt-6 space-y-4">
                    {tasks.map((task) => (
                      <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{task.task}</p>
                            <p className="mt-1 text-sm text-slate-600">Shipment: {task.shipment}</p>
                          </div>
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{task.status}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">Assignee: {task.assignee}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {['Team A','Team B','Team C'].map((group) => (
                            <button
                              key={group}
                              onClick={() => assignTask(task.id, group)}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              {group}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => updateTaskStatus(task.id, "In Progress")}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            In Progress
                          </button>
                          <button
                            onClick={() => updateTaskStatus(task.id, "Ready")}
                            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-200"
                          >
                            Ready
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Workflow status</h3>
                  <ul className="mt-6 space-y-4">
                    <li className="rounded-3xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">Pickup confirmed</p>
                      <p className="mt-1 text-sm text-slate-600">All Port Harcourt pickups are ready for airport delivery.</p>
                    </li>
                    <li className="rounded-3xl bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">Customs clearance prep</p>
                      <p className="mt-1 text-sm text-slate-600">Shipment documents are being reviewed for Lagos and Abuja routes.</p>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {adminTab === "forwarding" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">{role === "subadmin" ? "Assigned shipments" : "Shipment forwarding"}</h3>
                  <p className="mt-2 text-slate-600">{role === "subadmin" ? "Review your assigned bookings and hand off shipments when needed." : "Route shipments to the next logistics node."}</p>
                  <div className="mt-6 space-y-4">
                    {visibleOrders.map((o) => (
                      <div key={o.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-slate-900">{o.id}</p>
                            <p className="text-sm text-slate-600">{o.route}</p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned to: {getSubadminLabel(o.assignedTo)}</p>
                            {o.pendingApproval && (
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Pending approval</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {role === "subadmin" && o.pendingApproval ? (
                              <button
                                onClick={() => approveShipmentAssignment(o.id)}
                                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => updateStatus(o.id, o.status === "Pending" ? "Picked Up" : o.status === "Picked Up" ? "In Flight" : "Delivered")}
                                className="rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-800"
                              >
                                {role === "subadmin" ? "Update" : "Forward"}
                              </button>
                            )}
                            {role === "subadmin" && (
                              <select
                                value={forwardTargets[o.id] || o.assignedTo || "Unassigned"}
                                onChange={(e) => setForwardTargets((prev) => ({ ...prev, [o.id]: e.target.value }))}
                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                              >
                                <option value="Unassigned">Unassigned</option>
                                {activeSubadminProfiles.map((profile) => (
                                  <option key={profile.id} value={profile.username}>{profile.fullName}</option>
                                ))}
                              </select>
                            )}
                            {role === "subadmin" && (
                              <button
                                onClick={() => forwardShipment(o.id, forwardTargets[o.id] || o.assignedTo || "Unassigned")}
                                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-700"
                              >
                                Forward / Push
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Forwarding summary</h3>
                  <div className="mt-6 grid gap-4">
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Ready to forward</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{currentOverviewOrders.filter((o) => o.status === "Pending").length} shipments</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">In transit</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{currentOverviewOrders.filter((o) => o.status === "In Flight").length} shipments</p>
                    </div>
                    {role === "subadmin" && (
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Your queue</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{currentOverviewOrders.filter((o) => o.assignedTo === activeUser).length} assigned bookings</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {adminTab === "cooperate" && role === "subadmin" && (
              <div className="mt-6">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Cooperate Panel</h3>
                  <p className="mt-2 text-slate-600">Tools and views tailored to your assigned shipments.</p>
                  <div className="mt-4">
                    <Cooperate orders={visibleOrders} booking={booking} setBooking={setBooking} handleBook={handleBook} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
