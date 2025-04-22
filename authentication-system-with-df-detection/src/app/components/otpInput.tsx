/*
otpInput.tsx

 This component renders an input field where users can enter a 6-digit verification code.
 It Also generates the code and auto exopires it within 10 minutes, this can be changed to a lower number 
 for more security
 The code is checked against a record stored in Firestore (under the user's email) which is kept secure.

 */

"use client";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface OTPInputProps {
  uid: string; // Firebase user ID — used to fetch OTP record
  email: string; // For display (e.g. "code sent to this email")
  onSuccess: () => void; // Called once the user enters the correct code
}

export default function OTPInput({ uid, email, onSuccess }: OTPInputProps) {
  const [code, setCode] = useState(""); // User's typed OTP
  const [error, setError] = useState(""); // Any error message to display

  // Runs when user clicks "Verify"
  const handleVerify = async () => {
    setError(""); // Clear old errors

    try {
      // Pull the OTP record from Firestore using the user's UID
      const ref = doc(db, "emailVerifications", uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setError("No verification record found.");
        return;
      }

      const data = snap.data();

      // Check if OTP has expired (10-minute window)
      const createdAt = data.createdAt?.toDate?.().getTime() || 0;
      const isExpired = Date.now() > createdAt + 10 * 60 * 1000;
      if (isExpired) {
        setError("Code expired. Please sign up again.");
        return;
      }

      // Check if the entered code matches the saved one
      if (data.code !== code) {
        setError("Incorrect code.");
        return;
      }

      // Everything checks out – trigger success callback (usually redirects user)
      onSuccess();
    } catch {
      setError("Something went wrong verifying your code.");
    }
  };

  return (
    <div className="otp-section">
      <h4 className="otp-heading">
        Enter the 6‑digit code sent to <strong>{email}</strong>
      </h4>

      <div className="otp-input-group">
        <input
          type="text"
          className="otp-input"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
        />
        <button className="verify-btn" onClick={handleVerify}>
          Verify
        </button>
      </div>

      {/* Show error if there's any problem during verification */}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
