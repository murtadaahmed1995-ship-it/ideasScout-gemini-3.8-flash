import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Idea } from '../types';
import { Glyph } from './Glyph';

interface OpportunityConfidenceScatterProps {
  isArabic: boolean;
  ideas: Idea[];
  onOpenReport: (idea: Idea) => void;
}

export const OpportunityConfidenceScatter: React.FC<OpportunityConfidenceScatterProps> = ({
  isArabic,
  ideas,
  onOpenReport,
}) => {
  const [hoveredIdea, setHoveredIdea] = useState<Idea | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [trendFilter, setTrendFilter] = useState<'all' | 'improving' | 'stable' | 'declining'>('all');

  const safeIdeas = ideas || [];

  const getIdeaTrend = (idea: Idea) => {
    let delta = 0;
    if (idea.evolution && idea.evolution.length >= 2) {
      const current = idea.evolution[idea.evolution.length - 1];
      const prev = idea.evolution[idea.evolution.length - 2];
      delta = current.opportunityScore - prev.opportunityScore;
    } else if (idea.evolution && idea.evolution.length === 1) {
      delta = (idea.opportunityScore || 0) - idea.evolution[0].opportunityScore;
    }

    if (delta > 1) return { type: 'improving', label: isArabic ? 'تحسن' : 'Improving', color: 'var(--cyan)', icon: '↗' };
    if (delta < -1) return { type: 'declining', label: isArabic ? 'تراجع' : 'Declining', color: '#ff6d7e', icon: '↘' };
    return { type: 'stable', label: isArabic ? 'مستقر' : 'Stable', color: 'var(--muted)', icon: '➔' };
  };

  const filteredIdeas = safeIdeas.filter((idea) => {
    if (trendFilter === 'all') return true;
    return getIdeaTrend(idea).type === trendFilter;
  });

  const width = 700;
  const height = 480;
  const padding = { top: 40, right: 40, bottom: 60, left: 65 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scale functions (0-100 to pixels)
  const xScale = (confidence: number) => padding.left + (Math.min(100, Math.max(0, confidence)) / 100) * chartWidth;
  const yScale = (oppScore: number) => padding.top + chartHeight - (Math.min(100, Math.max(0, oppScore)) / 100) * chartHeight;

  // Thresholds for quadrants
  const midX = 50; // Confidence 50%
  const midY = 70; // Opportunity 70

  // Cluster counts
  let highPotentialCount = 0;
  let promisingHypothesisCount = 0;
  let stableNicheCount = 0;
  let earlyExplorationCount = 0;

  safeIdeas.forEach((i) => {
    const opp = i.opportunityScore || 0;
    const conf = i.confidence || 0;
    if (opp >= midY && conf >= midX) highPotentialCount++;
    else if (opp >= midY && conf < midX) promisingHypothesisCount++;
    else if (opp < midY && conf >= midX) stableNicheCount++;
    else earlyExplorationCount++;
  });

  // Trend counts across all safe ideas
  let improvingCount = 0;
  let stableTrendCount = 0;
  let decliningCount = 0;

  safeIdeas.forEach((i) => {
    const t = getIdeaTrend(i).type;
    if (t === 'improving') improvingCount++;
    else if (t === 'declining') decliningCount++;
    else stableTrendCount++;
  });

  const handleMouseMove = (e: React.MouseEvent, idea: Idea) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
    });
    setHoveredIdea(idea);
  };

  return (
    <div className="panel scatter-panel" style={{ padding: '24px', position: 'relative' }}>
      <div className="panel-topline" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2>
            {isArabic ? 'خريطة توزيع الفرص وثقة الأدلة' : 'Opportunity vs. Confidence Scatter Matrix'}
            <small>{isArabic ? 'مصفوفة أولويات الابتكار مع مسار التحولات' : 'PORTFOLIO INTELLIGENCE & HISTORICAL TRENDS'}</small>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '4px 0 0' }}>
            {isArabic
              ? 'تجميع الأفكار عبر محاور الجاذبية الاستراتيجية وثقة الأدلة مع مؤشرات الاتجاه التاريخية.'
              : 'Mapping innovation portfolio across strategic opportunity and empirical confidence with historical trend dynamics.'}
          </p>
        </div>

        {/* Trend Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            className={`filter-chip ${trendFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTrendFilter('all')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            {isArabic ? 'الكل' : 'All Trends'} ({safeIdeas.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${trendFilter === 'improving' ? 'active' : ''}`}
            onClick={() => setTrendFilter('improving')}
            style={{ fontSize: '11px', padding: '4px 10px', borderColor: trendFilter === 'improving' ? 'var(--cyan)' : undefined }}
          >
            ↗ {isArabic ? 'متحسن' : 'Improving'} ({improvingCount})
          </button>
          <button
            type="button"
            className={`filter-chip ${trendFilter === 'stable' ? 'active' : ''}`}
            onClick={() => setTrendFilter('stable')}
            style={{ fontSize: '11px', padding: '4px 10px' }}
          >
            ➔ {isArabic ? 'مستقر' : 'Stable'} ({stableTrendCount})
          </button>
          <button
            type="button"
            className={`filter-chip ${trendFilter === 'declining' ? 'active' : ''}`}
            onClick={() => setTrendFilter('declining')}
            style={{ fontSize: '11px', padding: '4px 10px', borderColor: trendFilter === 'declining' ? '#ff6d7e' : undefined }}
          >
            ↘ {isArabic ? 'متراجع' : 'Declining'} ({decliningCount})
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', minWidth: '560px', display: 'block', background: 'var(--navy-2)', borderRadius: '12px', border: '1px solid var(--line)' }}
        >
          {/* Quadrant Background Shading */}
          <rect x={xScale(midX)} y={yScale(100)} width={chartWidth - (xScale(midX) - padding.left)} height={yScale(midY) - yScale(100)} fill="#43e6d2" fillOpacity="0.04" />
          <rect x={padding.left} y={yScale(100)} width={xScale(midX) - padding.left} height={yScale(midY) - yScale(100)} fill="#1d9bf0" fillOpacity="0.03" />
          <rect x={xScale(midX)} y={yScale(midY)} width={chartWidth - (xScale(midX) - padding.left)} height={yScale(0) - yScale(midY)} fill="#7888ff" fillOpacity="0.02" />
          <rect x={padding.left} y={yScale(midY)} width={xScale(midX) - padding.left} height={yScale(0) - yScale(midY)} fill="#ffffff" fillOpacity="0.01" />

          {/* Quadrant Divider Lines */}
          <line x1={xScale(midX)} y1={padding.top} x2={xScale(midX)} y2={height - padding.bottom} stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth="1.5" />
          <line x1={padding.left} y1={yScale(midY)} x2={width - padding.right} y2={yScale(midY)} stroke="var(--line-strong)" strokeDasharray="4 4" strokeWidth="1.5" />

          {/* Quadrant Watermark Labels */}
          <text x={xScale(75)} y={yScale(88)} fill="var(--cyan)" fillOpacity="0.65" fontSize="10" fontWeight="800" textAnchor="middle" letterSpacing="0.5px">
            {isArabic ? '⭐ النجوم الواعدة' : '⭐ HIGH-POTENTIAL STARS'}
          </text>
          <text x={xScale(25)} y={yScale(88)} fill="#79c0ff" fillOpacity="0.6" fontSize="10" fontWeight="750" textAnchor="middle">
            {isArabic ? '💡 فرضيات نمو' : '💡 PROMISING HYPOTHESES'}
          </text>
          <text x={xScale(75)} y={yScale(30)} fill="#9aa3ff" fillOpacity="0.5" fontSize="10" fontWeight="700" textAnchor="middle">
            {isArabic ? '🛡️ مكانة مستقرة' : '🛡️ STABLE NICHE'}
          </text>
          <text x={xScale(25)} y={yScale(30)} fill="var(--muted)" fillOpacity="0.5" fontSize="10" fontWeight="700" textAnchor="middle">
            {isArabic ? '🌱 استكشاف مبكر' : '🌱 EARLY EXPLORATION'}
          </text>

          {/* Grid lines & Axis ticks */}
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={`grid-y-${val}`}>
              <line x1={padding.left} y1={yScale(val)} x2={width - padding.right} y2={yScale(val)} stroke="var(--line)" strokeWidth="1" />
              <text x={padding.left - 10} y={yScale(val) + 4} fill="var(--muted)" fontSize="9" textAnchor="end">{val}</text>
            </g>
          ))}

          {[0, 25, 50, 75, 100].map((val) => (
            <g key={`grid-x-${val}`}>
              <line x1={xScale(val)} y1={padding.top} x2={xScale(val)} y2={height - padding.bottom} stroke="var(--line)" strokeWidth="1" />
              <text x={xScale(val)} y={height - padding.bottom + 18} fill="var(--muted)" fontSize="9" textAnchor="middle">{val}%</text>
            </g>
          ))}

          {/* Axis Labels */}
          <text x={width / 2} y={height - 12} fill="#dce8f5" fontSize="11" fontWeight="700" textAnchor="middle">
            {isArabic ? 'ثقة الأدلة التجريبية (Confidence %)' : 'Evidence Confidence (%) →'}
          </text>
          <text transform={`translate(18, ${height / 2}) rotate(-90)`} fill="#dce8f5" fontSize="11" fontWeight="700" textAnchor="middle">
            {isArabic ? 'نتيجة الفرصة (Opportunity Score)' : 'Opportunity Score (0-100) ↑'}
          </text>

          {/* Idea Scatter Nodes */}
          {filteredIdeas.map((idea, index) => {
            const opp = idea.opportunityScore || 0;
            const conf = idea.confidence || 0;
            const cx = xScale(conf);
            const cy = yScale(opp);
            const title = isArabic ? idea.title.ar : idea.title.en;
            const isTop = opp >= 70;
            const isStar = opp >= 70 && conf >= 50;
            const trend = getIdeaTrend(idea);

            return (
              <motion.g
                key={idea.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: index * 0.04,
                }}
                style={{ cursor: 'pointer', transformOrigin: `${cx}px ${cy}px` }}
                onClick={() => onOpenReport(idea)}
                onMouseEnter={(e: any) => handleMouseMove(e, idea)}
                onMouseLeave={() => setHoveredIdea(null)}
              >
                {/* Outer Glow for top stars */}
                {isStar && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r="14"
                    fill="#43e6d2"
                    fillOpacity="0.2"
                    style={{ animation: 'pulse 2s infinite' }}
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isStar ? 8 : 6.5}
                  fill={isStar ? 'var(--cyan)' : isTop ? '#1d9bf0' : '#7888ff'}
                  stroke={trend.type === 'improving' ? 'var(--cyan)' : trend.type === 'declining' ? '#ff6d7e' : '#040a13'}
                  strokeWidth={trend.type !== 'stable' ? '2.5' : '1.5'}
                />
                {/* Trend icon badge next to node */}
                <text
                  x={cx + 10}
                  y={cy + 3}
                  fill={trend.color}
                  fontSize="11"
                  fontWeight="900"
                  style={{ pointerEvents: 'none' }}
                >
                  {trend.icon}
                </text>
                <text
                  x={cx}
                  y={cy - 12}
                  fill="#f4f8ff"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}
                >
                  {title.length > 16 ? title.substring(0, 14) + '..' : title}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredIdea && (() => {
          const trend = getIdeaTrend(hoveredIdea);
          return (
            <div
              style={{
                position: 'absolute',
                top: `${Math.max(10, tooltipPos.y - 95)}px`,
                left: `${Math.min(width - 240, Math.max(10, tooltipPos.x - 110))}px`,
                background: 'var(--card-bg)',
                border: '1px solid var(--line-strong)',
                borderRadius: '10px',
                padding: '12px 14px',
                boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                zIndex: 50,
                width: '230px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="stage-badge" style={{ fontSize: '8px', padding: '2px 5px' }}>
                  {hoveredIdea.stage}
                </span>
                <span style={{ color: trend.color, fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>{trend.icon}</span> {trend.label}
                </span>
              </div>
              <strong style={{ fontSize: '12px', color: 'var(--ink)', display: 'block', margin: '4px 0' }}>
                {isArabic ? hoveredIdea.title.ar : hoveredIdea.title.en}
              </strong>
              <div style={{ fontSize: '10px', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                <span>{isArabic ? 'الفرصة:' : 'Opp:'} <strong style={{ color: 'var(--cyan)' }}>{hoveredIdea.opportunityScore}/100</strong></span>
                <span>{isArabic ? 'الثقة:' : 'Conf:'} <strong>{hoveredIdea.confidence}%</strong></span>
              </div>
            </div>
          );
        })()}

        {/* Legend Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--card-bg)',
            border: '1px solid var(--line)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '10px',
            color: 'var(--muted)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: '800', marginBottom: '2px', color: '#fff' }}>
            {isArabic ? 'دليل الألوان' : 'Color Legend'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--cyan)' }} />
            <span>{isArabic ? 'نجم واعد (فرصة عالية، ثقة عالية)' : 'High Star (Opp ≥ 70, Conf ≥ 50)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'block', width: '12px', height: '12px', borderRadius: '50%', background: '#1d9bf0' }} />
            <span>{isArabic ? 'فرضية (فرصة عالية، ثقة منخفضة)' : 'Hypothesis (Opp ≥ 70, Conf < 50)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'block', width: '12px', height: '12px', borderRadius: '50%', background: '#7888ff' }} />
            <span>{isArabic ? 'أساسي (فرصة < 70)' : 'Baseline (Opp < 70)'}</span>
          </div>
        </div>
      </div>

      {/* Cluster Summary Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginTop: '20px',
        }}
      >
        <div className="summary-stat positive">
          <span className="stat-num">{highPotentialCount}</span>
          <span className="stat-label">{isArabic ? '⭐ النجوم الواعدة' : '⭐ High-Potential Stars'}</span>
        </div>
        <div className="summary-stat" style={{ borderColor: '#1d9bf044' }}>
          <span className="stat-num" style={{ color: '#79c0ff' }}>{promisingHypothesisCount}</span>
          <span className="stat-label">{isArabic ? '💡 فرضيات نمو' : '💡 Promising Hypotheses'}</span>
        </div>
        <div className="summary-stat" style={{ borderColor: '#7888ff44' }}>
          <span className="stat-num" style={{ color: '#9aa3ff' }}>{stableNicheCount}</span>
          <span className="stat-label">{isArabic ? '🛡️ مكانة مستقرة' : '🛡️ Stable Niche'}</span>
        </div>
        <div className="summary-stat" style={{ borderColor: 'var(--line)' }}>
          <span className="stat-num" style={{ color: 'var(--muted)' }}>{earlyExplorationCount}</span>
          <span className="stat-label">{isArabic ? '🌱 استكشاف مبكر' : '🌱 Early Exploration'}</span>
        </div>
      </div>
    </div>
  );
};

