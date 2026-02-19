/**
 * Entity Service - Behind-the-scenes API communication
 * This handles all the complexity so entities can be simple
 *
 * 🚨 CRITICAL: DO NOT MODIFY THIS FILE
 * This file is part of the Episolo Database SDK template.
 * Use createEntity() to create entities in src/entities/ instead.
 */

// Simple configuration (auto-detected or manually set)
let CONFIG: { appId: string; apiUrl: string } | null = null;
// Auto-initialized for this app (injected by Episolo)
initEntityService('4vokbuxq', 'https://www.episolo.com/api/app-db');


// Initialize configuration (can be called manually, but auto-detection is preferred)
export function initEntityService(appId: string, apiUrl: string) {
  if (!apiUrl) {
    throw new Error("API URL is required for entity service initialization");
  }
  CONFIG = { appId, apiUrl };
}

// Auto-detect app ID from various sources (similar to AI service pattern)
function detectAppId(): string | null {
  // Check explicit config first
  if (CONFIG?.appId) {
    return CONFIG.appId;
  }
  
  // Check window globals (injected during deployment)
  if (typeof window !== "undefined") {
    if ((window as any).APP_ID) {
      return (window as any).APP_ID;
    }
    if ((window as any).__APP_ID__) {
      return (window as any).__APP_ID__;
    }
  }
  
  // Check Vite environment variable
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_APP_ID) {
    return import.meta.env.VITE_APP_ID;
  }
  
  return null;
}

// Get API base URL
function getApiBaseUrl(): string {
  // PRIORITY 1: Check window global (injected during deployment - preferred for runtime)
  // This takes precedence because it's the correct URL for the deployed environment (E2B sandbox)
  // The build-time CONFIG might have localhost which won't work in cloud sandboxes
  if (typeof window !== "undefined") {
    if ((window as any).EPISOLO_API_URL) {
      return `${(window as any).EPISOLO_API_URL}/api/app-db`;
    }
    if ((window as any).__EPISOLO_API_URL__) {
      return `${(window as any).__EPISOLO_API_URL__}/api/app-db`;
    }
  }
  
  // PRIORITY 2: Check Vite environment variable (for build-time configuration)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_EPISOLO_API_URL) {
    return `${import.meta.env.VITE_EPISOLO_API_URL}/api/app-db`;
  }
  
  // PRIORITY 3: Check explicit config (from initEntityService call)
  // This is lower priority because it may contain localhost URLs from build time
  if (CONFIG?.apiUrl) {
    return CONFIG.apiUrl;
  }
  
  // Default to relative path (for when running on same domain or proxied)
  return "/api/app-db";
}

// Get configuration with auto-detection
function getConfig() {
  // Try to auto-detect if not explicitly configured
  if (!CONFIG) {
    const appId = detectAppId();
    const apiUrl = getApiBaseUrl();
    
    if (appId) {
      CONFIG = { appId, apiUrl };
      console.log(`[Entity Service] Auto-initialized with appId: ${appId.substring(0, 8)}...`);
    }
  }
  
  if (!CONFIG || !CONFIG.appId) {
    throw new Error(
      "Entity service not initialized. App ID is missing.\n" +
      "Make sure one of the following is set:\n" +
      "  - window.APP_ID (injected in index.html)\n" +
      "  - VITE_APP_ID environment variable\n" +
      "  - Call initEntityService(appId, apiUrl) manually"
    );
  }
  
  return CONFIG;
}

// Simple API wrapper with endpoint validation
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const config = getConfig();

  // Validate endpoint - must be one of the allowed endpoints
  const allowedEndpoints = ["/list", "/create", "/update", "/delete"];
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  if (!allowedEndpoints.includes(cleanEndpoint)) {
    throw new Error(
      `Invalid endpoint: ${cleanEndpoint}. Must be one of: ${allowedEndpoints.join(", ")}`,
    );
  }

  const fullUrl = `${config.apiUrl}${cleanEndpoint}`;
  console.log(`[Entity Service] API Call: ${fullUrl}`);

  const response = await fetch(fullUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-ID": config.appId,
      "x-episolo-app-id": config.appId, // Also include the header we know works
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Entity Service] API Error: ${response.status} - ${error}`);
    throw new Error(error);
  }

  return response.json();
}

// IMPORTANT: Do not export apiCall or create other API functions
// All API communication should go through the entity operations below

// Entity operations interface
export interface EntityOperations<T = any> {
  list(): Promise<T[]>;
  filter(criteria: Partial<T>): Promise<T[]>;
  get(id: string): Promise<T>;
  create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// Create entity operations for a collection
export function createEntity<T = any>(
  collectionName: string,
): EntityOperations<T> {
  return {
    async list(): Promise<T[]> {
      const result = await apiCall("/list", {
        body: JSON.stringify({
          collection_name: collectionName,
          limit: 100,
          include_metadata: true,
        }),
      });
      return result.items || [];
    },

    async filter(criteria: Partial<T>): Promise<T[]> {
      const items = await this.list();
      if (!criteria || Object.keys(criteria).length === 0) {
        return items;
      }

      return items.filter((item) => {
        return Object.entries(criteria).every(([key, value]) => {
          if (Array.isArray(value)) {
            return value.includes((item as any)[key]);
          }
          return (item as any)[key] === value;
        });
      });
    },

    async get(id: string): Promise<T> {
      const items = await this.list();
      const item = items.find(
        (item: any) => item.id === id || item.objectId === id,
      );
      if (!item) {
        throw new Error(`${collectionName} with id "${id}" not found`);
      }
      return item;
    },

    async create(data: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T> {
      const result = await apiCall("/create", {
        body: JSON.stringify({
          collection_name: collectionName,
          object_data: data,
        }),
      });
      return result;
    },

    async update(id: string, updates: Partial<T>): Promise<T> {
      const result = await apiCall("/update", {
        body: JSON.stringify({
          collection_name: collectionName,
          object_id: id,
          object_data: updates,
        }),
      });
      return result;
    },

    async delete(id: string): Promise<void> {
      await apiCall("/delete", {
        body: JSON.stringify({
          collection_name: collectionName,
          object_id: id,
        }),
      });
    },
  };
}

// Auto-initialization happens lazily in getConfig() when first API call is made
// No explicit initialization is required if APP_ID is available in the environment

// CRITICAL: Do NOT add any other functions to this file
// CRITICAL: Do NOT export apiCall or any internal functions
// CRITICAL: Do NOT create entityRequest, postJson, or similar functions
// CRITICAL: Only use the exported entity operations through createEntity()
