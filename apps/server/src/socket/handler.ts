import type { Player } from "@whoisjudas/game";
import * as GAME from "@whoisjudas/game";
import type { Socket } from "socket.io";
import { isRateLimited } from "../lib/rate-limit.js";
import type { PlayerInfo } from "../types.js";
import type { SocketState } from "./rooms.js";
import {
	createSocketState,
	getPlayerCountInRoom,
	getSocketsInRoom,
	registerSocket,
	unregisterSocket,
} from "./rooms.js";
import {
	CreateRoomSchema,
	JoinRoomSchema,
	JudasGuessSchema,
	ReconnectSchema,
	UpdateSettingsSchema,
	VoteCastSchema,
} from "./validation.js";

const state: SocketState = createSocketState();
const roomTimers = new Map<string, ReturnType<typeof setInterval>>();

const VOTE_DURATION_SECONDS = 300;

export function getSocketState(): SocketState {
	return state;
}

export function getRoomTimers(): Map<string, ReturnType<typeof setInterval>> {
	return roomTimers;
}

function getPlayerInfo(socket: Socket): PlayerInfo {
	return (
		state.socketPlayers.get(socket.id) || {
			playerId: "",
			browserSessionId: (socket.handshake.auth as { browserSessionId?: string })
				?.browserSessionId,
		}
	);
}

function emitRoomUpdate(
	io: import("socket.io").Server,
	roomCode: string,
	event: string,
	...args: unknown[]
): void {
	const socketsInRoom = getSocketsInRoom(state, roomCode);
	for (const socketId of socketsInRoom) {
		io.to(socketId).emit(event, ...args);
	}
}

function safeCallback<T>(
	callback: ((res: T) => void) | undefined,
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
	io: import("socket.io").Server,
	roomCode: string,
	event: string,
	...args: unknown[]
): void {
	try {
		emitRoomUpdate(io, roomCode, event, ...args);
	} catch (err) {
		console.error(
			`Failed to emit ${event}:`,
			err instanceof Error ? err.message : err,
		);
	}
}

