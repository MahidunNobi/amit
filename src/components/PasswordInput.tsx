"use client";

import { useState } from 'react';
import { TextInput, Label } from 'flowbite-react';
import { HiEye, HiEyeOff } from 'react-icons/hi';

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  color?: 'gray' | undefined | 'failure' | 'success' | 'warning';
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export default function PasswordInput({
  id,
  value,
  onChange,
  label,
  placeholder = "Password",
  color = undefined,
  required = false,
  error,
  disabled = false,
  className = ""
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id} color={error ? 'failure' : undefined}>
          {label}
        </Label>
      )}
      <div className="relative">
        <TextInput
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          color={error ? 'failure' : color}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        //   className="pr-10"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <HiEyeOff className="h-5 w-5" />
          ) : (
            <HiEye className="h-5 w-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1" style={{ animation: 'fadeIn 0.3s' }}>
          {error}
        </p>
      )}
    </div>
  );
} 