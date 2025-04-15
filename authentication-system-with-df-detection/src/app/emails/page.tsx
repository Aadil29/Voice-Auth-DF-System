import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components';
import * as React from 'react';

interface AudioShieldVerifyEmailProps {
  verificationCode?: string;
  email?: string;
}

export default function AudioShieldVerifyEmail({ verificationCode, email }: AudioShieldVerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Audio Shield verification code</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Audio Shield</Heading>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Verify your email</Heading>
            <Text style={mainText}>
              Hi {email}, here is your 6-digit verification code:
            </Text>
            <Text style={codeText}>{verificationCode}</Text>
            <Text style={validityText}>(Valid for 10 minutes)</Text>
            <Text style={mainText}>If you didn’t request this, you can ignore it.</Text>
          </Section>
          <Hr />
          <Section style={footer}>
            <Text style={footerText}>
              Audio Shield will never ask you to share your password or personal code by email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#ffffff", fontFamily: "Segoe UI, sans-serif" };
const container = { maxWidth: "520px", margin: "0 auto", padding: "20px" };
const header = { backgroundColor: "#0F172A", padding: "16px" };
const logo = { color: "#ffffff", fontSize: "22px", fontWeight: "bold", margin: 0 };
const content = { padding: "24px" };
const h1 = { color: "#1E3A8A", fontSize: "20px", marginBottom: "12px" };
const mainText = { color: "#334155", fontSize: "14px", marginBottom: "16px" };
const codeText = { fontSize: "32px", fontWeight: "bold", textAlign: "center" as const };
const validityText = { fontSize: "13px", color: "#64748B", textAlign: "center" as const };
const footer = { padding: "16px", backgroundColor: "#f1f5f9" };
const footerText = { fontSize: "12px", color: "#64748B" };
