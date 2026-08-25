import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password,
      },
    });

    await transporter.verify();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
  }
}
