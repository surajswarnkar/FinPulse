import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Trash2,
  Edit3,
  Search,
  Filter,
  PieChart as PieChartIcon,
  BarChart3,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Tag,
  FileSpreadsheet,
  RefreshCw,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  User,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Server,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  DollarSign,
  Briefcase,
  ShoppingBag,
  Home,
  Utensils,
  Car,
  Zap,
  HeartPulse,
  Laptop,
  Gift,
  Menu
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

const DEFAULT_API_CONFIG = {
  baseUrl: 'https://finpulse-gm1n.onrender.com',
  endpoints: {
    login: '/api/users/login',
    register: '/api/users/register',
    profile: '/api/users/me',
    updateProfile: '/api/users/profile',
    updatePassword: '/api/users/password',
    deleteUser: '/api/users/delete',
    dashboard: '/api/dashboard',
    getIncome: '/api/income/get',
    addIncome: '/api/income/add',
    deleteIncome: '/api/income/delete',
    downloadIncome: '/api/income/download-excel',
    getExpense: '/api/expense/get',
    addExpense: '/api/expense/add',
    deleteExpense: '/api/expense/delete',
    downloadExpense: '/api/expense/download-excel'
  }
};

const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Investments',
  'Business',
  'Bonus',
  'Consulting',
  'Dividends',
  'Rental',
  'Other'
];

const EXPENSE_CATEGORIES = [
  'Food',
  'Housing',
  'Transport',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Other'
];

const CATEGORY_COLORS = {
  Freelancing: '#10b981',
  Salary: '#059669',
  Consulting: '#34d399',
  Investments: '#0ea5e9',
  Dividends: '#6366f1',
  Business: '#14b8a6',
  Rental: '#8b5cf6',
  Bonus: '#2dd4bf',
  Food: '#f97316',
  Housing: '#e11d48',
  'Software & Cloud': '#f43f5e',
  'Food & Dining': '#f97316',
  'Housing & Rent': '#e11d48',
  Transport: '#eab308',
  Utilities: '#06b6d4',
  'Utilities & Bills': '#06b6d4',
  Shopping: '#ec4899',
  Healthcare: '#14b8a6',
  Entertainment: '#a855f7',
  Education: '#3b82f6',
  Other: '#64748b'
};

const INITIAL_INCOMES = [];
const INITIAL_EXPENSES = [];

const CURRENCIES = {
  INR: { symbol: '₹', code: 'INR', locale: 'en-IN' },
  USD: { symbol: '$', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' }
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildApiUrl(baseUrl, endpointPath) {
  const cleanBase = String(
  baseUrl || 'https://finpulse-gm1n.onrender.com'
).replace(/\/+$/, '');
  const cleanPath = String(endpointPath || '').startsWith('/') ? endpointPath : `/${endpointPath}`;
  return `${cleanBase}${cleanPath}`;
}

function extractArrayFromResponse(json) {
  if (!json) return null;
  if (Array.isArray(json)) return json;
  for (const key of ['data', 'income', 'incomes', 'expense', 'expenses', 'transactions', 'records', 'items', 'allIncome', 'allExpense']) {
    if (Array.isArray(json[key])) return json[key];
  }
  if (json.data && typeof json.data === 'object') {
    for (const key of Object.keys(json.data)) {
      if (Array.isArray(json.data[key])) return json.data[key];
    }
  }
  for (const key of Object.keys(json)) {
    if (Array.isArray(json[key])) return json[key];
  }
  return null;
}

function safeStorageGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Ignore storage quota / sandbox restrictions
  }
}

function safeStorageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    // Ignore storage error
  }
}

function getTodayIso() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getYesterdayIso() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeDateInput(dateStr) {
  if (!dateStr) return getTodayIso();
  const s = String(dateStr).trim();
  const dmyMatch = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    return s.slice(0, 10);
  }
  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return getTodayIso();
}

function formatDisplayDate(dateStr, formatStyle = 'medium') {
  const iso = normalizeDateInput(dateStr);
  const [y, m, d] = iso.split('-');
  if (formatStyle === 'dmy') {
    return `${d}/${m}/${y}`;
  }
  if (formatStyle === 'excel') {
    return `${d}-${m}-${y}`;
  }
  const dateObj = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(dateObj.getTime())) return iso;
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function hasUppercase(str) {
  return /[A-Z]/.test(String(str || ''));
}

function isValidLowercaseEmail(email) {
  const clean = String(email || '').trim();
  if (!clean || hasUppercase(clean)) return false;
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(clean);
}

