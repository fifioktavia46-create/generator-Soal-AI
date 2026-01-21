
export enum EducationLevel {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA'
}

export enum QuestionStyle {
  REGULAR = 'Reguler',
  HOTS = 'HOTS',
  AKM = 'AKM'
}

export enum TaxonomyType {
  BLOOM = 'Bloom (C1-C6)',
  SOLO = 'SOLO Taxonomy'
}

export interface Question {
  id: number;
  type: string;
  indicator: string;
  cognitiveLevel: string; 
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  questionText: string;
  options?: string[];
  correctAnswer: string;
  scoringGuide?: string;
  tpAssociated: string;
  needsImage: boolean;
  imagePrompt?: string; 
  generatedImageUrl?: string; 
}

export interface AssessmentData {
  schoolName: string;
  subject: string;
  level: EducationLevel;
  grade: string;
  phase: string;
  materials: string[];
  learningObjectives: string[];
  cpReference: string;
  questions: Question[];
  style: QuestionStyle;
  taxonomy: TaxonomyType;
}

export interface FormInputs {
  schoolName: string;
  subject: string;
  level: EducationLevel;
  grade: string;
  materials: string[];
  learningObjectives: string[];
  countMCQ: number;
  countShort: number;
  countEssay: number;
  style: QuestionStyle;
  taxonomy: TaxonomyType;
  smartImages: boolean; 
}
