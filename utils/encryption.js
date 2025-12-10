import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Get the encryption key from environment variable
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    console.error('WARNING: ENCRYPTION_KEY not set, using insecure default');
    // Create a 32-byte key from the default string
    return crypto.createHash('sha256').update('12345678901234567890123456789012').digest();
  }
  
  // If key is 64 hex characters (32 bytes), convert from hex
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  
  // If key is exactly 32 characters, use as-is
  if (key.length === 32) {
    return Buffer.from(key, 'utf8');
  }
  
  // Otherwise, hash it to get exactly 32 bytes
  return crypto.createHash('sha256').update(key).digest();
};

const ENCRYPTION_KEY = getEncryptionKey();

// Validate key length
if (ENCRYPTION_KEY.length !== 32) {
  throw new Error(`ENCRYPTION_KEY must be 32 bytes, got ${ENCRYPTION_KEY.length} bytes`);
}

export const encrypt = (text) => {
  try {
    if (!text) throw new Error('Text to encrypt is empty');
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw error;
  }
};

export const decrypt = (text) => {
  try {
    if (!text) throw new Error('Text to decrypt is empty');
    
    const parts = text.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted text format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw error;
  }
};