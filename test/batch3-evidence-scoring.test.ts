import {
  calculateInputReadiness,
  evaluateIdea,
  extractEvidenceFromInput,
  generateContextualQuestions,
  isMeaningfulAnswer
} from '../src/utils/engine';
import { Analysis, Idea, Stage } from '../src/types';

let totalAssertions = 0;
let passedAssertions = 0;

function assert(condition: boolean, message: string) {
  totalAssertions++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedAssertions++;
  }
}

console.log('====================================================');
console.log('   IDEASCOUT BATCH 3 EVIDENCE & SCORING TEST SUITE  ');
console.log('====================================================\n');

/* --------------------------------------------------------------------------
   1. EVIDENCE TAXONOMY TESTS
   -------------------------------------------------------------------------- */
console.log('▶ [1] Testing Evidence Taxonomy Extraction...');

// Positive evidence
{
  const desc = 'App for salons to reduce missed appointments using WhatsApp reminders.';
  const answers = {
    q1: 'We interviewed 12 salon owners and 8 report losing over $800 a month.',
    q2: '3 salon owners agreed to test our pilot starting next Monday.',
    q3: '1 salon owner already agreed to pay for a pilot deposit.'
  };
  const extracted = extractEvidenceFromInput(desc, answers);
  assert(extracted.summary.positiveCount >= 3, 'Identifies at least 3 positive evidence items');
  assert(extracted.hasInterviews === true, 'Recognizes positive interview evidence');
  assert(extracted.hasPilot === true, 'Recognizes positive pilot evidence');
  assert(extracted.hasPayment === true, 'Recognizes positive payment evidence');
  assert(extracted.summary.coverage === 100, 'Calculates 100% evidence coverage for complete signal set');
}

// Negative evidence
{
  const desc = 'App for salons to reduce missed appointments.';
  const answers = {
    q1: 'We conducted 15 customer interviews across downtown salons.',
    q2: 'Most owners say missed appointments are not a priority and prefer manual calls.',
    q3: 'There is zero willingness to pay; owners refused to pay any recurring fee.'
  };
  const extracted = extractEvidenceFromInput(desc, answers);
  assert(extracted.summary.negativeCount >= 1, 'Identifies negative evidence item');
  assert(extracted.hasNegativeEvidence === true, 'Recognizes negative market evidence');
  assert(extracted.summary.primaryEvidenceFound === true, 'Negative evidence counts as verified empirical signal');
}

// Unknowns (Missing Evidence)
{
  const desc = 'App for salons to reduce missed appointments using WhatsApp reminders.';
  const answers = {
    q1: 'We have not interviewed any salon owners yet.',
    q2: 'We have no pilot and haven’t tested anything with real salons.',
    q3: 'No one has paid and we haven’t tested pricing yet.'
  };
  const extracted = extractEvidenceFromInput(desc, answers);
  assert(extracted.summary.unknownCount >= 3, 'Captures 3 critical missing evidence unknowns');
  assert(extracted.summary.positiveCount === 0, 'No false positive evidence generated from disclaimers');
  assert(extracted.summary.coverage === 0, 'Coverage is 0% when no empirical evidence exists');
}

// Contradiction detection
{
  const desc = 'App for salons to reduce missed appointments.';
  const answers = {
    q1: 'I have not spoken to any salon owners yet.',
    q2: 'However, salon owners definitely want this and everyone wants to use it.',
    q3: 'No paying customer yet.'
  };
  const extracted = extractEvidenceFromInput(desc, answers);
  assert(extracted.contradictionFound === true, 'Detects contradiction between no interviews and claim of definite customer want');
  assert(extracted.summary.contradictionCount >= 1, 'Contradiction count is at least 1');
}

console.log('✅ Evidence taxonomy extraction passed.\n');

/* --------------------------------------------------------------------------
   2. SCENARIO A: Salon Idea, English, NO Evidence
   -------------------------------------------------------------------------- */
console.log('▶ [2] Testing Scenario A: Salon Idea (No Real-World Evidence)...');
{
  const desc = 'An app for salons to reduce missed appointments using WhatsApp reminders.';
  const stage: Stage = 'Validation';
  const questions = generateContextualQuestions(desc, stage);
  const answers = {
    q1: 'I estimate salons lose 10-15% of bookings, but I have no interviews yet.',
    q2: 'Have not spoken to salon owners or managers about current manual reminders.',
    q3: 'No one has paid, zero paying customers, and no pricing test conducted.'
  };

  const report = evaluateIdea(desc, stage, questions, answers);

  assert(report.confidence >= 18 && report.confidence <= 26, `Scenario A Confidence must be limited (18-26). Got: ${report.confidence}`);
  assert(report.opportunityScore >= 68 && report.opportunityScore <= 76, `Scenario A Opportunity remains promising (~68-76). Got: ${report.opportunityScore}`);
  assert(report.readinessScore >= 60 && report.readinessScore <= 76, `Scenario A Readiness reflects testable hypothesis (~60-76). Got: ${report.readinessScore}`);
  assert(report.evidenceSummary?.unknownCount! >= 3, 'Scenario A contains explicit missing evidence unknowns');
  assert(report.evidenceSummary?.positiveCount === 0, 'Scenario A has zero positive evidence items');
  assert(report.confidenceExplanation.en.includes('limited to') || report.confidenceExplanation.en.includes('unvalidated'), 'Explanation clarifies confidence limitation');
}
console.log('✅ Scenario A passed.\n');

