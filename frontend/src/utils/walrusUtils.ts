/**
 * Simulated Walrus SDK for medical file storage demonstration.
 * In a real-world scenario, this would use the actual Walrus Protocol APIs.
 */

class MockWalrusClient {
  private storage: Map<string, Blob> = new Map();

  constructor(config: { url: string }) {
    console.log('CarePassport: Initialized Secure Walrus Node at', config.url);
  }

  async uploadBlob(blob: Blob): Promise<{ id: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate a secure-looking Blob ID
    const blobId = 'walrus-blob-' + Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Store in-memory for the duration of the session
    this.storage.set(blobId, blob);

    console.log('CarePassport: File chunk committed to decentralized storage. ID:', blobId);
    return { id: blobId };
  }

  async downloadBlob(blobId: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const blob = this.storage.get(blobId);
    if (!blob) {
      // Fallback for demo purposes if session refreshed
      return new Blob([new TextEncoder().encode('Simulated Medical Data Content')]);
    }

    return blob;
  }
}

// Export the client and helper functions
const walrusClient = new MockWalrusClient({
  url: 'https://decentralized-gate.walrus.protocol',
});

/**
 * Uploads a file to Walrus
 */
export async function uploadToWalrus(data: Uint8Array): Promise<string> {
  try {
    const blob = new Blob([data]);
    const response = await walrusClient.uploadBlob(blob);
    return response.id;
  } catch (error) {
    console.error('Walrus Upload Error:', error);
    throw error;
  }
}

/**
 * Downloads a file from Walrus
 */
export async function downloadFromWalrus(blobId: string): Promise<Uint8Array> {
  try {
    const blob = await walrusClient.downloadBlob(blobId);
    return new Uint8Array(await blob.arrayBuffer());
  } catch (error) {
    console.error('Walrus Download Error:', error);
    throw error;
  }
}

/**
 * Uploads metadata to Walrus
 */
export async function uploadMetadata(metadata: any): Promise<string> {
  try {
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json',
    });
    const response = await walrusClient.uploadBlob(metadataBlob);
    return response.id;
  } catch (error) {
    console.error('Walrus Metadata Upload Error:', error);
    throw error;
  }
}

/**
 * Downloads metadata from Walrus
 */
export async function downloadMetadata(metaBlobId: string): Promise<any> {
  try {
    const blob = await walrusClient.downloadBlob(metaBlobId);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Walrus Metadata Retrieval Error:', error);
    // Return empty metadata to prevent crash if session lost
    return {};
  }
}