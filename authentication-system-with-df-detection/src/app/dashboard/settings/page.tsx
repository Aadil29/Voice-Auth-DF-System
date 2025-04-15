"use client";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { deleteUser, signOut } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/firebase";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async () => {
    const user = auth.currentUser;

    if (user) {
      try {
        const uid = user.uid;

        await Promise.all([
          deleteDoc(doc(db, "users", uid)),
          deleteDoc(doc(db, "voiceEmbeddings", uid)),
          deleteDoc(doc(db, "emailVerifications", uid)),
        ]);

        await deleteUser(user);

        router.push("/");
      } catch (err: any) {
        console.error("Failed to delete user:", err.message);
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard-content">
        <h2>Settings</h2>
        <button onClick={handleLogout}>Log Out</button>
        <button onClick={handleDelete}>Delete Account</button>
        <button disabled>Change Password</button>
      </main>
    </>
  );
}
