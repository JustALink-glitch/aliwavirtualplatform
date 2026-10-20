import type { OnboardingStep } from './OnboardingLayout'

/** The four admin sign-up steps (R1), with the given one current. */
export function signUpSteps(current: 1 | 2 | 4): OnboardingStep[] {
  const state = (n: number): OnboardingStep['state'] => (n < current ? 'complete' : n === current ? 'current' : 'upcoming')
  return [
    { label: 'Create account', state: state(1) },
    { label: 'Organisation', state: state(2) },
    // Plans and payment are placeholders (PRD §K); everyone is on the free plan for now.
    { label: 'Choose a plan', detail: current === 4 ? 'Free plan' : 'Optional', state: current === 4 ? 'complete' : 'upcoming' },
    { label: 'Ready', state: state(4) },
  ]
}
