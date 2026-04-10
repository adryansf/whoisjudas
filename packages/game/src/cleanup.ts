import { GAME_CONFIG } from "./config";
import { deleteRoom, getAllRooms } from "./store";

const INACTIVE_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

export function cleanupInactiveRooms(): number {
	const now = new Date();
	let removed = 0;

	for (const [code, room] of getAllRooms()) {
		const inactiveTime = now.getTime() - room.lastActivityAt.getTime();
		if (inactiveTime > INACTIVE_THRESHOLD_MS) {
			deleteRoom(code);
			removed++;
		}
	}

	return removed;
}

let cleanupInterval: ReturnType<typeof setInterval> | null = null;

export function startCleanupScheduler(): void {
	if (cleanupInterval) return;

	cleanupInterval = setInterval(() => {
		const removed = cleanupInactiveRooms();
		if (removed > 0) {
			console.log(`Cleaned up ${removed} inactive rooms`);
		}
	}, GAME_CONFIG.ROOM_CLEANUP_INTERVAL_MS);
}

export function stopCleanupScheduler(): void {
	if (cleanupInterval) {
		clearInterval(cleanupInterval);
		cleanupInterval = null;
	}
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * HTML escapes for common XSS patterns
 */
const HTML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&#39;",
};

/**
 * Escapes HTML special characters in a string
 */
function escapeHtml(str: string): string {
	return str.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

/**
 * Sanitizes a player name to prevent XSS attacks
 * - Trims whitespace
 * - Escapes HTML characters
 * - Removes dangerous patterns
 */
export function sanitizePlayerName(name: string): string {
	if (!name) return "";

	let sanitized = name.trim();

	sanitized = escapeHtml(sanitized);

	sanitized = sanitized.replace(/javascript:/gi, "");
	sanitized = sanitized.replace(/on\w+=/gi, "");

	sanitized = sanitized.replace(/(.)\1{10,}/g, "$1$1$1");

	return sanitized;
}
