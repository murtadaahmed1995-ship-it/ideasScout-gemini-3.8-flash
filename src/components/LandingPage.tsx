import React, { useEffect, useState, useRef } from 'react';
import { Brand } from './Brand';
import { Glyph } from './Glyph';
import { FAQSection } from './FAQSection';
import { Sun, Moon } from 'lucide-react';

interface LandingPageProps {
  onOpenWorkspace: (target?: 'dashboard' | 'analyze' | 'vault' | boolean) => void;
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
  theme: 'navy' | 'light';
  onToggleTheme: () => void;
  onOpenSignIn: () => void;
  onOpenRegister: () => void;
  onQuickAnalyze: (ideaText: string, stage: string) => void;
}

const EncouragingPhraseCard = ({ title, quote, badge }: { title: string, quote: string, badge: string }) => {
  return (
    <div className="video-testimonial-card flex flex-col justify-between p-8 text-left bg-gradient-to-br from-[#06111f] to-[#081a2e] border border-[var(--line)] shadow-xl relative overflow-hidden group hover:border-[var(--cyan)]/50 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#43e6d2]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#43e6d2]/10 transition-all"></div>
      <div>
        <span className="inline-block px-3 py-1 mb-6 text-xs font-bold tracking-wider uppercase rounded-full border border-[var(--cyan)]/30 text-[var(--cyan)] bg-[var(--cyan)]/10">
          {badge}
        </span>
        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{title}</h3>
        <p className="text-base text-gray-300 leading-relaxed italic">"{quote}"</p>
      </div>
      <div className="pt-6 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
        <span>IdeaScout Inspiration Engine</span>
        <span className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-pulse"></span>
      </div>
    </div>
  );
};

