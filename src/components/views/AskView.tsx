import React, { useState, useEffect, useRef } from 'react';
import { Idea } from '../../types';
import { StructuredResponse } from '../StructuredResponse';
import {
  Sparkles,
  ShieldAlert,
  FlaskConical,
  CircleDollarSign,
  Send,
  Trash2,
  Copy,
  Check,
  Zap,
  Brain,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Info
} from 'lucide-react';

export type ChatRoleId = 'evaluator' | 'market' | 'critic' | 'legal' | 'experimenter' | 'economist';

export type GeminiModelId =
  | 'gemini-3.8-flash'
  | 'gemini-3.5-flash'
  | 'gemini-3.5-flash-lite'
  | 'gemini-3.1-flash-lite'
  | 'gemini-3.1-pro-preview';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  roleId?: ChatRoleId;
  modelUsed?: string;
  isError?: boolean;
}

interface ChatRoleConfig {
  id: ChatRoleId;
  name: { en: string; ar: string };
  badge: { en: string; ar: string };
  tagline: { en: string; ar: string };
  recommendedModel: GeminiModelId;
  defaultSuggestions: { en: string[]; ar: string[] };
}

const ROLES: Record<ChatRoleId, ChatRoleConfig> = {
  evaluator: {
    id: 'evaluator',
    name: {
      en: 'Evidence & Opportunity Evaluator',
      ar: 'محلل الفرص والأدلة التجريبية'
    },
    badge: {
      en: 'Principal Evaluator',
      ar: 'كبير المحللين'
    },
    tagline: {
      en: 'Separates unverified assumptions from proof & measures readiness',
      ar: 'يفصل الافتراضات غير المثبتة عن الأدلة الحقيقية ويقيس الجاهزية'
    },
    recommendedModel: 'gemini-3.5-flash-lite',
    defaultSuggestions: {
      en: [
        'What is my biggest unverified assumption right now?',
        'How do I elevate my confidence score above 75%?',
        'Is my willingness-to-pay hypothesis validated by actual transactions?',
        'What evidence would disprove that this problem is urgent?'
      ],
      ar: [
        'ما هو أكبر افتراض غير مثبت في مشروعي حالياً؟',
        'كيف يمكنني رفع نسبة الثقة بالأدلة إلى أكثر من 75%؟',
        'هل فرضية الاستعداد للدفع مدعومة بمعاملات نقدية فعلية؟',
        'ما هو الدليل الذي قد يثبت أن هذه المشكلة ليست عاجلة؟'
      ]
    }
  },
  market: {
    id: 'market',
    name: {
      en: 'Market & Growth Strategist',
      ar: 'خبير السوق والنمو الاستراتيجي'
    },
    badge: {
      en: 'Market Strategist',
      ar: 'خبير السوق والنمو'
    },
    tagline: {
      en: 'Analyzes market dynamics, acquisition loops & competitive moats',
      ar: 'يحلل ديناميكيات السوق وقنوات الاستحواذ والميزات التنافسية'
    },
    recommendedModel: 'gemini-3.5-flash-lite',
    defaultSuggestions: {
      en: [
        'What is our ideal beachhead market for fast early traction?',
        'How do we build an unfair competitive moat against larger players?',
        'What high-efficiency Go-To-Market channel should we prioritize?',
        'How can we trigger viral or organic growth loops?'
      ],
      ar: [
        'ما هو السوق الأولي الأنسب لتحقيق انطلاقة سريعة؟',
        'كيف نبني ميزة تنافسية صعبة التقليد ضد الشركات الكبرى؟',
        'ما هي قناة اقتحام السوق الأكثر كفاءة التي يجب أن نبدأ بها؟',
        'كيف نصمم حلقة نمو عضوي أو انتشاري للمشروع؟'
      ]
    }
  },
  critic: {
    id: 'critic',
    name: {
      en: "Devil's Advocate & Risk Auditor",
      ar: 'محامي الشيطان ومراجع المخاطر'
    },
    badge: {
      en: 'Risk Auditor',
      ar: 'مراجع المخاطر'
    },
    tagline: {
      en: 'Uncovers lethal blindspots, churn traps & distribution friction',
      ar: 'يكشف مكامن الخطر الخفية، وفخاخ التسرب، وعقبات التوزيع'
    },
    recommendedModel: 'gemini-3.5-flash-lite',
    defaultSuggestions: {
      en: [
        'What are the top 3 lethal reasons this idea could fail in month 3?',
        "Why haven't incumbents or large players already built this?",
        'Where will customer acquisition cost (CAC) unexpectedly spike?',
        'What high-friction switching barrier am I ignoring?'
      ],
      ar: [
        'ما هي أخطر 3 أسباب قد تؤدي لتعثر الفكرة في الأشهر الثلاثة الأولى؟',
        'لماذا لم تقم الشركات القائمة أو المنافسون الكبار ببناء هذا الحل بعد؟',
        'أين سترتفع تكلفة الاستحواذ على العملاء بشكل غير متوقع؟',
        'ما هي عقبة التبديل التي أتجاهلها حالياً لدى العميل المستهدف؟'
      ]
    }
  },
  legal: {
    id: 'legal',
    name: {
      en: 'Legal & Compliance Advisor',
      ar: 'مستشار الشؤون القانونية وتنظيم الأعمال'
    },
    badge: {
      en: 'Legal Advisor',
      ar: 'مستشار قانوني وتنظيمي'
    },
    tagline: {
      en: 'Navigates regulatory hurdles, IP protection & liability risks',
      ar: 'يحدد التحديات التنظيمية ومتطلبات حماية الملكية الفكرية والمسؤولية'
    },
    recommendedModel: 'gemini-3.1-flash-lite',
    defaultSuggestions: {
      en: [
        'What regulatory hurdles or licenses do we need to launch legally?',
        'How should we structure intellectual property (IP) and founder agreements?',
        'What data privacy and GDPR/local compliance traps must we avoid?',
        'How do we draft robust Terms of Service and liability limits?'
      ],
      ar: [
        'ما هي التراخيص والتحديات التنظيمية المطلوبة لإطلاق المشروع قانونياً؟',
        'كيف نحمي الملكية الفكرية وننظم اتفاقيات المؤسسين؟',
        'ما هي فخاخ خصوصية البيانات والامتثال المحلي التي يجب تجنبها؟',
        'كيف نصيغ شروط خدمة وإخلاء مسؤولية محكمة؟'
      ]
    }
  },
  experimenter: {
    id: 'experimenter',
    name: {
      en: 'Validation Experiment Architect',
      ar: 'مهندس تجارب التحقق الرشيقة'
    },
    badge: {
      en: 'Experiment Architect',
      ar: 'مهندس التجارب'
    },
    tagline: {
      en: 'Designs 48-72h falsification tests with clear quantitative thresholds',
      ar: 'يصمم اختبارات إثبات ودحض رشيقة خلال 48-72 ساعة بمعايير رقمية'
    },
    recommendedModel: 'gemini-3.5-flash-lite',
    defaultSuggestions: {
      en: [
        'Design a 48-hour pre-order landing page test with pass/fail metrics.',
        'Give me 5 Mom-Test style discovery questions for prospective buyers.',
        'How can I execute a Concierge / manual MVP without writing any code?',
        'What low-cost experiment validates customer commitment this week?'
      ],
      ar: [
        'صمم لي اختبار صفحة هبوط لطلب مسبق خلال 48 ساعة بمعايير نجاح ورسوب واضحة.',
        'أعطني 5 أسئلة استكشافية بأسلوب The Mom Test للمشترين المحتملين.',
        'كيف أطلق نموذج خدمة يدوي (Concierge MVP) بدون كتابة سطر كود؟',
        'ما هي التجربة الأقل تكلفة لاختبار التزام العميل الفعلي هذا الأسبوع؟'
      ]
    }
  },
  economist: {
    id: 'economist',
    name: {
      en: 'Unit Economics & Pricing Strategist',
      ar: 'خبير اقتصاديات الوحدة واستراتيجيات التسعير'
    },
    badge: {
      en: 'Pricing Strategist',
      ar: 'خبير التسعير'
    },
    tagline: {
      en: 'Models pricing power, payback periods, LTV/CAC & margin sustainability',
      ar: 'يحلل قوة التسعير وفترات الاسترداد والقيمة الدائمة وهوامش الربح'
    },
    recommendedModel: 'gemini-3.1-flash-lite',
    defaultSuggestions: {
      en: [
        'How should I structure my pricing tiers (subscription vs usage-based)?',
        'What is my maximum allowable CAC based on expected margins?',
        'How do I test premium pricing without alienating early adopters?',
        'Calculate my payback period under low initial sales volume.'
      ],
      ar: [
        'كيف أهيكل باقات التسعير (اشتراك ثابت أم تسعير حسب الاستهلاك)؟',
        'ما هو الحد الأقصى لتكلفة الاستحواذ المسموح بها لضمان ربحية الوحدة؟',
        'كيف أختبر تسعيراً متميزاً (Premium) دون تنفير أوائل المستخدمين؟',
        'احسب لي فترة استرداد تكلفة العميل في ظل حجم مبيعات أولي منخفض.'
      ]
    }
  }
};

