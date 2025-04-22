/*
Reusable PasswordInput component with visibility toggle.
Helps keep the Sign Up and Sign In pages clean and consistent.
*/

"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Props definition for the PasswordInput component
interface PasswordInputProps {
  label?: string; // Optional label for the field
  value: string; // Current value of the input
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Event handler for changes
  placeholder?: string; // Placeholder text
  required?: boolean; // Whether the field is required
  name?: string; // Optional name attribute
}

export default function PasswordInput({
  label = "Password",
  value,
  onChange,
  placeholder = "Enter your password",
  required = true,
  name,
}: PasswordInputProps) {
  const [show, setShow] = useState(false); // Toggles password visibility

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type={show ? "text" : "password"} // Show plain text if toggle is true
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="form-input"
          name={name}
        />
        {/* Eye icon to toggle visibility */}
        <button
          type="button"
          className="eye-toggle"
          onClick={() => setShow((s) => !s)}
          aria-label="Toggle password visibility"
        >
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
}
