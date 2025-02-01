// Cache management for keyword clustering
export const resultCache = new Map<string, {
  timestamp: number;
  result: { clusters: Record<string, string[]> };
}>();

export const pendingRequests = new Map<string, Promise<{ clusters: Record<string, string[]> }>>();

export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCacheKey(keywords: string[], type: string): string {
  return `${type}:${keywords.sort().join(',')}`;
}