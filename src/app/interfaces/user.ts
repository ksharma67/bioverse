import { QuestionnaireResponse } from './questionnaire';

export interface User {
  username: string;
  completedQuestionnaires: number;
  responses?: Array<{
    questionnaireName: string;
    questionsAndAnswers: Array<{
      question: string;
      answer: {
        question_id: number;
      };
    }>;
  }>;
}

export interface UserWithResponses {
    username: string;
    completedQuestionnaires: number;
    responses: QuestionnaireResponse[];
  }