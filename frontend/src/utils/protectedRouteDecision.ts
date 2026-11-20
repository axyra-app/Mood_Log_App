export type ProtectedRouteAcceptanceState = 'checking' | 'current' | 'required' | 'error';

export type ProtectedRouteDecision =
  | 'loading'
  | 'login'
  | 'age-confirmation'
  | 'checking-acceptance'
  | 'legal-acceptance'
  | 'acceptance-error'
  | 'complete-profile'
  | 'allowed';

export interface ProtectedRouteDecisionInput {
  loading: boolean;
  isAuthenticated: boolean;
  adultEligible: boolean;
  acceptanceState: ProtectedRouteAcceptanceState;
  needsProfileCompletion: boolean;
  allowIncompleteProfile: boolean;
}

export const getProtectedRouteDecision = (
  input: ProtectedRouteDecisionInput,
): ProtectedRouteDecision => {
  if (input.loading) return 'loading';
  if (!input.isAuthenticated) return 'login';
  if (!input.adultEligible) return 'age-confirmation';
  if (input.acceptanceState === 'checking') return 'checking-acceptance';
  if (input.acceptanceState === 'required') return 'legal-acceptance';
  if (input.acceptanceState === 'error') return 'acceptance-error';
  if (input.needsProfileCompletion && !input.allowIncompleteProfile) return 'complete-profile';
  return 'allowed';
};
