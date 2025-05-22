// src/utils/encryptJsonPayload.ts
import forge from 'node-forge';

// Function to encrypt data using RSA public key
export async function encryptJsonPayloadClient(
  data: Record<string, any>,
  publicKeyUrl: string = '/keys/public.pem',
): Promise<string> {
  const response = await fetch(publicKeyUrl);
  const publicKeyPem = await response.text();

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem); // Import public key using node-forge

  const jsonString = JSON.stringify(data);

  // Encrypt using RSA-OAEP (SHA-256)
  const encrypted = publicKey.encrypt(jsonString, 'RSA-OAEP', {
    md: forge.md.sha256.create(), // SHA-256 hash function
  });

  // Convert the encrypted string to Base64
  return forge.util.encode64(encrypted);
}
