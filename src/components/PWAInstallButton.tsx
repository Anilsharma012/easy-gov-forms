import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
          setDismissed(true);
        }
        setInstallPrompt(null);
      } catch (error) {
        console.error('Install error:', error);
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
       <div className="fixed bottom-[calc(70px+env(safe-area-inset-bottom))] md:bottom-6 right-6 z-50 flex items-center gap-2">
       <button
          onClick={handleInstall}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium text-sm">Install App</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Install Easy Gov Forms</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              {isIOS ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Smartphone className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">iPhone/iPad</p>
                      <p className="text-sm text-gray-600">Safari browser use karein</p>
                    </div>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Safari mein <strong>Share</strong> button tap karein</li>
                    <li><strong>"Add to Home Screen"</strong> select karein</li>
                    <li><strong>"Add"</strong> tap karein</li>
                  </ol>
                </div>
              ) : isAndroid ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Smartphone className="w-8 h-8 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-800">Android</p>
                      <p className="text-sm text-gray-600">Chrome browser use karein</p>
                    </div>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Chrome mein <strong>Menu (⋮)</strong> tap karein</li>
                    <li><strong>"Install app"</strong> ya <strong>"Add to Home screen"</strong> select karein</li>
                    <li><strong>"Install"</strong> tap karein</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Monitor className="w-8 h-8 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-800">Desktop</p>
                      <p className="text-sm text-gray-600">Chrome/Edge browser use karein</p>
                    </div>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Address bar mein <strong>Install icon</strong> click karein</li>
                    <li>Ya Menu se <strong>"Install Easy Gov Forms"</strong> select karein</li>
                    <li><strong>"Install"</strong> click karein</li>
                  </ol>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full mt-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Samajh Gaya
            </button>
          </div>
        </div>
      )}
    </>
  );
};