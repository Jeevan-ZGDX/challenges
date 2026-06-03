export interface Stage {
  id: number;
  difficulty: string;
  title: string;
  paragraph: string;
  level_group?: string;
  scenario?: string;
}

export interface RoleOption {
  id: string;
  label: string;
  description?: string;
}

export interface PronunciationIssue {
  word: string;
  status: 'mispronounced' | 'needs_practice';
  suggestion: string;
}

export interface FluencySignals {
  long_pauses: number;
  repetitions: number;
  hesitations: number;
  fillers: number;
}

export interface ReadingSpeed {
  wpm: number;
  classification: 'Slow' | 'Normal' | 'Fast';
}

export interface AnalysisResponse {
  stage_id: number;
  role: string;
  stage_title: string;
  difficulty: string;
  transcript: string;
  duration_seconds: number;
  accuracy_score: number;
  pronunciation_score: number;
  fluency_score: number;
  confidence_score: number;
  final_score: number;
  passed: boolean;
  word_error_rate: number;
  match_percentage: number;
  reading_speed: ReadingSpeed;
  missing_words: string[];
  extra_words: string[];
  repeated_words: string[];
  difficult_words: PronunciationIssue[];
  fluency_signals: FluencySignals;
  suggestions: string[];
  low_confidence_words: string[];
  raw_confidence_average: number;
}

export interface AttemptRecord extends AnalysisResponse {
  id: string;
  createdAt: string;
}

export interface StageProgress {
  attempts: number;
  bestScore: number;
  passed: boolean;
  latestAttemptId?: string;
}

export interface ProgressState {
  highestUnlockedStage: number;
  bestScore: number;
  totalAttempts: number;
  completionPercentage: number;
  attempts: AttemptRecord[];
  weakWords: Record<string, number>;
  stageStats: Record<number, StageProgress>;
  latestAnalysis?: AttemptRecord;
}

export interface TrendPoint {
  label: string;
  accuracy: number;
  fluency: number;
  confidence: number;
}
