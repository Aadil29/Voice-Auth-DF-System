/*
Simple reusable component for capturing user email input.
Keeps email logic consistent across sign up and sign in pages.
*/

"use client";

// Props definition for the EmailInput component
interface EmailInputProps {
  value: string; // Current email value
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Event handler for changes
  label?: string; // Optional label text
  placeholder?: string; // Placeholder text for the input
  required?: boolean; // Whether it's a required field
  name?: string; // Optional name attribute
}

export default function EmailInput({
  value,
  onChange,
  label = "Email",
  placeholder = "Enter your email",
  required = true,
  name,
}: EmailInputProps) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input
        type="email" // Ensures built-in email validation
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
        className="form-input"
      />
    </div>
  );
}
