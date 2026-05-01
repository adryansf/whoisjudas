import { createServer } from "node:http";
import { env } from "@whoisjudas/env/server";
import type {
	CastVoteResult,
	CreateRoomResult,
	JoinRoomResult,
	JudasGuessResult,
	StartGameResult,
} from "@whoisjudas/game";
import next from "next";
import { Server, type Socket } from "socket.io";
import { z } from "zod";

// =============================================================================
// RATE LIMITING
// =============================================================================
// In-memory rate limiter to prevent abuse
// Supports both per-socket and per-IP limiting

const rateLimits = new Map<string, number[]>();
const ipLimits = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_REQUESTS_IN_WINDOW = 20;
const RATE_LIMIT_CLEANUP_INTERVAL = 60000; // Cleanup every 60 seconds

// Store interval references for cleanup
let rateLimitCleanupInterval: NodeJS.Timeout | null = null;

/**
 * Checks if a socket has exceeded the rate limit
 * @param socketId - The socket ID to check
 * @returns true if rate limited, false otherwise
 */
function isRateLimited(socketId: string): boolean {
	const now = Date.now();
	const timestamps = rateLimits.get(socketId) || [];
	const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);

	if (validTimestamps.length >= MAX_REQUESTS_IN_WINDOW) {
		return true;
	}

	validTimestamps.push(now);
	rateLimits.set(socketId, validTimestamps);
	return false;
}

/**
 * Periodic cleanup of stale rate limit entries
 * Removes entries with no valid timestamps to prevent memory growth
 */
function cleanupRateLimits(): void {
	const now = Date.now();
	// Clean socket rate limits
	for (const [socketId, timestamps] of rateLimits.entries()) {
		const validTimestamps = timestamps.filter(
			(t) => now - t < RATE_LIMIT_WINDOW,
		);
		if (validTimestamps.length === 0) {
			rateLimits.delete(socketId);
		} else if (validTimestamps.length < timestamps.length) {
			rateLimits.set(socketId, validTimestamps);
		}
	}
	// Clean IP rate limits
	for (const [ip, timestamps] of ipLimits.entries()) {
		const validTimestamps = timestamps.filter(
			(t) => now - t < RATE_LIMIT_WINDOW,
		);
		if (validTimestamps.length === 0) {
			ipLimits.delete(ip);
		} else if (validTimestamps.length < timestamps.length) {
			ipLimits.set(ip, validTimestamps);
		}
	}
}

// Start periodic cleanup of rate limits
rateLimitCleanupInterval = setInterval(
	cleanupRateLimits,
	RATE_LIMIT_CLEANUP_INTERVAL,
);

// =============================================================================
// SAFE CALLBACK AND EMIT HELPERS
// =============================================================================
// Prevents errors in callbacks or emits from crashing the server

function safeCallback<T>(
	callback: SocketCallback<T> | undefined,
	response: T,
): void {
	if (typeof callback === "function") {
		try {
			callback(response);
		} catch (err) {
			console.error(
				"Callback error:",
				err instanceof Error ? err.message : err,
			);
		}
	}
}

function safeEmit(
	io: Server,
	roomCode: string,
	event: string,
	...args: unknown[]
): void {
	try {
		io.to(roomCode).emit(event, ...args);
	} catch (err) {
		console.error(
			`Failed to emit ${event} to ${roomCode}:`,
			err instanceof Error ? err.message : err,
		);
	}
}

// =============================================================================
// INPUT VALIDATION SCHEMAS
// =============================================================================
// Zod schemas for validating incoming socket events
// These ensure data integrity before processing

// Validation patterns based on nanoid format used in the game package
const PLAYER_ID_PATTERN = /^[A-Za-z0-9_-]{12}$/;

const CreateRoomSchema = z.object({
	hostName: z.string().min(1).max(20).trim(),
});

const JoinRoomSchema = z.object({
	roomCode: z
		.string()
		.min(1)
		.max(10)
		.transform((s) => s.toUpperCase()),
	playerName: z.string().min(1).max(20).trim(),
});

const ReconnectSchema = z.object({
	roomCode: z
		.string()
		.min(1)
		.max(10)
		.transform((s) => s.toUpperCase()),
	playerId: z
		.string()
		.min(1)
		.regex(PLAYER_ID_PATTERN, "Invalid player ID format"),
});

