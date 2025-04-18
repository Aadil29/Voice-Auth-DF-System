export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, code } = await request.json();

  // Simple HTML template for the verification email
  const htmlContent = `
    <html>
      <body style="font-family: sans-serif;">
        <h2>Audio Shield Verification Code</h2>
        <p>Hi <strong>${email}</strong>,</p>
        <p>Your 6‑digit verification code is:</p>
        <h1 style="color: #0F172A;">${code}</h1>
        <br/>
        <small style="color: grey;">
          If you didn’t request this, you can ignore this message.
        </small>
      </body>
    </html>
  `;

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("Missing BREVO_API_KEY in environment");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Audio Shield",
          email: "mohammadghani2003@gmail.com",
        },
        to: [{ email }],
        subject: "Your Audio Shield Verification Code",
        htmlContent,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error("Brevo API returned error", errorData || res.statusText);
      return NextResponse.json(
        { message: "Failed to send email", details: errorData },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Failed to call Brevo API", err);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
