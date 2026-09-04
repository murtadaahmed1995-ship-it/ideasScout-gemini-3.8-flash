import React, { useState } from 'react';
import { Idea, ReportTab, Stage } from '../../types';
import { Glyph } from '../Glyph';
import { EvidenceProgressRing, evaluateStability } from '../EvidenceProgressRing';
import { MarkdownRenderer } from '../MarkdownRenderer';
import { AnimatedCounter } from '../AnimatedCounter';

interface ReportViewProps {
  isArabic: boolean;
  idea: Idea;
  onNavigate?: (view: any) => void;
  onUpdateIdea: (idea: Idea) => void;
  onAskIdeaScout?: (idea: Idea) => void;
  onAskAboutIdea?: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  isArabic,
  idea,
  onNavigate,
  onUpdateIdea,
  onAskIdeaScout,
  onAskAboutIdea,
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const report = idea.latestAnalysis;

  const handleExportPdf = () => {
    window.print();
  };

  const handleAsk = () => {
    if (onAskAboutIdea) {
      onAskAboutIdea();
    } else if (onAskIdeaScout) {
      onAskIdeaScout(idea);
    }
  };

  const stageLabels: Record<Stage, string> = {
    Concept: isArabic ? 'فكرة أولية' : 'Concept',
    Research: isArabic ? 'بحث' : 'Research',
    Validation: isArabic ? 'تحقق' : 'Validation',
    Growth: isArabic ? 'نمو' : 'Growth'
  };

  const tabs: { key: ReportTab; en: string; ar: string }[] = [
    { key: 'overview', en: 'Overview & Signals', ar: 'نظرة عامة والإشارات' },
    { key: 'evidence', en: 'Evidence & Assumptions', ar: 'الأدلة والافتراضات' },
    { key: 'risks', en: 'Risks & Priorities', ar: 'المخاطر والأولويات' },
    { key: 'evolution', en: 'Evolution History', ar: 'سجل التطور' }
  ];

  const evidenceSummary = report.evidenceSummary ?? {
    positiveCount: report.facts.length,
    negativeCount: 0,
    unknownCount: report.missingEvidence.length,
    assumptionCount: report.assumptions.length,
    contradictionCount: 0,
    coverage: report.confidence > 50 ? 66 : 0,
    primaryEvidenceFound: report.confidence > 50
  };

  const readinessScore = report.readinessScore ?? report.inputReadiness ?? 60;
  const confidenceScore = report.confidenceScore ?? report.confidence;

  const overallPositive =
    report.evidenceSummary?.positiveCount ??
    (report.evidence ? report.evidence.filter((e) => e.type === 'positive').length : report.facts.length);
  const overallNegative =
    report.evidenceSummary?.negativeCount ??
    (report.evidence ? report.evidence.filter((e) => e.type === 'negative').length : 0);
  const overallStability = evaluateStability(overallPositive, overallNegative);

  const provenanceLabels: Record<string, { en: string; ar: string }> = {
    user_statement: { en: 'User Input', ar: 'مدخل المستخدم' },
    clarification_answer: { en: 'Clarification Answer', ar: 'إجابة توضيحية' },
    engine_inference: { en: 'Engine Inference', ar: 'استنتاج المحرك' },
    missing_evidence: { en: 'Evidence Gap', ar: 'فجوة أدلة' },
    contradiction_detection: { en: 'Contradiction Audit', ar: 'رصد تعارض' },
    demo_sample: { en: 'Demo Sample Data', ar: 'بيانات تجريبية' },
    generated_example: { en: 'Generated Example', ar: 'مثال توضيحي' }
  };

  const typeLabels: Record<string, { en: string; ar: string; tone: string }> = {
    positive: { en: 'Positive Signal', ar: 'إشارة إيجابية', tone: 'tone-mint' },
    negative: { en: 'Negative Feedback', ar: 'ملاحظة سلبية', tone: 'tone-coral' },
    unknown: { en: 'Unknown Gap', ar: 'فجوة غير معلومة', tone: 'tone-blue' },
    assumption: { en: 'Assumption', ar: 'افتراض غير مثبت', tone: 'tone-amber' },
    contradiction: { en: 'Contradiction', ar: 'تعارض مباشر', tone: 'tone-crimson' }
  };

