export interface Question {
  id: number;
  question: string;
  type: 'text' | 'select' | 'multiple' | 'mcq' | 'input';
  options?: string[];
}

export interface Questionnaire {
  id: number;
  title: string;
  questions: Question[];
}

export interface ParsedQuestion {
  id: number;
  question: {
    type: string;
    options?: string[];
    question?: string;
  };
}

export interface QuestionAndAnswer {
  question: string;
  answer: string; 
}

export interface QuestionnaireResponse {
  questionnaireName: string;                
  questionsAndAnswers: QuestionAndAnswer[]; 
}

export interface SubmitAnswersRequest {
  userId: number;
  answers: { [key: number]: string | string[] };
}