import { Idea, Snapshot, LocalizedString } from '../types';

export interface IdeaMonthlyScore {
  ideaId: string;
  title: LocalizedString;
  score: number;
  confidence: number;
  deltaFromPrevMonth: number;
}

export interface MonthlyTrendPoint {
  monthKey: string; // e.g. "2026-08"
  year: number;
  monthIndex: number; // 0-11
  label: LocalizedString;
  shortLabel: LocalizedString;
  avgOpportunityScore: number;
  avgConfidence: number;
  activeIdeasCount: number;
  snapshotCount: number;
  momDelta: number; // point change from previous month (+3.5)
  momGrowthPct: number; // percentage change from previous month (+5.2%)
  direction: 'positive' | 'negative' | 'neutral';
  topMover: {
    ideaId: string;
    title: LocalizedString;
    delta: number;
    currentScore: number;
  } | null;
  movers: {
    improved: number;
    unchanged: number;
    declined: number;
  };
  ideaScores: IdeaMonthlyScore[];
}

export interface PortfolioMoMStats {
  history: MonthlyTrendPoint[];
  latestMonth: MonthlyTrendPoint | null;
  previousMonth: MonthlyTrendPoint | null;
  latestMomGrowthPct: number;
  latestMomDelta: number;
  direction: 'positive' | 'negative' | 'neutral';
  totalTrackedSnapshots: number;
  totalActiveIdeas: number;
  averageScoreAcrossAll: number;
  highestMonth: MonthlyTrendPoint | null;
  lowestMonth: MonthlyTrendPoint | null;
  hasMultipleMonths: boolean;
  hasEvolutionSnapshots: boolean;
  baselineMonth: MonthlyTrendPoint | null;
  totalGrowthSinceBaseline: number;
}

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

const ENGLISH_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

const ENGLISH_MONTHS_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function getMonthLabels(year: number, monthIndex: number): { label: LocalizedString; shortLabel: LocalizedString } {
  const enFull = `${ENGLISH_MONTHS_FULL[monthIndex]} ${year}`;
  const enShort = `${ENGLISH_MONTHS_SHORT[monthIndex]} ${year}`;
  const arFull = `${ARABIC_MONTHS[monthIndex]} ${year}`;
  const arShort = `${ARABIC_MONTHS[monthIndex]} ${year}`;

  return {
    label: { en: enFull, ar: arFull },
    shortLabel: { en: enShort, ar: arShort }
  };
}

/**
 * Calculates month-over-month growth in opportunity score across all saved ideas
 * by aggregating tracked evolution snapshot data.
 */
