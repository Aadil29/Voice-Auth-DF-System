/* 
  This endpoint receives an email address and a 6-digit verification code,
  then sends the code via email using the Brevo (formerly Sendinblue) API.
  It returns a success or error response depending on whether the email was sent.
*/

export const runtime = "nodejs"; // Specifies this API route runs in a Node.js environment

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, code } = await request.json(); // Parse incoming JSON with email and code

  // Basic HTML email template with the verification code embedded
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
    // Fail early if the API key is not set in the environment
    console.error("Missing BREVO_API_KEY in environment");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    // Send the email via Brevo SMTP API
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Audio Shield",
          email: "mohammadghani2003@gmail.com", // Sender's email (this must be authorised in Brevo)
        },
        to: [{ email }], // Recipient's email
        subject: "Your Audio Shield Verification Code",
        htmlContent,
      }),
    });

    if (!res.ok) {
      // If the Brevo API returns an error status, log the details
      const errorData = await res.json().catch(() => null);
      console.error("Brevo API returned error", errorData || res.statusText);
      return NextResponse.json(
        { message: "Failed to send email", details: errorData },
        { status: 500 }
      );
    }

    // If everything went well, return success
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (err) {
    // Handle network issues or unexpected errors
    console.error("Failed to call Brevo API", err);
    return NextResponse.json(
      { message: "Failed to send email" },
      { status: 500 }
    );
  }
}
