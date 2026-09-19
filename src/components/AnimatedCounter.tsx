import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
  enableUpdateFlash?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
  style,
  enableUpdateFlash = true
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number | null>(null);
  const [updateDirection, setUpdateDirection] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const fromVal = prevValueRef.current !== null ? prevValueRef.current : 0;
    const isUpdate = prevValueRef.current !== null && prevValueRef.current !== value;

    if (isUpdate && enableUpdateFlash) {
      setUpdateDirection(value > prevValueRef.current! ? 'up' : 'down');
      const flashTimer = setTimeout(() => {
        setUpdateDirection(null);
      }, 1400);

      prevValueRef.current = value;

      const controls = animate(fromVal, value, {
        duration: 0.85,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(latest) {
          if (node) {
            node.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
          }
        },
      });

      return () => {
        controls.stop();
        clearTimeout(flashTimer);
      };
    } else {
      prevValueRef.current = value;
      const controls = animate(fromVal, value, {
        duration: 1.15,
        ease: [0.16, 1, 0.3, 1],
        onUpdate(latest) {
          if (node) {
            node.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
          }
        },
      });

      return () => controls.stop();
    }
  }, [value, decimals, suffix, prefix, enableUpdateFlash]);

  const flashClass = updateDirection === 'up' 
    ? 'score-flash-up' 
    : updateDirection === 'down' 
    ? 'score-flash-down' 
    : '';

  return (
    <span 
      ref={nodeRef} 
      className={`animated-counter-val ${flashClass} ${className}`.trim()} 
      style={style}
    >
      {prefix}0{suffix}
    </span>
  );
};

