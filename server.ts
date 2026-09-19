import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Roles and their system instructions
const ROLE_INSTRUCTIONS: Record<string, { en: string; ar: string; defaultModel: string }> = {
  evaluator: {
    en: `You are IdeaScout's Principal Opportunity & Evidence Evaluator. 
Your mandate is to provide deeply bespoke, empirically grounded, and creative analytical scrutiny for startup ideas. Avoid generic canned templates or copy-paste responses; every answer must directly target the specific nuances of the user's active idea context.
Guidelines:
1. Rigorously separate unverified assumptions from empirical proof. Verbal enthusiasm and survey responses are weak signals; paid pre-orders, signed commitments, customer retention, and actual customer usage are strong evidence.
2. Ground your answers precisely in the active idea context provided.
3. Challenge wishful thinking constructively with sharp intellectual depth.
4. Keep answers engaging, highly actionable, and structured with clear markdown.`,
    ar: `أنت كبير محللي الفرص والأدلة في منصة IdeaScout.
مهمتك هي تقديم تحليل عميق ومخصص ومبني على الأدلة التجريبية لفكرة المشروع، مع تجنب أي صيغ جاهزة أو إجابات مكررة (نسخ ولصق). يجب أن تكون كل إجابة مفصلة، ذكية، وموجهة خصيصاً لتفاصيل الفكرة المطروحة.
إرشادات:
1. فرّق بصرامة بين الافتراضات غير المثبتة والأدلة الحقيقية (الدفع المسبق والالتزامات الفعلية مقابل الوعود والآراء).
2. ابنِ تحليلك تماماً على سياق ومؤشرات الفكرة النشطة.
3. واجه التفاؤل المفرط بنقاط نقد بناءة ومحددة.
4. اكتب بأسلوب احترافي، إبداعي، ومنسق بوضوح.`,
    defaultModel: "gemini-3.8-flash",
  },
  market: {
    en: `You are IdeaScout's Market & Growth Strategist.
Your mandate is to analyze market dynamics, target audience segments, competitive moats, and Go-To-Market (GTM) loops with creative commercial insight. Avoid generic boilerplate text; give precise, tailored strategies for the active idea.
Guidelines:
1. Identify immediate beachhead markets and high-efficiency acquisition channels.
2. Evaluate competitive differentiation and network effects.
3. Outline clear, innovative growth tactics suited to the specific business model.`,
    ar: `أنت خبير السوق والنمو الاستراتيجي في IdeaScout.
مهمتك هي تحليل ديناميكيات السوق، شرائح الجمهور المستهدف، الميزات التنافسية، واستراتيجيات اقتحام السوق (GTM) برؤية تجارية إبداعية وبعيدة عن الأنماط الجاهزة.
إرشادات:
1. حدد الأسواق المستهدفة الأولية (Beachhead Market) وقنوات الاستحواذ عالية الكفاءة.
2. قيّم التميز التنافسي وتأثيرات الشبكة.
3. اقترح تكتيكات نمو مبتكرة تناسب طبيعة الفكرة تحديداً.`,
    defaultModel: "gemini-3.8-flash",
  },
  critic: {
    en: `You are IdeaScout's Devil's Advocate & Risk Auditor.
Your mandate is to stress-test startup ideas, uncover hidden failure modes, distribution bottlenecks, and customer acquisition traps with uncompromising intellectual rigor. Never use generic startup clichés; offer sharp, bespoke critique tailored to the specific business model.
Guidelines:
1. Examine switching costs, competitive moats, platform dependencies, and churn drivers.
2. Ask sharp Socratic questions that expose fragile premises.
3. Be brutally honest yet constructive, providing concrete risk mitigations.`,
    ar: `أنت مراجع المخاطر ومحامي الشيطان في IdeaScout.
مهمتك هي تفكيك فكرة المشروع واكتشاف مكامن الخطر الخفية، وعقبات التوزيع، وفخاخ الاستحواذ بعمق تحليلي لا يرحم وبدون أي عبارات تقليدية مكررة.
إرشادات:
1. افحص تكلفة التبديل، واعتمادية المنصات، وعوامل تسرب العملاء.
2. اطرح أسئلة سقراطية دقيقة تكشف هشاشة الافتراضات.
3. كن صريحاً وبناءً مع تقديم بدائل لتجنب المخاطر المحددة.`,
    defaultModel: "gemini-3.1-pro-preview",
  },
  legal: {
    en: `You are IdeaScout's Legal & Compliance Advisor.
Your mandate is to analyze regulatory hurdles, data privacy requirements (GDPR/local laws), IP protection strategies, liability risks, and compliance traps for startup ideas. Provide tailored, pragmatic guidance avoiding generic templates.
Guidelines:
1. Identify key regulatory frameworks and licensing requirements relevant to the business model.
2. Highlight intellectual property (IP) protection and trade secret strategies.
3. Outline liability mitigation and terms of service considerations.`,
    ar: `أنت مستشار الشؤون القانونية وتنظيم الأعمال في IdeaScout.
مهمتك هي تحليل التحديات التنظيمية، متطلبات خصوصية البيانات، حماية الملكية الفكرية، ومخاطر المسؤولية القانونية المرتبطة بالفكرة بشكل عملي ومخصص.
إرشادات:
1. حدد الأطر التنظيمية والتراخيص المطلوبة بدقة لطبيعة المشروع.
2. وضح استراتيجيات حماية الملكية الفكرية والأسرار التجارية.
3. اقترح آليات تقليل المخاطر القانونية وشروط الخدمة.`,
    defaultModel: "gemini-3.1-flash-lite",
  },
  experimenter: {
    en: `You are IdeaScout's Lean Experiment Architect.
Your mandate is to design fast, low-cost falsification experiments that test riskiest assumptions in 48-72 hours. Avoid generic advice; give exact, step-by-step experiment blueprints tailored to the user's idea.
Guidelines:
1. For every challenge, design a concrete test (e.g. Concierge MVP, Fake Door landing page, pre-order campaign).
2. Specify Riskiest Assumption, Test Setup, and Quantitative Pass/Fail threshold.
3. Prioritize testing customer willingness to pay before writing code.`,
    ar: `أنت مهندس التجارب الرشيقة في IdeaScout.
مهمتك هي تصميم تجارب اختبار سريعة ومنخفضة التكلفة وقابلة للإثبات أو الدحض خلال 48 إلى 72 ساعة بخطوات عملية ومخصصة تماماً للفكرة.
إرشادات:
1. صمم اختبارات عملية واضحة (صفحة طلب مسبق، خدمة يدوية، مقابلات).
2. حدد الفرضية الأخطر، خطوات التنفيذ، ومعيار نجاح رقمي دقيق.
3. ركز دائماً على التحقق من الاستعداد للدفع.`,
    defaultModel: "gemini-3.8-flash",
  },
  economist: {
    en: `You are IdeaScout's Unit Economics & Pricing Strategist.
Your mandate is to evaluate pricing models, customer lifetime value (LTV), acquisition cost (CAC), payback periods, and gross margin sustainability with rigorous financial insight. Avoid generic formulas; give custom calculations and benchmarks.
Guidelines:
1. Evaluate pricing models (subscription, usage-based, marketplace take-rate) vs cost-plus.
2. Audit margin health and payback velocity.
3. Give crisp, numbers-oriented recommendations.`,
    ar: `أنت خبير اقتصاديات الوحدة واستراتيجيات التسعير في IdeaScout.
مهمتك هي تحليل استدامة نموذج التسعير، LTV، CAC، وفترات الاسترداد بدقة مالية عالية وحسابات مخصصة للفكرة.
إرشادات:
1. قيّم نموذج التسعير المناسب بدقة.
2. دقق في متانة الهوامش وسرعة الاسترداد.
3. قدّم أرقاماً وتوصيات مالية محكمة.`,
    defaultModel: "gemini-3.1-flash-lite",
  },
};

