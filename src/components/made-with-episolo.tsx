import { useState } from 'react';

function Logo({ size = "default" }: { size?: "small" | "default" }) {
  const imgSize = size === "small" ? "w-6 h-6" : "w-7 h-7";
  const textSize = size === "small" ? "text-base" : "text-lg";
  
  // Use absolute URL to ensure logo loads from Episolo CDN (works for cloned apps too)
  const logoUrl = "https://www.episolo.com/logos/episolo/episolo-logo.webp";
  
  return (
    <div className="flex items-center space-x-2">
      <img
        src={logoUrl}
        className={imgSize}
        alt="Episolo Logo"
        width={size === "small" ? 24 : 28}
        height={size === "small" ? 24 : 28}
      />
      <span className={`text-foreground ${textSize} font-bold font-mono`}>
        Episolo
      </span>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export function MadeWithEpisolo() {
  const [showModal, setShowModal] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  
  const appId = '4vokbuxq';
  const appTitle = 'Kotomagi';
  
  // Get Episolo platform base URL dynamically
  const getEpisoloBaseUrl = (): string => {
    if (typeof window === 'undefined') return 'https://www.episolo.com';
    
    // Check if EPISOLO_API_URL is injected (from app-id-injector)
    // This is the most reliable way to get the Episolo platform URL
    const apiUrl = (window as any).EPISOLO_API_URL;
    if (apiUrl) {
      try {
        // Try to parse as full URL
        const url = new URL(apiUrl);
        return `${url.protocol}//${url.host}`;
      } catch {
        // If EPISOLO_API_URL is a relative path or malformed, try to extract base
        if (typeof apiUrl === 'string' && apiUrl.startsWith('http')) {
          // Remove /api and any path after it
          return apiUrl.replace(/\/api.*$/, '').replace(/\/$/, '');
        }
      }
    }
    
    // Fallback: Check if current page is on localhost (for local development)
    // This assumes the Episolo platform is also on localhost
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}`;
    }
    
    // Default to production URL
    return 'https://www.episolo.com';
  };
  
  const episoloBaseUrl = getEpisoloBaseUrl();
  
  const handleBadgeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Track badge click if analytics available
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).dataLayer.push({
        event: 'badge_click',
        app_id: appId,
        source: 'edit_with_badge',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Record badge click in database (non-blocking)
    if (appId) {
      fetch(`${episoloBaseUrl}/api/badge/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: appId,
          source: 'edit_with_badge',
          user_agent: navigator.userAgent,
          referer: document.referrer,
        }),
      }).catch(() => {
        // Silently fail - non-critical tracking
      });
    }
    
    setShowModal(true);
  };
  
  const handleClone = () => {
    if (!appId) {
      window.open(`${episoloBaseUrl}/`, '_blank');
      return;
    }
    
    setIsCloning(true);
    
    // Redirect to the clone page which handles authentication and cloning
    window.location.href = `${episoloBaseUrl}/clone/${appId}`;
  };
  
  const handleGoToEpisolo = () => {
    window.open(`${episoloBaseUrl}/?ref=app-${appId || 'badge'}`, '_blank');
  };

  return (
    <>
      {/* Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleBadgeClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-full shadow-lg hover:shadow-xl transition-all text-sm font-medium hover:scale-105 cursor-pointer"
        >
          <span className="text-muted-foreground">Edit with</span>
          <Logo size="small" />
        </button>
      </div>
      
      {/* Modal Overlay */}
      {showModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => !isCloning && setShowModal(false)}
        >
          {/* Modal Content */}
          <div 
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            {!isCloning && (
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 text-white/80 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {isCloning ? (
              /* Loading State */
              <div className="p-12 flex flex-col items-center justify-center min-h-[300px]">
                <LoadingSpinner />
                <h3 className="mt-6 text-xl font-semibold text-gray-900">Cloning {appTitle}.</h3>
                <p className="mt-2 text-gray-500 text-center">
                  This may take a few moments. You'll find it in your Apps page once it's ready.
                </p>
              </div>
            ) : (
              <>
                {/* Header with gradient */}
                <div 
                  className="px-8 py-12 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fdba74 100%)'
                  }}
                >
                  <h2 className="text-3xl font-bold text-white text-center">
                    Built with Episolo
                  </h2>
                </div>
                
                {/* Body */}
                <div className="p-8">
                  <div className="text-center mb-6">
                    <p className="text-gray-700">
                      Turn ideas into working apps with Episolo
                    </p>
                    <p className="text-gray-700">
                      Ready to build your own app?
                    </p>
                  </div>
                  
                  {/* Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleGoToEpisolo}
                      className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
                    >
                      Go to Episolo
                    </button>
                    <button
                      onClick={handleClone}
                      className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 transition-colors"
                    >
                      Clone This App
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
