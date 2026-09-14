const tracker = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(identifier: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const userRecord = tracker.get(identifier);

  if (!userRecord || now > userRecord.expiresAt) {
    tracker.set(identifier, { count: 1, expiresAt: now + windowMs });
    return { allowed: true };
  }

  if (userRecord.count >= limit) {
    return { allowed: false };
  }

  userRecord.count += 1;
  return { allowed: true };
}