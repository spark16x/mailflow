import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { auth, message } = await req.json();

    if (!auth || !auth.email || !auth.password) {
      return NextResponse.json({ success: false, error: 'Authentication details are required' }, { status: 400 });
    }

    if (!message || !message.to || !message.subject || (!message.body && !message.text && !message.html)) {
      return NextResponse.json({ success: false, error: 'Message details are incomplete' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: auth.email,
        pass: auth.password,
      },
    });

    const mailOptions = {
      from: auth.email,
      ...message,
      text: message.text || message.body,
    };
    delete mailOptions.body;

    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: unknown) {
    console.error('Failed to send email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
