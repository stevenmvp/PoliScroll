export type AcademicDomain = 'history' | 'medicine' | 'math' | 'science' | 'languages' | 'pop_culture' | 'local_context' | 'custom';

export type DomainCategory = 'pop_culture' | 'academia' | 'local_context' | 'general_culture';

export interface AcademicSource {
  title: string;
  url?: string;
  snippet?: string;
  sourceDomain?: string; // e.g. "Wiki Oficial", "PubMed", "Portal Institucional"
}

export interface AcademicCorrectItem {
  term: string;
  explanation: string;
  category?: string;
}

export interface AcademicDistractorItem {
  term: string;
  explanation: string;
  mistakenOrigin: string; // e.g. "Dota 2 (Valve)" or "Popol Vuh (Mitología Maya)" or "Fémur (Anatomía)"
}

export interface TriviaQuestionItem {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source?: string;
}

export interface GameSpecificData {
  froggerTip?: string;
  bridgePrompt?: string;
  chickenHopPrompt?: string;
  flappyGates?: Array<{
    question: string;
    topOption: string;
    bottomOption: string;
    correctChoice: 'top' | 'bottom';
  }>;
  triviaQuestions?: TriviaQuestionItem[];
}

export interface AcademicTopic {
  id: string;
  title: string;
  domain: AcademicDomain;
  domainCategory?: DomainCategory;
  domainCategoryLabel?: string; // e.g. "Videojuegos / Ficción", "Ciencia / Medicina"
  normalizedTopic?: string;
  icon: string;
  promptQuestion: string; // e.g. "¿Cuáles de estos son dioses del panteón de la Grecia Clásica?"
  shortCriteria: string; // e.g. "Dioses Griegos"
  correctItems: AcademicCorrectItem[];
  distractorItems: AcademicDistractorItem[];
  description: string;
  sources?: AcademicSource[];
  gameSpecificData?: GameSpecificData;
  isCustom?: boolean;
}

export interface AcademicLogEntry {
  id: string;
  timestamp: number;
  topicId: string;
  topicTitle: string;
  gameId: string;
  concept: string;
  isCorrect: boolean;
  mistakenOrigin?: string;
  quickExplanation: string;
  detailedExplanation?: string;
  sources?: AcademicSource[];
  chatHistory?: Array<{
    role: 'user' | 'model';
    text: string;
    timestamp: number;
  }>;
}

export interface AcademicStats {
  totalInteractions: number;
  correctCount: number;
  incorrectCount: number;
  accuracyRate: number;
  currentStreak: number;
  bestStreak: number;
}
