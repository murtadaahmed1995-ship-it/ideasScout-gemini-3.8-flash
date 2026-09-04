import React from 'react';

interface BrandProps {
  compact?: boolean;
  wordClassName?: string;
  wordStyle?: React.CSSProperties;
}

export const Brand: React.FC<BrandProps> = ({ compact = false, wordClassName = '', wordStyle }) => {
  return (
    <span className={`inline-flex items-center gap-3.5 px-3 py-2 my-1.5 transition-all duration-300 ${compact ? 'scale-95 origin-left px-1.5' : ''}`}>
      <span 
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#040e1b] border border-[#43e6d2]/40 shadow-[0_0_22px_rgba(67,230,210,0.22)]" 
        aria-hidden="true"
      >
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="42" stroke="#43e6d2" strokeWidth="6" className="opacity-95" />
          {/* Inner Ring */}
          <circle cx="50" cy="50" r="26" stroke="#2563eb" strokeWidth="4.5" className="opacity-80" />
          {/* Radar pointer / needle pointing top-right */}
          <path d="M50 50 L76 24 L64 14 Z" fill="url(#officialRadarGrad)" opacity="0.95" />
          {/* Center core glowing dot */}
          <circle cx="50" cy="50" r="10.5" fill="#ffffff" filter="drop-shadow(0 0 6px #43e6d2)" />
          {/* Trailing satellites/dots */}
          <circle cx="79" cy="34" r="5.5" fill="#43e6d2" filter="drop-shadow(0 0 4px #43e6d2)" />
          <circle cx="87" cy="21" r="7.5" fill="#43e6d2" filter="drop-shadow(0 0 5px #43e6d2)" />
          <defs>
            <linearGradient id="officialRadarGrad" x1="50" y1="50" x2="76" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1d4ed8" />
              <stop offset="1" stopColor="#43e6d2" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      {!compact && (
        <span 
          className={`font-sans text-[22px] font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300 ${wordClassName}`.trim()} 
          style={{ ...wordStyle, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', letterSpacing: '-0.025em' }}
        >
          IdeaScout
        </span>
      )}
    </span>
  );
};
