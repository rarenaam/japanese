/**
 * Password hashing utilities using Web Crypto API
 * Provides secure password hashing for client-side apps
 */

/**
 * Hash a password using PBKDF2 with SHA-256
 * This is secure for client-side apps and doesn't require external dependencies
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Convert password to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import the password as a key
  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  // Derive bits using PBKDF2
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // High iteration count for security
      hash: "SHA-256",
    },
    key,
    256, // 256 bits = 32 bytes
  );

  // Convert to base64 for storage
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const saltArray = Array.from(salt);
  const saltHex = saltArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Return salt:hash format
  return `${saltHex}:${hashHex}`;
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    // Split the stored hash into salt and hash
    const [saltHex, storedHashHex] = hash.split(":");

    if (!saltHex || !storedHashHex) {
      return false;
    }

    // Convert salt from hex to Uint8Array
    const saltArray =
      saltHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [];
    const salt = new Uint8Array(saltArray);

    // Convert password to ArrayBuffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import the password as a key
    const key = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );

    // Derive bits using the same parameters
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    );

    // Convert to hex
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Compare hashes using constant-time comparison
    return timingSafeEqual(computedHashHex, storedHashHex);
  } catch (error) {
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}
