import React, { useState } from 'react';
import { Idea, Profile, WorkspaceView } from '../../types';
import { Glyph } from '../Glyph';
import { AnimatedCounter } from '../AnimatedCounter';
import { OpportunityScoreRing } from '../OpportunityScoreRing';
import { OpportunityTrendIndicator } from '../OpportunityTrendIndicator';
import { calculatePortfolioMoMTrend } from '../../utils/trendAnalytics';
import { getCategoryById, getSubcategoryById } from '../../data/categories';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, Sparkles, Layers } from 'lucide-react';

interface DashboardViewProps {
  isArabic: boolean;
  profile: Profile;
  ideas: Idea[];
  onNavigate: (view: WorkspaceView) => void;
  onStartNew: () => void;
  onSelectIdea: (idea: Idea, targetView?: WorkspaceView) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  isArabic,
  profile,
  ideas,
  onNavigate,
  onStartNew,
  onSelectIdea,
}) => {
  const stageLabels: Record<string, string> = {
    Concept: isArabic ? 'فكرة أولية' : 'Concept',
    Research: isArabic ? 'بحث' : 'Research',
    Validation: isArabic ? 'تحقق' : 'Validation',
    Growth: isArabic ? 'نمو' : 'Growth'
  };

  const getMonogram = (title: string) => {
    return title
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || 'IS';
  };

  // Check if real user ideas exist vs sample demo records
  const realUserIdeas = ideas.filter((i) => !i.isSample);
  const [includeSamples, setIncludeSamples] = useState(() => realUserIdeas.length === 0);
  
  // Display ideas for metrics and visual trend tracking
  const displayIdeas = includeSamples
    ? ideas
    : (realUserIdeas.length > 0 ? realUserIdeas : ideas);
  const isViewingSamplePortfolio = includeSamples && realUserIdeas.length === 0;

  if (displayIdeas.length === 0) {
    return (
      <div className="view-stack dashboard-view">
        <section className="welcome-panel">
          <div>
            <span className="eyebrow">
              {isArabic ? 'مساحة الفرص' : 'OPPORTUNITY WORKSPACE'}
            </span>
            <h1>{isArabic ? `مرحباً ${profile.name}` : `Welcome, ${profile.name}`}</h1>
            <p>
              {isArabic
                ? 'ابدأ ببياناتك الحقيقية؛ لا توجد مقاييس تجريبية في حسابك الشخصي.'
                : 'Start with your real hypothesis; your portfolio metrics exclude demo records.'}
            </p>
          </div>
        </section>

        <div className="panel empty-workspace">
          <span className="empty-orbit">
            <Glyph name="spark" />
          </span>
          <span className="eyebrow">
            {isArabic ? 'مساحة عمل نظيفة' : 'A CLEAN WORKSPACE'}
          </span>
          <h2>{isArabic ? 'حلّل فكرتك الأولى.' : 'Analyze your first idea.'}</h2>
          <p>
            {isArabic
              ? 'المحفظة خالية من البيانات المدخلة بواسطتك. يمكنك فحص نماذج التقييم التجريبية في الخزنة أو البدء بتحليل فكرتك الأولى.'
              : 'No user-authored ideas logged yet. You can inspect sample evaluations in the Vault or start by analyzing your first idea.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary" onClick={onStartNew}>
              <Glyph name="spark" />
              <span>{isArabic ? 'ابدأ الآن' : 'Start now'}</span>
            </button>
            {ideas.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIncludeSamples(true)}
              >
                <Glyph name="vault" />
                <span>{isArabic ? 'عرض نماذج التطور التجريبية' : 'Preview Sample Evolutions'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const avgOpportunity = Math.round(
    displayIdeas.reduce((acc, curr) => acc + curr.opportunityScore, 0) / displayIdeas.length
  );
  const totalSnapshots = displayIdeas.reduce((acc, curr) => acc + (curr.evolution?.length || 0), 0);
  const avgConfidence = Math.round(
    displayIdeas.reduce((acc, curr) => acc + curr.confidence, 0) / displayIdeas.length
  );

  // Month-over-month trend analytics across all saved ideas
  const portfolioMoM = calculatePortfolioMoMTrend(displayIdeas);

  const topIdea = [...displayIdeas].sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
  const evolutionList = topIdea?.evolution || [];
  const lastSnap = evolutionList.at(-1);
  const prevSnap = evolutionList.at(-2);
  const scoreDelta = lastSnap && prevSnap ? lastSnap.opportunityScore - prevSnap.opportunityScore : 0;

  return (
    <div className="view-stack dashboard-view">
      {/* Sample Portfolio Notification Pill when viewing demo samples */}
      {isViewingSamplePortfolio && (
        <section
          className="demo-portfolio-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '10px 16px',
            background: 'rgba(67, 230, 210, 0.08)',
            border: '1px solid rgba(67, 230, 210, 0.25)',
            borderRadius: '12px',
            fontSize: '12px',
            color: 'var(--ink)',
            marginBottom: '4px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers className="w-4 h-4 text-[var(--cyan)]" />
            <span>
              {isArabic
                ? 'يتم عرض مؤشر نمو معدل الفرص الشهري (MoM) بناءً على لقطات التطور للأفكار المحفوظة في الخزنة. أضف فكرتك الأولى لتتبع بياناتك الحقيقية.'
                : 'Displaying Month-over-Month (MoM) Opportunity Score Growth using evolution snapshot data from saved ideas. Create your first idea to track custom data.'}
            </span>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}
            onClick={onStartNew}
          >
            {isArabic ? 'حلّل فكرة جديدة' : 'Analyze New Idea'}
          </button>
        </section>
      )}

      {/* Welcome Banner */}
      <section className="welcome-panel">
        <div>
          <span className="eyebrow">
            {isArabic ? 'إشاراتك المحفوظة' : 'YOUR SAVED SIGNALS'}
          </span>
          <h1>
            {isArabic ? `مرحباً ${profile.name}` : `Welcome back, ${profile.name}`}
          </h1>
          <p>
            {isArabic
              ? 'المقاييس أدناه محسوبة من أفكارك وتحليلاتك المحفوظة وسجلات تطورها الشهرية.'
              : 'Every metric below is calculated from your saved ideas, analyses, and tracked monthly evolution.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {realUserIdeas.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '8px 12px' }}
              onClick={() => setIncludeSamples(!includeSamples)}
              title="Toggle demo sample data in portfolio"
            >
              <span>{includeSamples ? (isArabic ? 'استبعاد النماذج' : 'Exclude Samples') : (isArabic ? 'شمل النماذج' : 'Include Samples')}</span>
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onStartNew}>
            <Glyph name="spark" />
            <span>{isArabic ? 'حلّل فكرة جديدة' : 'Analyze a new idea'}</span>
          </button>
        </div>
      </section>

      {/* 5 Metric Cards (Including MoM Growth) */}
      <section className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <article className="metric-card tone-cyan">
          <div className="metric-icon">
            <Glyph name="vault" />
          </div>
          <div>
            <span>{isArabic ? 'الأفكار النشطة' : 'ACTIVE IDEAS'}</span>
            <strong><AnimatedCounter value={displayIdeas.length} /></strong>
            <small>{isArabic ? 'محفظة الأفكار' : 'Portfolio ideas'}</small>
          </div>
        </article>

        <article className="metric-card tone-blue">
          <div className="metric-icon">
            <Glyph name="signal" />
          </div>
          <div>
            <span>{isArabic ? 'متوسط الفرصة' : 'AVG. OPPORTUNITY'}</span>
            <strong><AnimatedCounter value={avgOpportunity} /></strong>
            <small>{isArabic ? 'مساعد قرار' : 'Decision aid'}</small>
          </div>
        </article>

        {/* Month-over-Month Growth KPI Card */}
        <article className="metric-card tone-emerald" style={{ borderColor: 'rgba(67, 230, 210, 0.3)' }}>
          <div className="metric-icon">
            {portfolioMoM.direction === 'positive' ? (
              <TrendingUp className="w-4 h-4 text-[var(--cyan)]" />
            ) : portfolioMoM.direction === 'negative' ? (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            ) : (
              <Minus className="w-4 h-4 text-[var(--muted)]" />
            )}
          </div>
          <div>
            <span>{isArabic ? 'النمو الشهري (MoM)' : 'MoM GROWTH'}</span>
            <strong style={{
              color: portfolioMoM.direction === 'positive' ? '#34d399' : portfolioMoM.direction === 'negative' ? '#fb7185' : 'var(--cyan)'
            }}>
              {portfolioMoM.latestMomGrowthPct > 0 ? `+${portfolioMoM.latestMomGrowthPct}%` : `${portfolioMoM.latestMomGrowthPct}%`}
            </strong>
            <small>
              {portfolioMoM.latestMomDelta > 0 ? `+${portfolioMoM.latestMomDelta}` : portfolioMoM.latestMomDelta}{' '}
              {isArabic ? 'نقطة مقارنة بالشهر السابق' : 'pts vs prior mo'}
            </small>
          </div>
        </article>

        <article className="metric-card tone-violet">
          <div className="metric-icon">
            <Glyph name="spark" />
          </div>
          <div>
            <span>{isArabic ? 'التحليلات المكتملة' : 'ANALYSES COMPLETED'}</span>
            <strong><AnimatedCounter value={totalSnapshots} /></strong>
            <small>{isArabic ? 'تشمل لقطات التطور' : 'Includes evolution snaps'}</small>
          </div>
        </article>

        <article className="metric-card tone-mint">
          <div className="metric-icon">
            <Glyph name="check" />
          </div>
          <div>
            <span>{isArabic ? 'متوسط الثقة' : 'AVG. CONFIDENCE'}</span>
            <strong><AnimatedCounter value={avgConfidence} suffix="%" /></strong>
            <small>{isArabic ? 'ترتفع مع الأدلة' : 'Evidence-sensitive'}</small>
          </div>
        </article>
      </section>

      {/* Visual Trend Indicator: Month-over-Month Growth Across All Saved Ideas */}
      <OpportunityTrendIndicator
        ideas={displayIdeas}
        isArabic={isArabic}
        onSelectIdea={onSelectIdea}
      />

      {/* Main Grid: Top Opportunity & Idea DNA */}
      <section className="dashboard-main-grid">
        {/* Top Opportunity */}
        <article className="panel opportunity-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker">
                {isArabic ? 'أعلى فرصة حالية' : 'TOP CURRENT OPPORTUNITY'}
              </span>
              <h2>{isArabic ? topIdea.title.ar : topIdea.title.en}</h2>
              {(topIdea.category || topIdea.categoryInfo) && (
                <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                  <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                    {topIdea.categoryInfo?.primaryName
                      ? (isArabic ? topIdea.categoryInfo.primaryName.ar : topIdea.categoryInfo.primaryName.en)
                      : (getCategoryById(topIdea.category)?.[isArabic ? 'name' : 'name']?.[isArabic ? 'ar' : 'en'] || topIdea.category)}
                  </span>
                  {(topIdea.subcategory || topIdea.categoryInfo?.subcategoryId) && (
                    <>
                      <span style={{ color: 'var(--muted-2)' }}>›</span>
                      <span style={{ color: 'var(--muted)' }}>
                        {topIdea.categoryInfo?.subcategoryName
                          ? (isArabic ? topIdea.categoryInfo.subcategoryName.ar : topIdea.categoryInfo.subcategoryName.en)
                          : (getSubcategoryById(topIdea.category, topIdea.subcategory)?.[isArabic ? 'name' : 'name']?.[isArabic ? 'ar' : 'en'] || topIdea.subcategory)}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => onSelectIdea(topIdea, 'report')}
              aria-label="View report"
            >
              <Glyph name="arrow" />
            </button>
          </div>

          <div className="opportunity-body">
            <OpportunityScoreRing
              score={topIdea.opportunityScore}
              size="large"
              isArabic={isArabic}
              label={isArabic ? 'الفرصة' : 'Opportunity'}
              id="dashboard-top-opportunity-ring"
            />

            <div className="score-context">
              <span className="status-badge status-strong">
                <i />
                {isArabic
                  ? `ثقة `
                  : ``}
                <AnimatedCounter value={topIdea.confidence} suffix="%" />
                {isArabic ? '' : ' confidence'}
              </span>
              <p>
                {isArabic
                  ? topIdea.latestAnalysis.summary.ar
                  : topIdea.latestAnalysis.summary.en}
              </p>
              <div className="signal-chips">
                {(topIdea.latestAnalysis?.strongestSignals || []).slice(0, 3).map((s) => (
                  <span key={s.label.en}>
                    {isArabic ? s.label.ar : s.label.en}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="next-action-bar">
            <span className="action-number">01</span>
            <div>
              <small>{isArabic ? 'أفضل خطوة تالية' : 'NEXT BEST ACTION'}</small>
              <strong>
                {isArabic
                  ? topIdea.latestAnalysis.nextBestAction.title.ar
                  : topIdea.latestAnalysis.nextBestAction.title.en}
              </strong>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onSelectIdea(topIdea, 'report')}
            >
              {isArabic ? 'عرض التقرير' : 'View report'}
            </button>
          </div>
        </article>

        {/* 10 Connected Dimensions (Idea DNA) */}
        <article className="panel dna-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker">
                {isArabic ? 'بصمة الفكرة' : 'IDEA DNA'}
              </span>
              <h2>{isArabic ? 'عشرة أبعاد مترابطة' : 'Ten connected dimensions'}</h2>
            </div>
            <span className="info-mark">i</span>
          </div>

          <div className="dimension-list compact-dimensions">
            {(topIdea.latestAnalysis?.dimensions || []).map((d) => (
              <div key={d.key} className="dimension-row">
                <div>
                  <span>{isArabic ? d.label.ar : d.label.en}</span>
                  <strong>{d.score}</strong>
                </div>
                <div className="mini-track">
                  <i style={{ width: `${d.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Lower Grid: Evolution & Biggest Uncertainty */}
      <section className="dashboard-lower-grid">
        <article className="panel evolution-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker">
                {isArabic ? 'تطور الفكرة' : 'IDEA EVOLUTION'}
              </span>
              <h2>
                {isArabic
                  ? 'النتيجة قد ترتفع أو تنخفض'
                  : 'The score can rise or fall'}
              </h2>
            </div>
            <span className={`signal-badge ${scoreDelta < 0 ? 'negative' : ''}`}>
              {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
            </span>
          </div>

          <div className="evolution-chart">
            <div className="bar-area">
              {evolutionList.map((snap, idx) => (
                <div key={snap.id} className="bar-column">
                  <i
                    style={{ height: `${snap.opportunityScore}%` }}
                    className={idx === evolutionList.length - 1 ? 'active' : ''}
                  />
                  <span>{snap.opportunityScore}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel recommendation-panel">
          <div className="recommendation-icon">
            <Glyph name="spark" />
          </div>
          <span className="panel-kicker">
            {isArabic ? 'أكبر نقطة عدم يقين' : 'BIGGEST UNCERTAINTY'}
          </span>
          <h2>
            {isArabic
              ? topIdea.latestAnalysis.weakestSignals[0]?.label.ar
              : topIdea.latestAnalysis.weakestSignals[0]?.label.en}
          </h2>
          <p>
            {isArabic
              ? topIdea.latestAnalysis.weakestSignals[0]?.detail.ar
              : topIdea.latestAnalysis.weakestSignals[0]?.detail.en}
          </p>
          <button
            type="button"
            className="inline-link"
            onClick={() => onSelectIdea(topIdea, 'ask')}
          >
            <span>
              {isArabic ? 'اسأل IdeaScout عن التقرير' : 'Ask IdeaScout about this report'}
            </span>
            <Glyph name="arrow" />
          </button>
        </article>
      </section>

      {/* Recent Ideas */}
      <section className="panel recent-ideas">
        <div className="panel-topline">
          <div>
            <span className="panel-kicker">
              {isArabic ? 'الأفكار الحديثة' : 'RECENT IDEAS'}
            </span>
            <h2>{isArabic ? 'تابع من حيث توقفت' : 'Continue where you left off'}</h2>
          </div>
          <button
            type="button"
            className="inline-link"
            onClick={() => onNavigate('vault')}
          >
            <span>{isArabic ? 'عرض الكل' : 'View all'}</span>
            <Glyph name="arrow" />
          </button>
        </div>

        <div className="recent-idea-list">
          {ideas.slice(0, 4).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIdea(item, 'vault')}
            >
              <span className="idea-monogram">
                {getMonogram(isArabic ? item.title.ar : item.title.en)}
              </span>
              <span>
                <strong>{isArabic ? item.title.ar : item.title.en}</strong>
                <small>{stageLabels[item.stage] ?? item.stage}</small>
              </span>
              <span className="recent-score">
                {item.opportunityScore}
                <small>{item.confidence}%</small>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