export function calculatePortfolioMoMTrend(ideas: Idea[]): PortfolioMoMStats {
  if (!ideas || ideas.length === 0) {
    return {
      history: [],
      latestMonth: null,
      previousMonth: null,
      latestMomGrowthPct: 0,
      latestMomDelta: 0,
      direction: 'neutral',
      totalTrackedSnapshots: 0,
      totalActiveIdeas: 0,
      averageScoreAcrossAll: 0,
      highestMonth: null,
      lowestMonth: null,
      hasMultipleMonths: false,
      hasEvolutionSnapshots: false,
      baselineMonth: null,
      totalGrowthSinceBaseline: 0
    };
  }

  // 1. Gather all timeline records (snapshots and initial idea dates)
  interface NormalizedRecord {
    ideaId: string;
    ideaTitle: LocalizedString;
    score: number;
    confidence: number;
    timestamp: Date;
    monthKey: string;
    isSnapshot: boolean;
  }

  const allRecords: NormalizedRecord[] = [];
  let totalSnapshotsCount = 0;

  ideas.forEach((idea) => {
    const rawTitle: LocalizedString =
      typeof idea.title === 'string'
        ? { en: idea.title, ar: idea.title }
        : idea.title || { en: 'Untitled Idea', ar: 'فكرة بدون عنوان' };

    if (Array.isArray(idea.evolution) && idea.evolution.length > 0) {
      idea.evolution.forEach((snap: Snapshot) => {
        totalSnapshotsCount++;
        const date = new Date(snap.createdAt);
        const validDate = isNaN(date.getTime()) ? new Date() : date;
        const year = validDate.getUTCFullYear();
        const month = String(validDate.getUTCMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;

        allRecords.push({
          ideaId: idea.id,
          ideaTitle: rawTitle,
          score: Math.round(snap.opportunityScore || 0),
          confidence: Math.round(snap.confidence || 0),
          timestamp: validDate,
          monthKey,
          isSnapshot: true
        });
      });
    } else {
      // Fallback to idea creation/update timestamp if no snapshots yet
      const date = new Date(idea.createdAt || idea.updatedAt || Date.now());
      const validDate = isNaN(date.getTime()) ? new Date() : date;
      const year = validDate.getUTCFullYear();
      const month = String(validDate.getUTCMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;

      allRecords.push({
        ideaId: idea.id,
        ideaTitle: rawTitle,
        score: Math.round(idea.opportunityScore || 0),
        confidence: Math.round(idea.confidence || 0),
        timestamp: validDate,
        monthKey,
        isSnapshot: false
      });
    }
  });

  // Sort all records chronologically
  allRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // 2. Discover all distinct monthKeys in chronological order
  const monthKeysSet = new Set<string>();
  allRecords.forEach((r) => monthKeysSet.add(r.monthKey));
  const sortedMonthKeys = Array.from(monthKeysSet).sort();

  if (sortedMonthKeys.length === 0) {
    const now = new Date();
    const curYear = now.getUTCFullYear();
    const curMonth = String(now.getUTCMonth() + 1).padStart(2, '0');
    sortedMonthKeys.push(`${curYear}-${curMonth}`);
  }

  // 3. For each month, determine the state of all active ideas up to that month
  const history: MonthlyTrendPoint[] = [];

  for (let i = 0; i < sortedMonthKeys.length; i++) {
    const monthKey = sortedMonthKeys[i];
    const [yearStr, monthStr] = monthKey.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;
    const { label, shortLabel } = getMonthLabels(year, monthIndex);

    // End of this calendar month in UTC
    const endOfMonth = new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999));

    // Find all records that occurred on or before the end of this month
    const eligibleRecords = allRecords.filter((r) => r.timestamp <= endOfMonth);

    // For each unique idea that had any activity on or before this month, pick its latest record
    const latestPerIdea = new Map<string, NormalizedRecord>();
    eligibleRecords.forEach((r) => {
      const existing = latestPerIdea.get(r.ideaId);
      if (!existing || r.timestamp > existing.timestamp) {
        latestPerIdea.set(r.ideaId, r);
      }
    });

    const activeIdeas = Array.from(latestPerIdea.values());
    const activeIdeasCount = activeIdeas.length;

    // Calculate this month's average opportunity score & confidence
    const sumScore = activeIdeas.reduce((sum, item) => sum + item.score, 0);
    const sumConfidence = activeIdeas.reduce((sum, item) => sum + item.confidence, 0);
    const avgScore = activeIdeasCount > 0 ? Number((sumScore / activeIdeasCount).toFixed(1)) : 0;
    const avgConfidence = activeIdeasCount > 0 ? Math.round(sumConfidence / activeIdeasCount) : 0;

    // Count snapshots specifically recorded during this month
    const snapshotsThisMonth = allRecords.filter(
      (r) => r.monthKey === monthKey && r.isSnapshot
    ).length;

    // Previous month comparison
    const prevMonthPoint = i > 0 ? history[i - 1] : null;
    let momDelta = 0;
    let momGrowthPct = 0;
    let direction: 'positive' | 'negative' | 'neutral' = 'neutral';

    let improved = 0;
    let unchanged = 0;
    let declined = 0;
    let topMover: MonthlyTrendPoint['topMover'] = null;
    let maxAbsDelta = -1;

    const ideaScores: IdeaMonthlyScore[] = [];

    if (prevMonthPoint) {
      momDelta = Number((avgScore - prevMonthPoint.avgOpportunityScore).toFixed(1));
      if (prevMonthPoint.avgOpportunityScore > 0) {
        momGrowthPct = Number(
          (((avgScore - prevMonthPoint.avgOpportunityScore) / prevMonthPoint.avgOpportunityScore) * 100).toFixed(1)
        );
      }

      if (momDelta > 0.05) direction = 'positive';
      else if (momDelta < -0.05) direction = 'negative';
      else direction = 'neutral';

      // Compare individual ideas against the previous month
      const prevIdeaScoresMap = new Map(
        prevMonthPoint.ideaScores.map((is) => [is.ideaId, is.score])
      );

      activeIdeas.forEach((item) => {
        const prevScore = prevIdeaScoresMap.get(item.ideaId);
        const itemDelta = prevScore !== undefined ? item.score - prevScore : 0;

        ideaScores.push({
          ideaId: item.ideaId,
          title: item.ideaTitle,
          score: item.score,
          confidence: item.confidence,
          deltaFromPrevMonth: itemDelta
        });

        if (prevScore !== undefined) {
          if (itemDelta > 0) improved++;
          else if (itemDelta < 0) declined++;
          else unchanged++;

          if (Math.abs(itemDelta) > maxAbsDelta && itemDelta !== 0) {
            maxAbsDelta = Math.abs(itemDelta);
            topMover = {
              ideaId: item.ideaId,
              title: item.ideaTitle,
              delta: itemDelta,
              currentScore: item.score
            };
          }
        } else {
          // Newly introduced idea this month
          unchanged++;
          if (maxAbsDelta < 0) {
            topMover = {
              ideaId: item.ideaId,
              title: item.ideaTitle,
              delta: 0,
              currentScore: item.score
            };
          }
        }
      });
    } else {
      // First baseline month
      activeIdeas.forEach((item) => {
        ideaScores.push({
          ideaId: item.ideaId,
          title: item.ideaTitle,
          score: item.score,
          confidence: item.confidence,
          deltaFromPrevMonth: 0
        });
      });
      unchanged = activeIdeasCount;
    }

    history.push({
      monthKey,
      year,
      monthIndex,
      label,
      shortLabel,
      avgOpportunityScore: avgScore,
      avgConfidence,
      activeIdeasCount,
      snapshotCount: snapshotsThisMonth,
      momDelta,
      momGrowthPct,
      direction,
      topMover,
      movers: { improved, unchanged, declined },
      ideaScores
    });
  }

  const latestMonth = history.length > 0 ? history[history.length - 1] : null;
  const previousMonth = history.length > 1 ? history[history.length - 2] : null;
  const baselineMonth = history.length > 0 ? history[0] : null;

  const latestMomGrowthPct = latestMonth ? latestMonth.momGrowthPct : 0;
  const latestMomDelta = latestMonth ? latestMonth.momDelta : 0;
  const direction = latestMonth ? latestMonth.direction : 'neutral';

  const totalActiveIdeas = ideas.length;
  const averageScoreAcrossAll = Math.round(
    ideas.reduce((acc, curr) => acc + (curr.opportunityScore || 0), 0) / (ideas.length || 1)
  );

  let highestMonth: MonthlyTrendPoint | null = null;
  let lowestMonth: MonthlyTrendPoint | null = null;

  if (history.length > 0) {
    highestMonth = [...history].sort((a, b) => b.avgOpportunityScore - a.avgOpportunityScore)[0];
    lowestMonth = [...history].sort((a, b) => a.avgOpportunityScore - b.avgOpportunityScore)[0];
  }

  const totalGrowthSinceBaseline =
    latestMonth && baselineMonth
      ? Number((latestMonth.avgOpportunityScore - baselineMonth.avgOpportunityScore).toFixed(1))
      : 0;

  return {
    history,
    latestMonth,
    previousMonth,
    latestMomGrowthPct,
    latestMomDelta,
    direction,
    totalTrackedSnapshots: totalSnapshotsCount,
    totalActiveIdeas,
    averageScoreAcrossAll,
    highestMonth,
    lowestMonth,
    hasMultipleMonths: history.length > 1,
    hasEvolutionSnapshots: totalSnapshotsCount > 0,
    baselineMonth,
    totalGrowthSinceBaseline
  };
}
