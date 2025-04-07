"use client";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { deleteUser, signOut } from "firebase/auth";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async () => {
    const user = auth.currentUser;
    if (user) {
      await deleteUser(user);
      router.push("/");
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
