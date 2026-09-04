import {
  Analysis,
  Dimension,
  EvidenceItem,
  EvidenceProvenance,
  EvidenceSummary,
  EvidenceType,
  Idea,
  LocalizedString,
  Question,
  SignalItem,
  Stage
} from '../types';

/**
 * Bounds a value between min and max.
 */
export const clamp = (val: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, Math.round(val)));

export const cleanText = (txt: string): string =>
  txt.toLowerCase().replace(/\s+/g, ' ').trim();

export const matchesAny = (txt: string, terms: string[]): boolean =>
  terms.some(t => txt.includes(t));

/* ==========================================================================
   DOMAIN VOCABULARY & DETECTION DICTIONARIES
   ========================================================================== */

const audienceWords = [
  'for students', 'for restaurants', 'for founders', 'for teams', 'for managers',
  'for parents', 'for patients', 'for freelancers', 'for designers', 'small businesses', 'independent',
  'operators', 'employees', 'creators', 'students', 'restaurants', 'managers', 'designers', 'freelancers',
  'freelance', 'contractors', 'customers', 'salon', 'salons', 'stylists', 'hairdressers',
  'للطلاب', 'للمطاعم', 'للمؤسسين', 'للفرق', 'للمديرين', 'للآباء', 'للمرضى',
  'للمستقلين', 'المصممين', 'الشركات الصغيرة', 'الطلاب', 'المطاعم', 'الصالونات', 'أصحاب الصالونات'
];

const problemWords = [
  'problem', 'struggle', 'pain', 'waste', 'delay', 'difficult', 'manual',
  'fragmented', 'expensive', 'slow', 'miss', 'shortage', 'cancellation', 'no-show',
  'loss', 'cost', 'overdue', 'unpaid', 'invoice', 'invoices', 'debt',
  'مشكلة', 'يعاني', 'ألم', 'هدر', 'تأخير', 'صعب', 'يدوي',
  'مجزأ', 'مكلف', 'بطيء', 'نقص', 'إلغاء', 'فائتة', 'خسارة', 'فواتير', 'متأخرة'
];

const solutionWords = [
  'helps', 'reduce', 'save', 'faster', 'simplify', 'improve', 'connect',
  'automate', 'predict', 'coordinate', 'discover', 'recover', 'reminders', 'waitlist',
  'يساعد', 'يقلل', 'يوفر', 'أسرع', 'يبسط', 'يحسن', 'يربط', 'يؤتمت', 'يتنبأ',
  'ينسق', 'يكتشف', 'استعادة', 'تذكير', 'تذكيرات', 'قائمة انتظار'
];

/* ==========================================================================
   NEGATION & EVIDENCE PARSING (HONESTY FIRST - NEVER REWARD COMPLETENESS AS EVIDENCE)
   ========================================================================== */

// Explicit statements disclaiming customer discovery / interviews
const interviewNegationPatterns = [
  'no interview', 'no interviews', 'have not interviewed', "haven't interviewed",
  'have not spoken', "haven't spoken", 'not spoken to', 'not talked to',
  "haven't talked", 'not conducted any interview', 'zero interviews', 'never interviewed',
  'without interview', 'did not interview', "didn't interview",
  'لم أتحدث', 'لم نقابل', 'لم أجر مقابلات', 'لا توجد مقابلات', 'لم نتحدث مع', 'بدون مقابلات',
  'لم أقابل'
];

// Explicit statements disclaiming pilots / prototypes
const pilotNegationPatterns = [
  'no pilot', "haven't piloted", 'have not piloted', 'not tested',
  "haven't tested", 'have not tested', 'no mvp', 'no prototype tested',
  'zero tests', 'without pilot', 'never tested', 'did not test', "didn't test",
  'لم نختبر', 'لم أجرب', 'لا يوجد نموذج تجريبي', 'بدون تجربة', 'لم يتم التجريب',
  'لم أختبر'
];

// Explicit statements disclaiming revenue / payments
const paymentNegationPatterns = [
  'no one paid', 'no paying customer', 'no paying user', "haven't paid",
  'have not paid', 'zero paying', 'zero revenue', 'not paid', 'not tested price',
  "haven't tested price", "haven't tested pricing", 'no pricing test',
  'nobody has paid', 'zero sales', 'no revenue yet', 'untested price',
  'لم يدفع أحد', 'لا يوجد عميل دفع', 'لم يدفعوا', 'لم أختبر السعر', 'بدون دفع',
  'لم نحصل على إيرادات', 'لا إيراد حتى الآن'
];

// Positive customer discovery patterns (ONLY valid when NOT negated)
const positiveInterviewPatterns = [
  'interviewed', 'interviews conducted', 'conducted', 'interviews', 'interview',
  'spoken directly with', 'spoken with', 'talked to', 'talked with',
  'operators experience', 'owners report', 'reported frequent', 'said they waste',
  'customers reported', 'users confirmed', 'قابلة مباشرة', 'أجرينا مقابلات',
  'تحدثت مع', 'قابلنا', 'أكد أصحاب', 'مقابلات'
];

// Positive pilot patterns (ONLY valid when NOT negated)
const positivePilotPatterns = [
  'agree to test', 'agreed to test', 'enrolled in our pilot', 'enrolled in pilot',
  'pilot filled', 'pilot completed', 'active pilot', 'tested with', 'users in pilot',
  'prototype tested', 'وافقوا على التجربة', 'تجربة تجريبية', 'سجلوا في التجربة'
];

// Positive payment patterns (ONLY valid when NOT negated)
const positivePaymentPatterns = [
  'agreed to pay', 'agree to pay', 'paying customer', 'paying customers',
  'paid for a pilot', 'paid pilot', 'paid deposits', 'secured pre-order',
  'committed to pay', 'pre-orders', 'paying $', 'paid deposit', 'دفعوا', 'عميل دفع',
  'دفع عربون', 'التزموا بالدفع', 'اشتراك مدفوع'
];

// Negative validated signals (real-world evidence rejecting or weakening the claim)
const negativeEvidencePatterns = [
  'not a priority', 'not interested', 'would not pay', 'refused to pay',
  'zero willingness to pay', 'tolerate existing', 'prefer manual',
  'too expensive', 'low priority', 'not willing to pay', 'would rather stick',
  'لا يرغبون بالدفع', 'ليست أولوية', 'رفضوا الشراء', 'لا يهتمون',
  'غير مستعدين للدفع', 'يفضلون الطريقة اليدوية'
];