const MODEL_CONFIGS: Record<GeminiModelId, { label: string; descEn: string; descAr: string; tag: string }> = {
  'gemini-3.8-flash': {
    label: 'gemini-3.8-flash',
    tag: 'Balanced',
    descEn: 'Default recommended model: balanced speed and high analytical fidelity.',
    descAr: 'النموذج الافتراضي المعتمد: توازن فائق بين السرعة والدقة التحليلية.'
  },
  'gemini-3.5-flash': {
    label: 'gemini-3.5-flash',
    tag: 'General',
    descEn: 'Ideal for general planning, experiment templates, and structured tasks.',
    descAr: 'مثالي للمهام العامة، وبناء قوالب التجارب، والتخطيط المنظم.'
  },
  'gemini-3.5-flash-lite': {
    label: 'gemini-3.5-flash-lite',
    tag: 'Fast',
    descEn: 'Extremely low latency for immediate responses and rapid iteration.',
    descAr: 'أسرع نموذج للمهام الفورية والرد السريع.'
  },
  'gemini-3.1-flash-lite': {
    label: 'gemini-3.1-flash-lite',
    tag: 'Fast',
    descEn: 'Ultra-low latency for rapid math, quick feedback, and fast iterations.',
    descAr: 'سرعة استجابة فائقة للحسابات السريعة والملاحظات الفورية.'
  },
  'gemini-3.1-pro-preview': {
    label: 'gemini-3.1-pro-preview',
    tag: 'Complex',
    descEn: 'Deep multi-step reasoning for risk stress-testing and complex architecture.',
    descAr: 'استدلال عميق متعدد المراحل لتحليل المخاطر الشديدة والأنظمة المعقدة.'
  }
};

