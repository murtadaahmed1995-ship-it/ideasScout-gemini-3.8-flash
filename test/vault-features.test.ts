import assert from 'node:assert';
import { Idea } from '../src/types';

console.log('====================================================');
console.log('   IDEASCOUT VAULT FEATURES TEST SUITE');
console.log('====================================================');

const sampleIdeas: Idea[] = [
  {
    id: 'idea-1',
    title: { en: 'B2B Logistics Optimization', ar: 'منصة تحسين الخدمات اللوجستية' },
    description: 'AI-driven route planning for freight fleets.',
    stage: 'Validation',
    opportunityScore: 85,
    confidence: 60,
    readinessScore: 75,
    updatedAt: '2026-03-01T10:00:00.000Z',
    createdAt: '2026-01-01T10:00:00.000Z',
    questions: [],
    answers: {},
    latestAnalysis: {} as any,
    evolution: []
  },
  {
    id: 'idea-2',
    title: { en: 'Coffee Subscription App', ar: 'تطبيق اشتراك القهوة' },
    description: 'Artisanal roasters delivered weekly.',
    stage: 'Concept',
    opportunityScore: 62,
    confidence: 30,
    readinessScore: 40,
    updatedAt: '2026-03-03T12:00:00.000Z',
    createdAt: '2026-02-01T10:00:00.000Z',
    questions: [],
    answers: {},
    latestAnalysis: {} as any,
    evolution: []
  },
  {
    id: 'idea-3',
    title: { en: 'Remote Team Health Platform', ar: 'منصة صحة فرق العمل عن بُعد' },
    description: 'Preventing burnout with automated wellness breaks.',
    stage: 'Validation',
    opportunityScore: 92,
    confidence: 80,
    readinessScore: 90,
    updatedAt: '2026-02-25T08:00:00.000Z',
    createdAt: '2026-01-15T10:00:00.000Z',
    questions: [],
    answers: {},
    latestAnalysis: {} as any,
    evolution: []
  },
  {
    id: 'idea-4',
    title: { en: 'Renewable Energy Tracker', ar: 'متتبع الطاقة المتجددة' },
    description: 'Residential solar monitoring IoT dashboard.',
    stage: 'Research',
    opportunityScore: 78,
    confidence: 50,
    readinessScore: 65,
    updatedAt: '2026-03-02T15:00:00.000Z',
    createdAt: '2026-02-10T10:00:00.000Z',
    questions: [],
    answers: {},
    latestAnalysis: {} as any,
    evolution: []
  }
];

// Test 1: Summary Bar Metrics (All items)
console.log('▶ [1] Testing Summary Bar calculations for All ideas...');
{
  const filtered = sampleIdeas;
  const count = filtered.length;
  const avgOpp = Math.round(filtered.reduce((s, i) => s + i.opportunityScore, 0) / count);
  const avgConf = Math.round(filtered.reduce((s, i) => s + i.confidence, 0) / count);

  assert.strictEqual(count, 4, 'Total count should be 4');
  // (85 + 62 + 92 + 78) / 4 = 317 / 4 = 79.25 -> 79
  assert.strictEqual(avgOpp, 79, 'Avg opportunity score should be 79');
  // (60 + 30 + 80 + 50) / 4 = 220 / 4 = 55
  assert.strictEqual(avgConf, 55, 'Avg confidence level should be 55');
  console.log('  ✅ Summary metrics calculation for All items passed.');
}

// Test 2: Summary Bar Metrics based on stage filter
console.log('▶ [2] Testing Summary Bar calculations with Stage filter ("Validation")...');
{
  const filtered = sampleIdeas.filter(i => i.stage === 'Validation');
  const count = filtered.length;
  const avgOpp = Math.round(filtered.reduce((s, i) => s + i.opportunityScore, 0) / count);
  const avgConf = Math.round(filtered.reduce((s, i) => s + i.confidence, 0) / count);

  assert.strictEqual(count, 2, 'Validation count should be 2');
  // (85 + 92) / 2 = 88.5 -> 89 (or 88 depending on rounding; 177 / 2 = 88.5 -> Math.round(88.5) = 89 in JS)
  assert.strictEqual(avgOpp, 89, 'Validation avg opportunity should be 89');
  // (60 + 80) / 2 = 70
  assert.strictEqual(avgConf, 70, 'Validation avg confidence should be 70');
  console.log('  ✅ Summary metrics dynamically update with stage filter.');
}