// Confident or unvalidated claims that could contradict disclaimers
const claimOfHighDemand = [
  'definitely want', 'customers want', 'everyone wants', 'customers love',
  'ready to pay', 'huge demand confirmed', 'يريدون بالتأكيد', 'الجميع يطلب',
  'العملاء معجبون', 'جاهزون للدفع'
];

const claimOfCommercialTraction = [
  'customers are paying', 'already paying', 'high willingness to pay',
  'generating revenue', 'proven willingness to pay', 'يدفعون بالفعل',
  'استعداد مؤكد للدفع'
];

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */

/* ==========================================================================
   SEMANTIC INPUT VALIDATION & NON-OPPORTUNITY GATEWAY
   ========================================================================== */

export interface ValidationFeedback {
  isValid: boolean;
  canProceed: boolean;
  errors: LocalizedString[];
  warnings: LocalizedString[];
}

const nonOpportunityPatterns = [
  'what is the weather', 'weather forecast', 'what is the capital', 'who won',
  'how old are you', 'tell me a joke', 'write a poem', 'translate this',
  'what is your name', 'hello world', 'test 123', 'asdf', 'qwerty',
  'ما هو الطقس', 'حالة الجو', 'من فاز', 'اكتب قصيدة', 'نكتة', 'ترجم هذا', 'مرحبا بالعالم'
];

/**
 * Authoritative semantic validation for opportunity inputs.
 * Ensures the input articulates a genuine business thesis rather than trivia,
 * conversational noise, or uninformative fragments.
 */
export function validateOpportunityInput(
  desc: string,
  stage: Stage,
  answers: Record<string, string> = {}
): ValidationFeedback {
  const clean = cleanText(desc);
  const errors: LocalizedString[] = [];
  const warnings: LocalizedString[] = [];

  // 1. Length & Fragment checks
  if (clean.length < 35) {
    errors.push({
      en: 'Description is too brief (minimum 35 characters required to formulate a business thesis).',
      ar: 'وصف الفكرة قصير جداً (يلزم 35 حرفاً على الأقل لصياغة فرضية تجارية قابلة للتحليل).'
    });
  }

  // 2. Off-topic or non-opportunity query checks
  if (matchesAny(clean, nonOpportunityPatterns)) {
    errors.push({
      en: 'Input appears to be a general query or conversational prompt rather than a product or venture hypothesis.',
      ar: 'يبدو المدخل استفساراً عاماً أو محادثة عادية بدلاً من فرضية منتج أو مشروع ريادي.'
    });
  }

  // 3. Problem/Audience/Solution core anchor check
  const hasAudience = matchesAny(clean, audienceWords);
  const hasProblem = matchesAny(clean, problemWords);
  const hasSolution = matchesAny(clean, solutionWords);

  if (!hasAudience && !hasProblem && !hasSolution && clean.length > 0) {
    errors.push({
      en: 'Input lacks a detectable target customer, problem context, or proposed solution mechanism.',
      ar: 'يفتقر الوصف إلى تحديد العميل المستهدف، أو سياق المشكلة، أو آلية الحل المقترحة.'
    });
  }

  // 4. Clarification answers check
  const answeredCount = Object.values(answers).filter(isMeaningfulAnswer).length;
  if (answeredCount < 1) {
    warnings.push({
      en: 'At least one contextual question must be answered with meaningful detail (minimum 12 characters).',
      ar: 'يجب الإجابة على سؤال استيضاحي واحد على الأقل بتفاصيل ذات مغزى (12 حرفاً كحد أدنى).'
    });
  }

  const isValid = errors.length === 0;
  const canProceed = isValid && answeredCount >= 1;

  return {
    isValid,
    canProceed,
    errors,
    warnings
  };
}

export function isMeaningfulAnswer(ans: string): boolean {
  const t = ans.trim();
  return t.length >= 12 && t.split(/\s+/).filter(Boolean).length >= 3;
}

/**
 * Readiness measures how prepared the idea is for the next validation/execution step:
 * - Clear problem hypothesis
 * - Specific target segment
 * - Proposed mechanism/solution
 * - Proposed business model hypothesis
 * - Known unknowns identified
 * - Meaningful answers to contextual questions
 */
export function calculateInputReadiness(
  desc: string,
  stage: Stage,
  answers: Record<string, string> = {}
): number {
  const combined = cleanText(desc + ' ' + Object.values(answers).join(' '));
  const r = cleanText(desc);
  let score = 10; // base scaffolding

  if (r.length >= 40) score += 8;
  if (r.length >= 100) score += 6;
  if (r.length >= 200) score += 4;

  if (matchesAny(combined, audienceWords)) score += 9;
  if (matchesAny(combined, problemWords)) score += 9;
  if (matchesAny(combined, solutionWords)) score += 8;

  // Stage bonus
  if (stage === 'Growth') score += 8;
  else if (stage === 'Validation') score += 6;
  else if (stage === 'Research') score += 4;
  else score += 2;

  // Meaningful clarification answers provide operational context
  const answeredCount = Object.values(answers).filter(isMeaningfulAnswer).length;
  score += answeredCount * 6;

  // If numbers or explicit test metrics exist in input or answers
  if (/\b\d+(?:\.\d+)?%?\b/.test(combined)) score += 5;

  return clamp(score, 10, 95);
}