const UpdateSettingsSchema = z.object({
	roomCode: z
		.string()
		.min(1)
		.max(10)
		.transform((s) => s.toUpperCase()),
	settings: z.object({ questionDuration: z.number().min(60).max(1800) }),
});

const VoteCastSchema = z.object({
	targetId: z
		.string()
		.min(1)
		.regex(PLAYER_ID_PATTERN, "Invalid target ID format"),
});

const JudasGuessSchema = z.object({
	storyId: z.string().min(1),
});

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

const dev = env.NODE_ENV !== "production";
const hostname = env.HOSTNAME ?? "0.0.0.0";
const port = env.PORT;

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Maps a player to their current socket and room
 */
interface PlayerInfo {
	playerId: string;
	roomCode: string;
	browserSessionId?: string;
}

/**
 * Type for socket event callbacks
 */
type SocketCallback<T> = (result: T) => void;

// Response types for each socket event
interface CreateRoomResponse {
	success: boolean;
	roomCode?: string;
	playerId?: string;
	hostId?: string;
	error?: string;
}

interface JoinRoomResponse {
	success: boolean;
	playerId?: string;
	players?: Array<{ id: string; name: string; isConnected: boolean }>;
	hostId?: string;
	error?: string;
}

interface ReconnectResponse {
	success: boolean;
	gameState?: unknown;
	error?: string;
}

interface BaseResponse {
	success: boolean;
	error?: string;
}

interface VoteResponse extends BaseResponse {}

interface JudasGuessResponse extends BaseResponse {
	correct?: boolean;
}

// =============================================================================
// GAME TIMER CONFIGURATION
// =============================================================================

const VOTE_DURATION_SECONDS = 300;

// Maps room codes to their active timer intervals
const roomIntervals = new Map<string, NodeJS.Timeout>();

// =============================================================================
// GAME TIMER FUNCTIONS
// =============================================================================

/**
 * Starts the game timer for a room
 * The timer counts down and emits events at each second
 * Automatically transitions from question phase to vote phase, then to reveal
 *
 * @param io - The Socket.IO server instance
 * @param roomCode - The room to start the timer for
 */
async function startRoomTimer(io: Server, roomCode: string) {
	// Clear any existing timer for this room
	if (roomIntervals.has(roomCode)) {
		clearInterval(roomIntervals.get(roomCode));
	}

	const interval = setInterval(async () => {
		const { getRoom } = await import("@whoisjudas/game");
		const room = getRoom(roomCode);

		// Room no longer exists or game ended - stop timer
		if (!room || room.state !== "playing" || !room.currentRound) {
			clearInterval(interval);
			roomIntervals.delete(roomCode);
			return;
		}

		const round = room.currentRound;

		// Already in reveal phase - stop timer
		if (round.phase === "reveal") {
			clearInterval(interval);
			roomIntervals.delete(roomCode);
			return;
		}

		// Decrement timer and broadcast to all players
		round.timerRemaining--;

		safeEmit(io, roomCode.toUpperCase(), "game:timer", {
			timerRemaining,
			phase: "vote",
		});

		// Timer reached zero - advance phase
		if (round.timerRemaining <= 0) {
			if (round.phase === "question") {
				// Transition to vote phase
				round.phase = "vote";
				round.timerRemaining = VOTE_DURATION_SECONDS;
				round.phaseStartedAt = new Date();
				round.timerSeconds = VOTE_DURATION_SECONDS;

				safeEmit(io, roomCode.toUpperCase(), "game:phase-change", {
					phase: "vote",
					timerSeconds: VOTE_DURATION_SECONDS,
				});
			} else if (round.phase === "vote") {
				// Timer expired during vote - trigger reveal
				triggerReveal(io, roomCode);
				clearInterval(interval);
				roomIntervals.delete(roomCode);
			}
		}
	}, 1000);

	roomIntervals.set(roomCode, interval);
}

/**
 * Checks if the round is complete (all disciples voted and Judas made a guess)
 * If complete, triggers the reveal phase
 *
 * @param io - The Socket.IO server instance
 * @param roomCode - The room to check
 */
