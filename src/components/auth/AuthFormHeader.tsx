type AuthFormHeaderProps = {
  variant: "sign-in" | "sign-up";
};

const COPY = {
  "sign-in": {
    title: "Sign in to Tradeverse Academy",
    subtitle: "Welcome back! Please sign in to continue",
  },
  "sign-up": {
    title: "Create your account",
    subtitle: "Welcome! Please fill in the details to get started.",
  },
} as const;

export function AuthFormHeader({ variant }: AuthFormHeaderProps) {
  const copy = COPY[variant];

  return (
    <header className="mb-1 text-left">
      <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{copy.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-[#999]">{copy.subtitle}</p>
    </header>
  );
}
