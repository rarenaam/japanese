/**
 * Global Window Type Extensions
 *
 * Declares types for global variables injected by Episolo during deployment.
 */

declare global {
  interface Window {
    /**
     * App ID for Episolo backend proxy
     *
     * Auto-injected during deployment in index.html
     * Used for X-App-ID header in /api/episolo-proxy/* requests
     */
    APP_ID: string;
  }
}

export {};
