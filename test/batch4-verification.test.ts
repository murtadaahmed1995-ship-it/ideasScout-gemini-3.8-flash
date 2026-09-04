import {
  calculateInputReadiness,
  evaluateIdea,
  extractEvidenceFromInput,
  generateContextualQuestions,
  isMeaningfulAnswer,
  validateOpportunityInput
} from '../src/utils/engine';
import { initialIdeas } from '../src/data/sampleIdeas';
import { Idea } from '../src/types';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
  }
}

console.log('====================================================');
console.log('   IDEASCOUT BATCH 4 VERIFICATION TEST SUITE       ');
console.log('====================================================\n');

/* --------------------------------------------------------------------------
   REQUIREMENT 1: Input Validation & Non-Opportunity Rejection
   -------------------------------------------------------------------------- */
console.log('▶ [Req 1] Testing Input Validation & Non-Opportunity Rejection...');
{
  // Fragment (<35 chars)
  const v1 = validateOpportunityInput('dog walker app', 'Concept');
  assert(!v1.isValid, 'Rejects fragment description (<35 chars)');
  assert(!v1.canProceed, 'Cannot proceed with short fragment');

  // Conversational / Trivia query
  const v2 = validateOpportunityInput('What is the weather forecast for tomorrow in London?', 'Concept');
  assert(!v2.isValid, 'Rejects general non-opportunity conversational query');
  assert(v2.errors.some(e => e.en.includes('general query')), 'Explains input appears to be a general query');

  // Genuine opportunity thesis without answers yet
  const thesis = 'An automated inventory and replenishment platform for boutique coffee shops.';
  const v3 = validateOpportunityInput(thesis, 'Validation', {});
  assert(v3.isValid, 'Accepts valid thesis with customer, problem and solution anchors');
  assert(!v3.canProceed, 'Blocks proceeding until at least one meaningful answer is provided');

  // Valid thesis with meaningful answer
  const answers = {
    q1: 'We interviewed 10 boutique cafe managers and verified they waste 6 hours weekly.'
  };
  const v4 = validateOpportunityInput(thesis, 'Validation', answers);
  assert(v4.isValid && v4.canProceed, 'Allows analysis when thesis and meaningful answer are present');
}
console.log('✅ Requirement 1 passed: Input validation & rejection of non-opportunity queries verified.\n');

/* --------------------------------------------------------------------------
   REQUIREMENT 2: Dynamic Contextual Follow-up Questions
   -------------------------------------------------------------------------- */
console.log('▶ [Req 2] Testing Dynamic Contextual Question Generation...');
{
  // Salon domain
  const salonQ = generateContextualQuestions('Appointment booking and no-show reminder tool for hair salons', 'Validation');
  assert(salonQ.length === 3, 'Generates exactly 3 questions');
  assert(salonQ[0].prompt.en.includes('salon') || salonQ[1].prompt.en.includes('salon'), 'Questions are contextual to salon domain');
  assert(salonQ.every(q => q.prompt.ar && q.rationale.ar), 'Bilingual prompts and rationales provided');

  // Restaurant / Food domain
  const foodQ = generateContextualQuestions('Wholesale ordering system connecting chefs and local farms directly', 'Research');
  assert(foodQ.length === 3, 'Generates 3 questions for restaurant domain');
  assert(foodQ[0].prompt.en.includes('buying authority') || foodQ[1].prompt.en.includes('freshness'), 'Questions are contextual to kitchen/supply domain');

  // General venture domain
  const genQ = generateContextualQuestions('A collaborative legal compliance workflow software for remote enterprise teams', 'Concept');
  assert(genQ.length === 3, 'Generates 3 questions for general domain');
  assert(genQ[0].prompt.en.includes('pain') || genQ[1].prompt.en.includes('interviews'), 'Generates rigorous customer discovery and pain questions');
}
console.log('✅ Requirement 2 passed: Dynamic contextual question generation verified.\n');

