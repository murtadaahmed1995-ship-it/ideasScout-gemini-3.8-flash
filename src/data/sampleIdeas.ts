import { Idea, Profile } from '../types';
import { evaluateIdea } from '../utils/engine';

const salonQuestions = [
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

const salonAnswers = {
  q1: 'We interviewed 14 salon operators. On average, they experience 18-25 cancellations per month, translating to $1,400–$2,200 in unrecoverable chair time.',
  q2: 'Yes, 12 out of 14 owners rely on manual WhatsApp messages sent the evening before. 3 owners agreed to test our active pilot starting Monday.',
  q3: 'Five operators agreed to pay for a pilot deposit and committed to a $49/month tier once cancelled slots are auto-filled.'
};

const salonDesc = 'An automated scheduling and deposit management tool for independent salon owners that detects high-risk cancellation slots, secures micro-deposits, and auto-fills cancelled appointments via WhatsApp waitlists.';
const salonAnalysis = evaluateIdea(salonDesc, 'Validation', salonQuestions, salonAnswers);

const farmQuestions = [
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

const farmAnswers = {
  q1: 'We interviewed 8 head chefs and executive managers at independent farm-to-table restaurants across the metro area.',
  q2: '100% on-time 6:00 AM delivery window is non-negotiable; missing morning prep invalidates the entire menu.',
  q3: 'We have not completed any pilot orders yet, and no one has paid. Suppliers are hesitant without guaranteed volume.'
};

const farmDesc = 'A regional B2B ordering and consolidation platform enabling independent restaurants to purchase fresh produce directly from small local farms with guaranteed next-day morning delivery.';
const farmAnalysis = evaluateIdea(farmDesc, 'Research', farmQuestions, farmAnswers);

export const initialIdeas: Idea[] = [
  {
    id: 'idea-salon-01',
    isSample: true,
    source: 'demo_sample',
    title: {
      en: 'Salon No-Show Recovery Coordinator',
      ar: 'منسق استعادة المواعيد الفائتة للصالونات'
    },
    description: salonDesc,
    stage: 'Validation',
    tags: ['B2B', 'SaaS', 'Service-Industry', 'Automation'],
    opportunityScore: salonAnalysis.opportunityScore,
    confidence: salonAnalysis.confidence,
    readinessScore: salonAnalysis.readinessScore,
    createdAt: '2026-08-15T10:30:00.000Z',
    updatedAt: '2026-09-02T16:45:00.000Z',
    questions: salonQuestions,
    answers: salonAnswers,
    latestAnalysis: salonAnalysis,
    evolution: [
      {
        id: 'ev-1',
        opportunityScore: 71,
        confidence: 22,
        readinessScore: 68,
        createdAt: '2026-08-15T10:30:00.000Z',
        changeSummary: {
          en: 'Initial hypothesis created. High opportunity potential tempered by zero verified interviews.',
          ar: 'صياغة الفرضية الأولية. إمكانات واعدة لكنها مقيدة بغياب أي مقابلات استكشافية.'
        }
      },
      {
        id: 'ev-2',
        opportunityScore: salonAnalysis.opportunityScore,
        confidence: salonAnalysis.confidence,
        readinessScore: salonAnalysis.readinessScore,
        createdAt: '2026-09-02T16:45:00.000Z',
        changeSummary: {
          en: '14 customer discovery interviews completed, active pilot scheduled, and paid deposits logged. Confidence elevated significantly.',
          ar: 'إتمام 14 مقابلة عملاء، وجدولة تجربة نشطة، وتسجيل عربون دفع مالي. ارتفعت الثقة بشكل ملحوظ.'
        }
      }
    ]
  },
  {
    id: 'idea-farm-02',
    isSample: true,
    source: 'demo_sample',
    title: {
      en: 'Local Farm-to-Kitchen Wholesale Direct',
      ar: 'سوق الجملة المباشر من المزرعة للمطابخ'
    },
    description: farmDesc,
    stage: 'Research',
    tags: ['Marketplace', 'Supply-Chain', 'B2B', 'Food-Agri'],
    opportunityScore: farmAnalysis.opportunityScore,
    confidence: farmAnalysis.confidence,
    readinessScore: farmAnalysis.readinessScore,
    createdAt: '2026-08-20T14:15:00.000Z',
    updatedAt: '2026-08-28T09:20:00.000Z',
    questions: farmQuestions,
    answers: farmAnswers,
    latestAnalysis: farmAnalysis,
    evolution: [
      {
        id: 'ev-farm-1',
        opportunityScore: farmAnalysis.opportunityScore,
        confidence: farmAnalysis.confidence,
        readinessScore: farmAnalysis.readinessScore,
        createdAt: '2026-08-20T14:15:00.000Z',
        changeSummary: {
          en: 'Opportunity captured from kitchen discussions. Confidence restricted due to zero executed delivery trials or payment.',
          ar: 'تسجيل الفكرة من استطلاعات المطابخ؛ الثقة محدودة لعدم تنفيذ تجارب نقل فعلية أو عمليات دفع.'
        }
      }
    ]
  }
];

export const defaultProfile: Profile = {
  userId: '',
  name: '',
  email: '',
  role: '',
  timezone: 'UTC',
  language: 'en' as const,
  weeklyDigest: false,
  signalAlerts: false,
  emailVerified: false
};
