/**
 * Email Service SDK
 * 
 * Client-side SDK for generated apps to send emails securely via Resend API.
 * This file is injected into the template.
 */

// Configuration interface
interface EmailConfig {
    appId: string;
    // Base URL is usually relative to the app's domain, which proxies to the main backend
    // In dev (local), it might need to point to the main platform URL
    baseUrl?: string; 
}

// Email recipient interface
export interface EmailRecipient {
    email: string;
    name?: string;
}

// Email attachment interface
export interface EmailAttachment {
    filename: string;
    content: string; // Base64 encoded content
    contentType?: string;
}

// Email options interface
export interface SendEmailOptions {
    from?: EmailRecipient | string;
    to: EmailRecipient[] | string[];
    subject: string;
    html?: string;
    text?: string;
    replyTo?: EmailRecipient | string;
    cc?: EmailRecipient[] | string[];
    bcc?: EmailRecipient[] | string[];
    attachments?: EmailAttachment[];
}

// Email send response interface
export interface SendEmailResponse {
    id: string;
    success: boolean;
}

let config: EmailConfig | null = null;

export const Email = {
    /**
     * Initialize the Email service
     * @param appId - The unique ID of this app
     */
    init(appId: string) {
        config = { appId };
    },

    /**
     * Send an email using Resend API
     * @param options - Email configuration options
     * @returns Response with email ID and success status
     */
    async send(options: SendEmailOptions): Promise<SendEmailResponse> {
        // Auto-detect App ID if available globally (injected script)
        const appId = 
            config?.appId || 
            (window as any).APP_ID || 
            (window as any).__APP_ID__ || 
            import.meta.env.VITE_APP_ID;

        if (!appId) {
            throw new Error("Email Service not initialized. App ID is missing.");
        }

        // Validate required fields
        if (!options.to || options.to.length === 0) {
            throw new Error("At least one recipient (to) is required");
        }

        if (!options.subject || options.subject.trim() === "") {
            throw new Error("Email subject is required");
        }

        if (!options.html && !options.text) {
            throw new Error("Either html or text content is required");
        }

        // Validate email limits
        if (options.to.length > 50) {
            throw new Error("Maximum 50 recipients allowed per email");
        }

        if (options.cc && options.cc.length > 50) {
            throw new Error("Maximum 50 CC recipients allowed");
        }

        if (options.bcc && options.bcc.length > 50) {
            throw new Error("Maximum 50 BCC recipients allowed");
        }

        if (options.attachments && options.attachments.length > 10) {
            throw new Error("Maximum 10 attachments allowed per email");
        }

        // Subject length limit
        if (options.subject.length > 998) {
            throw new Error("Subject must be less than 998 characters");
        }

        // Get API base URL - prefer window global (runtime) over env var (build time)
        const baseUrl = 
            (window as any).EPISOLO_API_URL || 
            (window as any).__EPISOLO_API_URL__ || 
            import.meta.env.VITE_EPISOLO_API_URL || 
            "";
        const endpoint = `${baseUrl}/api/app-email/send`;

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-App-ID": appId,
                    "x-episolo-app-id": appId, // Alternate header
                },
                body: JSON.stringify(options),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 429) {
                    throw new Error(`Email quota exceeded: ${errorData.error || "Monthly limit reached"}`);
                }
                
                if (response.status === 403) {
                    // Check if it's a content moderation block
                    if (errorData.code === 'CONTENT_BLOCKED' || errorData.category) {
                        throw new Error(errorData.error || "Email blocked for security reasons");
                    }
                    throw new Error(`Email service not enabled: ${errorData.error || "Email module is disabled for this app"}`);
                }
                
                // Include details if available for debugging
                const details = errorData.details ? ` (${JSON.stringify(errorData.details)})` : "";
                throw new Error((errorData.error || `Email request failed: ${response.statusText}`) + details);
            }

            const data = await response.json();
            return {
                id: data.id,
                success: true,
            };

        } catch (error: any) {
            console.error("[Email Service] Error:", error);
            
            // Add helpful hint for local development PNA issues
            if (endpoint && endpoint.includes("localhost") && error.message?.includes("Failed to fetch")) {
                console.warn(
                    "[Email Service] ⚠️ Local Development Warning:\n" +
                    "Your app is running in the cloud (E2B) but trying to access your local API (localhost).\n" +
                    "This triggers Private Network Access (PNA) security checks in browsers.\n" +
                    "1. You should see a browser prompt asking to connect to devices on your network.\n" +
                    "2. You must ALLOW this for the request to succeed.\n" +
                    "3. If blocked, check Chrome flags or use a public tunnel (ngrok) for NEXT_PUBLIC_BASE_URL."
                );
            }
            
            throw error;
        }
    },

    /**
     * Send a simple text email (convenience method)
     * @param to - Recipient email address(es)
     * @param subject - Email subject
     * @param text - Plain text content
     * @returns Response with email ID and success status
     */
    async sendText(to: string | string[], subject: string, text: string): Promise<SendEmailResponse> {
        return this.send({
            to: Array.isArray(to) ? to : [to],
            subject,
            text,
        });
    },

    /**
     * Send an HTML email (convenience method)
     * @param to - Recipient email address(es)
     * @param subject - Email subject
     * @param html - HTML content
     * @param text - Optional plain text fallback
     * @returns Response with email ID and success status
     */
    async sendHtml(
        to: string | string[], 
        subject: string, 
        html: string, 
        text?: string
    ): Promise<SendEmailResponse> {
        return this.send({
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
            text,
        });
    },
};

// Type definitions for easier usage
export type EmailService = typeof Email;
