/**
 * IdeaScout Smart Tagging Engine
 * Automatically extracts descriptive industry, business-model, and thematic tags
 * (e.g. 'FinTech', 'SaaS', 'Marketplace') from idea descriptions, titles, and context.
 */

export interface TagRule {
  tag: string;
  weight?: number;
  keywords: string[];
}

const TAG_RULES: TagRule[] = [
  // 1. FinTech
  {
    tag: 'FinTech',
    weight: 2.2,
    keywords: [
      'fintech', 'fin-tech', 'finance', 'financial', 'financial technology', 'payment', 'payments',
      'banking', 'bank', 'neobank', 'wallet', 'wallets', 'crypto', 'cryptocurrency',
      'bitcoin', 'ethereum', 'defi', 'lending', 'loan', 'loans', 'credit', 'invoicing',
      'invoice', 'invoices', 'billing', 'remittance', 'stripe', 'checkout', 'pos',
      'point-of-sale', 'transfers', 'accounting', 'bookkeeping', 'tax', 'taxes',
      'investment', 'investing', 'portfolio', 'wealth', 'trading', 'payroll', 'crowdfunding',
      'تمويل', 'مدفوعات', 'دفع', 'بنك', 'بنوك', 'محفظة', 'محافظ', 'كريبتو',
      'عملات رقمية', 'قروض', 'إقراض', 'ائتمان', 'فواتير', 'فوترة', 'محاسبة',
      'ضرائب', 'استثمار', 'تداول', 'مصرفي', 'مصرفية'
    ]
  },

  // 2. SaaS (Software as a Service)
  {
    tag: 'SaaS',
    weight: 2.2,
    keywords: [
      'saas', 'software as a service', 'software-as-a-service', 'subscription', 'cloud-based',
      'cloud software', 'cloud platform', 'b2b software', 'workflow automation', 'automation tool',
      'dashboard', 'crm', 'erp', 'productivity tool', 'api platform', 'no-code', 'low-code',
      'developer tool', 'analytics tool', 'management software', 'multi-tenant',
      'recurring subscription', 'software platform',
      'برمجيات كخدمة', 'سحابي', 'منصة سحابية', 'اشتراك شهري', 'اشتراكات',
      'أتمتة العمليات', 'أتمتة', 'سير العمل', 'إدارة علاقات العملاء', 'نظام إدارة',
      'برمجيات سحابية', 'منصة اشتراك'
    ]
  },

  // 3. Marketplace
  {
    tag: 'Marketplace',
    weight: 2.2,
    keywords: [
      'marketplace', 'market place', 'multi-vendor', 'two-sided', 'two-sided marketplace',
      'buyers and sellers', 'buyer and seller', 'connect buyers', 'connect sellers',
      'connecting suppliers', 'connect suppliers', 'connecting clients', 'directory',
      'brokerage', 'p2p', 'peer-to-peer', 'peer to peer', 'gig economy',
      'commission per transaction', 'matchmaking platform', 'listings', 'aggregating suppliers',
      'exchange platform', 'booking platform',
      'سوق إلكتروني', 'منصة ربط', 'وساطة', 'بائعين ومشترين', 'تجار ومشترين',
      'متجر متعدد البائعين', 'منصة وساطة', 'ربط الموردين', 'سوق', 'منصة حجز'
    ]
  },

  // 4. AI & Machine Learning
  {
    tag: 'AI-ML',
    weight: 1.8,
    keywords: [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'llm',
      'gpt', 'generative ai', 'genai', 'nlp', 'computer vision', 'intelligent agent',
      'copilot', 'neural', 'predictive model', 'autonomous', 'smart algorithm',
      'ذكاء اصطناعي', 'تعلم الآلة', 'نماذج لغوية', 'ذكاء توليدي', 'روبوت ذكي',
      'خوارزمية ذكية', 'تحليل تنبؤي'
    ]
  },

  // 5. B2B (Business to Business)
  {
    tag: 'B2B',
    weight: 1.5,
    keywords: [
      'b2b', 'business to business', 'business-to-business', 'enterprise', 'enterprises',
      'corporate', 'corporations', 'companies', 'commercial clients', 'vendors',
      'wholesale', 'procurement', 'contractors', 'b2b clients',
      'شركات', 'مؤسسات', 'أعمال للأعمال', 'تجار الجملة', 'منشآت', 'شركات تجارية'
    ]
  },

  // 6. B2C (Business to Consumer)
  {
    tag: 'B2C',
    weight: 1.5,
    keywords: [
      'b2c', 'consumer', 'consumers', 'end-users', 'individuals', 'household',
      'families', 'everyday people', 'consumer app', 'personal finance', 'shopper',
      'مستهلكين', 'أفراد', 'مستخدمين', 'عائلات', 'تطبيق للمستهلك', 'عامة الناس'
    ]
  },

  // 7. HealthTech & MedTech
  {
    tag: 'HealthTech',
    weight: 1.7,
    keywords: [
      'health', 'healthcare', 'healthtech', 'medical', 'clinic', 'clinics', 'doctor',
      'doctors', 'patient', 'patients', 'hospital', 'telemedicine', 'pharma',
      'pharmacy', 'wellness', 'fitness', 'therapy', 'mental health', 'dental',
      'diagnostics', 'health records',
      'صحة', 'صحي', 'رعاية صحية', 'طب', 'طبي', 'عيادة', 'عيادات', 'أطباء',
      'طبيب', 'مرضى', 'مريض', 'مستشفى', 'مستشفيات', 'صيدلية', 'علاج عن بعد',
      'لياقة', 'علاج نفسي', 'سجلات طبية'
    ]
  },

  // 8. EdTech & Learning
  {
    tag: 'EdTech',
    weight: 1.7,
    keywords: [
      'edtech', 'education', 'learning', 'course', 'courses', 'school', 'schools',
      'student', 'students', 'teacher', 'teachers', 'tutor', 'tutoring', 'training',
      'academy', 'bootcamp', 'curriculum', 'lms', 'e-learning', 'skill acquisition',
      'تعليم', 'تعليمي', 'تعلم', 'دورات', 'دورة', 'مدرسة', 'مدارس', 'طالب',
      'طلاب', 'معلم', 'معلمين', 'تدريب', 'أكاديمية', 'منهاج', 'تعليم إلكتروني'
    ]
  },

  // 9. E-Commerce & Retail
  {
    tag: 'E-Commerce',
    weight: 1.6,
    keywords: [
      'ecommerce', 'e-commerce', 'online store', 'shop', 'shopping', 'retail',
      'd2c', 'direct-to-consumer', 'cart', 'checkout', 'inventory', 'dropshipping',
      'merchandise', 'catalog', 'order fulfillment',
      'تجارة إلكترونية', 'متجر إلكتروني', 'تسوق', 'تجزئة', 'طلبات', 'مخزون',
      'بضائع', 'سلة الشراء'
    ]
  },

  // 10. FoodTech & Hospitality
  {
    tag: 'FoodTech',
    weight: 1.6,
    keywords: [
      'food', 'restaurant', 'restaurants', 'dining', 'kitchen', 'chef', 'chefs',
      'meal', 'meals', 'recipe', 'recipes', 'catering', 'food delivery', 'cafe',
      'beverage', 'groceries', 'bakery',
      'مطعم', 'مطاعم', 'طعام', 'أغذية', 'وجبات', 'وجبة', 'مطبخ', 'طاهي',
      'توصيل طعام', 'مقهى', 'مشروبات', 'بقالة'
    ]
  },

  // 11. AgriTech & Farming
  {
    tag: 'AgriTech',
    weight: 1.7,
    keywords: [
      'agritech', 'agriculture', 'farm', 'farming', 'farmer', 'farmers', 'crop',
      'crops', 'harvest', 'livestock', 'soil', 'irrigation', 'grain', 'produce',
      'greenhouse', 'fertilizer',
      'زراعة', 'زراعي', 'مزرعة', 'مزارع', 'محاصيل', 'حصاد', 'مواشي', 'تربة',
      'ري', 'إنتاج زراعي', 'بيوت محمية'
    ]
  },

  // 12. PropTech & Real Estate
  {
    tag: 'PropTech',
    weight: 1.7,
    keywords: [
      'proptech', 'real estate', 'property', 'properties', 'rental', 'rentals',
      'tenant', 'tenants', 'landlord', 'landlords', 'apartment', 'apartments',
      'housing', 'broker', 'mortgage', 'lease', 'facility management',
      'عقارات', 'عقاري', 'إيجار', 'إيجارات', 'شقق', 'شقة', 'مستأجر', 'ملاك',
      'إسكان', 'وسيط عقاري', 'إدارة مرافق'
    ]
  },

  // 13. Logistics & Supply Chain
  {
    tag: 'Logistics',
    weight: 1.6,
    keywords: [
      'logistics', 'supply chain', 'freight', 'fleet', 'shipping', 'warehouse',
      'warehousing', 'delivery', 'courier', 'trucking', 'cargo', 'last-mile',
      'tracking delivery', 'route optimization',
      'لوجستيات', 'سلاسل الإمداد', 'شحن', 'توصيل', 'أسطول', 'مستودع',
      'مستودعات', 'شاحنات', 'نقل بضائع'
    ]
  },

  // 14. CleanTech & Sustainability
  {
    tag: 'CleanTech',
    weight: 1.7,
    keywords: [
      'cleantech', 'sustainability', 'sustainable', 'green energy', 'solar',
      'renewable', 'carbon', 'recycling', 'waste management', 'eco-friendly',
      'climate', 'electric vehicle', 'emissions',
      'طاقة متجددة', 'طاقة شمسية', 'استدامة', 'بيئة', 'إعادة تدوير',
      'إدارة النفايات', 'صديق للبيئة', 'مناخ', 'كربون'
    ]
  },

  // 15. HRTech & Work
  {
    tag: 'HRTech',
    weight: 1.6,
    keywords: [
      'hr', 'hrtech', 'human resources', 'hiring', 'recruitment', 'recruiting',
      'jobs', 'talent', 'payroll', 'applicant', 'candidates', 'remote work',
      'staffing', 'workforce', 'onboarding', 'employee engagement',
      'موارد بشرية', 'توظيف', 'وظائف', 'مرشحين', 'رواتب', 'عمل عن بعد',
      'كفاءات', 'موظفين'
    ]
  },

  // 16. Service-Industry
  {
    tag: 'Service-Industry',
    weight: 1.5,
    keywords: [
      'salon', 'salons', 'barber', 'barbershop', 'spa', 'beauty', 'hairdresser',
      'haircut', 'stylist', 'cleaning service', 'plumbing', 'handyman', 'laundry',
      'repair service', 'car wash', 'mechanic', 'massage',
      'صالون', 'صالونات', 'حلاقة', 'سبا', 'تجميل', 'تنظيف', 'سباكة',
      'صيانة منزلية', 'غسيل', 'ميكانيكي', 'مصفف شعر'
    ]
  },

  // 17. Cybersecurity
  {
    tag: 'Cybersecurity',
    weight: 1.8,
    keywords: [
      'cybersecurity', 'security', 'privacy', 'encryption', 'authentication',
      'identity', 'fraud detection', 'vulnerability', 'firewall', 'zero-trust',
      'compliance', 'threat detection',
      'أمن سيبراني', 'حماية', 'خصوصية', 'تشفير', 'مصادقة', 'مكافحة الاحتيال'
    ]
  },

  // 18. Travel & Tourism
  {
    tag: 'Travel',
    weight: 1.6,
    keywords: [
      'travel', 'tourism', 'hotel', 'hotels', 'flight', 'flights', 'booking',
      'tour', 'vacation', 'itinerary', 'hospitality', 'hostel', 'destination',
      'سياحة', 'سفر', 'فنادق', 'فندق', 'طيران', 'رحلات', 'حجز', 'إجازة', 'ضيافة'
    ]
  },

  // 19. Automation & Productivity
  {
    tag: 'Automation',
    weight: 1.4,
    keywords: [
      'automation', 'automated', 'streamline', 'streamlining', 'bot', 'workflow',
      'productivity', 'auto-scheduling', 'auto-dispatch',
      'أتمتة', 'مؤتمت', 'تبسيط العمليات', 'إنتاجية'
    ]
  },

  // 20. Mobile App
  {
    tag: 'Mobile-App',
    weight: 1.3,
    keywords: [
      'mobile app', 'ios app', 'android app', 'smartphone', 'mobile-first', 'app store',
      'تطبيق جوال', 'تطبيق هاتف', 'أندرويد', 'آيفون'
    ]
  }
];