interface AskViewProps {
  isArabic: boolean;
  ideas: Idea[];
  selectedIdea: Idea;
  onSelectIdea: (idea: Idea) => void;
  onOpenReport: (idea: Idea) => void;
}

export const AskView: React.FC<AskViewProps> = ({
  isArabic,
  ideas,
  selectedIdea,
  onSelectIdea,
  onOpenReport,
}) => {
  const [activeRole, setActiveRole] = useState<ChatRoleId>('evaluator');
  const [activeModel, setActiveModel] = useState<GeminiModelId>('gemini-3.8-flash');
  const [isAutoModel, setIsAutoModel] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initial welcome message grounded in selected idea & active role
  const getInitialMessage = (roleId: ChatRoleId, idea: Idea): ChatMessage => {
    const title = isArabic ? idea.title.ar : idea.title.en;
    const oppScore = idea.opportunityScore;
    const confScore = idea.confidence;
    const readScore = idea.readinessScore ?? idea.latestAnalysis.readinessScore ?? idea.latestAnalysis.inputReadiness;

    let greetingText = '';
    if (roleId === 'evaluator') {
      greetingText = isArabic
        ? `أهلاً بك! بصفتي كبير المحللين ومقيم الفرص لـ "${title}"، أنا هنا لتقييم فرصتك بموضوعية. الفكرة مسجلة بنتيجة فرصة ${oppScore}/100، وثقة مبنية على الأدلة بنسبة ${confScore}%، وجاهزية تنفيذ ${readScore}%. اسألني عن أدلة الاستعداد للدفع، أو الفرضيات الأخطر، أو كيفية تحويل الافتراضات إلى براهين رقمية.`
        : `Welcome! As your Principal Opportunity Evaluator for "${title}", I am grounded in your report data. This opportunity has an Opportunity Score of ${oppScore}/100, an Evidence Confidence of ${confScore}%, and an Execution Readiness of ${readScore}%. Ask me how to validate customer commitment, stress-test your assumptions, or turn verbal interest into empirical proof.`;
    } else if (roleId === 'market') {
      greetingText = isArabic
        ? `مرحباً بك! بصفتي خبير السوق والنمو الاستراتيجي لـ "${title}"، أنا جاهز لتحليل شرائح السوق المستهدفة، قنوات الاستحواذ (GTM)، وبناء ميزات تنافسية صعبة التقليد. ما هو التحدي التسويقي أو التنافسي الذي ترغب في معالجته؟`
        : `Welcome! As your Market & Growth Strategist for "${title}", I'm ready to analyze your beachhead market, acquisition loops, and competitive differentiation. What growth hurdle shall we tackle first?`;
    } else if (roleId === 'critic') {
      greetingText = isArabic
        ? `مرحباً. بصفتي مراجع المخاطر ومحامي الشيطان لـ "${title}"، مهمتي هي فحص نقاط الضعف والمخاطر القاتلة قبل أن تستثمر مواردك. دعنا نختبر عقبات التوزيع، وتسرب العملاء، وقدرة المنافسين على تدمير هامشك الربحي. ما الذي يقلقك أكثر؟`
        : `Greetings. As your Devil's Advocate & Risk Auditor for "${title}", my job is to uncover lethal failure modes, distribution bottlenecks, and competitor counter-moves before capital is deployed. Where do you suspect your business model is most vulnerable?`;
    } else if (roleId === 'legal') {
      greetingText = isArabic
        ? `مرحباً! بصفتي مستشار الشؤون القانونية وتنظيم الأعمال لـ "${title}"، أنا هنا لمراجعة المتطلبات التنظيمية، استراتيجيات حماية الملكية الفكرية، شروط الخدمة، وإدارة مخاطر المسؤولية القانونية. ما هي استفساراتك القانونية أو التنظيمية؟`
        : `Welcome! As your Legal & Compliance Advisor for "${title}", I'm here to evaluate regulatory requirements, IP protection strategies, compliance traps, and liability mitigation. What legal considerations shall we review?`;
    } else if (roleId === 'experimenter') {
      greetingText = isArabic
        ? `أهلاً بك! بصفتي مهندس التجارب الرشيقة لـ "${title}"، أساعدك في صياغة اختبارات إثبات أو دحض سريعة قابلة للتنفيذ في 48 إلى 72 ساعة بميزانية شبه معدومة. ما هي الفرضية الأكثر خطورة التي تريد اختبارها اليوم؟`
        : `Hello! As your Validation Experiment Architect for "${title}", I turn fuzzy assumptions into high-signal 48-to-72 hour falsification tests with unambiguous pass/fail criteria. Which critical assumption should we design a test for first?`;
    } else {
      greetingText = isArabic
        ? `مرحباً! بصفتي خبير اقتصاديات الوحدة والتسعير لـ "${title}"، سأساعدك في ضبط معادلة الربحية: تكلفة الاستحواذ (CAC)، القيمة الدائمة للعميل (LTV)، وهامش المساهمة، واستراتيجية التسعير. هل ترغب في تدقيق التسعير المقترح أم حساب سقف تكلفة التسويق؟`
        : `Welcome! As your Unit Economics & Pricing Strategist for "${title}", I focus on the math of sustainable profit: CAC/LTV dynamics, gross margins, pricing architectures, and payback velocity. Shall we audit your pricing model or determine your maximum sustainable CAC?`;
    }

    return {
      id: `m-init-${Date.now()}`,
      sender: 'assistant',
      text: greetingText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleId,
      modelUsed: ROLES[roleId].recommendedModel
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    getInitialMessage('evaluator', selectedIdea)
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Cycling analytical steps while waiting
  useEffect(() => {
    if (!isTyping) {
      setAnalysisStep(0);
      return;
    }
    const timer = setInterval(() => {
      setAnalysisStep((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(timer);
  }, [isTyping]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle role change
  const handleRoleChange = (roleId: ChatRoleId) => {
    setActiveRole(roleId);
    if (isAutoModel) {
      setActiveModel(ROLES[roleId].recommendedModel);
    }
    // Append a context transition notification or reset
    const switchMsg: ChatMessage = {
      id: `switch-${Date.now()}`,
      sender: 'assistant',
      text: isArabic
        ? `[تم التبديل إلى دور: ${ROLES[roleId].name.ar}]. كيف يمكنني مساعدتك الآن؟`
        : `[Switched role to: ${ROLES[roleId].name.en}]. How can I assist you now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roleId,
      modelUsed: isAutoModel ? ROLES[roleId].recommendedModel : activeModel
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  // Handle manual model change
  const handleModelChange = (modelId: GeminiModelId) => {
    setActiveModel(modelId);
    setIsAutoModel(false);
  };

  // Clear conversation
  const handleClearChat = () => {
    setMessages([getInitialMessage(activeRole, selectedIdea)]);
  };

  // Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export full transcript
  const handleExportChat = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}${m.roleId ? ` (${m.roleId})` : ''}:\n${m.text}\n`)
      .join('\n');
    navigator.clipboard.writeText(transcript);
    alert(isArabic ? 'تم نسخ المحادثة الكاملة إلى الحافظة' : 'Full conversation transcript copied to clipboard!');
  };

  // Send message to server Gemini endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query.trim(),
          history: messages.map((m) => ({
            sender: m.sender,
            text: m.text
          })),
          roleId: activeRole,
          model: activeModel,
          language: isArabic ? 'ar' : 'en',
          ideaContext: {
            title: isArabic ? selectedIdea.title.ar : selectedIdea.title.en,
            stage: selectedIdea.stage,
            opportunityScore: selectedIdea.opportunityScore,
            confidence: selectedIdea.confidence,
            readinessScore:
              selectedIdea.readinessScore ??
              selectedIdea.latestAnalysis.readinessScore ??
              selectedIdea.latestAnalysis.inputReadiness,
            strongestSignal: isArabic
              ? selectedIdea.latestAnalysis.strongestSignals[0]?.label.ar
              : selectedIdea.latestAnalysis.strongestSignals[0]?.label.en,
            weakestSignal: isArabic
              ? selectedIdea.latestAnalysis.weakestSignals[0]?.label.ar
              : selectedIdea.latestAnalysis.weakestSignals[0]?.label.en,
            nextBestAction: isArabic
              ? selectedIdea.latestAnalysis.nextBestAction?.title.ar
              : selectedIdea.latestAnalysis.nextBestAction?.title.en
          }
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server returned non-JSON response (${response.status}): ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (data.ok) {
        const botMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleId: activeRole,
          modelUsed: data.model || activeModel
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          text: data.fallbackText || data.error || (isArabic ? 'حدث خطأ في استجابة النموذج' : 'Error generating response'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleId: activeRole,
          modelUsed: data.model || activeModel,
          isError: !data.fallbackText
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackBotMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: isArabic
          ? 'تعذر الاتصال بخادم المحادثة. يرجى التأكد من تشغيل الخادم وتوفر مفتاح GEMINI_API_KEY.'
          : 'Could not connect to the chat service. Please ensure the server is active with GEMINI_API_KEY.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roleId: activeRole,
        modelUsed: activeModel,
        isError: true
      };
      setMessages((prev) => [...prev, fallbackBotMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const currentRole = ROLES[activeRole];
  const activeModelConfig = MODEL_CONFIGS[activeModel];
  const suggestions = currentRole.defaultSuggestions[isArabic ? 'ar' : 'en'];

  const getRoleIcon = (roleId: ChatRoleId) => {
    switch (roleId) {
      case 'evaluator':
        return <Sparkles className="w-4 h-4" />;
      case 'market':
        return <Layers className="w-4 h-4" />;
      case 'critic':
        return <ShieldAlert className="w-4 h-4" />;
      case 'legal':
        return <Brain className="w-4 h-4" />;
      case 'experimenter':
        return <FlaskConical className="w-4 h-4" />;
      case 'economist':
        return <CircleDollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="view-stack ask-view">
      <div className="ask-layout">
        {/* Context Sidebar */}
        <aside className="panel ask-context">
          <span className="panel-kicker">
            {isArabic ? 'سياق التقرير النشط' : 'ACTIVE REPORT GROUNDING'}
          </span>

          {/* Idea Selector Dropdown */}
          <div style={{ marginTop: '0.6rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', display: 'block' }}>
              {isArabic ? 'اختر الفكرة للمناقشة:' : 'Discussing Idea:'}
            </label>
            <select
              value={selectedIdea.id}
              onChange={(e) => {
                const found = ideas.find((i) => i.id === e.target.value);
                if (found) {
                  onSelectIdea(found);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: `context-${Date.now()}`,
                      sender: 'assistant',
                      text: isArabic
                        ? `[تم تحديث سياق النقاش إلى: "${found.title.ar}" (نتيجة الفرصة: ${found.opportunityScore}/100، الثقة بالأدلة: ${found.confidence}%).]`
                        : `[Updated conversation context to: "${found.title.en}" (Opportunity Score: ${found.opportunityScore}/100, Evidence Confidence: ${found.confidence}%).]`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      roleId: activeRole,
                      modelUsed: activeModel
                    }
                  ]);
                }
              }}
              style={{
                width: '100%',
                padding: '0.65rem',
                background: 'var(--navy-3)',
                color: 'var(--ink)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            >
              {ideas.map((i) => (
                <option key={i.id} value={i.id}>
                  {isArabic ? i.title.ar : i.title.en}
                </option>
              ))}
            </select>
          </div>

          {/* 3 Separated KPI Badges for Active Idea */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {isArabic ? 'نتيجة الفرصة' : 'Opportunity Score'}
              </span>
              <strong style={{ fontSize: '18px', color: 'var(--cyan)' }}>
                {selectedIdea.opportunityScore}/100
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {isArabic ? 'الثقة بالأدلة' : 'Evidence Confidence'}
              </span>
              <strong style={{ fontSize: '18px', color: '#79c0ff' }}>
                {selectedIdea.confidence}%
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                {isArabic ? 'جاهزية التنفيذ' : 'Execution Readiness'}
              </span>
              <strong style={{ fontSize: '18px', color: '#52e8ac' }}>
                {selectedIdea.readinessScore ?? selectedIdea.latestAnalysis.readinessScore ?? selectedIdea.latestAnalysis.inputReadiness}%
              </strong>
            </div>
          </div>

          {/* Context Signals */}
          <div className="context-facts" style={{ marginTop: '1rem' }}>
            <div>
              <small style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isArabic ? 'أقوى إشارة مسجلة' : 'STRONGEST SIGNAL'}
              </small>
              <p style={{ fontSize: '12px', marginTop: '0.2rem', color: 'var(--ink)' }}>
                {isArabic
                  ? selectedIdea.latestAnalysis.strongestSignals[0]?.label.ar
                  : selectedIdea.latestAnalysis.strongestSignals[0]?.label.en}
              </p>
            </div>

            <div style={{ marginTop: '0.75rem' }}>
              <small style={{ color: 'var(--muted)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {isArabic ? 'أكبر فجوة أو خطر' : 'LARGEST GAP'}
              </small>
              <p style={{ fontSize: '12px', marginTop: '0.2rem', color: '#ff7b72' }}>
                {isArabic
                  ? selectedIdea.latestAnalysis.weakestSignals[0]?.label.ar
                  : selectedIdea.latestAnalysis.weakestSignals[0]?.label.en}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '1.25rem', fontSize: '12px', gap: '6px' }}
            onClick={() => onOpenReport(selectedIdea)}
          >
            <span>{isArabic ? 'عرض التقرير الكامل' : 'Open Full Intelligence Report'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {/* System Instruction Note */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: '8px',
              alignItems: 'flex-start'
            }}
          >
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', lineHeight: '1.4' }}>
              {isArabic
                ? 'يتم حقن بيانات التقرير النشط مع التعليمات التوجيهية لكل دور لضمان إجابات دقيقة لا تختلق أرقاماً غير مثبتة.'
                : 'Active idea signals and role-specific system instructions are injected on every turn to prevent hallucinations.'}
            </p>
          </div>
        </aside>

        {/* Main Chat Panel */}
        <section className="panel chat-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Chat Control Topbar: Roles & Model Selection */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--line)',
              background: 'rgba(7, 17, 31, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {/* Top row: Role selection buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600, marginRight: '4px' }}>
                  {isArabic ? 'الدور الاستشاري:' : 'Advisor Role:'}
                </span>
                {(Object.keys(ROLES) as ChatRoleId[]).map((roleId) => {
                  const role = ROLES[roleId];
                  const isActive = activeRole === roleId;
                  return (
                    <button
                      key={roleId}
                      type="button"
                      onClick={() => handleRoleChange(roleId)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: isActive ? 'rgba(67, 230, 210, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        color: isActive ? 'var(--cyan)' : 'var(--muted)',
                        border: isActive ? '1px solid rgba(67, 230, 210, 0.4)' : '1px solid var(--line)'
                      }}
                      title={isArabic ? role.tagline.ar : role.tagline.en}
                    >
                      {getRoleIcon(roleId)}
                      <span>{isArabic ? role.badge.ar : role.badge.en}</span>
                    </button>
                  );
                })}
              </div>

              {/* Utility buttons: Clear chat & Export */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleExportChat}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    color: 'var(--muted)',
                    cursor: 'pointer'
                  }}
                  title={isArabic ? 'نسخ نص المحادثة' : 'Export transcript'}
                >
                  <Copy className="w-3 h-3" />
                  <span className="hidden sm:inline">{isArabic ? 'تصدير' : 'Export'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearChat}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    background: 'transparent',
                    border: '1px solid var(--line)',
                    color: 'var(--muted)',
                    cursor: 'pointer'
                  }}
                  title={isArabic ? 'مسح المحادثة وبدء محادثة جديدة' : 'Clear chat history'}
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">{isArabic ? 'مسح' : 'Clear'}</span>
                </button>
              </div>
            </div>

            {/* Second row: Active role tagline */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: 'var(--muted)'
              }}
            >
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
                {isArabic ? currentRole.name.ar : currentRole.name.en}:
              </span>
              <span style={{ color: 'var(--muted)' }}>
                {isArabic ? currentRole.tagline.ar : currentRole.tagline.en}
              </span>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          <div
            className="chat-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              maxHeight: 'calc(100vh - 380px)',
              minHeight: '360px'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`chat-message ${isUser ? 'chat-user' : 'chat-assistant'}`}
                  style={{
                    display: 'flex',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    gap: '10px'
                  }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(67, 230, 210, 0.2), rgba(29, 155, 240, 0.2))',
                        border: '1px solid rgba(67, 230, 210, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--cyan)',
                        flexShrink: 0
                      }}
                    >
                      {msg.roleId ? getRoleIcon(msg.roleId) : <Sparkles className="w-4 h-4" />}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      background: isUser
                        ? 'linear-gradient(135deg, #1d9bf0, #1377b8)'
                        : msg.isError
                        ? 'rgba(120, 20, 30, 0.5)'
                        : 'var(--navy-3)',
                      color: isUser ? '#fff' : 'var(--ink)',
                      border: isUser ? 'none' : '1px solid var(--line)',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '14px 18px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* Assistant message header with Role and Model badge */}
                    {!isUser && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '10px',
                          color: 'var(--muted)',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          paddingBottom: '6px',
                          marginBottom: '6px'
                        }}
                      >
                        <strong style={{ color: 'var(--cyan)', fontWeight: 700 }}>
                          {msg.roleId ? ROLES[msg.roleId]?.badge[isArabic ? 'ar' : 'en'] : (isArabic ? 'محلل الفرص الاستراتيجية' : 'Senior Opportunity Analyst')}
                        </strong>
                        <span style={{ marginInlineStart: 'auto', fontSize: '9px' }}>{msg.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: copiedId === msg.id ? '#52e8ac' : 'var(--muted-2)',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          title={isArabic ? 'نسخ النص' : 'Copy message'}
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    )}

                    {isUser ? (
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '13px' }}>
                        {msg.text}
                      </div>
                    ) : (
                      <StructuredResponse content={msg.text} isArabic={isArabic} />
                    )}

                    {isUser && (
                      <small style={{ alignSelf: 'flex-end', fontSize: '9px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                        {msg.timestamp}
                      </small>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="chat-message chat-assistant" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(67, 230, 210, 0.2), rgba(29, 155, 240, 0.2))',
                    border: '1px solid rgba(67, 230, 210, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cyan)'
                  }}
                >
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <div
                  style={{
                    background: 'var(--navy-3)',
                    border: '1px solid rgba(67, 230, 210, 0.3)',
                    borderRadius: '14px',
                    padding: '12px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '12px',
                    color: 'var(--muted)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>
                      {isArabic ? currentRole.badge.ar : currentRole.badge.en}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="animate-pulse">✨</span>
                      {isArabic ? 'المحلل الخبير يفكر...' : 'Senior Analyst is thinking...'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--ink)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>
                      {isArabic
                        ? [
                            `تحليل مؤشرات الفكرة وقاعدة الأدلة التجريبية...`,
                            `تقييم ديناميكيات السوق ومخاطر الجدوى...`,
                            `صياغة التوصيات الإستراتيجية وهندسة الحلول المخصصة...`
                          ][analysisStep]
                        : [
                            `Analyzing empirical idea indicators & evidence baseline...`,
                            `Cross-referencing market dynamics & valuation risks...`,
                            `Synthesizing expert strategic blueprint & action items...`
                          ][analysisStep]}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Role-Specific Quick Suggestions Row */}
          <div
            className="suggestion-row"
            style={{
              padding: '10px 20px',
              borderTop: '1px solid var(--line)',
              background: 'rgba(4, 10, 19, 0.8)',
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSendMessage(s)}
                disabled={isTyping}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--line)',
                  borderRadius: '20px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  color: 'var(--muted)',
                  whiteSpace: 'nowrap',
                  cursor: isTyping ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Chat Composer Form */}
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--line)',
              background: 'var(--navy-2)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isTyping}
              placeholder={
                isArabic
                  ? `اسأل ${currentRole.badge.ar} عن فكرتك أو فرضياتك...`
                  : `Ask ${currentRole.badge.en} about your opportunity or assumptions...`
              }
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'var(--navy-1)',
                border: '1px solid var(--line)',
                color: 'var(--ink)',
                fontSize: '13px'
              }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!inputMessage.trim() || isTyping}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '46px',
                height: '46px',
                borderRadius: '10px'
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
