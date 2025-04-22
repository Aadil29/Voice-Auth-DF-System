/*
SettingsPage Component

This page allows authenticated users to:
- Log out of their account
- Delete their entire account and associated Firestore records
- Trigger a password reset via email

Functionality is protected behind `UrlProtection`, ensuring only logged-in users can access it.
Each action shows a loading state while it's processing, disables other actions, and handles error reporting.
*/
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import {
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import UrlProtection from "@/app/components/UrlProtection";
import Navbar from "@/app/components/Navbar";

export default function SettingsPage() {
  const router = useRouter();

  const [busy, setBusy] = useState(false); // true when a request is running
  const [error, setError] = useState<string | null>(null); // shown for auth or deletion errors

  // Logs the user out and redirects them to the homepage
  const handleLogout = async () => {
    setBusy(true);
    await signOut(auth);
    router.replace("/");
  };

  // Full account deletion (Firebase Auth + Firestore docs)
  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user?.email) return;

    // Firebase requires reauthentication before deleting the user
    const password = prompt(
      "To delete your account, please enter your password:"
    );
    if (!password) {
      setError("Password is required to delete account.");
      return;
    }

    try {
      setBusy(true);

      //Re-authenticate the user with their current credentials
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);

      const uid = user.uid;
      const tasks: Promise<any>[] = [];

      //Delete all entries in the deepfakeHistory collection belonging to the user
      const histQ = query(
        collection(db, "deepfakeHistory"),
        where("uid", "==", uid)
      );
      const histSnap = await getDocs(histQ);
      histSnap.docs.forEach((snap) =>
        tasks.push(deleteDoc(doc(db, "deepfakeHistory", snap.id)))
      );

      //Delete specific single documents tied to the user
      tasks.push(deleteDoc(doc(db, "emailVerifications", uid)));
      tasks.push(deleteDoc(doc(db, "voiceEmbeddings", uid)));

      //Wait for all deletions to finish before removing the user
      await Promise.all(tasks);
      await deleteUser(user); // remove from Firebase Auth
      await signOut(auth);
      router.replace("/");
    } catch (e: any) {
      console.error(e);

      // Handle incorrect password specifically
      setError(
        e.code === "auth/wrong-password"
          ? "Incorrect password."
          : "Could not delete account. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  // Sends a password reset email to the currently signed-in user
  const handlePasswordReset = async () => {
    const email = auth.currentUser?.email;
    if (!email) {
      setError("No email on record.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent. Check your inbox.");
    } catch (e) {
      console.error(e);
      setError("Failed to send reset email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <UrlProtection>
      <Navbar />

      <main className="settings-page">
        <section className="settings-box">
          <h1>Account Settings</h1>
          <p className="subtitle">
            Manage your authentication and privacy preferences
          </p>

          {error && <p className="error-message">{error}</p>}

          <div className="settings-actions">
            {/* Logs the user out */}
            <button
              onClick={handleLogout}
              disabled={busy}
              className="settings-btn logout"
            >
              Log Out
            </button>

            {/* Deletes the account and all related data */}
            <button
              onClick={handleDelete}
              disabled={busy}
              className="settings-btn delete"
            >
              Delete Account
              <span>All personal data will be permanently removed.</span>
            </button>

            {/* Sends password reset email */}
            <button
              onClick={handlePasswordReset}
              disabled={busy}
              className="settings-btn reset"
            >
              Change Password
              <span>Email with reset instructions will be sent.</span>
            </button>
          </div>
        </section>
      </main>
    </UrlProtection>
  );
}
