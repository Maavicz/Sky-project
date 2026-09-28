import { useState, useEffect, useMemo, useRef } from "react";
import { buildBookingTermsAcceptance, validateBooking, buildPaymentSummary, getPaymentOptions } from "./testHelpers/validation.mjs";
import { buildInvoiceEmail, buildInvoiceHtml, buildInvoiceNumber, buildMailtoUrl, buildQuoteEmail, DELIVERY_COLLECTION_OPTIONS, formatNaira, SBNL_PAYMENT_ACCOUNT } from "./testHelpers/emailTemplates.mjs";
import { appendShipmentEvent, canAccessTracking, ensureShipmentAudit, getAdminTabs, getFutureFlightSchedulePreview, verifyShipmentHandoffPin } from "./testHelpers/appLogic.mjs";
import {
  FaBell,
  FaBoxOpen,
  FaChartBar,
  FaCheckCircle,
  FaCopy,
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
  FaMoon,
  FaSun,
  FaCog,
} from "react-icons/fa";
import heroImage from "../imagery/happy-new-month.png";
import Field from "./components/Field.jsx";
import LoginForm from "./components/LoginForm.jsx";
import Toasts from "./components/Toasts.jsx";
import Card from "./components/Card.jsx";
import TrackSection from "./components/TrackSection.jsx";
import AlertsPanel from "./components/AlertsPanel.jsx";
import Cooperate from "./Cooperate.jsx";
import DeliveryTerms, { DELIVERY_TERMS_VERSION } from "./components/DeliveryTerms.jsx";
import ShipmentAudit from "./components/ShipmentAudit.jsx";
import ShipmentPreview from "./components/ShipmentPreview.jsx";
import AdminSettings from "./components/AdminSettings.jsx";

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
    answer: "Sign in to the corporate client portal before entering your tracking ID. Updates are provided where available and may be subject to operational or system delays.",
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
    quote: "We booked a same-day move for urgent medical supplies and the communication from Skybridge Nexus Logistic LTD was exceptional from pickup to delivery.",
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

const defaultAdminSettings = {
  notifications: { shipments: true, payments: true, security: true },
  backgroundColor: "mist",
  schedule: { days: ["Mon", "Tue", "Wed", "Thu", "Fri"], start: "08:00", end: "17:00", timezone: "Africa/Lagos" },
  profile: { name: "", email: "", phone: "" },
  handoffPin: "",
};

