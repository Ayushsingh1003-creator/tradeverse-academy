"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";

type PasswordInputProps = {
  id?: string;
  name?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  minLength?: number;
};

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-3 pr-11 text-sm text-white outline-none focus:border-[#456DFF]/60";

export function PasswordInput({
  id: idProp,
  name = "password",
  required = true,
  autoComplete = "current-password",
  placeholder = "••••••••",
  minLength,
}: PasswordInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        className={inputClassName}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#888] transition hover:bg-white/5 hover:text-white"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}
