import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';

export function compressParams(params: Record<string, string>): string {
  return compressToEncodedURIComponent(JSON.stringify(params));
}

export function decompressParams(compressed: string): Record<string, string> | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(compressed);
    if (!decompressed) return null;
    return JSON.parse(decompressed);
  } catch (error) {
    console.error('Error decompressing params:', error);
    return null;
  }
}