async function checkRoundCompletion(io: Server, roomCode: string) {
	const { getRoom } = await import("@whoisjudas/game");
	const room = getRoom(roomCode);
	if (!room || room.state !== "playing" || !room.currentRound) return;

	const round = room.currentRound;
	if (round.phase !== "vote") return;

	const players = Array.from(room.players.values());
	const disciples = players.filter((p) => p.role === "disciple");
	const judas = players.find((p) => p.role === "judas");

	const allDisciplesVoted = disciples.every((p) => p.vote);
	const judasGuessed = judas?.judasGuess;

	if (allDisciplesVoted && judasGuessed) {
		triggerReveal(io, roomCode);
	}
}

/**
 * Triggers the reveal phase - shows all players who Judas was and the outcome
 *
 * @param io - The Socket.IO server instance
 * @param roomCode - The room to reveal
 */
async function triggerReveal(io: Server, roomCode: string) {
	const { getRoom, determineWinner } = await import("@whoisjudas/game");
	const room = getRoom(roomCode);
	if (!room || room.state !== "playing" || !room.currentRound) return;

	const round = room.currentRound;
	if (round.phase === "reveal") return;

	// Set reveal phase and determine winner
	round.phase = "reveal";
	round.outcome = determineWinner(room);

	// Clean up timer
	const interval = roomIntervals.get(roomCode);
	if (interval) {
		clearInterval(interval);
		roomIntervals.delete(roomCode);
	}

	const judas = room.players.get(round.judasId);

	// Broadcast reveal to all players
	safeEmit(io, roomCode.toUpperCase(), "game:reveal", {
		judasId: round.judasId,
		judasName: judas?.name || "Unknown",
		storyId: round.storyId,
		winner: round.outcome?.split("-")[0] || "tie",
		votes: Array.from(round.votes.entries()).map(([voterId, targetId]) => ({
			voterId,
			voterName: room.players.get(voterId)?.name || "Unknown",
			targetId,
		})),
		judasGuess: judas?.judasGuess,
	});
}

// =============================================================================
// SOCKET STATE MANAGEMENT
// =============================================================================
// Maps to track socket <-> player relationships
// These help us identify which player is associated with each socket

// Maps playerId -> socketId[] (multiple sockets allowed per player for multi-room support)
const playerSockets = new Map<string, string[]>();

// Maps socketId -> PlayerInfo (playerId, roomCode, browserSessionId)
const socketPlayers = new Map<string, PlayerInfo>();

// Maps browserSessionId -> { playerId, roomCode }[] (multiple rooms per session)
const browserSessionPlayers = new Map<
	string,
	{ playerId: string; roomCode: string }[]
>();

