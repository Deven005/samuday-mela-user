'use client';
import React, { RefObject } from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'file';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  ref?: RefObject<HTMLInputElement | null>;
  accept?: string | undefined;
  className?: string | undefined;
}

const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  ref,
  accept,
  className,
}) => {
  return (
    <div className="form-control mb-4 transition duration-200 hover:scale-105 text-base-content">
      <label htmlFor={id} className="label">
        <span className="label-text font-semibold">{label}</span>
      </label>

      <input
        id={id}
        name={id}
        type={type}
        className={`input input-md w-full bg-base-100 text-base-content border border-base-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-md p-2 transition duration-200 ${className}`}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder || label}
        accept={accept}
        ref={ref}
      />
    </div>
  );
};

export default InputField;