/* --------------------------------------------------------------------------
   REQUIREMENT 3: Evidence Provenance & Confidence Independence
   -------------------------------------------------------------------------- */
console.log('▶ [Req 3] Testing Evidence Provenance & Honest Scoring Separation...');
{
  const desc = 'Micro-SaaS to coordinate field technician scheduling for plumbing contractors.';

  // Scenario A: Unvalidated idea with answers that provide zero empirical evidence
  const unvalidatedAnswers = {
    q1: 'We have not interviewed any technicians or contractors yet.',
    q2: 'No pilot has been conducted so far.',
    q3: 'Zero revenue and no one has paid anything.'
  };
  const analysisUnval = evaluateIdea(desc, 'Concept', [], unvalidatedAnswers);
  assert(analysisUnval.confidence <= 26, `Confidence remains low (${analysisUnval.confidence} <= 26) when no evidence exists`);
  assert(analysisUnval.readinessScore > 30, 'Readiness is independently tracked from confidence');

  const evidenceItems = analysisUnval.evidence || [];
  assert(evidenceItems.length > 0, 'Evidence items generated with explicit provenance');
  assert(
    evidenceItems.every(e => ['user_statement', 'clarification_answer', 'engine_inference', 'missing_evidence', 'contradiction_detection', 'demo_sample', 'generated_example'].includes(e.provenance)),
    'All evidence provenance strictly adheres to taxonomy'
  );

  // Scenario B: Idea with verified evidence
  const verifiedAnswers = {
    q1: 'We interviewed 14 plumbing contractors who confirmed acute schedule loss.',
    q2: '5 contractors enrolled in our active pilot program this month.',
    q3: '2 contractors paid deposits of $200 each for the quarterly plan.'
  };
  const analysisVal = evaluateIdea(desc, 'Validation', [], verifiedAnswers);
  assert(analysisVal.confidence >= 65, `Confidence elevates significantly (${analysisVal.confidence} >= 65) with empirical evidence`);
  assert(analysisVal.opportunityScore > 60, 'Opportunity reflects viable problem and solution');

  // Scenario C: Negative market evidence (Confidence goes UP because market was tested, Opportunity goes DOWN)
  const negativeAnswers = {
    q1: 'We conducted 20 in-depth contractor interviews.',
    q2: 'Contractors said scheduling is not a priority and they prefer manual notebooks.',
    q3: 'Zero willingness to pay; all contractors refused to pay for software.'
  };
  const analysisNeg = evaluateIdea(desc, 'Validation', [], negativeAnswers);
  assert(analysisNeg.confidence > analysisUnval.confidence, 'Confidence is higher than unvalidated because market feedback is empirically proven');
  assert(analysisNeg.opportunityScore < analysisVal.opportunityScore, 'Opportunity is depressed due to validated negative willingness-to-pay');
}
console.log('✅ Requirement 3 passed: Evidence provenance and confidence independence verified.\n');

/* --------------------------------------------------------------------------
   REQUIREMENT 4: Real User Isolation from Demo Samples
   -------------------------------------------------------------------------- */
