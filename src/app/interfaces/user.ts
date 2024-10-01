import { QuestionnaireResponse } from './questionnaire';

export interface UserWithResponses {
    username: string;
    completedQuestionnaires: number;
    responses: QuestionnaireResponse[];
  }