import React from 'react';

interface GlyphProps {
  name: string;
}

export const Glyph: React.FC<GlyphProps> = ({ name }) => {
  const glyphMap: Record<string, string> = {
    grid: '▦',
    spark: '✦',
    signal: '⌁',
    vault: '◇',
    chat: '◌',
    person: '○',
    home: '⌂',
    plus: '+',
    arrow: '→',
    check: '✓',
    menu: '•••',
    search: '⌕',
    tag: '#',
    trash: '✕',
    download: '↓',
    filter: '⑂',
    share: '↗',
    link: '🔗',
    mail: '✉',
  };

  return (
    <span className={`glyph glyph-${name}`} aria-hidden="true">
      {glyphMap[name] ?? '·'}
    </span>
  );
};
