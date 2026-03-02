import { useMemo, useState } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { advisorEducationSeed, fundTypes, insightCards, mutualFunds } from "./data/mockData";

const roles = ["Investor", "Admin", "Financial Advisor", "Data Analyst"];

const roleMenus = {
  Investor: [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Fund Discovery", path: "/investor/discovery" },
    { label: "Risk Quiz", path: "/investor/risk-quiz" },
    { label: "Compare Dashboard", path: "/investor/compare" },
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

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("student@demo.com");
  const [password, setPassword] = useState("123456");
  const [role, setRole] = useState("Investor");

  const submit = (e) => {
    e.preventDefault();
    onLogin({ name: "Demo User", email, role });
    navigate("/dashboard");
  };

  return (
    <AuthLayout title="Login" subtitle="Access your personalized mutual fund workspace">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input label="Password" value={password} onChange={setPassword} type="password" />
        <Select label="Login as" value={role} onChange={setRole} options={roles} />
        <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl transition-colors">Login</button>
      </form>
      <p className="text-sm text-center text-slate-600 mt-4">
        New user? <Link to="/signup" className="text-brand-700 font-medium">Create account</Link>
      </p>
    </AuthLayout>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  const submit = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <AuthLayout title="Sign Up" subtitle="Register quickly to start exploring mutual funds">
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full Name" value={name} onChange={setName} />
        <Input label="Email" value={email} onChange={setEmail} type="email" />
        <Input label="Mobile Number" value={mobile} onChange={setMobile} type="tel" />
        <button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium py-2.5 rounded-xl transition-colors">Create Account</button>
      </form>
      <p className="text-sm text-center text-slate-600 mt-4">
        Already registered? <Link to="/" className="text-brand-700 font-medium">Back to login</Link>
      </p>
    </AuthLayout>
  );
}

function AppShell({ user, onRoleChange, onLogout, children, notifications, setNotifications }) {
  const navigate = useNavigate();
  const location = useLocation();
  const menu = roleMenus[user.role];
  const [tipsVisible, setTipsVisible] = useState(true);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const onSwitchRole = (nextRole) => {
    onRoleChange(nextRole);
    if (location.pathname !== "/profile") {
      navigate(roleHomePath[nextRole]);
    }
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(0,208,156,0.12),transparent_35%),#f8fafc]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Mutual Funds Prototype</p>
            <h1 className="text-lg md:text-xl font-semibold text-slate-800">Investment Perception Platform</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={markAllRead} className="h-9 px-3 rounded-lg border border-slate-200 text-sm bg-white">
              Alerts {unreadCount ? `(${unreadCount})` : "(0)"}
            </button>
            <IconButton active={tipsVisible} onClick={() => setTipsVisible((v) => !v)} label="Toggle tips" icon="✦" />
            <select
              value={user.role}
              onChange={(e) => onSwitchRole(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              {roles.map((role) => <option key={role}>{role}</option>)}
            </select>
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

function Dashboard({ user }) {
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
      <RoleSummary role={user.role} />
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

function InvestorDiscoveryPage({ funds, compareIds, setCompareIds, enrolledFundIds, setEnrolledFundIds }) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [houseFilter, setHouseFilter] = useState("All");
  const [maxExpense, setMaxExpense] = useState("2");
  const [minRating, setMinRating] = useState("0");
  const [minReturn, setMinReturn] = useState("0");

  const houses = useMemo(() => ["All", ...new Set(funds.map((f) => f.fundHouse))], [funds]);

  const filtered = useMemo(() => {
    return funds.filter((fund) => {
      const q = fund.name.toLowerCase().includes(query.toLowerCase());
      const r = riskFilter === "All" ? true : fund.risk === riskFilter;
      const t = typeFilter === "All" ? true : fund.fundType === typeFilter;
      const h = houseFilter === "All" ? true : fund.fundHouse === houseFilter;
      const e = fund.expenseRatio <= Number.parseFloat(maxExpense || "2");
      const rt = fund.rating >= Number.parseFloat(minRating || "0");
      const re = fund.returns3Y >= Number.parseFloat(minReturn || "0");
      return q && r && t && h && e && rt && re;
    });
  }, [funds, query, riskFilter, typeFilter, houseFilter, maxExpense, minRating, minReturn]);

  const toggleCompare = (id) => {
    setCompareIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(-4)));
  };

  const toggleEnroll = (id) => {
    setEnrolledFundIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      <PageCard title="Investor: Fund Discovery + Categorization" subtitle="Filter by risk, return, fund house, expense ratio, rating. Includes risk metrics with beginner tooltips." />

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4 grid md:grid-cols-3 gap-3">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fund" className="border border-slate-200 rounded-lg px-3 py-2" />
        <Select label="Risk" value={riskFilter} onChange={setRiskFilter} options={["All", "Low to Moderate", "Moderate", "Moderate to High", "High"]} />
        <Select label="Fund Type" value={typeFilter} onChange={setTypeFilter} options={["All", "Equity", "Debt", "Hybrid", "Index", "ELSS"]} />
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
              </div>
              <div className="flex gap-2">
                <IconButton icon="≋" label="Compare" onClick={() => toggleCompare(fund.id)} active={compareIds.includes(fund.id)} />
                <IconButton icon="◎" label="Enroll" onClick={() => toggleEnroll(fund.id)} active={enrolledFundIds.includes(fund.id)} />
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

  const classify = () => {
    let score = 0;
    if (Number(age) < 30) score += 2;
    else if (Number(age) < 45) score += 1;

    if (Number(income) > 1800000) score += 2;
    else if (Number(income) > 800000) score += 1;

    if (Number(duration) >= 8) score += 2;
    else if (Number(duration) >= 4) score += 1;

    if (tolerance === "High") score += 2;
    if (tolerance === "Medium") score += 1;

    if (goal === "Wealth Creation" || goal === "Retirement") score += 1;

    const profile = score >= 7 ? "Aggressive" : score >= 4 ? "Moderate" : "Conservative";
    setResult(profile);
    setRiskProfile(profile);
  };

  const recommendations = useMemo(() => {
    if (!result) return [];
    const eligible = funds.filter((fund) => {
      if (result === "Conservative") return fund.fundType === "Debt" || fund.fundType === "Hybrid" || fund.risk === "Moderate";
      if (result === "Moderate") return fund.risk !== "High";
      return fund.fundType === "Equity" || fund.fundType === "ELSS" || fund.risk.includes("High");
    });
    return eligible.sort((a, b) => b.returns3Y - a.returns3Y).slice(0, 4);
  }, [result, funds]);

  return (
    <div className="space-y-4">
      <PageCard title="Risk Profiling Quiz" subtitle="Answer the quiz and get classified into Conservative, Moderate, or Aggressive." />
      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 grid md:grid-cols-2 gap-3">
        <Input label="Age" value={age} onChange={setAge} type="number" />
        <Input label="Annual Income (Rs)" value={income} onChange={setIncome} type="number" />
        <Input label="Investment Duration (Years)" value={duration} onChange={setDuration} type="number" />
        <Select label="Risk Tolerance" value={tolerance} onChange={setTolerance} options={["Low", "Medium", "High"]} />
        <Select label="Financial Goal" value={goal} onChange={setGoal} options={["Education", "House Purchase", "Retirement", "Vacation", "Wealth Creation"]} />
        <button onClick={classify} className="h-10 mt-6 bg-brand-500 text-white rounded-lg">Classify My Profile</button>
      </div>

      {result && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-5 space-y-3">
          <p className="text-lg font-semibold">Risk Profile: <span className="text-brand-700">{result}</span></p>
          <p className="text-sm text-slate-600">Recommended funds based on your profile:</p>
          <div className="grid md:grid-cols-2 gap-3">
            {recommendations.map((fund) => (
              <div key={fund.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                <p className="font-medium">{fund.name}</p>
                <p className="text-slate-600">{fund.risk} • 3Y: {fund.returns3Y}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompareDashboardPage({ funds, compareIds, setCompareIds }) {
  const visibleFunds = funds.filter((f) => compareIds.includes(f.id));

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
        </>
      )}
    </div>
  );
}

function PortfolioAnalyticsPage({ funds, enrolledFundIds, sipAmount, setSipAmount }) {
  const selected = funds.filter((f) => enrolledFundIds.includes(f.id));
  const totalInvested = Number(sipAmount || 0) * 36 * (selected.length || 1);
  const avgReturn = selected.length ? selected.reduce((acc, f) => acc + f.returns3Y, 0) / selected.length : 0;
  const currentValue = Math.round(totalInvested * (1 + avgReturn / 100 * 1.05));
  const pnl = totalInvested ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  const xirr = totalInvested ? calculateXirr(totalInvested, currentValue, 3) : 0;

  const assetAllocation = allocationBy(selected, (f) => f.fundType);
  const sectorAllocation = aggregateSectors(selected);
  const aiInsights = buildAiInsights({ selected, assetAllocation, sectorAllocation });

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
        <StatCard label="Funds" value={String(selected.length)} />
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
        <p className="font-semibold">AI-Powered Insights (Rule-based)</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {aiInsights.map((insight) => <li key={insight} className="border border-slate-200 rounded-lg p-3">{insight}</li>)}
        </ul>
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
    </div>
  );
}

function AdminControlPanelPage({ funds, setFunds }) {
  const [advisors, setAdvisors] = useState([
    { id: 1, name: "Meera", status: "Pending" },
    { id: 2, name: "Arjun", status: "Approved" }
  ]);
  const [complaints, setComplaints] = useState([
    { id: 1, text: "Incorrect NAV data", status: "Open" },
    { id: 2, text: "Spam recommendation message", status: "Open" }
  ]);
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

  const approveAdvisor = (id) => setAdvisors((prev) => prev.map((a) => (a.id === id ? { ...a, status: "Approved" } : a)));
  const closeComplaint = (id) => setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Closed" } : c)));
  const removeFraud = (id) => setFraudUsers((prev) => prev.map((u) => (u.id === id ? { ...u, removed: true } : u)));

  const addFund = (e) => {
    e.preventDefault();
    if (!newFund.name.trim()) return;
    const nextId = Math.max(...funds.map((f) => f.id)) + 1;
    setFunds((prev) => [
      ...prev,
      {
        id: nextId,
        name: newFund.name,
        category: newFund.category,
        fundType: newFund.fundType,
        risk: newFund.risk,
        returns1Y: Number(newFund.returns1Y),
        returns3Y: Number(newFund.returns3Y),
        returns5Y: Number(newFund.returns5Y),
        expenseRatio: Number(newFund.expenseRatio),
        aum: Number(newFund.aum),
        avgMonthlyIncome: 5000,
        roiScore: 70,
        rating: 4.0,
        reviewCount: 50,
        fundManager: "Admin Added",
        exitLoad: "Nil",
        lockIn: "No lock-in",
        contractType: "Prototype contract",
        fundHouse: newFund.fundHouse,
        companies: ["Company A", "Company B"],
        sectorAllocation: { Others: 100 },
        growthPoints: [4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        riskMetrics: { stdDev: 8.3, beta: 0.7, sharpe: 0.6, alpha: 1.2 },
        reviews: ["Admin added fund"]
      }
    ]);
    setNewFund({ ...newFund, name: "" });
  };

  return (
    <div className="space-y-4">
      <PageCard title="Admin Control Panel" subtitle="Approve advisors, update fund data, monitor statistics, resolve complaints, remove fraudulent accounts." />

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

function AdvisorDeskPage({ funds, riskProfile }) {
  const [client, setClient] = useState("Rahul");
  const [suggestedFundId, setSuggestedFundId] = useState(String(funds[0]?.id || ""));
  const [message, setMessage] = useState("Suggested a diversified mix based on risk profile.");
  const [sent, setSent] = useState([]);

  const clients = [
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
          <div className="flex gap-2">
            <button onClick={sendRecommendation} className="px-3 py-2 rounded-lg bg-brand-500 text-white">Send Recommendation</button>
            <button className="px-3 py-2 rounded-lg border">Generate PDF Report</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-soft p-4">
        <p className="font-semibold">Sent Recommendations</p>
        <ul className="mt-2 space-y-2 text-sm">
          {sent.map((s) => <li key={s} className="border border-slate-200 rounded p-2">{s}</li>)}
        </ul>
      </div>
    </div>
  );
}

function AdvisorEducationHubPage({ posts, setPosts }) {
  const [title, setTitle] = useState("New Risk Guide");
  const [type, setType] = useState("Risk Guide");
  const [summary, setSummary] = useState("How volatility metrics help investor decisions.");

  const addPost = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const nextId = Math.max(...posts.map((p) => p.id)) + 1;
    setPosts((prev) => [{ id: nextId, title, type, summary, likes: 0, comments: [] }, ...prev]);
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

function AnalystLabPage({ funds }) {
  const [simulate, setSimulate] = useState(false);
  const [rebalancingOn, setRebalancingOn] = useState(true);
  const [sentiment, setSentiment] = useState("Neutral");

  const avgNav = (funds.reduce((acc, f) => acc + f.returns1Y, 0) / funds.length).toFixed(2);
  const monteCarloSeries = useMemo(() => {
    const arr = [100];
    for (let i = 1; i < 12; i += 1) {
      const randomShock = (Math.random() * 8 - 3).toFixed(2);
      arr.push(Math.max(70, Number((arr[i - 1] * (1 + Number(randomShock) / 100)).toFixed(2))));
    }
    return arr;
  }, [simulate]);

  return (
    <div className="space-y-4">
      <PageCard title="Data Analyst: Advanced Ideas Lab" subtitle="Monte Carlo simulation, sentiment indicator, NAV integration mock, rebalancing engine, ESG and rating filters." />

      <div className="grid md:grid-cols-3 gap-3">
        <StatCard label="Real-time NAV Sync" value={`${avgNav}% avg`} />
        <StatCard label="Market Sentiment" value={sentiment} />
        <StatCard label="Rebalancing Engine" value={rebalancingOn ? "Active" : "Paused"} />
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
        <Select label="Role" value={form.role} onChange={(v) => setForm((p) => ({ ...p, role: v }))} options={roles} />
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

function Input({ label, value, onChange, type = "text" }) {
  return <label className="block text-sm text-slate-700"><span className="mb-1 block">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2" required /></label>;
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
  const [funds, setFunds] = useState(mutualFunds);
  const [posts, setPosts] = useState(advisorEducationSeed);
  const [user, setUser] = useState({ name: "Demo User", email: "student@demo.com", role: "Investor", mobile: "9876543210" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [compareIds, setCompareIds] = useState([1, 2, 3]);
  const [enrolledFundIds, setEnrolledFundIds] = useState([1, 2, 4]);
  const [sipAmount, setSipAmount] = useState("5000");
  const [sipState, setSipState] = useState({ status: "Active", stepUpRate: 10, autoDebit: true, nextDate: "2026-03-05" });

  const [notifications, setNotifications] = useState([
    { type: "nav", label: "NAV Updates", message: "2 tracked funds changed NAV today.", enabled: true, read: false },
    { type: "crash", label: "Market Crash Alert", message: "Nifty corrected 3.2% intraday.", enabled: true, read: false },
    { type: "rebalance", label: "Rebalancing Suggestion", message: "Portfolio equity crossed 80% threshold.", enabled: true, read: false },
    { type: "sip", label: "SIP Due Reminder", message: "Next SIP due on 5th March 2026.", enabled: true, read: true },
    { type: "dividend", label: "Dividend Declared", message: "One debt fund announced payout.", enabled: false, read: true }
  ]);

  const logout = () => setIsLoggedIn(false);

  const shell = (content) => (
    <Protected isLoggedIn={isLoggedIn}>
      <AppShell
        user={user}
        onRoleChange={(role) => setUser((u) => ({ ...u, role }))}
        onLogout={logout}
        notifications={notifications}
        setNotifications={setNotifications}
      >
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
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/dashboard" element={shell(<Dashboard user={user} />)} />
      <Route path="/profile" element={shell(<ProfilePage user={user} onProfileSave={setUser} />)} />

      <Route path="/investor/discovery" element={shell(<RoleRoute user={user} role="Investor"><InvestorDiscoveryPage funds={funds} compareIds={compareIds} setCompareIds={setCompareIds} enrolledFundIds={enrolledFundIds} setEnrolledFundIds={setEnrolledFundIds} /></RoleRoute>)} />
      <Route path="/investor/risk-quiz" element={shell(<RoleRoute user={user} role="Investor"><RiskQuizPage funds={funds} riskProfile={riskProfile} setRiskProfile={setRiskProfile} /></RoleRoute>)} />
      <Route path="/investor/compare" element={shell(<RoleRoute user={user} role="Investor"><CompareDashboardPage funds={funds} compareIds={compareIds} setCompareIds={setCompareIds} /></RoleRoute>)} />
      <Route path="/investor/portfolio" element={shell(<RoleRoute user={user} role="Investor"><PortfolioAnalyticsPage funds={funds} enrolledFundIds={enrolledFundIds} sipAmount={sipAmount} setSipAmount={setSipAmount} /></RoleRoute>)} />
      <Route path="/investor/goals" element={shell(<RoleRoute user={user} role="Investor"><GoalPlannerPage sipAmount={sipAmount} /></RoleRoute>)} />
      <Route path="/investor/sip" element={shell(<RoleRoute user={user} role="Investor"><SipManagementPage sipAmount={sipAmount} setSipAmount={setSipAmount} sipState={sipState} setSipState={setSipState} /></RoleRoute>)} />
      <Route path="/investor/alerts" element={shell(<RoleRoute user={user} role="Investor"><AlertsPage notifications={notifications} setNotifications={setNotifications} /></RoleRoute>)} />
      <Route path="/investor/tax" element={shell(<RoleRoute user={user} role="Investor"><TaxEstimatorPage enrolledFundIds={enrolledFundIds} funds={funds} /></RoleRoute>)} />
      <Route path="/investor/behavior" element={shell(<RoleRoute user={user} role="Investor"><BehaviorAnalyticsPage /></RoleRoute>)} />
      <Route path="/investor/education" element={shell(<RoleRoute user={user} role="Investor"><InvestorEducationPage posts={posts} setPosts={setPosts} /></RoleRoute>)} />

      <Route path="/admin/control" element={shell(<RoleRoute user={user} role="Admin"><AdminControlPanelPage funds={funds} setFunds={setFunds} /></RoleRoute>)} />

      <Route path="/advisor/desk" element={shell(<RoleRoute user={user} role="Financial Advisor"><AdvisorDeskPage funds={funds} riskProfile={riskProfile} /></RoleRoute>)} />
      <Route path="/advisor/education" element={shell(<RoleRoute user={user} role="Financial Advisor"><AdvisorEducationHubPage posts={posts} setPosts={setPosts} /></RoleRoute>)} />

      <Route path="/analyst/lab" element={shell(<RoleRoute user={user} role="Data Analyst"><AnalystLabPage funds={funds} /></RoleRoute>)} />

      <Route path="*" element={<Navigate to={isLoggedIn ? roleHomePath[user.role] : "/"} replace />} />
    </Routes>
  );
}
