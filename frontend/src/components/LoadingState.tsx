import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  steps?: string[];
  currentStep?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing official guidelines…',
  steps,
  currentStep = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-8 h-8 text-terracotta-500" />
      </motion.div>

      <p className="mt-4 text-sm font-medium text-charcoal-700">{message}</p>

      {steps && steps.length > 0 && (
        <div className="mt-6 space-y-2 w-full max-w-xs">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold
                ${i < currentStep ? 'bg-sage-500' : i === currentStep ? 'bg-terracotta-500 animate-pulse' : 'bg-linen-300 text-charcoal-700/40'}`}>
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span className={i <= currentStep ? 'text-charcoal-800 font-medium' : 'text-charcoal-700/40'}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
      <span className="text-red-500 text-xl">!</span>
    </div>
    <p className="text-sm text-charcoal-700 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs">
        Try Again
      </button>
    )}
  </motion.div>
);

export const EmptyState: React.FC<{ title: string; description: string; action?: React.ReactNode }> = ({
  title, description, action,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-16 px-8 text-center"
  >
    <div className="w-16 h-16 rounded-2xl bg-linen-200 flex items-center justify-center mb-4">
      <span className="text-2xl">📋</span>
    </div>
    <h3 className="text-base font-semibold text-charcoal-800 mb-1">{title}</h3>
    <p className="text-sm text-charcoal-700/60 max-w-sm">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </motion.div>
);
