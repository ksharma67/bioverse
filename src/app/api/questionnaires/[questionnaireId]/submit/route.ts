import { NextResponse } from 'next/server';
import { pool } from '../../../../../database/db'; // Import the pool for database connection
import { SubmitAnswersRequest } from '../../../../interfaces/questionnaire'; // Import the SubmitAnswersRequest interface

// Define the route handler for submitting answers
export async function POST(req: Request, { params }: { params: { questionnaireId: string } }) {
  const client = await pool.connect();
  try {
    const questionnaireId = parseInt(params.questionnaireId, 10);
    if (isNaN(questionnaireId)) {
      return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
    }

    const body: SubmitAnswersRequest = await req.json();
    const { userId, answers } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if answers object is empty
    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    // Start a transaction to ensure all answers are submitted together
    await client.query('BEGIN');

    // Step 1: Delete old answers for the user and questionnaire
    await client.query(
      'DELETE FROM user_answers WHERE user_id = $1 AND questionnaire_id = $2',
      [userId, questionnaireId]
    );

    // Step 2: Prepare insert queries for each answer
    const insertQueries = Object.entries(answers).map(([questionId, answer]) => ({
      text: `
        INSERT INTO user_answers (questionnaire_id, user_id, question_id, answer)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `,
      values: [questionnaireId, userId, questionId, JSON.stringify(answer)], // Store answer as JSONB
    }));

    // Execute all queries within the transaction
    for (const query of insertQueries) {
      await client.query(query.text, query.values);
    }

    // Commit the transaction
    await client.query('COMMIT');

    // Return success response
    return NextResponse.json({ message: 'Answers submitted successfully' });
  } catch (error) {
    // Rollback in case of an error
    await client.query('ROLLBACK');
    console.error('Error submitting answers:', error);
    return NextResponse.json({ error: 'Error submitting answers' }, { status: 500 });
  } finally {
    client.release();
  }
}
