import _sodium from 'libsodium-wrappers';

// Wait for sodium to be ready
let sodium: typeof _sodium;
const sodiumReady = _sodium.ready.then(() => {
  sodium = _sodium;
});

export interface EncryptedFile {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  key: Uint8Array;
}

export interface EncryptedMetadata {
  blobId: string;
  filename: string;
  nonce: string; // Base64 encoded
  algorithm: string;
  encryptedKey: string; // Base64 encoded
  timestamp: number;
  signature?: string;
}

/**
 * Encrypts a file using XSalsa20-Poly1305 (secretbox)
 * @param fileData The file data to encrypt
 * @returns The encrypted file data, nonce, and key
 */
export async function encryptFile(fileData: ArrayBuffer): Promise<EncryptedFile> {
  await sodiumReady;
  
  // Generate a random key for symmetric encryption
  const key = sodium.crypto_secretbox_keygen();
  
  // Generate a random nonce
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  
  // Encrypt the file
  const ciphertext = sodium.crypto_secretbox_easy(
    new Uint8Array(fileData),
    nonce,
    key
  );
  
  return { ciphertext, nonce, key };
}

/**
 * Decrypts a file using XSalsa20-Poly1305 (secretbox)
 * @param ciphertext The encrypted file data
 * @param nonce The nonce used for encryption
 * @param key The key used for encryption
 * @returns The decrypted file data
 */
export async function decryptFile(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  key: Uint8Array
): Promise<Uint8Array> {
  await sodiumReady;
  
  // Decrypt the file
  return sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
}

/**
 * Encrypts a symmetric key to a recipient's public key using X25519 (box)
 * @param symmetricKey The symmetric key to encrypt
 * @param recipientPublicKey The recipient's public key (X25519)
 * @param senderSecretKey The sender's secret key (X25519)
 * @returns The encrypted key
 */
export async function encryptKeyToRecipient(
  symmetricKey: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array
): Promise<Uint8Array> {
  await sodiumReady;
  
  // Generate a random nonce for the box
  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES);
  
  // Encrypt the symmetric key to the recipient
  const encryptedKey = sodium.crypto_box_easy(
    symmetricKey,
    nonce,
    recipientPublicKey,
    senderSecretKey
  );
  
  // Prepend the nonce to the encrypted key for easier handling
  const result = new Uint8Array(nonce.length + encryptedKey.length);
  result.set(nonce);
  result.set(encryptedKey, nonce.length);
  
  return result;
}

/**
 * Decrypts a symmetric key using the recipient's secret key
 * @param encryptedKeyWithNonce The encrypted key with prepended nonce
 * @param senderPublicKey The sender's public key (X25519)
 * @param recipientSecretKey The recipient's secret key (X25519)
 * @returns The decrypted symmetric key
 */
export async function decryptKeyFromSender(
  encryptedKeyWithNonce: Uint8Array,
  senderPublicKey: Uint8Array,
  recipientSecretKey: Uint8Array
): Promise<Uint8Array> {
  await sodiumReady;
  
  // Extract the nonce and encrypted key
  const nonce = encryptedKeyWithNonce.slice(0, sodium.crypto_box_NONCEBYTES);
  const encryptedKey = encryptedKeyWithNonce.slice(sodium.crypto_box_NONCEBYTES);
  
  // Decrypt the symmetric key
  return sodium.crypto_box_open_easy(
    encryptedKey,
    nonce,
    senderPublicKey,
    recipientSecretKey
  );
}

/**
 * Converts an Ed25519 public key to an X25519 public key
 * @param ed25519PublicKey The Ed25519 public key
 * @returns The X25519 public key
 */
export async function convertEd25519PkToX25519(ed25519PublicKey: Uint8Array): Promise<Uint8Array> {
  await sodiumReady;
  return sodium.crypto_sign_ed25519_pk_to_curve25519(ed25519PublicKey);
}

/**
 * Converts an Ed25519 secret key to an X25519 secret key
 * @param ed25519SecretKey The Ed25519 secret key
 * @returns The X25519 secret key
 */
export async function convertEd25519SkToX25519(ed25519SecretKey: Uint8Array): Promise<Uint8Array> {
  await sodiumReady;
  return sodium.crypto_sign_ed25519_sk_to_curve25519(ed25519SecretKey);
}

/**
 * Converts a Uint8Array to a Base64 string
 * @param buffer The Uint8Array to convert
 * @returns The Base64 string
 */
export function toBase64(buffer: Uint8Array): string {
  return sodium.to_base64(buffer, sodium.base64_variants.ORIGINAL);
}

/**
 * Converts a Base64 string to a Uint8Array
 * @param base64 The Base64 string to convert
 * @returns The Uint8Array
 */
export function fromBase64(base64: string): Uint8Array {
  return sodium.from_base64(base64, sodium.base64_variants.ORIGINAL);
}

/**
 * Creates a downloadable blob from data
 * @param data The data to create a blob from
 * @param filename The filename to use
 * @param mimeType The MIME type of the file
 */
export function downloadBlob(data: Uint8Array, filename: string, mimeType: string = 'application/octet-stream'): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}