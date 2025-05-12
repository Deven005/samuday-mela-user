"use client";

import React from "react";

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder,
}) => {
  return (
    <div className="form-control mb-4 transition duration-200 hover:scale-105 text-base-content">
      <label htmlFor={id} className="label">
        <span className="label-text font-semibold">{label}</span>
      </label>
      <textarea
        id={id}
        className="textarea textarea-bordered w-full"
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || label}
      />
    </div>
  );
};

export default TextAreaField;
