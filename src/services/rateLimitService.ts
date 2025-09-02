interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator: () => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimitService {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  // Configure rate limit for a specific action
  configure(action: string, config: RateLimitConfig) {
    this.configs.set(action, config);
  }

  // Check if request is allowed
  isAllowed(action: string): boolean {
    const config = this.configs.get(action);
    if (!config) return true; // No limit configured

    const key = config.keyGenerator();
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.count++;
    return true;
  }

  // Get remaining requests
  getRemaining(action: string): number {
    const config = this.configs.get(action);
    if (!config) return Infinity;

    const key = config.keyGenerator();
    const entry = this.limits.get(key);

    if (!entry) return config.maxRequests;

    return Math.max(0, config.maxRequests - entry.count);
  }

  // Get reset time
  getResetTime(action: string): number {
    const config = this.configs.get(action);
    if (!config) return 0;

    const key = config.keyGenerator();
    const entry = this.limits.get(key);

    return entry ? entry.resetTime : 0;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimitService = new RateLimitService();

// Configure default rate limits
rateLimitService.configure('mood-log', {
  maxRequests: 10, // 10 mood logs per day
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  keyGenerator: () => {
    // Use user ID from localStorage or session
    const user = localStorage.getItem('currentUser');
    return user ? `mood-log-${JSON.parse(user).uid}` : 'anonymous';
  },
});

rateLimitService.configure('chat-message', {
  maxRequests: 50, // 50 messages per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: () => {
    const user = localStorage.getItem('currentUser');
    return user ? `chat-${JSON.parse(user).uid}` : 'anonymous';
  },
});

rateLimitService.configure('ai-analysis', {
  maxRequests: 20, // 20 AI analyses per day
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  keyGenerator: () => {
    const user = localStorage.getItem('currentUser');
    return user ? `ai-${JSON.parse(user).uid}` : 'anonymous';
  },
});
