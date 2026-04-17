import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BrainCircuit,
  Clock3,
  Gauge,
  HeartPulse,
  Keyboard,
  MousePointer2,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  SquareMousePointer,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

const modeIcons = {
  Developer: Keyboard,
  Aviation: Gauge,
  Healthcare: Stethoscope,
};

const scenarios = {
  Normal: {
    riskLevel: "LOW",
    fatigueScore: 28,
    typingSpeed: 82,
    errorRate: 2.1,
    mouseActivity: 88,
    tabSwitchCount: 4,
    sessionDuration: 34,
    pauseDuration: 12,
    baselineTypingDelta: -6,
    baselineErrorDelta: 8,
    suggestion: "Keep going. Performance is stable.",
    status: "Fresh",
    trend: [18, 20, 19, 24, 23, 26, 28],
    factors: [
      { label: "Increased pause duration", icon: PauseCircle, trend: "down", tone: "good", value: "-8%" },
      { label: "Reduced typing speed", icon: Keyboard, trend: "up", tone: "good", value: "+4%" },
      { label: "High error rate", icon: TriangleAlert, trend: "down", tone: "good", value: "-11%" },
      { label: "Frequent tab switching", icon: RefreshCw, trend: "down", tone: "good", value: "-15%" },
    ],
  },
  Fatigued: {
    riskLevel: "HIGH",
    fatigueScore: 84,
    typingSpeed: 49,
    errorRate: 8.9,
    mouseActivity: 41,
    tabSwitchCount: 19,
    sessionDuration: 138,
    pauseDuration: 46,
    baselineTypingDelta: -25,
    baselineErrorDelta: 40,
    suggestion: "Stop and rest for 5 minutes.",
    status: "Fatigued",
    trend: [42, 48, 56, 61, 69, 77, 84],
    factors: [
      { label: "Increased pause duration", icon: PauseCircle, trend: "up", tone: "bad", value: "+31%" },
      { label: "Reduced typing speed", icon: Keyboard, trend: "down", tone: "bad", value: "-25%" },
      { label: "High error rate", icon: TriangleAlert, trend: "up", tone: "bad", value: "+40%" },
      { label: "Frequent tab switching", icon: RefreshCw, trend: "up", tone: "bad", value: "+29%" },
    ],
  },
  Recovery: {
    riskLevel: "MEDIUM",
    fatigueScore: 57,
    typingSpeed: 63,
    errorRate: 5.2,
    mouseActivity: 67,
    tabSwitchCount: 9,
    sessionDuration: 82,
    pauseDuration: 26,
    baselineTypingDelta: -12,
    baselineErrorDelta: 18,
    suggestion: "Consider a short break soon.",
    status: "Moderate",
    trend: [76, 71, 67, 64, 61, 59, 57],
    factors: [
      { label: "Increased pause duration", icon: PauseCircle, trend: "down", tone: "good", value: "-10%" },
      { label: "Reduced typing speed", icon: Keyboard, trend: "up", tone: "good", value: "+9%" },
      { label: "High error rate", icon: TriangleAlert, trend: "down", tone: "good", value: "-13%" },
      { label: "Frequent tab switching", icon: RefreshCw, trend: "down", tone: "good", value: "-8%" },
    ],
  },
};

const metricCards = [
  { key: "typingSpeed", label: "Typing Speed", suffix: "WPM", icon: Keyboard },
  { key: "errorRate", label: "Error Rate", suffix: "%", icon: AlertTriangle },
  { key: "mouseActivity", label: "Mouse Activity", suffix: "%", icon: MousePointer2 },
  { key: "tabSwitchCount", label: "Tab Switch Count", suffix: "", icon: SquareMousePointer },
  { key: "sessionDuration", label: "Session Duration", suffix: "min", icon: Clock3 },
];

const riskStyles = {
  LOW: {
    color: "#2dd4bf",
    soft: "rgba(45, 212, 191, 0.14)",
    text: "System stable",
  },
  MEDIUM: {
    color: "#fbbf24",
    soft: "rgba(251, 191, 36, 0.14)",
    text: "Monitor closely",
  },
  HIGH: {
    color: "#fb7185",
    soft: "rgba(251, 113, 133, 0.14)",
    text: "Immediate attention",
  },
};

function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function buildChartData(values) {
  return values.map((value, index) => ({
    time: `${index * 5}s`,
    fatigue: value,
  }));
}

function buildPath(values, width, height, padding) {
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1 || 1)) * innerWidth;
      const y = padding + ((100 - value) / 100) * innerHeight;
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