// Key validation tracking to prevent repetitive failing requests
let cachedKeyValidity: { key: string; isValid: boolean; checkedAt: number } | null = null;

function isKeyInvalidError(err: any): boolean {
  if (!err) return false;
  const msg = (err?.message || "").toLowerCase();
  const status = err?.status;
  const details = err?.error?.details || [];
  const reason = details[0]?.reason || "";

  return (
    reason === "API_KEY_INVALID" ||
    reason === "API_KEY_SERVICE_BLOCKED" ||
    msg.includes("api key not valid") ||
    msg.includes("api_key_invalid") ||
    msg.includes("unauthenticated") ||
    (status === 400 && msg.includes("api key")) ||
    status === 401 ||
    (status === 403 && msg.includes("api key"))
  );
}

// Server-side contextual question generator for guaranteed uptime
function generateServerFallbackQuestions(description: string, stage: string) {
  const lower = description.toLowerCase();

  if (
    lower.includes("ai") ||
    lower.includes("llm") ||
    lower.includes("agent") ||
    lower.includes("gpt") ||
    lower.includes("model") ||
    lower.includes("ذكاء")
  ) {
    return [
      {
        id: "ai-q1",
        prompt: {
          en: "What proprietary data flywheel or exclusive workflow fine-tuning prevents foundation model providers from trivializing your solution in their next release?",
          ar: "ما هي حلقة تدفق البيانات الحصرية أو مسار التخصيص الدقيق الذي يمنع مزودي النماذج الكبرى من استنساخ ميزتك في تحديثهم القادم؟"
        },
        rationale: {
          en: "Probes defensibility against thin-wrapper commoditization and API supplier dependencies.",
          ar: "يفحص الحماية التنافسية ضد ضعف التطبيقات البسيطة واعتمادية مزودي واجهات البرمجة."
        }
      },
      {
        id: "ai-q2",
        prompt: {
          en: "What is your estimated token inference and hosting cost per completed user action, and how does that preserve 70%+ software gross margins?",
          ar: "ما هي تكلفة استدلال الرموز والاستضافة التقديرية لكل مهمة ينجزها المستخدم، وكيف تحافظ على هوامش ربح برمجية تتجاوز 70%؟"
        },
        rationale: {
          en: "Exposes unit economic viability under high API token consumption and real-world usage bursts.",
          ar: "يكشف الجدوى الاقتصادية للوحدة تحت استهلاك الرموز الكثيف وضغط الاستخدام الفعلي."
        }
      },
      {
        id: "ai-q3",
        prompt: {
          en: "How have you measured hallucination rates and output reliability in high-stakes decisions with prospective buyers?",
          ar: "كيف قمت بقياس نسبة الهلوسة ودقة المخرجات في القرارات الحساسة مع المشترين المحتملين؟"
        },
        rationale: {
          en: "Tests user trust thresholds and customer retention risks before widespread release.",
          ar: "يختبر عتبات ثقة المستخدمين ومخاطر تسرب العملاء قبل الإطلاق التجاري الواسع."
        }
      }
    ];
  }

  if (
    lower.includes("fintech") ||
    lower.includes("pay") ||
    lower.includes("wallet") ||
    lower.includes("bank") ||
    lower.includes("money") ||
    lower.includes("crypto") ||
    lower.includes("مال") ||
    lower.includes("دفع")
  ) {
    return [
      {
        id: "fin-q1",
        prompt: {
          en: "What are your regulatory licensing, PCI-DSS compliance, and banking partnership prerequisites before onboarding your first paying customer?",
          ar: "ما هي المتطلبات التنظيمية والتراخيص ومعايير الامتثال وشراكات البنوك المطلوبة قبل قبول أول عميل يدفع؟"
        },
        rationale: {
          en: "Identifies hard legal barriers to entry and partner dependencies that could delay launch by months.",
          ar: "يحدد العوائق التنظيمية القاسية وشراكات الطرف الثالث التي قد تعطل الإطلاق لعدة أشهر."
        }
      },
      {
        id: "fin-q2",
        prompt: {
          en: "How will your take-rate or fee structure absorb payment gateway interchange and transaction fraud reserve fees?",
          ar: "كيف ستتحمل نسبة عمولتك أو رسومك تكاليف بوابات الدفع واحتياطيات الاحتيال والمعاملات المتنازع عليها؟"
        },
        rationale: {
          en: "Validates net revenue margins when processing actual transactional volumes.",
          ar: "يتحقق من هوامش صافي الإيرادات عند معالجة أحجام مالية حقيقية."
        }
      },
      {
        id: "fin-q3",
        prompt: {
          en: "Why would prospective customers trust an unproven startup with sensitive funds or financial data rather than existing financial institutions?",
          ar: "لماذا قد يأتمن العملاء شركة ناشئة جديدة على أموالهم أو بياناتهم المالية الحساسة بدلاً من المؤسسات المعتمدة؟"
        },
        rationale: {
          en: "Evaluates the trust deficit and customer switching friction in financial services.",
          ar: "يقيم حاجز الثقة وتكلفة انتقال العملاء في قطاع الخدمات المالية."
        }
      }
    ];
  }

  if (
    lower.includes("b2b") ||
    lower.includes("saas") ||
    lower.includes("enterprise") ||
    lower.includes("workflow") ||
    lower.includes("شركات") ||
    lower.includes("مؤسس")
  ) {
    return [
      {
        id: "b2b-q1",
        prompt: {
          en: "Who is the ultimate economic buyer holding the budget, and how does their approval process differ from the daily end-user of your product?",
          ar: "من هو صاحب القرار المالي الفعلي الذي يملك الميزانية، وكيف يختلف مسار موافقته عن المستخدم اليومي للمنتج؟"
        },
        rationale: {
          en: "Clarifies enterprise sales cycles, procurement friction, and budget holder alignment.",
          ar: "يوضح دورات مبيعات الشركات وإجراءات الشراء ومواءمة حامل الميزانية."
        }
      },
      {
        id: "b2b-q2",
        prompt: {
          en: "What existing legacy tool or manual spreadsheet workflow are you displacing, and what is the exact switching friction?",
          ar: "ما هي الأداة الحالية أو جدول البيانات اليدوي الذي تستبدله، وما هي تكلفة الانتقال الفعلية للعميل؟"
        },
        rationale: {
          en: "Gauges inertia of the status quo and switching barrier severity.",
          ar: "يقيس مدى قوة مقاومة التغيير وتكلفة استبدال الأدوات المعتادة."
        }
      },
      {
        id: "b2b-q3",
        prompt: {
          en: "Can you secure 3 signed letters of intent (LOIs) or paid pilots before finalizing engineering?",
          ar: "هل تستطيع تأمين 3 خطابات نوايا موقعة (LOIs) أو مشاريع تجريبية مدفوعة قبل إتمام التطوير التقني؟"
        },
        rationale: {
          en: "Distinguishes polite verbal praise from genuine B2B commercial intent.",
          ar: "يميز الإشادة اللفظية المجاملة عن الالتزام التجاري التعاقدي الفعلي."
        }
      }
    ];
  }

  // General default validation questions
  return [
    {
      id: "gen-q1",
      prompt: {
        en: "What empirical behavior (e.g. cash deposits, signed contracts, repeat usage) demonstrates that customers urgently want this rather than just thinking it's a nice idea?",
        ar: "ما هو السلوك الفعلي الملموس (عربون مدفوع، عقد موقع، استخدام متكرر) الذي يثبت حاجة العملاء الملحة بدلاً من مجرد إعجاب نظري بالفكرة؟"
      },
      rationale: {
        en: "Separates weak verbal feedback from high-conviction commercial traction.",
        ar: "يفصل بين الآراء اللفظية الضعيفة والطلب التجاري المثبت بالدفع والالتزام."
      }
    },
    {
      id: "gen-q2",
      prompt: {
        en: "What is your primary scalable customer acquisition channel, and what is the estimated customer acquisition cost (CAC) relative to lifetime value (LTV)?",
        ar: "ما هي القناة الرئيسية القابلة للتوسع لجلب العملاء، وما هي تكلفة الاستحواذ المقدرة (CAC) مقارنة بالقيمة الدائمة للعميل (LTV)؟"
      },
      rationale: {
        en: "Uncovers distribution feasibility and protects against customer acquisition bankruptcy.",
        ar: "يكشف جدوى استراتيجية التوزيع ويحمي المشروع من تعثر تكاليف التسويق والاستحواذ."
      }
    },
    {
      id: "gen-q3",
      prompt: {
        en: "What is the single riskiest assumption that, if disproven this week, would invalidate the premise of this business?",
        ar: "ما هي الفرضية الأخطر التي إذا ثبت عدم صحتها هذا الأسبوع، ستسقط جدوى نموذج العمل بالكامل؟"
      },
      rationale: {
        en: "Focuses immediate founder effort on falsification testing rather than premature scaling.",
        ar: "يوجه جهد المؤسس لاختبار دحض الفرضية الأساسية قبل إهدار الموارد في بناء متسرع."
      }
    }
  ];
}

