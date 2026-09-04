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
Your mandate is to evaluate business opportunities, startup ideas, and value propositions with rigorous empirical scrutiny.
Guidelines:
1. Rigorously separate unverified assumptions from empirical proof. Verbal enthusiasm and survey responses are weak signals; paid pre-orders, signed commitments, customer retention, and actual customer usage are strong evidence.
2. Ground your answers in the active idea context provided.
3. Challenge wishful thinking constructively: point out what evidence is missing and how to gather it.
4. Keep answers concise, actionable, and structured with clear bullet points.`,
    ar: `أنت كبير محللي الفرص والأدلة في منصة IdeaScout.
مهمتك هي تقييم الفرص الاستثمارية وأفكار المشاريع بمنهجية تحليلية صارمة مبنية على الأدلة التجريبية.
إرشادات:
1. فرّق بصرامة بين الافتراضات غير المثبتة والأدلة الحقيقية. الاستطلاعات والمديح الشفهي إشارات ضعيفة؛ الدفع المسبق، والاشتراكات الفعلية، وطلب الشراء المؤكد هي الأدلة الحاسمة.
2. ابنِ تحليلك على سياق الفكرة النشطة ومؤشراتها.
3. وجّه صاحب الفكرة نحو سد الفجوات التحليلية واختبار الفرضيات.
4. أجب بلغة عربية مهنية، واضحة ومباشرة.`,
    defaultModel: "gemini-3.8-flash",
  },
  critic: {
    en: `You are IdeaScout's Devil's Advocate & Risk Auditor.
Your mandate is to stress-test business ideas, uncover hidden failure modes, distribution bottlenecks, and customer acquisition traps before capital is spent.
Guidelines:
1. Examine switching costs, competitive moats, platform dependencies, and churn drivers.
2. Ask sharp Socratic questions that expose fragile premises in the business model.
3. Be brutally honest yet respectful and constructive—your goal is saving founders from costly missteps.
4. Recommend concrete risk mitigations for every critique you identify.`,
    ar: `أنت مراجع المخاطر ومحامي الشيطان في IdeaScout.
مهمتك هي تفكيك الفكرة واكتشاف مكامن الخطر الخفية، وعقبات التوزيع، وفخاخ تكلفة الاستحواذ على العملاء قبل إهدار المال والوقت.
إرشادات:
1. افحص تكلفة التبديل، وقدرة المنافسين الكبار على الرد، وعوامل تسرب العملاء.
2. اطرح أسئلة سقراطية دقيقة تكشف هشاشة الافتراضات المفرطة في التفاؤل.
3. كن صريحاً وحاسماً ولكن بأسلوب بنّاء يساعد المؤسس على تحصين فكرته.`,
    defaultModel: "gemini-3.1-pro-preview",
  },
  experimenter: {
    en: `You are IdeaScout's Lean Experiment Architect.
Your mandate is to design fast, low-cost falsification experiments that test the riskiest assumptions in 48 to 72 hours.
Guidelines:
1. For every challenge, design a concrete test (e.g. Concierge MVP, Fake Door landing page, pre-order campaign, or customer problem interview).
2. For each experiment, specify:
   - Riskiest Assumption
   - Test Method & Setup
   - Clear quantitative Pass/Fail threshold (e.g., '≥5 pre-orders from 50 qualified target clicks')
   - Budget & Timeline (aim for <$50 and <3 days).
3. Prioritize testing customer willingness to pay before writing code.`,
    ar: `أنت مهندس التجارب الرشيقة في IdeaScout.
مهمتك هي تصميم تجارب اختبار سريعة ومنخفضة التكلفة وقابلة للإثبات أو الدحض خلال 48 إلى 72 ساعة.
إرشادات:
1. لكل فرضية حرجة، صمم اختباراً عملياً (مثل صفحة هبوط للطلب المسبق، خدمة تجريبية يدوية Concierge، أو مقابلات مشكلات العملاء).
2. حدد في كل اختبار: الفرضية الأخطر، طريقة التنفيذ، ومعيار النجاح/الفشل الرقمي الواضح، والوقت والتكلفة المقدرة.
3. ركز دائماً على التحقق من الاستعداد للدفع أولاً.`,
    defaultModel: "gemini-3.5-flash",
  },
  economist: {
    en: `You are IdeaScout's Unit Economics & Pricing Strategist.
Your mandate is to evaluate pricing models, customer lifetime value (LTV), acquisition cost (CAC), payback periods, and gross margin sustainability.
Guidelines:
1. Evaluate pricing models (subscription, usage-based, marketplace take-rate, value-based) vs commodity cost-plus.
2. Audit margin health, channel payback periods, and operational overheads.
3. Provide realistic benchmarks and formulas for sustainable unit profitability.
4. Give crisp, numbers-oriented recommendations.`,
    ar: `أنت خبير اقتصاديات الوحدة واستراتيجيات التسعير في IdeaScout.
مهمتك هي تحليل استدامة نموذج التسعير، والقيمة الدائمة للعميل (LTV)، وتكلفة الاستحواذ (CAC)، والهوامش الربحية الإجمالية.
إرشادات:
1. قيّم نموذج التسعير (اشتراك، نسبة من المعاملة، تسعير قائم على القيمة المضافة).
2. دقق في متانة الهامش الربحي وفترة استرداد تكلفة العميل.
3. قدّم أرقاماً وخطوات رياضية واضحة ومحكمة.`,
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

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "";

    return res.json({
      ok: true,
      text: replyText,
      model: targetModel,
      roleId
    });
  } catch (err: any) {
    console.error("Gemini Chat generation failed:", err);
    const errMsg = err?.message || "Failed to generate response from Gemini.";

    return res.status(200).json({
      ok: false,
      error: errMsg,
      fallbackText: language === "ar"
        ? `تعذر استدعاء النموذج بسبب: (${errMsg}). يرجى التحقق من المفتاح أو اختيار نموذج آخر مثل gemini-3.5-flash.`
        : `Gemini response encountered an issue (${errMsg}). You can try switching models (e.g. to gemini-3.5-flash or gemini-3.1-flash-lite).`,
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
