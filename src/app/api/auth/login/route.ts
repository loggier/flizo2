import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Mocking the API response
    // In a real application, you would make a call to the GPS-WOX API here.
    if (email === 'test@example.com' && password === 'password') {
      // Simulate a successful login
      const token = 'mock-jwt-token-for-flizo-copilot-app-demo';
      return NextResponse.json({ accessToken: token });
    } else {
      // Simulate failed login
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'An unexpected error occurred on the server.' }, { status: 500 });
  }
}