function buildArea(values, width, height, padding) {
  const line = buildPath(values, width, height, padding);
  const endX = width - padding;
  const baseY = height - padding;
  const startX = padding;
  return `${line} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
}

function MetricCard({ icon: Icon, label, value, suffix, tone, trendUp }) {
  return (
    <div className="glass-card metric-shine float-in rounded-3xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-slate-100">
          <Icon size={20} />
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{ backgroundColor: tone.soft, color: tone.color }}
        >
          {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {trendUp ? "Rising" : "Dropping"}
        </div>
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <div className="mt-2 flex items-end gap-1.5">
        <span className="font-display text-3xl font-bold text-white">{value}</span>
        <span className="pb-1 text-sm text-slate-400">{suffix}</span>
      </div>
    </div>
  );
}

function TrendChart({ data, color }) {
  const width = 760;
  const height = 300;
  const padding = 28;
  const values = data.map((item) => item.fatigue);
  const path = buildPath(values, width, height, padding);
  const area = buildArea(values, width, height, padding);
  const upward = values.at(-1) > values[0];

  return (
    <div className="h-80 rounded-[28px] border border-white/8 bg-[#07111f]/80 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full overflow-visible">
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padding + ((100 - tick) / 100) * (height - padding * 2);
          return (
            <g key={tick}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="5 6" />
              <text x={4} y={y + 4} fill="#8ea3bd" fontSize="11">
                {tick}
              </text>
            </g>
          );
        })}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
          return (
            <text key={point.time} x={x - 8} y={height - 6} fill="#8ea3bd" fontSize="11">
              {point.time}
            </text>
          );
        })}
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={upward ? "#fb7185" : color} stopOpacity="0.34" />
            <stop offset="100%" stopColor={upward ? "#fb7185" : color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} className="trend-area" fill="url(#trendFill)" />
        <path d={path} className="trend-line" fill="none" stroke={upward ? "#fb7185" : color} strokeWidth="4" strokeLinecap="round" />
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
          const y = padding + ((100 - point.fatigue) / 100) * (height - padding * 2);
          return <circle key={`${point.time}-dot`} cx={x} cy={y} r="4.5" fill={upward ? "#fb7185" : color} />;
        })}
      </svg>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState("Developer");
  const [demoMode, setDemoMode] = useState("Normal");
  const [sessionTimer, setSessionTimer] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [state, setState] = useState(scenarios.Normal);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSessionTimer((current) => current + 1);
      setLastUpdated((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const cycle = window.setInterval(() => {
      const profile = scenarios[demoMode];
      setState((previous) => ({
        ...profile,
        fatigueScore: Math.max(0, Math.min(100, profile.fatigueScore + (Math.random() * 6 - 3))),
        typingSpeed: Math.max(12, Math.round(profile.typingSpeed + (Math.random() * 6 - 3))),
        errorRate: Math.max(0.5, +(profile.errorRate + (Math.random() * 1.2 - 0.6)).toFixed(1)),
        mouseActivity: Math.max(10, Math.min(100, Math.round(profile.mouseActivity + (Math.random() * 8 - 4)))),
        tabSwitchCount: Math.max(0, Math.round(profile.tabSwitchCount + (Math.random() * 4 - 2))),
        pauseDuration: Math.max(0, Math.round(profile.pauseDuration + (Math.random() * 6 - 3))),
        trend: [...previous.trend.slice(1), Math.max(0, Math.min(100, Math.round(profile.fatigueScore + (Math.random() * 8 - 4))))],
      }));
      setLastUpdated(0);
    }, 5000);

    return () => window.clearInterval(cycle);
  }, [demoMode]);

  useEffect(() => {
    setState(scenarios[demoMode]);
    setLastUpdated(0);
  }, [demoMode]);

  const risk = riskStyles[state.riskLevel];
  const ModeIcon = modeIcons[mode];
  const chartData = useMemo(() => buildChartData(state.trend), [state.trend]);
  const gaugeStyle = {
    background: `conic-gradient(${risk.color} ${state.fatigueScore * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
  };

  return (
    <div className="min-h-screen px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <nav className="glass-card float-in flex flex-col gap-4 rounded-[28px] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/80">Human Fatigue & Error Predictor</p>
            <h1 className="font-display text-3xl font-bold tracking-tight">NeuroShield</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Session Timer</p>
              <div className="mt-1 flex items-center gap-2 font-display text-xl font-semibold">
                <Clock3 size={18} className="text-sky-300" />
                {formatClock(sessionTimer)}
              </div>
            </div>
            <label className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <span className="mb-1 block text-xs uppercase tracking-[0.25em] text-slate-400">Mode</span>
              <div className="flex items-center gap-2">
                <ModeIcon size={17} className="text-sky-300" />
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value)}
                  className="bg-transparent text-white outline-none"
                >
                  {Object.keys(modeIcons).map((item) => (
                    <option key={item} value={item} className="bg-slate-900">
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>
        </nav>

        {state.riskLevel === "HIGH" ? (
          <div className="pulse-critical glass-card float-in rounded-[28px] border border-rose-400/25 bg-rose-500/10 px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-rose-300" size={22} />
                <div>
                  <p className="font-display text-lg font-semibold text-rose-100">High fatigue detected</p>
                  <p className="text-sm text-rose-100/80">Take a 5-minute break to reduce error risk.</p>
                </div>
              </div>
              <div className="rounded-full bg-rose-200/10 px-4 py-2 text-sm font-medium text-rose-100">
                Intervention recommended now
              </div>
            </div>
          </div>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="glass-card hero-grid float-in overflow-hidden rounded-[34px] p-6 lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="mb-3 text-sm uppercase tracking-[0.35em] text-sky-300/75">Real-Time Risk Status</p>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span
                    className="rounded-full px-4 py-1.5 text-sm font-semibold"
                    style={{ backgroundColor: risk.soft, color: risk.color }}
                  >
                    {state.riskLevel} RISK
                  </span>
                  <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-slate-300">
                    {risk.text}
                  </span>
                </div>
                <h2 className="max-w-lg font-display text-4xl font-bold leading-tight lg:text-5xl">
                  Fatigue risk is {state.riskLevel.toLowerCase()} and easy to act on.
                </h2>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  Live behavioral telemetry is converted into one clear score, top causes, and next-step guidance for
                  fast decision-making.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/6 px-5 py-4">
                    <p className="text-sm text-slate-400">Fatigue Score</p>
                    <div className="font-display text-4xl font-bold">{Math.round(state.fatigueScore)}%</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/6 px-5 py-4">
                    <p className="text-sm text-slate-400">Last updated</p>
                    <div className="font-display text-4xl font-bold">{lastUpdated}s</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-5">
                <div className="gauge-ring soft-spin relative flex h-72 w-72 items-center justify-center rounded-full" style={gaugeStyle}>
                  <div className="relative z-10 text-center">
                    <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live Score</p>
                    <div className="mt-3 font-display text-6xl font-bold">{Math.round(state.fatigueScore)}</div>
                    <p className="mt-2 text-sm text-slate-400">Last updated: {lastUpdated} seconds ago</p>
                  </div>
                </div>
                <div className="grid w-full grid-cols-3 gap-3">
                  {["Normal", "Fatigued", "Recovery"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setDemoMode(item)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        demoMode === item
                          ? "border-sky-300/50 bg-sky-400/15 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card float-in rounded-[34px] p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                <BrainCircuit />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Explainable AI</p>
                <h3 className="font-display text-2xl font-semibold">Why is fatigue high?</h3>
              </div>
            </div>
            <div className="space-y-3">
              {state.factors.map((factor) => {
                const bad = factor.tone === "bad";
                const toneColor = bad ? "text-rose-300" : "text-emerald-300";
                const bgTone = bad ? "bg-rose-400/10" : "bg-emerald-400/10";
                const TrendIcon = factor.trend === "up" ? TrendingUp : TrendingDown;
                return (
                  <div key={factor.label} className="rounded-3xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bgTone} ${toneColor}`}>
                          <factor.icon size={20} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{factor.label}</p>
                          <p className="text-sm text-slate-400">Model confidence signal</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${bgTone} ${toneColor}`}>
                        <TrendIcon size={16} />
                        {factor.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {metricCards.map((metric) => {
            const value = state[metric.key];
            const trendUp = metric.key === "errorRate" || metric.key === "tabSwitchCount"
              ? state.riskLevel === "HIGH"
              : state.riskLevel !== "HIGH";
            return (
              <MetricCard
                key={metric.key}
                icon={metric.icon}
                label={metric.label}
                value={value}
                suffix={metric.suffix}
                trendUp={trendUp}
                tone={risk}
              />
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="glass-card float-in rounded-[34px] p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Trend Analysis</p>
                <h3 className="font-display text-2xl font-semibold">Fatigue Score Over Time</h3>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-300">Updates every 5s</div>
            </div>
            <TrendChart data={chartData} color={risk.color} />
          </div>

          <div className="grid gap-6">
            <div className="glass-card float-in rounded-[34px] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Session Awareness</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Current Operator State</h3>
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Session Time</span>
                  <span className="font-display text-2xl font-bold">{state.sessionDuration} mins</span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <span
                    className="rounded-full px-3 py-1.5 text-sm font-semibold"
                    style={{ backgroundColor: risk.soft, color: risk.color }}
                  >
                    {state.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card float-in rounded-[34px] p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Smart Suggestions</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Recommended Action</h3>
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1 flex h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: risk.soft, color: risk.color }}
                  >
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">{state.suggestion}</p>
                    <p className="mt-1 text-sm text-slate-400">Advice adapts automatically to current fatigue state.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card float-in rounded-[34px] p-6">
          <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Adaptive Personal Baseline</p>
              <h3 className="font-display text-2xl font-semibold">Deviation from Your Normal Behavior</h3>
            </div>
            <p className="max-w-xl text-sm text-slate-400">
              The model compares your current behavior to your personal baseline rather than a generic average.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-slate-300">Typing Speed</span>
                <span className="font-semibold text-rose-300">Down {Math.abs(state.baselineTypingDelta)}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-300 transition-[width] duration-700"
                  style={{ width: `${100 + state.baselineTypingDelta}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-400">Current typing speed is below your normal operating rhythm.</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-slate-300">Error Rate</span>
                <span className="font-semibold text-amber-300">Up {state.baselineErrorDelta}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400 transition-[width] duration-700"
                  style={{ width: `${Math.min(100, 45 + state.baselineErrorDelta)}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-400">Error patterns are elevated versus your usual precision baseline.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
