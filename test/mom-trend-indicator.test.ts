import { calculatePortfolioMoMTrend } from '../src/utils/trendAnalytics';
import { initialIdeas } from '../src/data/sampleIdeas';
import { Idea } from '../src/types';

console.log('====================================================');
console.log('   MONTH-OVER-MONTH OPPORTUNITY TREND TEST SUITE   ');
console.log('====================================================');

// Test 1: Real-world sample ideas with evolution snapshots
console.log('▶ [1] Testing MoM calculation on initial ideas with tracked snapshots...');
const stats1 = calculatePortfolioMoMTrend(initialIdeas);

if (!stats1.hasMultipleMonths) {
  throw new Error('Expected multiple months in initial ideas');
}
if (!stats1.hasEvolutionSnapshots) {
  throw new Error('Expected evolution snapshots to be detected');
}
if (stats1.history.length < 3) {
  throw new Error(`Expected at least 3 months of history, got ${stats1.history.length}`);
}
if (stats1.latestMomGrowthPct <= 0) {
  throw new Error(`Expected positive MoM growth rate, got ${stats1.latestMomGrowthPct}%`);
}
if (stats1.latestMomDelta <= 0) {
  throw new Error(`Expected positive MoM delta, got ${stats1.latestMomDelta} pts`);
}
if (stats1.direction !== 'positive') {
  throw new Error(`Expected positive direction, got ${stats1.direction}`);
}
console.log(`✅ Passed: History has ${stats1.history.length} months. Latest MoM: +${stats1.latestMomGrowthPct}% (+${stats1.latestMomDelta} pts).`);

// Test 2: Single-month idea (baseline establishment)
console.log('▶ [2] Testing single-month idea baseline handling...');
const singleMonthIdea: Idea = {
  id: 'single-1',
  title: { en: 'Solo Idea', ar: 'فكرة وحيدة' },
  description: 'Test idea',
  stage: 'Concept',
  opportunityScore: 75,
  confidence: 40,
  createdAt: '2026-09-01T00:00:00Z',
  updatedAt: '2026-09-01T00:00:00Z',
  questions: [],
  answers: {},
  latestAnalysis: {} as any,
  evolution: [
    {
      id: 'snap-solo-1',
      opportunityScore: 75,
      confidence: 40,
      createdAt: '2026-09-01T00:00:00Z',
      changeSummary: { en: 'Init', ar: 'بداية' }
    }
  ]
};

const stats2 = calculatePortfolioMoMTrend([singleMonthIdea]);
if (stats2.history.length !== 1) {
  throw new Error(`Expected exactly 1 month, got ${stats2.history.length}`);
}
if (stats2.hasMultipleMonths) {
  throw new Error('Expected hasMultipleMonths to be false for single month');
}
if (stats2.latestMomDelta !== 0 || stats2.latestMomGrowthPct !== 0) {
  throw new Error('Expected 0 delta/pct for single baseline month');
}
console.log('✅ Passed: Single month gracefully identified as baseline with 0% delta.');

// Test 3: Downward score trend (contraction)
console.log('▶ [3] Testing downward score trajectory (negative MoM)...');
const decliningIdea: Idea = {
  id: 'dec-1',
  title: { en: 'Pivoting Idea', ar: 'فكرة متراجعة' },
  description: 'High risks uncovered',
  stage: 'Validation',
  opportunityScore: 50,
  confidence: 60,
  createdAt: '2026-05-10T00:00:00Z',
  updatedAt: '2026-06-15T00:00:00Z',
  questions: [],
  answers: {},
  latestAnalysis: {} as any,
  evolution: [
    {
      id: 'snap-may',
      opportunityScore: 80,
      confidence: 30,
      createdAt: '2026-05-10T00:00:00Z',
      changeSummary: { en: 'May high', ar: 'مايو' }
    },
    {
      id: 'snap-june',
      opportunityScore: 60,
      confidence: 65,
      createdAt: '2026-06-15T00:00:00Z',
      changeSummary: { en: 'June risk found', ar: 'يونيو' }
    }
  ]
};

const stats3 = calculatePortfolioMoMTrend([decliningIdea]);
if (stats3.direction !== 'negative') {
  throw new Error(`Expected negative direction, got ${stats3.direction}`);
}
if (stats3.latestMomDelta !== -20) {
  throw new Error(`Expected -20 delta, got ${stats3.latestMomDelta}`);
}
if (stats3.latestMomGrowthPct !== -25) {
  throw new Error(`Expected -25% growth, got ${stats3.latestMomGrowthPct}%`);
}
if (stats3.latestMonth?.movers.declined !== 1) {
  throw new Error('Expected 1 declined mover');
}
console.log(`✅ Passed: Contraction detected: ${stats3.latestMomGrowthPct}% (${stats3.latestMomDelta} pts), 1 idea declined.`);

// Test 4: Empty list safety
console.log('▶ [4] Testing empty array safety...');
const stats4 = calculatePortfolioMoMTrend([]);
if (stats4.history.length !== 0 || stats4.totalActiveIdeas !== 0) {
  throw new Error('Expected empty stats for empty input');
}
console.log('✅ Passed: Empty array returned clean zero-state without exceptions.');

console.log('====================================================');
console.log('🎉 ALL MoM TREND INDICATOR TESTS PASSED PERFECTLY! ');
console.log('====================================================');
