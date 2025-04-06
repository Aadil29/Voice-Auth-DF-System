"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">Audio Shield</span>
      </div>
      <ul className="navbar-links">
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
