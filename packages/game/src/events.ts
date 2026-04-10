export interface PlayerSummary {
	id: string;
	name: string;
	isConnected: boolean;
}

export interface StorySummary {
	id: string;
	title: string;
}

export interface RoomCreatePayload {
	hostName: string;
	locale: "en" | "pt-BR";
}

export interface RoomCreateResponse {
	success: boolean;
	roomCode?: string;
	playerId?: string;
	error?: string;
}

export interface RoomJoinPayload {
	roomCode: string;
	playerName: string;
	locale: "en" | "pt-BR";
}

export interface RoomJoinResponse {
	success: boolean;
	playerId?: string;
	players?: PlayerSummary[];
	hostId?: string;
	error?: string;
}

export interface RoomReconnectPayload {
	roomCode: string;
	playerId: string;
}

export interface GameState {
	phase: "waiting" | "question" | "vote" | "reveal";
	roomState: "waiting" | "playing" | "ended";
	players: PlayerSummary[];
	isHost: boolean;
	role?: "disciple" | "judas";
	character?: { id: string; name: string };
	story?: { id: string; title: string; description: string };
	possibleStories?: StorySummary[];
	timerRemaining?: number;
	votesCounted?: number;
	totalPlayers?: number;
}

export interface RoomReconnectResponse {
	success: boolean;
	gameState?: GameState;
	error?: string;
}

export interface GameStartResponse {
	success: boolean;
	error?: string;
}

export interface VoteCastPayload {
	targetId: string;
}

export interface VoteCastResponse {
	success: boolean;
	error?: string;
}

export interface JudasGuessPayload {
	storyId: string;
}

export interface JudasGuessResponse {
	success: boolean;
	correct?: boolean;
	error?: string;
}

export interface GamePlayAgainResponse {
	success: boolean;
	error?: string;
}

export interface RoomPlayerJoinedPayload {
	player: PlayerSummary;
	playerCount: number;
}

export interface RoomPlayerLeftPayload {
	playerId: string;
	playerName: string;
	playerCount: number;
}

export interface RoomHostChangedPayload {
	newHostId: string;
	newHostName: string;
}

export interface GameStartedPayload {
	role: "disciple" | "judas";
	character: { id: string; name: string };
	story?: { id: string; title: string; description: string };
	possibleStories: StorySummary[];
	phase: "question";
	timerSeconds: number;
	allCharacters: string[];
}

export interface GamePhaseChangePayload {
	phase: "question" | "vote" | "reveal";
	timerSeconds: number;
}

export interface VoteUpdatePayload {
	votesCounted: number;
	totalPlayers: number;
}

export interface GameRevealPayload {
	judasId: string;
	judasName: string;
	storyId: string;
	storyTitle: string;
	winner: "disciples" | "judas" | "tie";
	votes: {
		voterId: string;
		voterName: string;
		targetId: string;
		targetName: string;
	}[];
	judasGuess?: string;
	judasGuessTitle?: string;
}

export interface ErrorPayload {
	message: string;
	code?: string;
}

// =============================================================================
// SOCKET EVENT NAMES
// =============================================================================
// Type-safe event name constants for Socket.IO communication

export const ROOM_EVENTS = {
	CREATE: "room:create",
	JOIN: "room:join",
	RECONNECT: "room:reconnect",
	LEAVE: "room:leave",
	PLAYER_JOINED: "room:player-joined",
	PLAYER_LEFT: "room:player-left",
	HOST_CHANGED: "room:host-changed",
	SETTINGS_UPDATED: "room:settings-updated",
} as const;

export const GAME_EVENTS = {
	START: "game:start",
	STARTED: "game:started",
	PHASE_CHANGE: "game:phase-change",
	TIMER: "game:timer",
	REVEAL: "game:reveal",
	PLAY_AGAIN: "game:play-again",
	REJOIN: "room:rejoin",
} as const;

export const VOTE_EVENTS = {
	CAST: "vote:cast",
	UPDATE: "vote:update",
} as const;

export const JUDAS_EVENTS = {
	GUESS: "judas:guess",
} as const;

export const SOCKET_EVENTS = {
	KICKED: "kicked",
	MULTIPLE_SESSIONS: "multiple-sessions",
	ERROR: "error",
} as const;

export type RoomEvent = (typeof ROOM_EVENTS)[keyof typeof ROOM_EVENTS];
export type GameEvent = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS];
export type VoteEvent = (typeof VOTE_EVENTS)[keyof typeof VOTE_EVENTS];
export type JudasEvent = (typeof JUDAS_EVENTS)[keyof typeof JUDAS_EVENTS];
export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
