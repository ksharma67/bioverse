import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../../database/db'; // Adjust the path as necessary

export async function GET(request: NextRequest, { params }: { params: { questionnaireId: string } }) {
    const { questionnaireId } = params; // Get the questionnaire ID from the request parameters
    const userId = request.nextUrl.searchParams.get('userId'); // Get the user ID from query parameters

    console.log('Received request with params:', params); // Log the params for debugging
    console.log('User ID:', userId); // Log the user ID

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const client = await pool.connect();

        // Fetch previous answers for the specified user and questionnaire
        const query = `
            SELECT 
                question_id, 
                answer 
            FROM 
                user_answers 
            WHERE 
                questionnaire_id = $1 AND user_id = $2;
        `;

        const values = [questionnaireId, userId]; // Use questionnaireId here
        const result = await client.query(query, values);

        // Log the raw query results
        console.log('Questionnaire ID:', questionnaireId, 'User ID:', userId);
        console.log('Query result rows:', result.rows);

        // Reduce the result rows into a structured answers object
        const answers = result.rows.reduce((acc, row) => {
            // Directly access properties without JSON.parse
            acc[row.question_id] = row.answer.answer; // Access answer directly
            return acc;
        }, {});

        // Log the final answers object
        console.log('Previous answers:', answers);

        client.release();
        return NextResponse.json(answers);

    } catch (error) {
        console.error('Error fetching previous answers:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
