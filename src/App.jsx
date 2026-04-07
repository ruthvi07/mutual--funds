import { useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { Link, Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { fundTypes, insightCards } from "./data/mockData";
import { auth, googleProvider, isFirebaseConfigured } from "./firebase";

const roles = ["Investor", "Admin", "Financial Advisor", "Data Analyst"];

const roleMenus = {
  Investor: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Fund Discovery", path: "/investor/discovery" },
    { label: "Risk Quiz", path: "/investor/risk-quiz" },
    { label: "Recommendations", path: "/investor/recommendations" },
    { label: "Compare Dashboard", path: "/investor/compare" },
    { label: "Watchlist", path: "/investor/watchlist" },
    { label: "Portfolio Analytics", path: "/investor/portfolio" },
    { label: "Goal Planner", path: "/investor/goals" },
    { label: "SIP Manager", path: "/investor/sip" },
    { label: "Alerts", path: "/investor/alerts" },
    { label: "Tax Estimator", path: "/investor/tax" },
    { label: "Behavior Analytics", path: "/investor/behavior" },
    { label: "Education", path: "/investor/education" },
    { label: "Profile", path: "/profile" }
  ],
  Admin: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Control Panel", path: "/admin/control" },
    { label: "Profile", path: "/profile" }
  ],
  "Financial Advisor": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Advisor Desk", path: "/advisor/desk" },
    { label: "Education Hub", path: "/advisor/education" },
    { label: "Profile", path: "/profile" }
  ],
  "Data Analyst": [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Analytics Lab", path: "/analyst/lab" },
    { label: "Profile", path: "/profile" }
  ]
};

const roleHomePath = {
  Investor: "/investor/discovery",
  Admin: "/admin/control",
  "Financial Advisor": "/advisor/desk",
  "Data Analyst": "/analyst/lab"
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080/api";

const backendRoleToUi = {
  INVESTOR: "Investor",
  ADMIN: "Admin",
  FINANCIAL_ADVISOR: "Financial Advisor",
  DATA_ANALYST: "Data Analyst"
};

const uiRoleToBackend = {
  Investor: "INVESTOR",
  Admin: "ADMIN",
  "Financial Advisor": "FINANCIAL_ADVISOR",
  "Data Analyst": "DATA_ANALYST"
};

const fundHousePolicies = {
  "Axis Mutual Fund": [
    "Large-cap and diversified schemes usually keep liquidity high for easier entry and exit.",
    "Most open-ended schemes allow both SIP and lump-sum investing without account-level lock-in.",
    "Exit load generally applies only if redemption happens within the stated short holding window."
  ],
  "PPFAS Mutual Fund": [
    "Flexi-cap positioning may include international allocation depending on mandate and valuation comfort.",
    "Concentrated portfolios can outperform but may also deviate sharply from broad indices.",
    "This style is better suited to investors who can hold through full market cycles."
  ],
  "HDFC Mutual Fund": [
    "Hybrid and gold-linked strategies are often used to balance aggressive equity exposure.",
    "Debt and diversification products are intended for stability, not only headline returns.",
    "Rebalancing discipline matters more than reacting to short-term market noise."
  ],
  "ICICI Prudential Mutual Fund": [
    "Index and debt products usually emphasize lower-cost access and core allocation use.",
    "Bond-focused products should be selected based on duration comfort and credit quality needs.",
    "Sector products are better used as supporting allocations than full portfolios."
  ],
  "SBI Mutual Fund": [
    "Aggressive equity funds may reward long-term investors but can fluctuate sharply in short phases.",
    "Government-securities products are more suitable for stability-focused investors than growth seekers.",
    "Investment decisions should match horizon and risk tolerance, not just recent performance."
  ],
  "Nippon India Mutual Fund": [
    "International products help reduce India-only concentration but may carry currency effects.",
    "Higher-cost specialty strategies should be compared carefully against diversified alternatives.",
    "Best used as a portfolio diversifier, not the entire allocation for most users."
  ],
  "Kotak Mutual Fund": [
    "Mid-cap portfolios target business growth and can be volatile during market stress.",
    "These funds are more suitable when the investor can stay invested through market cycles.",
    "Use as a growth satellite allocation alongside core diversified holdings."
  ],
  "DSP Mutual Fund": [
    "Sector funds carry concentrated exposure and should be sized carefully.",
    "Healthcare exposure may diversify banking and technology-heavy portfolios.",
    "Investors should review whether a theme adds balance or only increases concentration."
  ],
  "Tata Mutual Fund": [
    "Technology-focused strategies are growth-led and can move sharply with global sentiment.",
    "Short-term spikes should not be the only basis for selection.",
    "This fits better for investors who already have diversified core holdings."
  ],
  "Aditya Birla Sun Life Mutual Fund": [
    "PSU and thematic exposure works better as a tactical slice than a core all-weather allocation.",
    "Investors should compare concentration and cyclicality before increasing exposure.",
    "High-risk thematic products need stronger suitability explanation for new investors."
  ],
  "Franklin Templeton Mutual Fund": [
    "Mid-cap diversification requires patience because shorter holding periods can be volatile.",
    "Selection quality and consistency matter more than one strong recent year.",
    "Good pairing with debt or index funds for better balance."
  ],
  "UTI Mutual Fund": [
    "Index products are usually lower-cost and easier for beginners to understand.",
    "These funds are better for steady core exposure than chasing outperformance.",
    "Suitable when the investor wants simple broad-market participation."
  ],
  default: [
    "Review the scheme objective, risk label, exit load, and lock-in before investing.",
    "Use fund-house policy notes together with your risk profile and goal timeline.",
    "Do not select a fund only because of recent returns; compare concentration and cost as well."
  ]
};

const demoMarketTicker = [
  { displayName: "NIFTY 50", lastPrice: 22490.25, change: 118.4, percentChange: 0.53, exchange: "NSE" },
  { displayName: "SENSEX", lastPrice: 74182.6, change: 302.8, percentChange: 0.41, exchange: "BSE" },
  { displayName: "NIFTY BANK", lastPrice: 48760.1, change: 176.15, percentChange: 0.36, exchange: "NSE" },
  { displayName: "NIFTY IT", lastPrice: 36540.85, change: -94.3, percentChange: -0.26, exchange: "NSE" },
  { displayName: "NIFTY AUTO", lastPrice: 21330.45, change: 88.2, percentChange: 0.42, exchange: "NSE" },
  { displayName: "NIFTY PHARMA", lastPrice: 18980.7, change: 51.6, percentChange: 0.27, exchange: "NSE" },
  { displayName: "NIFTY FMCG", lastPrice: 54760.25, change: 120.55, percentChange: 0.22, exchange: "NSE" },
  { displayName: "NIFTY MIDCAP 100", lastPrice: 51620.4, change: 184.35, percentChange: 0.36, exchange: "NSE" }
];

const roleProblemMap = {
  Investor: [
    {
      problem: "Too many similar funds",
      solution: "Recommendations, Compare Dashboard, and overlap checker narrow choices and warn against fake diversification."
    },
    {
      problem: "Hard to understand risk",
      solution: "Risk Quiz, plain-English explanations, and portfolio health guidance keep decisions understandable."
    },
    {
      problem: "Users chase recent returns",
      solution: "Goal planner, monthly summary, SIP tools, and AI insights keep focus on long-term suitability."
    }
  ],
  Admin: [
    {
      problem: "Mis-selling and unclear suitability",
      solution: "Compliance alerts, advisor approvals, and live data checks help enforce safer recommendations."
    },
    {
      problem: "Fraud, complaints, and trust gaps",
      solution: "Complaint workflows, fraud review, and user controls make platform governance visible."
    },
    {
      problem: "Outdated platform data",
      solution: "Live AMFI NAV sync and fund management keep the platform current."
    }
  ],
  "Financial Advisor": [
    {
      problem: "Advice often lacks explanation",
      solution: "Suitability notes and why-not guidance help advisors justify recommendations clearly."
    },
    {
      problem: "Clients invest without context",
      solution: "Education Hub, risk guides, and personalized recommendations improve investor understanding."
    },
    {
      problem: "Portfolios become repetitive",
      solution: "Diversification review and client snapshots help advisors avoid overlap-heavy suggestions."
    }
  ],
  "Data Analyst": [
    {
      problem: "Raw data is too technical",
      solution: "Easy summaries and beginner insights translate numbers into plain language."
    },
    {
      problem: "Users do not know what action to take",
      solution: "Top-fund highlights and action-oriented explanations convert analysis into decisions."
    },
    {
      problem: "Market signals are disconnected from products",
      solution: "Category return trends, live NAV coverage, and quality scores connect market data to fund choices."
    }
  ]
};

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function normalizeEmailInput(value) {
  return value.trim().toLowerCase();
}

function loadPrototypeAccounts() {
  try {
    return JSON.parse(window.localStorage.getItem("prototype-auth-accounts") || "[]");
  } catch {
    return [];
  }
}

function savePrototypeAccount(account) {
  const accounts = loadPrototypeAccounts().filter((item) => item.email !== account.email);
  accounts.push(account);
  window.localStorage.setItem("prototype-auth-accounts", JSON.stringify(accounts));
}

function findPrototypeAccount(email, password) {
  return loadPrototypeAccounts().find((item) => item.email === email && item.password === password) || null;
}

function normalizeUser(user) {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    role: backendRoleToUi[user.role] || user.role,
    mobile: user.mobile,
    status: user.status
  };
}

function normalizeFund(fund) {
  return {
    id: fund.id,
    schemeCode: fund.schemeCode,
    name: fund.name,
    category: fund.category,
    fundType: fund.fundType,
    risk: fund.riskLevel,
    returns1Y: fund.returns1Y,
    returns3Y: fund.returns3Y,
    returns5Y: fund.returns5Y,
    expenseRatio: fund.expenseRatio,
    aum: fund.aumCr,
    avgMonthlyIncome: fund.avgMonthlyIncome,
    roiScore: fund.roiScore,
    rating: fund.rating,
    reviewCount: fund.reviewCount,
    fundManager: fund.fundManager,
    exitLoad: fund.exitLoad,
    lockIn: fund.lockInPeriod,
    contractType: fund.contractType,
    fundHouse: fund.fundHouse,
    latestNav: fund.latestNav,
    latestNavDate: fund.latestNavDate,
    lastSyncedAt: fund.lastSyncedAt,
    dataSource: fund.dataSource,
    recommendationScore: fund.recommendationScore ?? 0,
    recommendationLabel: fund.recommendationLabel || "Watch Carefully",
    recommendationReason: fund.recommendationReason || "Compare return, cost, and risk before investing.",
    liveDataAvailable: Boolean(fund.liveDataAvailable),
    companies: fund.companies || [],
    sectorAllocation: fund.sectorAllocation || {},
    growthPoints: fund.growthPoints || [],
    riskMetrics: fund.riskMetrics || {},
    reviews: fund.reviews || []
  };
}

function normalizePost(post) {
  return {
    id: post.id,
    title: post.title,
    type: post.postType,
    summary: post.summary,
    likes: post.likesCount,
    comments: post.comments || []
  };
}