export function setupConnectionHandlers(io: import("socket.io").Server): void {
	io.on("connection", (socket: Socket) => {
		const browserSessionId = (
			socket.handshake.auth as { browserSessionId?: string }
		)?.browserSessionId;
		const playerInfo: PlayerInfo = {
			playerId: "",
			browserSessionId,
		};
		registerSocket(state, socket.id, playerInfo);

		socket.on(
			"room:create",
			async (
				payload: unknown,
				callback: (res: {
					success: boolean;
					roomCode?: string;
					playerId?: string;
					hostId?: string;
					error?: string;
				}) => void,
			) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, { success: false, error: "Rate limited" });
					return;
				}

				const result = CreateRoomSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				try {
					const gameResult = GAME.createRoom(result.data.hostName);
					const updatedInfo: PlayerInfo = {
						...playerInfo,
						playerId: gameResult.playerId,
						roomCode: gameResult.roomCode,
						isHost: true,
					};
					registerSocket(state, socket.id, updatedInfo);

					socket.join(gameResult.roomCode);

					safeCallback(callback, {
						success: true,
						roomCode: gameResult.roomCode,
						playerId: gameResult.playerId,
						hostId: gameResult.playerId,
					});
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:join",
			async (
				payload: unknown,
				callback: (res: {
					success: boolean;
					playerId?: string;
					players?: Array<{ id: string; name: string; isConnected: boolean }>;
					hostId?: string;
					error?: string;
				}) => void,
			) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, { success: false, error: "Rate limited" });
					return;
				}

				const result = JoinRoomSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				try {
					const gameResult = GAME.joinRoom(
						result.data.roomCode,
						result.data.playerName,
					);

					const updatedInfo: PlayerInfo = {
						...playerInfo,
						playerId: gameResult.player.id,
						roomCode: result.data.roomCode,
						playerName: result.data.playerName,
					};
					registerSocket(state, socket.id, updatedInfo);

					socket.join(result.data.roomCode);

					safeCallback(callback, {
						success: true,
						playerId: gameResult.player.id,
						players: gameResult.players,
						hostId: gameResult.hostId,
					});

					const playerCount = getPlayerCountInRoom(state, result.data.roomCode);
					safeEmit(io, result.data.roomCode, "room:player-joined", {
						player: {
							id: gameResult.player.id,
							name: gameResult.player.name,
							isConnected: true,
						},
						playerCount,
					});
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:leave",
			async (
				_payload: unknown,
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					const result = GAME.leaveRoom(info.roomCode, info.playerId);
					if (!result) {
						safeCallback(callback, {
							success: false,
							error: "Failed to leave room",
						});
						return;
					}

					unregisterSocket(state, socket.id);
					socket.leave(info.roomCode);

					const playerCount = getPlayerCountInRoom(state, info.roomCode);
					safeEmit(io, info.roomCode, "room:player-left", {
						playerId: info.playerId,
						playerName: result.playerName,
						playerCount,
					});

					if (result.newHostId) {
						safeEmit(io, info.roomCode, "room:host-changed", {
							newHostId: result.newHostId,
							newHostName: result.newHostName,
						});
					}

					safeCallback(callback, { success: true });
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:reconnect",
			async (
				payload: unknown,
				callback: (res: {
					success: boolean;
					gameState?: unknown;
					error?: string;
				}) => void,
			) => {
				if (isRateLimited(socket.id)) {
					safeCallback(callback, { success: false, error: "Rate limited" });
					return;
				}

				const result = ReconnectSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				try {
					const gameState = GAME.reconnectPlayer(
						result.data.roomCode,
						result.data.playerId,
					);

					const updatedInfo: PlayerInfo = {
						...playerInfo,
						playerId: result.data.playerId,
						roomCode: result.data.roomCode,
					};
					registerSocket(state, socket.id, updatedInfo);
					socket.join(result.data.roomCode);

					safeCallback(callback, { success: true, gameState });
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:update-settings",
			async (
				payload: unknown,
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					safeCallback(callback, { success: false, error: "Not in a room" });
					return;
				}

				const result = UpdateSettingsSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				try {
					GAME.updateSettings(
						result.data.roomCode,
						info.playerId,
						result.data.settings,
					);

					safeEmit(io, result.data.roomCode, "room:settings-updated", {
						settings: result.data.settings,
					});
					safeCallback(callback, { success: true });
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"game:start",
			async (
				_payload: unknown,
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					safeCallback(callback, { success: false, error: "Not in a room" });
					return;
				}

				try {
					GAME.startGame(info.roomCode, info.playerId);

					startGameTimer(io, info.roomCode);

					const socketsInRoom = getSocketsInRoom(state, info.roomCode);
					for (const socketId of socketsInRoom) {
						io.to(socketId).emit("game:started");
					}

					safeCallback(callback, { success: true });
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"vote:cast",
			async (
				payload: unknown,
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					safeCallback(callback, { success: false, error: "Not in a room" });
					return;
				}

				const result = VoteCastSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				try {
					const gameResult = GAME.castVote(
						info.roomCode,
						info.playerId,
						result.data.targetId,
					);

					const room = GAME.getRoom(info.roomCode);
					const players = room ? Array.from(room.players.values()) : [];
					const disciples = players.filter(
						(p: Player) => p.role === "disciple",
					).length;

					safeEmit(io, info.roomCode, "vote:update", {
						votesCounted: gameResult.votesCounted,
						totalVoters: disciples,
					});

					checkRoundCompletion(io, info.roomCode);

					safeCallback(callback, { success: true });
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"judas:guess",
			async (
				payload: unknown,
				callback: (res: {
					success: boolean;
					correct?: boolean;
					error?: string;
				}) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					safeCallback(callback, { success: false, error: "Not in a room" });
					return;
				}

				const result = JudasGuessSchema.safeParse(payload);
				if (!result.success) {
					safeCallback(callback, { success: false, error: "Invalid payload" });
					return;
				}

				try {
					const gameResult = GAME.judasGuess(
						info.roomCode,
						info.playerId,
						result.data.storyId,
					);
					safeCallback(callback, {
						success: true,
						correct: gameResult.correct,
					});

					checkRoundCompletion(io, info.roomCode);
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"game:play-again",
			async (
				_payload: unknown,
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					safeCallback(callback, { success: false, error: "Not in a room" });
					return;
				}

				const room = GAME.getRoom(info.roomCode);
				if (!room || room.hostId !== info.playerId) {
					safeCallback(callback, {
						success: false,
						error: "Only host can restart",
					});
					return;
				}

				try {
					const timer = roomTimers.get(info.roomCode);
					if (timer) {
						clearInterval(timer);
						roomTimers.delete(info.roomCode);
					}

					GAME.playAgain(info.roomCode);

					const socketsInRoom = getSocketsInRoom(state, info.roomCode);
					for (const socketId of socketsInRoom) {
						io.to(socketId).emit("room:rejoin");
					}

					safeCallback(callback, { success: true });
				} catch (err) {
					safeCallback(callback, {
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on("disconnect", (reason: string) => {
			const socketId = socket.id;
			const info = unregisterSocket(state, socketId);

			if (!info?.roomCode || !info.playerId) return;

			const playerCount = getPlayerCountInRoom(state, info.roomCode);
			safeEmit(io, info.roomCode, "room:player-left", {
				playerId: info.playerId,
				playerName: info.playerName,
				playerCount,
			});
		});
	});
}

function startGameTimer(
	io: import("socket.io").Server,
	roomCode: string,
): void {
	const existing = roomTimers.get(roomCode);
	if (existing) {
		clearInterval(existing);
	}

	const room = GAME.getRoom(roomCode);
	if (!room) return;

	const interval = setInterval(() => {
		const currentRoom = GAME.getRoom(roomCode);
		if (
			!currentRoom ||
			currentRoom.state !== "playing" ||
			!currentRoom.currentRound
		) {
			clearInterval(interval);
			roomTimers.delete(roomCode);
			return;
		}

		const round = currentRoom.currentRound;

		if (round.phase === "reveal") {
			clearInterval(interval);
			roomTimers.delete(roomCode);
			return;
		}

		round.timerRemaining--;

		const socketsInRoom = getSocketsInRoom(state, roomCode);
		for (const socketId of socketsInRoom) {
			io.to(socketId).emit("game:timer", {
				timerRemaining: round.timerRemaining,
				phase: round.phase,
			});
		}

		if (round.timerRemaining <= 0) {
			if (round.phase === "question") {
				round.phase = "vote";
				round.timerRemaining = VOTE_DURATION_SECONDS;
				round.timerSeconds = VOTE_DURATION_SECONDS;

				for (const socketId of socketsInRoom) {
					io.to(socketId).emit("game:phase-change", {
						phase: "vote",
						timerSeconds: VOTE_DURATION_SECONDS,
					});
				}
			} else if (round.phase === "vote") {
				triggerReveal(io, roomCode);
				clearInterval(interval);
				roomTimers.delete(roomCode);
			}
		}
	}, 1000);

	roomTimers.set(roomCode, interval);
}

function checkRoundCompletion(
	io: import("socket.io").Server,
	roomCode: string,
): void {
	const room = GAME.getRoom(roomCode);
	if (!room || room.state !== "playing" || !room.currentRound) return;

	const round = room.currentRound;
	if (round.phase !== "vote") return;

	const players = Array.from(room.players.values());
	const disciples = players.filter(
		(p) => p.role === "disciple" && p.isConnected,
	);
	const judas = players.find((p) => p.role === "judas");

	const allDisciplesVoted = disciples.every((p) => p.vote);

	if (judas?.isConnected) {
		const judasGuessed = judas?.judasGuess !== undefined;
		if (allDisciplesVoted && judasGuessed) {
			triggerReveal(io, roomCode);
		}
	} else {
		if (allDisciplesVoted) {
			triggerReveal(io, roomCode);
		}
	}
}

function triggerReveal(io: import("socket.io").Server, roomCode: string): void {
	const room = GAME.getRoom(roomCode);
	if (!room || room.state !== "playing" || !room.currentRound) return;

	const round = room.currentRound;
	if (round.phase === "reveal") return;

	round.phase = "reveal";
	round.outcome = GAME.determineWinner(room);

	const interval = roomTimers.get(roomCode);
	if (interval) {
		clearInterval(interval);
		roomTimers.delete(roomCode);
	}

	const judas = room.players.get(round.judasId);

	io.to(roomCode).emit("game:reveal", {
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
