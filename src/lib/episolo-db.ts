/**
 * Episolo Database SDK - Client-side SDK for generated apps
 * Provides secure, isolated database operations for each generated app
 */

// Global app context (auto-detected or manually set)
let APP_CONTEXT: { appId: string; apiEndpoint: string } | null = null;
// Auto-initialized for this app (injected by Episolo)
initializeEpisoloDB('4vokbuxq', 'https://www.episolo.com/api/app-db');


// Initialize the SDK with app context (optional - auto-detection is preferred)
export function initializeEpisoloDB(
  appId: string,
  apiEndpoint: string = "/api/app-db",
) {
  APP_CONTEXT = { appId, apiEndpoint };
}

// Auto-detect app ID from various sources
function detectAppId(): string | null {
  // Check explicit context first
  if (APP_CONTEXT?.appId) {
    return APP_CONTEXT.appId;
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
  // The build-time APP_CONTEXT might have localhost which won't work in cloud sandboxes
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
  
  // PRIORITY 3: Check explicit context (from initializeEpisoloDB call)
  // This is lower priority because it may contain localhost URLs from build time
  if (APP_CONTEXT?.apiEndpoint) {
    return APP_CONTEXT.apiEndpoint;
  }
  
  // Default to relative path
  return "/api/app-db";
}

// Get current app context with auto-detection
function getAppContext() {
  // Try to auto-detect if not explicitly configured
  if (!APP_CONTEXT) {
    const appId = detectAppId();
    const apiEndpoint = getApiBaseUrl();
    
    if (appId) {
      APP_CONTEXT = { appId, apiEndpoint };
      console.log(`[Episolo DB] Auto-initialized with appId: ${appId.substring(0, 8)}...`);
    }
  }
  
  if (!APP_CONTEXT || !APP_CONTEXT.appId) {
    throw new Error(
      "Episolo DB not initialized. App ID is missing.\n" +
      "Make sure one of the following is set:\n" +
      "  - window.APP_ID (injected in index.html)\n" +
      "  - VITE_APP_ID environment variable\n" +
      "  - Call initializeEpisoloDB(appId, apiEndpoint) manually"
    );
  }
  
  return APP_CONTEXT;
}

// Core API functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const { appId, apiEndpoint } = getAppContext();

  const response = await fetch(`${apiEndpoint}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-App-ID": appId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Create a new object in a collection
 */
export async function episoloCreateObject(
  collectionName: string,
  objectData: any,
) {
  try {
    const result = await apiRequest("/create", {
      method: "POST",
      body: JSON.stringify({
        collection_name: collectionName,
        object_data: objectData,
      }),
    });
    return result;
  } catch (error) {
    console.error("episoloCreateObject error:", error);
    throw error;
  }
}

/**
 * Update an object in a collection
 */
export async function episoloUpdateObject(
  collectionName: string,
  objectId: string,
  updates: any,
) {
  try {
    const result = await apiRequest("/update", {
      method: "POST",
      body: JSON.stringify({
        collection_name: collectionName,
        object_id: objectId,
        object_data: updates,
      }),
    });
    return result;
  } catch (error) {
    console.error("episoloUpdateObject error:", error);
    throw error;
  }
}

/**
 * Delete an object from a collection
 */
export async function episoloDeleteObject(
  collectionName: string,
  objectId: string,
) {
  try {
    await apiRequest("/delete", {
      method: "POST",
      body: JSON.stringify({
        collection_name: collectionName,
        object_id: objectId,
      }),
    });
    return true;
  } catch (error) {
    console.error("episoloDeleteObject error:", error);
    throw error;
  }
}

/**
 * List objects in a collection
 */
export async function episoloListObjects(
  collectionName: string,
  limit: number = 100,
  includeMetadata: boolean = true,
) {
  try {
    const result = await apiRequest("/list", {
      method: "POST",
      body: JSON.stringify({
        collection_name: collectionName,
        limit,
        include_metadata: includeMetadata,
      }),
    });
    return result;
  } catch (error) {
    console.error("episoloListObjects error:", error);
    throw error;
  }
}

/**
 * Get all collections for the current app
 */
export async function episoloGetCollections() {
  try {
    const result = await apiRequest("/collections", {
      method: "GET",
    });
    return result;
  } catch (error) {
    console.error("episoloGetCollections error:", error);
    throw error;
  }
}

// Convenience functions for common patterns

/**
 * Service factory - creates a service object for a specific collection
 */
export function episoloCreateService(collectionName: string) {
  const service = {
    // Create a new item
    create: async (data: any) => {
      return episoloCreateObject(collectionName, data);
    },

    // Get all items (with optional filtering client-side)
    getAll: async (limit?: number) => {
      const result = await episoloListObjects(collectionName, limit);
      return result.items || [];
    },

    // Find items by a property (client-side filtering)
    findBy: async (property: string, value: any, limit?: number) => {
      const result = await episoloListObjects(collectionName, limit);
      const items = result.items || [];
      return items.filter((item: any) => item.objectData[property] === value);
    },

    // Find one item by property
    findOne: async (property: string, value: any) => {
      const items = await service.findBy(property, value, 100);
      return items.length > 0 ? items[0] : null;
    },

    // Update an item
    update: async (objectId: string, updates: any) => {
      return episoloUpdateObject(collectionName, objectId, updates);
    },

    // Delete an item
    delete: async (objectId: string) => {
      return episoloDeleteObject(collectionName, objectId);
    },
  };

  return service;
}

/**
 * Simple Auth Manager - provides basic authentication for apps
 */
export function episoloCreateAuthManager() {
  const AUTH_KEY = "episolo_app_auth";
  const RESET_TOKENS_KEY = "episolo_reset_tokens";
  const authService = episoloCreateService("app_users");
  const resetTokenService = episoloCreateService("password_reset_tokens");

  // Import password utilities dynamically
  const getPasswordUtils = async () => {
    try {
      // @ts-ignore - Dynamic import for password utilities
      const { hashPassword, verifyPassword } = await import(
        "@/lib/password-utils"
      );
      return { hashPassword, verifyPassword };
    } catch (error) {
      console.error("Failed to load password utilities:", error);
      throw new Error("Password utilities not available");
    }
  };

  // Generate a secure random token
  const generateToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  };

  const authManager = {
    // Get current user from localStorage
    getCurrentUser: () => {
      const auth = localStorage.getItem(AUTH_KEY);
      if (!auth) return null;

      try {
        const userData = JSON.parse(auth);
        // Remove password from returned user data for security
        const { password, ...userWithoutPassword } = userData;
        return userWithoutPassword;
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    },

    // Register a new user
    register: async (userData: {
      username: string;
      email?: string;
      password: string;
      [key: string]: any;
    }) => {
      try {
        // Check if user already exists
        const existingUsers = await authService.findBy(
          "username",
          userData.username,
        );
        if (existingUsers.length > 0) {
          return { success: false, error: "Username already exists" };
        }

        if (userData.email) {
          const existingEmail = await authService.findBy(
            "email",
            userData.email,
          );
          if (existingEmail.length > 0) {
            return { success: false, error: "Email already exists" };
          }
        }

        // Hash password before storing
        const { hashPassword } = await getPasswordUtils();
        const hashedPassword = await hashPassword(userData.password);

        // Create new user with hashed password
        const { password, ...userDataWithoutPassword } = userData;
        const newUser = await authService.create({
          ...userDataWithoutPassword,
          passwordHash: hashedPassword, // Store as passwordHash, not password
          joinDate: new Date().toISOString(),
        });

        // Store user data without password
        const authData = {
          userId: newUser.objectId,
          username: userData.username,
          email: userData.email,
          ...userDataWithoutPassword,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

        return { success: true, user: authData };
      } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Registration failed" };
      }
    },

    // Login user with username OR email
    login: async (usernameOrEmail: string, password: string) => {
      try {
        // Check if input looks like an email
        const isEmail = usernameOrEmail.includes("@");

        // Try to find user by username or email
        let users = await authService.findBy(
          isEmail ? "email" : "username",
          usernameOrEmail,
        );

        // If no users found and it could be a username, also try email
        if (users.length === 0 && !isEmail) {
          users = await authService.findBy("email", usernameOrEmail);
        }

        // If still no users and it was email, try username
        if (users.length === 0 && isEmail) {
          users = await authService.findBy("username", usernameOrEmail);
        }

        if (users.length === 0) {
          return { success: false, error: "Invalid credentials" };
        }

        // Get password utilities
        const { verifyPassword } = await getPasswordUtils();

        // Find user with matching password hash
        let authenticatedUser = null;
        for (const user of users) {
          const storedHash =
            user.objectData.passwordHash || user.objectData.password;
          if (storedHash && (await verifyPassword(password, storedHash))) {
            authenticatedUser = user;
            break;
          }
        }

        if (authenticatedUser) {
          // Remove sensitive data before storing
          const {
            passwordHash,
            password: pwd,
            ...userData
          } = authenticatedUser.objectData;
          const authData = {
            userId: authenticatedUser.objectId,
            ...userData,
          };
          localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
          return { success: true, user: authData };
        } else {
          return { success: false, error: "Invalid credentials" };
        }
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: "Login failed" };
      }
    },

    // Request password reset - generates token and returns it for email
    requestPasswordReset: async (email: string) => {
      try {
        // Find user by email
        const users = await authService.findBy("email", email);

        if (users.length === 0) {
          // Don't reveal if email exists - return success anyway for security
          return {
            success: true,
            message: "If an account exists with this email, a reset link will be sent",
          };
        }

        const user = users[0];
        const token = generateToken();
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour expiry

        // Store the reset token
        await resetTokenService.create({
          userId: user.objectId,
          email: email,
          token: token,
          expiresAt: expiresAt,
          used: false,
        });

        return {
          success: true,
          token: token,
          email: email,
          username: user.objectData.username,
          message: "Password reset token generated",
        };
      } catch (error) {
        console.error("Password reset request error:", error);
        return { success: false, error: "Failed to process password reset request" };
      }
    },

    // Verify reset token is valid
    verifyResetToken: async (token: string) => {
      try {
        const tokens = await resetTokenService.findBy("token", token);

        if (tokens.length === 0) {
          return { success: false, error: "Invalid or expired reset token" };
        }

        const resetToken = tokens[0];
        const tokenData = resetToken.objectData;

        // Check if token is expired
        if (Date.now() > tokenData.expiresAt) {
          return { success: false, error: "Reset token has expired" };
        }

        // Check if token has been used
        if (tokenData.used) {
          return { success: false, error: "Reset token has already been used" };
        }

        return {
          success: true,
          email: tokenData.email,
          userId: tokenData.userId,
        };
      } catch (error) {
        console.error("Token verification error:", error);
        return { success: false, error: "Failed to verify reset token" };
      }
    },

    // Reset password using token
    resetPassword: async (token: string, newPassword: string) => {
      try {
        // Verify token first
        const verifyResult = await authManager.verifyResetToken(token);
        if (!verifyResult.success) {
          return verifyResult;
        }

        // Find the token record
        const tokens = await resetTokenService.findBy("token", token);
        if (tokens.length === 0) {
          return { success: false, error: "Invalid reset token" };
        }

        const resetToken = tokens[0];
        const tokenData = resetToken.objectData;

        // Find the user
        const users = await authService.findBy("email", tokenData.email);
        if (users.length === 0) {
          return { success: false, error: "User not found" };
        }

        const user = users[0];

        // Hash the new password
        const { hashPassword } = await getPasswordUtils();
        const hashedPassword = await hashPassword(newPassword);

        // Update user's password
        await authService.update(user.objectId, {
          ...user.objectData,
          passwordHash: hashedPassword,
        });

        // Mark token as used
        await resetTokenService.update(resetToken.objectId, {
          ...tokenData,
          used: true,
          usedAt: new Date().toISOString(),
        });

        return { success: true, message: "Password has been reset successfully" };
      } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: "Failed to reset password" };
      }
    },

    // Logout user
    logout: () => {
      localStorage.removeItem(AUTH_KEY);
    },

    // Check if user is authenticated
    isAuthenticated: () => {
      const user = authManager.getCurrentUser();
      return user !== null;
    },
  };

  return authManager;
}

// Export main functions for backward compatibility and ease of use
export {
  episoloCreateObject as createObject,
  episoloUpdateObject as updateObject,
  episoloDeleteObject as deleteObject,
  episoloListObjects as listObjects,
  episoloGetCollections as getCollections,
  episoloCreateService as createService,
  episoloCreateAuthManager as createAuthManager,
};