function formatDate(value) {
  if (!value) return "Not synced";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getFundHousePolicies(name) {
  return fundHousePolicies[name] || fundHousePolicies.default;
}

const riskHelp = {
  stdDev: "Standard Deviation: Higher value means more price volatility.",
  beta: "Beta: Sensitivity to market movements. 1 means market-like movement.",
  sharpe: "Sharpe Ratio: Higher value indicates better risk-adjusted return.",
  alpha: "Alpha: Excess return generated over benchmark after adjusting for risk."
};

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex items-center justify-center p-10 bg-[radial-gradient(circle_at_top_left,_rgba(0,208,156,0.25),transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.18),transparent_42%),#f8fffc]">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-slate-800 leading-tight">Mutual Fund Insight Hub</h1>
          <p className="mt-4 text-slate-600">
            Prototype with risk profiling, comparison dashboard, portfolio analytics, AI insights, goal planning, SIP tools, tax estimation, and advisor-admin workflows.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-soft border border-slate-100">
          <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function GoogleAuthButton({ label, onSuccess, setError, setLoading, loading }) {
  return (
    <button
      type="button"
      disabled={!isFirebaseConfigured || loading}
      onClick={async () => {
        setLoading(true);
        setError("");
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const idToken = await result.user.getIdToken();
          const data = await fetchJson("/auth/google", {
            method: "POST",
            body: JSON.stringify({ idToken })
          });
          onSuccess(normalizeUser(data.user));
        } catch (err) {
          setError(err.message || "Google sign-in failed");
        } finally {
          setLoading(false);
        }
      }}
      className="w-full border border-slate-300 bg-white text-slate-800 font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-3 hover:bg-slate-50"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold">
        G
      </span>
      <span>{isFirebaseConfigured ? label : "Google Auth Needs Firebase Config"}</span>
    </button>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizeEmailInput(email), password })
      });
      savePrototypeAccount({ email: normalizeEmailInput(email), password, user: normalizeUser(data.user) });
      onLogin(normalizeUser(data.user));
      navigate("/dashboard");
    } catch (err) {
      const localAccount = findPrototypeAccount(normalizeEmailInput(email), password);
      if (localAccount) {
        onLogin(localAccount.user);
        navigate("/dashboard");
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Access your personalized mutual fund workspace">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input label="Password" value={password} onChange={setPassword} type="password" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60">
          {loading ? "Logging in..." : "Login"}
        </button>
        <GoogleAuthButton
          label="Continue with Google"
          loading={loading}
          setError={setError}
          setLoading={setLoading}
          onSuccess={(newUser) => {
            onLogin(newUser);
            navigate("/dashboard");
          }}
        />
      </form>
      <p className="text-sm text-center text-slate-600 mt-4">
        New user? <Link to="/signup" className="text-brand-700 font-medium">Create account</Link>
      </p>
    </AuthLayout>
  );
}

function SignupPage({ onLogin }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const registeredUser = await fetchJson("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: name,
          email: normalizeEmailInput(email),
          password,
          mobile,
          role: uiRoleToBackend.Investor
        })
      });
      savePrototypeAccount({ email: normalizeEmailInput(email), password, user: normalizeUser(registeredUser) });
      const data = await fetchJson("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizeEmailInput(email), password })
      });
      savePrototypeAccount({ email: normalizeEmailInput(email), password, user: normalizeUser(data.user) });
      onLogin(normalizeUser(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign Up" subtitle="Create your investor account with your name, email, phone number, and password">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input label="Mobile Number" value={mobile} onChange={setMobile} type="tel" />
        <Input label="Password" value={password} onChange={setPassword} type="password" />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-60">
          {loading ? "Creating..." : "Create Account"}
        </button>
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-xs uppercase tracking-wide text-slate-400">or</span>
          </div>
        </div>
        <GoogleAuthButton
          label="Sign up with Google"
          loading={loading}
          setError={setError}
          setLoading={setLoading}
          onSuccess={(newUser) => {
            onLogin(newUser);
            navigate("/dashboard");
          }}
        />
      </form>
      <p className="text-sm text-center text-slate-600 mt-4">
        Already registered? <Link to="/" className="text-brand-700 font-medium">Back to login</Link>
      </p>
    </AuthLayout>
  );
}