export default function App() {
  const [page, setPage] = useState("home");
  const [role, setRole] = useState("guest");
  const [adminTab, setAdminTab] = useState("overview");
  const [login, setLogin] = useState({ user: "", pass: "" });
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingResult, setTrackingResult] = useState("");
  const [tasks, setTasks] = useState(initialTasks);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const storedSettings = JSON.parse(localStorage.getItem("sb_admin_settings_v1") || "null");
      if (!storedSettings) return defaultAdminSettings;
      return {
        ...defaultAdminSettings,
        ...storedSettings,
        notifications: { ...defaultAdminSettings.notifications, ...storedSettings.notifications },
        schedule: { ...defaultAdminSettings.schedule, ...storedSettings.schedule },
        profile: { ...defaultAdminSettings.profile, ...storedSettings.profile },
      };
    } catch {
      return defaultAdminSettings;
    }
  });
  const [handoffAction, setHandoffAction] = useState(null);
  const [handoffPinInput, setHandoffPinInput] = useState("");
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

  const [booking, setBooking] = useState({ name: "", email: "", receiverName: "", receiverContact: "", itemDescription: "", quantity: "1", dimensions: "", handlingNotes: "", service: "Sensitive - Next Day", collectionPoint: "", pickup: "", delivery: "", weight: "", contact: "" });
  const [bankAccountCopied, setBankAccountCopied] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
  const [recentBookingId, setRecentBookingId] = useState("");
  const [paymentStage, setPaymentStage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    accountName: "Skybridge Nexus Logistics",
    accountNumber: "",
    terminalId: "",
    transactionId: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
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
  const [clientTheme, setClientTheme] = useState(() => {
    try {
      return localStorage.getItem("sb_client_theme_v1") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sb_client_theme_v1", clientTheme);
    } catch {}
  }, [clientTheme]);

  const [orders, setOrders] = useState(() => {
    const initializedAt = new Date().toISOString();
    return [
      { id: "SB-2026-001", status: "In Flight", route: "PH → Lagos", assignedTo: "Unassigned", pendingApproval: false, paymentStatus: "Paid", cargoStage: "In transit", airportStatus: "Cleared", flagged: false },
      { id: "SB-2026-002", status: "Delivered", route: "PH → Abuja", assignedTo: "Unassigned", pendingApproval: false, paymentStatus: "Paid", cargoStage: "Delivered", airportStatus: "Completed", flagged: false },
      { id: "SB-2026-003", status: "At Airport", route: "PH → Lagos", assignedTo: "Unassigned", pendingApproval: false, paymentStatus: "Pending", cargoStage: "Airport processing", airportStatus: "Awaiting clearance", flagged: false },
    ].map((order) => ({
      ...order,
      createdAt: initializedAt,
      updatedAt: initializedAt,
      history: [{ at: initializedAt, actor: "system", event: "Demo shipment initialized" }],
    }));
  });

  // Persist key names
  const STORAGE_KEYS = {
    accounts: "sb_accounts_v1",
    orders: "sb_orders_v1",
    subadmins: "sb_subadmins_v1",
    adminSettings: "sb_admin_settings_v1",
  };

  // Load persisted state on mount
  useEffect(() => {
    try {
      const persistedAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
      const persistedOrders = localStorage.getItem(STORAGE_KEYS.orders);
      const persistedSubadmins = localStorage.getItem(STORAGE_KEYS.subadmins);
      if (persistedAccounts) setAccounts(JSON.parse(persistedAccounts));
      if (persistedOrders) {
        const importedAt = new Date().toISOString();
        setOrders(JSON.parse(persistedOrders).map((order) => ensureShipmentAudit(order, importedAt)));
      }
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.adminSettings, JSON.stringify(adminSettings));
    } catch {}
  }, [adminSettings]);

  // Performance: memoize derived lists
  const memoActiveSubadmins = useMemo(() => subadminProfiles.filter((p) => p.status === "Active"), [subadminProfiles]);
  const analyticsMetrics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.paymentStatus === "Paid" ? 2500 : 0),
      0
    );
    const pendingPayments = orders.filter((order) => ["Pending", "Awaiting Transfer"].includes(order.paymentStatus)).length;
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

  const updateAdminSettings = (changes) => {
    setAdminSettings((previous) => ({
      ...previous,
      ...changes,
      notifications: changes.notifications || previous.notifications,
      schedule: changes.schedule || previous.schedule,
      profile: changes.profile || previous.profile,
    }));
  };

  const changeAdminPassword = (currentPassword, nextPassword, confirmedPassword) => {
    const account = accounts[activeUser];
    if (!account || account.password !== currentPassword) return { ok: false, message: "Current password is incorrect." };
    if (String(nextPassword).length < 8) return { ok: false, message: "New password must be at least 8 characters." };
    if (nextPassword !== confirmedPassword) return { ok: false, message: "New password and confirmation do not match." };
    setAccounts((previous) => ({ ...previous, [activeUser]: { ...previous[activeUser], password: nextPassword } }));
    return { ok: true, message: "Password changed for this local demo account." };
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
    if (targetPage === "track" && !canAccessTracking(role)) {
      pushToast({ type: "error", message: "Please sign in or create a corporate profile before tracking individual cargo." });
      setPage("client");
      return;
    }
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
    if (notification.category && adminSettings.notifications[notification.category] === false) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setNotifications((prev) => [{ id, ...notification }, ...prev].slice(0, 5));
  };

  const createFraudAlert = (orderId, message) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setFraudAlerts((prev) => [{ id, orderId, message, active: true }, ...prev]);
  };

  const trackPackage = () => {
    if (!canAccessTracking(role)) {
      pushToast({ type: "error", message: "Please sign in or create a corporate profile before tracking individual cargo." });
      setPage("client");
      setTrackingResult("");
      setTrackingDetails(null);
      return;
    }
    // Debounced lookup
    if (trackingDebounceRef.current) clearTimeout(trackingDebounceRef.current);
    trackingDebounceRef.current = setTimeout(() => {
      const found = orders.find((o) => o.id.toUpperCase() === trackingInput.toUpperCase());
      if (found) {
        setTrackingResult(`${found.status} — ${found.route}`);
        setTrackingDetails({
          orderId: found.id,
          id: found.id,
          shipment: found,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
          history: found.history,
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

  const recordShipmentUpdate = (orderId, changes, event, actor = activeUser || (role === "guest" ? "customer" : role), at = new Date().toISOString()) => {
    setOrders((previous) => previous.map((order) => order.id === orderId
      ? appendShipmentEvent(order, changes, event, { actor, at })
      : order));
    const category = /payment|transfer/i.test(event) ? "payments" : "shipments";
    createNotification({ category, title: "Shipment activity", message: `${orderId}: ${event}`, type: "info" });
  };

  const getOrderEmailDetails = (order) => {
    const [pickupCode, deliveryCode] = String(order.route || "").split(" → ");
    const locationNames = { PHC: "Port Harcourt", LOS: "Lagos", ABJ: "Abuja" };
    const route = `${locationNames[pickupCode] || pickupCode} to ${locationNames[deliveryCode] || deliveryCode}`;
    const summary = buildPaymentSummary({ bookingId: order.id, route, weight: order.weight });
    return {
      customerName: order.customerName || "Customer",
      customerEmail: order.customerEmail || "",
      amount: order.quoteAmount || summary.total,
      route,
      service: order.service || "Sensitive - Next Day",
      collectionPoint: order.collectionPoint || "To be confirmed",
    };
  };

  const prepareQuoteEmail = (order) => {
    if (!order.customerEmail) {
      pushToast({ type: "error", message: "This booking has no customer email address." });
      return;
    }
    const template = buildQuoteEmail(getOrderEmailDetails(order));
    recordShipmentUpdate(order.id, { quoteDraftedAt: new Date().toISOString() }, "Quote email draft prepared", activeUser || "admin");
    window.location.href = buildMailtoUrl(template);
  };

  const recordQuoteConfirmation = (order) => {
    const todaySequence = orders.filter((item) => item.createdAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)).length + 1;
    const confirmedAt = new Date().toISOString();
    recordShipmentUpdate(order.id, {
      quoteConfirmedAt: confirmedAt,
      quoteConfirmedBy: activeUser,
      invoiceNumber: order.invoiceNumber || buildInvoiceNumber(new Date(), todaySequence),
    }, "Customer confirmed quote", activeUser || "admin", confirmedAt);
    pushToast({ type: "success", message: `CONFIRM recorded for ${order.id}. The invoice draft is ready.` });
  };

  const prepareInvoiceEmail = (order) => {
    if (!order.quoteConfirmedAt || !order.invoiceNumber) {
      pushToast({ type: "error", message: "Record the customer's CONFIRM reply before preparing an invoice." });
      return;
    }
    const details = getOrderEmailDetails(order);
    const template = buildInvoiceEmail({ ...details, service: details.service.split(" - ")[0], invoiceNumber: order.invoiceNumber });
    recordShipmentUpdate(order.id, { invoiceDraftedAt: new Date().toISOString() }, "Invoice email draft prepared", activeUser || "admin");
    window.location.href = buildMailtoUrl(template);
  };

  const downloadInvoiceDocument = (order) => {
    if (!order.quoteConfirmedAt || !order.invoiceNumber) {
      pushToast({ type: "error", message: "Record the customer's CONFIRM reply before generating an invoice." });
      return;
    }
    const details = getOrderEmailDetails(order);
    const documentHtml = buildInvoiceHtml({ ...details, service: details.service.split(" - ")[0], invoiceNumber: order.invoiceNumber });
    const file = new Blob([documentHtml], { type: "text/html;charset=utf-8" });
    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");
    downloadLink.href = fileUrl;
    downloadLink.download = `${order.invoiceNumber}.html`;
    downloadLink.click();
    recordShipmentUpdate(order.id, { invoiceDownloadedAt: new Date().toISOString() }, "Invoice document downloaded", activeUser || "admin");
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  };

  const confirmTransferReceived = (order) => {
    const verifiedRider = activeSubadminProfiles.find((profile) => profile.role?.toLowerCase().includes("rider"));
    const paymentConfirmedAt = new Date().toISOString();
    recordShipmentUpdate(order.id, {
      paymentStatus: "Paid",
      status: verifiedRider ? "In Flight" : "Awaiting Rider Assignment",
      cargoStage: verifiedRider ? "Airport processing" : "Payment verified",
      assignedTo: verifiedRider?.username || order.assignedTo || "Unassigned",
      paymentConfirmedAt,
    }, "Bank transfer verified", activeUser || role, paymentConfirmedAt);
    pushToast({ type: "success", message: verifiedRider ? `Payment verified and ${verifiedRider.fullName} assigned to ${order.id}.` : `Payment verified for ${order.id}; no active rider profile is available to assign.` });
  };

  const copyBankAccount = async () => {
    try {
      await navigator.clipboard.writeText(SBNL_PAYMENT_ACCOUNT.accountNumber);
      setBankAccountCopied(true);
      setTimeout(() => setBankAccountCopied(false), 2000);
    } catch {
      pushToast({ type: "error", message: "Could not copy account number. Select and copy it manually." });
    }
  };

  const handleBook = () => {
    const termsAcceptance = buildBookingTermsAcceptance({
      accepted: termsAccepted,
      version: DELIVERY_TERMS_VERSION,
      acceptedBy: activeUser || booking.name.trim(),
    });
    if (!termsAcceptance) {
      pushToast({ type: "error", message: "Please read and accept the delivery terms before submitting your booking." });
      return;
    }

    const formIsValid = validateBooking(booking);
    if (!formIsValid.ok) {
      pushToast({ type: "error", message: "Enter a valid email, sender and receiver contacts, cargo description, quantity, route, and weight." });
      return;
    }

    const newId = `SB-2026-${String(orders.length + 1).padStart(3, '0')}`;
    const autoAssignedTo = memoActiveSubadmins[0]?.username || "Unassigned";
    const createdAt = new Date().toISOString();
    const newOrder = {
      id: newId,
      status: "Pending",
      route: `${booking.pickup} → ${booking.delivery}`,
      assignedTo: autoAssignedTo,
      pendingApproval: false,
      weight: booking.weight,
      contact: booking.contact,
      customerName: booking.name.trim(),
      customerEmail: booking.email.trim(),
      receiverName: booking.receiverName.trim(),
      receiverContact: booking.receiverContact.trim(),
      itemDescription: booking.itemDescription.trim(),
      quantity: Number(booking.quantity),
      dimensions: booking.dimensions.trim(),
      handlingNotes: booking.handlingNotes.trim(),
      service: booking.service,
      collectionPoint: booking.collectionPoint,
      quoteAmount: buildPaymentSummary({ bookingId: newId, route: `${booking.pickup} → ${booking.delivery}`, weight: booking.weight }).total,
      termsAcceptance,
      createdAt,
      updatedAt: createdAt,
      statusUpdatedAt: createdAt,
      history: [{ at: createdAt, actor: activeUser || booking.name.trim(), event: "Booking created" }],
    };

    setOrders((prev) => [newOrder, ...prev]);
    setRecentBookingId(newId);
    setBooking({ name: "", email: "", receiverName: "", receiverContact: "", itemDescription: "", quantity: "1", dimensions: "", handlingNotes: "", service: "Sensitive - Next Day", collectionPoint: "", pickup: "", delivery: "", weight: "", contact: "" });
    setTermsAccepted(false);
    setPaymentStage(true);
    setTrackingInput(newId);
    setTrackingResult("Pending");
    pushToast({ type: "success", message: `Booking submitted! Your tracking ID is ${newId}` });
  };

  const handlePaymentDone = () => {
    if (paymentMethod !== "Bank Transfer") {
      pushToast({ type: "error", message: "This payment provider is not connected yet. Please use bank transfer." });
      return;
    }
    const validation = validatePaymentDetails({ ...paymentDetails, method: paymentMethod });
    if (!validation.ok) {
      pushToast({ type: "error", message: validation.message });
      return;
    }

    const currentBooking = orders.find((order) => order.id === recentBookingId) || null;
    if (paymentMethod === "Bank Transfer") {
      recordShipmentUpdate(recentBookingId, { paymentStatus: "Awaiting Transfer", status: "Pending Payment" }, "Customer reported bank transfer; awaiting verification");
      setPaymentStage(false);
      pushToast({ type: "info", message: "Transfer instructions confirmed. Shipment remains pending until SBNL verifies payment." });
      return;
    }
    const paymentSummary = buildPaymentSummary({
      bookingId: recentBookingId,
      route: currentBooking?.route || booking.pickup && booking.delivery ? `${booking.pickup} → ${booking.delivery}` : "Route pending",
      weight: currentBooking?.weight || booking.weight || "0",
      paymentMethod,
    });

    recordShipmentUpdate(recentBookingId, { paymentStatus: "Paid", status: "In Flight", cargoStage: "Airport processing" }, "Payment confirmed");
    setPaymentHistory((prev) => [
      {
        id: `PAY-${Date.now()}`,
        bookingId: recentBookingId,
        method: paymentMethod,
        route: paymentSummary.route,
        amount: paymentSummary.total,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 6));
    createNotification({
      title: "Payment confirmed",
      message: `Payment for booking ${recentBookingId} was confirmed. Shipment is now in transit.`,
      type: "success",
      category: "payments",
    });
    setPaymentStage(false);
    setTrackingResult("In Flight — processing at airport");
    setTrackingDetails({
      orderId: recentBookingId,
      status: "In Flight",
      route: currentBooking?.route || "Unknown route",
      currentLocation: "Airport cargo terminal",
      timeline: [
        { label: "Payment confirmed", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ],
      estimatedDelivery: "Today 18:00",
    });
    setPaymentDetails({
      cardNumber: "",
      expiry: "",
      cvv: "",
      accountName: "Skybridge Nexus Logistics",
      accountNumber: "",
      terminalId: "",
      transactionId: "",
    });
    navigateTo("track");
    window.open(`https://wa.me/2349165000149?text=Hello%20Skybridge%20Nexus%20Logistics%2C%20I%20have%20completed%20payment%20for%20booking%20${recentBookingId}.`, "_blank", "noopener,noreferrer");
  };

  const currentPaymentSummary = recentBookingId
    ? buildPaymentSummary({
        bookingId: recentBookingId,
        route: orders.find((order) => order.id === recentBookingId)?.route || `${booking.pickup || "PHC"} → ${booking.delivery || "LOS"}`,
        weight: orders.find((order) => order.id === recentBookingId)?.weight || booking.weight || "0",
        paymentMethod,
      })
    : null;

  const paymentMethodFields = {
    "Card Payment": (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Card processing is not connected yet. Do not enter or send card details here. Select Bank Transfer to use the verified company account.
      </div>
    ),
    "Bank Transfer": (
      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 bg-emerald-800 px-5 py-4 text-white">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">Company bank transfer</p><p className="mt-1 text-lg font-semibold">{SBNL_PAYMENT_ACCOUNT.bank}</p></div>
          <span className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">NGN · Naira</span>
        </div>
        <div className="space-y-4 p-5">
          <div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Account number</p><div className="mt-1 flex items-center justify-between gap-3"><p className="font-mono text-2xl font-bold tracking-[0.08em] text-slate-900">{SBNL_PAYMENT_ACCOUNT.accountNumber}</p><button type="button" onClick={copyBankAccount} aria-label="Copy account number" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"><FaCopy /> {bankAccountCopied ? "Copied" : "Copy"}</button></div></div>
          <div className="flex flex-wrap items-start justify-between gap-3 border-t border-slate-100 pt-4"><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Account name</p><p className="mt-1 font-semibold text-slate-900">{SBNL_PAYMENT_ACCOUNT.accountName}</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Amount due</p><p className="mt-1 text-xl font-bold text-emerald-800">{formatNaira(currentPaymentSummary?.total || 0)}</p></div></div>
          <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">Use your booking reference <strong>{recentBookingId}</strong> as the transfer narration. Your shipment is not marked paid until our team verifies the funds.</p>
        </div>
      </div>
    ),
    "POS Payment": (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        POS processing is not connected yet. No payment will be marked complete with this option. Please select Bank Transfer.
      </div>
    ),
  };

  const paymentOptions = getPaymentOptions();

  const updateStatus = (id, newStatus) => {
    recordShipmentUpdate(id, { status: newStatus }, `Status changed to ${newStatus}`);
  };

  const assignOrderToSubadmin = (id, targetUsername) => {
    const nextAssignedTo = targetUsername && targetUsername !== "Unassigned" ? targetUsername : "Unassigned";
    recordShipmentUpdate(id, { assignedTo: nextAssignedTo, pendingApproval: false, pendingForwardTo: "" }, `Shipment assigned to ${nextAssignedTo}`);
    const selectedProfile = subadminProfiles.find((profile) => profile.username === targetUsername);
    setProfileNotice(selectedProfile ? `Shipment ${id} assigned to ${selectedProfile.fullName}` : `Shipment ${id} assignment updated`);
  };

  const forwardShipment = (id, targetUsername) => {
    if (!targetUsername || targetUsername === "Unassigned") {
      setProfileNotice("Choose a sub-admin before forwarding.");
      return;
    }
    recordShipmentUpdate(id, { pendingApproval: true, pendingForwardTo: targetUsername }, `Shipment forwarding requested for ${targetUsername}`);
    const selectedProfile = subadminProfiles.find((profile) => profile.username === targetUsername);
    setProfileNotice(selectedProfile ? `Shipment ${id} forwarded to ${selectedProfile.fullName} for approval.` : `Shipment ${id} forwarding requested.`);
  };

  const approveShipmentAssignment = (id) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    const nextAssignedTo = order.pendingForwardTo || order.assignedTo;
    recordShipmentUpdate(id, { assignedTo: nextAssignedTo, pendingForwardTo: "", pendingApproval: false }, `Shipment handoff approved to ${nextAssignedTo}`);
    setProfileNotice(`Shipment ${id} approved for handoff.`);
  };

  const declineShipmentAssignment = (id) => {
    recordShipmentUpdate(id, { pendingForwardTo: "", pendingApproval: false }, "Shipment handoff declined");
    setProfileNotice(`Shipment ${id} forwarding declined and returned to current assignee.`);
  };

  const requestHandoffConfirmation = (action) => {
    if (!adminSettings.handoffPin) {
      pushToast({ type: "error", message: "An administrator must set the shipment handoff PIN in Settings first." });
      if (role === "admin") setAdminTab("settings");
      return;
    }
    setHandoffAction(action);
    setHandoffPinInput("");
  };

  const confirmHandoffAction = (event) => {
    event.preventDefault();
    if (!verifyShipmentHandoffPin(adminSettings.handoffPin, handoffPinInput)) {
      pushToast({ type: "error", message: "Handoff PIN is incorrect. The shipment was not changed." });
      createFraudAlert(handoffAction?.shipmentId, `Incorrect handoff PIN entered by ${activeUser || role}.`);
      createNotification({ category: "security", title: "Handoff PIN rejected", message: `A shipment handoff PIN check failed for ${handoffAction?.shipmentId}.`, type: "error" });
      setHandoffPinInput("");
      return;
    }

    const action = handoffAction;
    setHandoffAction(null);
    setHandoffPinInput("");
    if (action?.type === "approve") approveShipmentAssignment(action.shipmentId);
    if (action?.type === "forward") forwardShipment(action.shipmentId, action.targetUsername);
    if (action?.type === "assign") assignOrderToSubadmin(action.shipmentId, action.targetUsername);
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
          const at = new Date().toISOString();
          return appendShipmentEvent(o, { assignedTo: assignTo, pendingApproval: false }, `Auto-assigned to ${assignTo}`, { actor: activeUser || role, at });
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
    <div className="min-h-screen bg-[#f5f8ff] text-slate-900" style={page === "admin" && role === "admin" ? { backgroundColor: { mist: "#f5f8ff", white: "#ffffff", "cool-gray": "#e8edf1" }[adminSettings.backgroundColor] || "#f5f8ff" } : undefined}>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-200">
              <FaPlane className="text-lg" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-500">SBNL</p>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-800">Delivery</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
            <button onClick={() => navigateTo("home")} className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
              <FaPlane /> Home
            </button>
            <button onClick={() => navigateTo("about")} className="flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
              About
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
                      Skybridge Nexus Logistic LTD combines premium airport coordination, real-time tracking, and smarter delivery operations for businesses that need dependable movement at scale.
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
                      alt="Skybridge Nexus Logistic LTD branded cargo imagery"
                      className="h-[430px] w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/10 to-transparent"></div>
                    <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur-md text-white shadow-xl">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-slate-300">SBNL Delivery · sbnldelivery.com</p>
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
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Skybridge Nexus Logistic LTD</p>
                  <h3 className="mt-4 text-2xl font-semibold">SBNL Delivery — logistics with speed, structure, and trust.</h3>
                  <p className="mt-4 max-w-md text-slate-300">
                    We connect businesses across Nigeria with dependable air, road, and cargo logistics support backed by real-time shipment visibility.
                  </p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Company</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    <li><button type="button" onClick={() => navigateTo("about")} className="text-left transition hover:text-white">About us</button></li>
                    <li><button type="button" onClick={() => navigateTo("book")} className="text-left transition hover:text-white">Our services</button></li>
                    <li><button type="button" onClick={() => navigateTo("track")} className="text-left transition hover:text-white">Tracking</button></li>
                    <li><button type="button" onClick={() => navigateTo("client")} className="text-left transition hover:text-white">Client portal</button></li>
                    <li><button type="button" onClick={() => navigateTo("terms")} className="text-left transition hover:text-white">Delivery terms</button></li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Contact</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    <li><a href="tel:+2349165000149" className="flex items-center gap-2 transition hover:text-white"><FaPhoneAlt className="text-blue-400" /> 09165000149</a></li>
                    <li><a href="mailto:hello@sbnldelivery.com" className="flex items-center gap-2 transition hover:text-white"><FaEnvelope className="text-blue-400" /> hello@sbnldelivery.com</a></li>
                    <li><a href="https://maps.google.com/?q=Port+Harcourt+Lagos+Abuja" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-white"><FaMapMarkerAlt className="text-blue-400" /> Port Harcourt, Lagos, Abuja</a></li>
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
                © 2026 Skybridge Nexus Logistic LTD. All rights reserved.
              </div>
            </footer>
          </>
        )}
        <Toasts toasts={toasts} />

        {handoffAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="presentation">
            <form onSubmit={confirmHandoffAction} role="dialog" aria-modal="true" aria-labelledby="handoff-pin-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Staff verification</p><h2 id="handoff-pin-title" className="mt-2 text-xl font-bold text-slate-900">Confirm shipment handoff</h2></div>
                <button type="button" onClick={() => { setHandoffAction(null); setHandoffPinInput(""); }} aria-label="Close PIN check" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Close</button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">Enter the handoff PIN to {handoffAction.type === "approve" ? "approve" : "send"} shipment <strong>{handoffAction.shipmentId}</strong>{handoffAction.targetUsername ? ` to ${getSubadminLabel(handoffAction.targetUsername)}` : ""}.</p>
              <label className="mt-5 block text-sm font-semibold text-slate-700">Handoff PIN<input type="password" inputMode="numeric" autoComplete="current-password" value={handoffPinInput} onChange={(event) => setHandoffPinInput(event.target.value.replace(/\D/g, "").slice(0, 8))} autoFocus className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-lg tracking-[0.3em] focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200" /></label>
              <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => { setHandoffAction(null); setHandoffPinInput(""); }} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button type="submit" className="min-h-11 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">Verify &amp; continue</button></div>
            </form>
          </div>
        )}
        
        

        {page === "about" && (
          <div className="space-y-8">
            <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
              <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-blue-700/50 to-transparent lg:block" />
              <div className="relative max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">About Skybridge</p>
                <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">Logistics built around clear handoffs and dependable movement.</h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Skybridge Nexus Logistics LTD helps businesses coordinate cargo movement across key Nigerian routes, connecting booking, transport coordination, shipment visibility, and delivery communication in one service.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <button type="button" onClick={() => navigateTo("book")} className="min-h-11 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">Book a delivery</button>
                  <a href="mailto:hello@sbnldelivery.com" className="inline-flex min-h-11 items-center rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Talk to our team</a>
                </div>
              </div>
            </section>

            <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Who we are</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Skybridge Nexus Logistics LTD</h2>
                <p className="mt-4 leading-7 text-slate-600">SBNL Delivery is the customer-facing service of Skybridge Nexus Logistics LTD. We coordinate air-integrated and ground logistics with a focus on practical communication, accountable shipment handoffs, and useful status visibility.</p>
                <p className="mt-4 leading-7 text-slate-600">Our operating model brings together customer booking information, route planning, airport and carrier coordination, and delivery follow-through. Each shipment has different handling and timing needs, so clear information at booking is an important part of a reliable service.</p>
              </div>
              <div className="rounded-3xl bg-blue-50 p-7 ring-1 ring-blue-100 sm:p-9">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Our approach</p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {[
                    ["Coordinate", "Plan pickup, route, carrier, and handoff requirements around the shipment."],
                    ["Communicate", "Keep customers informed about booking, payment, documentation, and delivery coordination."],
                    ["Handle responsibly", "Use the information provided to identify handling needs and applicable restrictions."],
                    ["Make progress visible", "Provide tracking updates where available, while recognizing that operational updates can be delayed."],
                  ].map(([title, text]) => (
                    <div key={title} className="border-l-2 border-blue-600 pl-4">
                      <h3 className="font-semibold text-slate-900">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">What we coordinate</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">Service support for the shipment journey</h2>
                <p className="mt-3 leading-7 text-slate-600">Service availability, timing, and charges depend on the route, cargo, carrier, operational conditions, and any special requirements confirmed for a booking.</p>
              </div>
              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {services.map((service, index) => (
                  <div key={service.title} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">0{index + 1}</span>
                    <div><h3 className="font-semibold text-slate-900">{service.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              {[
                ["01", "Share accurate details", "Tell us what is being sent, who will receive it, and any packaging or handling needs."],
                ["02", "Confirm the service", "We coordinate booking details and communicate applicable service or additional charges."],
                ["03", "Follow the handoff", "Use available shipment updates and stay reachable for verification and delivery coordination."],
              ].map(([number, title, text]) => (
                <div key={number} className="border-t-2 border-blue-700 bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm font-bold text-blue-700">{number}</p><h3 className="mt-3 text-lg font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              ))}
            </section>

            <section className="flex flex-col gap-5 rounded-3xl bg-emerald-50 p-7 ring-1 ring-emerald-200 sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div><h2 className="text-xl font-bold text-slate-900">Need to discuss a shipment?</h2><p className="mt-2 text-slate-700">Contact our team before booking if your cargo is fragile, restricted, valuable, perishable, or requires special handling.</p></div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <a href="tel:+2349165000149" className="inline-flex min-h-11 items-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Call 09165000149</a>
                <button type="button" onClick={() => navigateTo("terms")} className="min-h-11 rounded-xl border border-emerald-800/30 px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100">Read delivery terms</button>
              </div>
            </section>
          </div>
        )}

        {page === "terms" && (
          <DeliveryTerms onReturn={() => navigateTo(role === "client" ? "client" : "book")} />
        )}

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
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Ready to ship with SBNL Delivery?</h2>
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
                <p className="mt-2 text-slate-600">hello@sbnldelivery.com</p>
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
                <Field
                  id="customer-email"
                  label="Customer Email"
                  type="email"
                  value={booking.email}
                  onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  placeholder="you@example.com"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  autoComplete="email"
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
                  aria-label="Delivery Location"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={booking.delivery}
                  onChange={(e) => setBooking({ ...booking, delivery: e.target.value })}
                >
                  <option value="">Select Delivery Location</option>
                  <option value="PHC">Port Harcourt</option>
                  <option value="LOS">Lagos</option>
                  <option value="ABJ">Abuja</option>
                </select>
                <label className="block text-sm font-medium text-slate-700">
                  Service
                  <select value={booking.service} onChange={(e) => setBooking({ ...booking, service: e.target.value })} className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option>Sensitive - Next Day</option>
                    <option>Next Day</option>
                    <option>Same Day</option>
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Package or Cargo Collection / Delivery Method
                  <select value={booking.collectionPoint} onChange={(e) => setBooking({ ...booking, collectionPoint: e.target.value })} className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="">Choose a delivery method</option>
                    {DELIVERY_COLLECTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
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
                <Field
                  id="receiver-name"
                  label="Receiver Name"
                  value={booking.receiverName}
                  onChange={(e) => setBooking({ ...booking, receiverName: e.target.value })}
                  placeholder="e.g. Tunde Bello"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <Field
                  id="receiver-contact"
                  label="Receiver Contact Number"
                  value={booking.receiverContact}
                  onChange={(e) => setBooking({ ...booking, receiverContact: e.target.value })}
                  placeholder="e.g. 08087654321"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <Field
                  id="item-description"
                  label="Cargo Description"
                  value={booking.itemDescription}
                  onChange={(e) => setBooking({ ...booking, itemDescription: e.target.value })}
                  placeholder="Describe the shipment contents"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <label className="block text-sm font-medium text-slate-700">
                  Quantity
                  <input type="number" min="1" step="1" value={booking.quantity} onChange={(e) => setBooking({ ...booking, quantity: e.target.value })} className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Dimensions (optional)
                  <input value={booking.dimensions} onChange={(e) => setBooking({ ...booking, dimensions: e.target.value })} placeholder="Length × width × height" className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </label>
                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Special handling requirements (optional)
                  <textarea value={booking.handlingNotes} onChange={(e) => setBooking({ ...booking, handlingNotes: e.target.value })} rows="3" className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </label>
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input id="booking-terms" type="checkbox" aria-required="true" aria-describedby="booking-terms-description" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-blue-700" />
                <div id="booking-terms-description" className="text-sm leading-6 text-slate-700">
                  <label htmlFor="booking-terms">I have read and agree to the Delivery Booking Terms &amp; Conditions.</label>
                  <button type="button" onClick={() => navigateTo("terms")} className="ml-1 font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">Read the full terms</button>
                </div>
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
                  <div className="grid gap-3 md:grid-cols-3">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.method}
                        type="button"
                        onClick={() => setPaymentMethod(option.method)}
                        className={`rounded-3xl border p-4 text-left transition ${paymentMethod === option.method ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-200" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"}`}
                      >
                        <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">{option.subtitle}</p>
                        <p className="mt-3 text-xs leading-5 text-slate-600">{option.description}</p>
                      </button>
                    ))}
                  </div>
                  {currentPaymentSummary && (
                    <div className="rounded-3xl border border-blue-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
                      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                        <span>Invoice</span>
                        <span>{currentPaymentSummary.bookingId}</span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between"><span>Route</span><span className="font-medium text-slate-900">{currentPaymentSummary.route}</span></div>
                        <div className="flex justify-between"><span>Weight</span><span className="font-medium text-slate-900">{currentPaymentSummary.weight} kg</span></div>
                        <div className="flex justify-between"><span>Base amount</span><span className="font-medium text-slate-900">₦{currentPaymentSummary.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Service fee</span><span className="font-medium text-slate-900">₦{currentPaymentSummary.fee.toLocaleString()}</span></div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900"><span>Total</span><span>₦{currentPaymentSummary.total.toLocaleString()}</span></div>
                      </div>
                    </div>
                  )}
                  {paymentMethodFields[paymentMethod]}
                  <button
                    onClick={handlePaymentDone}
                    className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                  >
                    {paymentMethod === "Bank Transfer" ? "I have made the transfer" : "Confirm payment"}
                  </button>
                  <p className="text-sm text-slate-600">{paymentMethod === "Bank Transfer" ? "This records a transfer notification only. SBNL will verify funds before marking the shipment paid." : "Card and POS processing require a connected payment provider; this demo does not charge a payment method."}</p>
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
          <div className={`client-portal-theme space-y-8 ${clientTheme === "dark" ? "client-portal-theme--dark" : ""}`}>
            <div className="rounded-[2rem] bg-white p-8 shadow-xl ring-1 ring-slate-200">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-700">
                    <FaUsers />
                    <h2 className="text-3xl font-semibold text-slate-900">Corporate Client Portal</h2>
                  </div>
                  <p className="mt-2 text-slate-600">Book shipments, track corporate cargo, and view recent activity.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setClientTheme((theme) => theme === "dark" ? "light" : "dark")}
                  aria-pressed={clientTheme === "dark"}
                  aria-label={`Switch to ${clientTheme === "dark" ? "light" : "dark"} theme`}
                  className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {clientTheme === "dark" ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />}
                  {clientTheme === "dark" ? "Light theme" : "Dark theme"}
                </button>
              </div>
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
                  <input
                    type="email"
                    autoComplete="email"
                    aria-label="Customer email"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Customer email"
                    value={booking.email}
                    onChange={(e) => setBooking({ ...booking, email: e.target.value })}
                  />
                  <select
                    aria-label="Delivery location"
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
                  <label className="block text-sm font-medium text-slate-700">
                    Service
                    <select value={booking.service} onChange={(e) => setBooking({ ...booking, service: e.target.value })} className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                      <option>Sensitive - Next Day</option>
                      <option>Next Day</option>
                      <option>Same Day</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Package or Cargo Collection / Delivery Method
                    <select value={booking.collectionPoint} onChange={(e) => setBooking({ ...booking, collectionPoint: e.target.value })} className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200">
                      <option value="">Choose a delivery method</option>
                      {DELIVERY_COLLECTION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
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
                  <input
                    aria-label="Receiver name"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Receiver name"
                    value={booking.receiverName}
                    onChange={(e) => setBooking({ ...booking, receiverName: e.target.value })}
                  />
                  <input
                    aria-label="Receiver contact number"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Receiver contact number"
                    value={booking.receiverContact}
                    onChange={(e) => setBooking({ ...booking, receiverContact: e.target.value })}
                  />
                  <input
                    aria-label="Cargo description"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Cargo description"
                    value={booking.itemDescription}
                    onChange={(e) => setBooking({ ...booking, itemDescription: e.target.value })}
                  />
                  <label className="block text-sm font-medium text-slate-700">
                    Quantity
                    <input type="number" min="1" step="1" value={booking.quantity} onChange={(e) => setBooking({ ...booking, quantity: e.target.value })} className="mt-1 w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                  </label>
                  <input
                    aria-label="Dimensions (optional)"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Dimensions (optional)"
                    value={booking.dimensions}
                    onChange={(e) => setBooking({ ...booking, dimensions: e.target.value })}
                  />
                  <textarea
                    aria-label="Special handling requirements (optional)"
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Special handling requirements (optional)"
                    value={booking.handlingNotes}
                    onChange={(e) => setBooking({ ...booking, handlingNotes: e.target.value })}
                    rows="3"
                  />
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <input id="corporate-booking-terms" type="checkbox" aria-required="true" aria-describedby="corporate-booking-terms-description" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-blue-700" />
                    <div id="corporate-booking-terms-description" className="text-sm leading-6 text-slate-700">
                      <label htmlFor="corporate-booking-terms">I have read and agree to the Delivery Booking Terms &amp; Conditions.</label>
                      <button type="button" onClick={() => navigateTo("terms")} className="ml-1 font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900">Read the full terms</button>
                    </div>
                  </div>
                  <button
                    onClick={handleBook}
                    className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
                  >
                    Submit Corporate Booking
                  </button>
                </div>
              </div>
              {paymentStage && recentBookingId && (
                <div className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-xl lg:col-start-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">Booking payment</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900">Transfer for {recentBookingId}</h3>
                  <p className="mt-2 mb-4 text-sm text-slate-600">Your booking is reserved. Transfer confirmation is not payment verification.</p>
                  {paymentMethodFields["Bank Transfer"]}
                  <button type="button" onClick={handlePaymentDone} className="mt-4 w-full rounded-2xl bg-emerald-800 px-5 py-4 text-sm font-semibold text-white hover:bg-emerald-900">I have made the transfer</button>
                </div>
              )}
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
            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
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
                            <ShipmentPreview order={order} className="mt-3" />
                        <ShipmentAudit order={order} />
                        {order.termsAcceptance && <p className="mt-2 text-xs text-slate-500">Delivery terms v{order.termsAcceptance.version} accepted {new Date(order.termsAcceptance.acceptedAt).toLocaleString()}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Payment history</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-900">Recent receipts</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Live</span>
                </div>
                <div className="mt-5 space-y-3">
                  {paymentHistory.length === 0 ? (
                    <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-200">
                      No successful payment receipts yet.
                    </div>
                  ) : (
                    paymentHistory.map((payment) => (
                      <div key={payment.id} className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{payment.bookingId}</p>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-blue-700">{payment.method}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{payment.route}</p>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Paid</span>
                          <span className="font-semibold text-slate-900">₦{payment.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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
                      settings: FaCog,
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

            {adminTab === "settings" && role === "admin" && (
              <AdminSettings
                settings={adminSettings}
                orders={orders}
                activeUser={activeUser}
                onUpdateSettings={updateAdminSettings}
                onChangePassword={changeAdminPassword}
              />
            )}

            {adminTab === "client-details" && (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
                  <h3 className="text-xl font-semibold text-slate-900">Client details</h3>
                  <p className="mt-2 text-slate-600">Review booked clients and recent shipment activity at a glance.</p>
                  <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">Email actions open a draft in your configured mail app. Select <strong>hello@sbnldelivery.com</strong> as the sender; attach the downloaded invoice before sending.</p>
                  <div className="mt-6 space-y-4">
                    {orders.length === 0 ? (
                      <div className="rounded-3xl bg-slate-50 p-4 text-slate-600">No client bookings are available yet.</div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <ShipmentPreview order={order} className="mb-3" />
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{order.id}</p>
                              <p className="text-sm text-slate-600">{order.route}</p>
                            </div>
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{order.status}</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">Assigned to: {order.assignedTo || "Unassigned"}</p>
                          <p className="text-sm text-slate-600">Contact: {order.contact || "Not provided"}</p>
                          {order.customerEmail && <p className="text-sm text-slate-600">Email: {order.customerEmail}</p>}
                          {order.itemDescription && <p className="text-sm text-slate-600">Cargo: {order.itemDescription} · Qty {order.quantity}</p>}
                          <ShipmentAudit order={order} />
                          {order.quoteDraftedAt && <p className="mt-2 text-xs text-slate-500">Quote email draft prepared {new Date(order.quoteDraftedAt).toLocaleString()}</p>}
                          {order.quoteConfirmedAt && <p className="text-xs font-medium text-emerald-700">CONFIRM received · Invoice {order.invoiceNumber}</p>}
                          {order.invoiceDraftedAt && <p className="text-xs text-slate-500">Invoice email draft prepared {new Date(order.invoiceDraftedAt).toLocaleString()}</p>}
                          {order.paymentConfirmedAt && <p className="text-xs font-medium text-emerald-700">Transfer verified {new Date(order.paymentConfirmedAt).toLocaleString()}</p>}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {order.customerEmail && !order.quoteConfirmedAt && (
                              <>
                                <button type="button" onClick={() => prepareQuoteEmail(order)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">Prepare quote email</button>
                                {order.quoteDraftedAt && <button type="button" onClick={() => recordQuoteConfirmation(order)} className="rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50">Record CONFIRM received</button>}
                              </>
                            )}
                            {order.quoteConfirmedAt && (
                              <>
                                <button type="button" onClick={() => downloadInvoiceDocument(order)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">Download invoice to attach</button>
                                <button type="button" onClick={() => prepareInvoiceEmail(order)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">Prepare invoice email</button>
                              </>
                            )}
                            {order.paymentStatus === "Awaiting Transfer" && <button type="button" onClick={() => confirmTransferReceived(order)} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800">Verify transfer received</button>}
                          </div>
                          {order.quoteConfirmedAt && <p className="mt-2 text-xs text-slate-500">Attach the downloaded invoice file to the email draft before sending.</p>}
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
                        <ShipmentPreview order={order} className="mt-3" />
                        <ShipmentAudit order={order} />
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
                          <th className="px-4 py-3 text-left font-semibold text-slate-600">Booked / Updated</th>
                          {role === "admin" && <th className="px-4 py-3 text-left font-semibold text-slate-600">Assign</th>}
                          <th className="px-4 py-3 text-left font-semibold text-slate-600">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={role === "admin" ? 6 : 5} className="px-4 py-8 text-center text-slate-500">
                              No bookings matched your search.
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((o, i) => (
                            <tr key={i}>
                              <td className="px-4 py-4 text-slate-900"><ShipmentPreview order={o} triggerLabel={o.id} className="border-0 bg-transparent px-0 py-0 text-sm text-blue-800 underline underline-offset-2 hover:bg-transparent" /></td>
                              <td className="px-4 py-4 text-slate-900">{o.route}</td>
                              <td className="px-4 py-4 text-slate-900">{o.pendingApproval ? "Pending Approval" : o.status}</td>
                              <td className="px-4 py-4 text-xs text-slate-600"><p>Booked: {o.createdAt ? new Date(o.createdAt).toLocaleString() : "Unavailable"}</p><p className="mt-1">Updated: {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "Unavailable"}</p></td>
                              {role === "admin" ? (
                                <td className="px-4 py-4 text-slate-900">
                                  <select
                                    value={o.assignedTo || "Unassigned"}
                                    onChange={(e) => requestHandoffConfirmation({ type: "assign", shipmentId: o.id, targetUsername: e.target.value })}
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
                            <ShipmentPreview order={o} className="mt-3" />
                            <ShipmentAudit order={o} />
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned to: {getSubadminLabel(o.assignedTo)}</p>
                            {o.pendingApproval && (
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Pending approval</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            {role === "subadmin" && o.pendingApproval ? (
                              <button
                                onClick={() => requestHandoffConfirmation({ type: "approve", shipmentId: o.id })}
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
                                onClick={() => requestHandoffConfirmation({ type: "forward", shipmentId: o.id, targetUsername: forwardTargets[o.id] || o.assignedTo || "Unassigned" })}
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
                    <Cooperate orders={visibleOrders} booking={booking} setBooking={setBooking} handleBook={handleBook} termsAccepted={termsAccepted} setTermsAccepted={setTermsAccepted} onViewTerms={() => navigateTo("terms")} />
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
