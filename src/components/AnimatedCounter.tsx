import React, { useEffect, useRef } from 'react';
import { animate } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  decimals = 0,
  className,
  style
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        if (node) {
          node.textContent = latest.toFixed(decimals) + suffix;
        }
      },
    });

    return () => controls.stop();
  }, [value, decimals, suffix]);

  return <span ref={nodeRef} className={className} style={style}>0{suffix}</span>;
};
