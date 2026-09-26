import { LocalizedString } from '../types';

export interface SubcategoryNode {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  parentId: string;
}

export interface CategoryNode {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  icon: string;
  color: string;
  subcategories: SubcategoryNode[];
}

export const IDEA_CATEGORIES: CategoryNode[] = [
  {
    id: 'b2b-saas',
    name: {
      en: 'B2B & Enterprise SaaS',
      ar: 'برمجيات الشركات وسحابيات الأعمال'
    },
    description: {
      en: 'Workflow systems, enterprise software, and productivity infrastructure for modern organizations.',
      ar: 'أنظمة سير العمل والبرمجيات المؤسسية وبنية الإنتاجية لمنظمات الأعمال الحديثة.'
    },
    icon: 'briefcase',
    color: '#38bdf8',
    subcategories: [
      {
        id: 'crm-sales',
        name: { en: 'CRM & Sales Automation', ar: 'إدارة العملاء وأتمتة المبيعات' },
        description: { en: 'Pipelines, outreach intelligence, and revenue operations.', ar: 'مسارات المبيعات، ذكاء التواصل، وعمليات الإيرادات.' },
        parentId: 'b2b-saas'
      },
      {
        id: 'hr-talent',
        name: { en: 'HR Tech & Talent Operations', ar: 'الموارد البشرية وإدارة الكفاءات' },
        description: { en: 'Recruitment, payroll, performance, and workplace culture.', ar: 'التوظيف، الرواتب، تقييم الأداء، وبيئة العمل.' },
        parentId: 'b2b-saas'
      },
      {
        id: 'workflow-automation',
        name: { en: 'Workflow & Process Automation', ar: 'أتمتة الأعمال والعمليات' },
        description: { en: 'No-code pipelines, appointment filling, and team routing.', ar: 'مسارات بدون كود، جدولة المواعيد، وتوجيه المهام.' },
        parentId: 'b2b-saas'
      },
      {
        id: 'supply-logistics',
        name: { en: 'Supply Chain & Logistics SaaS', ar: 'سلاسل الإمداد والخدمات اللوجستية' },
        description: { en: 'Freight, warehouse monitoring, and supplier connectivity.', ar: 'الشحن، مراقبة المستودعات، والربط مع الموردين.' },
        parentId: 'b2b-saas'
      },
      {
        id: 'dev-infra',
        name: { en: 'DevTools & Cloud Infrastructure', ar: 'أدوات المطورين والبنية السحابية' },
        description: { en: 'APIs, observability, deployments, and security tooling.', ar: 'واجهات البرمجة، المراقبة، النشر، وأدوات الحماية.' },
        parentId: 'b2b-saas'
      }
    ]
  },
  {
    id: 'fintech',
    name: {
      en: 'FinTech & Capital Services',
      ar: 'التقنية المالية والخدمات المصرفية'
    },
    description: {
      en: 'Financial rails, embedded lending, payment networks, and digital accounting.',
      ar: 'مسارات الدفع الرقمية، الإقراض المضمن، شبكات المعاملات، والمحاسبة الذكية.'
    },
    icon: 'dollar-sign',
    color: '#34d399',
    subcategories: [
      {
        id: 'payments-transfers',
        name: { en: 'Payments & Micro-deposits', ar: 'المدفوعات والعربون الرقمي' },
        description: { en: 'Payment gateways, cross-border remittance, and checkout escrow.', ar: 'بوابات الدفع، الحوالات العابرة للحدود، والضمان المالي.' },
        parentId: 'fintech'
      },
      {
        id: 'sme-financing',
        name: { en: 'SME Lending & Working Capital', ar: 'تمويل المنشآت ورأس المال العامل' },
        description: { en: 'Invoice factoring, revenue-based financing, and micro-loans.', ar: 'شراء الفواتير، التمويل القائم على الإيراد، والقروض المصغرة.' },
        parentId: 'fintech'
      },
      {
        id: 'insurtech',
        name: { en: 'InsurTech & Parametric Risk', ar: 'تقنية التأمين وإدارة المخاطر' },
        description: { en: 'On-demand policies, risk underwriting, and claims processing.', ar: 'وثائق التأمين المرنة، تسعير المخاطر، ومعالجة المطالبات.' },
        parentId: 'fintech'
      },
      {
        id: 'wealth-personal-finance',
        name: { en: 'Wealth & Personal Finance Management', ar: 'إدارة الثروات والمالية الشخصية' },
        description: { en: 'Automated savings, asset diversification, and financial health.', ar: 'الادخار الآلي، تنويع الأصول، ومؤشرات الصحة المالية.' },
        parentId: 'fintech'
      },
      {
        id: 'regtech-compliance',
        name: { en: 'RegTech & AML Compliance', ar: 'الامتثال التنظيمي ومكافحة الاحتيال' },
        description: { en: 'Identity verification, audit logs, and transaction monitoring.', ar: 'التحقق من الهوية، سجلات التدقيق، ورصد الاحتيال.' },
        parentId: 'fintech'
      }
    ]
  },
  {
    id: 'marketplaces',
    name: {
      en: 'Marketplaces & Commerce',
      ar: 'المنصات التجارية والأسواق'
    },
    description: {
      en: 'Two-sided transactional platforms, wholesale procurement, and specialized commerce.',
      ar: 'منصات الربط ثنائية الجانب، مشتريات الجملة، والتجارة التخصصية.'
    },
    icon: 'shopping-bag',
    color: '#fbbf24',
    subcategories: [
      {
        id: 'b2b-wholesale',
        name: { en: 'B2B Wholesale & Farm-to-Table', ar: 'تجارة الجملة والتوريد الزراعي المباشر' },
        description: { en: 'Bulk food supply, restaurant procurement, and supplier contracts.', ar: 'توريد الأغذية بالجملة، مشتريات المطاعم، وعقود الموردين.' },
        parentId: 'marketplaces'
      },
      {
        id: 'vertical-services',
        name: { en: 'Vertical Freelance & Service Platforms', ar: 'منصات الخدمات التخصصية والمهنيين' },
        description: { en: 'Specialized practitioner matching, home services, and bookings.', ar: 'الربط مع المهنيين المتخصصين، الخدمات المنزلية، والحجوزات.' },
        parentId: 'marketplaces'
      },
      {
        id: 'd2c-commerce',
        name: { en: 'D2C Brands & Curated Commerce', ar: 'العلامات المباشرة والتجارة المنتقاة' },
        description: { en: 'Niche retail, subscription boxes, and tailored product discovery.', ar: 'التجزئة التخصصية، صناديق الاشتراك، واكتشاف المنتجات.' },
        parentId: 'marketplaces'
      },
      {
        id: 'circular-recommerce',
        name: { en: 'Circular Economy & Re-commerce', ar: 'الاقتصاد الدائري وإعادة البيع' },
        description: { en: 'Refurbished goods, resale verification, and equipment rental.', ar: 'السلع المجددة، التحقق من الأصالة، وتأجير المعدات.' },
        parentId: 'marketplaces'
      }
    ]
  },
  {
    id: 'healthtech',
    name: {
      en: 'HealthTech & Wellness',
      ar: 'التقنية الصحية وجودة الحياة'
    },
    description: {
      en: 'Patient care digitization, clinical operations, mental health, and longevity.',
      ar: 'رقمنة رعاية المرضى، إدارة العيادات، الصحة النفسية، وطول العمر الصحي.'
    },
    icon: 'heart',
    color: '#f43f5e',
    subcategories: [
      {
        id: 'clinical-software',
        name: { en: 'Clinic Operations & EHR Systems', ar: 'إدارة العيادات والسجلات الطبية' },
        description: { en: 'Electronic records, patient intake, and practice workflow.', ar: 'السجلات الإلكترونية، استقبال المرضى، وسير عمل العيادة.' },
        parentId: 'healthtech'
      },
      {
        id: 'telehealth',
        name: { en: 'Telemedicine & Remote Consultation', ar: 'الاستشارات الطبية والطب الاتصالي' },
        description: { en: 'Virtual doctor access, continuous triage, and digital prescriptions.', ar: 'التواصل مع الأطباء عن بُعد، الفرز الطبي، والوصفات الرقمية.' },
        parentId: 'healthtech'
      },
      {
        id: 'mental-health',
        name: { en: 'Mental Health & Mind Coaching', ar: 'الصحة النفسية والإرشاد السلوكي' },
        description: { en: 'Guided mindfulness, therapist matching, and cognitive tracking.', ar: 'اليقظة الذهنية، مطابقة المعالجين، ومتابعة المزاج.' },
        parentId: 'healthtech'
      },
      {
        id: 'preventive-fitness',
        name: { en: 'Preventive Health & Biometrics', ar: 'الصحة الوقائية والمؤشرات الحيوية' },
        description: { en: 'Wearable data synthesis, personalized nutrition, and preventative habits.', ar: 'تحليل بيانات الأجهزة القابلة للارتداء، التغذية، والوقاية.' },
        parentId: 'healthtech'
      }
    ]
  },
  {
    id: 'ai-data',
    name: {
      en: 'AI & Intelligent Systems',
      ar: 'الذكاء الاصطناعي والأنظمة الذكية'
    },
    description: {
      en: 'Agentic AI workflows, specialized enterprise copilots, and data synthesizers.',
      ar: 'الوكلاء المستقلون، المساعدون المتخصصون للشركات، ومعالجة البيانات الذكية.'
    },
    icon: 'sparkles',
    color: '#8b5cf6',
    subcategories: [
      {
        id: 'vertical-copilots',
        name: { en: 'Vertical Domain Copilots', ar: 'مساعدو الذكاء الاصطناعي المتخصصون' },
        description: { en: 'Domain-trained assistants for legal, medical, accounting, or design.', ar: 'مساعدون مدربون في القانون، المحاسبة، الطب، أو التصميم.' },
        parentId: 'ai-data'
      },
      {
        id: 'autonomous-agents',
        name: { en: 'Autonomous Agents & Execution Engines', ar: 'الوكلاء المستقلون ومحركات التنفيذ' },
        description: { en: 'Multi-step goal execution, computer-use automation, and background agents.', ar: 'تنفيذ الأهداف المتعددة، أتمتة العمليات، والوكلاء الخفيون.' },
        parentId: 'ai-data'
      },
      {
        id: 'data-pipelines',
        name: { en: 'Data Intelligence & Analytics', ar: 'ذكاء البيانات والتحليلات التنبؤية' },
        description: { en: 'Real-time telemetry, semantic search engines, and automated dashboards.', ar: 'القياسات اللحظية، محركات البحث الدلالية، واللوحات الآلية.' },
        parentId: 'ai-data'
      },
      {
        id: 'computer-vision-speech',
        name: { en: 'Speech, Audio & Vision Models', ar: 'نماذج الرؤية والصوت والكلام' },
        description: { en: 'Document OCR, ambient voice note transcription, and object detection.', ar: 'استخراج نصوص المستندات، تفريغ الملاحظات الصوتية، ورؤية الحاسوب.' },
        parentId: 'ai-data'
      }
    ]
  },
  {
    id: 'edtech-work',
    name: {
      en: 'EdTech & Future of Work',
      ar: 'تقنيات التعليم ومستقبل العمل'
    },
    description: {
      en: 'Accelerated skill acquisition, remote team collaboration, and vocational mastery.',
      ar: 'اكتساب المهارات السريع، فرق العمل الموزعة، والتدريب المهني المتقدم.'
    },
    icon: 'graduation-cap',
    color: '#06b6d4',
    subcategories: [
      {
        id: 'professional-upskilling',
        name: { en: 'Executive & Professional Upskilling', ar: 'التأهيل التنفيذي والمهني' },
        description: { en: 'Cohort-based learning, scenario simulations, and career advancement.', ar: 'التعليم القائم على المجموعات، محاكاة السيناريوهات، والنمو المهني.' },
        parentId: 'edtech-work'
      },
      {
        id: 'remote-collaboration',
        name: { en: 'Async & Distributed Team Collaboration', ar: 'العمل الموزع والتعاون غير المتزامن' },
        description: { en: 'Virtual whiteboarding, asynchronous video updates, and knowledge bases.', ar: 'السبورات الرقمية، التحديثات المرئية، ومستودعات المعرفة.' },
        parentId: 'edtech-work'
      },
      {
        id: 'interactive-k12',
        name: { en: 'Interactive STEM & Youth Learning', ar: 'تعليم العلوم التفاعلي والمهارات الحديثة' },
        description: { en: 'Gamified learning, robotic kits, and personalized tutoring engines.', ar: 'التعليم الممتع، حزم الروبوت، ومحركات التدريس الفردي.' },
        parentId: 'edtech-work'
      }
    ]
  },
  {
    id: 'climatetech',
    name: {
      en: 'ClimateTech & AgriFood',
      ar: 'تقنية المناخ والزراعة المستدامة'
    },
    description: {
      en: 'Decarbonization, precision agriculture, energy grids, and resource circularity.',
      ar: 'خفض الانبعاثات، الزراعة الدقيقة، شبكات الطاقة النظيفة، واستدامة الموارد.'
    },
    icon: 'leaf',
    color: '#10b981',
    subcategories: [
      {
        id: 'precision-agritech',
        name: { en: 'Precision Farming & Yield Optimization', ar: 'الزراعة الدقيقة ومضاعفة الإنتاج' },
        description: { en: 'Soil sensing, automated drip irrigation, and harvest yield analytics.', ar: 'استشعار التربة، الري الآلي بالتنقيط، وتحليلات المحاصيل.' },
        parentId: 'climatetech'
      },
      {
        id: 'carbon-accounting',
        name: { en: 'Carbon Accounting & ESG Audits', ar: 'محاسبة الكربون وتدقيق الاستدامة' },
        description: { en: 'Scope 1-3 footprint tracking, carbon credit verification, and compliance.', ar: 'تتبع البصمة البيئية، التحقق من أرصدة الكربون، والامتثال.' },
        parentId: 'climatetech'
      },
      {
        id: 'clean-energy',
        name: { en: 'Clean Energy & Battery Storage', ar: 'الطاقة النظيفة وتخزين البطاريات' },
        description: { en: 'Microgrid management, solar yield forecasting, and EV infrastructure.', ar: 'إدارة الشبكات المصغرة، توقعات الطاقة الشمسية، وبنية المركبات الكهربائية.' },
        parentId: 'climatetech'
      }
    ]
  },
  {
    id: 'consumer-lifestyle',
    name: {
      en: 'Consumer, Media & Social',
      ar: 'المستهلك والإعلام والمجتمعات'
    },
    description: {
      en: 'Creator tools, hyperlocal lifestyle experiences, gaming, and connected communities.',
      ar: 'أدوات صناع المحتوى، التجارب الحياتية المحلية، الألعاب، والمجتمعات المتصلة.'
    },
    icon: 'users',
    color: '#ec4899',
    subcategories: [
      {
        id: 'creator-tools',
        name: { en: 'Creator Monetization & Studio Tools', ar: 'أدوات المبدعين وتحقيق الدخل' },
        description: { en: 'Audience subscriptions, automated clipping, and merchandise infrastructure.', ar: 'اشتراكات الجمهور، قص المقاطع آلياً، ومنتجات المبدعين.' },
        parentId: 'consumer-lifestyle'
      },
      {
        id: 'hyperlocal-discovery',
        name: { en: 'Hyperlocal Events & Community Circles', ar: 'الفعاليات المحلية واكتشاف الأنشطة' },
        description: { en: 'Neighborhood networks, event ticketing, and local interest groups.', ar: 'شبكات الأحياء، تذاكر الفعاليات، ومجموعات الاهتمامات المحلية.' },
        parentId: 'consumer-lifestyle'
      },
      {
        id: 'smart-living',
        name: { en: 'Smart Living & Personal Routines', ar: 'الحياة الذكية والعادات اليومية' },
        description: { en: 'Home automation integration, habit tracking, and curated living.', ar: 'التحكم بالمنزل، تتبع العادات اليومية، وتنظيم نمط الحياة.' },
        parentId: 'consumer-lifestyle'
      }
    ]
  }
];

