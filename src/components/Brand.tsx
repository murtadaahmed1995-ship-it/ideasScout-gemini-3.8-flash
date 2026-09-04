import React from 'react';

interface BrandProps {
  compact?: boolean;
}

export const Brand: React.FC<BrandProps> = ({ compact = false }) => {
  return (
    <span className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-orbit" />
        <span className="brand-needle" />
        <span className="brand-core" />
      </span>
      {!compact && <span className="brand-word">IdeaScout</span>}
    </span>
  );
};
