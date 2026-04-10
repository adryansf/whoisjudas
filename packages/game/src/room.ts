export { createGameError, GameErrorCode, getRoom } from "./store";

import { getRandomStory } from "@whoisjudas/data";
import { GAME_CONFIG, secureRandomIndex, secureShuffle } from "./config";
import {
	addPlayerToRoom,
	createNewRoom,
	getRoom,
	removePlayerFromRoom,
	updatePlayerConnection,
	updatePlayerName,
	updateRoomSettings,
} from "./store";
import type {
	GameRoom,
	GameStartedPayload,
	Player,
	PlayerSummary,
	Round,
} from "./types";

// Generic error for external use - prevents information disclosure
const GAME_ERROR = "Game operation failed";

function gameError(): Error {
	return new Error(GAME_ERROR);
}

function getPlayerSummaries(room: GameRoom): PlayerSummary[] {
	return Array.from(room.players.values()).map((p) => ({
		id: p.id,
		name: p.name,
		isConnected: p.isConnected,
	}));
}

export function createRoom(hostName: string): {
	roomCode: string;
	playerId: string;
} {
	return createNewRoom(hostName);
}

export function joinRoom(
	roomCode: string,
	playerName: string,
): {
	player: Player;
	players: PlayerSummary[];
	playerCount: number;
	hostId: string;
} {
	const result = addPlayerToRoom(roomCode, playerName);
	const room = getRoom(roomCode);

	if (!room) {
		throw new Error("Room not found after join");
	}

	return {
		player: result.player,
		players: getPlayerSummaries(room),
		playerCount: room.players.size,
		hostId: room.hostId,
	};
}

export function leaveRoom(
	roomCode: string,
	playerId: string,
): {
	playerName: string;
	playerCount: number;
	newHostId?: string;
	newHostName?: string;
} | null {
	return removePlayerFromRoom(roomCode, playerId);
}

export function setPlayerDisconnected(
	roomCode: string,
	playerId: string,
): void {
	updatePlayerConnection(roomCode, playerId, false);
}

export function renamePlayer(
	roomCode: string,
	playerId: string,
	newName: string,
): Player | null {
	return updatePlayerName(roomCode, playerId, newName);
}

export function updateSettings(
	roomCode: string,
	playerId: string,
	settings: { questionDuration: number },
): void {
	const room = getRoom(roomCode);
	if (!room) throw gameError();
	if (room.hostId !== playerId) throw gameError();

	updateRoomSettings(roomCode, settings);
}

export function reconnectPlayer(roomCode: string, playerId: string): object {
	const room = getRoom(roomCode);
	if (!room) {
		throw gameError();
	}

	const player = room.players.get(playerId);
	if (!player) {
		throw gameError();
	}

	updatePlayerConnection(roomCode, playerId, true);

	const isHost = room.hostId === playerId;
	const baseState = {
		phase:
			room.state === "playing" && room.currentRound
				? room.currentRound.phase
				: "waiting",
		roomState: room.state,
		players: getPlayerSummaries(room),
		isHost,
		hostId: room.hostId,
		settings: room.settings,
	};

	if (room.state === "playing" && room.currentRound) {
		const round = room.currentRound;
		const isJudas = round.judasId === playerId;
		const disciplesCount = Array.from(room.players.values()).filter(
			(p) => p.role === "disciple",
		).length;

		return {
			...baseState,
			role: player.role,
			characterId: player.character?.id,
			storyId: isJudas ? undefined : round.storyId,
			timerRemaining: round.timerRemaining,
			votesCounted: round.votes.size,
			totalVoters: disciplesCount,
		};
	}

	return baseState;
}

export function startGame(
	roomCode: string,
	hostId: string,
): { playerStates: Map<string, GameStartedPayload>; questionDuration: number } {
	const room = getRoom(roomCode);
	if (!room) {
		throw gameError();
	}

	if (room.hostId !== hostId) {
		throw gameError();
	}

	if (room.players.size < GAME_CONFIG.MIN_PLAYERS) {
		throw gameError();
	}

	const players = Array.from(room.players.values());
	const judasIndex = secureRandomIndex(players.length);
	const judas = players[judasIndex];

	if (!judas) throw gameError();
	const judasId = judas.id;

	// Use "en" as default to get story structure/IDs
	const story = getRandomStory("en", players.length);

	// Secure shuffle for character distribution
	const shuffledCharacters = secureShuffle([...story.characters]);

	let charIndex = 0;
	players.forEach((player) => {
		if (player) {
			const isJudas = player.id === judasId;
			player.role = isJudas ? "judas" : "disciple";
			player.character = isJudas ? undefined : shuffledCharacters[charIndex++];
			player.vote = undefined;
			player.judasGuess = undefined;
		}
	});

	const now = new Date();
	const round: Round = {
		storyId: story.id,
		phase: "question",
		phaseStartedAt: now,
		timerSeconds: room.settings.questionDuration,
		timerRemaining: room.settings.questionDuration,
		judasId,
		outcome: null,
		votes: new Map(),
	};

	room.currentRound = round;
	room.state = "playing";
	room.lastActivityAt = now;

	const playerStates = new Map<string, GameStartedPayload>();

	for (const player of players) {
		if (player?.role) {
			const isJudas = player.id === judasId;
			playerStates.set(player.id, {
				role: player.role,
				characterId: player.character?.id,
				storyId: isJudas ? undefined : story.id,
				phase: "question",
				timerSeconds: room.settings.questionDuration,
			});
		}
	}

	return { playerStates, questionDuration: room.settings.questionDuration };
}

export function castVote(
	roomCode: string,
	playerId: string,
	targetId: string,
): { votesCounted: number; totalVoters: number } {
	const room = getRoom(roomCode);
	if (!room || !room.currentRound) {
		throw gameError();
	}

	const player = room.players.get(playerId);
	if (!player) {
		throw gameError();
	}

	if (player.role === "judas") {
		throw gameError();
	}

	if (player.vote) {
		throw gameError();
	}

	if (!room.players.has(targetId)) {
		throw gameError();
	}

	player.vote = targetId;
	room.currentRound.votes.set(playerId, targetId);
	room.lastActivityAt = new Date();

	const disciplesCount = Array.from(room.players.values()).filter(
		(p) => p.role === "disciple",
	).length;

	return {
		votesCounted: room.currentRound.votes.size,
		totalVoters: disciplesCount,
	};
}

export function judasGuess(
	roomCode: string,
	playerId: string,
	storyId: string,
): { correct: boolean } {
	const room = getRoom(roomCode);
	if (!room || !room.currentRound) {
		throw gameError();
	}

	const player = room.players.get(playerId);
	if (!player || player.role !== "judas") {
		throw gameError();
	}

	if (player.judasGuess) {
		throw gameError();
	}

	player.judasGuess = storyId;
	room.lastActivityAt = new Date();

	const correct = storyId === room.currentRound.storyId;
	return { correct };
}

export function playAgain(roomCode: string): void {
	const room = getRoom(roomCode);
	if (!room) {
		throw gameError();
	}

	if (room.players.size < 3) {
		throw gameError();
	}

	room.currentRound = null;
	room.state = "waiting";
	room.lastActivityAt = new Date();

	for (const player of room.players.values()) {
		player.role = undefined;
		player.character = undefined;
		player.vote = undefined;
		player.judasGuess = undefined;
	}
}