export function generateContextualQuestions(desc: string, _stage: Stage): Question[] {
  const lower = cleanText(desc);

  if (
    lower.includes('salon') ||
    lower.includes('appointment') ||
    lower.includes('booking') ||
    lower.includes('حجز') ||
    lower.includes('صالون')
  ) {
    return [
      {
        id: 'q1',
        prompt: {
          en: 'How many missed appointments or cancellations does a typical salon experience per month, and what is the estimated revenue lost?',
          ar: 'كم عدد المواعيد الفائتة أو الإلغاءات التي يتعرض لها الصالون شهرياً، وما الخسارة المالية المقدرة؟'
        },
        rationale: {
          en: 'Quantifies problem severity and the economic justification for paying for a solution.',
          ar: 'يقيس حجم المشكلة والجدوى المالية لدفع قيمة الحل.'
        }
      },
      {
        id: 'q2',
        prompt: {
          en: 'Have you spoken directly with independent salon owners or managers about how they currently handle reminders or deposits?',
          ar: 'هل تحدثت مباشرة مع أصحاب صالونات مستقلين أو مديرين حول كيفية تعاملهم الحالي مع التذكيرات أو العربون؟'
        },
        rationale: {
          en: 'Validates primary customer discovery and tests whether manual alternatives are already sufficient.',
          ar: 'يتحقق من استكشاف العملاء المباشر وما إذا كانت الحلول اليدوية الحالية كافية.'
        }
      },
      {
        id: 'q3',
        prompt: {
          en: 'What evidence exists that salon owners are willing to pay a recurring monthly fee rather than using free WhatsApp reminders?',
          ar: 'ما الدليل على رغبة أصحاب الصالونات بالدفع شهرياً بدلاً من الاعتماد على رسائل واتساب المجانية؟'
        },
        rationale: {
          en: 'Tests the willingness-to-pay hypothesis against low-cost inertia.',
          ar: 'يختبر فرضية الاستعداد للدفع في مواجهة الحلول البديلة شبه المجانية.'
        }
      }
    ];
  }

  if (
    lower.includes('restaurant') ||
    lower.includes('food') ||
    lower.includes('farmer') ||
    lower.includes('farm') ||
    lower.includes('chef') ||
    lower.includes('wholesale') ||
    lower.includes('supply') ||
    lower.includes('مطعم') ||
    lower.includes('مزارع')
  ) {
    return [
      {
        id: 'q1',
        prompt: {
          en: 'Who holds the ultimate buying authority in target kitchens (the head chef, general manager, or procurement owner)?',
          ar: 'من يملك قرار الشراء النهائي في المطاعم المستهدفة (كبير الطهاة، المدير العام، أم مسؤول المشتريات)؟'
        },
        rationale: {
          en: 'Separates user from buyer to evaluate sales friction in restaurant workflows.',
          ar: 'يفصل المستخدم عن المشتري لتقييم الاحتكاك البيعي في مسار عمل المطاعم.'
        }
      },
      {
        id: 'q2',
        prompt: {
          en: 'What minimum delivery reliability and freshness guarantees must be met before a restaurant will switch suppliers?',
          ar: 'ما الحد الأدنى من ضمانات موثوقية التوصيل والجودة المطلوبة قبل أن يوافق المطعم على استبدال الموردين؟'
        },
        rationale: {
          en: 'Uncovers the critical operational risk that could invalidate the marketplace model.',
          ar: 'يكشف المخاطر التشغيلية الحرجة التي قد تبطل نموذج السوق الوسيط.'
        }
      },
      {
        id: 'q3',
        prompt: {
          en: 'Have you completed any pilot orders or secured signed letters of intent from both suppliers and restaurant operators?',
          ar: 'هل نفذت أي طلبات تجريبية أو حصلت على خطابات نوايا موقعة من الموردين ومشغلي المطاعم؟'
        },
        rationale: {
          en: 'Tests whether multi-sided market liquidity has any empirical backing.',
          ar: 'يختبر ما إذا كانت سيولة السوق متعدد الأطراف تمتلك أي دعم واقعي.'
        }
      }
    ];
  }

  return [
    {
      id: 'q1',
      prompt: {
        en: 'What specific measurable pain or cost does the target customer experience today, and how frequently does it occur?',
        ar: 'ما الألم أو التكلفة المحددة والقابلة للقياس التي يعاني منها العميل المستهدف اليوم، وكم مرة تتكرر؟'
      },
      rationale: {
        en: 'Separates genuine urgent pain from mild "nice-to-have" conveniences.',
        ar: 'يفصل بين الألم الملح والحقيقي وبين الحلول التكميلية غير الضرورية.'
      }
    },
    {
      id: 'q2',
      prompt: {
        en: 'Have you conducted structured interviews with potential buyers, and what exact workaround do they currently use?',
        ar: 'هل أجريت مقابلات منظمة مع مشترين محتملين، وما البديل الفعلي الذي يعتمدون عليه حالياً؟'
      },
      rationale: {
        en: 'Validates real-world customer discovery and identifies existing competitor habits.',
        ar: 'يتحقق من استكشاف العملاء الواقعي ويكشف العادات والحلول البديلة القائمة.'
      }
    },
    {
      id: 'q3',
      prompt: {
        en: 'What concrete signal or experiment (pre-orders, paid deposits, LOIs, pilot usage) validates willingness to pay?',
        ar: 'ما الإشارة الملموسة أو التجربة (حجوزات مسبقة، دفع مالي، خطابات نوايا، استخدام تجريبي) التي تثبت الاستعداد للدفع؟'
      },
      rationale: {
        en: 'Grounds the monetization hypothesis in empirical evidence rather than founder assumption.',
        ar: 'يرسخ فرضية نموذج الإيرادات في أدلة عملية بدلاً من افتراضات المؤسس.'
      }
    }
  ];
}

/* ==========================================================================
   BATCH 3: EVIDENCE EXTRACTION & TAXONOMY CLASSIFIER
   ========================================================================== */

interface ExtractedEvidence {
  items: EvidenceItem[];
  summary: EvidenceSummary;
  hasInterviews: boolean;
  hasPilot: boolean;
  hasPayment: boolean;
  hasNegativeEvidence: boolean;
  contradictionFound: boolean;
}

