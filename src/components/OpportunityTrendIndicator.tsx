import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Activity,
  BarChart3,
  LineChart as LineChartIcon,
  Info
} from 'lucide-react';
import { Idea, WorkspaceView } from '../types';
import { calculatePortfolioMoMTrend, MonthlyTrendPoint } from '../utils/trendAnalytics';
import { AnimatedCounter } from './AnimatedCounter';

interface OpportunityTrendIndicatorProps {
  ideas: Idea[];
  isArabic: boolean;
  onSelectIdea?: (idea: Idea, targetView?: WorkspaceView) => void;
  compact?: boolean;
}

export const OpportunityTrendIndicator: React.FC<OpportunityTrendIndicatorProps> = ({
  ideas,
  isArabic,
  onSelectIdea,
  compact = false
}) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'deltas' | 'movers'>('chart');
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyTrendPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const stats = calculatePortfolioMoMTrend(ideas);
  const { history, latestMonth, previousMonth, latestMomGrowthPct, latestMomDelta, direction } = stats;

  const activeMonth =
    (selectedMonthKey ? history.find((h) => h.monthKey === selectedMonthKey) : null) ||
    latestMonth;

  // Chart dimensions & scaling
  const svgWidth = 680;
  const svgHeight = 220;
  const padding = { top: 30, right: 35, bottom: 45, left: 45 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Dynamic Y scale bounds (min 0, max 100 with smart bounds)
  const allScores = history.map((h) => h.avgOpportunityScore);
  const minScore = allScores.length > 0 ? Math.max(0, Math.floor(Math.min(...allScores) / 10) * 10 - 10) : 0;
  const maxScore = allScores.length > 0 ? Math.min(100, Math.ceil(Math.max(...allScores) / 10) * 10 + 10) : 100;
  const scoreRange = maxScore === minScore ? 10 : maxScore - minScore;

  const getX = (index: number) => {
    if (history.length <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (history.length - 1)) * innerWidth;
  };

  const getY = (score: number) => {
    const clamped = Math.max(minScore, Math.min(maxScore, score));
    return padding.top + innerHeight - ((clamped - minScore) / scoreRange) * innerHeight;
  };

  // Generate SVG path for trend spline
  const linePoints = history.map((point, idx) => ({
    x: getX(idx),
    y: getY(point.avgOpportunityScore),
    point
  }));

  // Bezier curve generation
  const buildSmoothPath = () => {
    if (linePoints.length === 0) return '';
    if (linePoints.length === 1) {
      return `M ${linePoints[0].x - 40} ${linePoints[0].y} L ${linePoints[0].x + 40} ${linePoints[0].y}`;
    }

    let d = `M ${linePoints[0].x} ${linePoints[0].y}`;
    for (let i = 0; i < linePoints.length - 1; i++) {
      const p0 = linePoints[i];
      const p1 = linePoints[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const buildAreaPath = () => {
    if (linePoints.length === 0) return '';
    const bottomY = padding.top + innerHeight;
    if (linePoints.length === 1) {
      const p = linePoints[0];
      return `M ${p.x - 40} ${p.y} L ${p.x + 40} ${p.y} L ${p.x + 40} ${bottomY} L ${p.x - 40} ${bottomY} Z`;
    }

    let d = buildSmoothPath();
    const lastP = linePoints[linePoints.length - 1];
    const firstP = linePoints[0];
    d += ` L ${lastP.x} ${bottomY} L ${firstP.x} ${bottomY} Z`;
    return d;
  };

  const getDirectionBadge = (dir: 'positive' | 'negative' | 'neutral', delta: number, pct: number) => {
    if (dir === 'positive') {
      return (
        <span className="mom-trend-badge positive" title="Month-over-Month Growth">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+{pct > 0 ? pct : delta}% MoM</span>
        </span>
      );
    }
    if (dir === 'negative') {
      return (
        <span className="mom-trend-badge negative" title="Month-over-Month Contraction">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{pct !== 0 ? pct : delta}% MoM</span>
        </span>
      );
    }
    return (
      <span className="mom-trend-badge neutral" title="Stable Baseline">
        <Minus className="w-3.5 h-3.5" />
        <span>0.0% MoM</span>
      </span>
    );
  };

  if (compact) {
    return (
      <div className="mom-compact-widget">
        <div className="mom-compact-header">
          <div className="flex items-center gap-2">
            <span className="mom-icon-wrap">
              <Activity className="w-4 h-4 text-[var(--cyan)]" />
            </span>
            <span className="text-xs font-bold text-slate-300">
              {isArabic ? 'النمو الشهري لمعدل الفرص' : 'Opportunity Score MoM Growth'}
            </span>
          </div>
          {getDirectionBadge(direction, latestMomDelta, latestMomGrowthPct)}
        </div>
        <div className="mom-compact-values mt-2 flex items-baseline gap-3">
          <strong className="text-2xl font-black text-[var(--cyan)]">
            {latestMomGrowthPct >= 0 ? `+${latestMomGrowthPct}%` : `${latestMomGrowthPct}%`}
          </strong>
          <span className="text-xs text-[var(--muted)]">
            {latestMomDelta >= 0 ? `+${latestMomDelta}` : latestMomDelta}{' '}
            {isArabic ? 'نقطة مقارنة بالشهر السابق' : 'pts vs prior month'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <article className="panel mom-trend-panel" id="portfolio-mom-trend-indicator">
      {/* Top Header Section */}
      <div className="panel-topline mom-panel-topline">
        <div className="mom-title-cluster">
          <div className="flex items-center gap-2">
            <span className="panel-kicker">
              {isArabic ? 'ذكاء المحفظة • اتجاه النمو' : 'PORTFOLIO INTELLIGENCE • MO-OVER-MO TREND'}
            </span>
            <span className="mom-snapshot-badge">
              <Layers className="w-3 h-3 text-[var(--cyan)]" />
              <span>
                {stats.totalTrackedSnapshots} {isArabic ? 'لقطة تطور' : 'snapshots'}
              </span>
            </span>
          </div>

          <h2 className="mom-main-heading">
            {isArabic
              ? 'مؤشر نمو معدل الفرص على مدار الأشهر'
              : 'Portfolio Opportunity Score MoM Trend'}
          </h2>
          <p className="mom-subtext">
            {isArabic
              ? `تتبع التطور الشهري المحسوب من لقطات التحليل التراكمية عبر ${stats.totalActiveIdeas} أفكار محفوظة.`
              : `Tracking month-over-month trajectory calculated from cumulative evolution snapshots across ${stats.totalActiveIdeas} saved ideas.`}
          </p>
        </div>

        {/* View mode toggle pills */}
        <div className="mom-view-toggle-bar">
          <button
            type="button"
            className={`mom-tab-btn ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
            title={isArabic ? 'عرض المنحنى البياني' : 'Trend Curve'}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>{isArabic ? 'المنحنى' : 'Trajectory'}</span>
          </button>
          <button
            type="button"
            className={`mom-tab-btn ${activeTab === 'deltas' ? 'active' : ''}`}
            onClick={() => setActiveTab('deltas')}
            title={isArabic ? 'فروقات الأشهر' : 'Monthly Steps'}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isArabic ? 'الفروقات' : 'MoM Deltas'}</span>
          </button>
          <button
            type="button"
            className={`mom-tab-btn ${activeTab === 'movers' ? 'active' : ''}`}
            onClick={() => setActiveTab('movers')}
            title={isArabic ? 'محركات التحسن' : 'Idea Movers'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'المحركات' : 'Movers'}</span>
          </button>
        </div>
      </div>

      {/* KPI Spotlight Hero Cards */}
      <div className="mom-spotlight-grid">
        {/* Card 1: MoM Growth Hero */}
        <div className="mom-hero-card">
          <div className="flex justify-between items-start">
            <span className="mom-kpi-label">
              {isArabic ? 'معدل النمو الشهري' : 'LATEST MoM GROWTH'}
            </span>
            {getDirectionBadge(direction, latestMomDelta, latestMomGrowthPct)}
          </div>

          <div className="mom-hero-num-row">
            <strong className="mom-hero-num">
              <span className={latestMomGrowthPct >= 0 ? 'text-[var(--cyan)]' : 'text-rose-400'}>
                {latestMomGrowthPct > 0 ? '+' : ''}
                <AnimatedCounter value={Math.abs(latestMomGrowthPct)} />%
              </span>
            </strong>
            <div className="mom-hero-delta-pill">
              {latestMomDelta >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--cyan)]" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span>
                {latestMomDelta > 0 ? `+${latestMomDelta}` : latestMomDelta}{' '}
                {isArabic ? 'نقطة فرصة' : 'opportunity pts'}
              </span>
            </div>
          </div>

          <div className="mom-hero-meta">
            {previousMonth ? (
              <span>
                {isArabic ? 'مقارنة بين' : 'Comparing'}{' '}
                <strong>{isArabic ? latestMonth?.label.ar : latestMonth?.label.en}</strong> (
                {latestMonth?.avgOpportunityScore}) {isArabic ? 'مع' : 'vs'}{' '}
                <strong>{isArabic ? previousMonth.label.ar : previousMonth.label.en}</strong> (
                {previousMonth.avgOpportunityScore})
              </span>
            ) : (
              <span>
                {isArabic
                  ? 'تم تأسيس خط الأساس الأولي للمحفظة'
                  : 'Portfolio baseline month established'}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Current Portfolio Opportunity Score */}
        <div className="mom-metric-card">
          <span className="mom-kpi-label">
            {isArabic ? 'متوسط معدل الفرص الحالي' : 'PORTFOLIO AVG SCORE'}
          </span>
          <div className="mom-metric-score-row">
            <strong className="text-3xl font-black text-white">
              {latestMonth?.avgOpportunityScore ?? stats.averageScoreAcrossAll}
            </strong>
            <span className="text-xs text-[var(--muted)]">/ 100</span>
          </div>
          <div className="mom-progress-track">
            <div
              className="mom-progress-fill"
              style={{
                width: `${latestMonth?.avgOpportunityScore ?? stats.averageScoreAcrossAll}%`
              }}
            />
          </div>
          <div className="mom-sub-info">
            <span>
              {isArabic ? 'مستوى الثقة الجماعي:' : 'Portfolio Confidence:'}{' '}
              <strong className="text-[var(--blue)]">
                {latestMonth?.avgConfidence ?? 0}%
              </strong>
            </span>
          </div>
        </div>

        {/* Card 3: Portfolio Momentum & Movers */}
        <div className="mom-metric-card">
          <span className="mom-kpi-label">
            {isArabic ? 'ديناميكية تطور الأفكار' : 'IDEA MOVER DYNAMICS'}
          </span>
          {activeMonth && (
            <>
              <div className="mom-movers-bar mt-2">
                <div
                  className="bar-seg positive"
                  style={{
                    flex: activeMonth.movers.improved || 0.05
                  }}
                  title={`${activeMonth.movers.improved} ${isArabic ? 'أفكار صاعدة' : 'ideas gained'}`}
                />
                <div
                  className="bar-seg neutral"
                  style={{
                    flex: activeMonth.movers.unchanged || 0.05
                  }}
                  title={`${activeMonth.movers.unchanged} ${isArabic ? 'أفكار مستقرة' : 'ideas stable'}`}
                />
                <div
                  className="bar-seg negative"
                  style={{
                    flex: activeMonth.movers.declined || 0.05
                  }}
                  title={`${activeMonth.movers.declined} ${isArabic ? 'أفكار متراجعة' : 'ideas lost'}`}
                />
              </div>

              <div className="mom-movers-legend">
                <span className="legend-item pos">
                  <i />
                  <b>{activeMonth.movers.improved}</b> {isArabic ? 'تحسن' : 'Improved'}
                </span>
                <span className="legend-item neu">
                  <i />
                  <b>{activeMonth.movers.unchanged}</b> {isArabic ? 'مستقر' : 'Steady'}
                </span>
                <span className="legend-item neg">
                  <i />
                  <b>{activeMonth.movers.declined}</b> {isArabic ? 'تراجع' : 'Down'}
                </span>
              </div>

              {activeMonth.topMover && (
                <div className="mom-top-driver-snippet">
                  <span className="text-[10px] text-[var(--muted)]">
                    {isArabic ? 'أكبر محرك للتطور:' : 'Primary Mover:'}
                  </span>
                  <strong className="text-xs text-[var(--cyan)] truncate block">
                    {isArabic ? activeMonth.topMover.title.ar : activeMonth.topMover.title.en}
                    {activeMonth.topMover.delta !== 0 && (
                      <span className="ml-1 text-[11px] text-emerald-400 font-bold">
                        ({activeMonth.topMover.delta > 0 ? '+' : ''}
                        {activeMonth.topMover.delta} pts)
                      </span>
                    )}
                  </strong>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="mom-body-area">
        {activeTab === 'chart' && (
          <div className="mom-chart-container">
            {/* SVG Visual Curve */}
            <div className="mom-svg-wrapper">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="mom-svg-canvas"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glowing gradient for area fill under the trajectory */}
                  <linearGradient id="momAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="var(--cyan)" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.00" />
                  </linearGradient>

                  <linearGradient id="momLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1d9bf0" />
                    <stop offset="65%" stopColor="#43e6d2" />
                    <stop offset="100%" stopColor="#77f0e2" />
                  </linearGradient>

                  {/* Drop shadow filter for interactive nodes */}
                  <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
                    <feMerge>
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Horizontal reference grid lines */}
                {[0, 25, 50, 75, 100].map((scoreLevel) => {
                  const y = getY(scoreLevel);
                  return (
                    <g key={scoreLevel} className="mom-grid-line-group">
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke="var(--line)"
                        strokeDasharray={scoreLevel === 50 ? '4 3' : '2 4'}
                        strokeWidth="1"
                        strokeOpacity="0.5"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="var(--muted-2)"
                      >
                        {scoreLevel}
                      </text>
                    </g>
                  );
                })}

                {/* Area under curve */}
                <path
                  d={buildAreaPath()}
                  fill="url(#momAreaGradient)"
                  className="transition-all duration-300"
                />

                {/* Main trajectory spline line */}
                <path
                  d={buildSmoothPath()}
                  fill="none"
                  stroke="url(#momLineGradient)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point nodes */}
                {linePoints.map(({ x, y, point }, index) => {
                  const isLatest = index === linePoints.length - 1;
                  const isSelected = point.monthKey === activeMonth?.monthKey;

                  return (
                    <g
                      key={point.monthKey}
                      className="mom-point-node cursor-pointer group"
                      onClick={() => setSelectedMonthKey(point.monthKey)}
                      onMouseEnter={(e) => {
                        setHoveredPoint(point);
                        const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
                        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      {/* Outer pulse wave on latest month */}
                      {isLatest && (
                        <circle
                          cx={x}
                          cy={y}
                          r="12"
                          fill="var(--cyan)"
                          fillOpacity="0.2"
                          className="animate-ping"
                        />
                      )}

                      {/* Halo ring for selected or hovered point */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '9' : '6.5'}
                        fill="var(--navy-1)"
                        stroke={isSelected ? 'var(--cyan)' : '#1d9bf0'}
                        strokeWidth="2.5"
                        filter="url(#nodeGlow)"
                      />

                      {/* Inner dot */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '4' : '3'}
                        fill={point.momDelta >= 0 ? 'var(--cyan)' : '#ff6d7e'}
                      />

                      {/* Floating value pill directly on the point */}
                      <g transform={`translate(${x}, ${y - 14})`}>
                        <rect
                          x="-18"
                          y="-13"
                          width="36"
                          height="16"
                          rx="4"
                          fill="#051221e8"
                          stroke={isSelected ? 'var(--cyan)' : 'var(--line)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="-2"
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="700"
                          fill={isSelected ? 'var(--cyan)' : 'var(--ink)'}
                        >
                          {point.avgOpportunityScore}
                        </text>
                      </g>

                      {/* Month label along X-axis */}
                      <text
                        x={x}
                        y={svgHeight - 16}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={isSelected ? '700' : '500'}
                        fill={isSelected ? 'var(--cyan)' : 'var(--muted)'}
                      >
                        {isArabic ? point.shortLabel.ar : point.shortLabel.en}
                      </text>

                      {/* Snapshot count hint */}
                      <text
                        x={x}
                        y={svgHeight - 4}
                        textAnchor="middle"
                        fontSize="8"
                        fill="var(--muted-2)"
                      >
                        {point.snapshotCount}{' '}
                        {isArabic ? 'لقطة' : 'snaps'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Milestone Ribbon */}
            <div className="mom-milestone-ribbon">
              {history.map((m, idx) => {
                const isSelected = m.monthKey === activeMonth?.monthKey;
                const isFirst = idx === 0;

                return (
                  <button
                    key={m.monthKey}
                    type="button"
                    className={`mom-milestone-item ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedMonthKey(m.monthKey)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="milestone-name">
                        {isArabic ? m.label.ar : m.label.en}
                      </span>
                      {isFirst ? (
                        <span className="text-[10px] text-[var(--muted-2)] font-mono">
                          {isArabic ? 'أساس' : 'Baseline'}
                        </span>
                      ) : (
                        <span
                          className={`milestone-delta ${m.momDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                        >
                          {m.momDelta > 0 ? `+${m.momDelta}` : m.momDelta} pts
                        </span>
                      )}
                    </div>
                    <div className="milestone-bar-wrap">
                      <div
                        className="milestone-bar-inner"
                        style={{ width: `${m.avgOpportunityScore}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-[var(--muted)]">
                      <span>{isArabic ? 'متوسط الفرصة:' : 'Avg Score:'} <strong>{m.avgOpportunityScore}</strong></span>
                      <span>{m.activeIdeasCount} {isArabic ? 'أفكار' : 'ideas'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Monthly Deltas Waterfall */}
        {activeTab === 'deltas' && (
          <div className="mom-deltas-view">
            <div className="mom-deltas-header">
              <span className="text-xs text-[var(--muted)]">
                {isArabic
                  ? 'تسلسل خطوات التغير الشهري والنسبة المئوية عبر لقطات التطور'
                  : 'Chronological month-over-month step progression & percent growth rate'}
              </span>
            </div>

            <div className="mom-deltas-timeline">
              {history.map((item, idx) => {
                const isBaseline = idx === 0;
                const prev = idx > 0 ? history[idx - 1] : null;

                return (
                  <div key={item.monthKey} className="mom-delta-row">
                    <div className="delta-date-col">
                      <div className="delta-circle-dot" />
                      <div>
                        <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                        <small className="text-[var(--muted-2)] block">
                          {item.activeIdeasCount} {isArabic ? 'أفكار نشطة' : 'active ideas'} •{' '}
                          {item.snapshotCount} {isArabic ? 'لقطات مدخلة' : 'snapshots'}
                        </small>
                      </div>
                    </div>

                    <div className="delta-score-col">
                      <span className="text-xs text-[var(--muted)]">
                        {isArabic ? 'متوسط الفرصة' : 'Average Score'}
                      </span>
                      <strong className="text-xl font-black text-white">
                        {item.avgOpportunityScore}
                      </strong>
                    </div>

                    <div className="delta-change-col">
                      {isBaseline ? (
                        <span className="baseline-tag">
                          {isArabic ? 'نقطة الانطلاق (خط الأساس)' : 'Portfolio Baseline'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span
                            className={`delta-badge ${item.momDelta >= 0 ? 'pos' : 'neg'}`}
                          >
                            {item.momDelta >= 0 ? '+' : ''}
                            {item.momDelta} pts
                          </span>
                          <span
                            className={`delta-pct ${item.momGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                          >
                            ({item.momGrowthPct >= 0 ? '+' : ''}
                            {item.momGrowthPct}% MoM)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="delta-driver-col">
                      {item.topMover ? (
                        <div className="text-xs">
                          <span className="text-[var(--muted-2)] block text-[10px]">
                            {isArabic ? 'المحرك الأبرز:' : 'Leading Mover:'}
                          </span>
                          <span className="text-[var(--cyan)] font-medium">
                            {isArabic ? item.topMover.title.ar : item.topMover.title.en}{' '}
                            <b className="text-emerald-400 font-bold">
                              ({item.topMover.delta > 0 ? '+' : ''}
                              {item.topMover.delta})
                            </b>
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-[var(--muted-2)]">
                          {isArabic ? 'استقرار عام' : 'Steady baseline'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Idea Breakdown & Movers */}
        {activeTab === 'movers' && (
          <div className="mom-movers-view">
            <div className="mom-movers-header">
              <div>
                <span className="text-xs text-[var(--cyan)] font-semibold uppercase tracking-wider">
                  {isArabic ? 'تفصيل أداء الأفكار في' : 'Idea Breakdown in'}{' '}
                  {isArabic ? activeMonth?.label.ar : activeMonth?.label.en}
                </span>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {isArabic
                    ? 'الأفكار الفردية وتأثيرها على معدل الفرص العام للمحفظة'
                    : 'Individual idea scores and their contribution to the monthly portfolio average'}
                </p>
              </div>
            </div>

            <div className="mom-idea-list-grid">
              {activeMonth?.ideaScores.map((is) => {
                const matchedIdea = ideas.find((i) => i.id === is.ideaId);

                return (
                  <div key={is.ideaId} className="mom-idea-card">
                    <div className="mom-idea-card-header">
                      <div>
                        <strong className="text-sm font-bold text-white block">
                          {isArabic ? is.title.ar : is.title.en}
                        </strong>
                        <span className="text-[11px] text-[var(--muted)]">
                          {isArabic ? 'الثقة:' : 'Confidence:'} {is.confidence}%
                        </span>
                      </div>
                      <div className="text-right">
                        <strong className="text-xl font-black text-[var(--cyan)]">
                          {is.score}
                        </strong>
                        {is.deltaFromPrevMonth !== 0 && (
                          <span
                            className={`text-[11px] font-bold block ${
                              is.deltaFromPrevMonth > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {is.deltaFromPrevMonth > 0 ? '+' : ''}
                            {is.deltaFromPrevMonth} MoM
                          </span>
                        )}
                      </div>
                    </div>

                    {matchedIdea && onSelectIdea && (
                      <button
                        type="button"
                        className="mom-view-report-link"
                        onClick={() => onSelectIdea(matchedIdea, 'report')}
                      >
                        <span>{isArabic ? 'فحص تقرير التطور' : 'Inspect Evolution Report'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredPoint && tooltipPos && (
        <div
          className="mom-floating-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        >
          <div className="tooltip-inner">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-1.5 mb-1.5">
              <strong className="text-xs text-white">
                {isArabic ? hoveredPoint.label.ar : hoveredPoint.label.en}
              </strong>
              <span className="text-[10px] text-[var(--cyan)] font-mono font-bold">
                {hoveredPoint.avgOpportunityScore} / 100
              </span>
            </div>
            <div className="text-[11px] space-y-1">
              <div className="flex justify-between gap-4 text-[var(--muted)]">
                <span>{isArabic ? 'النمو الشهري:' : 'MoM Growth:'}</span>
                <strong
                  className={
                    hoveredPoint.momGrowthPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }
                >
                  {hoveredPoint.momGrowthPct > 0 ? '+' : ''}
                  {hoveredPoint.momGrowthPct}% ({hoveredPoint.momDelta > 0 ? '+' : ''}
                  {hoveredPoint.momDelta} pts)
                </strong>
              </div>
              <div className="flex justify-between gap-4 text-[var(--muted)]">
                <span>{isArabic ? 'اللقطات المسجلة:' : 'Snapshots:'}</span>
                <span className="text-slate-200">{hoveredPoint.snapshotCount}</span>
              </div>
              {hoveredPoint.topMover && (
                <div className="flex justify-between gap-4 text-[var(--muted)] pt-1 border-t border-[var(--line)]">
                  <span>{isArabic ? 'الأعلى صعوداً:' : 'Top Gainer:'}</span>
                  <span className="text-[var(--cyan)] truncate max-w-[130px]">
                    {isArabic ? hoveredPoint.topMover.title.ar : hoveredPoint.topMover.title.en}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