/**
 * Normalizes input text for token and phrase matching.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a keyword matches inside the text accurately.
 * Uses word boundaries for Latin text and clean token / stem boundary matching for Arabic.
 */
function matchesKeyword(text: string, tokens: Set<string>, kw: string): boolean {
  const cleanKw = kw.toLowerCase().trim();
  if (!cleanKw) return false;

  // Multi-word phrase matching
  if (cleanKw.includes(' ')) {
    return text.includes(cleanKw);
  }

  // Exact token match (fastest & most accurate)
  if (tokens.has(cleanKw)) {
    return true;
  }

  // For Latin / ASCII words, use strict regex word boundary
  if (/^[a-z0-9-]+$/i.test(cleanKw)) {
    const regex = new RegExp(`\\b${escapeRegExp(cleanKw)}\\b`, 'i');
    return regex.test(text);
  }

  // For Arabic tokens
  // If keyword is very short (<= 3 chars, e.g. ري), strictly require exact token or token with 'ال'
  if (cleanKw.length <= 3) {
    return tokens.has(cleanKw) || tokens.has('ال' + cleanKw) || tokens.has('وال' + cleanKw);
  }

  // For longer Arabic words, check if any token starts with the stem or contains it cleanly
  for (const token of tokens) {
    if (token === cleanKw) return true;
    if (token === 'ال' + cleanKw || token === 'وال' + cleanKw || token === 'فال' + cleanKw || token === 'كال' + cleanKw || token === 'لل' + cleanKw) return true;
    // Prefix 'ب' or 'و'
    if (token === 'و' + cleanKw || token === 'ب' + cleanKw || token === 'ف' + cleanKw) return true;
    if (token.startsWith(cleanKw) && token.length <= cleanKw.length + 3) return true;
  }

  return false;
}