// Contextual fallback response generator for /api/chat
function generateContextualChatResponse(
  roleId: string,
  userMessage: string,
  ideaContext: any,
  language: string
): string {
  const isAr = language === "ar";
  const ideaTitle = ideaContext?.title || (isAr ? "فكرتك الريادية" : "your venture");
  const oppScore = ideaContext?.opportunityScore ?? 75;
  const confidence = ideaContext?.confidence ?? 60;
  const readiness = ideaContext?.readinessScore ?? 65;

  if (roleId === "market") {
    return isAr
      ? `### تقييم استراتيجية السوق والنمو: ${ideaTitle}

بناءً على المعطيات المسجلة لفكرتك، إليك التحليل المباشر لفرصتك في السوق:

1. **تحديد السوق الأولية (Beachhead Market):**
   تجنب استهداف السوق الواسعة من اليوم الأول. اختر شريحة ضيقة تعاني من المشكلة بشكل حاد ولديها ميزانية مخصصة للحل فوراً.

2. **قنوات الاستحواذ عالية الكفاءة:**
   في هذه المرحلة، ركز على قنوات مباشرة منخفضة التكلفة (Outbound Direct Outreach والمجتمعات المتخصصة) لتأمين أول 10 إلى 50 عميلاً دون حرق ميزانيات إعلانية مدفوعة.

3. **الحماية التنافسية (Moat):**
   الميزة التنافسية الحقيقية لا تكمن في الفكرة بحد ذاتها، بل في سرعة دورة التغذية الراجعة، وشبكة العلاقات الحصرية، ودمج الخدمة عميقاً في روتين العميل اليومي.`
      : `### Market & Growth Strategy Audit: ${ideaTitle}

Based on the context of **${ideaTitle}** (Opportunity Score: ${oppScore}/100, Confidence: ${confidence}%):

1. **Beachhead Market Definition:**
   Avoid attempting broad market capture immediately. Narrow your initial target down to an acute niche where the problem causes active operational or financial pain right now.

2. **Capital-Efficient Acquisition Loops:**
   Prioritize direct organic outreach, niche community engagement, and founder-led sales before relying on paid ad channels with uncertain CAC payback periods.

3. **Defensibility Moats:**
   True differentiation will come from proprietary workflow lock-in, proprietary feedback loops, and switching friction rather than features that can be quickly replicated.`;
  }

  if (roleId === "critic") {
    return isAr
      ? `### تدقيق المخاطر وتفكيك الفرضيات: ${ideaTitle}

بصفتي محامي الشيطان ومراجع المخاطر، إليك النقاط الحرجة التي تتطلب فحصاً غير مجامل:

1. **فخ الاستحواذ وتكلفة العميل (CAC):**
   أكبر خطر يواجه المشروعات في هذه المرحلة هو افتراض أن العملاء سيبحثون عن الحل بمفردهم. هل حسبت تكلفة إقناع العميل بترك عادته الحالية؟

2. **حاجز مقاومة التغيير (Status Quo Friction):**
   المنافس الحقيقي لك ليس شركة أخرى، بل اعتياد العميل على الوضع القائم حتى لو كان غير مثالي.

3. **أول خطوة لتفادي المخاطر:**
   اختبر استعداد العميل للدفع المسبق قبل كتابة أي كود أو التوسع في المصروفات.`
      : `### Devil's Advocate & Risk Audit: ${ideaTitle}

Critical stress-test for **${ideaTitle}**:

1. **Customer Inertia & Switching Friction:**
   Your primary competition is rarely a direct rival—it is almost always the customer's habit of doing nothing or using free, imperfect spreadsheets.

2. **Unit Economics & Margin Compression:**
   Verify whether your projected pricing accounts for gross margin dilution from third-party vendor APIs, customer onboarding support, and churn replacement.

3. **Immediate Mitigation:**
   Force an immediate customer commitment test (pre-orders or deposits) to validate urgency before committing capital.`;
  }

  if (roleId === "experimenter") {
    return isAr
      ? `### مخطط تجارب التحقق الرشيقة (48-72 ساعة): ${ideaTitle}

1. **الفرضية الأخطر:**
   "العميل المستهدف مستعد لدفع مقابل مادي فعلي لحل هذه المشكلة عبر خدمتنا."

2. **تصميم الاختبار السريع (Fake Door / Concierge MVP):**
   - قم بإنشاء صفحة هبوط من صفحة واحدة تحتوي على القيمة الجوهرية فقط وزر "طلب مسبق / حجز استشارة مدفوعة".
   - أرسل الرابط إلى 30-50 شخصاً من جمهورك المستهدف تحديداً.

3. **معيار النجاح الرقمي (Pass/Fail Threshold):**
   - نسبة نقر تتجاوز 15% على زر الدفع، وتأمين ما لا يقل عن 3 طلبات مسبقة أو التزامات كتابية موثقة خلال 72 ساعة.`
      : `### Lean 48-72 Hour Experiment Blueprint: ${ideaTitle}

1. **Riskiest Assumption:**
   "Target buyers experience sufficient pain that they will commit budget or payment before a full product exists."

2. **Experiment Setup (Concierge / Pre-Order Test):**
   - Create a single-page value proposition brief with an explicit paid commitment or pre-order deposit option.
   - Conduct 15 direct discovery outreach conversations targeting exact ideal buyer profiles.

3. **Quantitative Pass/Fail Criterion:**
   - At least 3 paid pre-orders or formal signed Letters of Intent (LOIs) secured within 72 hours.`;
  }

  if (roleId === "economist") {
    return isAr
      ? `### تدقيق اقتصاديات الوحدة ونموذج التسعير: ${ideaTitle}

1. **هيكلة باقات التسعير:**
   تجنب التسعير المنخفض لمجرد كسب عملاء سريعين. التسعير المتميز يفرز العملاء الجادين ويمنحك هامشاً كافياً لتقديم خدمة عالية الجودة.

2. **معادلة LTV إلى CAC المستهدفة:**
   احرص على أن تكون نسبة القيمة الدائمة للعميل مقارنة بتكلفة الاستحواذ (LTV:CAC) لا تقل عن 3:1، مع استرداد تكلفة الاستحواذ في أقل من 6 إلى 9 أشهر.

3. **حماية هوامش الربح الإجمالية:**
   تأكد من بقاء الهامش الإجمالي فوق 70% بعد خصم تكاليف الخوادم والواجهات البرمجية والدعم الفني.`
      : `### Unit Economics & Pricing Model Audit: ${ideaTitle}

1. **Pricing Power & Tiering:**
   Avoid underpricing to attract early interest. Higher baseline pricing filters for committed customers and funds responsive onboarding.

2. **LTV:CAC Target & Payback Velocity:**
   Target an LTV-to-CAC ratio of at least 3:1 with a customer acquisition payback period under 6–9 months.

3. **Gross Margin Protection:**
   Maintain gross margins above 70% by factoring in infrastructure, transaction fees, and vendor API unit costs.`;
  }

  // Default Evaluator response
  return isAr
    ? `### تحليل الفرصة والأدلة: ${ideaTitle}

مرحباً بك! بصفتي كبير محللي الفرص والأدلة، قمت بمراجعة سياق **${ideaTitle}** (مؤشر الفرصة: ${oppScore}/100، الثقة بالأدلة: ${confidence}%، الجاهزية: ${readiness}/100).

**أهم الملاحظات الاستراتيجية:**
1. **فرز الأدلة مقابل الافتراضات:**
   الاهتمام الشفهي والإطراء لا يعد دليلاً كافياً على نجاح المشروع. ما نحتاجه الآن هو أدلة قاطعة تتمثل في دفع مسبق، أو استخدام يومي متكرر، أو التزامات تعاقدية ملزمة.

2. **الخطوة التالية الموصى بها:**
   ${ideaContext?.nextBestAction ? `«${ideaContext.nextBestAction}»` : "قم بإجراء 5 مقابلات لاكتشاف المشكلة وفق أسلوب (The Mom Test) دون محاولة بيع الفكرة مبكراً."}

ما هو الجانب المحدد الذي تود اختباره أو استكشافه بتفصيل أكبر الآن؟`
    : `### Evidence & Opportunity Evaluation: ${ideaTitle}

Welcome. As IdeaScout's Principal Opportunity & Evidence Evaluator, I have analyzed **${ideaTitle}** (Opportunity Score: ${oppScore}/100, Confidence: ${confidence}%, Readiness: ${readiness}/100).

**Key Evaluation Takeaways:**
1. **Assumptions vs. Empirical Evidence:**
   Verbal interest and positive survey feedback are low-conviction signals. Prioritize high-conviction validation: customer pre-payments, recurring daily usage, or binding letters of intent.

2. **Recommended Action:**
   ${ideaContext?.nextBestAction ? `"${ideaContext.nextBestAction}"` : "Execute 5 customer discovery interviews using Mom-Test principles without pitching the solution prematurely."}

What specific risk, assumption, or channel would you like to stress-test together?`;
}

