/**
 * HTML sanitization utilities for user-generated content
 * Prevents XSS attacks by escaping HTML characters
 */

/**
 * Escapes HTML special characters in a string
 * Use this to safely display user input that may contain HTML
 */
export function escapeHtml(str: string): string {
	const htmlEscapes: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
	};

	return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] ?? char);
}

/**
 * Sanitizes a player name by:
 * 1. Trimming whitespace
 * 2. Escaping HTML characters
 * 3. Removing any remaining dangerous patterns
 */
export function sanitizePlayerName(name: string): string {
	if (!name) return "";

	// Trim whitespace
	let sanitized = name.trim();

	// Escape HTML characters
	sanitized = escapeHtml(sanitized);

	// Remove any potential JavaScript patterns
	sanitized = sanitized.replace(/javascript:/gi, "");
	sanitized = sanitized.replace(/on\w+=/gi, "");

	// Remove excessive repeated characters (potential abuse)
	sanitized = sanitized.replace(/(.)\1{10,}/g, "$1$1$1");

	return sanitized;
}
