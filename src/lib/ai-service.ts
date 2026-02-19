/**
 * AI Service SDK
 * 
 * Client-side SDK for generated apps to access AI features securely.
 * This file is injected into the template.
 */

// Configuration interface
interface AIConfig {
    appId: string;
    // Base URL is usually relative to the app's domain, which proxies to the main backend
    // In dev (local), it might need to point to the main platform URL
    baseUrl?: string; 
}

let config: AIConfig | null = null;

export const AI = {
    /**
     * Initialize the AI service
     * @param appId - The unique ID of this app
     */
    init(appId: string) {
        config = { appId };
    },

    /**
     * Generate text using the AI model
     * @param prompt - The text prompt to send to the AI
     * @returns The generated text response
     */
    async generateText(prompt: string): Promise<string> {
        // Auto-detect App ID if available globally (injected script)
        const appId = 
            config?.appId || 
            (window as any).APP_ID || 
            (window as any).__APP_ID__ || 
            import.meta.env.VITE_APP_ID;

        if (!appId) {
            throw new Error("AI Service not initialized. App ID is missing.");
        }

        // Get API base URL - prefer window global (runtime) over env var (build time)
        const baseUrl = 
            (window as any).EPISOLO_API_URL || 
            (window as any).__EPISOLO_API_URL__ || 
            import.meta.env.VITE_EPISOLO_API_URL || 
            "";
        const endpoint = `${baseUrl}/api/app-ai/generate`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-App-ID": appId,
                    "x-episolo-app-id": appId, // Alternate header
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 429) {
                    throw new Error(`Quota exceeded: ${errorData.error || "Monthly limit reached"}`);
                }
                
                // Include details if available for debugging
                const details = errorData.details ? ` (${JSON.stringify(errorData.details)})` : "";
                throw new Error((errorData.error || `AI request failed: ${response.statusText}`) + details);
            }

            const data = await response.json();
            return data.text;

        } catch (error: any) {
            console.error("[AI Service] Error:", error);
            
            // Add helpful hint for local development PNA issues
            if (endpoint && endpoint.includes("localhost") && error.message?.includes("Failed to fetch")) {
                console.warn(
                    "[AI Service] ⚠️ Local Development Warning:\n" +
                    "Your app is running in the cloud (E2B) but trying to access your local API (localhost).\n" +
                    "This triggers Private Network Access (PNA) security checks in browsers.\n" +
                    "1. You should see a browser prompt asking to connect to devices on your network.\n" +
                    "2. You must ALLOW this for the request to succeed.\n" +
                    "3. If blocked, check Chrome flags or use a public tunnel (ngrok) for NEXT_PUBLIC_BASE_URL."
                );
            }
            
            throw error;
        }
    }
};

// Type definitions for easier usage
export type AIService = typeof AI;