export function extractEvidenceFromInput(
  desc: string,
  answers: Record<string, string>
): ExtractedEvidence {
  const items: EvidenceItem[] = [];
  const text = cleanText(desc + ' ' + Object.values(answers).join(' '));

  // 1. Check Negations vs Positives
  const interviewsNegated = matchesAny(text, interviewNegationPatterns);
  const pilotNegated = matchesAny(text, pilotNegationPatterns);
  const paymentNegated = matchesAny(text, paymentNegationPatterns);

  const hasPositiveInterviews = !interviewsNegated && matchesAny(text, positiveInterviewPatterns);
  const hasPositivePilot = !pilotNegated && matchesAny(text, positivePilotPatterns);
  const hasPositivePayment = !paymentNegated && matchesAny(text, positivePaymentPatterns);

  const hasNegative = matchesAny(text, negativeEvidencePatterns);

  // 2. Check for Contradictions
  let contradictionFound = false;

  // Contradiction Pattern 1: Negated interviews + claims of verified customer demand
  if (interviewsNegated && matchesAny(text, claimOfHighDemand)) {
    contradictionFound = true;
    items.push({
      id: 'ev-contra-01',
      type: 'contradiction',
      dimension: 'audience',
      claim: {
        en: 'Customer demand is claimed as definite despite explicitly stating no customer interviews have occurred.',
        ar: 'تم الادعاء بوجود رغبة مؤكدة من العملاء رغم الإقرار الصريح بعدم إجراء أي مقابلات معهم.'
      },
      provenance: 'contradiction_detection',
      status: 'derived',
      weight: 3,
      contradictionDetails: {
        en: 'Conflict between absence of customer discovery and assertion of verified customer desire.',
        ar: 'تعارض مباشر بين غياب استكشاف العملاء وادعاء التحقق من رغبتهم.'
      }
    });
  }

  // Contradiction Pattern 2: Negated payment + claims of commercial traction
  if (paymentNegated && matchesAny(text, claimOfCommercialTraction)) {
    contradictionFound = true;
    items.push({
      id: 'ev-contra-02',
      type: 'contradiction',
      dimension: 'willingness_to_pay',
      claim: {
        en: 'Commercial willingness to pay is claimed while simultaneously admitting zero paying customers.',
        ar: 'ادعاء الاستعداد التجاري للدفع مع الإقرار في نفس الوقت بعدم وجود أي عميل دافع.'
      },
      provenance: 'contradiction_detection',
      status: 'derived',
      weight: 3,
      contradictionDetails: {
        en: 'Conflict between zero verified financial transactions and claims of commercial validation.',
        ar: 'تعارض بين انعدام العمليات المالية الموثقة وادعاء الجدوى التجارية المؤكدة.'
      }
    });
  }

  // 3. Populate Positive Evidence (only if genuinely verified)
  if (hasPositiveInterviews) {
    items.push({
      id: 'ev-pos-01',
      type: 'positive',
      dimension: 'problem',
      claim: {
        en: 'Direct interviews with target operators confirm acute recurring pain and workflow disruption.',
        ar: 'مقابلات مباشرة مع المشغلين المستهدفين تؤكد وجود ألم حاد متكرر واضطراب في مسار العمل.'
      },
      provenance: 'clarification_answer',
      status: 'direct',
      weight: 2
    });
  }

  if (hasPositivePilot) {
    items.push({
      id: 'ev-pos-02',
      type: 'positive',
      dimension: 'solution',
      claim: {
        en: 'Target users agreed to or participated in pilot testing, validating workflow feasibility.',
        ar: 'وافق مستخدمون مستهدفون على المشاركة في تجربة أولية، مما يؤكد قابلية التطبيق التشغيلي.'
      },
      provenance: 'clarification_answer',
      status: 'direct',
      weight: 2
    });
  }

  if (hasPositivePayment) {
    items.push({
      id: 'ev-pos-03',
      type: 'positive',
      dimension: 'willingness_to_pay',
      claim: {
        en: 'Verified financial commitment (paid pilot, deposit, or pre-order) confirms willingness to pay.',
        ar: 'التزام مالي موثق (دفع لتجربة، عربون، أو حجز مسبق) يؤكد استعداد العملاء للدفع.'
      },
      provenance: 'clarification_answer',
      status: 'direct',
      weight: 3
    });
  }

  // 4. Populate Negative Evidence (direct feedback that weakens the idea)
  if (hasNegative) {
    items.push({
      id: 'ev-neg-01',
      type: 'negative',
      dimension: 'willingness_to_pay',
      claim: {
        en: 'Target customers report that this issue is low priority or state zero willingness to pay.',
        ar: 'أفاد العملاء المستهدفون بأن المشكلة ليست ذات أولوية أو أبدوا عدم رغبتهم بالدفع.'
      },
      provenance: 'clarification_answer',
      status: 'direct',
      weight: 3
    });
  }

  // 5. Populate Unknowns & Missing Evidence (honest gaps stay gaps!)
  if (!hasPositiveInterviews && !hasNegative) {
    items.push({
      id: 'ev-unk-01',
      type: 'unknown',
      dimension: 'audience',
      claim: {
        en: 'Customer discovery depth unknown: no structured interviews with buyers recorded.',
        ar: 'عمق استكشاف العملاء غير معلوم: لم يتم تسجيل مقابلات منظمة مع المشترين.'
      },
      provenance: 'missing_evidence',
      status: 'derived',
      weight: 2
    });
  }

  if (!hasPositivePilot) {
    items.push({
      id: 'ev-unk-02',
      type: 'unknown',
      dimension: 'solution',
      claim: {
        en: 'Solution retention unknown: lacks longitudinal prototype testing under daily conditions.',
        ar: 'استبقاء الحل غير معلوم: يفتقر لاختبار النموذج الأولي تحت ظروف الاستخدام اليومي.'
      },
      provenance: 'missing_evidence',
      status: 'derived',
      weight: 2
    });
  }

  if (!hasPositivePayment && !hasNegative) {
    items.push({
      id: 'ev-unk-03',
      type: 'unknown',
      dimension: 'willingness_to_pay',
      claim: {
        en: 'Willingness to pay untested: no commercial commitment or financial transaction observed.',
        ar: 'الاستعداد للدفع غير مختبر: لم يتم رصد التزام تجاري أو معاملة مالية فعلية.'
      },
      provenance: 'missing_evidence',
      status: 'derived',
      weight: 3
    });
  }

  // 6. Populate Assumptions
  items.push({
    id: 'ev-assump-01',
    type: 'assumption',
    dimension: 'competition',
    claim: {
      en: 'Assumes operators will switch away from familiar manual habits (WhatsApp/spreadsheets) without heavy friction.',
      ar: 'يفترض أن المشغلين سيتخلون عن عاداتهم اليدوية المألوفة (واتساب/إكسل) دون مقاومة بيعية كبيرة.'
    },
    provenance: 'engine_inference',
    status: 'derived',
    weight: 1
  });

  if (!hasPositivePayment) {
    items.push({
      id: 'ev-assump-02',
      type: 'assumption',
      dimension: 'monetization',
      claim: {
        en: 'Recurring SaaS subscription pricing is an untested working hypothesis.',
        ar: 'التسعير باشتراك برمجي دوري هو فرضية عمل لم تخضع للاختبار التجاري بعد.'
      },
      provenance: 'engine_inference',
      status: 'derived',
      weight: 1
    });
  }

  const positiveCount = items.filter(i => i.type === 'positive').length;
  const negativeCount = items.filter(i => i.type === 'negative').length;
  const unknownCount = items.filter(i => i.type === 'unknown').length;
  const assumptionCount = items.filter(i => i.type === 'assumption').length;
  const contradictionCount = items.filter(i => i.type === 'contradiction').length;

  // Coverage is the fraction of key empirical domains (interviews, pilot, payment) that have concrete signals (pos or neg)
  let empiricalSignalPoints = 0;
  if (hasPositiveInterviews || hasNegative) empiricalSignalPoints += 33;
  if (hasPositivePilot) empiricalSignalPoints += 33;
  if (hasPositivePayment || hasNegative) empiricalSignalPoints += 34;

  const coverage = clamp(empiricalSignalPoints);
  const primaryEvidenceFound = hasPositiveInterviews || hasPositivePilot || hasPositivePayment || hasNegative;

  return {
    items,
    summary: {
      positiveCount,
      negativeCount,
      unknownCount,
      assumptionCount,
      contradictionCount,
      coverage,
      primaryEvidenceFound
    },
    hasInterviews: hasPositiveInterviews,
    hasPilot: hasPositivePilot,
    hasPayment: hasPositivePayment,
    hasNegativeEvidence: hasNegative,
    contradictionFound
  };
}

