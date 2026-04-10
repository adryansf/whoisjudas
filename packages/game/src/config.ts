// =============================================================================
// GAME CONFIGURATION
// =============================================================================
// Centralized configuration for game constants

export const GAME_CONFIG = {
	// Room settings
	MIN_PLAYERS: 3,
	MAX_PLAYERS: 12,
	ROOM_CODE_LENGTH: 8,

	// Timing (in seconds)
	QUESTION_DURATION_DEFAULT: 300,
	VOTE_DURATION_SECONDS: 300,
	MIN_QUESTION_DURATION: 60,
	MAX_QUESTION_DURATION: 1800,

	// Room cleanup (in milliseconds)
	ROOM_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
	ROOM_CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes

	// Rate limiting
	RATE_LIMIT_WINDOW_MS: 5000,
	MAX_REQUESTS_IN_WINDOW: 20,
	RATE_LIMIT_CLEANUP_INTERVAL_MS: 60000, // 1 minute

	// Socket
	SOCKET_PING_TIMEOUT: 60000,
	SOCKET_PING_INTERVAL: 25000,

	// Player names
	MIN_NAME_LENGTH: 1,
	MAX_NAME_LENGTH: 20,
} as const;

// =============================================================================
// SECURE RANDOM UTILITIES
// =============================================================================
// Cryptographically secure random functions for game logic

/**
 * Returns a secure random index from 0 to max-1
 * Uses crypto.getRandomValues for security-critical operations
 */
export function secureRandomIndex(max: number): number {
	if (max <= 0) return 0;
	const randomBuffer = new Uint32Array(1);
	crypto.getRandomValues(randomBuffer);
	return (randomBuffer[0] as number) % max;
}

/**
 * Fisher-Yates shuffle using secure random
 * Use for shuffling characters, stories, etc.
 */
export function secureShuffle<T>(array: readonly T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = secureRandomIndex(i + 1);
		const temp = result[i];
		const swap = result[j];
		if (temp !== undefined && swap !== undefined) {
			result[i] = swap;
			result[j] = temp;
		}
	}
	return result;
}

/**
 * Select a random element using secure random
 */
export function secureRandomChoice<T>(array: readonly T[]): T {
	if (array.length === 0) {
		throw new Error("Cannot choose from empty array");
	}
	const index = secureRandomIndex(array.length);
	const item = array[index];
	if (item === undefined) {
		throw new Error("Array index out of bounds");
	}
	return item;
}
