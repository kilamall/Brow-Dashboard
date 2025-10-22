import type { AppError } from './errorHandling';
import { ErrorCategory, getRecoveryAction } from './errorHandling';

/**
 * Full-page error fallback for critical failures
 */
export function FullPageError({ error, reset }: { error: AppError; reset: () => void }) {
  const recoveryAction = getRecoveryAction(error.category);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-serif font-semibold text-gray-900 text-center mb-3">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-700 text-center mb-2">
          {error.userMessage}
        </p>

        <p className="text-sm text-gray-600 text-center mb-6">
          {recoveryAction}
        </p>

        {import.meta.env.DEV && error.message && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-2">Error Details (Dev Only):</p>
            <p className="text-xs font-mono text-gray-600 break-words">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature-level error for non-critical failures
 */
export function FeatureError({ 
  error, 
  reset, 
  title 
}: { 
  error: AppError; 
  reset: () => void;
  title?: string;
}) {
  const recoveryAction = getRecoveryAction(error.category);

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 border border-red-200">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title || 'Unable to load content'}
          </h3>
          
          <p className="text-gray-700 mb-1">
            {error.userMessage}
          </p>

          <p className="text-sm text-gray-600 mb-4">
            {recoveryAction}
          </p>

          {import.meta.env.DEV && error.message && (
            <div className="mb-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-600 overflow-auto">
              {error.message}
            </div>
          )}

          <button
            onClick={reset}
            className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline error for small components
 */
export function InlineError({ 
  error, 
  reset 
}: { 
  error: AppError; 
  reset?: () => void;
}) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm text-red-800 font-medium mb-1">
            {error.userMessage}
          </p>
          
          {reset && (
            <button
              onClick={reset}
              className="text-xs text-red-700 hover:text-red-900 underline font-medium"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component for when data is empty (not an error)
 */
export function EmptyState({ 
  title, 
  message, 
  actionLabel, 
  onAction,
  icon = 'inbox'
}: { 
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'inbox' | 'calendar' | 'users' | 'file';
}) {
  const icons = {
    inbox: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    ),
    calendar: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    users: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
    file: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    )
  };

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icons[icon]}
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        {message}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Loading skeleton for data that's still loading
 */
export function LoadingSkeleton({ 
  type = 'list',
  count = 3 
}: { 
  type?: 'list' | 'grid' | 'card' | 'table';
  count?: number;
}) {
  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="w-full h-40 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  // table
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="animate-pulse">
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border-b border-gray-200 p-4">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Network error with retry
 */
export function NetworkError({ reset }: { reset: () => void }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
        <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Lost
      </h3>
      
      <p className="text-gray-700 mb-6">
        Please check your internet connection and try again.
      </p>

      <button
        onClick={reset}
        className="px-6 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
      >
        Retry Connection
      </button>
    </div>
  );
}


