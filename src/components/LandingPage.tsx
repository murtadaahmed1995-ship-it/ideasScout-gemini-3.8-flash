import React, { useEffect, useState } from 'react';
import { Brand } from './Brand';
import { Glyph } from './Glyph';

interface LandingPageProps {
  onOpenWorkspace: (openAnalyze?: boolean) => void;
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkspace,
  language,
  onToggleLanguage,
}) => {
  const isArabic = language === 'ar';
  const [activeDna, setActiveDna] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDna((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const dnaLabels = isArabic
    ? ['المشكلة', 'العميل', 'السوق', 'الدليل']
    : ['Problem', 'Customer', 'Market', 'Evidence'];

  const methodSteps = [
    [
      '01',
      isArabic ? 'صِف' : 'Describe',
      isArabic ? 'اشرح المشكلة والجمهور والمرحلة.' : 'Explain the problem, audience, and stage.'
    ],
    [
      '02',
      isArabic ? 'وضّح' : 'Clarify',
      isArabic ? 'أجب عن ثلاثة أسئلة سياقية مطلوبة.' : 'Answer three required contextual questions.'
    ],
    [
      '03',
      isArabic ? 'حلّل' : 'Analyze',
      isArabic ? 'افصل الإشارات عن الافتراضات.' : 'Separate signals from assumptions.'
    ],
    [
      '04',
      isArabic ? 'تحقق' : 'Validate',
      isArabic ? 'اختبر أكبر نقطة عدم يقين.' : 'Test the biggest uncertainty.'
    ],
    [
      '05',
      isArabic ? 'طوّر' : 'Evolve',
      isArabic ? 'أضف أدلة وشاهد النتيجة تتغير.' : 'Add evidence and watch the score change.'
    ]
  ];

  const methodologyPrinciples = [
    [
      'A',
      isArabic ? 'لا أدلة مختلقة' : 'No invented evidence',
      isArabic
        ? 'المجهول يبقى مجهولاً حتى يقدم المستخدم دليلاً.'
        : 'Unknowns stay unknown until the user adds evidence.'
    ],
    [
      'B',
      isArabic ? 'أسئلة تتغير مع الفكرة' : 'Questions change with the idea',
      isArabic
        ? 'يتم استهداف أضعف الافتراضات بحسب المجال والمرحلة.'
        : 'The weakest assumptions are targeted by domain and stage.'
    ],
    [
      'C',
      isArabic ? 'نتيجة قابلة للانخفاض' : 'Scores can go down',
      isArabic
        ? 'الدليل السلبي قد يخفض الفرصة ويرفع الثقة في الوقت نفسه.'
        : 'Negative evidence may lower opportunity while increasing confidence.'
    ]
  ];

  return (
    <div className="marketing-shell">
      {/* Navigation Header */}
      <header className="marketing-nav">
        <button
          type="button"
          className="brand-button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="IdeaScout home"
        >
          <Brand />
        </button>

        <nav className="marketing-links">
          <a href="#how">{isArabic ? 'كيف يعمل' : 'How it works'}</a>
          <a href="#signals">{isArabic ? 'المنهجية' : 'Methodology'}</a>
          <button
            type="button"
            className="language-button"
            onClick={onToggleLanguage}
          >
            {isArabic ? 'EN' : 'العربية'}
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => onOpenWorkspace(false)}
          >
            {isArabic ? 'مساحة العمل' : 'Workspace'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenWorkspace(true)}
          >
            {isArabic ? 'حلّل فكرتك' : 'Analyze your idea'}
          </button>
        </nav>
      </header>

      {/* Main Marketing Sections */}
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-ambient hero-ambient-one" />
          <div className="hero-ambient hero-ambient-two" />

          <div className="hero-copy">
            <span className="launch-chip">
              <span className="live-dot" />
              {isArabic ? 'وصول مبكر مجاني' : 'FREE EARLY ACCESS'}
            </span>

            <h1>
              {isArabic
                ? 'حوّل فكرتك إلى فرصة أوضح.'
                : 'Turn your idea into a clearer opportunity.'}
            </h1>

            <p>
              {isArabic
                ? 'يفصل IdeaScout بين وضوح المدخلات، وجودة الفرصة، وقوة الأدلة — ثم يحول أكبر نقطة عدم يقين إلى خطوة عملية واحدة.'
                : 'IdeaScout separates input clarity, opportunity quality, and evidence strength—then turns the biggest uncertainty into one practical next move.'}
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onOpenWorkspace(true)}
              >
                <span>{isArabic ? 'ابدأ تحليلاً مجانياً' : 'Start a free analysis'}</span>
                <Glyph name="arrow" />
              </button>
              <a className="btn btn-secondary" href="#how">
                {isArabic ? 'اكتشف المنهجية' : 'Explore the method'}
              </a>
            </div>

            <div className="trust-row">
              <span>
                <Glyph name="check" />
                {isArabic ? 'لا تحتاج بطاقة' : 'No card required'}
              </span>
              <span>
                <Glyph name="check" />
                {isArabic ? 'لا نخترع أدلة مفقودة' : 'Missing evidence stays missing'}
              </span>
              <span>
                <Glyph name="check" />
                {isArabic ? 'أداة قرار وليست ضماناً' : 'Decision support, not guarantees'}
              </span>
            </div>
          </div>

          {/* Hero Product Window Simulation */}
          <div className="hero-product">
            <div className="product-window">
              <div className="window-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>
                  {isArabic ? 'سير عمل مبني على الأدلة' : 'EVIDENCE-AWARE WORKFLOW'}
                </span>
                <span className="demo-label">
                  {isArabic ? 'المنتج' : 'PRODUCT'}
                </span>
              </div>

              <div className="window-body">
                <div className="preview-rail">
                  <Brand compact />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>

                <div className="preview-main">
                  <div className="preview-heading">
                    <div>
                      <small>
                        {isArabic ? 'الأسئلة المطلوبة' : 'REQUIRED CLARIFICATION'}
                      </small>
                      <strong>3 / 3</strong>
                    </div>
                    <span className="signal-badge">
                      {isArabic ? 'جاهز' : 'READY'}
                    </span>
                  </div>

                  <div className="preview-grid">
                    <div className="preview-card preview-dna">
                      <span>{isArabic ? 'بصمة الفكرة' : 'IDEA DNA'}</span>
                      <div className="landing-dna">
                        {dnaLabels.map((label, idx) => (
                          <div key={label}>
                            <span>{label}</span>
                            <i
                              style={{
                                width: `${42 + ((idx + activeDna) % 4) * 16}%`,
                                transition: 'width 0.8s ease'
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="preview-card preview-action">
                      <span>{isArabic ? 'أفضل خطوة تالية' : 'NEXT BEST ACTION'}</span>
                      <strong>
                        {isArabic
                          ? 'استهدف أكبر نقطة عدم يقين'
                          : 'Target the biggest uncertainty'}
                      </strong>
                      <div className="action-line">
                        <i />
                      </div>
                      <small>
                        {isArabic ? 'مرتبطة بالتقرير' : 'REPORT-GROUNDED'}
                      </small>
                    </div>
                  </div>

                  <div className="preview-separation">
                    <span>
                      <small>
                        {isArabic ? 'جاهزية المدخلات' : 'INPUT READINESS'}
                      </small>
                      <strong>
                        {isArabic ? 'معلومات كافية للتحليل' : 'Enough to analyze'}
                      </strong>
                    </span>
                    <span>
                      <small>
                        {isArabic ? 'نتيجة الفرصة' : 'OPPORTUNITY SCORE'}
                      </small>
                      <strong>
                        {isArabic ? 'تُحسب بعد الإجابات' : 'Calculated after answers'}
                      </strong>
                    </span>
                    <span>
                      <small>{isArabic ? 'الثقة' : 'CONFIDENCE'}</small>
                      <strong>
                        {isArabic ? 'ترتفع مع الأدلة' : 'Rises with evidence'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Step Methodology Strip */}
        <section className="method-strip" id="how">
          <div className="method-intro">
            <span className="eyebrow">
              {isArabic ? 'من الفكرة إلى قرار' : 'FROM IDEA TO DECISION'}
            </span>
            <h2>
              {isArabic
                ? 'ذكاء منظم، بدون ادعاءات سحرية.'
                : 'Structured intelligence, without the magic claims.'}
            </h2>
          </div>

          <div className="method-steps method-steps-five">
            {methodSteps.map(([num, stepTitle, stepCopy]) => (
              <article key={num}>
                <span>{num}</span>
                <h3>{stepTitle}</h3>
                <p>{stepCopy}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Signals Section */}
        <section className="signal-section" id="signals">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {isArabic ? 'منهجية IdeaScout' : 'IDEASCOUT METHODOLOGY'}
              </span>
              <h2>
                {isArabic ? 'كل رقم يجب أن يعني شيئاً.' : 'Every number should mean something.'}
              </h2>
              <p>
                {isArabic
                  ? 'يقيم التقرير عشرة أبعاد ويخفض النتيجة عندما تكون الأدلة الحرجة مفقودة. الثقة منفصلة عن جودة الفرصة.'
                  : 'The report evaluates ten dimensions and penalizes missing critical evidence. Confidence remains separate from opportunity quality.'}
              </p>
            </div>
          </div>

          <div className="signal-copy-grid landing-principles">
            {methodologyPrinciples.map(([letter, ruleTitle, ruleCopy]) => (
              <article key={letter}>
                <span>{letter}</span>
                <div>
                  <h3>{ruleTitle}</h3>
                  <p>{ruleCopy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="cta-section">
          <div>
            <span className="eyebrow">
              {isArabic ? 'جاهز للاستكشاف؟' : 'READY TO EXPLORE?'}
            </span>
            <h2>
              {isArabic
                ? 'فكرتك تستحق سؤالاً أفضل.'
                : 'Your idea deserves a better question.'}
            </h2>
            <p>
              {isArabic
                ? 'ابدأ مجاناً وانتقل من الوصف إلى دليل وخطوة عملية.'
                : 'Start free and move from description to evidence and action.'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenWorkspace(true)}
          >
            <span>{isArabic ? 'حلّل فكرتك الآن' : 'Analyze your idea now'}</span>
            <Glyph name="arrow" />
          </button>
        </section>
      </main>

      {/* Marketing Footer */}
      <footer className="marketing-footer">
        <Brand />
        <p>
          {isArabic
            ? 'ذكاء قرار عملي للمؤسسين.'
            : 'Practical decision intelligence for founders.'}
        </p>
        <span>© 2026 IdeaScout</span>
      </footer>
    </div>
  );
};
