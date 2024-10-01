import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../database/db';
import type { UserRow } from '../../interfaces/admin';
import type { QuestionnaireResponse } from '../../interfaces/questionnaire';

export async function GET(request: NextRequest) {
  const client = await pool.connect();
  try {
    // Fetch user summaries with completed questionnaires
    const userSummariesResult = await client.query(`
      SELECT 
          u.username, 
          COUNT(DISTINCT ua.questionnaire_id) AS completed_questionnaires
      FROM 
          users u
      LEFT JOIN 
          user_answers ua ON u.id = ua.user_id
      GROUP BY 
          u.username;
    `);

    const userSummaries = userSummariesResult.rows.map((row: UserRow) => ({
      username: row.username,
      completedQuestionnaires: parseInt(row.completed_questionnaires, 10)
    }));

    // For each user, fetch their responses for each questionnaire
    const usersWithResponses = await Promise.all(userSummaries.map(async (summary) => {
      // Fetching the questionnaires completed by the user
      const questionnairesResult = await client.query(`
          SELECT DISTINCT 
              questionnaire_id 
          FROM 
              user_answers 
          WHERE 
              user_id = (SELECT id FROM users WHERE username = $1);
      `, [summary.username]);

      const questionnaireResponses: QuestionnaireResponse[] = [];

      for (const row of questionnairesResult.rows) {
        const questionnaireId = row.questionnaire_id;

        // Fetch questions for the questionnaire
        const questionsResult = await client.query(`
            SELECT 
                qqs.id AS question_id,
                qqs.question->>'question' AS question_text
            FROM 
                questionnaire_junction qj
            JOIN 
                questionnaire_questions qqs ON qj.question_id = qqs.id
            WHERE 
                qj.questionnaire_id = $1
            ORDER BY 
                qj.priority;
        `, [questionnaireId]);

        // Fetch submitted answers for the questionnaire
        const answersResult = await client.query(`
            SELECT 
                question_id, 
                answer 
            FROM 
                user_answers 
            WHERE 
                questionnaire_id = $1 AND user_id = (SELECT id FROM users WHERE username = $2);
        `, [questionnaireId, summary.username]);

        // Construct the responses
        const questionsAndAnswers = questionsResult.rows.map((question) => {
          // Fetch answer for the question based on its ID
          const answerEntry = answersResult.rows.find(answer => answer.question_id === question.question_id);
          
          return {
            question: question.question_text,
            answer: answerEntry ? answerEntry.answer : 'No answer provided'
          };
        });

        // Fetch the questionnaire name
        const nameResult = await client.query(`
          SELECT name FROM questionnaire_questionnaires WHERE id = $1
        `, [questionnaireId]);
        const questionnaireName = nameResult.rows[0].name;

        // Check if we have any responses and add to the array
        if (questionsResult.rows.length > 0) {
          questionnaireResponses.push({
            questionnaireName: questionnaireName, // Use the fetched title here
            questionsAndAnswers
          });
        }
      }

      return { ...summary, responses: questionnaireResponses };
    }));

    return NextResponse.json(usersWithResponses);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    client.release(); // Ensure the client is released
  }
}