'use client';

import { useEffect, useState } from 'react';
import Joyride, { CallBackProps, Step, STATUS, TooltipRenderProps } from 'react-joyride';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useRouter } from 'next/navigation';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

// Custom Tooltip Component for Cyberpunk look
const Tooltip = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <div
      {...tooltipProps}
      className="bg-zinc-950 border border-cyan-500/50 max-w-md shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-4">
          <span className="text-xs font-mono text-cyan-500 tracking-widest">
            SYSTEM_TOUR // STEP {String(index + 1).padStart(2, '0')}
          </span>
          <button {...closeProps} className="text-zinc-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="mb-8">
          {step.title && (
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
              {step.title}
            </h3>
          )}
          <div className="text-zinc-400 text-sm leading-relaxed font-medium">
            {step.content}
          </div>
        </div>

        {/* Footer / Controls */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2">
            {index > 0 && (
              <button
                {...backProps}
                className="px-4 py-2 bg-transparent border border-zinc-700 text-zinc-400 text-xs font-mono uppercase hover:bg-zinc-800 hover:text-white transition-colors"
              >
                BACK
              </button>
            )}
          </div>
          <button
            {...primaryProps}
            className="group px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono uppercase tracking-wide transition-colors flex items-center gap-2"
          >
            {isLastStep ? 'COMPLETE' : 'NEXT'}
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500" />
    </div>
  );
};

export function Onboarding() {
  const { 
    hasCompletedOnboarding, 
    isOnboardingOpen, 
    setHasCompletedOnboarding, 
    setIsOnboardingOpen 
  } = useOnboardingStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (!hasCompletedOnboarding) {
      setIsOnboardingOpen(true);
    }
  }, [hasCompletedOnboarding, setIsOnboardingOpen]);

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      title: 'Welcome to Eventura',
      content: 'Protocol initiated. Connect with attendees BEFORE the event. The first decentralized platform for social ticketing.',
      disableBeacon: true,
    },
    {
      target: 'body', // Ideally target a specific element if available
      placement: 'center',
      title: 'Event Discovery',
      content: 'Scan the network for events. Filter by category, location, or popularity metrics.',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'NFT Verification',
      content: 'Secure ticketing via blockchain assets. Fraud-proof. Transferable. Immutable.',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'Social Uplink',
      content: 'Establish connections. View attendee personas and shared interests before arrival.',
    },
    {
      target: 'body',
      placement: 'center',
      title: 'Initialize',
      content: 'Connect your wallet to begin. Welcome to the future.',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setHasCompletedOnboarding(true);
      setIsOnboardingOpen(false);
    }
  };

  if (!mounted || !isOnboardingOpen) return null;

  return (
    <Joyride
      steps={steps}
      run={isOnboardingOpen}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      tooltipComponent={Tooltip}
      floaterProps={{
        hideArrow: true,
      }}
      styles={{
        options: {
          overlayColor: 'rgba(9, 9, 11, 0.85)', // zinc-950 with opacity
          zIndex: 10000,
        },
      }}
    />
  );
}
