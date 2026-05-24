import Link from "next/link";
import type { ReactNode } from "react";

export function AdminFormLayout({
  title,
  backHref,
  children,
}: {
  title: string;
  backHref: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href={backHref} className="text-[#555] hover:text-white">
          ←
        </Link>
        <h1 className="text-2xl font-black">{title}</h1>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#1E1E1E] p-6">
      <h3 className="mb-5 text-xs font-bold uppercase tracking-wider text-[#999]">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  hint?: string;
  required?: boolean;
};

export function FormField({ label, name, type = "text", defaultValue, hint, required }: FieldProps) {
  const val = defaultValue === undefined || defaultValue === null ? "" : String(defaultValue);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white">
        {label}
        {required ? " *" : ""}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={val}
          rows={4}
          required={required}
          className="w-full resize-none rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#456DFF]"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={val}
          required={required}
          className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#456DFF]"
        />
      )}
      {hint ? <p className="mt-1.5 text-xs text-[#555]">{hint}</p> : null}
    </div>
  );
}

export function FormSelect({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-white">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]}
        className="w-full rounded-xl border border-white/10 bg-[#141414] px-4 py-3 text-sm text-white outline-none focus:border-[#456DFF]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FormToggle({ label, name, defaultChecked }: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="checkbox"
        name={name}
        value="true"
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded border-white/20 accent-[#456DFF]"
      />
      <label className="text-sm font-medium text-white">{label}</label>
    </div>
  );
}

export function SaveBar({ backHref }: { backHref: string }) {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <button
        type="submit"
        className="rounded-xl bg-[#456DFF] px-6 py-3 font-semibold text-white hover:bg-[#2A4AE8]"
      >
        Save Changes
      </button>
      <Link
        href={backHref}
        className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-[#999] hover:text-white"
      >
        Cancel
      </Link>
    </div>
  );
}
