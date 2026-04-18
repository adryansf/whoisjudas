export interface PlayerInfo {
	playerId: string;
	playerName?: string;
	roomCode?: string;
	browserSessionId?: string;
	isHost?: boolean;
}

export interface SocketState {
	playerSockets: Map<string, string[]>;
	socketPlayers: Map<string, PlayerInfo>;
	browserSessionPlayers: Map<string, { playerId: string; roomCode: string }[]>;
}

export interface Room {
	roomCode: string;
	hostId: string;
	players: Map<string, PlayerInfo>;
	state: "waiting" | "playing" | "ended";
}

export interface CreateRoomResponse {
	success: boolean;
	roomCode?: string;
	playerId?: string;
	hostId?: string;
	error?: string;
}

export interface JoinRoomResponse {
	success: boolean;
	playerId?: string;
	players?: Array<{ id: string; name: string; isConnected: boolean }>;
	hostId?: string;
	error?: string;
}

export interface ReconnectResponse {
	success: boolean;
	gameState?: unknown;
	error?: string;
}

export interface GameStartResponse {
	success: boolean;
	error?: string;
}

export interface VoteCastResponse {
	success: boolean;
	error?: string;
}

export interface JudasGuessResponse {
	success: boolean;
	correct?: boolean;
	error?: string;
}

export interface ErrorResponse {
	success: false;
	error: string;
}

export interface RoomPlayerJoined {
	player: { id: string; name: string; isConnected: boolean };
	playerCount: number;
}

export interface RoomPlayerLeft {
	playerId: string;
	playerName?: string;
	playerCount: number;
}

export interface RoomHostChanged {
	newHostId: string;
	newHostName: string;
}

export interface GameTimer {
	timerRemaining: number;
	phase: "question" | "vote" | "reveal";
}

export interface GamePhaseChange {
	phase: "vote";
	timerSeconds: number;
}

export interface VoteUpdate {
	votesCounted: number;
	totalVoters: number;
}

export interface GameReveal {
	judasId: string;
	judasName: string;
	storyId: string;
	winner: "judas" | "disciples" | "tie";
	votes: Array<{
		voterId: string;
		voterName: string;
		targetId: string;
	}>;
	judasGuess?: string;
}
