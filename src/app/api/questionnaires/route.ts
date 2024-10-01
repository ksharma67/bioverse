import { pool } from '../../../database/db'; 

export async function GET() {
    let client;
    try {
      client = await pool.connect(); 
  
      // Fetch questionnaires with their associated questions and priorities
      const result = await client.query(`
        SELECT 
          qq.id, 
          qq.name AS title, 
          qj.priority,
          qqs.question 
        FROM questionnaire_questionnaires qq
        LEFT JOIN questionnaire_junction qj ON qq.id = qj.questionnaire_id
        LEFT JOIN questionnaire_questions qqs ON qj.question_id = qqs.id
        ORDER BY qq.id, qj.priority; 
      `);
      console.log('Fetched rows:', result.rows);
      // Group questions by questionnaire ID and maintain priority order, ensuring uniqueness
      const questionnaires: Record<number, { id: number; title: string; questions: string[] }> = {};
      const uniqueQuestionnaireIds = new Set<number>(); // To track unique questionnaire IDs

      result.rows.forEach((row: { id: number; title: string; priority: number; question: string }) => {
        if (!uniqueQuestionnaireIds.has(row.id)) { // Check if questionnaire ID is already processed
          uniqueQuestionnaireIds.add(row.id);
          questionnaires[row.id] = {
            id: row.id,
            title: row.title,
            questions: []
          };
        }
        questionnaires[row.id].questions.push(row.question);
      });
  
      // Convert to array and format for frontend
      const formattedQuestionnaires = Object.values(questionnaires).map(questionnaire => ({
        id: questionnaire.id,
        title: questionnaire.title,
        path: `/questionnaire/${questionnaire.id}`,
        questions: questionnaire.questions,
      }));
  
      return new Response(JSON.stringify(formattedQuestionnaires), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  
    } catch (error) {
      console.error('Error fetching questionnaires from database:', error);
      return new Response('Internal Server Error', { status: 500 });
    } finally {
      if (client) {
        client.release(); 
      }
    }
  }