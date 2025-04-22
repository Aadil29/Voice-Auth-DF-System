/* 
  This is the landing page users see after signing in. It verifies that the user 
  is authenticated, and if not, redirects them to the sign-in page. Once authenticated, 
  it displays general information about the project and responsible use policies.
*/

"use client";

import Navbar from "@/app/components/Navbar";
import UrlProtection from "@/app/components/UrlProtection";
import Image from "next/image";

export default function DashboardPage() {
  return (
    <>
      {/* Keeping page sure usign the UrlProtection component */}
      <UrlProtection>
        <Navbar />
        <main className="dashboard-parallax">
          <section className="section intro-centered">
            <div className="intro-stack">
              {/* key infomation  */}
              <h1 className="intro-title">Welcome to Audio Shield</h1>
              <p className="intro-subtitle">
                A secure, AI-powered voice authentication system featuring
                advanced deepfake detection and spoofing prevention. Built to
                safeguard your digital identity against the rapidly evolving
                landscape of AI-driven threats.
              </p>
              <p className="intro-credit">
                Created and designed by Muhammad Aadil Ghani
              </p>
            </div>
          </section>

          <section className="section">
            <div className="section-text">
              {/* key infomation  */}
              <h2>What the Project Is About</h2>
              <p>
                While very few systems incorporate audio verification, almost
                none offer a dedicated deepfake detection feature integrated
                directly into the website. Audio Shield addresses this gap,
                making it especially valuable for researchers, security
                enthusiasts, and individuals seeking to verify the authenticity
                of an audio clip particularly when approached by a potential
                scam. Audio Shield is a cutting-edge voice authentication system
                with built-in deepfake detection, designed to provide secure,
                real-time identity verification and protection against emerging
                audio-based threats. It strengthens multi-factor authentication
                by introducing voice biometrics as an additional layer of
                security. This project is engineered to detect such threats and
                accurately confirm identity, helping to prevent harmful
                behaviours such as spoofing attacks
              </p>
            </div>
            <div className="section-image">
              <Image
                src="/images/Voice-Biometrics.png"
                alt="Voice Authentication"
                width={400}
                height={300}
              />
            </div>
          </section>

          <section className="section">
            <div className="section-text">
              {/* key infomation  */}
              <h2>Solving Real Problems</h2>
              <p>
                This project addresses the growing threat of AI-generated voice
                deepfakes. Traditional speaker recognition systems are
                vulnerable to spoofing, especially when voice is used as a
                biometric identifier without robust safeguards.
              </p>

              <p>
                Audio Shield securely links a user's voiceprint with their
                credentials (email and password), storing voice embeddings
                extracted from a recorded sample. During sign-up, users are
                asked to speak predefined phrases that are distinct from those
                used during login. This hybrid approach helps prevent replay
                attacks by ensuring that the system is not dependent on a fixed
                passphrase.
              </p>

              <p>
                At sign-in, users are prompted to say a randomly chosen phrase
                from a large selection of random phrases , making it difficult
                for attackers to anticipate or replicate the input. While this
                randomness could lead some to attempt bypassing the system using
                AI-generated speech, this is exactly where Audio Shield’s
                integrated deepfake detection model comes into play, analysing
                audio for signs of manipulation and ensuring the voice is both
                genuine and live.
              </p>
            </div>
            <div className="section-image">
              <Image
                src="/images/audioDeepfake.png"
                alt="Deepfake Detection"
                width={400}
                height={300}
              />
            </div>
          </section>

          <section className="section">
            <div className="section-text">
              {/* key infomation  */}
              <h2>Security & Privacy by Design</h2>
              <p>
                The system uses deepfake detection to block attempts that mimic
                a user's voice. Audio Shield also includes features such as
                account deletion and full data removal, ensuring compliance with
                privacy and data protection principles and Laws.
              </p>

              <p>
                Additional security layers include one-time passwords (OTPs),
                input sanitisation to defend against URL injection, and rate
                limiting on all API endpoints. These measures help keep the
                system resilient—protecting it from DDoS attacks, abuse, or
                crashes, and are key attributes of a secure platform committed
                to safeguarding user data.
              </p>
            </div>
            <div className="section-image">
              <Image
                src="/images/privacy.png"
                alt="Privacy Protection"
                width={400}
                height={300}
              />
            </div>
          </section>
        </main>
      </UrlProtection>
    </>
  );
}
