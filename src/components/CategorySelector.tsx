import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  DollarSign,
  ShoppingBag,
  Heart,
  Sparkles,
  GraduationCap,
  Leaf,
  Users,
  Check,
  ChevronRight,
  FolderTree,
  X,
  Search,
  Wand2
} from 'lucide-react';
import {
  IDEA_CATEGORIES,
  CategoryNode,
  SubcategoryNode,
  suggestCategoryFromContent,
  getCategoryById,
  getSubcategoryById
} from '../data/categories';
import { CategoryHierarchyInfo } from '../types';

export interface CategorySelectorProps {
  isArabic: boolean;
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  onChange: (selection: {
    category?: string;
    subcategory?: string;
    categoryPath?: string[];
    categoryInfo?: CategoryHierarchyInfo;
  }) => void;
  ideaDescription?: string;
  ideaTitle?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  briefcase: <Briefcase className="w-4 h-4" />,
  'dollar-sign': <DollarSign className="w-4 h-4" />,
  'shopping-bag': <ShoppingBag className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  sparkles: <Sparkles className="w-4 h-4" />,
  'graduation-cap': <GraduationCap className="w-4 h-4" />,
  leaf: <Leaf className="w-4 h-4" />,
  users: <Users className="w-4 h-4" />
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  isArabic,
  selectedCategoryId,
  selectedSubcategoryId,
  onChange,
  ideaDescription = '',
  ideaTitle = ''
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute smart AI recommendation based on text
  const smartSuggestion = useMemo(() => {
    if (!ideaDescription || ideaDescription.trim().length < 10) return null;
    return suggestCategoryFromContent(ideaDescription, ideaTitle);
  }, [ideaDescription, ideaTitle]);

  const activeCategory = useMemo(() => {
    return getCategoryById(selectedCategoryId);
  }, [selectedCategoryId]);

  const activeSubcategory = useMemo(() => {
    return getSubcategoryById(selectedCategoryId, selectedSubcategoryId);
  }, [selectedCategoryId, selectedSubcategoryId]);

  const suggestedCategory = useMemo(() => {
    if (!smartSuggestion?.primaryId) return null;
    return getCategoryById(smartSuggestion.primaryId);
  }, [smartSuggestion]);