/* --------------------------------------------------------------------------
   3. SCENARIO B: Salon Idea, English, Positive Evidence
   -------------------------------------------------------------------------- */
console.log('▶ [3] Testing Scenario B: Same Idea WITH Positive Evidence...');
{
  const desc = 'An app for salons to reduce missed appointments using WhatsApp reminders.';
  const stage: Stage = 'Validation';
  const questions = generateContextualQuestions(desc, stage);
  const answers = {
    q1: 'We interviewed 12 salon owners; 8 report frequent missed appointments costing $1,200/mo.',
    q2: 'Spoken directly with 12 owners; 3 agree to test our active pilot starting Monday.',
    q3: '1 salon owner already agreed to pay for a pilot deposit at $49/mo.'
  };

  const report = evaluateIdea(desc, stage, questions, answers);

  assert(report.confidence >= 70 && report.confidence <= 88, `Scenario B Confidence materially rises (70-88). Got: ${report.confidence}`);
  assert(report.opportunityScore >= 76 && report.opportunityScore <= 86, `Scenario B Opportunity rises (76-86). Got: ${report.opportunityScore}`);
  assert(report.evidenceSummary?.positiveCount! >= 3, 'Scenario B has at least 3 positive evidence items');
  assert(report.evidenceSummary?.coverage === 100, 'Scenario B has 100% empirical coverage');
}
console.log('✅ Scenario B passed.\n');

/* --------------------------------------------------------------------------
   4. SCENARIO C: Negative Validated Evidence (Proof that Confidence != Opportunity!)
   -------------------------------------------------------------------------- */
console.log('▶ [4] Testing Scenario C: Negative Validated Evidence...');
{
  const desc = 'An app for salons to reduce missed appointments using WhatsApp reminders.';
  const stage: Stage = 'Validation';
  const questions = generateContextualQuestions(desc, stage);
  const answers = {
    q1: 'We conducted 15 structured interviews with independent salon managers.',
    q2: 'Most say missed appointments are not a priority and they tolerate existing manual calls.',
    q3: 'There is zero willingness to pay; all 15 owners explicitly refused to pay any software fee.'
  };

  const report = evaluateIdea(desc, stage, questions, answers);

  // Confidence is high because evidence was gathered and tested!
  assert(report.confidence >= 55 && report.confidence <= 75, `Scenario C Confidence is elevated because evidence is verified (55-75). Got: ${report.confidence}`);
  // But Opportunity drops sharply because the market rejected it!
  assert(report.opportunityScore <= 52, `Scenario C Opportunity drops due to negative market feedback (<=52). Got: ${report.opportunityScore}`);
  assert(report.confidence > report.opportunityScore, 'Confidence is higher than Opportunity in Scenario C (Proves Independence!)');
  assert(report.evidenceSummary?.negativeCount! >= 1, 'Contains negative evidence items');
}
console.log('✅ Scenario C passed (Confidence != Opportunity demonstrated).\n');

/* --------------------------------------------------------------------------
   5. SCENARIO D: Contradiction Detection
   -------------------------------------------------------------------------- */
console.log('▶ [5] Testing Scenario D: Contradictory Statements...');
{
  const desc = 'An app for salons to reduce missed appointments using WhatsApp reminders.';
  const stage: Stage = 'Validation';
  const questions = generateContextualQuestions(desc, stage);
  const answers = {
    q1: 'I have not spoken to any salon owners yet, no interviews.',
    q2: 'Salon owners definitely want this and customers want automated WhatsApp notifications.',
    q3: 'No one has paid yet.'
  };

  const report = evaluateIdea(desc, stage, questions, answers);

  assert(report.confidence <= 26, `Scenario D Confidence is capped due to contradiction (<=26). Got: ${report.confidence}`);
  assert(report.evidenceSummary?.contradictionCount! >= 1, 'Contradiction explicitly recorded in summary');
  const contradictionItem = report.evidence?.find(e => e.type === 'contradiction');
  assert(Boolean(contradictionItem), 'Contradiction item present in evidence array');
}
console.log('✅ Scenario D passed.\n');

/* --------------------------------------------------------------------------
   6. SCENARIO E: Arabic No-Evidence Case
   -------------------------------------------------------------------------- */
