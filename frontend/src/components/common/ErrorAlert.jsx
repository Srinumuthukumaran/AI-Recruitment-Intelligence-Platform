import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

const ErrorAlert = ({ message, onRetry, title = 'Error' }) => {
  if (!message) return null;

  const isQuotaError = message.toLowerCase().includes('limit') || 
                       message.toLowerCase().includes('credit') || 
                       message.toLowerCase().includes('billing');

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-200 backdrop-blur-sm mb-4">
      <div className="flex items-start space-x-3">
        {isQuotaError ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-300">
            {isQuotaError ? 'AI Service Notification' : title}
          </h4>
          <p className="text-sm text-slate-300 mt-1 leading-relaxed">{message}</p>
          {isQuotaError && (
            <div className="mt-2.5 text-xs text-amber-300/90 bg-amber-950/40 p-2.5 rounded-lg border border-amber-500/20">
              💡 <strong>Tip:</strong> The system automatically preserves all existing candidate and job data. You can continue reviewing candidates, rankings, and job requirements.
            </div>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/40 hover:bg-red-900/60 text-red-200 border border-red-500/30 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