  const suggestedSubcategory = useMemo(() => {
    if (!smartSuggestion?.primaryId || !smartSuggestion.subcategoryId) return null;
    return getSubcategoryById(smartSuggestion.primaryId, smartSuggestion.subcategoryId);
  }, [smartSuggestion]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!filterQuery.trim()) return IDEA_CATEGORIES;
    const q = filterQuery.toLowerCase();
    return IDEA_CATEGORIES.filter((cat) => {
      const matchCat =
        cat.name.en.toLowerCase().includes(q) ||
        cat.name.ar.toLowerCase().includes(q) ||
        cat.description.en.toLowerCase().includes(q) ||
        cat.description.ar.toLowerCase().includes(q);
      const matchSub = cat.subcategories.some(
        (s) =>
          s.name.en.toLowerCase().includes(q) ||
          s.name.ar.toLowerCase().includes(q) ||
          s.description.en.toLowerCase().includes(q) ||
          s.description.ar.toLowerCase().includes(q)
      );
      return matchCat || matchSub;
    });
  }, [filterQuery]);

  const handleSelectPrimary = (cat: CategoryNode) => {
    if (selectedCategoryId === cat.id) {
      // Toggle or retain
      return;
    }
    // Default to first subcategory or leave open for user selection
    const defaultSub = cat.subcategories[0]?.id;
    const defaultSubNode = cat.subcategories[0];
    onChange({
      category: cat.id,
      subcategory: defaultSub,
      categoryPath: defaultSub ? [cat.id, defaultSub] : [cat.id],
      categoryInfo: {
        primaryId: cat.id,
        primaryName: cat.name,
        subcategoryId: defaultSub,
        subcategoryName: defaultSubNode?.name
      }
    });
  };

  const handleSelectSubcategory = (sub: SubcategoryNode) => {
    if (!activeCategory) return;
    onChange({
      category: activeCategory.id,
      subcategory: sub.id,
      categoryPath: [activeCategory.id, sub.id],
      categoryInfo: {
        primaryId: activeCategory.id,
        primaryName: activeCategory.name,
        subcategoryId: sub.id,
        subcategoryName: sub.name
      }
    });
  };

  const handleApplySuggestion = () => {
    if (!suggestedCategory) return;
    onChange({
      category: suggestedCategory.id,
      subcategory: suggestedSubcategory?.id,
      categoryPath: suggestedSubcategory?.id
        ? [suggestedCategory.id, suggestedSubcategory.id]
        : [suggestedCategory.id],
      categoryInfo: {
        primaryId: suggestedCategory.id,
        primaryName: suggestedCategory.name,
        subcategoryId: suggestedSubcategory?.id,
        subcategoryName: suggestedSubcategory?.name
      }
    });
  };

  const handleClear = () => {
    onChange({
      category: undefined,
      subcategory: undefined,
      categoryPath: [],
      categoryInfo: undefined
    });
  };

  const isSuggestedCurrentlySelected =
    smartSuggestion &&
    selectedCategoryId === smartSuggestion.primaryId &&
    selectedSubcategoryId === smartSuggestion.subcategoryId;

  return (
    <div
      className="category-selector-wrapper"
      id="analyze-category-selector"
      style={{
        margin: '18px 0',
        padding: '16px',
        background: 'rgba(5, 17, 31, 0.75)',
        border: '1px solid var(--line-strong)',
        borderRadius: '16px'
      }}
    >
      {/* Header & Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(67, 230, 210, 0.15)',
              color: 'var(--cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FolderTree className="w-4 h-4" />
          </div>
          <div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: 'var(--cyan)',
                display: 'block',
                textTransform: 'uppercase'
              }}
            >
              {isArabic ? 'التصنيف الهرمي' : 'HIERARCHICAL CATEGORY'}
            </span>
            <strong
              style={{
                fontSize: '14px',
                color: 'var(--ink)',
                display: 'block'
              }}
            >
              {isArabic ? 'حدد قطاع وفئة الفكرة التخصصية' : 'Categorize Industry & Specialized Domain'}
            </strong>
          </div>
        </div>

        {/* Selected Breadcrumb Badge & Clear Button */}
        {activeCategory && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(67, 230, 210, 0.08)',
              border: '1px solid rgba(67, 230, 210, 0.3)',
              borderRadius: '999px',
              padding: '4px 12px'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700 }}>
              {isArabic ? activeCategory.name.ar : activeCategory.name.en}
            </span>
            {activeSubcategory && (
              <>
                <ChevronRight className="w-3 h-3 text-[var(--muted)]" />
                <span style={{ fontSize: '11px', color: '#fff', fontWeight: 600 }}>
                  {isArabic ? activeSubcategory.name.ar : activeSubcategory.name.en}
                </span>
              </>
            )}
            <button
              type="button"
              onClick={handleClear}
              title={isArabic ? 'إلغاء التصنيف' : 'Clear category'}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                marginInlineStart: '4px'
              }}
            >
              <X className="w-3.5 h-3.5 hover:text-red-400 transition-colors" />
            </button>
          </div>
        )}
      </div>

      {/* Smart Contextual Suggestion Banner */}
      {smartSuggestion && suggestedCategory && !isSuggestedCurrentlySelected && (
        <div
          style={{
            margin: '0 0 14px',
            padding: '10px 14px',
            background: 'linear-gradient(135deg, rgba(67, 230, 210, 0.1), rgba(56, 189, 248, 0.08))',
            border: '1px solid rgba(67, 230, 210, 0.35)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wand2 className="w-4 h-4 text-[var(--cyan)] animate-pulse" />
            <span style={{ fontSize: '12px', color: 'var(--ink)' }}>
              {isArabic ? (
                <>
                  اقتراح الذكاء الاصطناعي لفكرتك:{' '}
                  <strong style={{ color: 'var(--cyan)' }}>{suggestedCategory.name.ar}</strong>
                  {suggestedSubcategory && (
                    <>
                      {' '}›{' '}
                      <span style={{ color: '#fff' }}>{suggestedSubcategory.name.ar}</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  Suggested for your idea:{' '}
                  <strong style={{ color: 'var(--cyan)' }}>{suggestedCategory.name.en}</strong>
                  {suggestedSubcategory && (
                    <>
                      {' '}›{' '}
                      <span style={{ color: '#fff' }}>{suggestedSubcategory.name.en}</span>
                    </>
                  )}
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={handleApplySuggestion}
            className="btn btn-secondary"
            style={{
              padding: '4px 12px',
              fontSize: '11px',
              borderColor: 'rgba(67, 230, 210, 0.4)',
              color: 'var(--cyan)',
              background: 'rgba(67, 230, 210, 0.12)'
            }}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isArabic ? 'تطبيق الاقتراح' : 'Apply Suggestion'}</span>
          </button>
        </div>
      )}

      {/* Filter / Search Input */}
      <div
        style={{
          position: 'relative',
          marginBottom: '12px'
        }}
      >
        <Search
          className="w-3.5 h-3.5"
          style={{
            position: 'absolute',
            insetInlineStart: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--muted)',
            pointerEvents: 'none'
          }}
        />
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder={
            isArabic
              ? 'ابحث في القطاعات والفئات الفرعية (مثال: برمجيات، مدفوعات، جملة)...'
              : 'Filter sectors and subcategories (e.g. SaaS, Wholesale, Health)...'
          }
          style={{
            width: '100%',
            padding: '8px 12px',
            paddingInlineStart: '32px',
            background: 'rgba(3, 12, 24, 0.6)',
            border: '1px solid var(--line)',
            borderRadius: '10px',
            color: 'var(--ink)',
            fontSize: '12px',
            outline: 'none'
          }}
        />
        {filterQuery && (
          <button
            type="button"
            onClick={() => setFilterQuery('')}
            style={{
              position: 'absolute',
              insetInlineEnd: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--muted)',
              cursor: 'pointer'
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Primary Category Grid */}
      <div
        className="category-primary-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '8px',
          marginBottom: '14px'
        }}
      >
        {filteredCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const isSuggested = smartSuggestion?.primaryId === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectPrimary(cat)}
              className={`category-tile ${isSelected ? 'selected' : ''}`}
              style={{
                textAlign: isArabic ? 'right' : 'left',
                padding: '10px 12px',
                borderRadius: '12px',
                background: isSelected
                  ? 'rgba(67, 230, 210, 0.12)'
                  : 'rgba(8, 23, 40, 0.6)',
                border: isSelected
                  ? '1px solid var(--cyan)'
                  : isSuggested
                  ? '1px dashed rgba(67, 230, 210, 0.4)'
                  : '1px solid var(--line)',
                boxShadow: isSelected
                  ? '0 0 16px rgba(67, 230, 210, 0.15)'
                  : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: isSelected
                    ? 'var(--cyan)'
                    : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#040e1b' : cat.color || 'var(--cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                {CATEGORY_ICONS[cat.icon] || <Briefcase className="w-4 h-4" />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '4px'
                  }}
                >
                  <strong
                    style={{
                      fontSize: '12px',
                      color: isSelected ? '#fff' : 'var(--ink)',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {isArabic ? cat.name.ar : cat.name.en}
                  </strong>
                  {isSelected && (
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: 'var(--cyan)',
                        color: '#040e1b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                <small
                  style={{
                    color: 'var(--muted)',
                    fontSize: '10px',
                    display: 'block',
                    marginTop: '2px',
                    lineHeight: '1.3'
                  }}
                >
                  {cat.subcategories.length}{' '}
                  {isArabic ? 'فئات فرعية' : 'subcategories'}
                </small>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategory Secondary Cascading Level */}
      {activeCategory && (
        <div
          className="subcategory-cascading-panel"
          style={{
            background: 'rgba(3, 12, 24, 0.75)',
            border: '1px solid rgba(67, 230, 210, 0.25)',
            borderRadius: '12px',
            padding: '14px',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px'
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--cyan)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ChevronRight className="w-3.5 h-3.5" />
              {isArabic
                ? `اختر الفئة الفرعية المتخصصة لـ (${activeCategory.name.ar}):`
                : `Select Specialized Subcategory for (${activeCategory.name.en}):`}
            </span>
            <small style={{ color: 'var(--muted)', fontSize: '10px' }}>
              {isArabic ? 'تنظيم أدق للمنافسين والتحليل' : 'Sharpens evaluation & discovery'}
            </small>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '8px'
            }}
          >
            {activeCategory.subcategories.map((sub) => {
              const isSubSelected = selectedSubcategoryId === sub.id;
              const isSuggestedSub =
                smartSuggestion?.primaryId === activeCategory.id &&
                smartSuggestion?.subcategoryId === sub.id;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSubcategory(sub)}
                  style={{
                    textAlign: isArabic ? 'right' : 'left',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: isSubSelected
                      ? 'rgba(67, 230, 210, 0.18)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isSubSelected
                      ? '1px solid var(--cyan)'
                      : isSuggestedSub
                      ? '1px dashed rgba(67, 230, 210, 0.45)'
                      : '1px solid var(--line)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '4px'
                    }}
                  >
                    <strong
                      style={{
                        fontSize: '12px',
                        color: isSubSelected ? '#fff' : 'var(--ink)',
                        display: 'block'
                      }}
                    >
                      {isArabic ? sub.name.ar : sub.name.en}
                    </strong>
                    {isSubSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--cyan)] flex-shrink-0" />
                    )}
                  </div>
                  <p
                    style={{
                      margin: '4px 0 0',
                      fontSize: '10px',
                      color: 'var(--muted)',
                      lineHeight: '1.3'
                    }}
                  >
                    {isArabic ? sub.description.ar : sub.description.en}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
