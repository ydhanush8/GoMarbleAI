import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

if (!process.env.TOKEN_ENCRYPTION_KEY) {
  throw new Error('TOKEN_ENCRYPTION_KEY is required');
}

// Derive encryption key from environment variable
function getEncryptionKey(): Buffer {
  const keyStr = process.env.TOKEN_ENCRYPTION_KEY!;
  
  // Try to parse as hex first, then base64
  let key: Buffer;
  if (/^[0-9a-fA-F]+$/.test(keyStr) && keyStr.length === 64) {
    key = Buffer.from(keyStr, 'hex');
  } else {
    // Fallback to base64
    key = Buffer.from(keyStr, 'base64');
  }

  if (key.length !== 32) {
    throw new Error(`Invalid TOKEN_ENCRYPTION_KEY length: expected 32 bytes, got ${key.length}. Please use a 64-character hex string or 44-character base64 string.`);
  }

  return key;
}

/**
 * Encrypt a string (e.g., OAuth token)
 * Returns: base64-encoded string containing salt + iv + authTag + encrypted data
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Combine: salt + iv + authTag + encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ]);
  
  return combined.toString('base64');
}

/**
 * Decrypt an encrypted string
 */
export function decrypt(encrypted: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encrypted, 'base64');
  
  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const encryptedData = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData.toString('base64'), 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
