import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Idea, Stage } from '../types';
import { Glyph } from './Glyph';
import { Sparkline } from './Sparkline';

export interface IdeaCardProps {
  idea: Idea;
  isArabic: boolean;
  isSelected: boolean;
  stageLabels: Record<string, string>;
  onToggleSelect: (ideaId: string, checked: boolean) => void;
  onOpenReport: (idea: Idea) => void;
  onUpdateIdea: (idea: Idea) => void;
  onArchiveIdea: (ideaId: string) => void;
  onUpdateIdeaTags?: (ideaId: string, tags: string[]) => void;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({
  idea,
  isArabic,
  isSelected,
  stageLabels,
  onToggleSelect,
  onOpenReport,
  onUpdateIdea,
  onArchiveIdea,
  onUpdateIdeaTags,
}) => {
  const [isTagInputOpen, setIsTagInputOpen] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  // Extract recent score changes from the evolution array
  const evolution = idea.evolution || [];
  let oppDelta = 0;
  let confDelta = 0;

  if (evolution.length >= 2) {
    const current = evolution[evolution.length - 1];
    const prev = evolution[evolution.length - 2];
    oppDelta = current.opportunityScore - prev.opportunityScore;
    confDelta = current.confidence - prev.confidence;
  } else if (evolution.length === 1) {
    const baseline = evolution[0];
    if (idea.opportunityScore !== baseline.opportunityScore) {
      oppDelta = idea.opportunityScore - baseline.opportunityScore;
    }
    if (idea.confidence !== baseline.confidence) {
      confDelta = idea.confidence - baseline.confidence;
    }
  }

  // Trajectory history for sparkline visualization
  const oppTrajectory =
    evolution.length >= 2
      ? evolution.map((e) => e.opportunityScore)
      : [Math.max(0, idea.opportunityScore - 4), idea.opportunityScore];

  const displayTitle = isArabic ? idea.title.ar : idea.title.en;

  const getMonogram = (title: string) => {
    return (
      title
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase() || 'IS'
    );
  };

  const handleAddTag = () => {
    const trimmed = newTagText.trim();
    if (trimmed) {
      const currentTags = idea.tags || [];
      if (!currentTags.includes(trimmed)) {
        onUpdateIdeaTags?.(idea.id, [...currentTags, trimmed]);
      }
    }
    setNewTagText('');
    setIsTagInputOpen(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = idea.tags || [];
    onUpdateIdeaTags?.(
      idea.id,
      currentTags.filter((t) => t !== tagToRemove)
    );
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -12, transition: { duration: 0.2 } }}
      transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
      id={`idea-card-${idea.id}`}
      className={`panel idea-card ${isSelected ? 'is-selected' : ''}`}
    >
      {/* Item Selection Checkbox */}
      <input
        id={`idea-select-${idea.id}`}
        type="checkbox"
        className="card-select-checkbox"
        checked={isSelected}
        onChange={(e) => onToggleSelect(idea.id, e.target.checked)}
        aria-label={isArabic ? `تحديد فكرة ${displayTitle}` : `Select idea ${displayTitle}`}
      />

      {/* Top row with monogram, stage pill, and date */}
      <div className="idea-card-top" style={{ paddingInlineStart: '24px' }}>
        <span className="idea-monogram">{getMonogram(displayTitle)}</span>
        <div className="idea-stage-line">
          <span className={`stage-badge stage-${idea.stage.toLowerCase()}`}>
            {stageLabels[idea.stage] ?? idea.stage}
          </span>
          {idea.isSample && (
            <span
              className="sample-badge"
              style={{
                fontSize: '10px',
                fontWeight: 600,
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--muted)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              {isArabic ? 'نموذج تجريبي' : 'Sample Demo'}
            </span>
          )}
          <small>
            {new Date(idea.updatedAt).toLocaleDateString(
              isArabic ? 'ar-EG' : 'en-US',
              { month: 'short', day: 'numeric' }
            )}
          </small>
        </div>
      </div>

      <h3>{displayTitle}</h3>
      <p className="idea-card-desc">{idea.description}</p>

      {/* Custom Tagging System */}
      <div className="idea-tags-row" id={`idea-tags-${idea.id}`}>
        {(idea.tags || []).map((tag) => (
          <span key={tag} className="idea-tag-chip">
            #{tag}
            <button
              type="button"
              className="idea-tag-remove"
              onClick={() => handleRemoveTag(tag)}
              title={isArabic ? `حذف وسم ${tag}` : `Remove tag ${tag}`}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}

        {isTagInputOpen ? (
          <input
            type="text"
            autoFocus
            className="idea-tag-input"
            placeholder={isArabic ? 'وسم جديد...' : 'tag name...'}
            value={newTagText}
            onChange={(e) => setNewTagText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTag();
              if (e.key === 'Escape') {
                setIsTagInputOpen(false);
                setNewTagText('');
              }
            }}
            onBlur={handleAddTag}
          />
        ) : (
          <button
            type="button"
            className="idea-tag-add-btn"
            onClick={() => {
              setIsTagInputOpen(true);
              setNewTagText('');
            }}
            title={isArabic ? 'إضافة وسم' : 'Add custom tag'}
          >
            + {isArabic ? 'وسم' : 'Tag'}
          </button>
        )}
      </div>

      {/* Score and Dual Trend Indicators Section */}
      <div className="idea-score-line" id={`idea-score-line-${idea.id}`}>
        {/* Opportunity Score + Trend Indicator */}
        <div className="opportunity-score-group">
          <div
            key={idea.opportunityScore}
            className="score-ring score-ring-small"
            style={{ ['--score' as any]: `${idea.opportunityScore * 3.6}deg` }}
          >
            <div className="score-ring-inner">
              <strong>{idea.opportunityScore}</strong>
            </div>
          </div>

          <div className="opportunity-trend-meta">
            <span className="score-meta-label">
              {isArabic ? 'الفرصة' : 'Opportunity'}
            </span>
            <span
              id={`trend-opportunity-${idea.id}`}
              className={`trend-badge ${oppDelta > 0 ? 'up' : oppDelta < 0 ? 'down' : 'neutral'}`}
              title={
                isArabic
                  ? oppDelta > 0
                    ? `+${oppDelta} نقطة في جاذبية الفرصة في آخر تحديث للتطور`
                    : oppDelta < 0
                    ? `${oppDelta} نقطة في جاذبية الفرصة في آخر تحديث للتطور`
                    : 'نتيجة الفرصة مستقرة'
                  : oppDelta > 0
                  ? `+${oppDelta} pts Opportunity change from evolution`
                  : oppDelta < 0
                  ? `${oppDelta} pts Opportunity change from evolution`
                  : 'Opportunity score stable'
              }
              aria-label={`Opportunity trend: ${oppDelta > 0 ? `+${oppDelta}` : oppDelta}`}
            >
              <span className="trend-arrow" aria-hidden="true">
                {oppDelta > 0 ? '▲' : oppDelta < 0 ? '▼' : '—'}
              </span>
              <span>{oppDelta > 0 ? `+${oppDelta}` : oppDelta}</span>
            </span>
          </div>
        </div>

        {/* Evolution Sparkline Trajectory + Confidence Score with Trend Indicator */}
        <div className="score-sparkline-block">
          <Sparkline values={oppTrajectory} color="var(--cyan)" width={64} height={22} />

          {/* Confidence Score with Trend Indicator next to it */}
          <div className="confidence-trend-row" id={`trend-confidence-row-${idea.id}`}>
            <div className="confidence-score-wrap">
              <span className="confidence-score-label">
                {isArabic ? 'الثقة:' : 'Confidence:'}
              </span>
              <strong className="confidence-score-val">{idea.confidence}%</strong>
            </div>

            <span
              id={`trend-confidence-${idea.id}`}
              className={`trend-badge ${confDelta > 0 ? 'up' : confDelta < 0 ? 'down' : 'neutral'}`}
              title={
                isArabic
                  ? confDelta > 0
                    ? `+${confDelta}% زيادة في مستوى الثقة المبنية على الأدلة`
                    : confDelta < 0
                    ? `${confDelta}% انخفاض في مستوى الثقة المبنية على الأدلة`
                    : 'مستوى الثقة مستقر'
                  : confDelta > 0
                  ? `+${confDelta}% Confidence change from evolution`
                  : confDelta < 0
                  ? `${confDelta}% Confidence change from evolution`
                  : 'Confidence level stable'
              }
              aria-label={`Confidence trend: ${confDelta > 0 ? `+${confDelta}%` : `${confDelta}%`}`}
            >
              <span className="trend-arrow" aria-hidden="true">
                {confDelta > 0 ? '▲' : confDelta < 0 ? '▼' : '—'}
              </span>
              <span>{confDelta > 0 ? `+${confDelta}%` : `${confDelta}%`}</span>
            </span>
          </div>

          {/* Readiness Meta */}
          <div className="readiness-meta-row">
            <span>{isArabic ? 'الجاهزية:' : 'Readiness:'}</span>
            <strong className="readiness-val">
              {idea.readinessScore ??
                idea.latestAnalysis?.readinessScore ??
                idea.latestAnalysis?.inputReadiness ??
                0}%
            </strong>
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="idea-card-footer">
        <button
          id={`open-report-${idea.id}`}
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenReport(idea)}
        >
          {isArabic ? 'فتح التقرير' : 'Open report'}
        </button>
        <button
          id={`update-idea-${idea.id}`}
          type="button"
          className="btn btn-secondary"
          onClick={() => onUpdateIdea(idea)}
        >
          {isArabic ? 'تحديث' : 'Update'}
        </button>
        <button
          id={`archive-idea-${idea.id}`}
          type="button"
          className="archive-button"
          onClick={() => onArchiveIdea(idea.id)}
          title={isArabic ? 'أرشفة الفكرة' : 'Archive idea'}
          aria-label={isArabic ? 'أرشفة الفكرة' : 'Archive idea'}
        >
          ×
        </button>
      </div>
    </motion.article>
  );
};
