export class TtlCache {
  constructor(ttlSeconds) {
    this.ttlSeconds = ttlSeconds;
    this.items = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  get(key) {
    const entry = this.items.get(key);

    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() >= entry.expiresAt) {
      this.items.delete(key);
      this.misses++;
      return undefined;
    }

    this.hits++;
    return entry.value;
  }

  set(key, value) {
    const expiresAt =
      Date.now() + this.ttlSeconds * 1000;

    this.items.set(key, {
      value,
      expiresAt,
    });
  }

  stats() {
    // Remove expired entries before counting.
    for (const [key, entry] of this.items) {
      if (Date.now() >= entry.expiresAt) {
        this.items.delete(key);
      }
    }

    return {
      entries: this.items.size,
      hits: this.hits,
      misses: this.misses,
      ttlSeconds: this.ttlSeconds,
    };
  }
}