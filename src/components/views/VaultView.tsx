import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Idea, Stage, WorkspaceView } from '../../types';
import { Glyph } from '../Glyph';
import { IdeaCard } from '../IdeaCard';
import { Sparkline } from '../Sparkline';

export { IdeaCard, Sparkline };

export interface VaultProps {
  isArabic: boolean;
  ideas: Idea[];
  onOpenReport: (idea: Idea) => void;
  onUpdateIdea: (idea: Idea) => void;
  onArchiveIdea: (ideaId: string) => void;
  onBulkArchiveIdeas?: (ideaIds: string[]) => void;
  onUpdateIdeaTags?: (ideaId: string, tags: string[]) => void;
  onStartNew: () => void;
}

export type VaultViewProps = VaultProps;
export type VaultSortOption = 'newest' | 'opportunity' | 'confidence';

export const VaultView: React.FC<VaultProps> = ({
  isArabic,
  ideas,
  onOpenReport,
  onUpdateIdea,
  onArchiveIdea,
  onBulkArchiveIdeas,
  onUpdateIdeaTags,
  onStartNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<VaultSortOption>('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [selectedIdeaIds, setSelectedIdeaIds] = useState<Set<string>>(new Set());

  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Close tag filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    if (isTagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  // Extract all unique tags across all ideas
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach((i) => {
      (i.tags || []).forEach((t) => {
        if (t.trim()) tagSet.add(t.trim());
      });
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [ideas]);

  const stageLabels: Record<string, string> = {
    All: isArabic ? 'الكل' : 'All',
    Concept: isArabic ? 'فكرة أولية' : 'Concept',
    Research: isArabic ? 'بحث' : 'Research',
    Validation: isArabic ? 'تحقق' : 'Validation',
    Growth: isArabic ? 'نمو' : 'Growth',
  };

  const stageCounts: Record<string, number> = {
    All: ideas.length,
    Concept: ideas.filter((i) => i.stage === 'Concept').length,
    Research: ideas.filter((i) => i.stage === 'Research').length,
    Validation: ideas.filter((i) => i.stage === 'Validation').length,
    Growth: ideas.filter((i) => i.stage === 'Growth').length,
  };

  // Filter ideas based on search, stage, and multi-selected tags
  const filteredIdeas = ideas.filter((item) => {
    const titleEn = (item.title?.en || '').toLowerCase();
    const titleAr = (item.title?.ar || '').toLowerCase();
    const activeTitle = (isArabic ? item.title?.ar : item.title?.en || '').toLowerCase();
    const descText = (item.description || '').toLowerCase();
    const stageText = (item.stage || '').toLowerCase();
    const tagsText = (item.tags || []).join(' ').toLowerCase();
    const query = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !query ||
      titleEn.includes(query) ||
      titleAr.includes(query) ||
      activeTitle.includes(query) ||
      descText.includes(query) ||
      stageText.includes(query) ||
      tagsText.includes(query);

    const matchesStage = selectedStage === 'All' || item.stage === selectedStage;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => (item.tags || []).includes(tag));

    return matchesSearch && matchesStage && matchesTags;
  });

  // Calculate metrics based on current filter selection
  const filteredCount = filteredIdeas.length;
  const totalCount = ideas.length;

  const avgOpportunity =
    filteredCount > 0
      ? Math.round(
          filteredIdeas.reduce((sum, item) => sum + (item.opportunityScore || 0), 0) /
            filteredCount
        )
      : 0;

  const avgConfidence =
    filteredCount > 0
      ? Math.round(
          filteredIdeas.reduce((sum, item) => sum + (item.confidence || 0), 0) /
            filteredCount
        )
      : 0;

  const avgReadiness =
    filteredCount > 0
      ? Math.round(
          filteredIdeas.reduce(
            (sum, item) =>
              sum +
              (item.readinessScore ??
                item.latestAnalysis?.readinessScore ??
                item.latestAnalysis?.inputReadiness ??
                0),
            0
          ) / filteredCount
        )
      : 0;

  // Sort filtered ideas according to selected sort criteria
  const sortedIdeas = useMemo(() => {
    return [...filteredIdeas].sort((a, b) => {
      if (sortOrder === 'newest') {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      }
      if (sortOrder === 'opportunity') {
        return (b.opportunityScore || 0) - (a.opportunityScore || 0);
      }
      if (sortOrder === 'confidence') {
        return (b.confidence || 0) - (a.confidence || 0);
      }
      return 0;
    });
  }, [filteredIdeas, sortOrder]);

  const isFiltering =
    searchTerm.trim().length > 0 || selectedStage !== 'All' || selectedTags.length > 0;

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStage('All');
    setSelectedTags([]);
  };

  // Tag filter toggle
  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Bulk selection handlers
  const handleToggleSelectIdea = (ideaId: string, checked: boolean) => {
    setSelectedIdeaIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(ideaId);
      } else {
        next.delete(ideaId);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIdeaIds.size === sortedIdeas.length) {
      setSelectedIdeaIds(new Set());
    } else {
      setSelectedIdeaIds(new Set(sortedIdeas.map((i) => i.id)));
    }
  };

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIdeaIds);
    if (ids.length > 0) {
      if (onBulkArchiveIdeas) {
        onBulkArchiveIdeas(ids);
      } else {
        ids.forEach((id) => onArchiveIdea(id));
      }
      setSelectedIdeaIds(new Set());
    }
  };

  const handleBulkExport = () => {
    const selectedIdeas = ideas.filter((i) => selectedIdeaIds.has(i.id));
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(selectedIdeas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ideascout_vault_export_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="view-stack vault-view" id="vault-view-root">
      {/* 1. Summary Bar at the top of the Vault component */}
      <section
        className="vault-summary-bar panel"
        id="vault-summary-bar"
        aria-label={isArabic ? 'ملخص الخزنة' : 'Vault Summary Metrics'}
      >
        <div className="summary-stat" id="vault-stat-total-count">
          <div className="stat-top">
            <span className="stat-label">{isArabic ? 'إجمالي الأفكار' : 'Total Ideas'}</span>
            <span className="stat-pill">
              {selectedStage !== 'All' ? stageLabels[selectedStage] : isArabic ? 'الكل' : 'All'}
            </span>
          </div>
          <div className="stat-num">
            {filteredCount}
            <small>/{totalCount}</small>
          </div>
          <span className="stat-sub">
            {isArabic
              ? isFiltering
                ? 'حسب التصفية الحالية'
                : 'إجمالي المحفوظات'
              : isFiltering
              ? 'In current filter selection'
              : 'All saved in collection'}
          </span>
        </div>

        <div className="summary-stat coverage" id="vault-stat-avg-opportunity">
          <div className="stat-top">
            <span className="stat-label">
              {isArabic ? 'متوسط نتيجة الفرصة' : 'Avg Opportunity Score'}
            </span>
            <span className="stat-pill" style={{ color: 'var(--cyan)' }}>
              0–100
            </span>
          </div>
          <div className="stat-num" style={{ color: 'var(--cyan)' }}>
            {filteredCount > 0 ? avgOpportunity : '—'}
            {filteredCount > 0 && <small>/100</small>}
          </div>
          <span className="stat-sub">
            {isArabic ? 'متوسط الأفكار المعروضة' : 'Current selection average'}
          </span>
        </div>

        <div className="summary-stat unknown" id="vault-stat-avg-confidence">
          <div className="stat-top">
            <span className="stat-label">
              {isArabic ? 'متوسط مستوى الثقة' : 'Avg Confidence Level'}
            </span>
            <span className="stat-pill" style={{ color: '#79c0ff' }}>
              %
            </span>
          </div>
          <div className="stat-num" style={{ color: '#79c0ff' }}>
            {filteredCount > 0 ? `${avgConfidence}%` : '—'}
          </div>
          <span className="stat-sub">
            {isArabic ? 'الثقة المستندة إلى الأدلة' : 'Empirical evidence level'}
          </span>
        </div>

        <div className="summary-stat positive" id="vault-stat-avg-readiness">
          <div className="stat-top">
            <span className="stat-label">{isArabic ? 'متوسط الجاهزية' : 'Avg Readiness'}</span>
            <span className="stat-pill" style={{ color: '#52e8ac' }}>
              %
            </span>
          </div>
          <div className="stat-num" style={{ color: '#52e8ac' }}>
            {filteredCount > 0 ? `${avgReadiness}%` : '—'}
          </div>
          <span className="stat-sub">
            {isArabic ? 'اكتمال المعطيات والمدخلات' : 'Input signals completeness'}
          </span>
        </div>
      </section>

      {/* 2. Enhanced Toolbar with Search, Stage Filters, Custom Tag Multi-select, and Sort */}
      <section className="vault-toolbar" id="vault-toolbar">
        {/* Search Input Bar */}
        <div className="search-field" id="vault-search-field">
          <Glyph name="search" />
          <input
            id="vault-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSearchTerm('');
            }}
            placeholder={
              isArabic
                ? 'ابحث في الخزنة بالعنوان، الوصف، الوسوم، أو المرحلة...'
                : 'Search vault by title, description, tags, stage...'
            }
            aria-label={isArabic ? 'بحث في الأفكار' : 'Search ideas'}
          />
          {searchTerm && (
            <button
              id="vault-search-clear"
              type="button"
              className="clear-button"
              onClick={() => setSearchTerm('')}
              title={isArabic ? 'مسح البحث' : 'Clear search text'}
              aria-label={isArabic ? 'مسح البحث' : 'Clear search text'}
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Buttons for Development Stages */}
        <div
          className="filter-row"
          id="vault-category-filters"
          role="tablist"
          aria-label={isArabic ? 'تصفية حسب مرحلة التطوير' : 'Filter by development stage'}
        >
          {(['All', 'Concept', 'Research', 'Validation', 'Growth'] as const).map((st) => (
            <button
              key={st}
              id={`vault-filter-button-${st.toLowerCase()}`}
              type="button"
              className={`filter-chip ${selectedStage === st ? 'active' : ''}`}
              onClick={() => setSelectedStage(st)}
              role="tab"
              aria-selected={selectedStage === st}
              aria-label={`${stageLabels[st]}: ${stageCounts[st]} ${isArabic ? 'أفكار' : 'ideas'}`}
            >
              <span>{stageLabels[st] ?? st}</span>
              <span className="filter-badge">{stageCounts[st]}</span>
            </button>
          ))}
        </div>

        {/* Custom Multi-Select Tag Filter */}
        <div className="vault-tag-filter-container" ref={tagDropdownRef} id="vault-tag-filter-container">
          <button
            id="vault-tag-filter-button"
            type="button"
            className={`vault-tag-filter-btn ${selectedTags.length > 0 ? 'active' : ''}`}
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            aria-expanded={isTagDropdownOpen}
            aria-haspopup="true"
            title={isArabic ? 'تصفية حسب وسوم الموضوع والصناعة' : 'Filter by theme or industry tags'}
          >
            <Glyph name="tag" />
            <span>{isArabic ? 'الوسوم' : 'Tags'}</span>
            {selectedTags.length > 0 && (
              <span className="tag-active-badge">{selectedTags.length}</span>
            )}
          </button>

          {isTagDropdownOpen && (
            <div className="vault-tag-dropdown" id="vault-tag-dropdown-menu">
              <div className="vault-tag-dropdown-header">
                <span>{isArabic ? 'تصفية حسب الوسم' : 'Filter by Tags'}</span>
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    id="vault-clear-tags-btn"
                  >
                    {isArabic ? 'مسح الكل' : 'Clear'}
                  </button>
                )}
              </div>

              <div className="vault-tag-list">
                {availableTags.length > 0 ? (
                  availableTags.map((tag) => {
                    const count = ideas.filter((i) => (i.tags || []).includes(tag)).length;
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <label
                        key={tag}
                        className={`vault-tag-item ${isSelected ? 'selected' : ''}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleTag(tag)}
                          />
                          <span>#{tag}</span>
                        </div>
                        <span className="vault-tag-count">{count}</span>
                      </label>
                    );
                  })
                ) : (
                  <span style={{ fontSize: '11px', color: 'var(--muted)', padding: '8px 0' }}>
                    {isArabic ? 'لا توجد وسوم مسجلة بعد' : 'No tags created yet'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sorting Dropdown Menu */}
        <div className="vault-sort-container" id="vault-sort-container">
          <label htmlFor="vault-sort-select" className="vault-sort-label">
            <Glyph name="signal" />
            <span>{isArabic ? 'ترتيب:' : 'Sort:'}</span>
          </label>
          <select
            id="vault-sort-select"
            className="vault-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as VaultSortOption)}
            aria-label={isArabic ? 'ترتيب الأفكار حسب' : 'Sort ideas by'}
          >
            <option value="newest">{isArabic ? 'الأحدث' : 'Newest'}</option>
            <option value="opportunity">{isArabic ? 'نتيجة الفرصة' : 'Opportunity Score'}</option>
            <option value="confidence">{isArabic ? 'مستوى الثقة' : 'Confidence Level'}</option>
          </select>
        </div>

        {/* New Analysis Action */}
        <button
          id="vault-new-analysis-btn"
          type="button"
          className="btn btn-primary"
          onClick={onStartNew}
        >
          <Glyph name="spark" />
          <span>{isArabic ? 'تحليل فكرة جديدة' : 'New analysis'}</span>
        </button>
      </section>

      {/* Results Subbar */}
      <div className="vault-subbar" id="vault-results-subbar">
        <span>
          {isArabic
            ? `عرض ${filteredCount} من أصل ${totalCount} فكرة مسجلة`
            : `Showing ${filteredCount} of ${totalCount} ideas`}
          {selectedStage !== 'All' && (
            <span style={{ marginInlineStart: '8px', color: 'var(--cyan)' }}>
              • {isArabic ? `مرحلة: ${stageLabels[selectedStage]}` : `Stage: ${stageLabels[selectedStage]}`}
            </span>
          )}
          {selectedTags.length > 0 && (
            <span style={{ marginInlineStart: '8px', color: 'var(--cyan)' }}>
              • {isArabic ? `الوسوم: ${selectedTags.map((t) => `#${t}`).join(', ')}` : `Tags: ${selectedTags.map((t) => `#${t}`).join(', ')}`}
            </span>
          )}
          <span style={{ marginInlineStart: '8px', color: 'var(--muted-2)' }}>
            • {isArabic ? 'مرتب حسب: ' : 'Sorted by: '}
            <strong style={{ color: 'var(--muted)' }}>
              {sortOrder === 'newest' && (isArabic ? 'الأحدث' : 'Newest')}
              {sortOrder === 'opportunity' && (isArabic ? 'نتيجة الفرصة' : 'Opportunity Score')}
              {sortOrder === 'confidence' && (isArabic ? 'مستوى الثقة' : 'Confidence Level')}
            </strong>
          </span>
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {sortedIdeas.length > 0 && (
            <button
              id="vault-select-all-btn"
              type="button"
              className="clear-button"
              onClick={handleToggleSelectAll}
              style={{ fontSize: '11px', color: 'var(--muted)' }}
            >
              {selectedIdeaIds.size === sortedIdeas.length
                ? isArabic
                  ? 'إلغاء تحديد الكل'
                  : 'Deselect all'
                : isArabic
                ? 'تحديد الكل'
                : 'Select all'}
            </button>
          )}

          {isFiltering && (
            <button
              id="vault-reset-filters-btn"
              type="button"
              onClick={handleResetFilters}
            >
              {isArabic ? 'إعادة ضبط الفلاتر والبحث' : 'Reset search & filters'}
            </button>
          )}
        </div>
      </div>

      {/* Idea Collection Grid with Framer Motion Layout Animations */}
      {sortedIdeas.length > 0 ? (
        <motion.section
          layout
          className="idea-collection-grid"
          id="vault-ideas-grid"
        >
          <AnimatePresence mode="popLayout">
            {sortedIdeas.map((item) => (
              <IdeaCard
                key={item.id}
                idea={item}
                isArabic={isArabic}
                isSelected={selectedIdeaIds.has(item.id)}
                stageLabels={stageLabels}
                onToggleSelect={handleToggleSelectIdea}
                onOpenReport={onOpenReport}
                onUpdateIdea={onUpdateIdea}
                onArchiveIdea={onArchiveIdea}
                onUpdateIdeaTags={onUpdateIdeaTags}
              />
            ))}
          </AnimatePresence>
        </motion.section>
      ) : ideas.length === 0 ? (
        /* Enhanced empty state when user has no saved items in Vault */
        <div className="panel empty-state" id="vault-empty-state">
          <div className="empty-orbit">
            <Glyph name="vault" />
          </div>
          <h2>{isArabic ? 'خزنة الأفكار فارغة' : 'Your Idea Vault is Empty'}</h2>
          <p style={{ maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            {isArabic
              ? 'لم تقم بحفظ أي أفكار حتى الآن. ابدأ بتحليل أول فكرة لديك لاختبار فرضياتها، وحساب نقاط الفرصة، وتحديد الخطوات التالية المدعومة بالأدلة.'
              : 'You have no saved items in your vault yet. Start by analyzing your first opportunity to evaluate assumptions, calculate scores, and generate structured evidence.'}
          </p>
          <button
            id="vault-quick-start-btn"
            type="button"
            className="vault-quick-start-btn"
            onClick={onStartNew}
            title={isArabic ? 'البدء السريع: تحليل فكرة جديدة' : 'Quick Start: Create and analyze a new idea'}
          >
            <Glyph name="spark" />
            <span>{isArabic ? 'البدء السريع' : 'Quick Start'}</span>
          </button>
        </div>
      ) : (
        /* Empty state when filter selection yields 0 results */
        <div className="panel empty-state" id="vault-no-results-state">
          <div className="empty-orbit">
            <Glyph name="search" />
          </div>
          <h3>{isArabic ? 'لم يتم العثور على أفكار مطابقة' : 'No matching ideas found'}</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            {searchTerm
              ? isArabic
                ? `لا توجد أفكار تطابق عبارة البحث "${searchTerm}" في المرحلة المحددة (${stageLabels[selectedStage]}).`
                : `No ideas match "${searchTerm}" in stage "${stageLabels[selectedStage]}".`
              : isArabic
              ? `لا توجد أفكار مسجلة في مرحلة "${stageLabels[selectedStage]}" حالياً.`
              : `No ideas recorded in stage "${stageLabels[selectedStage]}" yet.`}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              id="vault-reset-empty-filters-btn"
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              {isArabic ? 'إعادة ضبط الفلاتر' : 'Reset search & filters'}
            </button>
            <button
              id="vault-quick-start-secondary-btn"
              type="button"
              className="vault-quick-start-btn"
              onClick={onStartNew}
            >
              <Glyph name="spark" />
              <span>{isArabic ? 'البدء السريع' : 'Quick Start'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Toolbar */}
      {selectedIdeaIds.size > 0 && (
        <div className="vault-bulk-floating-bar" id="vault-bulk-floating-bar">
          <span className="bulk-count-pill">
            <span className="bulk-count-num">{selectedIdeaIds.size}</span>
            <span>{isArabic ? 'محددة' : 'selected'}</span>
          </span>

          <button
            id="bulk-archive-btn"
            type="button"
            className="bulk-btn-action bulk-btn-archive"
            onClick={handleBulkArchive}
            title={isArabic ? 'أرشفة الأفكار المحددة' : 'Archive selected ideas'}
          >
            <Glyph name="trash" />
            <span>{isArabic ? 'أرشفة المحدد' : 'Archive Selected'}</span>
          </button>

          <button
            id="bulk-export-btn"
            type="button"
            className="bulk-btn-action bulk-btn-export"
            onClick={handleBulkExport}
            title={isArabic ? 'تصدير الأفكار المحددة بصيغة JSON' : 'Export selected ideas as JSON'}
          >
            <Glyph name="download" />
            <span>{isArabic ? 'تصدير المحدد' : 'Export Selected'}</span>
          </button>

          <button
            id="bulk-dismiss-btn"
            type="button"
            className="bulk-btn-action bulk-btn-dismiss"
            onClick={() => setSelectedIdeaIds(new Set())}
            title={isArabic ? 'إلغاء التحديد' : 'Clear selection'}
          >
            {isArabic ? 'إلغاء' : 'Deselect'}
          </button>
        </div>
      )}
    </div>
  );
};

// Aliased export to support either Vault or VaultView naming
export const Vault = VaultView;
export default VaultView;