// Health check
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  const isKeyKnownBad = cachedKeyValidity?.key === process.env.GEMINI_API_KEY && !cachedKeyValidity?.isValid;

  res.json({
    status: "ok",
    hasApiKey: hasKey,
    apiKeyValid: hasKey && !isKeyKnownBad,
    models: [
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.1-pro-preview"
    ],
  });
});

// Dynamic LLM Question Generation API
app.post("/api/generate-questions", async (req, res) => {
  const { description, stage = "concept", language = "en" } = req.body;
  if (!description || typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ ok: false, error: "Description is required." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyKnownBad = apiKey && cachedKeyValidity?.key === apiKey && !cachedKeyValidity?.isValid && (Date.now() - cachedKeyValidity.checkedAt < 120000);

  // If API key is missing or known to be invalid, immediately return high-fidelity contextual questions
  if (!apiKey || isKeyKnownBad) {
    return res.json({
      ok: true,
      questions: generateServerFallbackQuestions(description, stage),
      source: "contextual_engine"
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const promptText = `You are IdeaScout's expert startup evaluator and questioning engine.
Analyze the following startup idea description and stage (${stage}):
"${description.trim()}"

Generate exactly 3 highly contextual, rigorous, domain-specific validation questions that challenge the founder's riskiest assumptions, unit economics, or distribution barriers.
Return ONLY valid JSON in the following exact format without markdown blocks or extra text:
[
  {
    "id": "q1",
    "prompt": {
      "en": "English question text here...",
      "ar": "Arabic question text here..."
    },
    "rationale": {
      "en": "English rationale here...",
      "ar": "Arabic rationale here..."
    }
  },
  {
    "id": "q2",
    "prompt": {
      "en": "English question text here...",
      "ar": "Arabic question text here..."
    },
    "rationale": {
      "en": "English rationale here...",
      "ar": "Arabic rationale here..."
    }
  },
  {
    "id": "q3",
    "prompt": {
      "en": "English question text here...",
      "ar": "Arabic question text here..."
    },
    "rationale": {
      "en": "English rationale here...",
      "ar": "Arabic rationale here..."
    }
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: { temperature: 0.7 }
    });

    const text = response?.text?.trim() || "";
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    const questions = JSON.parse(cleanJson);

    if (Array.isArray(questions) && questions.length >= 3) {
      cachedKeyValidity = { key: apiKey, isValid: true, checkedAt: Date.now() };
      return res.json({ ok: true, questions: questions.slice(0, 3), source: "gemini" });
    } else {
      return res.json({
        ok: true,
        questions: generateServerFallbackQuestions(description, stage),
        source: "contextual_engine"
      });
    }
  } catch (err: any) {
    if (isKeyInvalidError(err)) {
      cachedKeyValidity = { key: apiKey, isValid: false, checkedAt: Date.now() };
      console.info("[IdeaScout AI] GEMINI_API_KEY is invalid or missing in Settings > Secrets. Using contextual validation engine.");
    } else {
      console.info(`[IdeaScout AI] Model generation fallback: ${err?.message || "standard fallback"}`);
    }

    return res.json({
      ok: true,
      questions: generateServerFallbackQuestions(description, stage),
      source: "contextual_engine"
    });
  }
});

// Multi-turn Gemini Chat API
app.post("/api/chat", async (req, res) => {
  const {
    message,
    history = [],
    roleId = "evaluator",
    model,
    ideaContext,
    language = "en"
  } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ ok: false, error: "Message is required." });
  }

  // Determine target model
  const roleConfig = ROLE_INSTRUCTIONS[roleId] || ROLE_INSTRUCTIONS.evaluator;
  let targetModel = model || roleConfig.defaultModel || "gemini-3.8-flash";
  // Normalize model identifier if passed as "models/..."
  targetModel = targetModel.replace(/^models\//, "");
  // Replace any legacy 3.5 models with official 3.x models
  if (targetModel.includes("3.5")) {
    targetModel = "gemini-3.8-flash";
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const isKeyKnownBad = apiKey && cachedKeyValidity?.key === apiKey && !cachedKeyValidity?.isValid && (Date.now() - cachedKeyValidity.checkedAt < 120000);

  // If API key is not configured or known to be invalid, immediately return expert contextual analysis
  if (!apiKey || isKeyKnownBad) {
    return res.status(200).json({
      ok: true,
      text: generateContextualChatResponse(roleId, message, ideaContext, language),
      model: "contextual-analyst",
      roleId
    });
  }

  // Assemble system instruction
  const baseInstruction = language === "ar" ? roleConfig.ar : roleConfig.en;
  let systemInstruction = baseInstruction;

  if (ideaContext && typeof ideaContext === "object") {
    systemInstruction += `\n\n--- ACTIVE REPORT CONTEXT ---\n` +
      `Idea Title: ${ideaContext.title || "Untitled"}\n` +
      `Opportunity Score: ${ideaContext.opportunityScore ?? "N/A"}/100\n` +
      `Evidence Confidence Score: ${ideaContext.confidence ?? "N/A"}%\n` +
      `Execution Readiness Score: ${ideaContext.readinessScore ?? "N/A"}/100\n` +
      (ideaContext.strongestSignal ? `Strongest Signal: ${ideaContext.strongestSignal}\n` : "") +
      (ideaContext.weakestSignal ? `Largest Gap / Weakest Signal: ${ideaContext.weakestSignal}\n` : "") +
      (ideaContext.nextBestAction ? `Recommended Next Action: ${ideaContext.nextBestAction}\n` : "");
  }

  // Format conversation history for Gemini API
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history) && history.length > 0) {
    const recent = history.slice(-20);
    for (const item of recent) {
      if (!item.text || !item.text.trim()) continue;
      contents.push({
        role: item.sender === "user" ? "user" : "model",
        parts: [{ text: item.text.trim() }]
      });
    }
  }

  // Append the current turn
  contents.push({
    role: "user",
    parts: [{ text: message.trim() }]
  });

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const modelChain = [targetModel, "gemini-3.8-flash", "gemini-3.1-flash-lite"];
    const uniqueModels = Array.from(new Set(modelChain));
    let response;
    let currentModelUsed = targetModel;

    for (const modelCandidate of uniqueModels) {
      currentModelUsed = modelCandidate;
      let attempt = 0;
      let success = false;
      while (attempt < 2) {
        try {
          response = await ai.models.generateContent({
            model: modelCandidate,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (response?.text) {
            success = true;
            break;
          }
        } catch (err: any) {
          if (isKeyInvalidError(err)) {
            throw err; // Don't retry invalid keys
          }
          const status = err?.status;
          const code = err?.error?.code || err?.code;
          const isRetryable = status === 503 || status === 429 || code === 503 || code === 429;
          attempt++;
          if (!isRetryable || attempt >= 2) {
            break;
          }
          const delay = 300 + Math.random() * 200;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      if (success && response?.text) {
        break;
      }
    }

    if (response?.text) {
      cachedKeyValidity = { key: apiKey, isValid: true, checkedAt: Date.now() };
      return res.json({
        ok: true,
        text: response.text,
        model: currentModelUsed,
        roleId
      });
    }

    // If model didn't produce text, fall back to contextual response
    return res.json({
      ok: true,
      text: generateContextualChatResponse(roleId, message, ideaContext, language),
      model: "contextual-analyst",
      roleId
    });
  } catch (err: any) {
    if (isKeyInvalidError(err)) {
      cachedKeyValidity = { key: apiKey, isValid: false, checkedAt: Date.now() };
      console.info("[IdeaScout AI] Notice: GEMINI_API_KEY is invalid or missing in Settings > Secrets. Serving contextual response.");
    } else {
      console.info(`[IdeaScout AI] Chat fallback active: ${err?.message || "standard fallback"}`);
    }

    return res.status(200).json({
      ok: true,
      text: generateContextualChatResponse(roleId, message, ideaContext, language),
      model: "contextual-analyst",
      roleId
    });
  }
});

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`IdeaScout Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
