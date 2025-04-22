/* 
  This file defines the root layout for the entire Next.js application.
  It loads global CSS styles, sets the base font configuration using Geist fonts,
  and wraps all child components in a consistent HTML structure.
*/

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./styles/globals.css";

// Load Geist Sans with a custom CSS variable
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Default metadata for the app (title + description shown in browser tab)
export const metadata: Metadata = {
  title: "Voice Authentication System",
  description: "Secure and simple voice authentication entry point",
};

// Root layout wraps every page in the app
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`} // Apply font globally with smoothing
      >
        {children}
      </body>
    </html>
  );
}