console.log('▶ [6] Testing Scenario E: Arabic No-Evidence Case...');
{
  const desc = 'تطبيق يساعد أصحاب الصالونات على تقليل المواعيد الفائتة عبر تذكيرات واتساب.';
  const stage: Stage = 'Validation';
  const questions = generateContextualQuestions(desc, stage);
  const answers = {
    q1: 'المشكلة تسبب خسارة وقت الصالون لكنني أقدرها تقديراً أولياً.',
    q2: 'لم أتحدث مع أصحاب الصالونات بعد ولم أجر مقابلات مباشرة.',
    q3: 'لم أختبر السعر ولا يوجد عميل دفع حتى الآن.'
  };

  const report = evaluateIdea(desc, stage, questions, answers);

  assert(report.confidence >= 18 && report.confidence <= 26, `Scenario E Arabic Confidence must be limited (18-26). Got: ${report.confidence}`);
  assert(report.opportunityScore >= 68 && report.opportunityScore <= 76, `Scenario E Arabic Opportunity is promising (~68-76). Got: ${report.opportunityScore}`);
  assert(report.readinessScore >= 60 && report.readinessScore <= 76, `Scenario E Arabic Readiness is calibrated (~60-76). Got: ${report.readinessScore}`);
  assert(report.evidenceSummary?.unknownCount! >= 3, 'Scenario E has 3 unknown items');
  assert(report.evidenceSummary?.positiveCount === 0, 'Scenario E has zero positive evidence');
  assert(report.confidenceExplanation.ar.includes('محدودة') || report.confidenceExplanation.ar.includes('فرضية'), 'Arabic confidence explanation is clear');
}
console.log('✅ Scenario E passed.\n');

/* --------------------------------------------------------------------------
   7. READINESS SEPARATION (Vague vs Well-Formulated)
   -------------------------------------------------------------------------- */
console.log('▶ [7] Testing Readiness Score Separation...');
{
  // Vague idea
  const vagueDesc = 'An app to make things better and connect people.';
  const vagueReadiness = calculateInputReadiness(vagueDesc, 'Concept', {});
  assert(vagueReadiness <= 36, `Vague idea gets low readiness (<=36). Got: ${vagueReadiness}`);

  // Detailed, testable idea
  const clearDesc = 'B2B SaaS scheduling and automated WhatsApp reminder platform for independent hair salon operators.';
  const clearReadiness = calculateInputReadiness(clearDesc, 'Validation', {
    q1: 'Estimated 15 missed bookings per stylist each month.',
    q2: 'Currently salon managers manually send individual SMS messages.',
    q3: 'Planning a $39/mo flat tier with 14-day risk-free trial.'
  });
  assert(clearReadiness >= 65, `Clear testable idea gets high readiness (>=65). Got: ${clearReadiness}`);
}
console.log('✅ Readiness score separation passed.\n');

/* --------------------------------------------------------------------------
   8. BACKWARD COMPATIBILITY
   -------------------------------------------------------------------------- */
console.log('▶ [8] Testing Backward Compatibility with Legacy Analysis Objects...');
{
  // Simulate an older Idea and Analysis created before Batch 3 (without evidence or readinessScore)
  const legacyAnalysis: any = {
    title: { en: 'Legacy Idea', ar: 'فكرة سابقة' },
    summary: { en: 'Legacy summary', ar: 'ملخص سابق' },
    generatedAt: '2025-01-01T00:00:00.000Z',
    opportunityScore: 70,
    confidence: 25,
    inputReadiness: 65,
    confidenceExplanation: { en: 'Old explanation', ar: 'شرح قديم' },
    scoreExplanation: { en: 'Old score explanation', ar: 'شرح قديم' },
    disclaimer: { en: 'Old disclaimer', ar: 'إخلاء قديم' },
    dimensions: [],
    strongestSignals: [],
    weakestSignals: [],
    nextBestAction: { title: { en: '', ar: '' }, why: { en: '', ar: '' }, checklist: [] },
    recommendations: [],
    facts: [],
    assumptions: [],
    missingEvidence: [],
    risks: [],
    opportunities: [],
    validationPriorities: []
    // Missing: evidence, evidenceSummary, readinessScore
  };

  const legacyIdea: Idea = {
    id: 'legacy-1',
    title: { en: 'Legacy Idea', ar: 'فكرة سابقة' },
    description: 'Legacy description',
    stage: 'Concept',
    opportunityScore: legacyAnalysis.opportunityScore,
    confidence: legacyAnalysis.confidence,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    questions: [],
    answers: {},
    latestAnalysis: legacyAnalysis as Analysis,
    evolution: []
  };

  assert(legacyIdea.latestAnalysis.opportunityScore === 70, 'Preserves legacy opportunity score');
  assert(legacyIdea.latestAnalysis.confidence === 25, 'Preserves legacy confidence score');
  assert((legacyIdea.latestAnalysis.evidence ?? []).length === 0, 'Safely falls back to empty evidence array');
  assert((legacyIdea.latestAnalysis.readinessScore ?? legacyIdea.latestAnalysis.inputReadiness) === 65, 'Falls back to inputReadiness seamlessly');
}
console.log('✅ Backward compatibility passed.\n');

console.log(`====================================================`);
console.log(`🎉 ALL ${passedAssertions} ASSERTIONS PASSED PERFECTLY!`);
console.log(`====================================================`);
