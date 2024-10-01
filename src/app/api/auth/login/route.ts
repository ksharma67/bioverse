import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../database/db';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  let client;

  try {
    client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('Query Result:', result.rows); // Log the result

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = result.rows[0];

    // Compare password securely (using a hashing function is recommended)
    if (password !== user.password_hash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate a JWT token
    const secret = process.env.JWT_SECRET || 'default_secret';
    const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, secret, { expiresIn: '1h' });

    // Log the generated token for debugging
    console.log('Generated Token:', token); 

    // Set the token in an HttpOnly cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production
      sameSite: 'Strict', // CSRF protection
      path: '/', // Cookie path
      maxAge: 3600, // Cookie expiration time (in seconds)
    };
    const cookieString = `token=${token}; Max-Age=${cookieOptions.maxAge}; Path=${cookieOptions.path}; HttpOnly; SameSite=${cookieOptions.sameSite}` + (cookieOptions.secure ? '; Secure' : '');

    const res = NextResponse.json({ 
      isAdmin: user.is_admin, 
      token: token, // Include the token in the response
      userId: user.id
    }, { status: 200 });
    res.headers.append('Set-Cookie', cookieString);

    return res;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
