"use client";

import React from "react";

interface InputFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "number";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
}) => {
  return (
    <div className="form-control mb-4 transition duration-200 hover:scale-105">
      <label htmlFor={id} className="label">
        <span className="label-text font-semibold">{label}</span>
      </label>

      <input
        id={id}
        type={type}
        className="input input-md w-full"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || label}
      />
    </div>
  );
};

export default InputField;
