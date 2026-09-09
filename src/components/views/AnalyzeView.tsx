import React, { useState, useEffect } from 'react';
import { Idea, Question, Stage } from '../../types';
import {
  calculateInputReadiness,
  generateContextualQuestions,
  isMeaningfulAnswer,
  validateOpportunityInput
} from '../../utils/engine';
import { Glyph } from '../Glyph';

interface AnalyzeViewProps {
  isArabic: boolean;
  onSaveAnalysis: (newIdea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'latestAnalysis' | 'evolution' | 'opportunityScore' | 'confidence'> & { answers: Record<string, string> }) => void;
  initialDescription?: string;
  initialStage?: Stage;
}

const TEMPLATES = [
  {
    id: 'customer-discovery',
    en: 'Customer Discovery',
    ar: 'اكتشاف العملاء',
    description: {
      en: 'We believe that [Target Persona] experiences [Problem] when doing [Task]. They currently solve this by [Workaround], which is frustrating because [Pain point]. If we build [Solution], they will [Expected behavior/metric].',
      ar: 'نحن نعتقد أن [الشخصية المستهدفة] تواجه [المشكلة] عند القيام بـ [المهمة]. هم حالياً يحلون ذلك عن طريق [الحل البديل]، وهو أمر محبط بسبب [نقطة الألم]. إذا قمنا ببناء [الحل]، فسوف [السلوك المتوقع/المقياس].'
    },
    questions: [
      { id: 'cd-q1', prompt: { en: 'Who specifically is the target persona? Be as narrow as possible.', ar: 'من هي الشخصية المستهدفة تحديداً؟ كن دقيقاً قدر الإمكان.' }, rationale: { en: 'Helps narrow scope', ar: 'يساعد في تضييق النطاق' } },
      { id: 'cd-q2', prompt: { en: 'What triggers this problem for them?', ar: 'ما الذي يثير هذه المشكلة لديهم؟' }, rationale: { en: 'Identifies entry point', ar: 'يحدد نقطة الدخول' } },
      { id: 'cd-q3', prompt: { en: 'How are they currently spending money or time to solve this?', ar: 'كيف ينفقون حالياً المال أو الوقت لحل هذه المشكلة؟' }, rationale: { en: 'Validates real pain', ar: 'يتحقق من الألم الحقيقي' } }
    ]
  },
  {
    id: 'product-pivot',
    en: 'Product Pivot',
    ar: 'محور المنتج',
    description: {
      en: 'Our current product [Product] is struggling with [Metric/Problem]. However, we noticed that [User segment] is using it for [Unexpected Use Case]. We propose pivoting the core value proposition to focus entirely on [New Core Feature] to achieve [Goal].',
      ar: 'منتجنا الحالي [المنتج] يواجه صعوبة في [المقياس/المشكلة]. ومع ذلك، لاحظنا أن [شريحة المستخدمين] تستخدمه لـ [حالة استخدام غير متوقعة]. نقترح تغيير محور عرض القيمة الأساسية للتركيز بالكامل على [الميزة الأساسية الجديدة] لتحقيق [الهدف].'
    },
    questions: [
      { id: 'pp-q1', prompt: { en: 'What data supports this unexpected use case?', ar: 'ما البيانات التي تدعم حالة الاستخدام غير المتوقعة هذه؟' }, rationale: { en: 'Needs evidence', ar: 'يحتاج إلى دليل' } },
      { id: 'pp-q2', prompt: { en: 'What features from the current product can we deprecate?', ar: 'ما هي الميزات من المنتج الحالي التي يمكننا التخلص منها؟' }, rationale: { en: 'Avoids bloat', ar: 'يتجنب التضخم' } },
      { id: 'pp-q3', prompt: { en: 'Who are the new competitors in this pivoted space?', ar: 'من هم المنافسون الجدد في هذا المجال المحوري؟' }, rationale: { en: 'Market context', ar: 'سياق السوق' } }
    ]
  },
  {
    id: 'feature-expansion',
    en: 'Feature Expansion',
    ar: 'توسيع الميزات',
    description: {
      en: 'Our core users frequently request [Feature Request] because they need to [User Goal]. Instead of forcing them to use [Third Party Tool], building this natively will increase [Metric, e.g. Retention] by [Estimate].',
      ar: 'يطلب مستخدمونا الأساسيون باستمرار [طلب الميزة] لأنهم بحاجة إلى [هدف المستخدم]. بدلاً من إجبارهم على استخدام [أداة خارجية]، فإن بناء هذا محلياً سيزيد [المقياس، مثل الاحتفاظ] بمقدار [تقدير].'
    },
    questions: [
      { id: 'fe-q1', prompt: { en: 'Is this feature a "nice-to-have" or a dealbreaker for churn?', ar: 'هل هذه الميزة "إضافة جيدة" أم غيابها يسبب خسارة العملاء؟' }, rationale: { en: 'Assesses feature urgency', ar: 'يقيم إلحاح الميزة' } },
      { id: 'fe-q2', prompt: { en: 'What is the engineering effort compared to the expected revenue lift?', ar: 'ما هو الجهد الهندسي مقارنة بالزيادة المتوقعة في الإيرادات؟' }, rationale: { en: 'ROI calculation', ar: 'حساب العائد على الاستثمار' } },
      { id: 'fe-q3', prompt: { en: 'How will this impact the simplicity of the current user experience?', ar: 'كيف سيؤثر ذلك على بساطة تجربة المستخدم الحالية؟' }, rationale: { en: 'Prevents feature bloat', ar: 'يمنع تضخم الميزات' } }
    ]
  },
  {
    id: 'pricing-audit',
    en: 'Pricing Strategy',
    ar: 'استراتيجية التسعير',
    description: {
      en: 'We are currently charging [Current Price] via [Current Model]. We hypothesize that shifting to [New Pricing Model] for [Target Tier] will reduce friction and increase [Metric, e.g. LTV or Conversions].',
      ar: 'نحن نفرض حالياً [السعر الحالي] عبر [النموذج الحالي]. نفترض أن الانتقال إلى [نموذج التسعير الجديد] لـ [الفئة المستهدفة] سيقلل من الاحتكاك ويزيد [المقياس، مثل التحويلات].'
    },
    questions: [
      { id: 'pa-q1', prompt: { en: 'What signals indicate that the current pricing is causing friction?', ar: 'ما هي الإشارات التي تدل على أن التسعير الحالي يسبب احتكاكاً؟' }, rationale: { en: 'Validates the problem', ar: 'يتحقق من المشكلة' } },
      { id: 'pa-q2', prompt: { en: 'How does the new pricing align with the value metric the customer cares about?', ar: 'كيف يتماشى التسعير الجديد مع القيمة التي يهتم بها العميل؟' }, rationale: { en: 'Aligns price with value', ar: 'يوائم السعر مع القيمة' } },
      { id: 'pa-q3', prompt: { en: 'Have we modeled the potential impact on existing revenue?', ar: 'هل قمنا بنمذجة التأثير المحتمل على الإيرادات الحالية؟' }, rationale: { en: 'Risk assessment', ar: 'تقييم المخاطر' } }
    ]
  }
];

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  isArabic,
  onSaveAnalysis,
  initialDescription = '',
  initialStage = 'Validation',
}) => {
  const [description, setDescription] = useState(initialDescription);
  const [stage, setStage] = useState<Stage>(initialStage);
  const [questions, setQuestions] = useState<Question[]>(() =>
    generateContextualQuestions(initialDescription, initialStage as Stage)
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState(() => {
    return initialDescription.trim().split(/\s+/).slice(0, 4).join(' ') || '';
  });

  useEffect(() => {
    if (!ideaTitle && description) {
      setIdeaTitle(description.trim().split(/\s+/).slice(0, 4).join(' '));
    }
  }, [description]);

  // Automatically use LLM to synthesize professional questions based on the written idea description
  const fetchDynamicQuestions = async (desc: string, currentStage: Stage) => {
    if (!desc || desc.trim().length < 5) {
      setQuestions(generateContextualQuestions(desc, currentStage));
      return;
    }
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc, stage: currentStage, language: isArabic ? 'ar' : 'en' })
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        setQuestions(generateContextualQuestions(desc, currentStage));
      }
    } catch (err) {
      console.warn("Failed to fetch LLM questions, falling back:", err);
      setQuestions(generateContextualQuestions(desc, currentStage));
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (!description || description.trim().length < 5) return;
    const timer = setTimeout(() => {
      fetchDynamicQuestions(description, stage as Stage);
    }, 600);
    return () => clearTimeout(timer);
  }, [description, stage]);

  const handleApplyTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    if (!templateId) {
      setDescription('');
      setQuestions(generateContextualQuestions('', stage));
      setAnswers({});
      return;
    }
    const tpl = TEMPLATES.find(t => t.id === templateId);
    if (tpl) {
      setDescription(isArabic ? tpl.description.ar : tpl.description.en);
      setQuestions(tpl.questions);
      setAnswers({});
    }
  };

  useEffect(() => {
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      // Persist draft to session/local storage for real-time draft safety
      try {
        localStorage.setItem('ideascout_active_draft', JSON.stringify({
          description,
          stage,
          answers,
          updatedAt: new Date().toISOString()
        }));
      } catch {
        // Ignore storage quotas
      }
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 450);

    return () => clearTimeout(timer);
  }, [description, stage, answers]);

  const readiness = calculateInputReadiness(description, stage, answers);
  const answeredCount = Object.values(answers).filter(isMeaningfulAnswer).length;
  
  // Authoritative shared semantic validation
  const validation = validateOpportunityInput(description, stage, answers);
  const canAnalyze = validation.canProceed;

  const handleGenerateQuestions = () => {
    fetchDynamicQuestions(description, stage as Stage);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAnalyze || !ideaTitle.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSaveAnalysis({
        title: {
          en: ideaTitle.trim(),
          ar: ideaTitle.trim()
        },
        description,
        stage,
        questions,
        answers
      });
      setIsSubmitting(false);
    }, 400);
  };

  const stages: { key: Stage; num: string; en: string; ar: string; icon: string }[] = [
    { key: 'Concept', num: '01', en: 'Initial Idea', ar: 'فكرة أولية', icon: 'lightbulb' },
    { key: 'Research', num: '02', en: 'Research', ar: 'بحث', icon: 'search' },
    { key: 'Validation', num: '03', en: 'Validation', ar: 'تحقق', icon: 'shield' },
    { key: 'Growth', num: '04', en: 'Growth', ar: 'نمو', icon: 'zap' }
  ];

  return (
    <div className="view-stack analyze-view">
      <div className="analyze-layout phase2-analyze-layout">
        {/* Step 1: Describe Form */}
        <section className="panel idea-input-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isArabic ? '01 صِف' : '01 DESCRIBE'}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  border: '1px solid',
                  borderColor: saveStatus === 'saving' ? '#f59e0b40' : '#43e6d240',
                  background: saveStatus === 'saving' ? '#f59e0b14' : '#43e6d214',
                  color: saveStatus === 'saving' ? '#fcd34d' : '#43e6d2',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: saveStatus === 'saving' ? '#fcd34d' : '#43e6d2',
                    boxShadow: saveStatus === 'saved' ? '0 0 6px #43e6d2' : 'none'
                  }} />
                  {saveStatus === 'saving'
                    ? (isArabic ? 'جاري الحفظ...' : 'Saving draft...')
                    : (isArabic ? `حفظ تلقائي ${lastSavedTime ? `(${lastSavedTime})` : ''}` : `Draft Saved ${lastSavedTime ? `(${lastSavedTime})` : ''}`)}
                </span>
              </span>
              <h2>{isArabic ? 'اشرح الفرصة كما تراها' : 'Explain the opportunity as you see it'}</h2>
            </div>
            <span className="field-meta">
              {description.length} / 1800 {isArabic ? 'حرفاً' : 'chars'}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label htmlFor="template-select" style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>
                {isArabic ? 'اختر قالب (اختياري):' : 'Use a Template (Optional):'}
              </label>
              <select
                id="template-select"
                value={selectedTemplate}
                onChange={handleApplyTemplate}
                style={{
                  background: 'var(--navy-3)',
                  border: '1px solid var(--line)',
                  color: 'var(--text)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="">{isArabic ? 'بدون قالب (فارغ)' : 'None (Blank)'}</option>
                {TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>
                    {isArabic ? t.ar : t.en}
                  </option>
                ))}
              </select>
            </div>

            <textarea
              className="idea-textarea"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isArabic
                  ? 'لمن هذا المنتج؟ ما المشكلة الملحة التي يعانون منها اليوم؟ كيف يعرفون أن الحل نجح؟ وما هو الحل اليدوي البديل المعتمد حالياً؟'
                  : 'Who is this for? What urgent problem do they face today? How will they know it works? What is the current manual workaround?'
              }
            />

            <fieldset className="stage-fieldset border-0 p-0 m-0">
              <legend className="text-sm font-medium text-[var(--muted)] mb-3">{isArabic ? 'مرحلة الفكرة الحالية' : 'Current idea stage'}</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stages.map((s) => {
                  const isSelected = stage === s.key;
                  return (
                    <label
                      key={s.key}
                      className={`cursor-pointer relative flex flex-col p-4 rounded-xl border transition-all duration-300 stage-select-card ${
                        isSelected 
                          ? 'stage-selected shadow-[0_0_20px_rgba(67,230,210,0.15)] ring-1 ring-[var(--cyan)]' 
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="stage"
                        value={s.key}
                        checked={isSelected}
                        onChange={() => setStage(s.key)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-mono font-bold tracking-wider px-2.5 py-1 rounded-md ${
                          isSelected ? 'bg-[var(--cyan)]/20 text-[var(--cyan)]' : 'bg-[var(--navy-3)] text-[var(--muted)]'
                        }`}>
                          {s.num}
                        </span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[var(--cyan)] text-[#040e1b]' : 'bg-[var(--navy-3)] text-[var(--muted)]'
                        }`}>
                          <Glyph name={s.icon as any} />
                        </div>
                      </div>
                      <strong className={`text-sm font-semibold tracking-wide ${isSelected ? 'text-[var(--ink)] font-bold' : 'text-[var(--ink)]'}`}>
                        {isArabic ? s.ar : s.en}
                      </strong>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Input Readiness Display */}
            <div className="readiness-card">
              <div>
                <span className="panel-kicker">
                  {isArabic ? 'جاهزية المدخلات' : 'INPUT READINESS'}
                </span>
                <strong>{readiness} / 100</strong>
                <small>
                  {readiness < 40
                    ? (isArabic ? 'اكتب 40 حرفاً على الأقل وحدد المشكلة والعميل' : 'Write at least 40 characters and specify problem & customer')
                    : readiness < 70
                    ? (isArabic ? 'جاهز لتوليد الأسئلة السياقية' : 'Ready for contextual clarification questions')
                    : (isArabic ? 'مدخلات قوية مكتملة الأركان' : 'Strong, well-specified input ready for analysis')}
                </small>
              </div>
              <div className="readiness-track">
                <i style={{ width: `${readiness}%` }} />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGenerateQuestions}
                disabled={description.trim().length < 15}
              >
                <Glyph name="spark" />
                <span>
                  {isArabic ? 'توليد 3 أسئلة سياقية' : 'Generate 3 contextual questions'}
                </span>
              </button>
            </div>
          </form>
        </section>

        {/* Step 2: Clarification Questions */}
        <section className="panel required-questions-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isArabic ? '02 وضح' : '02 CLARIFY'}
                {isSynthesizing && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: 'rgba(67, 230, 210, 0.15)',
                    border: '1px solid rgba(67, 230, 210, 0.4)',
                    color: 'var(--cyan)'
                  }}>
                    <span className="animate-pulse">🧠</span>
                    {isArabic ? 'محرك البحث يولد الأسئلة...' : 'Search engine synthesizing questions...'}
                  </span>
                )}
              </span>
              <h2>
                {isArabic ? 'أسئلة احترافية مولدة خصيصاً لفكرتك' : 'Professional questions synthesized for your idea'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="answer-progress">
                {answeredCount} / 3 {isArabic ? 'مجابة' : 'answered'}
              </span>
              <span className="readiness-pill">
                {isArabic ? 'الجاهزية ' : 'Readiness '} {readiness}%
              </span>
            </div>
          </div>



          <div className="questions-container">
            {questions.map((q, idx) => {
              const answered = isMeaningfulAnswer(answers[q.id] ?? '');
              return (
                <div
                  key={q.id}
                  className={`required-question ${answered ? 'answered' : ''}`}
                >
                  <div className="question-header">
                    <span className="question-number">0{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <strong>{isArabic ? q.prompt.ar : q.prompt.en}</strong>
                      <small>{isArabic ? q.rationale.ar : q.rationale.en}</small>
                    </div>
                    {answered && (
                      <span className="signal-badge">
                        <Glyph name="check" /> {isArabic ? 'إجابة وافية' : 'Meaningful answer'}
                      </span>
                    )}
                  </div>

                  <textarea
                    className="question-textarea"
                    rows={3}
                    value={answers[q.id] ?? ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder={
                      isArabic
                        ? 'قدم تفاصيل وأرقاماً أو شواهد حقيقية إن وجدت (12 حرفاً على الأقل)...'
                        : 'Provide details, numbers, or real observations if available (at least 12 chars)...'
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="analysis-submit" style={{ marginTop: '1.5rem' }}>
            {validation.errors.length > 0 && description.trim().length > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '1rem',
                color: '#f87171',
                fontSize: '0.85rem'
              }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'تنبيه التحقق من صحة الفكرة:' : 'Opportunity Validation Notice:'}
                </strong>
                {validation.errors.map((err, i) => (
                  <p key={i} style={{ margin: '2px 0' }}>{isArabic ? err.ar : err.en}</p>
                ))}
              </div>
            )}

            {/* Required Custom Idea Title Input */}
            <div style={{ marginBottom: '1.25rem', background: 'rgba(67, 230, 210, 0.04)', border: '1px solid rgba(67, 230, 210, 0.25)', borderRadius: '14px', padding: '16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--cyan)', display: 'block', marginBottom: '8px', fontWeight: 700 }}>
                {isArabic ? 'اسم الفكرة (على طريقتك الخاصة - إلزامي):' : 'Idea Title / Name (Your Custom Way - Required):'}
              </label>
              <input
                type="text"
                required
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder={isArabic ? 'اكتب اسماً مميزاً لفكرتك...' : 'Enter a custom title for your idea...'}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(3, 12, 24, 0.9)',
                  border: '1px solid var(--line-strong)',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              />
              <small style={{ color: 'var(--muted)', display: 'block', marginTop: '6px', fontSize: '11px' }}>
                {isArabic 
                  ? 'يُرجى تسمية فكرتك بالطريقة التي تفضلها قبل حفظها في الخزنة.' 
                  : 'Please name your idea in your own preferred way before saving it to the vault.'}
              </small>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!canAnalyze || !ideaTitle.trim() || isSubmitting}
            >
              <Glyph name="spark" />
              <span>
                {isSubmitting
                  ? (isArabic ? 'جاري التحليل والحساب...' : 'Analyzing & calculating...')
                  : (isArabic ? 'تحليل الفكرة وحفظها في الخزنة' : 'Analyze & save to Vault')}
              </span>
            </button>
            <p className="engine-note">
              {isArabic
                ? 'يستخدم هذا الإصدار محركاً حتمياً شفافاً. يتم خصم نقاط عند غياب الأدلة، وتُحسب الثقة بشكل منفصل، وقد ترتفع النتيجة أو تنخفض مع التحديثات الحقيقية.'
                : 'This build uses a transparent deterministic engine. Missing evidence is penalized, confidence is calculated separately, and scores can rise or fall with real updates.'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
