import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-indigo-400',
    md: 'w-8 h-8 text-indigo-500',
    lg: 'w-12 h-12 text-indigo-500',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin mb-3`} />
      <p className="text-sm font-medium text-slate-300">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