/**
 * Automatically extracts descriptive tags from an idea's description, title, and questionnaire.
 * Returns 2 to 4 ranked, deduplicated, clean tag names (e.g. ['FinTech', 'SaaS', 'B2B']).
 */
export function generateDescriptiveTags(
  description: string = '',
  title: string = '',
  answers: Record<string, string> = {}
): string[] {
  const combinedRaw = [
    title || '',
    description || '',
    ...Object.values(answers || {})
  ].join(' ');

  const normalized = normalizeText(combinedRaw);
  if (!normalized || normalized.length < 3) {
    return ['Innovation', 'Concept'];
  }

  const tokenList = normalized.split(/\s+/).filter(Boolean);
  const tokenSet = new Set(tokenList);

  const scores: Record<string, number> = {};

  for (const rule of TAG_RULES) {
    let tagScore = 0;
    const ruleWeight = rule.weight || 1;

    for (const kw of rule.keywords) {
      if (matchesKeyword(normalized, tokenSet, kw)) {
        // Multi-word phrase gets higher points
        const isPhrase = kw.trim().includes(' ');
        tagScore += (isPhrase ? 3 : 1.5) * ruleWeight;
      }
    }

    if (tagScore > 0) {
      scores[rule.tag] = (scores[rule.tag] || 0) + tagScore;
    }
  }

  // Sort candidate tags by total score descending
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  // Take top 2 to 4 tags
  let selected = sorted.slice(0, 4);

  // Fallback if no specific rule triggered
  if (selected.length === 0) {
    if (tokenSet.has('platform') || tokenSet.has('منصة')) {
      selected.push('Platform');
    }
    if (tokenSet.has('app') || tokenSet.has('تطبيق') || tokenSet.has('mobile')) {
      selected.push('Mobile-App');
    }
    if (tokenSet.has('service') || tokenSet.has('خدمة')) {
      selected.push('Digital-Service');
    }
    if (selected.length === 0) {
      selected = ['Innovation', 'Digital-Service'];
    }
  } else if (selected.length === 1) {
    // If only 1 tag detected, supplement with a complementary tag if relevant
    if (
      !selected.includes('B2B') &&
      !selected.includes('B2C') &&
      (tokenSet.has('business') || tokenSet.has('enterprise') || tokenSet.has('شركات') || tokenSet.has('شركاتنا'))
    ) {
      selected.push('B2B');
    } else if (
      !selected.includes('Automation') &&
      (tokenSet.has('automate') || tokenSet.has('workflow') || tokenSet.has('automated'))
    ) {
      selected.push('Automation');
    } else if (!selected.includes('Digital-Service')) {
      selected.push('Digital-Service');
    }
  }

  return Array.from(new Set(selected)).slice(0, 4);
}
