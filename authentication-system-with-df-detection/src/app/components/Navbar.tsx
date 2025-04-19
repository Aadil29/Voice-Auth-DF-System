// This is the main navigation bar for the dashboard area of the app.
// It shows a the Project name on the left and three links on the right (Home, Deepfake Detection, Settings).
// The current page gets an "active" class so we can style it differently (e.g. highlight it).

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname(); // Gets the current URL path

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">Audio Shield</span>
      </div>
      <ul className="navbar-links">
        {/* Each list item checks if the current page matches its path.
            If so, it adds the "active" class so the user knows where they are. */}

        <li className={pathname === "/dashboard" ? "active" : ""}>
          <Link href="/dashboard">Home</Link>
        </li>

        <li className={pathname === "/dashboard/deepfake" ? "active" : ""}>
          <Link href="/dashboard/deepfake">Deepfake Detection</Link>
        </li>

        <li className={pathname === "/dashboard/settings" ? "active" : ""}>
          <Link href="/dashboard/settings">Settings</Link>
        </li>
      </ul>
    </nav>
  );
}
