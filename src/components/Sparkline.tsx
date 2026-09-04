import React from 'react';

export interface SparklineProps {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  values,
  color = '#43e6d2',
  width = 64,
  height = 24,
  className = '',
}) => {
  if (!values || values.length === 0) return null;
  const data = values.length === 1 ? [Math.max(0, values[0] - 4), values[0]] : values;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max === min ? 1 : max - min;
  const pad = 3;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = data.map((val, idx) => {
    const x = pad + (idx / (data.length - 1)) * innerW;
    const y = pad + innerH - ((val - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastCoords = points[points.length - 1].split(',');
  const lastX = parseFloat(lastCoords[0]);
  const lastY = parseFloat(lastCoords[1]);

  return (
    <div className={`sparkline-svg-wrap ${className}`} title="Score evolution trajectory">
      <svg
        width={width}
        height={height}
        className="sparkline-svg"
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
        />
        <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
      </svg>
    </div>
  );
};
