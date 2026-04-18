const rateLimits = new Map<string, number[]>();

const RATE_LIMIT_WINDOW = 5000;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_CLEANUP_INTERVAL = 60000;

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function isRateLimited(socketId: string): boolean {
	const now = Date.now();
	const timestamps = rateLimits.get(socketId) || [];
	const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

	if (validTimestamps.length >= RATE_LIMIT_MAX) {
		return true;
	}

	validTimestamps.push(now);
	rateLimits.set(socketId, validTimestamps);
	return false;
}

export function startRateLimitCleanup(): void {
	if (cleanupInterval) return;

	cleanupInterval = setInterval(() => {
		const now = Date.now();
		for (const [socketId, timestamps] of rateLimits.entries()) {
			const valid = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
			if (valid.length === 0) {
				rateLimits.delete(socketId);
			} else {
				rateLimits.set(socketId, valid);
			}
		}
	}, RATE_LIMIT_CLEANUP_INTERVAL);
}

export function stopRateLimitCleanup(): void {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
	}
}

export function clearAllRateLimits(): void {
	rateLimits.clear();
}
