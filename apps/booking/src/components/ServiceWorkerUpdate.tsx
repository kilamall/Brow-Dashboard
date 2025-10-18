import { useEffect, useState } from 'react';

export default function ServiceWorkerUpdate() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      // Check for updates every 60 seconds
      const interval = setInterval(() => {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.update();
          });
        });
      }, 60000);

      // Listen for new service worker waiting to activate
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowReload(true);
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setShowReload(true);
                }
              });
            }
          });
        });
      });

      // Listen for controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      return () => clearInterval(interval);
    }
  }, []);

  const reloadPage = () => {
    // Tell the waiting service worker to activate
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
    // The page will reload automatically when controller changes
  };

  const dismissUpdate = () => {
    setShowReload(false);
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-4 max-w-sm z-50 border-2 border-blue-500 animate-slide-up">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">Update Available</h3>
          <p className="mt-1 text-sm text-gray-600">
            A new version of the app is available. Reload to get the latest features and fixes.
          </p>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={reloadPage}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reload Now
            </button>
            <button
              onClick={dismissUpdate}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={dismissUpdate}
          className="flex-shrink-0 text-gray-400 hover:text-gray-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

