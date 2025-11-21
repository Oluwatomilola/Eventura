import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isOnboardingOpen: boolean;
  currentStep: number;
  seenFeatures: Record<string, boolean>;
  milestones: Record<string, boolean>;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setIsOnboardingOpen: (isOpen: boolean) => void;
  setCurrentStep: (step: number) => void;
  markFeatureAsSeen: (featureId: string) => void;
  markMilestone: (milestoneId: string) => void;
  restartOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      isOnboardingOpen: false,
      currentStep: 0,
      seenFeatures: {},
      milestones: {},
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
      setIsOnboardingOpen: (isOpen) => set({ isOnboardingOpen: isOpen }),
      setCurrentStep: (step) => set({ currentStep: step }),
      markFeatureAsSeen: (featureId) => set((state) => ({ 
        seenFeatures: { ...state.seenFeatures, [featureId]: true } 
      })),
      markMilestone: (milestoneId) => set((state) => {
        if (state.milestones[milestoneId]) return state;
        return { milestones: { ...state.milestones, [milestoneId]: true } };
      }),
      restartOnboarding: () => set({ hasCompletedOnboarding: false, isOnboardingOpen: true, currentStep: 0 }),
    }),
    {
      name: 'eventura-onboarding-storage',
      partialize: (state) => ({ 
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        seenFeatures: state.seenFeatures,
        milestones: state.milestones
      }), 
    }
  )
);