/**
 * Intelligent category matching helper:
 * Scans description and keywords to suggest the most relevant primary & secondary category.
 */
export function suggestCategoryFromContent(
  text: string,
  title?: string
): { primaryId: string; subcategoryId?: string } {
  const normalized = `${title || ''} ${text}`.toLowerCase();

  if (
    normalized.includes('salon') ||
    normalized.includes('appointment') ||
    normalized.includes('whatsapp') ||
    normalized.includes('cancellation') ||
    normalized.includes('booking') ||
    normalized.includes('مواعيد') ||
    normalized.includes('صالون') ||
    normalized.includes('حجز')
  ) {
    return { primaryId: 'b2b-saas', subcategoryId: 'workflow-automation' };
  }

  if (
    normalized.includes('farm') ||
    normalized.includes('kitchen') ||
    normalized.includes('wholesale') ||
    normalized.includes('restaurant') ||
    normalized.includes('مزرعة') ||
    normalized.includes('مطعم') ||
    normalized.includes('جملة') ||
    normalized.includes('مطبخ')
  ) {
    return { primaryId: 'marketplaces', subcategoryId: 'b2b-wholesale' };
  }

  if (
    normalized.includes('payment') ||
    normalized.includes('deposit') ||
    normalized.includes('bank') ||
    normalized.includes('invoice') ||
    normalized.includes('lending') ||
    normalized.includes('دفع') ||
    normalized.includes('عربون') ||
    normalized.includes('قرض') ||
    normalized.includes('فاتورة')
  ) {
    return { primaryId: 'fintech', subcategoryId: 'payments-transfers' };
  }

  if (
    normalized.includes('doctor') ||
    normalized.includes('clinic') ||
    normalized.includes('health') ||
    normalized.includes('patient') ||
    normalized.includes('طبيب') ||
    normalized.includes('عيادة') ||
    normalized.includes('صحة') ||
    normalized.includes('مريض')
  ) {
    return { primaryId: 'healthtech', subcategoryId: 'clinical-software' };
  }

  if (
    normalized.includes('agent') ||
    normalized.includes('llm') ||
    normalized.includes('ai') ||
    normalized.includes('gpt') ||
    normalized.includes('ذكاء اصطناعي') ||
    normalized.includes('توليدي') ||
    normalized.includes('وكيل')
  ) {
    return { primaryId: 'ai-data', subcategoryId: 'vertical-copilots' };
  }

  if (
    normalized.includes('learn') ||
    normalized.includes('course') ||
    normalized.includes('student') ||
    normalized.includes('school') ||
    normalized.includes('تعليم') ||
    normalized.includes('تدريب') ||
    normalized.includes('دورة')
  ) {
    return { primaryId: 'edtech-work', subcategoryId: 'professional-upskilling' };
  }

  if (
    normalized.includes('solar') ||
    normalized.includes('carbon') ||
    normalized.includes('energy') ||
    normalized.includes('climate') ||
    normalized.includes('طاقة') ||
    normalized.includes('كربون') ||
    normalized.includes('بيئة') ||
    normalized.includes('مناخ')
  ) {
    return { primaryId: 'climatetech', subcategoryId: 'carbon-accounting' };
  }

  if (
    normalized.includes('social') ||
    normalized.includes('creator') ||
    normalized.includes('community') ||
    normalized.includes('محتوى') ||
    normalized.includes('مجتمع') ||
    normalized.includes('تواصل')
  ) {
    return { primaryId: 'consumer-lifestyle', subcategoryId: 'creator-tools' };
  }

  // Default to B2B SaaS
  return { primaryId: 'b2b-saas', subcategoryId: 'workflow-automation' };
}

export function getCategoryById(categoryId?: string): CategoryNode | undefined {
  if (!categoryId) return undefined;
  return IDEA_CATEGORIES.find((c) => c.id === categoryId);
}

export function getSubcategoryById(
  categoryId?: string,
  subcategoryId?: string
): SubcategoryNode | undefined {
  if (!categoryId || !subcategoryId) return undefined;
  const cat = getCategoryById(categoryId);
  return cat?.subcategories.find((s) => s.id === subcategoryId);
}

export function formatCategoryBreadcrumb(
  categoryId?: string,
  subcategoryId?: string,
  isArabic = false
): string {
  const cat = getCategoryById(categoryId);
  if (!cat) return isArabic ? 'عام / غير مصنف' : 'General / Unclassified';
  const catName = isArabic ? cat.name.ar : cat.name.en;
  if (!subcategoryId) return catName;
  const sub = cat.subcategories.find((s) => s.id === subcategoryId);
  if (!sub) return catName;
  const subName = isArabic ? sub.name.ar : sub.name.en;
  return `${catName} › ${subName}`;
}
