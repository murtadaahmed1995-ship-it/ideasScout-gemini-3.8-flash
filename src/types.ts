export type Stage = 'Concept' | 'Research' | 'Validation' | 'Growth';

export type WorkspaceView = 'dashboard' | 'analyze' | 'report' | 'vault' | 'ask' | 'profile';

export type ReportTab = 'overview' | 'evidence' | 'risks' | 'evolution';

export interface LocalizedString {
  en: string;
  ar: string;
}

export interface Question {
  id: string;
  prompt: LocalizedString;
  rationale: LocalizedString;
}

export interface Dimension {
  key: string;
  label: LocalizedString;
  score: number;
  rationale: LocalizedString;
}

export interface SignalItem {
  label: LocalizedString;
  detail: LocalizedString;
}

export interface NextBestAction {
  title: LocalizedString;
  why: LocalizedString;
  checklist: LocalizedString[];
}

export type EvidenceType = 'positive' | 'negative' | 'unknown' | 'assumption' | 'contradiction';

export type EvidenceProvenance =
  | 'user_statement'
  | 'clarification_answer'
  | 'engine_inference'
  | 'missing_evidence'
  | 'contradiction_detection'
  | 'demo_sample'
  | 'generated_example';

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  dimension: string;
  claim: LocalizedString;
  provenance: EvidenceProvenance;
  sourceRef?: string;
  weight?: number;
  status: 'direct' | 'derived';
  contradictionDetails?: LocalizedString;
}

export interface EvidenceSummary {
  positiveCount: number;
  negativeCount: number;
  unknownCount: number;
  assumptionCount: number;
  contradictionCount: number;
  coverage: number; // 0-100% empirical evidence coverage
  primaryEvidenceFound: boolean;
}

export interface Snapshot {
  id: string;
  opportunityScore: number;
  confidence: number;
  readinessScore?: number;
  createdAt: string;
  changeSummary: LocalizedString;
}

export interface Analysis {
  title: LocalizedString;
  summary: LocalizedString;
  generatedAt: string;
  opportunityScore: number;
  confidence: number;
  confidenceScore?: number;
  inputReadiness: number;
  readinessScore: number;
  confidenceExplanation: LocalizedString;
  scoreExplanation: LocalizedString;
  readinessExplanation?: LocalizedString;
  disclaimer: LocalizedString;
  dimensions: Dimension[];
  strongestSignals: SignalItem[];
  weakestSignals: SignalItem[];
  nextBestAction: NextBestAction;
  recommendations: SignalItem[];
  facts: SignalItem[];
  assumptions: SignalItem[];
  missingEvidence: SignalItem[];
  risks: SignalItem[];
  opportunities: SignalItem[];
  validationPriorities: SignalItem[];
  evidence?: EvidenceItem[];
  evidenceSummary?: EvidenceSummary;
}

export interface Idea {
  id: string;
  title: LocalizedString;
  description: string;
  stage: Stage;
  tags?: string[];
  opportunityScore: number;
  confidence: number;
  readinessScore?: number;
  updatedAt: string;
  createdAt: string;
  questions: Question[];
  answers: Record<string, string>;
  latestAnalysis: Analysis;
  evolution: Snapshot[];
  isSample?: boolean;
  source?: 'user' | 'demo_sample';
}

export interface Profile {
  userId: string;
  name: string;
  email: string;
  role: string;
  timezone: string;
  language: 'en' | 'ar';
  weeklyDigest: boolean;
  signalAlerts: boolean;
}
