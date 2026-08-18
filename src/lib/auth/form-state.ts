export type AuthFormErrorState = {
  error: string;
};

export type VerificationFormState = {
  needsVerification: true;
  email: string;
  error?: string;
  message?: string;
};

export type SignUpFormState = null | AuthFormErrorState | VerificationFormState;

export type SignInFormState = SignUpFormState;

export function isVerificationState(
  state: SignUpFormState | SignInFormState,
): state is VerificationFormState {
  return Boolean(state && "needsVerification" in state && state.needsVerification);
}
