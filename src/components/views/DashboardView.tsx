import React from 'react';
import { Idea, Profile, WorkspaceView } from '../../types';
import { Glyph } from '../Glyph';

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

  // Exclude demo sample records from real-user portfolio metrics
  const realUserIdeas = ideas.filter((i) => !i.isSample);
  const displayIdeas = realUserIdeas.length > 0 ? realUserIdeas : [];
  const hasOnlySamples = realUserIdeas.length === 0 && ideas.some((i) => i.isSample);

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
            {hasOnlySamples && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('vault')}
              >
                <Glyph name="vault" />
                <span>{isArabic ? 'استعراض النماذج التجريبية' : 'View Sample Demos'}</span>
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
  const totalSnapshots = displayIdeas.reduce((acc, curr) => acc + curr.evolution.length, 0);
  const avgConfidence = Math.round(
    displayIdeas.reduce((acc, curr) => acc + curr.confidence, 0) / displayIdeas.length
  );

  const topIdea = [...displayIdeas].sort((a, b) => b.opportunityScore - a.opportunityScore)[0];
  const lastSnap = topIdea.evolution.at(-1);
  const prevSnap = topIdea.evolution.at(-2);
  const scoreDelta = lastSnap && prevSnap ? lastSnap.opportunityScore - prevSnap.opportunityScore : 0;

  return (
    <div className="view-stack dashboard-view">
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
              ? 'المقاييس أدناه محسوبة من أفكارك وتحليلاتك المحفوظة فقط.'
              : 'Every metric below is calculated only from your saved ideas and analyses.'}
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onStartNew}>
          <Glyph name="spark" />
          <span>{isArabic ? 'حلّل فكرة جديدة' : 'Analyze a new idea'}</span>
        </button>
      </section>

      {/* 4 Metric Cards */}
      <section className="metrics-grid">
        <article className="metric-card tone-cyan">
          <div className="metric-icon">
            <Glyph name="vault" />
          </div>
          <div>
            <span>{isArabic ? 'الأفكار النشطة' : 'ACTIVE IDEAS'}</span>
            <strong>{displayIdeas.length}</strong>
            <small>{isArabic ? 'بياناتك فقط' : 'Your data only'}</small>
          </div>
        </article>

        <article className="metric-card tone-blue">
          <div className="metric-icon">
            <Glyph name="signal" />
          </div>
          <div>
            <span>{isArabic ? 'متوسط الفرصة' : 'AVG. OPPORTUNITY'}</span>
            <strong>{avgOpportunity}</strong>
            <small>{isArabic ? 'مساعد قرار' : 'Decision aid'}</small>
          </div>
        </article>

        <article className="metric-card tone-violet">
          <div className="metric-icon">
            <Glyph name="spark" />
          </div>
          <div>
            <span>{isArabic ? 'التحليلات المكتملة' : 'ANALYSES COMPLETED'}</span>
            <strong>{totalSnapshots}</strong>
            <small>{isArabic ? 'تشمل إعادة التحليل' : 'Includes re-analysis'}</small>
          </div>
        </article>

        <article className="metric-card tone-mint">
          <div className="metric-icon">
            <Glyph name="check" />
          </div>
          <div>
            <span>{isArabic ? 'متوسط الثقة' : 'AVG. CONFIDENCE'}</span>
            <strong>{avgConfidence}%</strong>
            <small>{isArabic ? 'ترتفع مع الأدلة' : 'Evidence-sensitive'}</small>
          </div>
        </article>
      </section>

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
            <div
              className="score-ring score-ring-large"
              style={{ ['--score' as any]: `${topIdea.opportunityScore * 3.6}deg` }}
            >
              <div className="score-ring-inner">
                <strong>{topIdea.opportunityScore}</strong>
                <span>{isArabic ? 'الفرصة' : 'Opportunity'}</span>
              </div>
            </div>

            <div className="score-context">
              <span className="status-badge status-strong">
                <i />
                {isArabic
                  ? `ثقة ${topIdea.confidence}%`
                  : `${topIdea.confidence}% confidence`}
              </span>
              <p>
                {isArabic
                  ? topIdea.latestAnalysis.summary.ar
                  : topIdea.latestAnalysis.summary.en}
              </p>
              <div className="signal-chips">
                {topIdea.latestAnalysis.strongestSignals.slice(0, 3).map((s) => (
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
            {topIdea.latestAnalysis.dimensions.map((d) => (
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
              {topIdea.evolution.map((snap, idx) => (
                <div key={snap.id} className="bar-column">
                  <i
                    style={{ height: `${snap.opportunityScore}%` }}
                    className={idx === topIdea.evolution.length - 1 ? 'active' : ''}
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
              onClick={() => onSelectIdea(item, 'report')}
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
