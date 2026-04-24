import type { PlayerInfo } from "../types.js";

export interface SocketState {
	playerSockets: Map<string, string[]>;
	socketPlayers: Map<string, PlayerInfo>;
	browserSessionPlayers: Map<string, { playerId: string; roomCode: string }[]>;
}

export function createSocketState(): SocketState {
	return {
		playerSockets: new Map(),
		socketPlayers: new Map(),
		browserSessionPlayers: new Map(),
	};
}

export function registerSocket(
	state: SocketState,
	socketId: string,
	playerInfo: PlayerInfo,
): void {
	state.socketPlayers.set(socketId, playerInfo);

	if (playerInfo.playerId) {
		const existing = state.playerSockets.get(playerInfo.playerId) || [];
		if (!existing.includes(socketId)) {
			existing.push(socketId);
			state.playerSockets.set(playerInfo.playerId, existing);
		}
	}

	if (playerInfo.browserSessionId) {
		const existing =
			state.browserSessionPlayers.get(playerInfo.browserSessionId) || [];
		const entry = {
			playerId: playerInfo.playerId,
			roomCode: playerInfo.roomCode || "",
		};
		const existingEntry = existing.find(
			(e) => e.playerId === playerInfo.playerId,
		);
		if (!existingEntry) {
			existing.push(entry);
			state.browserSessionPlayers.set(playerInfo.browserSessionId, existing);
		}
	}
}

export function unregisterSocket(
	state: SocketState,
	socketId: string,
): PlayerInfo | undefined {
	const playerInfo = state.socketPlayers.get(socketId);
	if (!playerInfo) return undefined;

	state.socketPlayers.delete(socketId);

	if (playerInfo.playerId) {
		const sockets = state.playerSockets.get(playerInfo.playerId) || [];
		const filtered = sockets.filter((id) => id !== socketId);
		if (filtered.length === 0) {
			state.playerSockets.delete(playerInfo.playerId);
		} else {
			state.playerSockets.set(playerInfo.playerId, filtered);
		}
	}

	if (playerInfo.browserSessionId) {
		const existing =
			state.browserSessionPlayers.get(playerInfo.browserSessionId) || [];
		const filtered = existing.filter((e) => e.playerId !== playerInfo.playerId);
		if (filtered.length === 0) {
			state.browserSessionPlayers.delete(playerInfo.browserSessionId);
		} else {
			state.browserSessionPlayers.set(playerInfo.browserSessionId, filtered);
		}
	}

	return playerInfo;
}

export function getSocketsInRoom(
	state: SocketState,
	roomCode: string,
): string[] {
	const sockets: string[] = [];
	for (const [socketId, playerInfo] of state.socketPlayers.entries()) {
		if (playerInfo.roomCode === roomCode) {
			sockets.push(socketId);
		}
	}
	return sockets;
}

export function getPlayerCountInRoom(
	state: SocketState,
	roomCode: string,
): number {
	let count = 0;
	for (const playerInfo of state.socketPlayers.values()) {
		if (playerInfo.roomCode === roomCode) {
			count++;
		}
	}
	return count;
}
