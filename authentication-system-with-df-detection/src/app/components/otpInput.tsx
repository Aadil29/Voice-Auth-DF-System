/* This component renders an input field where users can enter a 6-digit verification code.
 The code is checked against a record stored in Firestore (under the user's email).
 */

"use client";

import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase"; // Import the configured Firestore instance
import { useRouter } from "next/navigation"; // Hook for client-side navigation

interface Props {
  email: string; // Email of the user, used to find their OTP record in Firestore
}

export default function OTPInputComponent({ email }: Props) {
  const [code, setCode] = useState(""); // Stores the user's input for the OTP
  const [error, setError] = useState(""); // Stores error messages to display
  const router = useRouter(); // Used to redirect the user after successful verification

  const handleVerify = async () => {
    setError(""); // Reset error state before starting verification

    try {
      // Create a reference to the Firestore document storing the verification code for this email
      const ref = doc(db, "emailVerifications", email);
      const snap = await getDoc(ref); // Attempt to fetch the document

      if (!snap.exists()) {
        // No OTP record found for this email
        setError("No verification record found.");
        return;
      }

      const data = snap.data();
      const createdAt = data.createdAt?.toDate?.(); // Convert Firestore timestamp to JS Date
      const expires = createdAt ? createdAt.getTime() + 10 * 60 * 1000 : 0; // Set expiry to 10 minutes from creation

      if (Date.now() > expires) {
        // If current time is past the expiry time, the OTP has expired
        setError("Code expired. Please sign up again.");
        return;
      }

      if (data.code !== code) {
        // Entered code does not match the one in Firestore
        setError("Incorrect code.");
        return;
      }

      // Code is valid and within the expiry period, redirect to sign-in page
      router.push("/sign-in");
    } catch (err) {
      // Catch any unexpected errors during the verification process
      setError("Something went wrong.");
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>Enter the code sent to your email</h3>
      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)} // Update the code state as the user types
      />
      <button onClick={handleVerify}>Verify</button>
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Display an error message if one exists */}
    </div>
  );
}