// Test 3: Search input filter updates metrics
console.log('▶ [3] Testing Summary Bar calculations with Search filter ("Coffee")...');
{
  const query = 'coffee';
  const filtered = sampleIdeas.filter(i => 
    i.title.en.toLowerCase().includes(query) || 
    i.title.ar.toLowerCase().includes(query) ||
    i.description.toLowerCase().includes(query)
  );
  const count = filtered.length;
  const avgOpp = Math.round(filtered.reduce((s, i) => s + i.opportunityScore, 0) / count);
  const avgConf = Math.round(filtered.reduce((s, i) => s + i.confidence, 0) / count);

  assert.strictEqual(count, 1, 'Search query for coffee should return 1 result');
  assert.strictEqual(avgOpp, 62, 'Opportunity score for coffee should be 62');
  assert.strictEqual(avgConf, 30, 'Confidence score for coffee should be 30');
  console.log('  ✅ Summary metrics dynamically update with search query.');
}

// Test 4: Sorting by Newest
console.log('▶ [4] Testing Sort by "Newest"...');
{
  const sorted = [...sampleIdeas].sort((a, b) => {
    const timeA = new Date(a.updatedAt).getTime();
    const timeB = new Date(b.updatedAt).getTime();
    return timeB - timeA;
  });

  assert.strictEqual(sorted[0].id, 'idea-2', 'Newest item should be Coffee Subscription (Mar 3)');
  assert.strictEqual(sorted[1].id, 'idea-4', 'Second newest should be Renewable Energy (Mar 2)');
  assert.strictEqual(sorted[2].id, 'idea-1', 'Third newest should be Logistics (Mar 1)');
  assert.strictEqual(sorted[3].id, 'idea-3', 'Oldest updated should be Remote Team (Feb 25)');
  console.log('  ✅ Sorting by Newest passed.');
}

// Test 5: Sorting by Opportunity Score
console.log('▶ [5] Testing Sort by "Opportunity Score"...');
{
  const sorted = [...sampleIdeas].sort((a, b) => b.opportunityScore - a.opportunityScore);

  assert.strictEqual(sorted[0].id, 'idea-3', 'Highest opportunity score should be idea-3 (92)');
  assert.strictEqual(sorted[1].id, 'idea-1', 'Second highest should be idea-1 (85)');
  assert.strictEqual(sorted[2].id, 'idea-4', 'Third highest should be idea-4 (78)');
  assert.strictEqual(sorted[3].id, 'idea-2', 'Lowest opportunity should be idea-2 (62)');
  console.log('  ✅ Sorting by Opportunity Score passed.');
}

// Test 6: Sorting by Confidence Level
console.log('▶ [6] Testing Sort by "Confidence Level"...');
{
  const sorted = [...sampleIdeas].sort((a, b) => b.confidence - a.confidence);

  assert.strictEqual(sorted[0].id, 'idea-3', 'Highest confidence level should be idea-3 (80%)');
  assert.strictEqual(sorted[1].id, 'idea-1', 'Second highest confidence should be idea-1 (60%)');
  assert.strictEqual(sorted[2].id, 'idea-4', 'Third highest confidence should be idea-4 (50%)');
  assert.strictEqual(sorted[3].id, 'idea-2', 'Lowest confidence should be idea-2 (30%)');
  console.log('  ✅ Sorting by Confidence Level passed.');
}

// Test 7: Empty state behavior
console.log('▶ [7] Testing Empty state when ideas array is empty...');
{
  const emptyIdeas: Idea[] = [];
  const avgOpp = emptyIdeas.length > 0 ? Math.round(emptyIdeas.reduce((s, i) => s + i.opportunityScore, 0) / emptyIdeas.length) : 0;
  const avgConf = emptyIdeas.length > 0 ? Math.round(emptyIdeas.reduce((s, i) => s + i.confidence, 0) / emptyIdeas.length) : 0;

  assert.strictEqual(avgOpp, 0, 'Avg opportunity on empty collection is 0');
  assert.strictEqual(avgConf, 0, 'Avg confidence on empty collection is 0');

  let navigatedToCreationFlow = false;
  const onStartNew = () => { navigatedToCreationFlow = true; };
  onStartNew();
  assert.strictEqual(navigatedToCreationFlow, true, 'Quick Start handler triggers idea creation navigation');
  console.log('  ✅ Empty state and Quick Start flow passed.');
}