/* ==========================================================================
   BATCH 3: DETERMINISTIC THREE-METRIC EVALUATION
   ========================================================================== */

/**
 * Calculates Opportunity, Confidence, and Readiness as 3 strictly separated metrics.
 */
export function evaluateIdea(
  desc: string,
  stage: Stage,
  questions: Question[],
  answers: Record<string, string>,
  _existingSnapshots: Idea['evolution'] = []
): Analysis {
  const combined = (desc + ' ' + Object.values(answers).join(' ')).toLowerCase();
  const extracted = extractEvidenceFromInput(desc, answers);

  const {
    hasInterviews,
    hasPilot,
    hasPayment,
    hasNegativeEvidence,
    contradictionFound
  } = extracted;

  /* --------------------------------------------------------------------------
     1. CONFIDENCE SCORE (Evidence Backing, NOT Form Completeness)
     --------------------------------------------------------------------------
     Confidence reflects strictly how strongly empirical evidence supports the assessment.
     - Unvalidated ideas with no evidence MUST remain low (18 - 26).
     - Answering questions provides minimal clarity (+2 to +4), never high confidence.
     - Assumptions do NOT increase confidence.
     - Unknowns reduce confidence.
     - Direct positive evidence substantially increases confidence (+18 to +24 each).
     - Direct negative evidence ALSO increases confidence (+20 to +24) because the market
       feedback was tested and validated, while lowering Opportunity!
     - Contradictions trigger an honesty penalty (-15) and cap confidence at 30.
  */
  let confidence = 20; // baseline for unvalidated hypothesis

  if (hasInterviews) confidence += 19;
  if (hasPilot) confidence += 18;
  if (hasPayment) confidence += 22;

  // Negative validated evidence counts as empirical coverage!
  if (hasNegativeEvidence) {
    confidence += 24;
  }

  // Answer quality bonus is strictly capped at +3 points for clarity, never validation
  const meaningfulAnswers = Object.values(answers).filter(isMeaningfulAnswer).length;
  if (meaningfulAnswers === 3 && extracted.summary.primaryEvidenceFound) {
    confidence += 3;
  } else if (meaningfulAnswers === 3 && !extracted.summary.primaryEvidenceFound) {
    confidence += 2; // slight clarity bonus, but capped!
  }

  // Contradiction penalty
  if (contradictionFound) {
    confidence -= 16;
    confidence = Math.min(confidence, 26);
  }

  // Honest bounds: if NO primary evidence was found, confidence CANNOT exceed 28
  if (!extracted.summary.primaryEvidenceFound) {
    confidence = clamp(confidence, 15, 26);
  } else {
    confidence = clamp(confidence, 15, 88);
  }

  /* --------------------------------------------------------------------------
     2. OPPORTUNITY SCORE (Potential Strategic Attractiveness)
     --------------------------------------------------------------------------
     Measures how promising the idea is across the 10 strategic dimensions.
     - A compelling, unvalidated idea can have high Opportunity (e.g. 72-74)
       even when Confidence is low (e.g. 22).
     - Negative validated evidence lowers Opportunity (e.g. down to 38-46),
       even when Confidence is high (e.g. 68)!
     - Contradictions reduce the affected dimension and overall opportunity.
  */
  let problemScore = matchesAny(combined, problemWords) ? 78 : 60;
  if (hasInterviews && !hasNegativeEvidence) problemScore = 88;
  if (hasNegativeEvidence) problemScore = 38; // customers said it's not a priority!

  const targetScore = matchesAny(combined, audienceWords) ? 84 : 58;
  const solutionScore = matchesAny(combined, solutionWords) ? 78 : 60;
  const valuePropScore = Math.round((problemScore + solutionScore) / 2);

  let monetizationScore = 60;
  if (matchesAny(combined, ['subscription', 'fee', 'take-rate', 'commission', 'saas', 'شهري', 'عمولة', 'اشتراك'])) {
    monetizationScore = 72;
  }
  if (hasPayment) monetizationScore = 88;
  if (hasNegativeEvidence) monetizationScore = 34; // zero willingness to pay!

  let wtpScore = 48;
  if (hasInterviews && !hasNegativeEvidence) wtpScore = 64;
  if (hasPayment) wtpScore = 88;
  if (hasNegativeEvidence) wtpScore = 22; // explicitly rejected price!

  const compScore = matchesAny(combined, ['whatsapp', 'excel', 'competitor', 'manual', 'بديل', 'منافس']) ? 74 : 56;
  const diffScore = hasPilot ? 78 : 66;
  const scalabilityScore = stage === 'Growth' ? 88 : stage === 'Validation' ? 80 : stage === 'Research' ? 72 : 68;
  const defensibilityScore = hasPayment && hasPilot ? 76 : (hasInterviews ? 60 : 52);

  const rawOpportunity = Math.round(
    problemScore * 0.16 +
    targetScore * 0.12 +
    solutionScore * 0.10 +
    valuePropScore * 0.10 +
    monetizationScore * 0.12 +
    wtpScore * 0.14 +
    compScore * 0.08 +
    diffScore * 0.06 +
    scalabilityScore * 0.06 +
    defensibilityScore * 0.06
  );

  let opportunityScore = rawOpportunity;
  if (hasNegativeEvidence) {
    opportunityScore = clamp(rawOpportunity - 16, 20, 85);
  } else if (contradictionFound) {
    opportunityScore = clamp(rawOpportunity - 8, 25, 88);
  } else {
    opportunityScore = clamp(rawOpportunity, 30, 95);
  }

  /* --------------------------------------------------------------------------
     3. READINESS SCORE (Validation & Execution Preparedness)
     --------------------------------------------------------------------------
     Measures whether the user has framed the idea well enough to execute the next
     meaningful experiment.
     - A well-described idea can have high Readiness (68-76) with low Confidence (22).
  */
  const readinessScore = calculateInputReadiness(desc, stage, answers);
  const inputReadiness = readinessScore; // backward-compatibility alias

  /* --------------------------------------------------------------------------
     4. TEN DERIVED DIMENSIONS
     -------------------------------------------------------------------------- */
  const dimensions: Dimension[] = [
    {
      key: 'problem',
      label: { en: 'Problem Strength', ar: 'حدة المشكلة' },
      score: problemScore,
      rationale: {
        en: hasNegativeEvidence
          ? 'Validated customer interviews indicate the problem is low urgency or already tolerated with manual workarounds.'
          : hasInterviews
            ? 'Direct interviews confirm recurring, quantifiable financial or operational loss.'
            : 'Unvalidated hypothesis: stated pain is plausible but lacks direct empirical verification.',
        ar: hasNegativeEvidence
          ? 'تفيد المقابلات الميدانية بأن المشكلة منخفضة الأولوية أو يتم التعايش معها حالياً.'
          : hasInterviews
            ? 'تؤكد المقابلات المباشرة وجود خسارة مالية أو تشغيلية متكررة وقابلة للقياس.'
            : 'فرضية غير مؤكدة: الألم المذكور منطقي لكنه يفتقر إلى إثبات تجريبي مباشر.'
      }
    },
    {
      key: 'audience',
      label: { en: 'Target Clarity', ar: 'وضوح الجمهور' },
      score: targetScore,
      rationale: {
        en: 'Evaluates whether the ideal customer profile and decision maker are sharply defined.',
        ar: 'تقييم مدى دقة تحديد شريحة العميل المثالي وصاحب قرار الشراء.'
      }
    },
    {
      key: 'solution',
      label: { en: 'Solution Fit', ar: 'ملاءمة الحل' },
      score: solutionScore,
      rationale: {
        en: 'Measures how directly the proposed product addresses root causes rather than symptoms.',
        ar: 'يقيس مدى استهداف الحل المقترح للأسباب الجذرية للمشكلة بدلاً من الأعراض.'
      }
    },
    {
      key: 'value_prop',
      label: { en: 'Value Proposition', ar: 'القيمة المقترحة' },
      score: valuePropScore,
      rationale: {
        en: 'Clarity of the core benefit delivered in time, cost, or risk reduction.',
        ar: 'وضوح الفائدة الجوهرية المقدمة من حيث توفير الوقت أو التكلفة أو تقليل المخاطر.'
      }
    },
    {
      key: 'monetization',
      label: { en: 'Revenue Model', ar: 'نموذج الإيرادات' },
      score: monetizationScore,
      rationale: {
        en: hasNegativeEvidence
          ? 'Pricing model faces severe friction; market participants rejected stated pricing.'
          : hasPayment
            ? 'Validated by paying pilot commitments or monetary deposits.'
            : 'Plausible recurring model, but remains an untested monetization assumption.',
        ar: hasNegativeEvidence
          ? 'يواجه نموذج التسعير مقاومة شديدة؛ رفض المشاركون دفع المقابل المقترح.'
          : hasPayment
            ? 'مثبت عبر التزامات دفع مالي أو عربون مسبق للتجربة.'
            : 'نموذج دوري منطقي، لكنه يظل فرضية تسعير لم تخضع للاختبار بعد.'
      }
    },
    {
      key: 'willingness_to_pay',
      label: { en: 'Willingness to Pay', ar: 'الاستعداد للدفع' },
      score: wtpScore,
      rationale: {
        en: hasNegativeEvidence
          ? 'Target users explicitly indicated zero willingness to pay for a dedicated solution.'
          : hasPayment
            ? 'Direct empirical backing confirming customers will exchange budget for this solution.'
            : 'No financial transactions recorded; willingness to pay is strictly an assumption.',
        ar: hasNegativeEvidence
          ? 'أكد المستخدمون المستهدفون صراحة عدم استعدادهم للدفع مقابل حل مخصص.'
          : hasPayment
            ? 'دعم عملي مباشر يؤكد استعداد العملاء لدفع ميزانية فعلية مقابل هذا الحل.'
            : 'لم تُسجل أي معاملات مالية؛ الاستعداد للدفع يظل مجرد افتراض لم يُختبر.'
      }
    },
    {
      key: 'competition',
      label: { en: 'Competitive Context', ar: 'السياق التنافسي' },
      score: compScore,
      rationale: {
        en: 'Awareness of incumbent tools, manual habits, and low-cost WhatsApp/Excel alternatives.',
        ar: 'مستوى فهم الأدوات الحالية والبدائل اليدوية وقوة عادات واتساب وإكسل القائمة.'
      }
    },
    {
      key: 'differentiation',
      label: { en: 'Differentiation', ar: 'التمايز' },
      score: diffScore,
      rationale: {
        en: 'Distinct operational automation distinguishing the approach from passive reminders.',
        ar: 'الميزة التشغيلية المؤتمتة التي تميز الطرح عن التذكيرات اليدوية العادية.'
      }
    },
    {
      key: 'scalability',
      label: { en: 'Scalability', ar: 'القابلية للتوسع' },
      score: scalabilityScore,
      rationale: {
        en: 'Ease of expanding customer volume without linear escalation in manual overhead.',
        ar: 'سهولة مضاعفة أعداد العملاء دون زيادة خطية مماثلة في التكاليف التشغيلية.'
      }
    },
    {
      key: 'defensibility',
      label: { en: 'Defensibility & Moat', ar: 'الحصانة والميزة التراكمية' },
      score: defensibilityScore,
      rationale: {
        en: 'Switching costs, workflow lock-in, and proprietary operational integration barriers.',
        ar: 'تكلفة الانتقال للبدائل والاندماج في مسار العمل والموانع التنافسية التراكمية.'
      }
    }
  ];

  // Strongest / Weakest signals
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const strongestSignals: SignalItem[] = sorted.slice(0, 2).map(d => ({
    label: d.label,
    detail: {
      en: `${d.label.en} scored ${d.score}/100 based on strategic positioning and stated problem clarity.`,
      ar: `حقق بُعد ${d.label.ar} نتيجة ${d.score}/100 بناءً على التموضع الاستراتيجي ووضوح المشكلة.`
    }
  }));

  const weakestSignals: SignalItem[] = sorted.slice(-2).map(d => ({
    label: d.label,
    detail: {
      en: `${d.label.en} stands at ${d.score}/100 due to unverified empirical assumptions or negative market signals.`,
      ar: `يقف بُعد ${d.label.ar} عند ${d.score}/100 بسبب اعتماده على افتراضات غير مختبرة أو إشارات سوقية سلبية.`
    }
  }));

  // Next Best Action (driven by missing evidence!)
  const nextBestAction = {
    title: {
      en: hasNegativeEvidence
        ? 'Pivot problem focus or interview adjacent customer segments'
        : hasPayment
          ? 'Accelerate repeatable customer acquisition pipeline'
          : hasInterviews
            ? 'Execute pre-sale deposit or commitment test'
            : 'Conduct 10 structured customer discovery interviews',
      ar: hasNegativeEvidence
        ? 'إعادة توجيه صياغة المشكلة أو إجراء مقابلات مع شرائح عملاء بديلة'
        : hasPayment
          ? 'تسريع مسار استقطاب العملاء المتكرر والقابل للتوسع'
          : hasInterviews
            ? 'تنفيذ اختبار الحجز المسبق أو التزام الدفع الفعلي'
            : 'إجراء 10 مقابلات منظمة لاستكشاف العملاء المستهدفين'
    },
    why: {
      en: hasNegativeEvidence
        ? 'Negative evidence confirms that the current target segment does not feel acute willingness to pay; pivoting prevents wasted build effort.'
        : 'Attacks the single largest unknown identified in the current evidence graph, preventing premature scaling before validation.',
      ar: hasNegativeEvidence
        ? 'تؤكد الأدلة السلبية أن الشريحة الحالية لا تبدي رغبة ملحة بالدفع؛ مما يستوجب إعادة توجيه الجهد قبل الاستثمار البرمجي.'
        : 'يستهدف أكبر نقطة عدم يقين محددة في مخطط الأدلة الحالي لمنع الهدر والتوسع قبل التحقق.'
    },
    checklist: [
      {
        en: 'Draft unbiased discovery questions focused on past behavior, not hypothetical promises',
        ar: 'صياغة أسئلة استكشاف غير متحيزة تركز على السلوك الماضي بدلاً من الوعود المستقبلية'
      },
      {
        en: 'Document the exact financial or hourly cost currently lost to the problem',
        ar: 'توثيق التكلفة المالية أو الساعات الضائعة حالياً بسبب المشكلة بدقة'
      },
      {
        en: 'Ask for a concrete commitment (LOI, credit card authorization, or calendar deposit)',
        ar: 'طلب التزام ملموس (خطاب نوايا، تفويض دفع، أو عربون مسبق للموعد)'
      }
    ]
  };

  // Facts, Assumptions & Missing Evidence
  const facts: SignalItem[] = [
    {
      label: { en: 'Stated Target Segment', ar: 'الشريحة المستهدفة المحددة' },
      detail: {
        en: 'Explicit customer profile captured from the input description and stage context.',
        ar: 'ملف العميل المحدد المستخرج من وصف الفكرة وسياق مرحلتها.'
      }
    },
    ...(hasInterviews ? [{
      label: { en: 'Primary Discovery Conducted', ar: 'إجراء مقابلات استكشافية مباشرة' },
      detail: {
        en: 'Direct founder conversations recorded with active market participants.',
        ar: 'تسجيل حوارات ومقابلات مباشرة للمؤسس مع أطراف فاعلة في السوق.'
      }
    }] : []),
    ...(hasPayment ? [{
      label: { en: 'Monetary Transaction Verified', ar: 'تحقق عمليات دفع مالي' },
      detail: {
        en: 'Financial consideration received, providing Level-0 willingness-to-pay evidence.',
        ar: 'استلام مبالغ مالية فعلية مما يقدم إثباتاً من المستوى الأول للاستعداد للدفع.'
      }
    }] : []),
    ...(hasNegativeEvidence ? [{
      label: { en: 'Negative Market Feedback Verified', ar: 'توثيق ملاحظات سوقية سلبية' },
      detail: {
        en: 'Empirical discovery recorded explicit disinterest or refusal to pay from participants.',
        ar: 'سجلت المقابلات الاستكشافية عزوفاً صريحاً أو رفضاً للدفع من قبل المشاركين.'
      }
    }] : [])
  ];

  const assumptions: SignalItem[] = extracted.items
    .filter(i => i.type === 'assumption')
    .map(i => ({
      label: {
        en: i.claim.en.slice(0, 40) + '...',
        ar: i.claim.ar.slice(0, 40) + '...'
      },
      detail: i.claim
    }));

  const missingEvidence: SignalItem[] = extracted.items
    .filter(i => i.type === 'unknown')
    .map(i => ({
      label: {
        en: i.claim.en.slice(0, 40) + '...',
        ar: i.claim.ar.slice(0, 40) + '...'
      },
      detail: i.claim
    }));

  const risks: SignalItem[] = [
    ...(hasNegativeEvidence ? [{
      label: { en: 'Critical Viability Threat: Low Willingness to Pay', ar: 'تهديد حرج للجدوى: انعدام الاستعداد للدفع' },
      detail: {
        en: 'Validated participant feedback shows buyers will not allocate budget to solve this pain.',
        ar: 'أظهرت ملاحظات المشاركين أن المشترين لن يخصصوا ميزانية لحل هذه المشكلة.'
      }
    }] : [{
      label: { en: 'Low Urgency / "Vitamin" Risk', ar: 'خطر انخفاض الإلحاح (حل تكميلي)' },
      detail: {
        en: 'If the problem cost is minor, customers will tolerate existing friction rather than pay.',
        ar: 'إذا كانت تكلفة المشكلة طفيفة، سيفضل العملاء التعايش معها بدلاً من دفع تكلفة الحل.'
      }
    }]),
    {
      label: { en: 'Customer Acquisition Cost (CAC) Escalation', ar: 'خطر ارتفاع تكلفة استقطاب العميل' },
      detail: {
        en: 'High fragmentation among small independent businesses often requires labor-intensive direct sales.',
        ar: 'تشتت الشركات الصغيرة المستقلة يتطلب جهود بيع مباشر مكلفة قد تتجاوز العائد المتوقع.'
      }
    }
  ];

  const opportunities: SignalItem[] = [
    {
      label: { en: 'Workflow Lock-in Potential', ar: 'فرصة الاندماج العميق في مسار العمل' },
      detail: {
        en: 'Becoming the daily system of record creates durable retention and high switching costs.',
        ar: 'التحول إلى النظام اليومي الأساسي يخلق استبقاءً دائماً وتكلفة انتقال مرتفعة للبدائل.'
      }
    },
    {
      label: { en: 'Fintech / Payment Expansion', ar: 'فرصة التوسع في المدفوعات والخدمات المالية' },
      detail: {
        en: 'Facilitating customer deposits and transactions opens transactional revenue beyond SaaS.',
        ar: 'تسهيل دفع العربون والمشتريات يفتح مصادر دخل تجارية ومعاملاتية بجانب رسوم الاشتراك.'
      }
    }
  ];

  const validationPriorities: SignalItem[] = [
    {
      label: { en: '01. Confirm Quantified Problem Cost', ar: '01. إثبات التكلفة المالية للمشكلة' },
      detail: {
        en: 'Determine the exact dollars lost monthly to establish a clear return on investment (ROI).',
        ar: 'تحديد الخسارة المالية الشهرية بالدولار لبناء عائد استثمار مقنع وواضح للعميل.'
      }
    },
    {
      label: { en: '02. Run Pre-Order Deposit Experiment', ar: '02. إطلاق اختبار دفع العربون المسبق' },
      detail: {
        en: 'Secure 3 signed commitment deposits to convert willingness-to-pay assumption into evidence.',
        ar: 'الحصول على 3 عربونات دفع فعلية لتحويل فرضية الاستعداد للدفع إلى دليل واقعي.'
      }
    }
  ];

  const recommendations: SignalItem[] = [
    {
      label: { en: 'Prioritize Direct Proof Over Form Filling', ar: 'أولوية الإثبات المباشر على التوصيف النظري' },
      detail: {
        en: 'Do not spend weeks polishing the product interface until 10 target buyers confirm acute urgency.',
        ar: 'تجنب استنزاف الوقت في تلميع واجهة المنتج قبل أن يؤكد 10 مشترين حاجتهم الملحة والماسة إليه.'
      }
    },
    {
      label: { en: 'Anchor Pricing to Value Created', ar: 'ربط التسعير بالقيمة المنقذة أو المضافة' },
      detail: {
        en: 'Price as a fraction of saved revenue rather than a generic arbitrary SaaS fee.',
        ar: 'حدد التسعير كنسبة من الأموال أو الوقت المسترجع بدلاً من اشتراك برمجي اعتباطي.'
      }
    }
  ];

  const titleWords = desc.trim().split(/\s+/).slice(0, 4).join(' ');

  // Dynamic explanations that honestly explain the separated metrics
  const confidenceExplanation: LocalizedString = {
    en: contradictionFound
      ? 'Confidence heavily penalized due to contradiction between reported absence of discovery and assertions of verified customer demand.'
      : hasNegativeEvidence
        ? `Confidence elevated to ${confidence}% by structured customer interviews, but market feedback was negative: target users stated this problem is not a priority.`
        : hasPayment
          ? `High evidence confidence of ${confidence}% backed by primary discovery interviews and verified paid pilot commitments.`
          : hasInterviews
            ? `Moderate confidence of ${confidence}% supported by primary customer interviews, but constrained by unverified willingness to pay.`
            : `Evidence confidence is limited to ${confidence}%: this concept is an unvalidated hypothesis without recorded customer interviews, pilot tests, or paid commitments. Completing answers clarifies the hypothesis but does not validate the market.`,
    ar: contradictionFound
      ? 'تم تقييد مستوى الثقة بسبب وجود تعارض بين الإقرار بغياب استكشاف العملاء وادعاء التحقق من رغبتهم.'
      : hasNegativeEvidence
        ? `ارتفعت الثقة إلى ${confidence}% بفضل وجود مقابلات استكشافية حقيقية، لكن الملاحظات جاءت سلبية: أكد المستخدمون أن المشكلة ليست أولوية.`
        : hasPayment
          ? `ثقة أدلة عالية بلغت ${confidence}% مدعومة بمقابلات استكشافية مباشرة والتزامات دفع تجريبية موثقة.`
          : hasInterviews
            ? `ثقة متوسطة بلغت ${confidence}% مدعومة بمقابلات مباشرة، ولكن يحدها غياب الإثبات التجاري للاستعداد للدفع.`
            : `الثقة في الأدلة محدودة بنسبة ${confidence}%: الفكرة مجرد فرضية لم تخضع لمقابلات استكشافية أو تجارب تشغيلية أو التزام مالي. استيفاء الإجابات يوضح الفرضية ولا يثبت السوق.`
  };

  const scoreExplanation: LocalizedString = {
    en: `Opportunity Score of ${opportunityScore}/100 measures strategic promise across 10 deterministic dimensions. Evidence Confidence (${confidence}%) measures proof, and Readiness (${readinessScore}%) measures preparedness for testing.`,
    ar: `تقيس نتيجة الفرصة ${opportunityScore}/100 الجاذبية الاستراتيجية عبر 10 أبعاد حتمية. بينما تقيس ثقة الأدلة (${confidence}%) حجم الإثبات الواقعي، وتقيس الجاهزية (${readinessScore}%) مدى الاستعداد لإجراء الاختبار.`
  };

  const readinessExplanation: LocalizedString = {
    en: `Validation Readiness of ${readinessScore}/100 indicates how clearly the customer profile, problem mechanism, and testable assumptions are defined. High readiness means you are ready to test, not that the idea is proven.`,
    ar: `تشير جاهزية التحقق ${readinessScore}/100 إلى مدى دقة صياغة ملف العميل وميكانيكية المشكلة والافتراضات القابلة للاختبار. الجاهزية العالية تعني أنك مستعد للاختبار، وليست دليلاً على إثبات الفكرة.`
  };

  return {
    title: {
      en: titleWords || 'New Opportunity',
      ar: titleWords || 'فرصة جديدة'
    },
    summary: {
      en: `Derived intelligence assessment evaluating ${desc.slice(0, 110)}... Distinguishes Opportunity (${opportunityScore}/100), Evidence Confidence (${confidence}%), and Validation Readiness (${readinessScore}%).`,
      ar: `تقييم ذكاء استنتاجي يفحص ${desc.slice(0, 110)}... يفصل بوضوح بين جاذبية الفرصة (${opportunityScore}/100)، وثقة الأدلة (${confidence}%)، وجاهزية التحقق (${readinessScore}%).`
    },
    generatedAt: new Date().toISOString(),
    opportunityScore,
    confidence,
    confidenceScore: confidence,
    inputReadiness,
    readinessScore,
    confidenceExplanation,
    scoreExplanation,
    readinessExplanation,
    disclaimer: {
      en: 'Scores reflect current analytical inputs and empirical evidence. They assist founder decision-making and do not guarantee venture outcomes.',
      ar: 'النتائج تعكس المدخلات التحليلية والأدلة الواقعية المتوفرة؛ وهي وسيلة لمساعدة المؤسس وليست ضماناً للنجاح التجاري.'
    },
    dimensions,
    strongestSignals,
    weakestSignals,
    nextBestAction,
    recommendations,
    facts,
    assumptions,
    missingEvidence,
    risks,
    opportunities,
    validationPriorities,
    evidence: extracted.items,
    evidenceSummary: extracted.summary
  };
}
