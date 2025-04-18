"use client";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { deleteUser, signOut, sendPasswordResetEmail } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export default function SettingsPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      setBusy(true);
      const uid = user.uid;

      await Promise.all([
        deleteDoc(doc(db, "users", uid)),
        deleteDoc(doc(db, "voiceEmbeddings", uid)),
        deleteDoc(doc(db, "emailVerifications", uid)),
      ]);

      await deleteUser(user);
      router.push("/");
    } catch (err: any) {
      console.error("Failed to delete user:", err);
      setError("Could not delete account. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    if (!user?.email) {
      setError("No email on file for current user.");
      return;
    }
    try {
      setBusy(true);
      setError(null);
      setMessage(null);

      await sendPasswordResetEmail(auth, user.email);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError(err.message || "Failed to send reset email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-content">
        <button onClick={handleLogout} disabled={busy} className="btn-sm">
          Log Out
        </button>
        <button onClick={handleDelete} disabled={busy} className="btn-sm">
          Delete Account
          <h5>All personal data is deleted from the database</h5>
        </button>

        <button
          onClick={handlePasswordReset}
          disabled={busy}
          className="btn-sm"
        >
          Change Password
          <h5>Email will be sent</h5>
        </button>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </main>
    </>
  );
}
