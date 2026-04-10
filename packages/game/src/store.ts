import { nanoid } from "nanoid";
import { sanitizePlayerName } from "./cleanup";
import type { GameRoom, Player } from "./types";

// Error codes for specific game errors
export const GameErrorCode = {
	ROOM_NOT_FOUND: "ROOM_NOT_FOUND",
	ROOM_FULL: "ROOM_FULL",
	PLAYER_NAME_TAKEN: "PLAYER_NAME_TAKEN",
	NOT_HOST: "NOT_HOST",
	GAME_NOT_IN_WAITING: "GAME_NOT_IN_WAITING",
	ALREADY_STARTED: "ALREADY_STARTED",
	INVALID_VOTE: "INVALID_VOTE",
	ALREADY_VOTED: "ALREADY_VOTED",
	NOT_JUDAS: "NOT_JUDAS",
	ALREADY_GUESSED: "ALREADY_GUESSED",
	NO_JUDAS_IN_ROOM: "NO_JUDAS_IN_ROOM",
} as const;

export type GameErrorCodeType =
	(typeof GameErrorCode)[keyof typeof GameErrorCode];

// Generic error for external use - prevents information disclosure
const GAME_ERROR = "Game operation failed";

export function gameError(): Error {
	return new Error(GAME_ERROR);
}

export function createGameError(
	code: GameErrorCodeType,
	message?: string,
): Error {
	return new Error(`${code}:${message || ""}`);
}

const rooms = new Map<string, GameRoom>();

export function createRoomCode(): string {
	let code: string;
	do {
		code = nanoid(8).toUpperCase();
	} while (rooms.has(code));
	return code;
}

export function getRoom(code: string): GameRoom | undefined {
	return rooms.get(code.toUpperCase());
}

export function setRoom(code: string, room: GameRoom): void {
	rooms.set(code.toUpperCase(), room);
}

export function deleteRoom(code: string): void {
	rooms.delete(code.toUpperCase());
}

export function getAllRooms(): Map<string, GameRoom> {
	return rooms;
}

export function generatePlayerId(): string {
	return nanoid(12);
}

export function createNewRoom(hostName: string): {
	roomCode: string;
	playerId: string;
} {
	const code = createRoomCode();
	const hostId = generatePlayerId();
	const now = new Date();

	const host: Player = {
		id: hostId,
		name: hostName,
		isConnected: true,
		joinedAt: now,
	};

	const room: GameRoom = {
		code,
		hostId,
		state: "waiting",
		players: new Map([[hostId, host]]),
		currentRound: null,
		settings: {
			questionDuration: 300, // default 5 minutes
		},
		createdAt: now,
		lastActivityAt: now,
	};

	setRoom(code, room);

	return { roomCode: code, playerId: hostId };
}

export function addPlayerToRoom(
	code: string,
	playerName: string,
): { player: Player; room: GameRoom } {
	const room = getRoom(code);
	if (!room) {
		throw createGameError(GameErrorCode.ROOM_NOT_FOUND, "Room not found");
	}

	if (room.players.size >= 12) {
		throw createGameError(GameErrorCode.ROOM_FULL, "Room is full");
	}

	const sanitizedName = sanitizePlayerName(playerName);

	const existingPlayer = Array.from(room.players.values()).find(
		(p) => p.name.toLowerCase() === sanitizedName.toLowerCase(),
	);
	if (existingPlayer) {
		throw createGameError(
			GameErrorCode.PLAYER_NAME_TAKEN,
			"Name already taken",
		);
	}

	const playerId = generatePlayerId();
	const player: Player = {
		id: playerId,
		name: sanitizedName,
		isConnected: true,
		joinedAt: new Date(),
	};

	room.players.set(playerId, player);
	room.lastActivityAt = new Date();

	return { player, room };
}

export function removePlayerFromRoom(
	code: string,
	playerId: string,
): {
	playerName: string;
	playerCount: number;
	newHostId?: string;
	newHostName?: string;
} | null {
	const room = getRoom(code);
	if (!room) return null;

	const player = room.players.get(playerId);
	if (!player) return null;

	room.players.delete(playerId);
	room.lastActivityAt = new Date();

	let newHostId: string | undefined;
	let newHostName: string | undefined;

	if (room.hostId === playerId && room.players.size > 0) {
		const nextHost = Array.from(room.players.values())[0];
		if (nextHost) {
			room.hostId = nextHost.id;
			newHostId = nextHost.id;
			newHostName = nextHost.name;
		}
	}

	if (room.players.size === 0) {
		deleteRoom(code);
	}

	return {
		playerName: player.name,
		playerCount: room.players.size,
		newHostId,
		newHostName,
	};
}

export function updatePlayerConnection(
	code: string,
	playerId: string,
	isConnected: boolean,
): void {
	const room = getRoom(code);
	if (!room) return;

	const player = room.players.get(playerId);
	if (!player) return;

	player.isConnected = isConnected;
	room.lastActivityAt = new Date();
}

export function updatePlayerName(
	code: string,
	playerId: string,
	newName: string,
): Player | null {
	const room = getRoom(code);
	if (!room) return null;

	const player = room.players.get(playerId);
	if (!player) return null;

	const sanitizedName = sanitizePlayerName(newName);

	// Check if new name is taken by someone ELSE
	const nameTaken = Array.from(room.players.values()).find(
		(p) =>
			p.id !== playerId && p.name.toLowerCase() === sanitizedName.toLowerCase(),
	);
	if (nameTaken) {
		throw gameError();
	}

	player.name = sanitizedName;
	room.lastActivityAt = new Date();
	return player;
}

export function updateRoomSettings(
	code: string,
	settings: { questionDuration: number },
): void {
	const room = getRoom(code);
	if (!room) return;

	room.settings = { ...room.settings, ...settings };
	room.lastActivityAt = new Date();
}