function AppShell({ user, onLogout, children, notifications, setNotifications, marketTicker }) {
  const menu = roleMenus[user.role];
  const [tipsVisible, setTipsVisible] = useState(true);
  const tickerItems = [...(marketTicker?.length ? marketTicker : demoMarketTicker), ...(marketTicker?.length ? marketTicker : demoMarketTicker)];

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(0,208,156,0.12),transparent_35%),#f8fafc]">
      <div className="border-b border-slate-800 bg-slate-950 text-white overflow-hidden">
        <div className="market-ticker-track">
          <div className="market-ticker-content">
            {tickerItems.map((item, index) => (
              <span key={`${item.displayName}-${item.exchange}-${index}`} className="inline-flex items-center gap-2 mr-8 text-sm whitespace-nowrap">
                <span className="font-medium text-brand-200">{item.displayName}</span>
                <span>{Number(item.lastPrice || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                <span className={(item.change || 0) >= 0 ? "text-emerald-300" : "text-rose-300"}>
                  {(item.change || 0) >= 0 ? "+" : ""}{Number(item.change || 0).toFixed(2)} ({(item.percentChange || 0) >= 0 ? "+" : ""}{Number(item.percentChange || 0).toFixed(2)}%)
                </span>
                <span className="text-slate-300">{item.exchange}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Mutual Funds</p>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">Investment Perception Platform</h1>
            <p className="text-sm text-slate-500 mt-1">Signed in as {user.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white">
              Alerts {unreadCount ? `(${unreadCount})` : "(0)"}
            </button>
            <IconButton active={tipsVisible} onClick={() => setTipsVisible((v) => !v)} label="Toggle tips" icon="✦" />
            <div className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700">{user.role}</div>
            <button onClick={onLogout} className="px-3 py-2 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-900">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid lg:grid-cols-[250px_1fr] gap-6">
        <aside className="bg-white rounded-2xl p-4 shadow-soft border border-slate-100 h-fit">
          <p className="font-semibold text-slate-800">Hello, {user.name}</p>
          <p className="text-sm text-slate-500 mb-4">Role: {user.role}</p>
          <nav className="space-y-1">
            {menu.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `block px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? "bg-brand-50 text-brand-700 font-medium" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {tipsVisible && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-slate-700">
              Quick tip: Start with Risk Quiz, then Compare Dashboard, then Portfolio Analytics for best demo flow.
            </div>
          )}
        </aside>
        <section>{children}</section>
      </main>
    </div>
  );
}

function Dashboard({ user, portfolioData, recommendationData, watchlistItems, analystData, adminData, advisorData }) {
  return (
    <div className="space-y-6">
      <PageCard title={`Role Dashboard: ${user.role}`} subtitle="Each role has dedicated workflows, operations, and interactive analytics." />
      <div className="grid md:grid-cols-3 gap-4">
        {insightCards.map((item) => (
          <article key={item.title} className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
            <h3 className="font-semibold text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{item.description}</p>
          </article>
        ))}
      </div>
      {user.role === "Investor" ? (
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard label="Watchlist Items" value={String(watchlistItems.length)} />
          <StatCard label="Top Pick" value={recommendationData?.topPicks?.[0]?.name || "Loading"} />
          <StatCard label="Portfolio Health" value={portfolioData?.portfolioHealth || "Pending"} />
        </div>
      ) : null}
      {user.role === "Data Analyst" ? (
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard label="Live Funds Tracked" value={String(analystData?.liveFundsTracked || 0)} />
          <StatCard label="Market View" value={analystData?.marketView?.slice(0, 18) || "Loading"} />
          <StatCard label="Funds Tracked" value={String(analystData?.fundsTracked || 0)} />
        </div>
      ) : null}
      {user.role === "Admin" ? (
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Advisors Pending" value={String(adminData?.advisorsPending || 0)} />
          <StatCard label="Complaints Open" value={String(adminData?.complaintsOpen || 0)} />
          <StatCard label="Mis-selling Flags" value={String(adminData?.misSellingFlags || 0)} />
          <StatCard label="Live Funds Covered" value={String(adminData?.liveFundsCovered || 0)} />
        </div>
      ) : null}
      {user.role === "Financial Advisor" ? (
        <div className="grid md:grid-cols-3 gap-4">
          <StatCard label="Active Clients" value={String(advisorData?.activeClients || 0)} />
          <StatCard label="Recommendations Sent" value={String(advisorData?.recommendationsSent || 0)} />
          <StatCard label="Risk Reports" value={String(advisorData?.riskReports || 0)} />
        </div>
      ) : null}
      <RoleSummary role={user.role} />
      <ProblemSolutionBoard role={user.role} />
    </div>
  );
}

function RoleSummary({ role }) {
  if (role === "Admin") {
    return <div className="grid md:grid-cols-4 gap-4"><StatCard label="Advisors Pending" value="7" /><StatCard label="Complaints" value="12" /><StatCard label="Fraud Alerts" value="3" /><StatCard label="Funds Updated" value="19" /></div>;
  }
  if (role === "Financial Advisor") {
    return <div className="grid md:grid-cols-3 gap-4"><StatCard label="Active Clients" value="38" /><StatCard label="Recommendations Sent" value="64" /><StatCard label="Risk Reports" value="29" /></div>;
  }
  if (role === "Data Analyst") {
    return <div className="grid md:grid-cols-3 gap-4"><StatCard label="NAV Sync Health" value="98.3%" /><StatCard label="Monte Carlo Runs" value="120" /><StatCard label="Rebalance Signals" value="16" /></div>;
  }
  return <div className="grid md:grid-cols-4 gap-4"><StatCard label="Goals Active" value="4" /><StatCard label="SIPs Active" value="5" /><StatCard label="Avg XIRR" value="14.6%" /><StatCard label="Risk Profile" value="Moderate" /></div>;
}

function ProblemSolutionBoard({ role }) {
  const items = roleProblemMap[role] || [];
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft">
      <p className="text-sm uppercase tracking-wide text-slate-500">How this role solves real-world problems</p>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {items.map((item) => (
          <div key={item.problem} className="rounded-xl border border-slate-200 p-4">
            <p className="font-semibold text-slate-800">{item.problem}</p>
            <p className="text-sm text-slate-600 mt-2">{item.solution}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InvestorDiscoveryPage({ funds, compareIds, setCompareIds, enrolledFundIds, watchlistFundIds, onToggleWatchlist, onInvest }) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [houseFilter, setHouseFilter] = useState("All");
  const [maxExpense, setMaxExpense] = useState("2");
  const [minRating, setMinRating] = useState("0");
  const [minReturn, setMinReturn] = useState("0");
  const [investmentAmounts, setInvestmentAmounts] = useState({});
  const [investMode, setInvestMode] = useState({});
  const [investingFundId, setInvestingFundId] = useState(null);
  const [selectedFundHouse, setSelectedFundHouse] = useState("");

  const houses = useMemo(() => ["All", ...new Set(funds.map((f) => f.fundHouse))], [funds]);
  const categories = useMemo(() => ["All", ...new Set(funds.map((f) => f.category))], [funds]);

  const filtered = useMemo(() => {
    return funds.filter((fund) => {
      const q = fund.name.toLowerCase().includes(query.toLowerCase());
      const r = riskFilter === "All" ? true : fund.risk === riskFilter;
      const t = typeFilter === "All" ? true : fund.fundType === typeFilter;
      const c = categoryFilter === "All" ? true : fund.category === categoryFilter;
      const h = houseFilter === "All" ? true : fund.fundHouse === houseFilter;
      const e = fund.expenseRatio <= Number.parseFloat(maxExpense || "2");
      const rt = fund.rating >= Number.parseFloat(minRating || "0");
      const re = fund.returns3Y >= Number.parseFloat(minReturn || "0");
      return q && r && t && c && h && e && rt && re;
    });
  }, [funds, query, riskFilter, typeFilter, categoryFilter, houseFilter, maxExpense, minRating, minReturn]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-4)));
  };

  const investInFund = async (fundId) => {
    const amount = Number(investmentAmounts[fundId] || 0);
    const mode = investMode[fundId] || "Lump Sum";
    if (!amount) return;
    setInvestingFundId(fundId);
    try {
      await onInvest(fundId, amount, mode);
      setInvestmentAmounts((prev) => ({ ...prev, [fundId]: "" }));
    } finally {
      setInvestingFundId(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageCard title="Investor: Fund Discovery + Categorization" subtitle="Filter by risk, return, fund house, expense ratio, rating. Live NAV from AMFI is shown wherever available, along with a simple fit summary." />

      {selectedFundHouse ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Fund House Policies</p>
              <h3 className="text-lg font-semibold text-slate-800 mt-1">{selectedFundHouse}</h3>
            </div>
            <button onClick={() => setSelectedFundHouse("")} className="px-3 py-2 rounded-lg border text-sm">Close</button>
          </div>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            {getFundHousePolicies(selectedFundHouse).map((policy) => (
              <div key={policy} className="border border-slate-200 rounded-lg p-3 text-sm text-slate-700">{policy}</div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 grid md:grid-cols-3 gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fund" className="border border-slate-200 rounded-lg px-3 py-2" />
        <Select label="Risk" value={riskFilter} onChange={setRiskFilter} options={["All", "Low to Moderate", "Moderate", "Moderate to High", "High"]} />
        <Select label="Fund Type" value={typeFilter} onChange={setTypeFilter} options={["All", "Equity", "Debt", "Hybrid", "Index", "ELSS"]} />
        <Select label="Category" value={categoryFilter} onChange={setCategoryFilter} options={categories} />
        <Select label="Fund House" value={houseFilter} onChange={setHouseFilter} options={houses} />
        <Input label="Max Expense Ratio (%)" value={maxExpense} onChange={setMaxExpense} type="number" />
        <Input label="Min Rating" value={minRating} onChange={setMinRating} type="number" />
        <Input label="Min 3Y Return (%)" value={minReturn} onChange={setMinReturn} type="number" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((fund) => (
          <div key={fund.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-800">{fund.name}</h3>
                <p className="text-sm text-slate-500">{fund.category} • {fund.fundType} • {fund.risk}</p>
                <button onClick={() => setSelectedFundHouse(fund.fundHouse)} className="text-sm text-brand-700 mt-2 underline underline-offset-2">
                  {fund.fundHouse} policies
                </button>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${fund.recommendationLabel === "Top Pick" ? "bg-emerald-100 text-emerald-700" : fund.recommendationLabel === "Strong Fit" ? "bg-brand-50 text-brand-700" : "bg-amber-100 text-amber-700"}`}>
                    {fund.recommendationLabel}
                  </span>
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    Score: {fund.recommendationScore}
                  </span>
                  <span className={`px-2 py-1 rounded-full ${fund.liveDataAvailable ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"}`}>
                    {fund.liveDataAvailable ? `Live NAV ${fund.latestNav}` : "Live NAV unavailable"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <IconButton icon="★" label="Watchlist" onClick={() => onToggleWatchlist(fund.id)} active={watchlistFundIds.includes(fund.id)} />
                <IconButton icon="≋" label="Compare" onClick={() => toggleCompare(fund.id)} active={compareIds.includes(fund.id)} />
                <IconButton icon="◎" label="Already in portfolio" onClick={() => {}} active={enrolledFundIds.includes(fund.id)} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              <Metric label="1Y" value={`${fund.returns1Y}%`} />
              <Metric label="3Y" value={`${fund.returns3Y}%`} />
              <Metric label="5Y" value={`${fund.returns5Y}%`} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <Metric label="Expense" value={`${fund.expenseRatio}%`} />
              <Metric label="AUM" value={`Rs ${fund.aum} Cr`} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <Metric label="Latest NAV" value={fund.liveDataAvailable ? `Rs ${fund.latestNav}` : "Pending sync"} />
              <Metric label="NAV Date" value={formatDate(fund.latestNavDate)} />
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 border border-slate-100 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Why this may suit you</p>
              <p className="text-sm text-slate-700 mt-1">{fund.recommendationReason}</p>
            </div>

            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Top companies</p>
                <p className="text-sm text-slate-700 mt-2">{fund.companies.slice(0, 5).join(", ")}</p>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Sector spread</p>
                <p className="text-sm text-slate-700 mt-2">
                  {Object.entries(fund.sectorAllocation || {}).slice(0, 3).map(([sector, value]) => `${sector} ${value}%`).join(" • ")}
                </p>
              </div>
            </div>

            <div className="mt-3 grid md:grid-cols-[1fr_170px_130px] gap-2 items-end">
              <Input
                label="Invest Amount (Rs)"
                value={investmentAmounts[fund.id] || ""}
                onChange={(value) => setInvestmentAmounts((prev) => ({ ...prev, [fund.id]: value }))}
                type="number"
                required={false}
              />
              <Select
                label="Investment Mode"
                value={investMode[fund.id] || "Lump Sum"}
                onChange={(value) => setInvestMode((prev) => ({ ...prev, [fund.id]: value }))}
                options={["Lump Sum", "Start SIP"]}
              />
              <button
                onClick={() => investInFund(fund.id)}
                disabled={investingFundId === fund.id || !Number(investmentAmounts[fund.id] || 0)}
                className="px-4 py-2.5 rounded-lg bg-brand-500 text-white disabled:opacity-60"
              >
                {investingFundId === fund.id ? "Investing..." : enrolledFundIds.includes(fund.id) ? "Add More" : "Invest Now"}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <TooltipMetric label="Std Dev" value={fund.riskMetrics.stdDev} help={riskHelp.stdDev} />
              <TooltipMetric label="Beta" value={fund.riskMetrics.beta} help={riskHelp.beta} />
              <TooltipMetric label="Sharpe" value={fund.riskMetrics.sharpe} help={riskHelp.sharpe} />
              <TooltipMetric label="Alpha" value={fund.riskMetrics.alpha} help={riskHelp.alpha} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-5 gap-3">
        {fundTypes.map((item) => (
          <div key={item.type} className="bg-white rounded-xl border border-slate-100 p-3 text-sm shadow-soft">
            <p className="font-semibold">{item.type}</p>
            <p className="text-xs text-slate-600 mt-1">{item.description}</p>
            <p className="text-xs text-brand-700 mt-2">Risk: {item.risk}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskQuizPage({ funds, riskProfile, setRiskProfile }) {
  const [age, setAge] = useState("28");
  const [income, setIncome] = useState("1200000");
  const [duration, setDuration] = useState("7");
  const [tolerance, setTolerance] = useState("Medium");
  const [goal, setGoal] = useState("Retirement");
  const [result, setResult] = useState(riskProfile || "");
  const [summary, setSummary] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const classify = async () => {
    setLoading(true);
    try {
      const data = await fetchJson("/investor/risk-profile", {
        method: "POST",
        body: JSON.stringify({
          age: Number(age),
          annualIncome: Number(income),
          investmentDurationYears: Number(duration),
          riskTolerance: tolerance,
          goal
        })
      });
      setResult(data.profile);
      setSummary(data.summary || "");
      setRiskProfile(data.profile);
      setRecommendations((data.recommendedFunds || []).map(normalizeFund));
    } catch (error) {
      setRecommendations([]);
      setResult("");
      setSummary("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageCard title="Risk Profiling Quiz" subtitle="Answer the quiz and get classified into Conservative, Moderate, or Aggressive." />
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 grid md:grid-cols-2 gap-3">
        <Input label="Age" value={age} onChange={setAge} type="number" />
        <Input label="Annual Income (Rs)" value={income} onChange={setIncome} type="number" />
        <Input label="Investment Duration (Years)" value={duration} onChange={setDuration} type="number" />
        <Select label="Risk Tolerance" value={tolerance} onChange={setTolerance} options={["Low", "Medium", "High"]} />
        <Select label="Financial Goal" value={goal} onChange={setGoal} options={["Education", "House Purchase", "Retirement", "Vacation", "Wealth Creation"]} />
        <button onClick={classify} className="h-10 mt-6 bg-brand-500 text-white rounded-lg">{loading ? "Analyzing..." : "Classify My Profile"}</button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 space-y-3">
          <p className="text-lg font-semibold">Risk Profile: <span className="text-brand-700">{result}</span></p>
          <p className="text-sm text-slate-600">{summary}</p>
          <p className="text-sm text-slate-600">Recommended funds based on your profile:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {recommendations.map((fund) => (
              <div key={fund.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                <p className="font-medium">{fund.name}</p>
                <p className="text-slate-600">{fund.risk} • 3Y: {fund.returns3Y}% • Score: {fund.recommendationScore}</p>
                <p className="text-xs text-slate-500 mt-2">{fund.recommendationReason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareDashboardPage({ funds, compareIds, setCompareIds, navHistories }) {
  const visibleFunds = funds.filter((f) => compareIds.includes(f.id));
  const categoryAverage = visibleFunds.length ? visibleFunds.reduce((acc, fund) => acc + fund.returns3Y, 0) / visibleFunds.length : 0;

  return (
    <div className="space-y-4">
      <PageCard title="Fund Comparison Dashboard" subtitle="Compare returns, expense ratio, risk level, AUM, manager, and exit load side-by-side with charts." />

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
        <p className="text-sm text-slate-600 mb-2">Pick up to 4 funds</p>
        <div className="flex flex-wrap gap-2">
          {funds.map((fund) => (
            <button
              key={fund.id}
              onClick={() => setCompareIds((prev) => (prev.includes(fund.id) ? prev.filter((id) => id !== fund.id) : [...prev, fund.id].slice(-4)))}
              className={`px-3 py-1.5 rounded-lg text-sm border ${compareIds.includes(fund.id) ? "bg-brand-500 border-brand-500 text-white" : "bg-white border-slate-300"}`}
            >
              {fund.name}
            </button>
          ))}
        </div>
      </div>

      {visibleFunds.length > 0 && (
        <>
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-100 shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Fund</th>
                  <th className="text-left px-4 py-3">1Y</th>
                  <th className="text-left px-4 py-3">3Y</th>
                  <th className="text-left px-4 py-3">5Y</th>
                  <th className="text-left px-4 py-3">Expense</th>
                  <th className="text-left px-4 py-3">Risk</th>
                  <th className="text-left px-4 py-3">AUM</th>
                  <th className="text-left px-4 py-3">Fund Manager</th>
                  <th className="text-left px-4 py-3">Exit Load</th>
                </tr>
              </thead>
              <tbody>
                {visibleFunds.map((fund) => (
                  <tr key={fund.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{fund.name}</td>
                    <td className="px-4 py-3">{fund.returns1Y}%</td>
                    <td className="px-4 py-3">{fund.returns3Y}%</td>
                    <td className="px-4 py-3">{fund.returns5Y}%</td>
                    <td className="px-4 py-3">{fund.expenseRatio}%</td>
                    <td className="px-4 py-3">{fund.risk}</td>
                    <td className="px-4 py-3">Rs {fund.aum} Cr</td>
                    <td className="px-4 py-3">{fund.fundManager}</td>
                    <td className="px-4 py-3">{fund.exitLoad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
              <p className="font-semibold mb-2">3Y Return Comparison</p>
              <BarChart items={visibleFunds.map((f) => ({ label: shortName(f.name), value: f.returns3Y }))} />
            </div>
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
              <p className="font-semibold mb-2">Expense Ratio Comparison</p>
              <BarChart items={visibleFunds.map((f) => ({ label: shortName(f.name), value: f.expenseRatio }))} color="#2563eb" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {visibleFunds.slice(0, 2).map((fund) => {
              const points = (navHistories[fund.id] || []).map((item) => item.nav);
              return (
                <div key={`history-${fund.id}`} className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
                  <p className="font-semibold">{fund.name} NAV Trend</p>
                  <p className="text-sm text-slate-500 mt-1">Stored live NAV history from AMFI syncs.</p>
                  {points.length ? <LineChart values={points} /> : <p className="text-sm text-slate-600 mt-3">NAV history will appear after more sync cycles.</p>}
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {visibleFunds.map((fund) => (
              <div key={`insight-${fund.id}`} className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
                <p className="font-semibold">{fund.name}</p>
                <p className="text-sm text-slate-600 mt-2">
                  {fund.returns3Y >= categoryAverage
                    ? `Outperforms the selected-fund average by ${(fund.returns3Y - categoryAverage).toFixed(2)}%.`
                    : `Lags the selected-fund average by ${(categoryAverage - fund.returns3Y).toFixed(2)}%.`}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {fund.expenseRatio <= 0.75 ? "Relatively low cost for its category." : "Cost is on the higher side, so compare carefully."}
                </p>
                <p className="text-sm text-slate-600 mt-2">
                  {fund.recommendationReason}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RecommendationsPage({ recommendationData, overlapData, compareIds, setCompareIds }) {
  const topPicks = recommendationData?.topPicks || [];
  const modelPortfolios = recommendationData?.modelPortfolios || [];
  const personalInsights = recommendationData?.personalInsights || [];
  const avoidReasons = recommendationData?.avoidReasons || [];

  return (
    <div className="space-y-4">
      <PageCard title="Recommendations and Ready-Made Options" subtitle="This section suggests strong candidates, explains why they fit, and shows ready-made model portfolios for different investor goals." />

      <div className="grid md:grid-cols-3 gap-4">
        {personalInsights.map((item) => (
          <div key={item} className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
            <p className="font-medium text-slate-800">{item}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: choice overload</p>
          <p className="text-sm text-slate-600 mt-2">Top picks reduce the long list into a few stronger options instead of making the user browse everything manually.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: fake diversification</p>
          <p className="text-sm text-slate-600 mt-2">The overlap checker points out repeated companies across selected funds before the user invests in similar products.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: no starting point</p>
          <p className="text-sm text-slate-600 mt-2">Model portfolios give ready-made mixes for beginner, tax-saving, retirement, and stability-focused investors.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Top suggested funds</p>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {topPicks.map((fund) => (
            <div key={fund.id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{fund.name}</p>
                  <p className="text-sm text-slate-500">{fund.fundType} • {fund.risk}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Fit</p>
                  <p className="font-semibold text-brand-700">{fund.recommendationLabel}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Metric label="3Y" value={`${fund.returns3Y}%`} />
                <Metric label="Expense" value={`${fund.expenseRatio}%`} />
                <Metric label="NAV" value={fund.latestNav ? `Rs ${fund.latestNav}` : "Pending"} />
              </div>
              <p className="text-sm text-slate-600 mt-3">{fund.recommendationReason}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setCompareIds((prev) => (prev.includes(fund.id) ? prev : [...prev, fund.id].slice(-4)))} className="px-3 py-2 rounded-lg border text-sm">Add to Compare</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {modelPortfolios.map((portfolio) => (
          <div key={portfolio.name} className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
            <p className="font-semibold">{portfolio.name}</p>
            <p className="text-sm text-slate-500 mt-1">{portfolio.targetUser} • {portfolio.goalType}</p>
            <p className="text-sm text-slate-700 mt-3">{portfolio.summary}</p>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Allocation</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.entries(portfolio.allocation || {}).map(([label, value]) => (
                  <Metric key={label} label={label} value={`${value}%`} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Suggested funds</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {(portfolio.suggestedFunds || []).map((fund) => (
                  <li key={`${portfolio.name}-${fund.id}`} className="border border-slate-200 rounded-lg p-2">
                    {fund.name} • {fund.recommendationLabel}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="font-semibold">What to avoid</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {avoidReasons.map((reason) => (
              <li key={reason} className="border border-slate-200 rounded-lg p-3">{reason}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="font-semibold">Portfolio overlap checker</p>
          <p className="text-sm text-slate-500 mt-1">Uses the funds selected in Compare Dashboard.</p>
          <div className="mt-3 space-y-2">
            {Object.keys(overlapData?.overlappingCompanies || {}).length ? (
              Object.entries(overlapData.overlappingCompanies).map(([company, count]) => (
                <div key={company} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <span>{company}</span>
                  <span>{count} funds</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Select a few funds in Compare Dashboard to inspect overlap.</p>
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {(overlapData?.insights || []).map((insight) => (
              <li key={insight} className="border border-slate-200 rounded-lg p-3">{insight}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WatchlistPage({ watchlistItems, monthlySummary, onRemove }) {
  return (
    <div className="space-y-4">
      <PageCard title="Watchlist and Monthly Summary" subtitle="Track saved funds, stay engaged with monthly guidance, and keep shortlist ideas ready for later review." />

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Your watchlist</p>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {watchlistItems.length ? watchlistItems.map((item) => (
            <div key={item.id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{item.fundName}</p>
                  <p className="text-sm text-slate-500">{item.fundType} • {item.riskLevel}</p>
                </div>
                <button onClick={() => onRemove(item.fundId)} className="px-2 py-1 rounded-lg border text-xs">Remove</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <Metric label="NAV" value={item.latestNav ? `Rs ${item.latestNav}` : "Pending"} />
                <Metric label="Fit" value={item.recommendationLabel} />
                <Metric label="Score" value={item.recommendationScore} />
              </div>
            </div>
          )) : <p className="text-sm text-slate-600">No watchlist items yet. Save funds from Fund Discovery to track them here.</p>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Monthly portfolio summary</p>
        <p className="text-sm text-slate-700 mt-2">{monthlySummary?.headline || "Summary will appear once portfolio data is available."}</p>
        <div className="grid md:grid-cols-3 gap-3 mt-4">
          <StatCard label="Best Performer" value={monthlySummary?.bestPerformer || "-"} />
          <StatCard label="Weakest Performer" value={monthlySummary?.weakestPerformer || "-"} />
          <StatCard label="Recommended Action" value={monthlySummary?.recommendedAction || "-"} />
        </div>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {(monthlySummary?.highlights || []).map((highlight) => (
            <li key={highlight} className="border border-slate-200 rounded-lg p-3">{highlight}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PortfolioAnalyticsPage({ portfolioData, sipAmount, setSipAmount }) {
  const holdings = portfolioData?.holdings || [];
  const totalInvested = portfolioData?.totalInvested || 0;
  const currentValue = portfolioData?.currentValue || 0;
  const pnl = portfolioData?.profitLossPercent || 0;
  const xirr = portfolioData?.xirr || 0;
  const assetAllocation = portfolioData?.assetAllocation || { Cash: 100 };
  const sectorAllocation = portfolioData?.sectorAllocation || { Cash: 100 };
  const portfolioHealth = portfolioData?.portfolioHealth || "Needs Attention";
  const nextAction = portfolioData?.nextAction || "Start with a SIP in one well-matched fund.";
  const opportunityCards = portfolioData?.opportunityCards || [];
  const aiInsights = portfolioData?.aiInsights || ["No enrolled funds yet. Enroll funds to receive AI insights."];

  return (
    <div className="space-y-4">
      <PageCard title="Portfolio Analytics (Must Have)" subtitle="Total invested, current value, P/L, XIRR, allocation charts, and AI-powered insights." />

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 max-w-md">
        <Input label="Monthly SIP per Fund (Rs)" value={sipAmount} onChange={setSipAmount} type="number" />
      </div>

      <div className="grid md:grid-cols-5 gap-3">
        <StatCard label="Total Invested" value={currency(totalInvested)} />
        <StatCard label="Current Value" value={currency(currentValue)} />
        <StatCard label="Profit/Loss %" value={`${pnl.toFixed(2)}%`} />
        <StatCard label="XIRR" value={`${xirr.toFixed(2)}%`} />
        <StatCard label="Funds" value={String(holdings.length)} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="text-sm text-slate-500">Portfolio health</p>
          <p className="text-2xl font-semibold mt-1">{portfolioHealth}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="text-sm text-slate-500">Best next action</p>
          <p className="text-base font-medium mt-1 text-slate-800">{nextAction}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
          <p className="font-semibold">Asset Allocation Pie</p>
          <PieChart data={assetAllocation} />
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
          <p className="font-semibold">Sector Allocation Breakdown</p>
          <PieChart data={sectorAllocation} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
        <p className="font-semibold">Opportunity cards</p>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          {opportunityCards.map((item) => (
            <div key={item} className="border border-slate-200 rounded-lg p-3 text-sm text-slate-700">{item}</div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
        <p className="font-semibold">AI-Powered Insights (Rule-based)</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {aiInsights.map((insight) => <li key={insight} className="border border-slate-200 rounded-lg p-3">{insight}</li>)}
        </ul>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft">
        <p className="font-semibold">Portfolio Holdings</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Fund</th>
                <th className="text-left px-3 py-2">Invested</th>
                <th className="text-left px-3 py-2">Current</th>
                <th className="text-left px-3 py-2">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.fundId} className="border-t border-slate-100">
                  <td className="px-3 py-2">{holding.fundName}</td>
                  <td className="px-3 py-2">{currency(holding.investedAmount)}</td>
                  <td className="px-3 py-2">{currency(holding.currentValue)}</td>
                  <td className="px-3 py-2">{holding.allocationPercent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GoalPlannerPage({ sipAmount }) {
  const [goalType, setGoalType] = useState("Education");
  const [targetCorpus, setTargetCorpus] = useState("2500000");
  const [years, setYears] = useState("8");
  const expectedReturn = 12;

  const monthlySipRequired = requiredSip(Number(targetCorpus || 0), expectedReturn, Number(years || 0));
  const expectedCorpus = futureValue(Number(sipAmount || 0), expectedReturn, Number(years || 0));
  const timeToGoal = estimateYearsToGoal(Number(sipAmount || 0), Number(targetCorpus || 0), expectedReturn);

  return (
    <div className="space-y-4">
      <PageCard title="Goal-Based Investing" subtitle="Set education, house, retirement, or vacation goals and compute SIP path." />
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 grid md:grid-cols-2 gap-3">
        <Select label="Goal" value={goalType} onChange={setGoalType} options={["Education", "House Purchase", "Retirement", "Vacation"]} />
        <Input label="Target Corpus (Rs)" value={targetCorpus} onChange={setTargetCorpus} type="number" />
        <Input label="Target Timeline (Years)" value={years} onChange={setYears} type="number" />
        <Metric label="Expected Return Assumption" value={`${expectedReturn}% p.a.`} />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Required Monthly SIP" value={currency(Math.round(monthlySipRequired))} />
        <StatCard label="Expected Corpus" value={currency(Math.round(expectedCorpus))} />
        <StatCard label="Time to Reach Goal" value={`${timeToGoal.toFixed(1)} years`} />
      </div>
    </div>
  );
}

function SipManagementPage({ sipAmount, setSipAmount, sipState, setSipState }) {
  const [years, setYears] = useState("10");
  const [returnRate, setReturnRate] = useState("12");
  const projected = futureValue(Number(sipAmount || 0), Number(returnRate || 0), Number(years || 0));

  const startSip = () => setSipState((prev) => ({ ...prev, status: "Active" }));
  const pauseSip = () => setSipState((prev) => ({ ...prev, status: "Paused" }));
  const stepUp = () => setSipAmount(String(Math.round(Number(sipAmount || 0) * (1 + sipState.stepUpRate / 100))));

  return (
    <div className="space-y-4">
      <PageCard title="SIP Management System" subtitle="Start, pause, step-up SIP, auto-debit simulation, reminders, and SIP calculator." />
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 grid md:grid-cols-2 gap-3">
        <Input label="Current SIP (Rs)" value={sipAmount} onChange={setSipAmount} type="number" />
        <Input label="Step-up %" value={String(sipState.stepUpRate)} onChange={(v) => setSipState((p) => ({ ...p, stepUpRate: Number(v || 0) }))} type="number" />
        <Select label="Auto Debit" value={sipState.autoDebit ? "Enabled" : "Disabled"} onChange={(v) => setSipState((p) => ({ ...p, autoDebit: v === "Enabled" }))} options={["Enabled", "Disabled"]} />
        <Input label="Upcoming SIP Date" value={sipState.nextDate} onChange={(v) => setSipState((p) => ({ ...p, nextDate: v }))} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={startSip} className="px-4 py-2 rounded-lg bg-brand-500 text-white">Start SIP</button>
        <button onClick={pauseSip} className="px-4 py-2 rounded-lg border border-slate-300">Pause SIP</button>
        <button onClick={stepUp} className="px-4 py-2 rounded-lg border border-brand-400 text-brand-700">Increase SIP (Step-up)</button>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        <StatCard label="SIP Status" value={sipState.status} />
        <StatCard label="Auto Debit" value={sipState.autoDebit ? "On" : "Off"} />
        <StatCard label="Next Reminder" value={sipState.nextDate} />
        <StatCard label="Projected Corpus" value={currency(Math.round(projected))} />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 grid md:grid-cols-2 gap-3 max-w-2xl">
        <Input label="Calculator Years" value={years} onChange={setYears} type="number" />
        <Input label="Expected Return %" value={returnRate} onChange={setReturnRate} type="number" />
      </div>
    </div>
  );
}

function AlertsPage({ notifications, setNotifications }) {
  const updateToggle = (type) => {
    setNotifications((prev) => prev.map((n) => (n.type === type ? { ...n, enabled: !n.enabled } : n)));
  };

  return (
    <div className="space-y-4">
      <PageCard title="Smart Alerts & Notifications" subtitle="NAV updates, market crash alerts, rebalancing suggestions, SIP reminders, and dividend alerts." />
      <div className="grid md:grid-cols-2 gap-4">
        {notifications.map((n) => (
          <div key={n.type} className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium">{n.label}</p>
              <button onClick={() => updateToggle(n.type)} className={`px-3 py-1 rounded-lg text-xs ${n.enabled ? "bg-brand-500 text-white" : "bg-slate-200"}`}>
                {n.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <p className="text-sm text-slate-600 mt-2">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TaxEstimatorPage({ enrolledFundIds, funds }) {
  const [gains, setGains] = useState("180000");
  const [holding, setHolding] = useState("Long Term");
  const [elssInvest, setElssInvest] = useState("120000");

  const selected = funds.filter((fund) => enrolledFundIds.includes(fund.id));
  const ltcgTax = Math.max(0, Number(gains || 0) - 100000) * 0.1;
  const stcgTax = Number(gains || 0) * 0.15;
  const capitalGainsTax = holding === "Long Term" ? ltcgTax : stcgTax;
  const elssSavings = Math.min(150000, Number(elssInvest || 0)) * 0.3;

  return (
    <div className="space-y-4">
      <PageCard title="Tax Estimation Feature" subtitle="Capital gains tax, ELSS 80C savings, LTCG/STCG simulation." />
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 grid md:grid-cols-3 gap-3">
        <Input label="Realized Gains (Rs)" value={gains} onChange={setGains} type="number" />
        <Select label="Holding Type" value={holding} onChange={setHolding} options={["Long Term", "Short Term"]} />
        <Input label="ELSS Investment (Rs)" value={elssInvest} onChange={setElssInvest} type="number" />
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Estimated Capital Gains Tax" value={currency(Math.round(capitalGainsTax))} />
        <StatCard label="ELSS 80C Savings" value={currency(Math.round(elssSavings))} />
        <StatCard label="Funds in Portfolio" value={String(selected.length)} />
      </div>
    </div>
  );
}

function BehaviorAnalyticsPage() {
  const [panicSells, setPanicSells] = useState("3");
  const [overtrades, setOvertrades] = useState("5");
  const [sipConsistency, setSipConsistency] = useState("68");

  const insights = [];
  if (Number(panicSells) >= 2) insights.push("You tend to withdraw during market dips. Long-term investing may work better.");
  if (Number(overtrades) >= 4) insights.push("High trade frequency indicates overtrading risk and may increase behavioral errors.");
  if (Number(sipConsistency) < 75) insights.push("SIP consistency is low. Missing installments affects compounding potential.");
  if (insights.length === 0) insights.push("Behavior metrics look disciplined. Continue goal-oriented investing.");

  return (
    <div className="space-y-4">
      <PageCard title="Behavioral Analytics (Unique Feature)" subtitle="Track panic selling, overtrading, SIP consistency, and generate behavioral nudges." />
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 grid md:grid-cols-3 gap-3">
        <Input label="Panic Sell Events (12m)" value={panicSells} onChange={setPanicSells} type="number" />
        <Input label="Overtrading Events (12m)" value={overtrades} onChange={setOvertrades} type="number" />
        <Input label="SIP Consistency (%)" value={sipConsistency} onChange={setSipConsistency} type="number" />
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Behavior Insights</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {insights.map((item) => <li key={item} className="border border-slate-200 rounded-lg p-3">{item}</li>)}
        </ul>
      </div>
    </div>
  );
}

function InvestorEducationPage({ posts, setPosts }) {
  const [commentText, setCommentText] = useState({});
  const [question, setQuestion] = useState("");
  const [quizDone, setQuizDone] = useState(false);

  const likePost = (id) => setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  const addComment = (id) => {
    const text = (commentText[id] || "").trim();
    if (!text) return;
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, comments: [...p.comments, text] } : p)));
    setCommentText((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="space-y-4">
      <PageCard title="Financial Education Section" subtitle="Advisor posts articles/videos/analysis/risk guides. Investors can like, comment, and ask questions." />
      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
            <p className="font-semibold">{post.title}</p>
            <p className="text-xs text-brand-700 mt-1">{post.type}</p>
            <p className="text-sm text-slate-600 mt-2">{post.summary}</p>
            <div className="mt-3 flex items-center gap-2">
              <button onClick={() => likePost(post.id)} className="px-3 py-1 rounded-lg border text-sm">Like ({post.likes})</button>
              <input
                value={commentText[post.id] || ""}
                onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                placeholder="Add comment"
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm flex-1"
              />
              <button onClick={() => addComment(post.id)} className="px-3 py-1 rounded-lg bg-brand-500 text-white text-sm">Comment</button>
            </div>
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {post.comments.map((c, idx) => <li key={`${post.id}-${idx}`} className="bg-slate-50 rounded px-2 py-1">{c}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
        <p className="font-semibold">Ask Advisor a Question</p>
        <div className="mt-2 flex gap-2">
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question" className="border border-slate-200 rounded-lg px-3 py-2 flex-1" />
          <button onClick={() => setQuestion("")} className="px-3 py-2 rounded-lg bg-brand-500 text-white">Send</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
        <p className="font-semibold">Quick learning challenge</p>
        <p className="text-sm text-slate-600 mt-2">Which fund type is usually best for tax saving under Section 80C?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["ELSS", "Liquid Fund", "Corporate Bond Fund"].map((option) => (
            <button
              key={option}
              onClick={() => setQuizDone(option === "ELSS")}
              className={`px-3 py-2 rounded-lg border text-sm ${quizDone && option === "ELSS" ? "bg-brand-50 border-brand-300 text-brand-700" : ""}`}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="text-sm mt-3 text-slate-700">{quizDone ? "Correct. ELSS combines tax benefit with equity exposure and a 3-year lock-in." : "Answer the challenge to unlock the learning badge."}</p>
      </div>
    </div>
  );
}

function AdminControlPanelPage({ funds, setFunds, adminData, refreshAdminData, refreshFunds, refreshAnalystData }) {
  const [advisors, setAdvisors] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [fraudUsers, setFraudUsers] = useState([
    { id: 1, name: "UserX", removed: false },
    { id: 2, name: "UserY", removed: false }
  ]);

  const [newFund, setNewFund] = useState({
    name: "",
    category: "Index",
    fundType: "Index",
    risk: "Moderate",
    returns1Y: "12",
    returns3Y: "11",
    returns5Y: "10",
    expenseRatio: "0.25",
    aum: "10000",
    fundHouse: "Nifty AMC"
  });

  useEffect(() => {
    setAdvisors((adminData?.advisors || []).map((advisor) => ({
      id: advisor.id,
      name: advisor.fullName,
      status: advisor.status
    })));
    setComplaints((adminData?.complaints || []).map((complaint) => ({
      id: complaint.id,
      text: complaint.message,
      status: complaint.status,
      userId: complaint.userId
    })));
  }, [adminData]);

  const approveAdvisor = async (id) => {
    await fetchJson(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "APPROVED" })
    });
    refreshAdminData();
  };
  const closeComplaint = async (id) => {
    await fetchJson(`/admin/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: "CLOSED" })
    });
    refreshAdminData();
  };
  const syncLiveData = async () => {
    setSyncing(true);
    try {
      const result = await fetchJson("/funds/live-sync", { method: "POST" });
      setSyncStatus(result);
      await Promise.all([refreshFunds(), refreshAdminData(), refreshAnalystData()]);
    } finally {
      setSyncing(false);
    }
  };
  const removeFraud = (id) => setFraudUsers((prev) => prev.map((u) => (u.id === id ? { ...u, removed: true } : u)));

  const addFund = async (e) => {
    e.preventDefault();
    if (!newFund.name.trim()) return;
    const saved = await fetchJson("/funds", {
      method: "POST",
      body: JSON.stringify({
        name: newFund.name,
        category: newFund.category,
        fundType: newFund.fundType,
        riskLevel: newFund.risk,
        returns1Y: Number(newFund.returns1Y),
        returns3Y: Number(newFund.returns3Y),
        returns5Y: Number(newFund.returns5Y),
        expenseRatio: Number(newFund.expenseRatio),
        aumCr: Number(newFund.aum),
        avgMonthlyIncome: 5000,
        roiScore: 70,
        rating: 4.0,
        reviewCount: 50,
        fundManager: "Admin Added",
        exitLoad: "Nil",
        lockInPeriod: "No lock-in",
        contractType: "Prototype contract",
        fundHouse: newFund.fundHouse,
        companies: ["Company A", "Company B"],
        sectorAllocation: { Others: 100 },
        growthPoints: [4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        riskMetrics: { stdDev: 8.3, beta: 0.7, sharpe: 0.6, alpha: 1.2 },
        reviews: ["Admin added fund"]
      })
    });
    setFunds((prev) => [...prev, normalizeFund(saved)]);
    setNewFund({ ...newFund, name: "" });
  };

  return (
    <div className="space-y-4">
      <PageCard title="Admin Control Panel" subtitle="Approve advisors, update fund data, monitor statistics, resolve complaints, remove fraudulent accounts." />

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Live market data sync</p>
          <p className="text-sm text-slate-600">Pull latest NAV data from AMFI and refresh investor/analyst views.</p>
          {syncStatus ? (
            <p className="text-xs text-slate-500 mt-2">
              {syncStatus.message} Last sync: {formatDate(syncStatus.syncedAt)} • Records: {syncStatus.recordsProcessed} • Matched: {syncStatus.fundsMatched}
            </p>
          ) : null}
        </div>
        <button onClick={syncLiveData} disabled={syncing} className="px-4 py-2 rounded-lg bg-brand-500 text-white disabled:opacity-60">
          {syncing ? "Syncing..." : "Sync Live NAV Data"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Mis-selling Flags" value={String(adminData?.misSellingFlags || 0)} />
        <StatCard label="Unclaimed Amount" value={`Rs ${(adminData?.unclaimedAmountCr || 0).toFixed(1)} Cr`} />
        <StatCard label="Live Funds Covered" value={String(adminData?.liveFundsCovered || 0)} />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
        <p className="font-semibold mb-3">Compliance and trust actions</p>
        <div className="grid md:grid-cols-3 gap-3">
          {(adminData?.complianceAlerts || []).map((alert) => (
            <div key={alert.title} className="border border-slate-200 rounded-xl p-3">
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm text-slate-600 mt-2">{alert.description}</p>
              <p className="text-xs text-brand-700 mt-3">Severity: {alert.severity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: investors get unsuitable recommendations</p>
          <p className="text-sm text-slate-600 mt-2">Admin tracks mis-selling flags, advisor approvals, and fund suitability visibility.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: trust breaks when issues are ignored</p>
          <p className="text-sm text-slate-600 mt-2">Complaints, fraud review, and dormant-money follow-up make operations transparent.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: stale market data</p>
          <p className="text-sm text-slate-600 mt-2">Live AMFI sync keeps fund NAV data fresh for the rest of the platform.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold mb-2">Approve Advisors</p>
          {advisors.map((a) => (
            <div key={a.id} className="flex justify-between items-center text-sm border-b border-slate-100 py-2">
              <span>{a.name} ({a.status})</span>
              <button onClick={() => approveAdvisor(a.id)} className="text-xs px-2 py-1 border rounded">Approve</button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold mb-2">User Complaints</p>
          {complaints.map((c) => (
            <div key={c.id} className="flex justify-between items-center text-sm border-b border-slate-100 py-2">
              <span>{c.text} ({c.status})</span>
              <button onClick={() => closeComplaint(c.id)} className="text-xs px-2 py-1 border rounded">Resolve</button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold mb-2">Fraud Monitoring</p>
          {fraudUsers.map((u) => (
            <div key={u.id} className="flex justify-between items-center text-sm border-b border-slate-100 py-2">
              <span>{u.name} {u.removed ? "(Removed)" : ""}</span>
              <button onClick={() => removeFraud(u.id)} className="text-xs px-2 py-1 border rounded">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={addFund} className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 grid md:grid-cols-3 gap-3">
        <Input label="Fund Name" value={newFund.name} onChange={(v) => setNewFund((p) => ({ ...p, name: v }))} />
        <Input label="Category" value={newFund.category} onChange={(v) => setNewFund((p) => ({ ...p, category: v }))} />
        <Select label="Fund Type" value={newFund.fundType} onChange={(v) => setNewFund((p) => ({ ...p, fundType: v }))} options={["Equity", "Debt", "Hybrid", "Index", "ELSS"]} />
        <Select label="Risk" value={newFund.risk} onChange={(v) => setNewFund((p) => ({ ...p, risk: v }))} options={["Low to Moderate", "Moderate", "Moderate to High", "High"]} />
        <Input label="1Y Return" value={newFund.returns1Y} onChange={(v) => setNewFund((p) => ({ ...p, returns1Y: v }))} type="number" />
        <Input label="3Y Return" value={newFund.returns3Y} onChange={(v) => setNewFund((p) => ({ ...p, returns3Y: v }))} type="number" />
        <Input label="5Y Return" value={newFund.returns5Y} onChange={(v) => setNewFund((p) => ({ ...p, returns5Y: v }))} type="number" />
        <Input label="Expense Ratio" value={newFund.expenseRatio} onChange={(v) => setNewFund((p) => ({ ...p, expenseRatio: v }))} type="number" />
        <Input label="AUM (Cr)" value={newFund.aum} onChange={(v) => setNewFund((p) => ({ ...p, aum: v }))} type="number" />
        <Input label="Fund House" value={newFund.fundHouse} onChange={(v) => setNewFund((p) => ({ ...p, fundHouse: v }))} />
        <button className="md:col-span-3 bg-brand-500 text-white rounded-lg py-2">Add / Update Fund Data</button>
      </form>
    </div>
  );
}

function AdvisorDeskPage({ funds, riskProfile, advisorData }) {
  const [client, setClient] = useState("Rahul");
  const [suggestedFundId, setSuggestedFundId] = useState(String(funds[0]?.id || ""));
  const [message, setMessage] = useState("Suggested a diversified mix based on risk profile.");
  const [sent, setSent] = useState([]);

  const clients = advisorData?.clients?.length
    ? advisorData.clients.map((item) => ({
        name: item.name,
        portfolio: currency(item.currentValue),
        risk: item.profileHint
      }))
    : [
        { name: "Rahul", portfolio: "Rs 8.2L", risk: riskProfile || "Moderate" },
        { name: "Kiran", portfolio: "Rs 12.6L", risk: "Aggressive" },
        { name: "Anita", portfolio: "Rs 5.1L", risk: "Conservative" }
      ];

  const sendRecommendation = () => {
    const fund = funds.find((f) => String(f.id) === suggestedFundId);
    if (!fund) return;
    setSent((prev) => [`${client}: ${fund.name} -> ${message}`, ...prev]);
  };

  return (
    <div className="space-y-4">
      <PageCard title="Advisor Dashboard" subtitle="View client portfolio, suggest funds, send personalized recommendations, track risk profile, generate reports." />

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold mb-2">Client Portfolio Snapshot</p>
          {clients.map((c) => (
            <div key={c.name} className="border border-slate-200 rounded-lg p-3 mb-2 text-sm">
              <p className="font-medium">{c.name}</p>
              <p>Portfolio: {c.portfolio}</p>
              <p>Risk Profile: {c.risk}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 space-y-3">
          <Select label="Client" value={client} onChange={setClient} options={clients.map((c) => c.name)} />
          <Select label="Suggest Fund" value={suggestedFundId} onChange={setSuggestedFundId} options={funds.map((f) => String(f.id))} />
          <Input label="Recommendation Note" value={message} onChange={setMessage} />
          {funds.find((f) => String(f.id) === suggestedFundId) ? (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
              <p className="font-medium">Suitability explanation</p>
              <p className="mt-2">{funds.find((f) => String(f.id) === suggestedFundId)?.recommendationReason}</p>
              <p className="mt-2 text-xs text-slate-500">
                Why not for some users: {funds.find((f) => String(f.id) === suggestedFundId)?.expenseRatio > 1 ? "cost is relatively high" : funds.find((f) => String(f.id) === suggestedFundId)?.risk === "High" ? "volatility may be too high for cautious investors" : "compare overlap with existing holdings before adding"}
              </p>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button onClick={sendRecommendation} className="px-3 py-2 rounded-lg bg-brand-500 text-white">Send Recommendation</button>
            <button className="px-3 py-2 rounded-lg border">Generate PDF Report</button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: advice is too generic</p>
          <p className="text-sm text-slate-600 mt-2">Client snapshots and risk hints help the advisor tailor each recommendation.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: users do not know why a fund fits</p>
          <p className="text-sm text-slate-600 mt-2">Suitability explanation and why-not logic make recommendations easier to trust.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: education is disconnected from action</p>
          <p className="text-sm text-slate-600 mt-2">Advisor guidance links content, portfolio review, and personalized next steps.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
        <p className="font-semibold">Sent Recommendations</p>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Metric label="Active Clients" value={advisorData?.activeClients || 0} />
          <Metric label="Recommendations Sent" value={advisorData?.recommendationsSent || 0} />
          <Metric label="Risk Reports" value={advisorData?.riskReports || 0} />
        </div>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          {(advisorData?.actions || []).map((item) => (
            <div key={item.title} className="border border-slate-200 rounded-lg p-3 text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="text-slate-600 mt-2">{item.explanation}</p>
            </div>
          ))}
        </div>
        <ul className="mt-2 space-y-2 text-sm">
          {sent.map((s) => <li key={s} className="border border-slate-200 rounded p-2">{s}</li>)}
        </ul>
      </div>
    </div>
  );
}

function AdvisorEducationHubPage({ posts, setPosts, advisorUserId }) {
  const [title, setTitle] = useState("New Risk Guide");
  const [type, setType] = useState("Risk Guide");
  const [summary, setSummary] = useState("How volatility metrics help investor decisions.");

  const addPost = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const saved = await fetchJson("/advisor/posts", {
      method: "POST",
      body: JSON.stringify({
        advisorId: advisorUserId,
        title,
        postType: type,
        summary
      })
    });
    setPosts((prev) => [normalizePost(saved), ...prev]);
    setTitle("");
  };

  return (
    <div className="space-y-4">
      <PageCard title="Advisor Education Hub" subtitle="Post articles, videos, market analysis, and risk guides for investors." />
      <form onSubmit={addPost} className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 grid md:grid-cols-2 gap-3">
        <Input label="Title" value={title} onChange={setTitle} />
        <Select label="Content Type" value={type} onChange={setType} options={["Article", "Video", "Market Analysis", "Risk Guide"]} />
        <div className="md:col-span-2">
          <Input label="Summary" value={summary} onChange={setSummary} />
        </div>
        <button className="md:col-span-2 bg-brand-500 text-white rounded-lg py-2">Publish Content</button>
      </form>
    </div>
  );
}

function AnalystLabPage({ funds, analystData }) {
  const [simulate, setSimulate] = useState(false);
  const [rebalancingOn, setRebalancingOn] = useState(true);
  const [sentiment, setSentiment] = useState("Neutral");
  const fallbackMonteCarloSeries = useMemo(() => {
    const arr = [100];
    for (let i = 1; i < 12; i += 1) {
      const randomShock = (Math.random() * 8 - 3).toFixed(2);
      arr.push(Math.max(70, Number((arr[i - 1] * (1 + Number(randomShock) / 100)).toFixed(2))));
    }
    return arr;
  }, [simulate]);
  const avgNav = analystData?.averageOneYearReturn?.toFixed(2) || (funds.reduce((acc, f) => acc + f.returns1Y, 0) / (funds.length || 1)).toFixed(2);
  const monteCarloSeries = analystData?.monteCarloSeries || fallbackMonteCarloSeries;
  const lastSync = funds
    .map((fund) => fund.lastSyncedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  return (
    <div className="space-y-4">
      <PageCard title="Data Analyst: Explainable Analytics Lab" subtitle="This page translates fund data into simple findings, top candidates, and beginner-friendly explanations." />

      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Average 1Y Return" value={`${avgNav}%`} />
        <StatCard label="Market Sentiment" value={sentiment} />
        <StatCard label="Rebalancing Engine" value={rebalancingOn ? "Active" : "Paused"} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="text-sm text-slate-500">Easy summary</p>
          <p className="mt-2 text-slate-800 font-medium">{analystData?.easiestSummary || "No summary available yet."}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="text-sm text-slate-500">Market view</p>
          <p className="mt-2 text-slate-800 font-medium">{analystData?.marketView || "Waiting for enough data to explain market conditions."}</p>
          <p className="mt-2 text-xs text-slate-500">Last live sync: {formatDate(lastSync)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setSimulate((v) => !v)} className="px-3 py-2 border rounded-lg">Run Monte Carlo</button>
        <button onClick={() => setRebalancingOn((v) => !v)} className="px-3 py-2 border rounded-lg">Toggle Rebalancing</button>
        <Select label="" value={sentiment} onChange={setSentiment} options={["Bullish", "Neutral", "Bearish"]} />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Monte Carlo Path (Prototype)</p>
        <LineChart values={monteCarloSeries} />
      </div>

      {analystData?.categoryReturns ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
          <p className="font-semibold">Category-Wise Returns</p>
          <p className="text-sm text-slate-500 mt-1">Higher bars mean stronger average medium-term performance for that category.</p>
          <BarChart items={Object.entries(analystData.categoryReturns).map(([label, value]) => ({ label, value }))} color="#2563eb" />
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-4">
        {(analystData?.beginnerInsights || []).map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
            <p className="font-semibold">{item.title}</p>
            <p className="text-sm text-slate-600 mt-2">{item.explanation}</p>
            <p className="text-sm text-brand-700 mt-3">{item.action}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: data is too technical</p>
          <p className="text-sm text-slate-600 mt-2">This lab converts raw numbers into plain-English summaries and investor-friendly actions.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: users only chase returns</p>
          <p className="text-sm text-slate-600 mt-2">Risk-adjusted insights show why cost, quality, and consistency matter too.</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
          <p className="font-semibold">Problem: live market data feels abstract</p>
          <p className="text-sm text-slate-600 mt-2">AMFI NAV sync, category trends, and top-fund reasons connect data to practical decisions.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Problems this analysis is solving</p>
        <div className="grid md:grid-cols-4 gap-3 mt-4">
          {[
            "Too many similar funds",
            "Poor risk explainability",
            "Hidden sector concentration",
            "Users chasing short-term returns"
          ].map((item) => (
            <div key={item} className="border border-slate-200 rounded-lg p-3 text-sm text-slate-700">{item}</div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5">
        <p className="font-semibold">Top funds right now</p>
        <p className="text-sm text-slate-500 mt-1">These are the strongest overall candidates in the current dataset after balancing return, cost, and quality.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2">Fund</th>
                <th className="text-left px-3 py-2">Risk</th>
                <th className="text-left px-3 py-2">3Y Return</th>
                <th className="text-left px-3 py-2">Expense</th>
                <th className="text-left px-3 py-2">NAV</th>
                <th className="text-left px-3 py-2">Fit</th>
              </tr>
            </thead>
            <tbody>
              {(analystData?.topFunds || []).map((fund) => (
                <tr key={fund.id} className="border-t border-slate-100">
                  <td className="px-3 py-3">
                    <p className="font-medium">{fund.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{fund.reason}</p>
                  </td>
                  <td className="px-3 py-3">{fund.riskLevel}</td>
                  <td className="px-3 py-3">{fund.returns3Y}%</td>
                  <td className="px-3 py-3">{fund.expenseRatio}%</td>
                  <td className="px-3 py-3">{fund.latestNav ? `Rs ${fund.latestNav}` : "Pending"}</td>
                  <td className="px-3 py-3">{fund.recommendationLabel} ({fund.recommendationScore})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoleRoute({ user, role, children }) {
  if (user.role !== role) return <Navigate to={roleHomePath[user.role]} replace />;
  return children;
}

function ProfilePage({ user, onProfileSave }) {
  const [form, setForm] = useState(user);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    onProfileSave(form);
    navigate(roleHomePath[form.role]);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft max-w-2xl">
      <h2 className="text-xl font-semibold">Edit Profile</h2>
      <form onSubmit={submit} className="mt-5 grid md:grid-cols-2 gap-4">
        <Input label="Name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} />
        <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} type="email" />
        <label className="block text-sm text-slate-700">
          <span className="mb-1 block">Role</span>
          <input value={form.role} disabled className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-500" />
        </label>
        <Input label="Mobile" value={form.mobile || "9876543210"} onChange={(v) => setForm((p) => ({ ...p, mobile: v }))} type="tel" />
        <button className="md:col-span-2 bg-brand-500 text-white py-2.5 rounded-lg font-medium">Save Profile</button>
      </form>
    </div>
  );
}

function Protected({ isLoggedIn, children }) {
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return children;
}

function PageCard({ title, subtitle }) {
  return <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft"><h2 className="text-xl font-semibold text-slate-800">{title}</h2><p className="text-sm text-slate-600 mt-1">{subtitle}</p></div>;
}

function Input({ label, value, onChange, type = "text", required = true }) {
  return <label className="block text-sm text-slate-700"><span className="mb-1 block">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" required={required} /></label>;
}

function Select({ label, value, onChange, options }) {
  return <label className="block text-sm text-slate-700"><span className="mb-1 block">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function StatCard({ label, value }) {
  return <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-soft"><p className="text-slate-500 text-sm">{label}</p><h3 className="text-2xl font-semibold text-slate-800 mt-2">{value}</h3></div>;
}

function Metric({ label, value }) {
  return <div className="bg-slate-50 rounded-lg p-3 border border-slate-100"><p className="text-xs text-slate-500">{label}</p><p className="font-medium text-slate-800 mt-1">{value}</p></div>;
}

function TooltipMetric({ label, value, help }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100" title={help}>
      <p className="text-[11px] text-slate-500">{label} <span className="text-brand-700">ⓘ</span></p>
      <p className="text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

function IconButton({ icon, label, onClick, active = false }) {
  return <button title={label} onClick={onClick} className={`h-9 w-9 rounded-lg border text-sm ${active ? "bg-brand-50 border-brand-300 text-brand-700" : "bg-white border-slate-200"}`}>{icon}</button>;
}

function BarChart({ items, color = "#00b386" }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-2 mt-2">
      {items.map((item) => (
        <div key={item.label} className="text-sm">
          <div className="flex justify-between text-xs mb-1"><span>{item.label}</span><span>{item.value}</span></div>
          <div className="h-2 bg-slate-100 rounded">
            <div className="h-2 rounded" style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LineChart({ values }) {
  const width = 420;
  const height = 160;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * width;
    const y = height - ((v - min) / (max - min || 1)) * (height - 16) - 8;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 bg-slate-50 rounded-lg border border-slate-200 mt-3">
      <polyline fill="none" stroke="#00b386" strokeWidth="3" points={points} />
    </svg>
  );
}

function PieChart({ data }) {
  const entries = Object.entries(data || {}).filter(([, v]) => v > 0);
  const total = entries.reduce((acc, [, v]) => acc + v, 0) || 1;

  let start = 0;
  const segments = entries.map(([name, value], idx) => {
    const pct = (value / total) * 100;
    const end = start + pct;
    const color = ["#00b386", "#2563eb", "#f59e0b", "#ef4444", "#7c3aed", "#14b8a6"][idx % 6];
    const seg = `${color} ${start}% ${end}%`;
    start = end;
    return { name, value, color, seg };
  });

  const gradient = `conic-gradient(${segments.map((s) => s.seg).join(",")})`;

  return (
    <div className="mt-3 grid md:grid-cols-[180px_1fr] gap-4 items-center">
      <div className="h-40 w-40 rounded-full border border-slate-200" style={{ background: gradient }} />
      <ul className="space-y-1 text-sm">
        {segments.map((s) => (
          <li key={s.name} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
            <span>{s.name}: {s.value.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function allocationBy(items, keyFn) {
  if (!items.length) return { Cash: 100 };
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  const total = items.length;
  const allocation = {};
  Object.keys(counts).forEach((k) => { allocation[k] = (counts[k] / total) * 100; });
  return allocation;
}

function aggregateSectors(items) {
  if (!items.length) return { Cash: 100 };
  const totals = {};
  items.forEach((item) => {
    Object.entries(item.sectorAllocation).forEach(([sector, pct]) => {
      totals[sector] = (totals[sector] || 0) + pct;
    });
  });
  const factor = Object.values(totals).reduce((acc, v) => acc + v, 0) || 1;
  const normalized = {};
  Object.entries(totals).forEach(([k, v]) => { normalized[k] = (v / factor) * 100; });
  return normalized;
}

function buildAiInsights({ selected, assetAllocation, sectorAllocation }) {
  if (!selected.length) return ["No enrolled funds yet. Enroll funds to receive AI insights."];
  const insights = [];
  const categoryAvg = selected.reduce((acc, fund) => acc + fund.returns3Y, 0) / selected.length;

  const underperform = selected.find((fund) => fund.returns3Y < categoryAvg - 2);
  if (underperform) insights.push(`${underperform.name} is underperforming compared to your portfolio category average.`);

  const equityExposure = (assetAllocation.Equity || 0) + (assetAllocation.ELSS || 0);
  if (equityExposure >= 80) insights.push("Your portfolio is over 80% equity. Consider debt/hybrid diversification.");

  const bankingExposure = sectorAllocation.Banking || 0;
  if (bankingExposure > 35) insights.push("You are overexposed to banking sector. Rebalance sector concentration.");

  if (!insights.length) insights.push("Portfolio allocation looks balanced for current profile.");
  return insights;
}

function shortName(name) {
  return name.split(" ").slice(0, 2).join(" ");
}

function calculateXirr(invested, current, years) {
  if (!invested || !current || !years) return 0;
  return (Math.pow(current / invested, 1 / years) - 1) * 100;
}

function futureValue(monthlySip, annualReturn, years) {
  const r = annualReturn / 12 / 100;
  const n = years * 12;
  if (!r || !n) return monthlySip * n;
  return monthlySip * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

function requiredSip(targetCorpus, annualReturn, years) {
  const r = annualReturn / 12 / 100;
  const n = years * 12;
  if (!r || !n) return targetCorpus / (n || 1);
  return targetCorpus / (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
}

function estimateYearsToGoal(monthlySip, targetCorpus, annualReturn) {
  if (monthlySip <= 0 || targetCorpus <= 0) return 0;
  let years = 1;
  while (years <= 40) {
    if (futureValue(monthlySip, annualReturn, years) >= targetCorpus) return years;
    years += 0.5;
  }
  return 40;
}

function currency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
}

export default function App() {
  const [funds, setFunds] = useState([]);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({ id: 1, name: "Demo User", email: "student@demo.com", role: "Investor", mobile: "9876543210" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [compareIds, setCompareIds] = useState([]);
  const [navHistories, setNavHistories] = useState({});
  const [enrolledFundIds, setEnrolledFundIds] = useState([]);
  const [sipAmount, setSipAmount] = useState("5000");
  const [sipState, setSipState] = useState({ status: "Active", stepUpRate: 10, autoDebit: true, nextDate: "2026-03-05" });
  const [portfolioData, setPortfolioData] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [overlapData, setOverlapData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [advisorData, setAdvisorData] = useState(null);
  const [analystData, setAnalystData] = useState(null);
  const [marketTicker, setMarketTicker] = useState(demoMarketTicker);
  const [toast, setToast] = useState("");

  const [notifications, setNotifications] = useState([
    { type: "nav", label: "NAV Updates", message: "2 tracked funds changed NAV today.", enabled: true, read: false },
    { type: "crash", label: "Market Crash Alert", message: "Nifty corrected 3.2% intraday.", enabled: true, read: false },
    { type: "rebalance", label: "Rebalancing Suggestion", message: "Portfolio equity crossed 80% threshold.", enabled: true, read: false },
    { type: "sip", label: "SIP Due Reminder", message: "Next SIP due on 5th March 2026.", enabled: true, read: true },
    { type: "dividend", label: "Dividend Declared", message: "One debt fund announced payout.", enabled: false, read: true }
  ]);

  const refreshFunds = async () => {
    const data = await fetchJson("/funds");
    const normalized = data.map(normalizeFund);
    setFunds(normalized);
    setCompareIds((prev) => (prev.length ? prev.filter((id) => normalized.some((fund) => fund.id === id)) : normalized.slice(0, 3).map((fund) => fund.id)));
  };

  const refreshInvestorExtras = async (userId) => {
    const [portfolio, recommendations, watchlist, monthly] = await Promise.all([
      fetchJson(`/investor/${userId}/portfolio`).catch(() => null),
      fetchJson(`/investor/${userId}/recommendations`).catch(() => null),
      fetchJson(`/investor/${userId}/watchlist`).catch(() => []),
      fetchJson(`/investor/${userId}/monthly-summary`).catch(() => null)
    ]);
    setPortfolioData(portfolio);
    setRecommendationData(recommendations);
    setWatchlistItems(watchlist || []);
    setMonthlySummary(monthly);
    if (portfolio?.holdings) {
      setEnrolledFundIds((portfolio.holdings || []).map((holding) => holding.fundId));
    }
  };

  useEffect(() => {
    refreshFunds()
      .catch(() => {});

    fetchJson("/advisor/posts")
      .then((data) => setPosts(data.map(normalizePost)))
      .catch(() => {});

  }, []);

  const refreshAdminData = () => {
    return fetchJson("/admin/dashboard")
      .then(setAdminData)
      .catch(() => {});
  };

  const refreshAdvisorData = () => {
    return fetchJson("/advisor/dashboard")
      .then(setAdvisorData)
      .catch(() => {});
  };

  const refreshAnalystData = () => {
    return fetchJson("/analyst/dashboard")
      .then(setAnalystData)
      .catch(() => {});
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (user.id && user.role === "Investor") {
      refreshInvestorExtras(user.id)
        .catch(() => {});
    }

    if (user.role === "Admin") {
      refreshAdminData();
    }

    if (user.role === "Financial Advisor") {
      refreshAdvisorData();
    }

    if (user.role === "Data Analyst") {
      refreshAnalystData();
    }
  }, [isLoggedIn, user.id, user.role]);

  useEffect(() => {
    if (!isLoggedIn || user.role !== "Investor" || compareIds.length < 2) {
      setOverlapData(null);
    } else {
      const query = compareIds.map((id) => `fundIds=${id}`).join("&");
      fetchJson(`/investor/overlap?${query}`)
        .then(setOverlapData)
        .catch(() => setOverlapData(null));
    }
  }, [compareIds, isLoggedIn, user.role]);

  useEffect(() => {
    if (!compareIds.length) return;
    Promise.all(compareIds.map((id) => fetchJson(`/funds/${id}/history`).catch(() => [])))
      .then((responses) => {
        const next = {};
        compareIds.forEach((id, index) => {
          next[id] = responses[index];
        });
        setNavHistories((prev) => ({ ...prev, ...next }));
      })
      .catch(() => {});
  }, [compareIds]);

  const toggleWatchlist = async (fundId) => {
    if (!user.id) return;
    const exists = watchlistItems.some((item) => item.fundId === fundId);
    if (exists) {
      await fetchJson(`/investor/${user.id}/watchlist/${fundId}`, { method: "DELETE" });
    } else {
      await fetchJson("/investor/watchlist", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, fundId })
      });
    }
    refreshInvestorExtras(user.id);
  };

  const investInFund = async (fundId, amount, mode) => {
    if (!user.id) return;
    const result = await fetchJson("/investor/invest", {
      method: "POST",
      body: JSON.stringify({ userId: user.id, fundId, amount, mode })
    });
    await refreshInvestorExtras(user.id);
    setToast(result.message || "Investment recorded.");
    window.setTimeout(() => setToast(""), 2500);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setPortfolioData(null);
    setRecommendationData(null);
    setWatchlistItems([]);
    setMonthlySummary(null);
    setOverlapData(null);
  };

  const shell = (content) => (
      <Protected isLoggedIn={isLoggedIn}>
      <AppShell
        user={user}
        onLogout={logout}
        notifications={notifications}
        setNotifications={setNotifications}
        marketTicker={marketTicker}
      >
        {toast ? (
          <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            {toast}
          </div>
        ) : null}
        {content}
      </AppShell>
    </Protected>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={(newUser) => { setUser((u) => ({ ...u, ...newUser })); setIsLoggedIn(true); }} />}
      />
      <Route path="/signup" element={<SignupPage onLogin={(newUser) => { setUser((u) => ({ ...u, ...newUser })); setIsLoggedIn(true); }} />} />

      <Route path="/dashboard" element={shell(<Dashboard user={user} portfolioData={portfolioData} recommendationData={recommendationData} watchlistItems={watchlistItems} analystData={analystData} adminData={adminData} advisorData={advisorData} />)} />
      <Route path="/profile" element={shell(<ProfilePage user={user} onProfileSave={setUser} />)} />

      <Route path="/investor/discovery" element={shell(<RoleRoute user={user} role="Investor"><InvestorDiscoveryPage funds={funds} compareIds={compareIds} setCompareIds={setCompareIds} enrolledFundIds={enrolledFundIds} watchlistFundIds={watchlistItems.map((item) => item.fundId)} onToggleWatchlist={toggleWatchlist} onInvest={investInFund} /></RoleRoute>)} />
      <Route path="/investor/risk-quiz" element={shell(<RoleRoute user={user} role="Investor"><RiskQuizPage funds={funds} riskProfile={riskProfile} setRiskProfile={setRiskProfile} /></RoleRoute>)} />
      <Route path="/investor/recommendations" element={shell(<RoleRoute user={user} role="Investor"><RecommendationsPage recommendationData={recommendationData} overlapData={overlapData} compareIds={compareIds} setCompareIds={setCompareIds} /></RoleRoute>)} />
      <Route path="/investor/compare" element={shell(<RoleRoute user={user} role="Investor"><CompareDashboardPage funds={funds} compareIds={compareIds} setCompareIds={setCompareIds} navHistories={navHistories} /></RoleRoute>)} />
      <Route path="/investor/watchlist" element={shell(<RoleRoute user={user} role="Investor"><WatchlistPage watchlistItems={watchlistItems} monthlySummary={monthlySummary} onRemove={toggleWatchlist} /></RoleRoute>)} />
      <Route path="/investor/portfolio" element={shell(<RoleRoute user={user} role="Investor"><PortfolioAnalyticsPage portfolioData={portfolioData} sipAmount={sipAmount} setSipAmount={setSipAmount} /></RoleRoute>)} />
      <Route path="/investor/goals" element={shell(<RoleRoute user={user} role="Investor"><GoalPlannerPage sipAmount={sipAmount} /></RoleRoute>)} />
      <Route path="/investor/sip" element={shell(<RoleRoute user={user} role="Investor"><SipManagementPage sipAmount={sipAmount} setSipAmount={setSipAmount} sipState={sipState} setSipState={setSipState} /></RoleRoute>)} />
      <Route path="/investor/alerts" element={shell(<RoleRoute user={user} role="Investor"><AlertsPage notifications={notifications} setNotifications={setNotifications} /></RoleRoute>)} />
      <Route path="/investor/tax" element={shell(<RoleRoute user={user} role="Investor"><TaxEstimatorPage enrolledFundIds={enrolledFundIds} funds={funds} /></RoleRoute>)} />
      <Route path="/investor/behavior" element={shell(<RoleRoute user={user} role="Investor"><BehaviorAnalyticsPage /></RoleRoute>)} />
      <Route path="/investor/education" element={shell(<RoleRoute user={user} role="Investor"><InvestorEducationPage posts={posts} setPosts={setPosts} /></RoleRoute>)} />

      <Route path="/admin/control" element={shell(<RoleRoute user={user} role="Admin"><AdminControlPanelPage funds={funds} setFunds={setFunds} adminData={adminData} refreshAdminData={refreshAdminData} refreshFunds={refreshFunds} refreshAnalystData={refreshAnalystData} /></RoleRoute>)} />

      <Route path="/advisor/desk" element={shell(<RoleRoute user={user} role="Financial Advisor"><AdvisorDeskPage funds={funds} riskProfile={riskProfile} advisorData={advisorData} /></RoleRoute>)} />
      <Route path="/advisor/education" element={shell(<RoleRoute user={user} role="Financial Advisor"><AdvisorEducationHubPage posts={posts} setPosts={setPosts} advisorUserId={user.id} /></RoleRoute>)} />

      <Route path="/analyst/lab" element={shell(<RoleRoute user={user} role="Data Analyst"><AnalystLabPage funds={funds} analystData={analystData} /></RoleRoute>)} />

      <Route path="*" element={<Navigate to={isLoggedIn ? roleHomePath[user.role] : "/"} replace />} />
    </Routes>
  );
}
