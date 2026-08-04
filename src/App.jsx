import { useState, useEffect, useMemo, useRef } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExchangeAlt,
  FaPaperPlane,
  FaPlane,
  FaRoute,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaTruckMoving,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import heroImage from "../imagery/skylog.jpeg";

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

const Field = ({ id, label, value, onChange, type = "text", placeholder = "", className = "", ...rest }) => (
  <label htmlFor={id} className="block text-sm">
    <div className="font-medium">{label}</div>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} mt-1 block w-full`}
      aria-label={label}
      {...rest}
    />
  </label>
);

const LoginForm = ({ onSubmit, submitText }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div className="mt-6 space-y-4">
      <Field
        id="login-user"
        label="Username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <Field
        id="login-pass"
        label="Password"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      />
      <button
        onClick={() => onSubmit({ user, pass })}
        className="w-full rounded-3xl bg-blue-700 px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-800"
      >
        {submitText}
      </button>
    </div>
  );
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

  const [booking, setBooking] = useState({ pickup: "", delivery: "", weight: "", contact: "" });
  const [recentBookingId, setRecentBookingId] = useState("");
  const [paymentStage, setPaymentStage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [clientRegistration, setClientRegistration] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [clientNotice, setClientNotice] = useState("");
  const [showClientRegistration, setShowClientRegistration] = useState(false);

  const [orders, setOrders] = useState([
    { id: "SB-2026-001", status: "In Flight", route: "PH → Lagos", assignedTo: "Unassigned", pendingApproval: false },
    { id: "SB-2026-002", status: "Delivered", route: "PH → Abuja", assignedTo: "Unassigned", pendingApproval: false },
    { id: "SB-2026-003", status: "At Airport", route: "PH → Lagos", assignedTo: "Unassigned", pendingApproval: false },
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
    navigateTo(account.role === "client" ? "client" : "admin", { require: [account.role] });
    setAdminTab("overview");
    setLogin({ user: "", pass: "" });
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

  // Navigation helper that enforces auth for pages that require roles
  const navigateTo = (targetPage, opts = {}) => {
    const { require = null } = opts;
    if (require && !requireRole(require)) {
      pushToast({ type: "error", message: "You do not have permission to access that page." });
      navigateTo("login");
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

  // Toast UI - simple absolute corner stack
  const ToastsUI = () => (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl p-3 text-sm shadow-lg ${t.type === 'error' ? 'bg-red-600 text-white' : t.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'}`}>
          {t.message}
        </div>
      ))}
    </div>
  );

  const trackPackage = () => {
    // Debounced lookup
    if (trackingDebounceRef.current) clearTimeout(trackingDebounceRef.current);
    trackingDebounceRef.current = setTimeout(() => {
      const found = orders.find((o) => o.id.toUpperCase() === trackingInput.toUpperCase());
      setTrackingResult(found ? `${found.status} — ${found.route}` : "Not Found ❌");
    }, 250);
  };

  // Small helpers for UI feedback
  const Field = ({ id, label, value, onChange, type = "text", placeholder = "", className = "", ...rest }) => (
    <label htmlFor={id} className="block text-sm">
      <div className="font-medium">{label}</div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${className} mt-1 block w-full`}
        aria-label={label}
        {...rest}
      />
    </label>
  );

  const handleBook = () => {
    // Basic validation with types
    if (!booking.pickup.trim() || !booking.delivery.trim() || !booking.weight.trim() || !booking.contact.trim()) {
      pushToast({ type: "error", message: "Please fill all booking fields" });
      return;
    }

    if (isNaN(Number(booking.weight)) || Number(booking.weight) <= 0) {
      pushToast({ type: "error", message: "Please enter a valid numeric weight" });
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
    setBooking({ pickup: "", delivery: "", weight: "", contact: "" });
    setPaymentStage(true);
    setTrackingInput(newId);
    setTrackingResult("Pending");
    pushToast({ type: "success", message: `Booking submitted! Your tracking ID is ${newId}` });
  };

  const handlePaymentDone = () => {
    setPaymentStage(false);
    navigateTo("track");
    window.open(`https://wa.me/2349056942355?text=Hello%20SkyBridge%20Logistics%2C%20I%20have%20completed%20payment%20for%20booking%20${recentBookingId}.`, "_blank", "noopener,noreferrer");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-emerald-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-800">
              SkyBridge Logistics
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
                  <button onClick={() => navigateTo("home")} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100 hover:text-blue-700">
              <FaPlane /> Home
            </button>
            <button onClick={() => navigateTo("track")} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100 hover:text-blue-700">
              <FaSearch /> Track
            </button>
            <button onClick={() => navigateTo("book")} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100 hover:text-blue-700">
              <FaPaperPlane /> Book
            </button>
            <button onClick={() => navigateTo("client")} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100 hover:text-blue-700">
              <FaUsers /> Client Portal
            </button>
            <button
              onClick={() => {
                if (role === "admin" || role === "subadmin") {
                  navigateTo("admin", { require: ["admin", "subadmin"] });
                } else {
                  navigateTo("login");
                }
              }}
              className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-slate-100 hover:text-blue-700"
            >
              <FaUserShield /> Admin
            </button>
            {role !== "guest" && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-slate-200"
              >
                <FaSignOutAlt /> Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        {page === "home" && (
          <>
            <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
                  <FaTruckMoving className="mr-2" />
                  Nigeria air cargo & express delivery
                </div>
                <div className="space-y-6">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                    Delivering speed and certainty across Nigerian skies.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    Skybridge Logistics is an air-integrated logistics company that enables same-day and next-day delivery across Nigerian cities using commercial flights. We operate an asset-light model, partnering with airlines like Air Peace and working within airport systems managed by Federal Airports Authority of Nigeria.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => navigateTo("track")}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/10 transition hover:bg-blue-800"
                    >
                      <FaSearch /> Track a shipment
                    </button>
                    <button
                      onClick={() => navigateTo("book")}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-400 hover:text-blue-700"
                    >
                      <FaPaperPlane /> Book delivery
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Network</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">PHC · LOS · ABJ</p>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Partners</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">Air Peace · FAAN</p>
                  </div>
                  <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Speed</p>
                    <p className="mt-3 text-3xl font-semibold text-slate-900">Same / next day</p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl">
                <img
                  src={heroImage}
                  alt="Skybridge Logistics branded cargo imagery"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950/10 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-6 py-6 text-white">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Skybridge Logistics</p>
                  <p className="mt-2 max-w-xs text-lg font-semibold">
                    Bridging distance, delivering speed with integrated airport logistics.
                  </p>
                </div>
              </div>
            </section>

            <section className="mt-14 grid gap-6 lg:grid-cols-4">
              {services.map((item, index) => {
                const icons = [FaPlane, FaRoute, FaSearch, FaBoxOpen];
                const Icon = icons[index];
                return (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                      <Icon />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  </div>
                );
              })}
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
          </>
        )}
        <ToastsUI />

        {page === "track" && (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:max-w-xl sm:mx-auto">
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
            <div className="mt-8 rounded-[1.75rem] bg-slate-50 p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 text-slate-700">
                <FaClipboardList />
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sample tracking IDs</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => setTrackingInput(order.id)}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-blue-900"
                  >
                    {order.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {page === "book" && (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:max-w-3xl sm:mx-auto">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-blue-700">Book a delivery</p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">Ready to ship with Skybridge?</h2>
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
                <p className="mt-3 text-xl font-semibold">09056942355</p>
                <p className="mt-2 text-slate-600">skybridgetechnologies.log@gmail.com</p>
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
                  <p className="text-sm text-slate-600">A WhatsApp message will be sent to our CRM line: 09056942355.</p>
                </div>
              </div>
            )}
            <div className="mt-6 text-center">
              <p className="text-slate-600 mb-4">Or use our detailed booking form:</p>
              <button
                onClick={() => window.open('https://forms.google.com/', '_blank')}
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

        {page === "client" && role !== "client" && (
          <div className="rounded-[2rem] bg-white p-10 shadow-xl ring-1 ring-slate-200 sm:max-w-md sm:mx-auto">
            <div className="flex items-center gap-2 text-blue-700">
              <FaUsers />
              <h2 className="text-2xl font-semibold text-slate-900">Corporate Client Portal</h2>
            </div>
            <p className="mt-2 text-slate-600">Login to book shipments and track your corporate cargo.</p>
            {!showClientRegistration ? (
              <div className="mt-6 space-y-4">
                <LoginForm onSubmit={handleLogin} submitText="Enter Portal" />
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
                    <h2 className="text-3xl font-semibold text-slate-900">{role === "admin" ? "Admin" : "Sub-admin"} Dashboard</h2>
                    <p className="mt-2 text-slate-600">Manage workflow, assign tasks, and forward shipments.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "overview", label: "Overview", icon: FaClipboardList },
                    ...(role === "admin" ? [{ key: "profiles", label: "Sub-admin Profiles", icon: FaUsers }] : []),
                    { key: "workflow", label: "Workflow", icon: FaExchangeAlt },
                    { key: "forwarding", label: "Shipment Forwarding", icon: FaRoute },
                  ].map((tab) => {
                    const Icon = tab.icon;
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

            {adminTab === "overview" && (
              <>
                <div className="grid gap-6 lg:grid-cols-4">
                  <Card title="Total" value={currentOverviewOrders.length} icon={FaBoxOpen} accent="from-blue-500 to-cyan-500" />
                  <Card title="Delivered" value={currentOverviewOrders.filter((o) => o.status === "Delivered").length} icon={FaCheckCircle} accent="from-emerald-500 to-green-400" />
                  <Card title="In Transit" value={currentOverviewOrders.filter((o) => o.status === "In Flight").length} icon={FaPlane} accent="from-sky-500 to-blue-500" />
                  <Card title="Pending" value={currentOverviewOrders.filter((o) => o.status === "Pending" || o.pendingApproval).length} icon={FaClock} accent="from-amber-500 to-orange-400" />
                </div>
                {role === "subadmin" && (
                  <div className="rounded-[2rem] bg-white p-6 shadow-xl ring-1 ring-slate-200">
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
                  </div>
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
                                  <p className="text-sm text-slate-600">{account.role === "admin" ? "Administrator" : "Sub-admin"}</p>
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
          </div>
        )}
      </main>
    </div>
  );
}

function Card({ title, value, icon: Icon, accent }) {
  return (
    <div className={`rounded-[1.75rem] bg-gradient-to-br ${accent} p-[1px] shadow-sm`}>
      <div className="rounded-[calc(1.75rem-1px)] bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{title}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
          {Icon && (
            <div className="rounded-2xl bg-slate-100 p-3 text-blue-700">
              <Icon />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
