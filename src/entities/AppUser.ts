/**
 * AppUser Entity - Authentication and user management
 * Clean, simple interface for user operations within the app
 */

import { createEntity } from "@/lib/entity-service";

// App User interface for authentication
export interface AppUser {
  id: string;
  username: string;
  email?: string;
  passwordHash: string; // Hashed password - never store plain text!
  role?: "admin" | "user" | "moderator";
  active?: boolean;
  joinDate?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    preferences?: any;
  };
}

// Create entity operations
const AppUserEntity = createEntity<AppUser>("app_users");

// Export clean interface
export const AppUser = {
  /**
   * List all users
   */
  list: () => AppUserEntity.list(),

  /**
   * Filter users by criteria
   * @example AppUser.filter({ active: true, role: 'admin' })
   */
  filter: (criteria: Partial<AppUser>) => AppUserEntity.filter(criteria),

  /**
   * Get a specific user by ID
   */
  get: (id: string) => AppUserEntity.get(id),

  /**
   * Find user by username
   */
  findByUsername: async (username: string) => {
    const users = await AppUserEntity.filter({ username });
    return users[0] || null;
  },

  /**
   * Find user by email
   */
  findByEmail: async (email: string) => {
    const users = await AppUserEntity.filter({ email });
    return users[0] || null;
  },

  /**
   * Create a new user
   * @example AppUser.create({ username: 'john_doe', email: 'john@example.com', password: 'password123' })
   * Note: Password will be hashed automatically by the auth manager
   */
  create: async (data: {
    username: string;
    email?: string;
    password: string;
    role?: "admin" | "user" | "moderator";
    active?: boolean;
    profile?: AppUser["profile"];
  }) => {
    // Import password hashing utility
    const { hashPassword } = await import("@/lib/password-utils");

    // Hash the password before storing
    const passwordHash = await hashPassword(data.password);

    // Remove plain password and store hash
    const { password, ...userData } = data;

    return AppUserEntity.create({
      ...userData,
      passwordHash,
      role: data.role ?? "user",
      active: data.active ?? true,
      joinDate: new Date().toISOString(),
    });
  },

  /**
   * Update an existing user
   * Note: If updating password, it will be hashed automatically
   */
  update: async (
    id: string,
    updates: Partial<
      Pick<AppUser, "username" | "email" | "role" | "active" | "profile"> & {
        password?: string;
      }
    >,
  ) => {
    // If password is being updated, hash it first
    if (updates.password) {
      const { hashPassword } = await import("@/lib/password-utils");
      const passwordHash = await hashPassword(updates.password);
      const { password, ...restUpdates } = updates;
      return AppUserEntity.update(id, { ...restUpdates, passwordHash } as any);
    }

    return AppUserEntity.update(id, updates as any);
  },

  /**
   * Delete a user
   */
  delete: (id: string) => AppUserEntity.delete(id),

  /**
   * Authenticate user (secure password verification)
   */
  authenticate: async (username: string, password: string) => {
    try {
      const user = await AppUser.findByUsername(username);

      if (!user || !user.active) {
        return { success: false, error: "Invalid username or password" };
      }

      // Import password verification utility
      const { verifyPassword } = await import("@/lib/password-utils");

      // Verify password against stored hash
      const isValid = await verifyPassword(password, user.passwordHash);

      if (isValid) {
        // Return user without password hash
        const { passwordHash, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
      }

      return { success: false, error: "Invalid username or password" };
    } catch (error) {
      console.error("Authentication error:", error);
      return { success: false, error: "Authentication failed" };
    }
  },
};
