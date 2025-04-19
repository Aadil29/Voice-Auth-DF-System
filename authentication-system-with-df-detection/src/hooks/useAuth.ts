/* 
  React hook listens for Firebase authentication state changes.
  It provides the current authenticated user (or null if no user is logged in).
  Can be used anywhere in the app to access the current user without repeating logic.
*/

"use client";

import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); // Stores current Firebase user or null

  useEffect(() => {
    // Subscribe to auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  return { user }; // Hook returns the user object for use in components
}