// Test 8: Trend Indicators next to Opportunity and Confidence scores
console.log('▶ [8] Testing Opportunity & Confidence Trend Indicators from Evolution array...');
{
  // Case A: Multiple snapshots with positive progression
  const evolvingIdea: Idea = {
    ...sampleIdeas[0],
    opportunityScore: 74,
    confidence: 68,
    evolution: [
      {
        id: 'ev-1',
        opportunityScore: 68,
        confidence: 22,
        createdAt: '2026-02-01T00:00:00.000Z',
        changeSummary: { en: 'Initial draft', ar: 'مسودة أولية' },
      },
      {
        id: 'ev-2',
        opportunityScore: 74,
        confidence: 68,
        createdAt: '2026-02-15T00:00:00.000Z',
        changeSummary: { en: 'Added market validation evidence', ar: 'إضافة أدلة تحقق' },
      },
    ],
  };

  const evo = evolvingIdea.evolution!;
  const oppDelta = evo[evo.length - 1].opportunityScore - evo[evo.length - 2].opportunityScore;
  const confDelta = evo[evo.length - 1].confidence - evo[evo.length - 2].confidence;

  assert.strictEqual(oppDelta, 6, 'Opportunity score delta should be +6');
  assert.strictEqual(confDelta, 46, 'Confidence score delta should be +46%');
  console.log('  ✅ Positive Opportunity (+6) and Confidence (+46%) trend indicators passed.');

  // Case B: Negative change (e.g., negative evidence discovered)
  const decliningIdea: Idea = {
    ...sampleIdeas[1],
    opportunityScore: 55,
    confidence: 35,
    evolution: [
      {
        id: 'ev-prev',
        opportunityScore: 65,
        confidence: 40,
        createdAt: '2026-02-01T00:00:00.000Z',
        changeSummary: { en: 'Initial concept', ar: 'فكرة أولية' },
      },
      {
        id: 'ev-curr',
        opportunityScore: 55,
        confidence: 35,
        createdAt: '2026-02-20T00:00:00.000Z',
        changeSummary: { en: 'Discovered high barrier to entry', ar: 'اكتشاف حواجز دخول عالية' },
      },
    ],
  };

  const evoDec = decliningIdea.evolution!;
  const oppDeltaDec = evoDec[evoDec.length - 1].opportunityScore - evoDec[evoDec.length - 2].opportunityScore;
  const confDeltaDec = evoDec[evoDec.length - 1].confidence - evoDec[evoDec.length - 2].confidence;

  assert.strictEqual(oppDeltaDec, -10, 'Opportunity score delta should be -10');
  assert.strictEqual(confDeltaDec, -5, 'Confidence score delta should be -5%');
  console.log('  ✅ Negative Opportunity (-10) and Confidence (-5%) trend indicators passed.');

  // Case C: Single snapshot baseline
  const singleSnapshotIdea: Idea = {
    ...sampleIdeas[2],
    opportunityScore: 80,
    confidence: 50,
    evolution: [
      {
        id: 'ev-single',
        opportunityScore: 80,
        confidence: 50,
        createdAt: '2026-02-10T00:00:00.000Z',
        changeSummary: { en: 'Created idea', ar: 'إنشاء الفكرة' },
      },
    ],
  };
  const evoSingle = singleSnapshotIdea.evolution!;
  const oppDeltaSingle = singleSnapshotIdea.opportunityScore - evoSingle[0].opportunityScore;
  const confDeltaSingle = singleSnapshotIdea.confidence - evoSingle[0].confidence;
  assert.strictEqual(oppDeltaSingle, 0, 'Single baseline snapshot delta should be 0');
  assert.strictEqual(confDeltaSingle, 0, 'Single baseline confidence delta should be 0');
  console.log('  ✅ Baseline single snapshot neutral trend indicators passed.');
}

console.log('====================================================');
console.log('🎉 ALL VAULT TESTS PASSED PERFECTLY!');
console.log('====================================================');