// =============================================================================
// SERVER INITIALIZATION
// =============================================================================

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handler);

	// Create Socket.IO server with CORS and transport configuration
	const io = new Server(httpServer, {
		cors: {
			origin: dev ? "*" : env.CORS_ORIGIN,
			methods: ["GET", "POST"],
		},
		transports: ["websocket", "polling"],
		pingTimeout: 60000, // 60 seconds timeout for ping/pong
		pingInterval: 25000, // Check connection every 25 seconds
	});

	// ==========================================================================
	// SOCKET CONNECTION HANDLER
	// ==========================================================================

	io.on("connection", (socket: Socket) => {
		console.log(`Client connected: ${socket.id}`);

		// Extract browser session ID from auth handshake
		// This is set client-side and helps track multi-tab scenarios
		const browserSessionId = socket.handshake.auth?.browserSessionId as
			| string
			| undefined;

		// Check if this browser session already has an active player in the SAME room
		// For multi-room support, we only kick if same browser session + same room
		if (browserSessionId) {
			const existingSessions = browserSessionPlayers.get(browserSessionId);
			if (existingSessions) {
				for (const existingPlayer of existingSessions) {
					const existingSocketIds = playerSockets.get(existingPlayer.playerId);
					if (existingSocketIds) {
						for (const existingSocketId of existingSocketIds) {
							if (existingSocketId && existingSocketId !== socket.id) {
								// Only kick if in the same room (prevents same-tab duplicates)
								const existingSocket = io.sockets.sockets.get(existingSocketId);
								if (existingSocket) {
									existingSocket.emit("kicked", {
										reason: "Connected from another tab",
									});
									existingSocket.disconnect(true);
									socketPlayers.delete(existingSocketId);
								}
							}
						}
					}
				}
			}
		}

		// =======================================================================
		// ROOM:CREATE - Host creates a new game room
		// =======================================================================

		socket.on(
			"room:create",
			async (
				payload: unknown,
				callback: SocketCallback<CreateRoomResponse>,
			) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				const result = CreateRoomSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				const { hostName } = result.data;
				console.log(`Creating room: ${hostName}`);

				try {
					// Allow creating room even if browser session has active rooms (multi-room support)
					const { createRoom } = await import("@whoisjudas/game");
					const result: CreateRoomResult = createRoom(hostName);

					console.log(
						`Room created: ${result.roomCode} for player: ${result.playerId}`,
					);

					// Update socket mappings (player can have multiple sockets for multi-room)
					const existingSockets = playerSockets.get(result.playerId) || [];
					existingSockets.push(socket.id);
					playerSockets.set(result.playerId, existingSockets);
					socketPlayers.set(socket.id, {
						playerId: result.playerId,
						roomCode: result.roomCode,
						browserSessionId,
					});

					// Track browser session for multi-room support
					if (browserSessionId) {
						const existingSessions =
							browserSessionPlayers.get(browserSessionId) || [];
						existingSessions.push({
							playerId: result.playerId,
							roomCode: result.roomCode,
						});
						browserSessionPlayers.set(browserSessionId, existingSessions);
					}

					// Join the room socket channel
					socket.join(result.roomCode);

					safeCallback(callback, {
						success: true,
						roomCode: result.roomCode,
						playerId: result.playerId,
						hostId: result.playerId,
					});
				} catch (error) {
					console.error(`Room creation error: ${error}`);
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// ROOM:JOIN - Player joins an existing room
		// =======================================================================

		socket.on(
			"room:join",
			async (payload: unknown, callback: SocketCallback<JoinRoomResponse>) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				const result = JoinRoomSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				const { roomCode, playerName } = result.data;

				try {
					// Handle existing browser session - for multi-room, check if in same room
					if (browserSessionId) {
						const existingSessions =
							browserSessionPlayers.get(browserSessionId) || [];
						const sameRoomSession = existingSessions.find(
							(s) => s.roomCode.toUpperCase() === roomCode.toUpperCase(),
						);

						if (sameRoomSession) {
							// Same room - just update player name (reconnection scenario)
							const { renamePlayer, getRoom } = await import(
								"@whoisjudas/game"
							);
							const player = renamePlayer(
								roomCode,
								sameRoomSession.playerId,
								playerName,
							);
							const room = getRoom(roomCode);

							if (player && room) {
								safeEmit(io, roomCode.toUpperCase(), "player:updated", {
									player: {
										id: player.id,
										name: player.name,
										isConnected: true,
									},
								});

								safeCallback(callback, {
									success: true,
									playerId: player.id,
									players: Array.from(room.players.values()).map((p) => ({
										id: p.id,
										name: p.name,
										isConnected: p.isConnected,
									})),
									hostId: room.hostId,
								});
								return;
							}
						}
						// Different room or no existing session - allow joining (multi-room support)
						// Don't auto-leave previous room
					}

					// Attempt to join the room
					const { joinRoom } = await import("@whoisjudas/game");
					const result: JoinRoomResult = joinRoom(roomCode, playerName);

					// For multi-room: add socket to player's socket list instead of kicking
					const existingSocketIds = playerSockets.get(result.player.id) || [];
					if (!existingSocketIds.includes(socket.id)) {
						existingSocketIds.push(socket.id);
					}
					playerSockets.set(result.player.id, existingSocketIds);
					socketPlayers.set(socket.id, {
						playerId: result.player.id,
						roomCode: roomCode.toUpperCase(),
						browserSessionId,
					});

					if (browserSessionId) {
						const sessions = browserSessionPlayers.get(browserSessionId) || [];
						sessions.push({
							playerId: result.player.id,
							roomCode: roomCode.toUpperCase(),
						});
						browserSessionPlayers.set(browserSessionId, sessions);
					}

					// Join the room socket channel
					socket.join(roomCode.toUpperCase());

					// Notify other players in the room
					socket.to(roomCode.toUpperCase()).emit("room:player-joined", {
						player: {
							id: result.player.id,
							name: result.player.name,
							isConnected: true,
						},
						playerCount: result.playerCount,
					});

					safeCallback(callback, {
						success: true,
						playerId: result.player.id,
						players: result.players,
						hostId: result.hostId,
					});
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// ROOM:RECONNECT - Player reconnects to an existing game
		// =======================================================================

		socket.on(
			"room:reconnect",
			async (payload: unknown, callback: SocketCallback<ReconnectResponse>) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				const result = ReconnectSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				const { roomCode, playerId } = result.data;

				try {
					const { reconnectPlayer } = await import("@whoisjudas/game");
					const result = reconnectPlayer(roomCode, playerId);

					// Update socket mappings - add socket to player's array (multi-room support)
					const existingSocketIds = playerSockets.get(playerId) || [];
					if (!existingSocketIds.includes(socket.id)) {
						existingSocketIds.push(socket.id);
					}
					playerSockets.set(playerId, existingSocketIds);
					socketPlayers.set(socket.id, {
						playerId: playerId,
						roomCode: roomCode.toUpperCase(),
						browserSessionId,
					});

					if (browserSessionId) {
						const sessions = browserSessionPlayers.get(browserSessionId) || [];
						sessions.push({
							playerId: playerId,
							roomCode: roomCode.toUpperCase(),
						});
						browserSessionPlayers.set(browserSessionId, sessions);
					}

					socket.join(roomCode.toUpperCase());
					safeCallback(callback, { success: true, gameState: result });
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// ROOM:LEAVE - Player voluntarily leaves the room
		// =======================================================================

		socket.on("room:leave", async () => {
			try {
				const playerInfo = socketPlayers.get(socket.id);
				if (playerInfo) {
					const { leaveRoom } = await import("@whoisjudas/game");
					const result = leaveRoom(playerInfo.roomCode, playerInfo.playerId);

					socket.leave(playerInfo.roomCode);
					socketPlayers.delete(socket.id);

					// Remove socket from player's socket list
					const socketList = playerSockets.get(playerInfo.playerId);
					if (socketList) {
						const idx = socketList.indexOf(socket.id);
						if (idx !== -1) socketList.splice(idx, 1);
						if (socketList.length === 0) {
							playerSockets.delete(playerInfo.playerId);
						}
					}

					// Remove room from browser session's room list
					if (playerInfo.browserSessionId) {
						const sessionRooms = browserSessionPlayers.get(
							playerInfo.browserSessionId,
						);
						if (sessionRooms) {
							const idx = sessionRooms.findIndex(
								(r) => r.roomCode === playerInfo.roomCode,
							);
							if (idx !== -1) sessionRooms.splice(idx, 1);
							if (sessionRooms.length === 0) {
								browserSessionPlayers.delete(playerInfo.browserSessionId);
							}
						}
					}

					if (result) {
						safeEmit(io, playerInfo.roomCode, "room:player-left", {
							playerId: playerInfo.playerId,
							playerName: result.playerName,
							playerCount: result.playerCount,
						});

						if (result.newHostId) {
							safeEmit(io, playerInfo.roomCode, "room:host-changed", {
								newHostId: newHostId,
								newHostName: newHost.name,
							});
						}
					}
				}
			} catch (error) {
				console.error("Leave room error:", error);
			}
		});

		// =======================================================================
		// ROOM:UPDATE-SETTINGS - Host updates game settings
		// =======================================================================

		socket.on(
			"room:update-settings",
			async (payload: unknown, callback: SocketCallback<BaseResponse>) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				const result = UpdateSettingsSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				const { roomCode, settings } = result.data;

				try {
					const playerInfo = socketPlayers.get(socket.id);
					if (!playerInfo) {
						safeCallback(callback, { success: false, error: "Not in a room" });
						return;
					}

					const { updateSettings } = await import("@whoisjudas/game");
					updateSettings(roomCode, playerInfo.playerId, settings);

					safeEmit(io, roomCode.toUpperCase(), "room:settings-updated", {
						settings: result.data.settings,
					});

					safeCallback(callback, { success: true });
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// GAME:START - Host starts the game
		// =======================================================================

		socket.on(
			"game:start",
			async (_payload: unknown, callback: SocketCallback<BaseResponse>) => {
				try {
					const playerInfo = socketPlayers.get(socket.id);
					if (!playerInfo) {
						safeCallback(callback, { success: false, error: "Not in a room" });
						return;
					}

					const { startGame } = await import("@whoisjudas/game");
					const result: StartGameResult = startGame(
						playerInfo.roomCode,
						playerInfo.playerId,
					);

					// Send personalized game state to each player
					for (const [playerId, gameState] of result.playerStates) {
						const socketIds = playerSockets.get(playerId);
						if (socketIds) {
							for (const socketId of socketIds) {
								safeEmit(io, socketId, "game:started", gameState);
							}
						}
					}

					// Start the game timer
					startRoomTimer(io, playerInfo.roomCode);

					safeCallback(callback, { success: true });
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// VOTE:CAST - Player casts their vote for who they think Judas is
		// =======================================================================

		socket.on(
			"vote:cast",
			async (payload: unknown, callback: SocketCallback<VoteResponse>) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				const result = VoteCastSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				const { targetId } = result.data;

				try {
					const playerInfo = socketPlayers.get(socket.id);
					if (!playerInfo) {
						safeCallback(callback, { success: false, error: "Not in a room" });
						return;
					}

					const { castVote, getRoom } = await import("@whoisjudas/game");
					const room = getRoom(playerInfo.roomCode);

					// Ensure voting is active
					if (!room || room.currentRound?.phase !== "vote") {
						safeCallback(callback, {
							success: false,
							error: "Voting not active",
						});
						return;
					}

					const result: CastVoteResult = castVote(
						playerInfo.roomCode,
						playerInfo.playerId,
						targetId,
					);

					// Broadcast updated vote count
					safeEmit(io, playerInfo.roomCode, "vote:update", {
						votesCounted: gameResult.votesCounted,
						totalVoters: disciples,
					});

					// Check if all votes are in - may trigger reveal
					checkRoundCompletion(io, playerInfo.roomCode);

					safeCallback(callback, { success: true });
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// JUDAS:GUESS - Judas guesses which story is the real one
		// =======================================================================

		socket.on(
			"judas:guess",
			async (
				payload: unknown,
				callback: SocketCallback<JudasGuessResponse>,
			) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				const result = JudasGuessSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				const { storyId } = result.data;

				try {
					const playerInfo = socketPlayers.get(socket.id);
					if (!playerInfo) {
						safeCallback(callback, { success: false, error: "Not in a room" });
						return;
					}

					const { judasGuess, getRoom } = await import("@whoisjudas/game");
					const room = getRoom(playerInfo.roomCode);

					// Ensure guessing is active (during vote phase)
					if (!room || room.currentRound?.phase !== "vote") {
						safeCallback(callback, {
							success: false,
							error: "Guessing not active",
						});
						return;
					}

					const result: JudasGuessResult = judasGuess(
						playerInfo.roomCode,
						playerInfo.playerId,
						storyId,
					);

					safeCallback(callback, { success: true, correct: result.correct });

					// Check if round is complete - may trigger reveal
					checkRoundCompletion(io, playerInfo.roomCode);
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// GAME:PLAY-AGAIN - Host restarts the game for another round
		// =======================================================================

		socket.on(
			"game:play-again",
			async (_payload: unknown, callback: SocketCallback<BaseResponse>) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, {
						success: false,
						error: "Too many requests",
					});
					return;
				}

				try {
					const playerInfo = socketPlayers.get(socket.id);
					if (!playerInfo) {
						safeCallback(callback, { success: false, error: "Not in a room" });
						return;
					}

					const { playAgain, getRoom } = await import("@whoisjudas/game");
					const room = getRoom(playerInfo.roomCode);

					// Only host can restart the game
					if (room && room.hostId !== playerInfo.playerId) {
						safeCallback(callback, {
							success: false,
							error: "Only host can restart",
						});
						return;
					}

					playAgain(playerInfo.roomCode);

					// Send all players back to the lobby
					safeEmit(io, playerInfo.roomCode.toUpperCase(), "room:rejoin");

					safeCallback(callback, { success: true });
				} catch (error) {
					safeCallback(callback, {
						success: false,
						error: error instanceof Error ? error.message : "Unknown error",
					});
				}
			},
		);

		// =======================================================================
		// DISCONNECT - Handle player disconnection
		// =======================================================================
		// This is critical for game state management
		// Behavior differs based on game state (waiting vs playing)

		socket.on("disconnect", async (reason) => {
			console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

			const playerInfo = socketPlayers.get(socket.id);
			if (playerInfo) {
				try {
					const { getRoom, leaveRoom } = await import("@whoisjudas/game");
					const room = getRoom(playerInfo.roomCode);

					// Check if player has other sockets in other rooms
					const otherSocketIds = playerSockets
						.get(playerInfo.playerId)
						?.filter((id) => id !== socket.id);
					const hasOtherSockets = otherSocketIds && otherSocketIds.length > 0;

					// GAME NOT STARTED (waiting phase)
					// Player leaves entirely - free up their name for others
					if (room && room.state === "waiting") {
						if (!hasOtherSockets) {
							// No other sockets - fully remove player from room
							const result = leaveRoom(
								playerInfo.roomCode,
								playerInfo.playerId,
							);

							if (result) {
								safeEmit(io, playerInfo.roomCode, "room:player-left", {
									playerId: playerInfo.playerId,
									playerName: result.playerName,
									playerCount: result.playerCount,
								});

								// Host left - assign new host
								if (result.newHostId) {
									safeEmit(io, playerInfo.roomCode, "room:host-changed", {
										newHostId: result.newHostId,
										newHostName: result.newHostName,
									});
								}
							}
						} else {
							// Has other sockets - just notify that player left this room
							if (room.players.has(playerInfo.playerId)) {
								safeEmit(io, playerInfo.roomCode, "room:player-left", {
									playerId: playerInfo.playerId,
									playerName: existingPlayer?.name || "Unknown",
									playerCount: room.players.size,
								});
							}
						}
					}
					// GAME IN PROGRESS (playing phase)
					// Mark player as disconnected but keep in game
					else if (room && room.state === "playing") {
						const { setPlayerDisconnected } = await import("@whoisjudas/game");
						setPlayerDisconnected(playerInfo.roomCode, playerInfo.playerId);

						safeEmit(io, playerInfo.roomCode, "room:player-left", {
							playerId: playerInfo.playerId,
							playerName:
								room.players.get(playerInfo.playerId)?.name || "Unknown",
							playerCount: room.players.size,
						});
					}
				} catch (e) {
					console.error("Error handling disconnect:", e);
				}

				// Clean up socket mappings
				socketPlayers.delete(socket.id);

				// Remove socket from player's socket list
				const socketList = playerSockets.get(playerInfo.playerId);
				if (socketList) {
					const idx = socketList.indexOf(socket.id);
					if (idx !== -1) socketList.splice(idx, 1);
					if (socketList.length === 0) {
						playerSockets.delete(playerInfo.playerId);
					}
				}

				// Remove room from browser session's room list
				if (playerInfo.browserSessionId) {
					const sessionRooms = browserSessionPlayers.get(
						playerInfo.browserSessionId,
					);
					if (sessionRooms) {
						const idx = sessionRooms.findIndex(
							(r) => r.roomCode === playerInfo.roomCode,
						);
						if (idx !== -1) sessionRooms.splice(idx, 1);
						if (sessionRooms.length === 0) {
							browserSessionPlayers.delete(playerInfo.browserSessionId);
						}
					}
				}
			}
			console.log(`Client disconnected: ${socket.id}`);
		});
	});

	// ==========================================================================
	// HTTP SERVER STARTUP
	// ==========================================================================

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Ready on http://${hostname}:${port}`);
		});

	// ==========================================================================
	// GRACEFUL SHUTDOWN
	// ==========================================================================
	// Clean up intervals and resources on server shutdown

	function gracefulShutdown(): void {
		console.log("Shutting down server...");

		// Clear rate limit cleanup interval
		if (rateLimitCleanupInterval) {
			clearInterval(rateLimitCleanupInterval);
			rateLimitCleanupInterval = null;
		}

		// Clear all room intervals
		for (const interval of roomIntervals.values()) {
			clearInterval(interval);
		}
		roomIntervals.clear();

		console.log("Server shutdown complete");
	}

	process.on("SIGTERM", gracefulShutdown);
	process.on("SIGINT", gracefulShutdown);
});
