import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface StructuredResponseProps {
  content: string;
  isArabic: boolean;
}

export const StructuredResponse: React.FC<StructuredResponseProps> = ({ content, isArabic }) => {
  // Parse paragraphs and bullet points
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  const sections: Array<{
    type: 'heading' | 'insight' | 'risk' | 'bullet' | 'paragraph';
    text: string;
  }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('###') || trimmed.startsWith('##') || trimmed.startsWith('#')) {
      sections.push({ type: 'heading', text: trimmed.replace(/^#+\s*/, '') });
    } else if (
      trimmed.toLowerCase().includes('insight') ||
      trimmed.toLowerCase().includes('key takeaway') ||
      trimmed.includes('💡') ||
      trimmed.toLowerCase().includes('أبرز الرؤى') ||
      trimmed.toLowerCase().includes('رؤية رئيسية')
    ) {
      sections.push({ type: 'insight', text: trimmed.replace(/^(💡|Key Insight:|رؤية رئيسية:)\s*/i, '') });
    } else if (
      trimmed.toLowerCase().includes('risk') ||
      trimmed.toLowerCase().includes('warning') ||
      trimmed.includes('⚠️') ||
      trimmed.toLowerCase().includes('خطر') ||
      trimmed.toLowerCase().includes('تحذير')
    ) {
      sections.push({ type: 'risk', text: trimmed.replace(/^(⚠️|Risk:|تحذير:|خطر:)\s*/i, '') });
    } else if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
      sections.push({ type: 'bullet', text: trimmed.replace(/^([-*]|\d+\.)\s*/, '') });
    } else {
      sections.push({ type: 'paragraph', text: trimmed });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', lineHeight: '1.6' }}>
      {sections.map((sec, idx) => {
        if (sec.type === 'heading') {
          return (
            <h4
              key={idx}
              style={{
                color: 'var(--cyan)',
                fontSize: '14px',
                fontWeight: 700,
                marginTop: idx > 0 ? '8px' : '0',
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {sec.text}
            </h4>
          );
        }

        if (sec.type === 'insight') {
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(67, 230, 210, 0.08)',
                border: '1px solid rgba(67, 230, 210, 0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                margin: '4px 0'
              }}
            >
              <Lightbulb className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong style={{ display: 'block', fontSize: '11px', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  {isArabic ? 'رؤية تحليلية رئيسية (Key Insight)' : 'Key Analytical Insight'}
                </strong>
                <span style={{ color: 'var(--ink)' }}>{sec.text}</span>
              </div>
            </div>
          );
        }

        if (sec.type === 'risk') {
          return (
            <div
              key={idx}
              style={{
                background: 'rgba(248, 113, 113, 0.08)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                margin: '4px 0'
              }}
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong style={{ display: 'block', fontSize: '11px', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                  {isArabic ? 'مخاطر حرجة وتحذير (Critical Risk)' : 'Critical Risk & Warning'}
                </strong>
                <span style={{ color: 'var(--ink)' }}>{sec.text}</span>
              </div>
            </div>
          );
        }

        if (sec.type === 'bullet') {
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                paddingLeft: isArabic ? '0' : '6px',
                paddingRight: isArabic ? '6px' : '0'
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-1" />
              <span style={{ color: 'var(--ink)' }}>{sec.text}</span>
            </div>
          );
        }

        return (
          <p key={idx} style={{ margin: 0, color: 'var(--ink)' }}>
            {sec.text}
          </p>
        );
      })}
    </div>
  );
};
