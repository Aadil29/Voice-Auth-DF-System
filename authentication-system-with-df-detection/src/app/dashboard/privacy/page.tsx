/*
PrivacyPage Component

A protected informational page that outlines the platform’s privacy and misuse policy.
Ensures users understand this system is for ethical, educational, and research purposes only.

- Static content only
- Wrapped in UrlProtection to block unauthenticated access
- Includes consistent Navbar for navigation
*/

"use client";

import Navbar from "@/app/components/Navbar";
import UrlProtection from "@/app/components/UrlProtection";

export default function PrivacyPage() {
  return (
    <>
      {/* Wrap the whole page with auth protection so users can't access this page without logging in */}
      <UrlProtection>
        {/* Global top navigation bar for consistent layout */}
        <Navbar />

        <main className="privacy-page">
          <section className="privacy-section">
            <div className="privacy-header">
              <h1>Privacy & Misuse Policy</h1>
              <p>
                Upholding integrity, security, and trust across the platform.
              </p>
            </div>

            <div className="privacy-content">
              {/* Clear usage disclaimer — reinforces the ethical boundaries of the system */}
              <p>
                This system is intended strictly for ethical, educational, and
                informative purposes. You must not use this platform for any
                form of illegal activity, impersonation, or malicious intent.
              </p>

              {/* This section highlights how the deepfake tool should (and should not) be used */}
              <p>
                The deepfake detection feature is designed to raise awareness
                and support research into audio-based deception. It must not be
                used to improve the effectiveness of deepfake attacks, nor to
                test adversarial audio in a way that supports or enables harmful
                behaviour.
              </p>

              {/* Warning of consequences — ties in with account and legal enforcement */}
              <p>
                Any misuse of this platform may result in permanent suspension
                (account deletion) and could lead to legal consequences.
              </p>

              {/* Important callout for ethical and legal responsibility */}
              <p className="important-note">
                Please use this tool responsibly and in accordance with all
                applicable laws and ethical standards.
              </p>
            </div>
          </section>
        </main>
      </UrlProtection>
    </>
  );
}
