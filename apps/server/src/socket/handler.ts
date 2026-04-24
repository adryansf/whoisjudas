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

const state: SocketState = createSocketState();
const roomTimers = new Map<string, ReturnType<typeof setInterval>>();

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
				payload: { hostName: string },
				callback: (res: {
					success: boolean;
					roomCode?: string;
					playerId?: string;
					hostId?: string;
					error?: string;
				}) => void,
			) => {
				if (isRateLimited(socket.id)) {
					callback({ success: false, error: "Rate limited" });
					return;
				}

				try {
					const result = GAME.createRoom(payload.hostName);
					const updatedInfo: PlayerInfo = {
						...playerInfo,
						playerId: result.playerId,
						roomCode: result.roomCode,
						isHost: true,
					};
					registerSocket(state, socket.id, updatedInfo);

					socket.join(result.roomCode);

					callback({
						success: true,
						roomCode: result.roomCode,
						playerId: result.playerId,
						hostId: result.playerId,
					});
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:join",
			async (
				payload: { roomCode: string; playerName: string },
				callback: (res: {
					success: boolean;
					playerId?: string;
					players?: Array<{ id: string; name: string; isConnected: boolean }>;
					hostId?: string;
					error?: string;
				}) => void,
			) => {
				if (isRateLimited(socket.id)) {
					callback({ success: false, error: "Rate limited" });
					return;
				}

				try {
					const result = GAME.joinRoom(
						payload.roomCode.toUpperCase(),
						payload.playerName,
					);

					const updatedInfo: PlayerInfo = {
						...playerInfo,
						playerId: result.player.id,
						roomCode: payload.roomCode.toUpperCase(),
						playerName: payload.playerName,
					};
					registerSocket(state, socket.id, updatedInfo);

					socket.join(payload.roomCode.toUpperCase());

					callback({
						success: true,
						playerId: result.player.id,
						players: result.players,
						hostId: result.hostId,
					});

					const playerCount = getPlayerCountInRoom(
						state,
						payload.roomCode.toUpperCase(),
					);
					emitRoomUpdate(
						io,
						payload.roomCode.toUpperCase(),
						"room:player-joined",
						{
							player: {
								id: result.player.id,
								name: result.player.name,
								isConnected: true,
							},
							playerCount,
						},
					);
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:leave",
			async (callback: (res: { success: boolean; error?: string }) => void) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					const result = GAME.leaveRoom(info.roomCode, info.playerId);
					if (!result) {
						callback({ success: false, error: "Failed to leave room" });
						return;
					}

					unregisterSocket(state, socket.id);
					socket.leave(info.roomCode);

					const playerCount = getPlayerCountInRoom(state, info.roomCode);
					emitRoomUpdate(io, info.roomCode, "room:player-left", {
						playerId: info.playerId,
						playerName: result.playerName,
						playerCount,
					});

					if (result.newHostId) {
						emitRoomUpdate(io, info.roomCode, "room:host-changed", {
							newHostId: result.newHostId,
							newHostName: result.newHostName,
						});
					}

					callback({ success: true });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:reconnect",
			async (
				payload: { roomCode: string; playerId: string },
				callback: (res: {
					success: boolean;
					gameState?: unknown;
					error?: string;
				}) => void,
			) => {
				if (isRateLimited(socket.id)) {
					callback({ success: false, error: "Rate limited" });
					return;
				}

				try {
					const gameState = GAME.reconnectPlayer(
						payload.roomCode.toUpperCase(),
						payload.playerId,
					);

					const updatedInfo: PlayerInfo = {
						...playerInfo,
						playerId: payload.playerId,
						roomCode: payload.roomCode.toUpperCase(),
					};
					registerSocket(state, socket.id, updatedInfo);
					socket.join(payload.roomCode.toUpperCase());

					callback({ success: true, gameState });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"room:update-settings",
			async (
				payload: { roomCode: string; settings: { questionDuration: number } },
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					GAME.updateSettings(
						payload.roomCode.toUpperCase(),
						info.playerId,
						payload.settings,
					);

					emitRoomUpdate(
						io,
						payload.roomCode.toUpperCase(),
						"room:settings-updated",
						{
							settings: payload.settings,
						},
					);
					callback({ success: true });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"game:start",
			async (callback: (res: { success: boolean; error?: string }) => void) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					const result = GAME.startGame(info.roomCode, info.playerId);

					startGameTimer(io, info.roomCode);

					const socketsInRoom = getSocketsInRoom(state, info.roomCode);
					for (const socketId of socketsInRoom) {
						io.to(socketId).emit("game:started");
					}

					callback({ success: true });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"vote:cast",
			async (
				payload: { targetId: string },
				callback: (res: { success: boolean; error?: string }) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					const result = GAME.castVote(
						info.roomCode,
						info.playerId,
						payload.targetId,
					);

					const room = GAME.getRoom(info.roomCode);
					const players = room ? Array.from(room.players.values()) : [];
					const disciples = players.filter(
						(p: Player) => p.role === "disciple",
					).length;

					emitRoomUpdate(io, info.roomCode, "vote:update", {
						votesCounted: result.votesCounted,
						totalVoters: disciples,
					});

					callback({ success: true });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"judas:guess",
			async (
				payload: { storyId: string },
				callback: (res: {
					success: boolean;
					correct?: boolean;
					error?: string;
				}) => void,
			) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode || !info.playerId) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					const result = GAME.judasGuess(
						info.roomCode,
						info.playerId,
						payload.storyId,
					);
					callback({ success: true, correct: result.correct });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on(
			"game:play-again",
			async (callback: (res: { success: boolean; error?: string }) => void) => {
				const info = getPlayerInfo(socket);
				if (!info.roomCode) {
					callback({ success: false, error: "Not in a room" });
					return;
				}

				try {
					GAME.playAgain(info.roomCode);

					const socketsInRoom = getSocketsInRoom(state, info.roomCode);
					for (const socketId of socketsInRoom) {
						io.to(socketId).emit("room:rejoin");
					}

					callback({ success: true });
				} catch (err) {
					callback({
						success: false,
						error: err instanceof Error ? err.message : "Unknown error",
					});
				}
			},
		);

		socket.on("disconnect", (reason: string) => {
			const info = unregisterSocket(state, socket.id);
			if (info?.roomCode) {
				const timer = roomTimers.get(info.roomCode);
				if (timer) {
					clearInterval(timer);
					roomTimers.delete(info.roomCode);
				}

				const playerCount = getPlayerCountInRoom(state, info.roomCode);
				emitRoomUpdate(io, info.roomCode, "room:player-left", {
					playerId: info.playerId,
					playerName: info.playerName,
					playerCount,
				});
			}
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
		if (!currentRoom || currentRoom.state !== "playing") {
			clearInterval(interval);
			roomTimers.delete(roomCode);
			return;
		}

		const phase = currentRoom.currentRound?.phase || "question";
		const timerRemaining = currentRoom.currentRound?.timerRemaining || 0;

		const socketsInRoom = getSocketsInRoom(state, roomCode);
		for (const socketId of socketsInRoom) {
			io.to(socketId).emit("game:timer", { timerRemaining, phase });
		}
	}, 1000);

	roomTimers.set(roomCode, interval);
}
