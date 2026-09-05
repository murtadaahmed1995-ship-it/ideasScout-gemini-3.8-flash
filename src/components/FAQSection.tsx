import React, { useState } from 'react';

interface FAQSectionProps {
  isArabic: boolean;
}

interface FAQItem {
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
}

const faqs: FAQItem[] = [
  {
    qEn: "How does IdeaScout help validate my business or innovation idea?",
    qAr: "كيف تساعد منصة IdeaScout في التحقق من فكرتك التجارية أو الابتكار؟",
    aEn: "IdeaScout evaluates your idea across multiple dimensions such as target audience, market need, and evidence confidence, providing a structured report before you invest time or resources.",
    aAr: "تقيم IdeaScout فكرتك عبر أبعاد متعددة مثل الجمهور المستهدف، الحاجة في السوق، وثقة الأدلة، مما يوفر تقريراً منظماً قبل استثمار الوقت أو الموارد."
  },
  {
    qEn: "Can I save and manage multiple ideas in my vault?",
    qAr: "هل يمكنني حفظ وإدارة عدة أفكار في خزنتي؟",
    aEn: "Yes, you can save your analyzed ideas to your personal Vault, revisit them anytime, and track progress or refine your strategies.",
    aAr: "نعم، يمكنك حفظ أفكارك المحللة في خزنتك الشخصية، ومراجعتها في أي وقت، وتتبع التقدم أو تحسين استراتيجياتك."
  },
  {
    qEn: "Is my idea data secure and private?",
    qAr: "هل بيانات أفكاري آمنة وخاصة؟",
    aEn: "Absolutely. All your analysis inputs and saved vaults are handled with strict privacy and secure storage standards.",
    aAr: "بالتأكيد. يتم التعامل مع جميع مدخلات التحليل والخزائن المحفوظة بمعايير سرية وأمان صارمة."
  },
  {
    qEn: "How does the AI assistant synthesize dynamic questions?",
    qAr: "كيف يقوم مساعد الذكاء الاصطناعي بتوليد الأسئلة الديناميكية؟",
    aEn: "The AI inspects your initial description and stage to generate targeted, professional questions designed to uncover blind spots and risky assumptions.",
    aAr: "يفحص الذكاء الاصطناعي وصفك الأولي ومرحلتك لتوليد أسئلة مستهدفة ومهنية مصممة للكشف عن النقاط العمياء والافتراضات الخطرة."
  }
];

export const FAQSection: React.FC<FAQSectionProps> = ({ isArabic }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 relative z-10" style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--line)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider uppercase rounded-full border" style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)', backgroundColor: 'rgba(67, 230, 210, 0.1)' }}>
            {isArabic ? 'الأسئلة الشائعة' : 'FAQ & Support'}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: 'var(--ink)' }}>
            {isArabic ? 'كل ما تحتاج معرفته عن المنصة والتحقق' : 'Everything You Need to Know'}
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--muted)' }}>
            {isArabic 
              ? 'إجابات واضحة حول منهجية التحليل وإدارة الأفكار.' 
              : 'Clear answers on our analysis methodology and idea vault management.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="transition-all duration-300 rounded-2xl overflow-hidden border border-[var(--line)] bg-gradient-to-br from-[#06111f]/90 to-[#081a2e]/90 backdrop-blur-xl shadow-lg hover:border-[var(--cyan)]/40"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full py-5 px-6 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
                >
                  <span className="text-lg font-bold text-white group-hover:text-[var(--cyan)] transition-colors pr-4">
                    {isArabic ? faq.qAr : faq.qEn}
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[var(--cyan)] text-[#031318] border-[var(--cyan)]' : 'group-hover:border-[var(--cyan)]/50'}`}>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100 pb-6 px-6' : 'max-h-0 opacity-0 px-6'}`}
                >
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed border-t border-[var(--line)] pt-4">
                    {isArabic ? faq.aAr : faq.aEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
