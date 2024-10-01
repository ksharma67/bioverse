import { pool } from '../../../../database/db'; // Adjust the path if needed

export async function GET(
  request: Request,
  { params }: { params: { questionnaireId: string } }
) {
  const questionnaireId = parseInt(params.questionnaireId, 10);

  try {
    const client = await pool.connect();

    const result = await client.query(`
      SELECT 
        qqs.id AS question_id,
        qqs.question
      FROM questionnaire_junction qj
      JOIN questionnaire_questions qqs ON qj.question_id = qqs.id
      WHERE qj.questionnaire_id = $1
      ORDER BY qj.priority; 
    `, [questionnaireId]);

    client.release();

    // Return the result in a more structured way
    const questions = result.rows.map((row: { question_id: number; question: string }) => ({
      id: row.question_id,
      question: row.question // row.question should already be JSONB, just need to return it
    }));

    return new Response(JSON.stringify(questions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