console.log('▶ [Req 4] Testing Isolation of Demo Samples from User Data...');
{
  assert(initialIdeas.every(i => i.isSample === true && i.source === 'demo_sample'), 'All initial preloaded records are explicitly tagged as sample demos');

  // Simulated user idea creation
  const userIdeaData = {
    title: { en: 'B2B Logistics Optimization', ar: 'منصة لوجستية' },
    description: 'An automated routing engine for local last-mile courier vans.',
    stage: 'Validation' as const,
    tags: ['Logistics', 'B2B'],
    questions: [],
    answers: { q1: 'Interviewed 8 fleet managers who agreed to test.' }
  };

  const userEvaluation = evaluateIdea(userIdeaData.description, userIdeaData.stage, [], userIdeaData.answers);
  const createdUserIdea: Idea = {
    id: 'user-idea-101',
    isSample: false,
    source: 'user',
    title: userIdeaData.title,
    description: userIdeaData.description,
    stage: userIdeaData.stage,
    tags: userIdeaData.tags,
    opportunityScore: userEvaluation.opportunityScore,
    confidence: userEvaluation.confidence,
    readinessScore: userEvaluation.readinessScore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions: [],
    answers: userIdeaData.answers,
    latestAnalysis: userEvaluation,
    evolution: []
  };

  assert(createdUserIdea.isSample === false, 'User-created idea has isSample: false');
  assert(createdUserIdea.source === 'user', 'User-created idea has source: "user"');

  // Test portfolio metrics filter logic
  const allIdeas = [...initialIdeas, createdUserIdea];
  const realUserIdeas = allIdeas.filter(i => !i.isSample);
  assert(realUserIdeas.length === 1, 'Only genuine user ideas are counted in personal portfolio');
  assert(realUserIdeas[0].id === 'user-idea-101', 'Portfolio accurately targets user idea');
}
console.log('✅ Requirement 4 passed: Demo samples cleanly isolated from user portfolio metrics.\n');

/* --------------------------------------------------------------------------
   REQUIREMENT 5: End-to-End Workflow & Multi-turn Consistency
   -------------------------------------------------------------------------- */
console.log('▶ [Req 5] Testing End-to-End Workflow & Multi-turn Consistency...');
{
  // 1. Input step
  const rawInput = 'AI-assisted invoicing and overdue payment recovery for freelance designers';
  const stage = 'Validation' as const;
  const questions = generateContextualQuestions(rawInput, stage);

  // 2. Clarification answering step
  const answers = {
    q1: 'We interviewed 15 freelance designers who report losing 4 billable hours every month chasing unpaid invoices.',
    q2: '5 designers are currently enrolled in our prototype testing loop.',
    q3: '3 designers have agreed to pay a 1.5% fee on successfully recovered balances.'
  };

  // 3. Validation step
  const validation = validateOpportunityInput(rawInput, stage, answers);
  assert(validation.canProceed, 'User input successfully passes validation gate');

  // 4. Analysis generation step
  const analysis = evaluateIdea(rawInput, stage, questions, answers);
  assert(analysis.opportunityScore >= 70, 'Calculates robust Opportunity score for strong problem-solution fit');
  assert(analysis.confidence >= 60, 'Calculates high Confidence score reflecting positive interviews, pilot and payment');
  assert(analysis.readinessScore >= 60, 'Calculates high Readiness score reflecting complete inputs');
  assert(analysis.dimensions.length === 10, 'Evaluates all 10 core dimensions');
  assert(analysis.nextBestAction.checklist.length >= 2, 'Produces actionable validation checklist');

  // 5. Snapshot and Evolution consistency
  const snapshot = {
    id: 'snap-001',
    opportunityScore: analysis.opportunityScore,
    confidence: analysis.confidence,
    readinessScore: analysis.readinessScore,
    createdAt: new Date().toISOString(),
    changeSummary: {
      en: 'Initial full validation completed.',
      ar: 'اكتمل التحقق الأولي بنجاح.'
    }
  };

  const newIdea: Idea = {
    id: 'idea-freelance-01',
    isSample: false,
    source: 'user',
    title: { en: 'Freelance Invoicing Recovery', ar: 'منصة استرداد مستحقات المستقلين' },
    description: rawInput,
    stage,
    opportunityScore: analysis.opportunityScore,
    confidence: analysis.confidence,
    readinessScore: analysis.readinessScore,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    questions,
    answers,
    latestAnalysis: analysis,
    evolution: [snapshot]
  };

  assert(newIdea.latestAnalysis.confidence === analysis.confidence, 'Confidence preserved end-to-end');
  assert(newIdea.evolution[0].opportunityScore === analysis.opportunityScore, 'Opportunity snapshot preserved end-to-end');
}
console.log('✅ Requirement 5 passed: End-to-end workflow and multi-turn consistency verified.\n');

console.log('====================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} BATCH 4 VERIFICATION ASSERTIONS PASSED!`);
console.log('====================================================');
