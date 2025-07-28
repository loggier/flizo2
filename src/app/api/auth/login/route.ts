import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Mocking the API response
    // In a real application, you would make a call to the GPS-WOX API here.
    if (email === 'test@example.com' && password === 'password') {
      // Simulate a successful login
      const token = 'mock-jwt-token-for-flizo-copilot-app-demo';
      return NextResponse.json({ status: 1, user_api_hash: token, message: "Login successful" });
    } else {
      // Simulate failed login
      return new Response(
        JSON.stringify({ status: 0, message: 'Invalid email or password' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 0, message: 'An unexpected error occurred on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
