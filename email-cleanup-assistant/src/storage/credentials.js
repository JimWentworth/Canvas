/**
 * Credential Storage
 * Secure in-memory credential storage for MVP
 * NOTE: For production, integrate with OS keychain or encrypted storage
 */

const crypto = require('crypto');

class CredentialStore {
  constructor() {
    this.store = new Map();
    this.encryptionKey = null;
  }

  /**
   * Initialize with encryption key
   * @param {string} masterPassword - Master password for encryption
   */
  initialize(masterPassword = null) {
    if (masterPassword) {
      this.encryptionKey = crypto.createHash('sha256')
        .update(masterPassword)
        .digest();
    }
  }

  /**
   * Encrypt data
   * @param {string} text - Text to encrypt
   * @returns {string} Encrypted text
   */
  encrypt(text) {
    if (!this.encryptionKey) {
      // For MVP, store in memory without encryption
      // WARNING: This is not secure for production!
      return text;
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt data
   * @param {string} encryptedText - Text to decrypt
   * @returns {string} Decrypted text
   */
  decrypt(encryptedText) {
    if (!this.encryptionKey) {
      return encryptedText;
    }

    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Store credentials for a site
   * @param {string} siteId - Site identifier
   * @param {string} username - Username/email
   * @param {string} password - Password
   */
  setCredentials(siteId, username, password) {
    const encrypted = {
      username: this.encrypt(username),
      password: this.encrypt(password)
    };

    this.store.set(siteId, encrypted);
  }

  /**
   * Get credentials for a site
   * @param {string} siteId - Site identifier
   * @returns {Object|null} Credentials or null if not found
   */
  getCredentials(siteId) {
    const encrypted = this.store.get(siteId);

    if (!encrypted) {
      return null;
    }

    return {
      username: this.decrypt(encrypted.username),
      password: this.decrypt(encrypted.password)
    };
  }

  /**
   * Check if credentials exist for a site
   * @param {string} siteId - Site identifier
   * @returns {boolean}
   */
  hasCredentials(siteId) {
    return this.store.has(siteId);
  }

  /**
   * Remove credentials for a site
   * @param {string} siteId - Site identifier
   */
  removeCredentials(siteId) {
    this.store.delete(siteId);
  }

  /**
   * Clear all credentials
   */
  clear() {
    this.store.clear();
  }

  /**
   * Get all stored site IDs
   * @returns {Array<string>}
   */
  getStoredSites() {
    return Array.from(this.store.keys());
  }

  /**
   * Export credentials (encrypted)
   * WARNING: Handle with care!
   * @returns {Object}
   */
  export() {
    const exported = {};
    for (const [siteId, creds] of this.store.entries()) {
      exported[siteId] = creds;
    }
    return exported;
  }

  /**
   * Import credentials
   * @param {Object} data - Exported credentials
   */
  import(data) {
    for (const [siteId, creds] of Object.entries(data)) {
      this.store.set(siteId, creds);
    }
  }
}

// Singleton instance
const credentialStore = new CredentialStore();

module.exports = credentialStore;
