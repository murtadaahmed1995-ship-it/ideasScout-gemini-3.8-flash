import React, { useEffect, useRef, useState, useId } from 'react';
import { animate, motion, AnimatePresence } from 'motion/react';
import { AnimatedCounter } from './AnimatedCounter';

export interface OpportunityScoreRingProps {
  score: number;
  size?: 'large' | 'small' | number;
  label?: string;
  isArabic?: boolean;
  showDeltaBadge?: boolean;
  overridePreviousScore?: number;
  className?: string;
  id?: string;
}

export const OpportunityScoreRing: React.FC<OpportunityScoreRingProps> = ({
  score,
  size = 'large',
  label,
  isArabic = false,
  showDeltaBadge = true,
  overridePreviousScore,
  className = '',
  id
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const numericSize = typeof size === 'number' ? size : size === 'large' ? 146 : 78;
  const isLarge = numericSize >= 110;

  const strokeWidth = isLarge ? 10 : 6;
  const center = numericSize / 2;
  const radius = (numericSize - strokeWidth) / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const targetOffset = circumference - (clampedScore / 100) * circumference;

  const circleRef = useRef<SVGCircleElement>(null);
  const prevScoreRef = useRef<number | null>(null);
  const [delta, setDelta] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Animate SVG circle stroke on entry and update
  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const prevScore = overridePreviousScore !== undefined 
      ? overridePreviousScore 
      : prevScoreRef.current;

    const fromOffset = prevScore !== null
      ? circumference - (Math.max(0, Math.min(100, prevScore)) / 100) * circumference
      : circumference;

    const scoreChanged = prevScore !== null && prevScore !== clampedScore;

    if (scoreChanged && showDeltaBadge) {
      const diff = clampedScore - prevScore;
      setDelta(diff);
      setIsUpdating(true);

      const deltaTimer = setTimeout(() => {
        setDelta(null);
        setIsUpdating(false);
      }, 2600);

      const controls = animate(fromOffset, targetOffset, {
        duration: 0.95,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(latest) {
          if (circle) {
            circle.style.strokeDashoffset = `${latest}px`;
          }
        }
      });

      prevScoreRef.current = clampedScore;

      return () => {
        controls.stop();
        clearTimeout(deltaTimer);
      };
    } else {
      // Initial entry or unchanged
      prevScoreRef.current = clampedScore;
      const controls = animate(fromOffset, targetOffset, {
        duration: 1.25,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(latest) {
          if (circle) {
            circle.style.strokeDashoffset = `${latest}px`;
          }
        }
      });

      return () => controls.stop();
    }
  }, [clampedScore, circumference, targetOffset, overridePreviousScore, showDeltaBadge]);

  const defaultLabel = isArabic ? 'الفرصة' : 'Opportunity';
  const displayLabel = label ?? defaultLabel;

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, scale: 0.84, rotate: -8 }}
      animate={{ 
        opacity: 1, 
        scale: isUpdating ? [1, 1.06, 1] : 1, 
        rotate: 0 
      }}
      transition={{ 
        opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        scale: isUpdating ? { duration: 0.5, ease: 'easeOut' } : { type: 'spring', stiffness: 280, damping: 22 },
        rotate: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
      }}
      className={`opportunity-score-gauge-wrapper ${isLarge ? 'gauge-large' : 'gauge-small'} ${isUpdating ? 'gauge-is-updating' : ''} ${className}`.trim()}
      style={{ width: numericSize, height: numericSize, position: 'relative' }}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${displayLabel}: ${clampedScore} / 100`}
    >
      {/* Dynamic Aura Glow behind ring on update */}
      <div 
        className={`gauge-aura ${isUpdating ? (delta && delta > 0 ? 'aura-up' : 'aura-down') : ''}`}
        aria-hidden="true"
      />

      {/* Ripple ring animation on score update */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ scale: 0.88, opacity: 0.85 }}
            animate={{ scale: 1.32, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              inset: -2,
              borderRadius: '50%',
              border: `2px solid ${delta && delta >= 0 ? 'var(--cyan)' : '#fb923c'}`,
              boxShadow: `0 0 16px ${delta && delta >= 0 ? 'rgba(67, 230, 210, 0.5)' : 'rgba(251, 146, 60, 0.5)'}`,
              pointerEvents: 'none',
              zIndex: 0
            }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <svg
        width={numericSize}
        height={numericSize}
        viewBox={`0 0 ${numericSize} ${numericSize}`}
        className="opportunity-score-svg"
        aria-hidden="true"
      >
        <defs>
          {/* Luminous Teal/Cyan Gradient */}
          <linearGradient id={`oppGrad-${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.85" />
            <stop offset="60%" stopColor="var(--cyan)" stopOpacity="1" />
            <stop offset="100%" stopColor="#7eeae0" stopOpacity="1" />
          </linearGradient>

          {/* Optional subtle glow filter for active track */}
          <filter id={`oppGlow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={isLarge ? "3" : "1.8"} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Inactive Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="gauge-track-bg"
        />

        {/* Active Animated Score Meter Arc */}
        <circle
          ref={circleRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#oppGrad-${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference}px`}
          strokeDashoffset={`${circumference}px`}
          transform={`rotate(-90 ${center} ${center})`}
          className="gauge-meter-arc"
          filter={`url(#oppGlow-${uniqueId})`}
        />
      </svg>

      {/* Center Value Content */}
      <div className="gauge-center-content">
        <strong className="gauge-number">
          <AnimatedCounter 
            value={clampedScore} 
            enableUpdateFlash={true}
          />
        </strong>

        {isLarge && (
          <span className="gauge-label">
            {displayLabel}
          </span>
        )}
      </div>

      {/* Floating Delta Badge on Update */}
      <AnimatePresence>
        {delta !== null && delta !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -6, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.85 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={`gauge-delta-pill ${delta > 0 ? 'delta-positive' : 'delta-negative'}`}
            title={isArabic 
              ? (delta > 0 ? `زيادة +${delta} في الفرصة` : `تراجع ${delta} في الفرصة`)
              : (delta > 0 ? `+${delta} Opportunity Increase` : `${delta} Opportunity Change`)}
          >
            {delta > 0 ? `+${delta}` : `${delta}`}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
