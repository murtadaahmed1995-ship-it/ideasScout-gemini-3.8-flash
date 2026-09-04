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
    defaultModel: "gemini-3.5-flash-lite",
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
    defaultModel: "gemini-3.5-flash",
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
    defaultModel: "gemini-3.5-flash",
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    models: [
      "gemini-3.8-flash",
      "gemini-3.5-flash",
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
  if (!apiKey) {
    return res.json({ ok: false, fallback: true });
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
      model: "gemini-3.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      config: { temperature: 0.7 }
    });

    const text = response?.text?.trim() || "";
    const cleanJson = text.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
    const questions = JSON.parse(cleanJson);

    if (Array.isArray(questions) && questions.length >= 3) {
      return res.json({ ok: true, questions: questions.slice(0, 3) });
    } else {
      return res.json({ ok: false, fallback: true });
    }
  } catch (err) {
    console.warn("LLM question generation failed, using rule-based fallback:", err);
    return res.json({ ok: false, fallback: true });
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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured in environment.");
    return res.status(200).json({
      ok: false,
      error: "GEMINI_API_KEY is not configured. Please add it to Settings > Secrets.",
      fallbackText: language === "ar"
        ? `[تنبيه: مفتاح Gemini API غير متوفر حالياً]. بناءً على السياق المسجل لـ "${ideaContext?.title || "فكرتك"}"، نوصي باختبار الاستعداد للدفع وحساب تكلفة الاستحواذ بدقة كخطوة تالية.`
        : `[Notice: GEMINI_API_KEY not configured]. Grounded in the report for "${ideaContext?.title || "this idea"}", the top priority is testing customer willingness to pay and validating core assumptions.`,
      model: targetModel,
      roleId
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const modelChain = ["gemini-3.5-flash-lite", targetModel, "gemini-3.5-flash"];
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
          const status = err?.status;
          const code = err?.error?.code || err?.code;
          const isRetryable = status === 503 || status === 429 || code === 503 || code === 429;
          attempt++;
          if (!isRetryable || attempt >= 2) {
            break;
          }
          const delay = 300 + Math.random() * 200;
          console.warn(`Model ${modelCandidate} returned status ${status || code}. Retrying (${attempt}/2) instantly...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
      if (success && response?.text) {
        break;
      }
    }

    const replyText = response?.text || "";

    return res.json({
      ok: true,
      text: replyText,
      model: currentModelUsed,
      roleId
    });
  } catch (err: any) {
    console.error("Gemini Chat generation failed:", err);
    const errMsg = err?.message || "Failed to generate response from Gemini.";

    return res.status(200).json({
      ok: false,
      error: errMsg,
      fallbackText: language === "ar"
        ? `عذراً، المحلل يواجه ضغطاً عالياً حالياً ولا يمكنه إتمام التحليل. يرجى المحاولة مرة أخرى بعد قليل.`
        : `The analyst is currently experiencing high demand and cannot complete the analysis. Please try again in a few moments.`,
      model: targetModel,
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
