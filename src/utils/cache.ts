import NodeCache from 'node-cache';

// Create a cache instance with default TTL of 300 seconds (5 minutes)
// stdTTL: standard time to live in seconds
// checkperiod: automatic delete check interval in seconds
export const cache = new NodeCache({ 
    stdTTL: 300, 
    checkperiod: 60,
    useClones: false // Better performance, but be careful with object mutations
});

// Get a value from cache
export function cacheGet<T = any>(key: string): T | undefined {
    return cache.get<T>(key);
}

// Set a value in cache with optional custom TTL
export function cacheSet(key: string, value: any, ttlSeconds = 300): boolean {
    return cache.set(key, value, ttlSeconds);
}

// Clear all cache
export function clearCache(): void {
    cache.flushAll();
}

// Delete a specific key
export function cacheDelete(key: string): number {
    return cache.del(key);
}

// Get cache statistics
export function getCacheStats() {
    return cache.getStats();
}