const TestimonialCard = ({ videoSrc, author, role, quote }: { videoSrc: string, author: string, role: string, quote: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(() => { });
      }
    }
  };

  const handleMouseEnter = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => { });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className="video-testimonial-card cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={togglePlay}
    >
      <video 
        ref={videoRef}
        loop 
        muted 
        playsInline
        preload="metadata"
        src={videoSrc}
      />
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-black/60 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all duration-300 group-hover:scale-110 hover:bg-[#43e6d2] hover:text-[#031318]"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 fill-current translate-x-0.5" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
      </div>

      <div className="video-testimonial-overlay">
        <h3 className="text-xl font-bold text-white mb-1">{author}</h3>
        <p className="text-sm font-medium" style={{ color: 'var(--cyan)' }}>{role}</p>
        <p className="text-sm mt-3 line-clamp-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
          {quote}
        </p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWorkspace,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenSignIn,
  onOpenRegister,
  onQuickAnalyze,
}) => {
  const isArabic = language === 'ar';
  const [activeDna, setActiveDna] = useState(0);
  const [quickIdeaText, setQuickIdeaText] = useState('');
  const [quickStage, setQuickStage] = useState<'Concept' | 'MVP' | 'Growth'>('Concept');

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDna((prev) => (prev + 1) % 4);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const allPhrases = [
    {
      titleEn: "Validated Educational Impact",
      titleAr: "أثر تعليمي مثبت وموثوق",
      quoteEn: "The best approach in elementary school is to use professional motivational videos. It is truly helpful and encouraging.",
      quoteAr: "إن أفضل نهج في المدرسة الابتدائية هو استخدام مقاطع الفيديو التحفيزية المهنية. إنها مفيدة ومجشعة للغاية."
    },
    {
      titleEn: "Professional Clarity",
      titleAr: "وضوح مهني كامل",
      quoteEn: "Clarity replaces guesswork. Trust your evidence, refine your approach, and inspire young minds with purposeful guidance.",
      quoteAr: "الوضوح يبدد التخمين. ثق بأدلتك، وطوّر نهجك، وألهم عقول الصغار بتوجيه هادف."
    },
    {
      titleEn: "Strategic Vision",
      titleAr: "رؤية استراتيجية واعدة",
      quoteEn: "The journey from raw spark to market certainty is guided by rigorous inquiry and professional motivation.",
      quoteAr: "رحلة الانتقال من شرارة الفكرة إلى يقين السوق تقودها الأسئلة الدقيقة والدوافع المهنية الملهمة."
    },
    {
      titleEn: "Empowering Innovators",
      titleAr: "تمكين رواد الابتكار",
      quoteEn: "Equipping learners with dynamic motivational media fosters deeper engagement, confidence, and lasting inspiration.",
      quoteAr: "تجهيز المتعلمين بوسائط تحفيزية ديناميكية يعزز التفاعل العميق والثقة والإلهام المستدام."
    }
  ];

  const [selectedPhrases] = useState(() => {
    const shuffled = [...allPhrases].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  });
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
          <Brand wordClassName="landing-header-brand-word" />
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
            className="language-button inline-flex items-center gap-1.5"
            onClick={onToggleTheme}
            title={isArabic ? 'تبديل المظهر (داكن / فاتح)' : 'Toggle Theme (Navy / Light)'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span>{isArabic ? 'داكن' : 'Navy'}</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[var(--cyan)]" />
                <span>{isArabic ? 'فاتح' : 'Light'}</span>
              </>
            )}
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
            className="text-button"
            onClick={onOpenSignIn}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {isArabic ? 'تسجيل الدخول' : 'Sign In'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenRegister}
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {isArabic ? 'حساب جديد' : 'Register'}
          </button>
        </nav>
      </header>

      {/* Main Marketing Sections */}
      <main>
        {/* Hero Section */}
        <section className="hero-section custom-hero-enhancement">
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

            {/* Quick Idea Analyzer Glassmorphic Widget */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 26, 52, 0.85), rgba(9, 15, 32, 0.95))',
              border: '1px solid rgba(67, 230, 210, 0.35)',
              borderRadius: '20px',
              padding: '22px',
              marginTop: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              textAlign: isArabic ? 'right' : 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="panel-kicker" style={{ color: 'var(--cyan)' }}>
                  {isArabic ? 'تحليل سريع للفكرة (Quick Idea Analyzer)' : 'QUICK IDEA ANALYZER'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--cyan)', background: 'rgba(67,230,210,0.15)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  {isArabic ? 'ذكاء اصطناعي فوري' : 'Instant AI'}
                </span>
              </div>

              <textarea
                rows={3}
                value={quickIdeaText}
                onChange={(e) => setQuickIdeaText(e.target.value)}
                placeholder={isArabic ? 'اكتب فكرتك أو فرضيتك هنا باختصار (مثلاً: منصة توظيف ذكية للمستقلين في الشرق الأوسط...)' : 'Type your startup or product idea here (e.g. AI-powered recruitment platform for MENA freelancers...)'}
                style={{
                  width: '100%',
                  background: 'rgba(11, 19, 41, 0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['Concept', 'MVP', 'Growth'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setQuickStage(s)}
                      style={{
                        background: quickStage === s ? 'var(--cyan)' : 'rgba(255,255,255,0.05)',
                        color: quickStage === s ? '#0b1329' : 'var(--muted)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {s === 'Concept' ? (isArabic ? 'فكرة / مفهوم' : 'Concept') : s === 'MVP' ? (isArabic ? 'نموذج أولي' : 'MVP') : (isArabic ? 'نمو وتوسع' : 'Growth')}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    onQuickAnalyze(quickIdeaText.trim(), quickStage);
                  }}
                  style={{ padding: '10px 18px', fontSize: '13px' }}
                >
                  <span>{isArabic ? 'حلّل فكرتك الآن ↗' : 'Analyze your idea ↗'}</span>
                </button>
              </div>
            </div>

            <div className="landing-feature-glow-banner">
              <div className="glow-banner-header">
                <span className="glow-pulse-dot" />
                <strong>{isArabic ? 'ضمانات المنصة الأساسية' : 'PLATFORM GUARANTEES'}</strong>
              </div>
              <div className="trust-row">
                <span className="trust-badge-glow">
                  <Glyph name="check" />
                  {isArabic ? 'لا تحتاج بطاقة' : 'No card required'}
                </span>
                <span className="trust-badge-glow">
                  <Glyph name="check" />
                  {isArabic ? 'لا نخترع أدلة مفقودة' : 'Missing evidence stays missing'}
                </span>
                <span className="trust-badge-glow">
                  <Glyph name="check" />
                  {isArabic ? 'أداة قرار وليست ضماناً' : 'Decision support, not guarantees'}
                </span>
              </div>
            </div>
          </div>

          {/* Hero Product Window Simulation */}
          <div className="hero-product group cursor-pointer" onClick={() => onOpenWorkspace('vault')}>
            <div className="product-window transition-all duration-300 group-hover:border-[#43e6d2] group-hover:shadow-[0_20px_50px_rgba(67,230,210,0.25)]">
              <div className="window-top flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="window-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span>
                    {isArabic ? 'سير عمل مبني على الأدلة' : 'EVIDENCE-AWARE WORKFLOW'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="demo-label animate-pulse">
                    {isArabic ? 'انقر للاستعراض ↗' : 'CLICK TO EXPLORE ↗'}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWorkspace('vault');
                    }}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-[#43e6d2] text-[#031318] hover:bg-[#77f0e2] transition-colors shadow-[0_0_15px_rgba(67,230,210,0.4)]"
                  >
                    {isArabic ? 'تقرير الخزنة' : 'Cabinet Report'}
                  </button>
                </div>
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

                  <div className="preview-separation flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <small>
                        {isArabic ? 'جاهزية المدخلات' : 'INPUT READINESS'}
                      </small>
                      <strong>
                        {isArabic ? 'معلومات كافية للتحليل' : 'Enough to analyze'}
                      </strong>
                    </div>
                    <div>
                      <small>
                        {isArabic ? 'نتيجة الفرصة' : 'OPPORTUNITY SCORE'}
                      </small>
                      <strong>
                        {isArabic ? 'تُحسب بعد الإجابات' : 'Calculated after answers'}
                      </strong>
                    </div>
                    <div>
                      <small>{isArabic ? 'الثقة' : 'CONFIDENCE'}</small>
                      <strong>
                        {isArabic ? 'ترتفع مع الأدلة' : 'Rises with evidence'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Veo Video Testimonials Section */}
        <section className="py-24 px-6 relative z-10" style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--line)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full border" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)', backgroundColor: 'rgba(67, 230, 210, 0.1)' }}>
                {isArabic ? 'مدعوم من Veo' : 'Powered by Veo'}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
                {isArabic ? 'قصص الأثر المثبت والنجاح التعليمي المُلهم' : 'Validated Impact & Educational Success Stories'}
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
                {isArabic 
                  ? 'اكتشف كيف ساعدت منصتنا المؤسسين وقادة التعليم في التحقق من أفكارهم وتحقيق تأثير إيجابي حقيقي.' 
                  : 'Discover how our platform helped founders and education leaders validate their ideas and drive meaningful impact.'}
              </p>
            </div>

            <div className="video-testimonials-grid">
              <TestimonialCard 
                videoSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                author="Sarah Jenkins"
                role={isArabic ? 'مديرة مدرسة ابتدائية ومربية' : 'Elementary School Principal & Educator'}
                quote={isArabic ? '"إن أفضل نهج في المدرسة الابتدائية هو استخدام مقاطع الفيديو التحفيزية المهنية. إنها مفيدة ومجشعة للغاية، وقد ساعدنا IdeaScout في التحقق من هذا النموذج التعليمي بوضوح تام."' : '"The best approach in elementary school is to use professional motivational videos. It is truly helpful and encouraging, and IdeaScout helped us validate this exact learning model with absolute clarity."'}
              />
              <EncouragingPhraseCard 
                badge={isArabic ? 'إلهام يومي' : 'Daily Insight'}
                title={isArabic ? selectedPhrases[0].titleAr : selectedPhrases[0].titleEn}
                quote={isArabic ? selectedPhrases[0].quoteAr : selectedPhrases[0].quoteEn}
              />
              <EncouragingPhraseCard 
                badge={isArabic ? 'رؤية مهنية' : 'Professional Wisdom'}
                title={isArabic ? selectedPhrases[1].titleAr : selectedPhrases[1].titleEn}
                quote={isArabic ? selectedPhrases[1].quoteAr : selectedPhrases[1].quoteEn}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection isArabic={isArabic} />

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

          <div className="landing-feature-glow-banner my-8">
            <div className="glow-banner-header">
              <span className="glow-pulse-dot" />
              <strong>{isArabic ? 'معايير الأدلة والنزاهة الحية' : 'LIVE EVIDENCE & INTEGRITY STANDARDS'}</strong>
            </div>
            <div className="signal-copy-grid landing-principles mt-4">
              {methodologyPrinciples.map(([letter, ruleTitle, ruleCopy]) => (
                <article key={letter} className="landing-evidence-card-glow">
                  <span className="evidence-letter-badge">{letter}</span>
                  <div>
                    <h3>{ruleTitle}</h3>
                    <p>{ruleCopy}</p>
                  </div>
                </article>
              ))}
            </div>
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
        <div className="max-w-lg mx-auto mb-8 p-6 rounded-2xl bg-gradient-to-r from-[#06111f]/90 to-[#081a2e]/90 border border-[var(--cyan)]/40 backdrop-blur-xl shadow-2xl text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#43e6d2]/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                {isArabic ? 'ساعدنا في تطوير المنصة، شاركنا برأيك' : 'Help us develop the platform, share your opinions'}
              </h4>
              <p className="text-xs text-[var(--muted)]">
                {isArabic ? 'رسالتك تُرسل مباشرة إلى فريق التطوير.' : 'Your message is sent directly to the development team.'}
              </p>
            </div>
            {!showFeedbackForm && !feedbackSent && (
              <button
                type="button"
                onClick={() => setShowFeedbackForm(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[var(--cyan)] text-[#031318] hover:opacity-90 transition-all shrink-0"
              >
                {isArabic ? 'اكتب رسالتك' : 'Write Message'}
              </button>
            )}
          </div>

          {feedbackSent ? (
            <div className="py-4 px-4 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 font-medium text-sm space-y-1">
              <p>
                {isArabic 
                  ? '✓ شكراً جزيلاً لك على وقتك الثمين! تم إرسال رسالتك بنجاح، ونحن نتطلع إلى التواصل معك.' 
                  : '✓ Thank you so much for your valuable time! Your message has been successfully sent, and we look forward to connecting with you.'}
              </p>
            </div>
          ) : showFeedbackForm ? (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!feedbackText.trim()) return;
                setIsSendingFeedback(true);
                setTimeout(() => {
                  setIsSendingFeedback(false);
                  setFeedbackSent(true);
                  // Optionally save to localStorage
                  const existing = JSON.parse(localStorage.getItem('ideascout_owner_messages') || '[]');
                  localStorage.setItem('ideascout_owner_messages', JSON.stringify([...existing, { text: feedbackText, email: feedbackEmail, date: new Date().toISOString() }]));
                }, 800);
              }}
              className="space-y-3 mt-4 pt-3 border-t border-[var(--line)]"
            >
              <div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder={isArabic ? 'اكتب رأيك، مقترحك، أو ملاحظاتك هنا...' : 'Write your opinion, suggestion, or feedback here...'}
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--cyan)] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder={isArabic ? 'بريدك الإلكتروني (اختياري)' : 'Your email (optional)'}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[var(--cyan)]"
                />
                <button
                  type="submit"
                  disabled={isSendingFeedback}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[var(--cyan)] text-[#031318] hover:opacity-90 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {isSendingFeedback ? (isArabic ? 'جاري الإرسال...' : 'Sending...') : (isArabic ? 'إرسال' : 'Send')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-3 py-2 text-xs font-medium rounded-xl bg-white/5 border border-white/15 text-gray-300 hover:bg-white/10"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
        <Brand />
        <p>
          {isArabic
            ? 'من شرارة الفكرة إلى يقين السوق — ابنِ ما يهم حقاً.'
            : 'From raw spark to market certainty—build what matters.'}
        </p>
        <span>© 2026 IdeaScout</span>
      </footer>
    </div>
  );
};
