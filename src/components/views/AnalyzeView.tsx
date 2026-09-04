import React, { useState } from 'react';
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

  const readiness = calculateInputReadiness(description, stage, answers);
  const answeredCount = Object.values(answers).filter(isMeaningfulAnswer).length;
  
  // Authoritative shared semantic validation
  const validation = validateOpportunityInput(description, stage, answers);
  const canAnalyze = validation.canProceed;

  const handleGenerateQuestions = () => {
    const generated = generateContextualQuestions(description, stage);
    setQuestions(generated);
  };

  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAnalyze) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const words = description.trim().split(/\s+/).slice(0, 4).join(' ');
      onSaveAnalysis({
        title: {
          en: words || 'New Opportunity',
          ar: words || 'فرصة جديدة'
        },
        description,
        stage,
        questions,
        answers
      });
      setIsSubmitting(false);
    }, 400);
  };

  const stages: { key: Stage; num: string; en: string; ar: string }[] = [
    { key: 'Concept', num: '01', en: 'Concept', ar: 'فكرة أولية' },
    { key: 'Research', num: '02', en: 'Research', ar: 'بحث' },
    { key: 'Validation', num: '03', en: 'Validation', ar: 'تحقق' },
    { key: 'Growth', num: '04', en: 'Growth', ar: 'نمو' }
  ];

  return (
    <div className="view-stack analyze-view">
      <div className="analyze-layout phase2-analyze-layout">
        {/* Step 1: Describe Form */}
        <section className="panel idea-input-panel">
          <div className="panel-topline">
            <div>
              <span className="panel-kicker">
                {isArabic ? '01 صِف' : '01 DESCRIBE'}
              </span>
              <h2>{isArabic ? 'اشرح الفرصة كما تراها' : 'Explain the opportunity as you see it'}</h2>
            </div>
            <span className="field-meta">
              {description.length} / 1800 {isArabic ? 'حرفاً' : 'chars'}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
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

            <fieldset className="stage-fieldset">
              <legend>{isArabic ? 'مرحلة الفكرة الحالية' : 'Current idea stage'}</legend>
              <div className="stage-options">
                {stages.map((s) => (
                  <label
                    key={s.key}
                    className={`stage-option ${stage === s.key ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="stage"
                      value={s.key}
                      checked={stage === s.key}
                      onChange={() => setStage(s.key)}
                    />
                    <span>{s.num}</span>
                    <strong>{isArabic ? s.ar : s.en}</strong>
                  </label>
                ))}
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
              <span className="panel-kicker">
                {isArabic ? '02 وضح' : '02 CLARIFY'}
              </span>
              <h2>
                {isArabic ? 'ثلاثة أسئلة سياقية مطلوبة' : 'Three required contextual questions'}
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

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!canAnalyze || isSubmitting}
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
