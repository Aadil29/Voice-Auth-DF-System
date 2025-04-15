import { NextResponse } from "next/server";
import { Resend } from "resend";
import AudioShieldVerifyEmail from "@/app/emails/page";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, code } = await request.json();

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your Audio Shield Verification Code",
    react: AudioShieldVerifyEmail({ verificationCode: code, email }),
  });

  return NextResponse.json({ message: "Email sent successfully" });
}