  return (
    <div className="view-stack report-view">
      {/* Report Top Hero */}
      <section className="panel report-hero-panel">
        <div className="report-hero-header">
          <div>
            <div className="report-badge-row">
              <span className="stage-pill">{stageLabels[idea.stage]}</span>
              {idea.isSample && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--muted)',
                    border: '1px solid rgba(255, 255, 255, 0.12)'
                  }}
                >
                  {isArabic ? 'نموذج تجريبي' : 'Sample Demo'}
                </span>
              )}
              <span className="analysis-timestamp">
                {isArabic ? 'تاريخ التقييم: ' : 'Evaluated on '}
                {new Date(report.generatedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
              <span className="evidence-coverage-badge">
                <Glyph name="signal" />
                {isArabic ? 'تغطية الأدلة: ' : 'Evidence Coverage: '}
                <AnimatedCounter value={evidenceSummary.coverage} suffix="%" />
              </span>
            </div>
            <h1>{isArabic ? idea.title.ar : idea.title.en}</h1>
            <MarkdownRenderer className="report-summary">
              {isArabic ? report.summary.ar : report.summary.en}
            </MarkdownRenderer>
          </div>

          <div className="report-actions">
            <button
              id="report-export-pdf-btn"
              type="button"
              className="btn btn-primary"
              onClick={handleExportPdf}
              title={isArabic ? 'تصدير التقرير إلى PDF' : 'Export report to PDF'}
            >
              <Glyph name="download" />
              <span>{isArabic ? 'تصدير إلى PDF' : 'Export to PDF'}</span>
            </button>
            <button
              id="report-ask-btn"
              type="button"
              className="btn btn-secondary"
              onClick={handleAsk}
            >
              <Glyph name="chat" />
              <span>
                {isArabic ? 'اسأل عن هذا التقرير' : 'Ask about this report'}
              </span>
            </button>
            <button
              id="report-reanalyze-btn"
              type="button"
              className="btn btn-secondary"
              onClick={() => onUpdateIdea(idea)}
            >
              <Glyph name="spark" />
              <span>
                {isArabic ? 'تحديث وإعادة التحليل' : 'Update & re-analyze'}
              </span>
            </button>
          </div>
        </div>

        {/* 3 Strictly Separated Metrics Cluster */}
        <div className="report-score-cluster-three">
          {/* 1. Opportunity Score */}
          <div className="score-box opportunity-box">
            <div className="score-box-header">
              <span className="panel-kicker">
                {isArabic ? 'جاذبية الفرصة' : 'OPPORTUNITY SCORE'}
              </span>
              <small>{isArabic ? '0-100 (10 أبعاد استراتيجية)' : '0-100 (10 Strategic Dimensions)'}</small>
            </div>
            <div className="score-box-body">
              <div
                key={report.opportunityScore}
                className="score-ring score-ring-large"
                style={{ ['--score' as any]: `${report.opportunityScore * 3.6}deg` }}
              >
                <div className="score-ring-inner">
                  <strong><AnimatedCounter value={report.opportunityScore} /></strong>
                  <span>{isArabic ? 'الفرصة' : 'Opportunity'}</span>
                </div>
              </div>
              <p className="score-box-desc">
                {isArabic
                  ? 'يقيس الجاذبية الهيكلية وحجم المشكلة والقيمة والقدرة التنافسية.'
                  : 'Measures structural attractiveness, pain urgency, value, and defensibility.'}
              </p>
            </div>
          </div>

          {/* 2. Evidence Confidence Score */}
          <div className="score-box confidence-box">
            <div className="score-box-header">
              <span className="panel-kicker">
                {isArabic ? 'ثقة الأدلة الواقعية' : 'EVIDENCE CONFIDENCE'}
              </span>
              <strong><AnimatedCounter value={confidenceScore} suffix="%" /></strong>
            </div>
            <div className="score-box-body">
              <div className="readiness-track">
                <i style={{ width: `${confidenceScore}%` }} />
              </div>
              <p className="score-box-desc">
                {isArabic
                  ? report.confidenceExplanation.ar
                  : report.confidenceExplanation.en}
              </p>
              <div className="metric-provenance-note">
                <Glyph name="check" />
                <span>
                  {isArabic
                    ? 'محسوبة فقط من الأدلة الواقعية؛ استيفاء الحقول لا يرفع الثقة دون إثبات.'
                    : 'Grounded only in verified proof; answering fields alone cannot inflate confidence.'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Validation Readiness Score */}
          <div className="score-box readiness-box">
            <div className="score-box-header">
              <span className="panel-kicker">
                {isArabic ? 'جاهزية التحقق' : 'VALIDATION READINESS'}
              </span>
              <strong><AnimatedCounter value={readinessScore} suffix="%" /></strong>
            </div>
            <div className="score-box-body">
              <div className="readiness-track">
                <i style={{ width: `${readinessScore}%` }} />
              </div>
              <p className="score-box-desc">
                {isArabic
                  ? report.readinessExplanation?.ar ??
                    'مدى دقة صياغة الفرضية والجمهور والحل لتنفيذ الاختبار القادم.'
                  : report.readinessExplanation?.en ??
                    'How prepared the concept is to run the next decisive validation experiment.'}
              </p>
              <div className="metric-provenance-note">
                <Glyph name="spark" />
                <span>
                  {isArabic
                    ? 'الجاهزية تعني الاستعداد للاختبار، وليست دليلاً على نجاح الفكرة.'
                    : 'Readiness indicates test-preparedness, not commercial validation.'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Principle Banner */}
      <div className="report-principle">
        <Glyph name="signal" />
        <span>
          {isArabic
            ? 'النتيجة هي مساعد قرار موضوعي — وليست ضماناً للنجاح التجاري. الأدلة الواقعية وحدها تفصل بين الفرضيات والواقع.'
            : 'Scores are an objective decision aid—not a guarantee of success. Only verified empirical evidence separates assumptions from market reality.'}
        </span>
      </div>

      {/* Tabs Navigation */}
      <div className="report-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`report-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {isArabic ? tab.ar : tab.en}
          </button>
        ))}
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="report-overview-grid">
          {/* Dimensions Panel */}
          <section className="panel report-dimensions">
            <div className="panel-topline">
              <div>
                <span className="panel-kicker">
                  {isArabic ? 'بصمة الفكرة' : 'IDEA DNA'}
                </span>
                <h2>
                  {isArabic ? 'عشرة أبعاد محسوبة' : 'Ten derived dimensions'}
                </h2>
              </div>
              <span className="readiness-pill">
                {isArabic ? 'الجاهزية ' : 'Readiness '}
                {readinessScore}%
              </span>
            </div>

            <div className="dimension-list">
              {report.dimensions.map((d) => (
                <div key={d.key} className="dimension-row">
                  <div>
                    <span>{isArabic ? d.label.ar : d.label.en}</span>
                    <strong>{d.score}</strong>
                  </div>
                  <div className="mini-track">
                    <i style={{ width: `${d.score}%` }} />
                  </div>
                  <small>{isArabic ? d.rationale.ar : d.rationale.en}</small>
                </div>
              ))}
            </div>
          </section>

          {/* Side Stack */}
          <div className="report-side-stack">
            {/* Strongest Signals */}
            <section className="panel report-signal-panel">
              <span className="panel-kicker">
                {isArabic ? 'أقوى الإشارات' : 'STRONGEST SIGNALS'}
              </span>
              {report.strongestSignals.map((sig) => (
                <div key={sig.label.en} className="signal-item">
                  <strong>{isArabic ? sig.label.ar : sig.label.en}</strong>
                  <MarkdownRenderer>{isArabic ? sig.detail.ar : sig.detail.en}</MarkdownRenderer>
                </div>
              ))}
            </section>

            {/* Weakest Signals */}
            <section className="panel report-signal-panel weak">
              <span className="panel-kicker">
                {isArabic ? 'أضعف الإشارات وأكبر الفجوات' : 'WEAKEST SIGNALS & GAPS'}
              </span>
              {report.weakestSignals.map((sig) => (
                <div key={sig.label.en} className="signal-item">
                  <strong>{isArabic ? sig.label.ar : sig.label.en}</strong>
                  <MarkdownRenderer>{isArabic ? sig.detail.ar : sig.detail.en}</MarkdownRenderer>
                </div>
              ))}
            </section>

            {/* Next Best Action */}
            <section className="panel next-best-panel">
              <div className="next-action-header">
                <span className="action-number">01</span>
                <div>
                  <span className="panel-kicker">
                    {isArabic ? 'الخطوة التالية الموصى بها' : 'NEXT BEST ACTION'}
                  </span>
                  <h3>
                    {isArabic
                      ? report.nextBestAction.title.ar
                      : report.nextBestAction.title.en}
                  </h3>
                </div>
              </div>

              <p className="next-action-why">
                {isArabic
                  ? report.nextBestAction.why.ar
                  : report.nextBestAction.why.en}
              </p>

              <div className="next-action-checklist">
                {report.nextBestAction.checklist.map((item, idx) => (
                  <label key={idx} className="checklist-item">
                    <input type="checkbox" readOnly />
                    <span>{isArabic ? item.ar : item.en}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section className="panel recommendations-panel">
              <span className="panel-kicker">
                {isArabic ? 'توصيات استراتيجية' : 'RECOMMENDATIONS'}
              </span>
              {report.recommendations.map((rec) => (
                <div key={rec.label.en} className="rec-item">
                  <strong>{isArabic ? rec.label.ar : rec.label.en}</strong>
                  <MarkdownRenderer>{isArabic ? rec.detail.ar : rec.detail.en}</MarkdownRenderer>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}

      {/* Tab Content 2: Evidence, Assumptions & Provenance */}
      {activeTab === 'evidence' && (
        <div className="evidence-view-container">
          {/* Evidence Summary KPI Bar */}
          <section className="panel evidence-summary-bar">
            <div className="summary-stat positive">
              <span className="stat-num">{evidenceSummary.positiveCount}</span>
              <span className="stat-label">
                {isArabic ? 'إشارات إيجابية مؤكدة' : 'Positive Signals'}
              </span>
            </div>
            <div className="summary-stat negative">
              <span className="stat-num">{evidenceSummary.negativeCount}</span>
              <span className="stat-label">
                {isArabic ? 'ملاحظات سلبية واختبارات' : 'Negative Feedback'}
              </span>
            </div>
            <div className="summary-stat unknown">
              <span className="stat-num">{evidenceSummary.unknownCount}</span>
              <span className="stat-label">
                {isArabic ? 'أدلة مفقودة / غير معلومة' : 'Unknown Gaps'}
              </span>
            </div>
            <div className="summary-stat assumption">
              <span className="stat-num">{evidenceSummary.assumptionCount}</span>
              <span className="stat-label">
                {isArabic ? 'افتراضات تنتظر الاختبار' : 'Assumptions'}
              </span>
            </div>
            <div className="summary-stat contradiction">
              <span className="stat-num">{evidenceSummary.contradictionCount}</span>
              <span className="stat-label">
                {isArabic ? 'تعارضات مرصودة' : 'Contradictions'}
              </span>
            </div>
            <div className="summary-stat coverage">
              <span className="stat-num">{evidenceSummary.coverage}%</span>
              <span className="stat-label">
                {isArabic ? 'تغطية الأدلة التجريبية' : 'Evidence Coverage'}
              </span>
            </div>
          </section>

          {/* Contradiction Alert Card (if any) */}
          {evidenceSummary.contradictionCount > 0 && (
            <section className="panel contradiction-alert-card">
              <div className="contradiction-icon">
                <Glyph name="spark" />
              </div>
              <div>
                <span className="panel-kicker text-crimson">
                  {isArabic ? 'تنبيه تعارض في الأدلة' : 'CONTRADICTION DETECTED'}
                </span>
                <h3>
                  {isArabic
                    ? 'تعارض صريح بين إقرار غياب الأدلة وادعاء التحقق من السوق'
                    : 'Direct conflict between stated lack of discovery and assertions of customer demand'}
                </h3>
                <p>
                  {isArabic
                    ? 'تم تطبيق خصم نزاهة وتقييد مستوى الثقة تلقائياً. لا يمكن للادعاءات النظرية أن تحل محل المقابلات والتجارب الميدانية.'
                    : 'An honesty penalty and confidence cap were automatically applied. Theoretical claims cannot substitute for verified field discovery.'}
                </p>
              </div>
            </section>
          )}

          {/* Structured Evidence Items */}
          {report.evidence && report.evidence.length > 0 ? (
            <section className="panel evidence-items-panel">
              <div className="panel-topline">
                <div>
                  <span className="panel-kicker">
                    {isArabic ? 'سجل الأدلة والتصنيف المعياري' : 'EVIDENCE TAXONOMY & PROVENANCE'}
                  </span>
                  <h2>
                    {isArabic
                      ? 'تصنيف الأدلة حسب النوع ومصدر الإثبات'
                      : 'Structured Evidence Items by Type & Provenance'}
                  </h2>
                </div>
                <span className="signal-badge">
                  {report.evidence.length} {isArabic ? 'عناصر مسجلة' : 'items recorded'}
                </span>
              </div>

              {/* Qualitative Idea Stability & Ratio Overview Banner */}
              <div className="evidence-stability-overview-banner" id="evidence-stability-overview">
                <div className="stability-banner-ring-col">
                  <EvidenceProgressRing
                    positiveCount={overallPositive}
                    negativeCount={overallNegative}
                    size={56}
                    strokeWidth={5}
                    isArabic={isArabic}
                    id="overview-evidence-stability-ring"
                  />
                </div>
                <div className="stability-banner-content-col">
                  <div className="stability-banner-header">
                    <div className="stability-banner-title">
                      <span className="stability-kicker">
                        {isArabic ? 'التقييم النوعي لاستقرار الفكرة' : 'IDEA STABILITY & SIGNAL BALANCE'}
                      </span>
                      <h3>
                        {isArabic
                          ? `${overallStability.labelAr} (${overallStability.posPercent}% أدلة إيجابية مؤكدة)`
                          : `${overallStability.labelEn} (${overallStability.posPercent}% Validated Signals)`}
                      </h3>
                    </div>
                    <span className={`stability-status-pill ${overallStability.badgeTone}`}>
                      <i className="stability-pulse-dot" />
                      {isArabic ? overallStability.labelAr : overallStability.labelEn}
                    </span>
                  </div>
                  <p className="stability-banner-desc">
                    {isArabic ? overallStability.tooltipAr : overallStability.tooltipEn}
                  </p>
                  <div className="stability-metrics-strip">
                    <span className="stability-metric-item positive">
                      <strong>+{overallPositive}</strong> {isArabic ? 'إشارات إيجابية' : 'Positive Signals'}
                    </span>
                    <span className="stability-metric-item negative">
                      <strong>-{overallNegative}</strong> {isArabic ? 'ملاحظات سلبية' : 'Negative Feedback'}
                    </span>
                    <span className="stability-metric-item ratio">
                      <strong>{overallStability.posPercent}%</strong> {isArabic ? 'نسبة الاستقرار' : 'Stability Ratio'}
                    </span>
                    <span className="stability-metric-item coverage">
                      <strong>{evidenceSummary.coverage}%</strong> {isArabic ? 'تغطية الأدلة' : 'Total Coverage'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="evidence-taxonomy-grid">
                {report.evidence.map((item) => {
                  const typeMeta = typeLabels[item.type] ?? typeLabels.unknown;
                  const provMeta = provenanceLabels[item.provenance] ?? {
                    en: item.provenance,
                    ar: item.provenance
                  };

                  const dimItems = report.evidence.filter(
                    (e) => e.dimension.toLowerCase() === item.dimension.toLowerCase()
                  );
                  const dimPos = dimItems.filter((e) => e.type === 'positive').length;
                  const dimNeg = dimItems.filter((e) => e.type === 'negative').length;

                  return (
                    <article key={item.id} className={`evidence-taxonomy-card ${typeMeta.tone}`}>
                      <div className="evidence-card-header">
                        <div className="evidence-card-tags-left">
                          <span className={`evidence-type-pill ${item.type}`}>
                            {isArabic ? typeMeta.ar : typeMeta.en}
                          </span>
                          <span className="evidence-prov-tag">
                            {isArabic ? provMeta.ar : provMeta.en}
                          </span>
                          <span className="evidence-dim-tag">{item.dimension}</span>
                        </div>

                        {/* Small Progress Ring on Card: Ratio of Positive vs Negative evidence */}
                        <div
                          className="evidence-card-stability-cluster"
                          title={
                            isArabic
                              ? `استقرار الفكرة (${overallStability.posPercent}% إيجابي): ${overallPositive} إيجابي مقابل ${overallNegative} سلبي. في بُعد ${item.dimension}: ${dimPos} إيجابي / ${dimNeg} سلبي.`
                              : `Idea Stability (${overallStability.posPercent}% Positive): ${overallPositive} positive vs ${overallNegative} negative. In ${item.dimension}: ${dimPos} pos / ${dimNeg} neg.`
                          }
                        >
                          <EvidenceProgressRing
                            positiveCount={overallPositive}
                            negativeCount={overallNegative}
                            size={28}
                            strokeWidth={3}
                            isArabic={isArabic}
                            id={`evidence-ring-${item.id}`}
                          />
                          <div className="evidence-card-stability-meta">
                            <span className={`stability-pill-micro ${overallStability.badgeTone}`}>
                              {isArabic ? overallStability.labelAr : overallStability.labelEn}
                            </span>
                            <small className="stability-ratio-micro">
                              +{overallPositive} / -{overallNegative}
                            </small>
                          </div>
                        </div>
                      </div>

                      <p className="evidence-claim">
                        {isArabic ? item.claim.ar : item.claim.en}
                      </p>
                      {item.contradictionDetails && (
                        <div className="evidence-contradiction-detail">
                          <small>
                            <strong>{isArabic ? 'تفاصيل التعارض: ' : 'Conflict: '}</strong>
                            {isArabic
                              ? item.contradictionDetails.ar
                              : item.contradictionDetails.en}
                          </small>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            /* Fallback 3-column layout for legacy reports */
            <div className="evidence-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              <section className="panel evidence-panel facts">
                <span className="panel-kicker">
                  {isArabic ? 'حقائق مقدمة من المستخدم' : 'FACTS / USER-PROVIDED'}
                </span>
                <h2>{isArabic ? 'إشارات مؤكدة' : 'Verified Signals'}</h2>
                <div className="evidence-items">
                  {report.facts.map((item) => (
                    <article key={item.label.en} className="evidence-card">
                      <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                      <MarkdownRenderer>{isArabic ? item.detail.ar : item.detail.en}</MarkdownRenderer>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel evidence-panel assumptions">
                <span className="panel-kicker">
                  {isArabic ? 'افتراضات تحتاج لاختبار' : 'ASSUMPTIONS TO TEST'}
                </span>
                <h2>{isArabic ? 'فرضيات غير مثبتة' : 'Unproven Hypotheses'}</h2>
                <div className="evidence-items">
                  {report.assumptions.map((item) => (
                    <article key={item.label.en} className="evidence-card">
                      <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                      <MarkdownRenderer>{isArabic ? item.detail.ar : item.detail.en}</MarkdownRenderer>
                    </article>
                  ))}
                </div>
              </section>

              <section className="panel evidence-panel missing">
                <span className="panel-kicker">
                  {isArabic ? 'أدلة حرجة مفقودة' : 'MISSING CRITICAL EVIDENCE'}
                </span>
                <h2>{isArabic ? 'فجوات تؤثر على النتيجة' : 'Gaps Lowering Score'}</h2>
                <div className="evidence-items">
                  {report.missingEvidence.length > 0 ? (
                    report.missingEvidence.map((item) => (
                      <article key={item.label.en} className="evidence-card">
                        <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                        <MarkdownRenderer>{isArabic ? item.detail.ar : item.detail.en}</MarkdownRenderer>
                      </article>
                    ))
                  ) : (
                    <p style={{ color: 'var(--muted)' }}>
                      {isArabic
                        ? 'لا توجد أدلة حرجة مفقودة رئيسية في هذا التقرير.'
                        : 'No critical evidence gaps identified in this report.'}
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* Algorithmic Transparency Panel */}
          <section className="panel score-explanation">
            <span className="panel-kicker">
              {isArabic ? 'آلية احتساب النتيجة والشفافية' : 'HOW SCORES WERE DERIVED'}
            </span>
            <h2>{isArabic ? 'شفافية الخوارزمية' : 'Algorithmic Transparency'}</h2>
            <MarkdownRenderer>{isArabic ? report.scoreExplanation.ar : report.scoreExplanation.en}</MarkdownRenderer>
            <p style={{ marginTop: '0.75rem', color: 'var(--muted)', fontSize: '0.875rem' }}>
              {isArabic ? report.disclaimer.ar : report.disclaimer.en}
            </p>
          </section>
        </div>
      )}

      {/* Tab Content 3: Risks & Opportunities */}
      {activeTab === 'risks' && (
        <div className="risks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <section className="panel evidence-panel risks">
            <span className="panel-kicker">
              {isArabic ? 'المخاطر المحددة' : 'IDENTIFIED RISKS'}
            </span>
            <h2>{isArabic ? 'تهديدات الاستمرارية' : 'Viability Threats'}</h2>
            <div className="evidence-items">
              {report.risks.map((item) => (
                <article key={item.label.en} className="evidence-card">
                  <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                  <MarkdownRenderer>{isArabic ? item.detail.ar : item.detail.en}</MarkdownRenderer>
                </article>
              ))}
            </div>
          </section>

          <section className="panel evidence-panel opportunities">
            <span className="panel-kicker">
              {isArabic ? 'الفرص الكامنة' : 'POTENTIAL OPPORTUNITIES'}
            </span>
            <h2>{isArabic ? 'مسارات التوسع' : 'Upside & Expansion Paths'}</h2>
            <div className="evidence-items">
              {report.opportunities.map((item) => (
                <article key={item.label.en} className="evidence-card">
                  <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                  <MarkdownRenderer>{isArabic ? item.detail.ar : item.detail.en}</MarkdownRenderer>
                </article>
              ))}
            </div>
          </section>

          <section className="panel evidence-panel priorities">
            <span className="panel-kicker">
              {isArabic ? 'أولويات التحقق' : 'VALIDATION PRIORITIES'}
            </span>
            <h2>{isArabic ? 'ماذا تختبر أولاً' : 'What to Test First'}</h2>
            <div className="evidence-items">
              {report.validationPriorities.map((item) => (
                <article key={item.label.en} className="evidence-card">
                  <strong>{isArabic ? item.label.ar : item.label.en}</strong>
                  <MarkdownRenderer>{isArabic ? item.detail.ar : item.detail.en}</MarkdownRenderer>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Tab Content 4: Evolution */}
      {activeTab === 'evolution' && (
        <section className="panel full-evolution">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker">
                {isArabic ? 'السجل التاريخي غير القابل للتعديل' : 'IMMUTABLE SNAPSHOT HISTORY'}
              </span>
              <h2>{isArabic ? 'مسار تطور الفكرة عبر الوقت' : 'Idea Evolution Across Time'}</h2>
            </div>
            <span className="signal-badge">
              {idea.evolution.length} {isArabic ? 'تحليلات' : 'snapshots'}
            </span>
          </div>

          <div className="evolution-bars" style={{ display: 'flex', gap: '2rem', padding: '1.5rem 0', borderBottom: '1px solid var(--line)' }}>
            {idea.evolution.map((snap, i) => (
              <div key={snap.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ height: '140px', width: '36px', background: 'var(--navy-3)', borderRadius: '6px', display: 'flex', alignItems: 'flex-end', padding: '4px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: `${snap.opportunityScore}%`,
                      background: i === idea.evolution.length - 1 ? 'var(--cyan)' : 'var(--blue)',
                      borderRadius: '4px',
                      transition: 'height 0.5s ease'
                    }}
                  />
                </div>
                <strong style={{ fontSize: '1rem', color: 'var(--ink)' }}>{snap.opportunityScore}</strong>
                <small style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {snap.confidence}% {isArabic ? 'ثقة' : 'conf'}
                </small>
              </div>
            ))}
          </div>

          <div className="snapshot-list" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {idea.evolution.map((snap, i) => (
              <article
                key={snap.id}
                className="evolution-snapshot"
                style={{
                  padding: '1rem',
                  background: 'var(--navy-2)',
                  borderRadius: '10px',
                  border: '1px solid var(--line)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="signal-badge">#{i + 1}</span>
                    <strong>
                      {new Date(snap.createdAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span>{isArabic ? 'الفرصة: ' : 'Opportunity: '} <strong>{snap.opportunityScore}</strong></span>
                    <span>{isArabic ? 'الثقة: ' : 'Confidence: '} <strong>{snap.confidence}%</strong></span>
                    {snap.readinessScore && (
                      <span>{isArabic ? 'الجاهزية: ' : 'Readiness: '} <strong>{snap.readinessScore}%</strong></span>
                    )}
                  </div>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {isArabic ? snap.changeSummary.ar : snap.changeSummary.en}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Stakeholder-Ready Printable PDF Dossier (visible on print / PDF export) */}
      <div className="report-print-sheet" id="report-print-dossier" aria-hidden="true">
        <header className="print-header">
          <div className="print-title">
            <h1>{isArabic ? idea.title.ar : idea.title.en}</h1>
            <MarkdownRenderer>{isArabic ? report.summary.ar : report.summary.en}</MarkdownRenderer>
          </div>
          <div className="print-meta-badge">
            <strong>{stageLabels[idea.stage]}</strong>
            <span>{isArabic ? 'تقرير تقييم استراتيجي' : 'Executive Opportunity Report'}</span>
            <div>
              {new Date(report.generatedAt).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* Executive Score Summary */}
        <div className="print-scores-grid">
          <div className="print-score-box">
            <h3>{isArabic ? 'نتيجة جاذبية الفرصة' : 'Opportunity Score'}</h3>
            <div className="print-score-value">
              {report.opportunityScore} <small>/ 100</small>
            </div>
            <p className="print-score-desc">
              {isArabic
                ? 'تقييم شامل لـ 10 أبعاد تشمل حجم السوق، حدة الألم، والقوة التنافسية.'
                : 'Holistic evaluation across 10 strategic dimensions including market size, pain urgency, and moat.'}
            </p>
          </div>

          <div className="print-score-box">
            <h3>{isArabic ? 'مستوى الثقة المستندة للأدلة' : 'Confidence Level'}</h3>
            <div className="print-score-value">
              {confidenceScore}%
            </div>
            <p className="print-score-desc">
              {isArabic
                ? `نسبة تغطية الأدلة: ${evidenceSummary.coverage}% مع رصد ${evidenceSummary.positiveCount} إشارة إيجابية و${evidenceSummary.assumptionCount} افتراضات حرجة.`
                : `Evidence coverage at ${evidenceSummary.coverage}% with ${evidenceSummary.positiveCount} validated signals and ${evidenceSummary.assumptionCount} critical assumptions.`}
            </p>
          </div>

          <div className="print-score-box">
            <h3>{isArabic ? 'اكتمال مدخلات التحليل' : 'Input Readiness'}</h3>
            <div className="print-score-value">
              {readinessScore}%
            </div>
            <p className="print-score-desc">
              {isArabic
                ? 'مدى اكتمال المعطيات التشغيلية، الجمهور المستهدف، والنموذج الربحي.'
                : 'Completeness of input signals, target personas, unit economics, and execution roadmap.'}
            </p>
          </div>
        </div>

        {/* Evidence Taxonomy Breakdown Table */}
        <div className="print-section">
          <h2 className="print-section-title">
            <span>{isArabic ? 'تصنيف الأدلة والافتراضات' : 'Evidence Taxonomy Breakdown'}</span>
            <span style={{ fontSize: '9pt', color: '#64748b' }}>
              {isArabic
                ? `الاستقرار: ${overallStability.posPercent}% إيجابي (+${overallPositive} / -${overallNegative}) • ${report.evidence?.length || 0} عنصر مسجل`
                : `Stability: ${overallStability.posPercent}% Positive (+${overallPositive} / -${overallNegative}) • ${report.evidence?.length || 0} items logged`}
            </span>
          </h2>

          <table className="print-taxonomy-table">
            <thead>
              <tr>
                <th style={{ width: '18%' }}>{isArabic ? 'النوع' : 'Type'}</th>
                <th style={{ width: '22%' }}>{isArabic ? 'المصدر' : 'Provenance'}</th>
                <th style={{ width: '45%' }}>{isArabic ? 'البيان / الادعاء' : 'Claim / Evidence'}</th>
                <th style={{ width: '15%' }}>{isArabic ? 'البُعد' : 'Dimension'}</th>
              </tr>
            </thead>
            <tbody>
              {(report.evidence || []).map((fact) => (
                <tr key={fact.id}>
                  <td>
                    <span className={`print-type-badge print-type-${fact.type}`}>
                      {typeLabels[fact.type]?.[isArabic ? 'ar' : 'en'] ?? fact.type}
                    </span>
                  </td>
                  <td>{provenanceLabels[fact.provenance]?.[isArabic ? 'ar' : 'en'] ?? fact.provenance}</td>
                  <td>{isArabic ? fact.claim.ar : fact.claim.en}</td>
                  <td><strong>{fact.dimension}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Strategic Dimensions Breakdown */}
        <div className="print-section">
          <h2 className="print-section-title">
            <span>{isArabic ? 'الأبعاد الاستراتيجية (10 أبعاد)' : '10 Strategic DNA Dimensions'}</span>
          </h2>
          <div className="print-dimensions-grid">
            {report.dimensions.map((dim) => (
              <div key={dim.key} className="print-dim-row">
                <span>{isArabic ? dim.label.ar : dim.label.en}</span>
                <strong>{dim.score} / 100</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Checklist */}
        <div className="print-section">
          <h2 className="print-section-title">
            <span>{isArabic ? 'أولويات التحقق والتنفيذ' : 'Validation & Next Best Actions'}</span>
          </h2>
          <ol style={{ paddingInlineStart: '20px', margin: '0', fontSize: '9.5pt', lineHeight: '1.6' }}>
            {report.nextBestAction.checklist.map((action, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>
                <strong>{isArabic ? action.ar : action.en}</strong>
              </li>
            ))}
          </ol>
        </div>

        <footer className="print-footer">
          <span>IdeaScout Intelligence Platform • Confidential Executive Dossier</span>
          <span>
            {isArabic ? 'تقرير تقييم استثماري' : 'Investment & Strategy Report'} •{' '}
            {new Date().toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
          </span>
        </footer>
      </div>
    </div>
  );
};