function getCategoryIcon(category) {
  switch (category) {
    case 'Freelancing':
    case 'Consulting':
      return Laptop;
    case 'Salary':
    case 'Business':
    case 'Bonus':
      return Briefcase;
    case 'Investments':
    case 'Dividends':
      return TrendingUp;
    case 'Housing':
    case 'Housing & Rent':
    case 'Rental':
      return Home;
    case 'Food':
    case 'Food & Dining':
      return Utensils;
    case 'Transport':
      return Car;
    case 'Utilities':
    case 'Utilities & Bills':
      return Zap;
    case 'Shopping':
      return ShoppingBag;
    case 'Healthcare':
      return HeartPulse;
    case 'Software & Cloud':
      return Server;
    default:
      return Gift;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyCode, setCurrencyCode] = useState(() => safeStorageGet('et_currency', 'INR'));

  // Auth & Persistent Per-User Account Registry
  const [user, setUser] = useState(() => safeStorageGet('et_clean_user', null));
  const [accountsDb, setAccountsDb] = useState(() => safeStorageGet('et_accounts_db_v2', {}));
  const [deletedEmails, setDeletedEmails] = useState(() => safeStorageGet('et_deleted_emails_v2', []));

  const [apiConfig, setApiConfig] = useState(() =>
    safeStorageGet('et_api_config', DEFAULT_API_CONFIG)
  );
  const [connectionStatus, setConnectionStatus] = useState('demo');
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [apiLogs, setApiLogs] = useState([]);

  const logApiCall = useCallback((method, path, status, detail) => {
    setApiLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        method,
        path,
        status,
        detail
      },
      ...prev.slice(0, 14)
    ]);
  }, []);

  // Transactions State
  const [incomes, setIncomes] = useState(() =>
    safeStorageGet('et_clean_incomes', INITIAL_INCOMES)
  );
  const [expenses, setExpenses] = useState(() =>
    safeStorageGet('et_clean_expenses', INITIAL_EXPENSES)
  );
  const [monthlyBudget, setMonthlyBudget] = useState(() =>
    safeStorageGet('et_clean_budget', 0)
  );

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [timeframeFilter, setTimeframeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Interactive Calendar Popup State inside Add/Edit Modal
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarView, setCalendarView] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Modals State
  const [txModal, setTxModal] = useState({
    open: false,
    type: 'income',
    editingId: null,
    description: '',
    amount: '',
    category: 'Salary',
    date: getTodayIso()
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = 'success') => {
    setToast({ message, variant, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // Sync profileForm only when logged-in user's name or email value changes
  useEffect(() => {
    if (user?.email) {
      setProfileForm({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user?.name, user?.email]);

  // Persist accountsDb and deletedEmails
  useEffect(() => {
    safeStorageSet('et_accounts_db_v2', accountsDb);
  }, [accountsDb]);

  useEffect(() => {
    safeStorageSet('et_deleted_emails_v2', deletedEmails);
  }, [deletedEmails]);

  // Persist current user's transactions both to active keys and per-user account store
  useEffect(() => {
    safeStorageSet('et_clean_incomes', incomes);
    if (user?.email) {
      setAccountsDb((prev) => {
        const existing = prev[user.email] || { email: user.email, name: user.name };
        return {
          ...prev,
          [user.email]: { ...existing, incomes }
        };
      });
    }
  }, [incomes, user?.email, user?.name]);

  useEffect(() => {
    safeStorageSet('et_clean_expenses', expenses);
    if (user?.email) {
      setAccountsDb((prev) => {
        const existing = prev[user.email] || { email: user.email, name: user.name };
        return {
          ...prev,
          [user.email]: { ...existing, expenses }
        };
      });
    }
  }, [expenses, user?.email, user?.name]);

  useEffect(() => {
    safeStorageSet('et_currency', currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    safeStorageSet('et_clean_budget', monthlyBudget);
    if (user?.email) {
      setAccountsDb((prev) => {
        const existing = prev[user.email] || { email: user.email, name: user.name };
        return {
          ...prev,
          [user.email]: { ...existing, monthlyBudget }
        };
      });
    }
  }, [monthlyBudget, user?.email, user?.name]);

  useEffect(() => {
    safeStorageSet('et_clean_user', user);
  }, [user]);

  useEffect(() => {
    safeStorageSet('et_api_config', apiConfig);
  }, [apiConfig]);

  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;

  const formatMoney = useCallback(
    (value) => {
      const num = Number(value) || 0;
      return `${currency.symbol}${num.toLocaleString(currency.locale, {
        maximumFractionDigits: 0
      })}`;
    },
    [currency]
  );

  const formatAxisMoney = useCallback(
    (value) => {
      const num = Math.abs(Number(value) || 0);
      const sign = Number(value) < 0 ? '-' : '';
      if (currency.code === 'INR') {
        if (num >= 10000000) {
          const cr = num / 10000000;
          return `${sign}${currency.symbol}${cr >= 100 ? Math.round(cr) : Number(cr.toFixed(1))}Cr`;
        }
        if (num >= 100000) {
          const lk = num / 100000;
          return `${sign}${currency.symbol}${lk >= 100 ? Math.round(lk) : Number(lk.toFixed(1))}L`;
        }
      } else {
        if (num >= 1000000000) {
          return `${sign}${currency.symbol}${Number((num / 1000000000).toFixed(1))}B`;
        }
        if (num >= 1000000) {
          return `${sign}${currency.symbol}${Number((num / 1000000).toFixed(1))}M`;
        }
      }
      if (num >= 1000) {
        return `${sign}${currency.symbol}${Number((num / 1000).toFixed(1))}k`;
      }
      return `${sign}${currency.symbol}${num}`;
    },
    [currency]
  );

  const getCardAmountClass = useCallback(
    (value) => {
      const formatted = formatMoney(value);
      const len = formatted.length;
      if (len > 18) return 'text-sm sm:text-base';
      if (len > 14) return 'text-base sm:text-lg';
      if (len > 11) return 'text-lg sm:text-xl';
      return 'text-2xl sm:text-3xl';
    },
    [formatMoney]
  );

  // Sync user profile + transactions with Express backend on http://localhost:4000
  const syncWithBackend = useCallback(
    async (silent = false, customToken = null) => {
      const activeToken = customToken || user?.token;
      if (!silent) setConnectionStatus('checking');
      const headers = { 'Content-Type': 'application/json' };
      if (activeToken && activeToken !== 'local-session-token') {
        headers.Authorization = `Bearer ${activeToken}`;
        headers.token = activeToken;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2200);

        const healthRes = await fetch(buildApiUrl(apiConfig.baseUrl, '/'), {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!healthRes.ok) throw new Error('Backend unreachable');

        // 1. Fetch latest user profile from /api/users/me if token is present
        if (activeToken && activeToken !== 'local-session-token') {
          for (const mePath of [apiConfig.endpoints.profile, '/api/users/me', '/api/user/me']) {
            try {
              const meRes = await fetch(buildApiUrl(apiConfig.baseUrl, mePath), { headers });
              const meJson = await meRes.json().catch(() => null);
              if (meRes.ok && meJson && meJson.success !== false) {
                const uData = meJson.user || meJson.data || meJson;
                if (uData?.email && uData?.name) {
                  setUser((prev) => {
                    if (!prev) return prev;
                    const nextId = uData._id || uData.id || prev._id;
                    const nextName = uData.name;
                    const nextEmail = String(uData.email).toLowerCase();
                    if (prev._id === nextId && prev.name === nextName && prev.email === nextEmail) {
                      return prev;
                    }
                    return {
                      ...prev,
                      _id: nextId,
                      name: nextName,
                      email: nextEmail
                    };
                  });
                  break;
                }
              }
            } catch (e) {
              // continue
            }
          }
        }

        // 2. Fetch income & expense lists
        const fetchList = async (candidatePaths) => {
          for (const path of candidatePaths) {
            try {
              const r = await fetch(buildApiUrl(apiConfig.baseUrl, path), { headers });
              const json = await r.json().catch(() => null);
              logApiCall('GET', path, r.status, json?.message || (r.ok ? 'OK' : 'Failed'));
              if (r.ok && json && json.success !== false) {
                const arr = extractArrayFromResponse(json);
                if (arr) return arr;
              }
            } catch (err) {
              // continue
            }
          }
          return null;
        };

        const [remoteIncomes, remoteExpenses] = await Promise.all([
          fetchList(['/api/income/get']),
          fetchList(['/api/expense/get'])
        ]);

        if (remoteIncomes) {
          setIncomes(
            remoteIncomes.map((item, idx) => ({
              _id: item._id || item.id || `inc-remote-${idx}`,
              description: item.description || item.title || item.source || 'Income',
              amount: Number(item.amount) || 0,
              category: item.category || item.source || 'Other',
              date: normalizeDateInput(item.date || item.createdAt)
            }))
          );
        }

        if (remoteExpenses) {
          setExpenses(
            remoteExpenses.map((item, idx) => ({
              _id: item._id || item.id || `exp-remote-${idx}`,
              description: item.description || item.title || item.category || 'Expense',
              amount: Number(item.amount) || 0,
              category: item.category || 'Other',
              date: normalizeDateInput(item.date || item.createdAt)
            }))
          );
        }

        setConnectionStatus('connected');
        setLastSyncTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
        if (!silent) {
          showToast('Data synced successfully.');
        }
      } catch (err) {
        setConnectionStatus('demo');
        if (!silent) {
          showToast('Up to date.');
        }
      }
    },
    [apiConfig, user?.token, showToast, logApiCall]
  );

  useEffect(() => {
    if (user?.token) {
      syncWithBackend(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token]);

  // Derived Totals & Metrics
  const metrics = useMemo(() => {
    const totalIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const balance = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;

    const refDate = new Date(`${getTodayIso()}T00:00:00`);
    const withinDays = (dateStr, days) => {
      const d = new Date(`${normalizeDateInput(dateStr)}T00:00:00`);
      const diff = (refDate - d) / (1000 * 60 * 60 * 24);
      return diff >= -365 && diff <= days;
    };

    const last30Expenses = expenses
      .filter((e) => withinDays(e.date, 30))
      .reduce((s, e) => s + Number(e.amount), 0);
    const last60Income = incomes
      .filter((i) => withinDays(i.date, 60))
      .reduce((s, i) => s + Number(i.amount), 0);

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      last30Expenses,
      last60Income
    };
  }, [incomes, expenses]);

  // Combined Transactions List
  const allTransactions = useMemo(() => {
    const taggedIncomes = incomes.map((i) => ({ ...i, type: 'income' }));
    const taggedExpenses = expenses.map((e) => ({ ...e, type: 'expense' }));
    return [...taggedIncomes, ...taggedExpenses].sort((a, b) =>
      normalizeDateInput(b.date).localeCompare(normalizeDateInput(a.date))
    );
  }, [incomes, expenses]);

  // Filtered list helper
  const getFilteredTransactions = useCallback(
    (sourceList) => {
      const refDate = new Date(`${getTodayIso()}T00:00:00`);
      return sourceList
        .filter((item) => {
          const matchesQuery =
            !searchQuery.trim() ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCategory =
            categoryFilter === 'All' || item.category === categoryFilter;
          let matchesTime = true;
          if (timeframeFilter === '30d' || timeframeFilter === '60d') {
            const days = timeframeFilter === '30d' ? 30 : 60;
            const d = new Date(`${normalizeDateInput(item.date)}T00:00:00`);
            const diff = (refDate - d) / (1000 * 60 * 60 * 24);
            matchesTime = diff >= -365 && diff <= days;
          }
          return matchesQuery && matchesCategory && matchesTime;
        })
        .sort((a, b) => {
          if (sortBy === 'date-desc') {
            return normalizeDateInput(b.date).localeCompare(normalizeDateInput(a.date));
          }
          if (sortBy === 'date-asc') {
            return normalizeDateInput(a.date).localeCompare(normalizeDateInput(b.date));
          }
          if (sortBy === 'amount-desc') {
            return Number(b.amount) - Number(a.amount);
          }
          if (sortBy === 'amount-asc') {
            return Number(a.amount) - Number(b.amount);
          }
          return 0;
        });
    },
    [searchQuery, categoryFilter, timeframeFilter, sortBy]
  );

  // Chart Data: Cashflow Timeline
  const cashflowTimelineData = useMemo(() => {
    const grouped = {};
    incomes.forEach((inc) => {
      const d = normalizeDateInput(inc.date);
      if (!grouped[d]) grouped[d] = { date: d, label: formatDisplayDate(d), income: 0, expense: 0 };
      grouped[d].income += Number(inc.amount) || 0;
    });
    expenses.forEach((exp) => {
      const d = normalizeDateInput(exp.date);
      if (!grouped[d]) grouped[d] = { date: d, label: formatDisplayDate(d), income: 0, expense: 0 };
      grouped[d].expense += Number(exp.amount) || 0;
    });
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [incomes, expenses]);

  // Chart Data: Category Breakdowns
  const expenseByCategoryData = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#f43f5e'
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const incomeByCategoryData = useMemo(() => {
    const map = {};
    incomes.forEach((i) => {
      map[i.category] = (map[i.category] || 0) + (Number(i.amount) || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || '#10b981'
      }))
      .sort((a, b) => b.value - a.value);
  }, [incomes]);

  // Calendar Grid Generator for the interactive Date Picker
  const calendarDays = useMemo(() => {
    const { year, month } = calendarView;
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i += 1) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({ day, iso });
    }
    return cells;
  }, [calendarView]);

  // Open Add/Edit Modal
  const openTransactionModal = (type, item = null) => {
    const initialDate = item ? normalizeDateInput(item.date) : getTodayIso();
    const [y, m] = initialDate.split('-').map(Number);
    setCalendarView({ year: y || new Date().getFullYear(), month: (m || 1) - 1 });
    setCalendarOpen(false);

    if (item) {
      setTxModal({
        open: true,
        type,
        editingId: item._id,
        description: item.description,
        amount: String(item.amount),
        category: item.category,
        date: initialDate
      });
    } else {
      setTxModal({
        open: true,
        type,
        editingId: null,
        description: '',
        amount: '',
        category: type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
        date: initialDate
      });
    }
  };

  // Save Income or Expense
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    const cleanDesc = txModal.description.trim();
    const numericAmount = Number(txModal.amount);
    const cleanDate = normalizeDateInput(txModal.date);

    if (!cleanDesc || Number.isNaN(numericAmount) || numericAmount <= 0) {
      showToast('Please enter a valid description and positive amount.', 'error');
      return;
    }
    if (cleanDate > getTodayIso()) {
      showToast('Future dates are not allowed. Please pick today or an earlier date.', 'error');
      return;
    }

    const payload = {
      description: cleanDesc,
      amount: numericAmount,
      category: txModal.category,
      date: cleanDate
    };

    const isIncome = txModal.type === 'income';

    if (user?.token && user.token !== 'local-session-token') {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
        token: user.token
      };
      const bodyPayload = {
        ...payload,
        title: payload.description,
        source: payload.category,
        ...(user?._id ? { userId: user._id } : {})
      };

      const candidateEndpoints = txModal.editingId
  ? isIncome
    ? [`/api/income/update/${txModal.editingId}`]
    : [`/api/expense/update/${txModal.editingId}`]
  : isIncome
    ? ['/api/income/add']
    : ['/api/expense/add'];

      for (const ep of candidateEndpoints) {
        try {
          const method = txModal.editingId ? 'PUT' : 'POST';
          const res = await fetch(buildApiUrl(apiConfig.baseUrl, ep), {
            method,
            headers,
            body: JSON.stringify(bodyPayload)
          });
          const saved = await res.json().catch(() => null);
          logApiCall(method, ep, res.status, saved?.message || (res.ok ? 'Saved to DB' : 'Failed'));

          if (res.ok && (!saved || saved.success !== false)) {
            const createdDoc = saved?.data || saved?.income || saved?.expense || saved || {};
            payload._id = createdDoc._id || createdDoc.id || txModal.editingId || `tx-${Date.now()}`;
            break;
          }
        } catch (err) {
          // try next candidate
        }
      }
    }

    if (txModal.editingId) {
      const updater = (prev) =>
        prev.map((item) =>
          item._id === txModal.editingId ? { ...item, ...payload } : item
        );
      if (isIncome) setIncomes(updater);
      else setExpenses(updater);
      showToast(`${isIncome ? 'Income' : 'Expense'} entry updated.`);
    } else {
      const newEntry = {
        _id: payload._id || `${isIncome ? 'inc' : 'exp'}-${Date.now()}`,
        ...payload
      };
      if (isIncome) setIncomes((prev) => [newEntry, ...prev]);
      else setExpenses((prev) => [newEntry, ...prev]);
      showToast(`Added ${formatMoney(numericAmount)} to ${isIncome ? 'Income' : 'Expenses'}.`);
    }

    setCalendarOpen(false);
    setTxModal((prev) => ({ ...prev, open: false }));
    if (user?.token && user.token !== 'local-session-token') {
      setTimeout(() => syncWithBackend(true), 150);
    }
  };

  // Delete Transaction from Backend + State
  const deleteRemoteTransaction = async (type, id) => {
    const isIncome = type === 'income';
    if (user?.token && user.token !== 'local-session-token') {
      const headers = {
        Authorization: `Bearer ${user.token}`,
        token: user.token
      };
      const delCandidates = isIncome
        ? [
            `${apiConfig.endpoints.deleteIncome}/${id}`,
            `/api/income/${id}`,
            `/api/income/delete-income/${id}`
          ]
        : [
            `${apiConfig.endpoints.deleteExpense}/${id}`,
            `/api/expense/${id}`,
            `/api/expense/delete-expense/${id}`
          ];
      for (const path of delCandidates) {
        try {
          const r = await fetch(buildApiUrl(apiConfig.baseUrl, path), {
            method: 'DELETE',
            headers
          });
          logApiCall('DELETE', path, r.status, r.ok ? 'Deleted from DB' : 'Failed');
          if (r.ok) break;
        } catch (err) {
          // try next candidate
        }
      }
    }
  };

  const handleDeleteTransaction = async (type, id) => {
    const isIncome = type === 'income';
    await deleteRemoteTransaction(type, id);

    if (isIncome) {
      setIncomes((prev) => prev.filter((item) => item._id !== id));
    } else {
      setExpenses((prev) => prev.filter((item) => item._id !== id));
    }
    showToast(`${isIncome ? 'Income' : 'Expense'} entry removed.`);
  };

  // Export Excel / CSV with guaranteed visible Date column
  const handleExportSpreadsheet = async (type) => {
    const isIncome = type === 'income';
    const rows = isIncome ? incomes : expenses;

    if (rows.length === 0) {
      showToast(`No ${isIncome ? 'income' : 'expense'} records to export yet.`, 'error');
      return;
    }

    const csvLines = [
      'description,amount,category,date',
      ...rows.map((r) => {
        const desc = String(r.description || '').replace(/"/g, '""');
        const amt = Number(r.amount) || 0;
        const cat = String(r.category || 'Other').replace(/"/g, '""');
        const dmyDate = formatDisplayDate(r.date || r.createdAt || getTodayIso(), 'dmy');
        return `"${desc}",${amt},"${cat}"," ${dmyDate}"`;
      })
    ];

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvLines.join('\r\n')], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = isIncome ? 'income_details.csv' : 'expense_details.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${rows.length} ${isIncome ? 'income' : 'expense'} records with dates.`);
  };

  // Auth Handler (/api/users) — Enforces lowercase-only email
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const rawEmail = String(authForm.email || '').trim();

    if (hasUppercase(rawEmail)) {
      showToast('Email must be in lowercase only (uppercase letters are not allowed).', 'error');
      return;
    }
    if (!isValidLowercaseEmail(rawEmail)) {
      showToast('Please enter a valid lowercase email address (e.g., user@example.com).', 'error');
      return;
    }
    if (authMode === 'register' && authForm.password.length < 8) {
      showToast('Password must be at least 8 characters long.', 'error');
      return;
    }

    if (authMode === 'login' && deletedEmails.includes(rawEmail)) {
      showToast('This user account was deleted. Please register a new account first.', 'error');
      return;
    }

    const candidateAuthPaths =
      authMode === 'login'
        ? [apiConfig.endpoints.login, '/api/users/login', '/api/user/login']
        : [apiConfig.endpoints.register, '/api/users/register', '/api/user/register'];

    let networkReachable = false;
    let lastBackendError = '';

    for (const endpoint of candidateAuthPaths) {
      try {
        const res = await fetch(buildApiUrl(apiConfig.baseUrl, endpoint), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: authForm.name.trim(),
            email: rawEmail,
            password: authForm.password
          })
        });
        networkReachable = true;
        const data = await res.json().catch(() => null);
        logApiCall('POST', endpoint, res.status, data?.message || (res.ok ? 'Auth OK' : 'Auth Failed'));

        if (res.ok && data && data.success !== false && (data.token || data.accessToken || data.jwt)) {
          const token = data.token || data.accessToken || data.jwt || '';
          const userObj = data.user || data.data || {};
          const savedLocalAccount = accountsDb[rawEmail];
          const profileName =
            userObj.name ||
            userObj.username ||
            savedLocalAccount?.name ||
            authForm.name.trim() ||
            rawEmail.split('@')[0];

          const newUserState = {
            _id: userObj._id || userObj.id || savedLocalAccount?._id || '',
            name: profileName,
            email: rawEmail,
            token
          };

          if (authMode === 'register' && deletedEmails.includes(rawEmail)) {
            setDeletedEmails((prev) => prev.filter((em) => em !== rawEmail));
          }

          setAccountsDb((prev) => ({
            ...prev,
            [rawEmail]: {
              ...(prev[rawEmail] || {}),
              _id: newUserState._id,
              name: profileName,
              email: rawEmail,
              password: authForm.password
            }
          }));

          setUser(newUserState);
          safeStorageSet('et_clean_user', newUserState);
          setIncomes(savedLocalAccount?.incomes || []);
          setExpenses(savedLocalAccount?.expenses || []);
          setConnectionStatus('connected');
          setAuthModalOpen(false);
          showToast(`Welcome, ${profileName}!`);
          setTimeout(() => syncWithBackend(true, token), 100);
          return;
        } else if (data?.message) {
          lastBackendError = data.message;
          if (res.status === 400 || res.status === 401 || res.status === 409) {
            break;
          }
        }
      } catch (err) {
        // Server not reachable on this URL
      }
    }

    if (networkReachable) {
      showToast(
        lastBackendError || 'Authentication failed. Please check your email and password.',
        'error'
      );
      return;
    }

    // Local / Offline Account Database handling
    const existingAccount = accountsDb[rawEmail];
    if (authMode === 'register') {
      if (existingAccount && !deletedEmails.includes(rawEmail)) {
        showToast('User already registered with this email. Please switch to Login.', 'error');
        return;
      }
      const cleanName = authForm.name.trim() || rawEmail.split('@')[0];
      const newAccount = {
        _id: `usr-${Date.now()}`,
        name: cleanName,
        email: rawEmail,
        password: authForm.password,
        incomes: [],
        expenses: [],
        monthlyBudget: 0
      };
      setDeletedEmails((prev) => prev.filter((em) => em !== rawEmail));
      setAccountsDb((prev) => ({ ...prev, [rawEmail]: newAccount }));
      const localUser = {
        _id: newAccount._id,
        name: cleanName,
        email: rawEmail,
        token: 'local-session-token'
      };
      setIncomes([]);
      setExpenses([]);
      setMonthlyBudget(0);
      setUser(localUser);
      safeStorageSet('et_clean_user', localUser);
      setAuthModalOpen(false);
      showToast(`Account created for ${cleanName}!`);
    } else {
      if (!existingAccount || deletedEmails.includes(rawEmail)) {
        showToast('Account not found. Please register first.', 'error');
        return;
      }
      if (existingAccount.password && existingAccount.password !== authForm.password) {
        showToast('Invalid email or password.', 'error');
        return;
      }
      const localUser = {
        _id: existingAccount._id || `usr-${Date.now()}`,
        name: existingAccount.name || rawEmail.split('@')[0],
        email: existingAccount.email,
        token: 'local-session-token'
      };
      setIncomes(existingAccount.incomes || []);
      setExpenses(existingAccount.expenses || []);
      setMonthlyBudget(existingAccount.monthlyBudget || 0);
      setUser(localUser);
      safeStorageSet('et_clean_user', localUser);
      setAuthModalOpen(false);
      showToast(`Welcome back, ${localUser.name}!`);
    }
  };

  // Update Profile Handler (PUT /api/users/profile) — Saves to DB & persists across logins
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const cleanName = profileForm.name.trim();
    const cleanEmail = String(profileForm.email || '').trim();

    if (!cleanName || !cleanEmail) {
      showToast('Name and email are required.', 'error');
      return;
    }
    if (hasUppercase(cleanEmail)) {
      showToast('Email must be in lowercase only (no uppercase letters).', 'error');
      return;
    }
    if (!isValidLowercaseEmail(cleanEmail)) {
      showToast('Please enter a valid lowercase email address.', 'error');
      return;
    }

    const oldEmail = user?.email;

    if (user?.token && user.token !== 'local-session-token') {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
        token: user.token
      };
      const profileCandidates = [
        apiConfig.endpoints.updateProfile || '/api/users/profile',
        '/api/user/profile',
        '/api/users/me',
        '/api/users/update-profile'
      ];
      for (const ep of profileCandidates) {
        try {
          const res = await fetch(buildApiUrl(apiConfig.baseUrl, ep), {
            method: 'PUT',
            headers,
            body: JSON.stringify({ name: cleanName, email: cleanEmail })
          });
          const data = await res.json().catch(() => null);
          logApiCall('PUT', ep, res.status, data?.message || (res.ok ? 'Profile Updated' : 'Failed'));
          if (res.ok && (!data || data.success !== false)) {
            break;
          } else if (res.status === 400 || res.status === 409) {
            showToast(data?.message || 'Could not update profile in database.', 'error');
            return;
          }
        } catch (err) {
          // try next candidate
        }
      }
    }

    // Update persistent accountsDb so next login uses the new name and email
    setAccountsDb((prev) => {
      const next = { ...prev };
      const oldRecord = (oldEmail && next[oldEmail]) || {};
      if (oldEmail && oldEmail !== cleanEmail) {
        delete next[oldEmail];
      }
      next[cleanEmail] = {
        ...oldRecord,
        _id: user?._id || oldRecord._id,
        name: cleanName,
        email: cleanEmail,
        incomes,
        expenses,
        monthlyBudget
      };
      return next;
    });

    const updated = { ...user, name: cleanName, email: cleanEmail };
    setUser(updated);
    safeStorageSet('et_clean_user', updated);
    showToast('Profile saved and updated in database.');
  };

  // Update Password Handler (PUT /api/users/password) — Saves to DB & persists across logins
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    if (user?.token && user.token !== 'local-session-token') {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
        token: user.token
      };
      const passCandidates = [
        apiConfig.endpoints.updatePassword || '/api/users/password',
        '/api/user/password',
        '/api/users/update-password'
      ];
      for (const ep of passCandidates) {
        try {
          const res = await fetch(buildApiUrl(apiConfig.baseUrl, ep), {
            method: 'PUT',
            headers,
            body: JSON.stringify({
              currentPassword: passwordForm.currentPassword,
              newPassword: passwordForm.newPassword
            })
          });
          const data = await res.json().catch(() => null);
          logApiCall('PUT', ep, res.status, data?.message || (res.ok ? 'Password Updated' : 'Failed'));
          if (res.ok && (!data || data.success !== false)) {
            break;
          } else if (res.status === 400 || res.status === 401) {
            showToast(data?.message || 'Current password is incorrect.', 'error');
            return;
          }
        } catch (err) {
          // continue
        }
      }
    }

    if (user?.email) {
      setAccountsDb((prev) => ({
        ...prev,
        [user.email]: {
          ...(prev[user.email] || {}),
          password: passwordForm.newPassword
        }
      }));
    }

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated in database.');
  };

  // Delete Existing User + All Their Income & Expense Data from MongoDB & Local Storage
  const handleDeleteUser = async () => {
    const targetEmail = user?.email;
    const removedName = user?.name || 'User';

    if (user?.token && user.token !== 'local-session-token') {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.token}`,
        token: user.token
      };

      // Step 1: Fetch latest incomes and expenses directly from MongoDB so we have every real MongoDB _id
      const fetchRealIds = async (paths) => {
        for (const p of paths) {
          try {
            const r = await fetch(buildApiUrl(apiConfig.baseUrl, p), { headers });
            const j = await r.json().catch(() => null);
            if (r.ok && j && j.success !== false) {
              const arr = extractArrayFromResponse(j);
              if (arr) return arr.map((item) => item._id || item.id).filter(Boolean);
            }
          } catch (e) {
            // continue
          }
        }
        return [];
      };

      const [dbIncomeIds, dbExpenseIds] = await Promise.all([
        fetchRealIds([
          apiConfig.endpoints.getIncome,
          '/api/income',
          '/api/income/all',
          '/api/income/get-income',
          '/api/income/overview'
        ]),
        fetchRealIds([
          apiConfig.endpoints.getExpense,
          '/api/expense',
          '/api/expense/all',
          '/api/expense/get-expense',
          '/api/expense/overview'
        ])
      ]);

      const allIncomeIds = Array.from(
        new Set([...dbIncomeIds, ...incomes.map((i) => i._id).filter(Boolean)])
      );
      const allExpenseIds = Array.from(
        new Set([...dbExpenseIds, ...expenses.map((e) => e._id).filter(Boolean)])
      );

      // Step 2: Delete every single income and expense record from MongoDB BEFORE deleting the user
      await Promise.allSettled([
        ...allIncomeIds.map((id) => deleteRemoteTransaction('income', id)),
        ...allExpenseIds.map((id) => deleteRemoteTransaction('expense', id))
      ]);

      // Also call bulk delete endpoints in case backend supports them
      for (const bulkEp of ['/api/income/delete-all', '/api/income/all', '/api/expense/delete-all', '/api/expense/all']) {
        try {
          await fetch(buildApiUrl(apiConfig.baseUrl, bulkEp), { method: 'DELETE', headers });
        } catch (e) {
          // ignore
        }
      }

      // Step 3: Now delete the user document itself from MongoDB
      for (const delEp of [
        apiConfig.endpoints.deleteUser || '/api/users/delete',
        '/api/user/delete',
        '/api/users/me',
        '/api/users/profile',
        ...(user?._id ? [`/api/users/${user._id}`, `/api/user/${user._id}`] : [])
      ]) {
        try {
          const r = await fetch(buildApiUrl(apiConfig.baseUrl, delEp), {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ email: targetEmail, userId: user?._id, deleteAllData: true })
          });
          if (r.ok) {
            break;
          }
        } catch (e) {
          // continue
        }
      }
    }

    if (targetEmail) {
      setDeletedEmails((prev) =>
        prev.includes(targetEmail) ? prev : [...prev, targetEmail]
      );
      setAccountsDb((prev) => {
        const next = { ...prev };
        delete next[targetEmail];
        return next;
      });
    }

    setIncomes([]);
    setExpenses([]);
    setMonthlyBudget(0);
    safeStorageRemove('et_clean_user');
    safeStorageRemove('et_clean_incomes');
    safeStorageRemove('et_clean_expenses');
    safeStorageRemove('et_clean_budget');

    setUser(null);
    setAuthForm({ name: '', email: '', password: '' });
    setAuthMode('register');
    setAuthModalOpen(false);
    showToast(`Deleted user "${removedName}" and all associated database records.`);
  };

  const handleLogout = () => {
    safeStorageRemove('et_clean_user');
    setUser(null);
    setAuthForm({ name: '', email: '', password: '' });
    setAuthMode('login');
    setMobileMenuOpen(false);
    showToast('Logged out successfully.');
  };

  const budgetUsagePercent =
    monthlyBudget > 0
      ? Math.min(100, Math.round((metrics.totalExpense / monthlyBudget) * 100))
      : 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expense', label: 'Expenses', icon: TrendingDown },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-200 bg-slate-900/95 border-slate-700/80 text-slate-100 max-w-md">
          {toast.variant === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-200 ml-1"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Full-Screen Login / Register Gate when user is not signed in */}
      {!user ? (
        <div className="flex-1 min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30">
          <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-3">
                <Wallet className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                FinPulse
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {authMode === 'login'
                  ? 'Sign in to access your personal expense tracker'
                  : 'Create an account to start tracking your finances'}
              </p>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${
                  authMode === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${
                  authMode === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none ${
                    hasUppercase(authForm.email)
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-800 focus:border-emerald-500'
                  }`}
                />
                {hasUppercase(authForm.email) && (
                  <div className="flex items-center justify-between mt-1.5 text-xs text-rose-400">
                    <span>Uppercase letters are not allowed in email.</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAuthForm((prev) => ({
                          ...prev,
                          email: prev.email.toLowerCase()
                        }))
                      }
                      className="underline font-semibold hover:text-rose-300"
                    >
                      Make lowercase
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="Minimum 8 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition mt-2"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* Left Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:flex lg:w-72 lg:flex-col bg-slate-900/70 border-r border-slate-800/80 p-6 shrink-0 justify-between">
            <div>
              {/* Brand Logo */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Wallet className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                    FinPulse
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Personal Finance</p>
                </div>
              </div>

              {/* User Profile Card */}
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-6 flex items-center justify-between">
                <div
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-3 min-w-0 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-semibold text-sm shrink-0">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-100 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{user?.email || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
                    title="Switch Account / Login"
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete User & Database Records"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Primary Nav */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setCategoryFilter('All');
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        />
                        {item.label}
                      </span>
                      {isActive && <ChevronRight className="w-4 h-4 text-emerald-400" />}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Add Actions */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Quick Actions
                </p>
                <button
                  type="button"
                  onClick={() => openTransactionModal('income')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Add Income
                </button>
                <button
                  type="button"
                  onClick={() => openTransactionModal('expense')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-semibold text-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Expense
                </button>
              </div>
            </div>

            {/* Minimal Footer Controls */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => syncWithBackend(false)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync
              </button>
              <button
                type="button"
                onClick={() => setApiModalOpen(true)}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition"
                title="Settings"
              >
                <Settings className="w-3.5 h-3.5" />
                Config
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Sticky Top Header (Contains BOTH Navbar & Mobile Dropdown Dialog Bar so they scroll together!) */}
            <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80">
              <div className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* 3-Lines Mobile Menu Button */}
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0"
                    aria-label="Toggle Navigation"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  {/* Website Logo & Name Visible on Mobile Top-Left Corner */}
                  <div className="flex items-center gap-2.5 lg:hidden shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <Wallet className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                    </div>
                    <span className="text-base font-bold tracking-tight text-white">
                      FinPulse
                    </span>
                  </div>

                  {/* Current Section Title */}
                  <div className="hidden sm:block lg:block pl-1 lg:pl-0 border-l border-slate-800 lg:border-none">
                    <h2 className="text-base sm:text-xl font-bold text-white capitalize truncate">
                      {`${activeTab} Overview`}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Currency Selector */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
                    {Object.keys(CURRENCIES).map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setCurrencyCode(code)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                          currencyCode === code
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {CURRENCIES[code].symbol}
                      </button>
                    ))}
                  </div>

                  {/* Export Excel Button */}
                  <button
                    type="button"
                    onClick={() =>
                      handleExportSpreadsheet(activeTab === 'expense' ? 'expense' : 'income')
                    }
                    className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Export {activeTab === 'expense' ? 'Expenses' : 'Income'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition"
                    title="Profile"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="hidden md:inline">{user?.name}</span>
                  </button>
                </div>
              </div>

              {/* Mobile Navigation Dialog Bar — Inside Sticky Header so it moves with Navbar when scrolling up or down */}
              {mobileMenuOpen && (
                <div className="lg:hidden bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 py-3 space-y-3 shadow-2xl">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                            active
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        openTransactionModal('income');
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-xs text-center"
                    >
                      + Add Income
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openTransactionModal('expense');
                        setMobileMenuOpen(false);
                      }}
                      className="flex-1 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs text-center"
                    >
                      + Add Expense
                    </button>
                  </div>
                </div>
              )}
            </header>

            {/* Main Body */}
            <main className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
              {/* Top Summary Stat Cards (Dashboard) */}
              {activeTab === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Net Balance */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800/90 shadow-lg overflow-hidden min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                          Total Balance
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                          <Wallet className="w-4 h-4" />
                        </div>
                      </div>
                      <p
                        title={formatMoney(metrics.balance)}
                        className={`${getCardAmountClass(metrics.balance)} font-bold text-white tracking-tight truncate`}
                      >
                        {formatMoney(metrics.balance)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                        <span className="text-emerald-400 font-medium flex items-center gap-1 truncate">
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                          {metrics.savingsRate}% Savings Rate
                        </span>
                        <span className="text-slate-400 shrink-0">Net Cashflow</span>
                      </div>
                    </div>

                    {/* Total Income */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg overflow-hidden min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                          Total Income
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <p
                        title={formatMoney(metrics.totalIncome)}
                        className={`${getCardAmountClass(metrics.totalIncome)} font-bold text-emerald-400 tracking-tight truncate`}
                      >
                        {formatMoney(metrics.totalIncome)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300 font-medium">
                          {incomes.length} records
                        </span>
                        <button
                          type="button"
                          onClick={() => openTransactionModal('income')}
                          className="text-emerald-400 hover:underline font-medium shrink-0"
                        >
                          + Add new
                        </button>
                      </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg overflow-hidden min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                          Total Expenses
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                      </div>
                      <p
                        title={formatMoney(metrics.totalExpense)}
                        className={`${getCardAmountClass(metrics.totalExpense)} font-bold text-rose-400 tracking-tight truncate`}
                      >
                        {formatMoney(metrics.totalExpense)}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-300 font-medium">
                          {expenses.length} records
                        </span>
                        <button
                          type="button"
                          onClick={() => openTransactionModal('expense')}
                          className="text-rose-400 hover:underline font-medium shrink-0"
                        >
                          + Add new
                        </button>
                      </div>
                    </div>

                    {/* Monthly Budget Target */}
                    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg overflow-hidden min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                          Monthly Budget
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setBudgetInput(String(monthlyBudget));
                            setBudgetModalOpen(true);
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 shrink-0"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                      <div className="flex items-baseline justify-between gap-2 min-w-0">
                        <p
                          title={`${formatMoney(metrics.totalExpense)} / ${formatMoney(monthlyBudget)}`}
                          className="text-base sm:text-lg font-bold text-white truncate min-w-0"
                        >
                          {formatMoney(metrics.totalExpense)}{' '}
                          <span className="text-xs font-normal text-slate-400">
                            / {formatMoney(monthlyBudget)}
                          </span>
                        </p>
                        <span
                          className={`text-xs font-bold shrink-0 ${
                            budgetUsagePercent > 85 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {budgetUsagePercent}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            budgetUsagePercent > 85
                              ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${budgetUsagePercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 truncate">
                        {monthlyBudget - metrics.totalExpense >= 0
                          ? `${formatMoney(monthlyBudget - metrics.totalExpense)} remaining in budget`
                          : `${formatMoney(metrics.totalExpense - monthlyBudget)} over budget`}
                      </p>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cash Flow Area Chart */}
                    <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                        <div>
                          <h3 className="text-base font-bold text-white">
                            Income vs. Expense Cashflow
                          </h3>
                          <p className="text-xs text-slate-400">
                            Chronological breakdown across recorded dates
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            Income
                          </span>
                          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            Expense
                          </span>
                        </div>
                      </div>
                      <div className="relative h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={cashflowTimelineData}>
                            <defs>
                              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis
                              dataKey="label"
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                            />
                            <YAxis
                              width={68}
                              stroke="#64748b"
                              fontSize={11}
                              tickLine={false}
                              tickFormatter={(v) => formatAxisMoney(v)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '12px',
                                color: '#f8fafc'
                              }}
                              formatter={(value) => formatMoney(value)}
                            />
                            <Area
                              type="monotone"
                              dataKey="income"
                              name="Income"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#incomeGrad)"
                            />
                            <Area
                              type="monotone"
                              dataKey="expense"
                              name="Expense"
                              stroke="#f43f5e"
                              strokeWidth={2.5}
                              fillOpacity={1}
                              fill="url(#expenseGrad)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Expense Breakdown Donut */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Expense Distribution
                        </h3>
                        <p className="text-xs text-slate-400">
                          Spending share by category
                        </p>
                      </div>
                      <div className="relative h-56 w-full my-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseByCategoryData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={52}
                              outerRadius={80}
                              paddingAngle={3}
                            >
                              {expenseByCategoryData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '12px',
                                color: '#f8fafc'
                              }}
                              formatter={(value) => formatMoney(value)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {expenseByCategoryData.slice(0, 4).map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="flex items-center gap-2 text-slate-300 truncate">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              {item.name}
                            </span>
                            <span className="font-semibold text-slate-100">
                              {formatMoney(item.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Transactions Section */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          Recent Transactions
                        </h3>
                        <p className="text-xs text-slate-400">
                          Your latest income and expense activity
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('income')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-emerald-300 transition"
                        >
                          View All Income
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('expense')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-rose-300 transition"
                        >
                          View All Expenses
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {allTransactions.length === 0 && (
                        <div className="py-10 text-center text-sm text-slate-400">
                          No transactions added yet. Use <strong>Add Income</strong> or <strong>Add Expense</strong> to record your first entry.
                        </div>
                      )}
                      {allTransactions.slice(0, 7).map((tx) => {
                        const Icon = getCategoryIcon(tx.category);
                        const isInc = tx.type === 'income';
                        return (
                          <div
                            key={tx._id}
                            className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-800/30 px-3 -mx-3 rounded-xl transition"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                  isInc
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">
                                  {tx.description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                                    {tx.category}
                                  </span>
                                  <span>•</span>
                                  <span>{formatDisplayDate(tx.date, 'dmy')}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span
                                className={`text-sm sm:text-base font-bold ${
                                  isInc ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {isInc ? '+' : '-'}
                                {formatMoney(tx.amount)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openTransactionModal(tx.type, tx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTransaction(tx.type, tx._id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* INCOME OR EXPENSE DEDICATED VIEW */}
              {(activeTab === 'income' || activeTab === 'expense') && (
                <div className="space-y-6">
                  {/* Top Action & Metric Banner */}
                  <div
                    className={`p-6 rounded-2xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      activeTab === 'income'
                        ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/30'
                        : 'bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/30'
                    }`}
                  >
                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full mb-2 ${
                          activeTab === 'income'
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : 'bg-rose-500/15 text-rose-300'
                        }`}
                      >
                        {activeTab === 'income' ? (
                          <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5" />
                        )}
                        {activeTab === 'income' ? 'Income' : 'Expenses'}
                      </span>
                      <h3 className="text-xl sm:text-3xl font-bold text-white break-all">
                        {formatMoney(
                          activeTab === 'income' ? metrics.totalIncome : metrics.totalExpense
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {activeTab === 'income'
                          ? `${incomes.length} income sources recorded • Last 60 days: ${formatMoney(metrics.last60Income)}`
                          : `${expenses.length} expense items recorded • Last 30 days: ${formatMoney(metrics.last30Expenses)}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleExportSpreadsheet(activeTab)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 transition"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                        Export Excel
                      </button>
                      <button
                        type="button"
                        onClick={() => openTransactionModal(activeTab)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition ${
                          activeTab === 'income'
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                            : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                        }`}
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Add {activeTab === 'income' ? 'Income' : 'Expense'}
                      </button>
                    </div>
                  </div>

                  {/* Category Bar Chart */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                    <h4 className="text-sm font-bold text-white mb-1">
                      {activeTab === 'income'
                        ? 'Income Sources by Category'
                        : 'Expenses by Category'}
                    </h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Aggregated totals across categories
                    </p>
                    <div className="relative h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={
                            activeTab === 'income'
                              ? incomeByCategoryData
                              : expenseByCategoryData
                          }
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis
                            width={68}
                            stroke="#64748b"
                            fontSize={11}
                            tickLine={false}
                            tickFormatter={(v) => formatAxisMoney(v)}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#334155',
                              borderRadius: '12px',
                              color: '#f8fafc'
                            }}
                            formatter={(val) => formatMoney(val)}
                          />
                          <Bar
                            dataKey="value"
                            name="Amount"
                            radius={[8, 8, 0, 0]}
                            fill={activeTab === 'income' ? '#10b981' : '#f43f5e'}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search ${activeTab} description or category...`}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label="Filter by category"
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="All">All Categories</option>
                        {(activeTab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(
                          (cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          )
                        )}
                      </select>

                      <select
                        value={timeframeFilter}
                        onChange={(e) => setTimeframeFilter(e.target.value)}
                        aria-label="Filter by timeframe"
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="all">All Time</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="60d">Last 60 Days</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        aria-label="Sort records"
                        className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-desc">Highest Amount</option>
                        <option value="amount-asc">Lowest Amount</option>
                      </select>
                    </div>
                  </div>

                  {/* Transactions Table */}
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/50">
                            <th className="py-3.5 px-4">Description</th>
                            <th className="py-3.5 px-4">Category</th>
                            <th className="py-3.5 px-4">Date</th>
                            <th className="py-3.5 px-4 text-right">Amount</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/70 text-sm">
                          {getFilteredTransactions(
                            activeTab === 'income' ? incomes : expenses
                          ).map((item) => {
                            const Icon = getCategoryIcon(item.category);
                            return (
                              <tr
                                key={item._id}
                                className="hover:bg-slate-800/40 transition"
                              >
                                <td className="py-3.5 px-4 font-medium text-white">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        activeTab === 'income'
                                          ? 'bg-emerald-500/15 text-emerald-400'
                                          : 'bg-rose-500/15 text-rose-400'
                                      }`}
                                    >
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <span>{item.description}</span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-medium text-slate-300">
                                    {item.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 text-xs">
                                  {formatDisplayDate(item.date, 'dmy')}
                                </td>
                                <td
                                  className={`py-3.5 px-4 text-right font-bold ${
                                    activeTab === 'income'
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                  }`}
                                >
                                  {activeTab === 'income' ? '+' : '-'}
                                  {formatMoney(item.amount)}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => openTransactionModal(activeTab, item)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                                      title="Edit record"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteTransaction(activeTab, item._id)
                                      }
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                                      title="Delete record"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                          {getFilteredTransactions(
                            activeTab === 'income' ? incomes : expenses
                          ).length === 0 && (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-10 text-center text-slate-400 text-sm"
                              >
                                No matching {activeTab} records found. Click "Add{' '}
                                {activeTab === 'income' ? 'Income' : 'Expense'}" to create one.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ANALYTICS VIEW */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Income Pie */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                      <h3 className="text-base font-bold text-white mb-1">
                        Income Breakdown by Source
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Total: {formatMoney(metrics.totalIncome)}
                      </p>
                      <div className="relative h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeByCategoryData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                            >
                              {incomeByCategoryData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '12px',
                                color: '#f8fafc'
                              }}
                              formatter={(val) => formatMoney(val)}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Expense Pie */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                      <h3 className="text-base font-bold text-white mb-1">
                        Expense Breakdown by Category
                      </h3>
                      <p className="text-xs text-slate-400 mb-4">
                        Total: {formatMoney(metrics.totalExpense)}
                      </p>
                      <div className="relative h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseByCategoryData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={55}
                              outerRadius={85}
                              paddingAngle={3}
                            >
                              {expenseByCategoryData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                borderColor: '#334155',
                                borderRadius: '12px',
                                color: '#f8fafc'
                              }}
                              formatter={(val) => formatMoney(val)}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Clean Financial Summary Card */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                    <h3 className="text-base font-bold text-white mb-4">
                      Financial Health Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden min-w-0">
                        <span className="text-xs text-slate-400">Net Savings</span>
                        <p
                          title={formatMoney(metrics.balance)}
                          className="text-lg sm:text-xl font-bold text-emerald-400 mt-1 truncate"
                        >
                          {formatMoney(metrics.balance)}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden min-w-0">
                        <span className="text-xs text-slate-400">Last 60 Days Income</span>
                        <p
                          title={formatMoney(metrics.last60Income)}
                          className="text-lg sm:text-xl font-bold text-white mt-1 truncate"
                        >
                          {formatMoney(metrics.last60Income)}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden min-w-0">
                        <span className="text-xs text-slate-400">Last 30 Days Expenses</span>
                        <p
                          title={formatMoney(metrics.last30Expenses)}
                          className="text-lg sm:text-xl font-bold text-rose-400 mt-1 truncate"
                        >
                          {formatMoney(metrics.last30Expenses)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PROFILE SECTION VIEW */}
              {activeTab === 'profile' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Profile Header Card */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-2xl">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                        <p className="text-sm text-slate-400">{user?.email}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                            Active Account
                          </span>
                          <span>{incomes.length} Incomes</span>
                          <span>•</span>
                          <span>{expenses.length} Expenses</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteUser}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Update Personal Details */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                      <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-400" />
                        Personal Information
                      </h4>
                      <p className="text-xs text-slate-400 mb-5">
                        Update your name and lowercase email address
                      </p>
                      <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                            }
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={(e) =>
                              setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-sm text-white focus:outline-none ${
                              hasUppercase(profileForm.email)
                                ? 'border-rose-500 focus:border-rose-500'
                                : 'border-slate-800 focus:border-emerald-500'
                            }`}
                          />
                          {hasUppercase(profileForm.email) && (
                            <div className="flex items-center justify-between mt-1.5 text-xs text-rose-400">
                              <span>Email must be lowercase only.</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setProfileForm((prev) => ({
                                    ...prev,
                                    email: prev.email.toLowerCase()
                                  }))
                                }
                                className="underline font-semibold"
                              >
                                Make lowercase
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
                        >
                          Save Changes
                        </button>
                      </form>
                    </div>

                    {/* Change Password */}
                    <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-lg">
                      <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-400" />
                        Change Password
                      </h4>
                      <p className="text-xs text-slate-400 mb-5">
                        Update your account password (minimum 8 characters)
                      </p>
                      <form onSubmit={handleUpdatePassword} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Current Password
                          </label>
                          <input
                            type="password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value
                              }))
                            }
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            New Password
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value
                              }))
                            }
                            placeholder="Minimum 8 characters"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            required
                            minLength={8}
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value
                              }))
                            }
                            placeholder="Confirm new password"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition"
                        >
                          Update Password
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      )}

      {/* Add / Edit Transaction Modal with Interactive Calendar Popup */}
      {txModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">
                {txModal.editingId ? 'Edit' : 'Add'}{' '}
                {txModal.type === 'income' ? 'Income' : 'Expense'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCalendarOpen(false);
                  setTxModal((prev) => ({ ...prev, open: false }));
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={txModal.description}
                  onChange={(e) =>
                    setTxModal((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder={
                    txModal.type === 'income'
                      ? 'e.g., Monthly Salary'
                      : 'e.g., Grocery Shopping'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Amount ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={txModal.amount}
                    onChange={(e) =>
                      setTxModal((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="5000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Interactive Date Field that opens visual Calendar Picker on click */}
                <div className="relative">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Date
                  </label>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/60 text-sm text-white transition"
                  >
                    <span>{formatDisplayDate(txModal.date, 'dmy')}</span>
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Visual Interactive Calendar Picker */}
              {calendarOpen && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarView((prev) => {
                          const d = new Date(prev.year, prev.month - 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        })
                      }
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-white">
                      {MONTH_NAMES[calendarView.month]} {calendarView.year}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCalendarView((prev) => {
                          const d = new Date(prev.year, prev.month + 1, 1);
                          return { year: d.getFullYear(), month: d.getMonth() };
                        })
                      }
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Date Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const today = getTodayIso();
                        setTxModal((prev) => ({ ...prev, date: today }));
                        setCalendarOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                    >
                      Today ({formatDisplayDate(getTodayIso(), 'dmy')})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const yest = getYesterdayIso();
                        setTxModal((prev) => ({ ...prev, date: yest }));
                        setCalendarOpen(false);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-semibold"
                    >
                      Yesterday
                    </button>
                  </div>

                  {/* Weekday Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
                    {WEEKDAYS.map((wd) => (
                      <div key={wd} className="py-1">
                        {wd}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((cell, idx) => {
                      if (!cell) {
                        return <div key={`empty-${idx}`} className="h-8" />;
                      }
                      const isSelected = txModal.date === cell.iso;
                      const isFuture = cell.iso > getTodayIso();
                      return (
                        <button
                          key={cell.iso}
                          type="button"
                          disabled={isFuture}
                          onClick={() => {
                            setTxModal((prev) => ({ ...prev, date: cell.iso }));
                            setCalendarOpen(false);
                          }}
                          className={`h-8 rounded-lg text-xs font-medium transition ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                              : isFuture
                                ? 'text-slate-700 cursor-not-allowed'
                                : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Category
                </label>
                <select
                  value={txModal.category}
                  onChange={(e) =>
                    setTxModal((prev) => ({ ...prev, category: e.target.value }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {(txModal.type === 'income'
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarOpen(false);
                    setTxModal((prev) => ({ ...prev, open: false }));
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition ${
                    txModal.type === 'income'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      : 'bg-rose-500 hover:bg-rose-400 text-white'
                  }`}
                >
                  {txModal.editingId ? 'Save Changes' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {authMode === 'login' ? 'Sign In to FinPulse' : 'Create Account'}
              </h3>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  authMode === 'login'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  authMode === 'register'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
                {hasUppercase(authForm.email) && (
                  <p className="text-xs text-rose-400 mt-1">
                    Email must be in lowercase only.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition"
              >
                {authMode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {user?.email && (
              <div className="mt-5 pt-4 border-t border-slate-800 space-y-2">
                <p className="text-xs text-slate-400">
                  Current active user: <span className="text-slate-200 font-semibold">{user.name}</span> ({user.email})
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Current User
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteUser}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Delete User & Clear Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Budget Modal */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                Set Monthly Expense Target
              </h3>
              <button
                type="button"
                onClick={() => setBudgetModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const val = Number(budgetInput);
                if (val >= 0) {
                  setMonthlyBudget(val);
                  setBudgetModalOpen(false);
                  showToast(`Monthly budget updated to ${formatMoney(val)}`);
                }
              }}
              className="space-y-4"
            >
              <input
                type="number"
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backend API Config Modal */}
      {apiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Backend API Configuration
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setApiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Backend Base URL
                </label>
                <input
                  type="text"
                  value={apiConfig.baseUrl}
                  onChange={(e) =>
                    setApiConfig((prev) => ({ ...prev, baseUrl: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {Object.entries(apiConfig.endpoints).map(([key, val]) => (
                  <div key={key}>
                    <label className="block font-medium text-slate-400 mb-1">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) =>
                        setApiConfig((prev) => ({
                          ...prev,
                          endpoints: { ...prev.endpoints, [key]: e.target.value }
                        }))
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-5 mt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setApiConfig(DEFAULT_API_CONFIG)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Reset to Defaults
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setApiModalOpen(false);
                    syncWithBackend(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-semibold"
                >
                  Save & Test Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}