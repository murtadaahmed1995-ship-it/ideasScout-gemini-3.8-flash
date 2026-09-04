import React from 'react';

export type StabilityTier = 'high' | 'moderate' | 'vulnerable' | 'critical' | 'untested';

export interface StabilityEvaluation {
  tier: StabilityTier;
  color: string;
  posPercent: number;
  negPercent: number;
  total: number;
  labelEn: string;
  labelAr: string;
  tooltipEn: string;
  tooltipAr: string;
  badgeTone: string;
}

/**
 * Calculates deterministic stability rating and qualitative assessment
 * based on the empirical ratio of positive vs negative evidence.
 */
export function evaluateStability(positiveCount: number, negativeCount: number): StabilityEvaluation {
  const safePos = Math.max(0, positiveCount);
  const safeNeg = Math.max(0, negativeCount);
  const total = safePos + safeNeg;

  if (total === 0) {
    return {
      tier: 'untested',
      color: '#79c0ff',
      posPercent: 0,
      negPercent: 0,
      total: 0,
      labelEn: 'Hypothesis',
      labelAr: 'فرضية قيد الاختبار',
      tooltipEn: 'Untested Hypothesis: No empirical positive or negative evidence logged yet.',
      tooltipAr: 'فرضية قيد الاختبار: لم تُسجل أي أدلة إيجابية أو سلبية تجريبياً بعد.',
      badgeTone: 'tone-blue'
    };
  }

  const posRatio = safePos / total;
  const posPercent = Math.round(posRatio * 100);
  const negPercent = 100 - posPercent;

  if (posPercent >= 80) {
    return {
      tier: 'high',
      color: '#52e8ac',
      posPercent,
      negPercent,
      total,
      labelEn: 'High Stability',
      labelAr: 'استقرار عالٍ',
      tooltipEn: `High Stability (${posPercent}% Positive): ${safePos} positive signals vs ${safeNeg} negative feedback. Strong qualitative foundation.`,
      tooltipAr: `استقرار عالٍ (${posPercent}% إيجابي): ${safePos} إشارات إيجابية مقابل ${safeNeg} ملاحظات سلبية. أساس تجريبي قوي.`,
      badgeTone: 'tone-mint'
    };
  }

  if (posPercent >= 50) {
    return {
      tier: 'moderate',
      color: '#e3b341',
      posPercent,
      negPercent,
      total,
      labelEn: 'Moderate Stability',
      labelAr: 'استقرار معتدل',
      tooltipEn: `Moderate Stability (${posPercent}% Positive): ${safePos} positive signals vs ${safeNeg} negative feedback. Balanced but requires further validation.`,
      tooltipAr: `استقرار معتدل (${posPercent}% إيجابي): ${safePos} إشارات إيجابية مقابل ${safeNeg} ملاحظات سلبية. توازن يتطلب مزيداً من التحقق.`,
      badgeTone: 'tone-amber'
    };
  }

  if (safePos > 0) {
    return {
      tier: 'vulnerable',
      color: '#ff7b72',
      posPercent,
      negPercent,
      total,
      labelEn: 'Vulnerable',
      labelAr: 'استقرار هش',
      tooltipEn: `Vulnerable Stability (${posPercent}% Positive): Negative feedback (${safeNeg}) outweighs positive proof (${safePos}). High risk of friction.`,
      tooltipAr: `استقرار هش (${posPercent}% إيجابي): الملاحظات السلبية (${safeNeg}) تفوق الإثبات الإيجابي (${safePos}). مخاطر احتكاك مرتفعة.`,
      badgeTone: 'tone-coral'
    };
  }

  return {
    tier: 'critical',
    color: '#ff6e88',
    posPercent: 0,
    negPercent: 100,
    total,
    labelEn: 'Negative Skew',
    labelAr: 'انحياز سلبي حرج',
    tooltipEn: `Critical Negative Skew: 0 positive signals vs ${safeNeg} negative feedback. Core assumptions are challenged.`,
    tooltipAr: `انحياز سلبي حرج: 0 إشارات إيجابية مقابل ${safeNeg} ملاحظات سلبية. الفرضيات الأساسية تواجه تحديات صريحة.`,
    badgeTone: 'tone-crimson'
  };
}

export interface EvidenceProgressRingProps {
  positiveCount: number;
  negativeCount: number;
  size?: number;
  strokeWidth?: number;
  isArabic?: boolean;
  showCenterText?: boolean;
  id?: string;
  className?: string;
}

/**
 * Visualizes the ratio of 'Positive' vs 'Negative' evidence as a high-contrast circular progress ring,
 * allowing instant qualitative assessment of an idea's stability.
 */
export const EvidenceProgressRing: React.FC<EvidenceProgressRingProps> = ({
  positiveCount,
  negativeCount,
  size = 32,
  strokeWidth = 3.5,
  isArabic = false,
  showCenterText = true,
  id,
  className = ''
}) => {
  const evalData = evaluateStability(positiveCount, negativeCount);
  const { tier, color, posPercent, total } = evalData;

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Arcs math
  const posLength = total > 0 ? (positiveCount / total) * circumference : 0;
  const negLength = total > 0 ? (negativeCount / total) * circumference : 0;

  // Stroke dashoffset for negative arc starts right after the positive arc finishes
  const negOffset = -posLength;

  const titleText = isArabic ? evalData.tooltipAr : evalData.tooltipEn;

  // Center font size relative to ring diameter
  const centerFontSize = Math.max(7, Math.round(size * 0.28));

  return (
    <div
      id={id}
      className={`evidence-progress-ring-container ring-tier-${tier} ${className}`}
      title={titleText}
      style={{ width: size, height: size }}
      role="img"
      aria-label={titleText}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="evidence-progress-ring-svg"
      >
        {/* Base Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={total === 0 ? 'rgba(121, 192, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)'}
          strokeWidth={strokeWidth}
          strokeDasharray={total === 0 ? '2 2' : undefined}
        />

        {total > 0 && (
          <g transform={`rotate(-90 ${center} ${center})`}>
            {/* Negative Arc (Red / Coral) */}
            {negLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#ff7b72"
                strokeWidth={strokeWidth}
                strokeDasharray={`${negLength} ${circumference}`}
                strokeDashoffset={negOffset}
                strokeLinecap={posLength === 0 || negLength === 0 ? 'round' : 'butt'}
                className="evidence-ring-arc-neg"
              />
            )}

            {/* Positive Arc (Mint / Green) */}
            {posLength > 0 && (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#52e8ac"
                strokeWidth={strokeWidth}
                strokeDasharray={`${posLength} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap={posLength === 0 || negLength === 0 ? 'round' : 'butt'}
                className="evidence-ring-arc-pos"
              />
            )}
          </g>
        )}

        {/* Center Label (percentage or dash) */}
        {showCenterText && (
          <text
            x={center}
            y={center}
            dy="0.34em"
            textAnchor="middle"
            fill={color}
            fontSize={centerFontSize}
            fontWeight="750"
            fontFamily="Inter, system-ui, sans-serif"
            className="evidence-ring-center-text"
          >
            {total === 0 ? '—' : `${posPercent}%`}
          </text>
        )}
      </svg>
    </div>
  );
};
