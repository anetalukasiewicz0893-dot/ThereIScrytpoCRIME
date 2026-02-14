
export enum Priority {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

export enum AnalysisStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface AIAnalysis {
  isCryptoCrime: boolean;
  summary: string;
  amount: string;
  article: string;
  priority: Priority;
}

export interface GroundedCase extends AIAnalysis {
  id: string;
  signature: string;
  court: string;
  date: string;
  sourceUrl: string;
  region: 'Poland' | 'European Union';
  euContext?: string;
  folder?: string;
  isDiscarded?: boolean;
  isSaved?: boolean;
  location?: {
    lat: number;
    lng: number;
    city: string;
  };
}

export interface CourtJudgment {
  id: number;
  courtCases: string[];
  judgmentDate: string;
  textContent: string;
  courtType: string;
  analysis?: AIAnalysis;
  status: AnalysisStatus;
}
