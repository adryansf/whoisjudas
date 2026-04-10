export type RoomState = "waiting" | "playing" | "ended";
export type GamePhase = "question" | "vote" | "reveal";
export type PlayerRole = "disciple" | "judas";
export type RoundOutcome = "disciples-win" | "judas-win" | "tie" | null;
export type Locale = "en" | "pt-BR";

export interface CharacterRole {
	id: string;
	name: string;
	description?: string;
}

export interface BiblicalStory {
	id: string;
	title: string;
	description: string;
	characters: CharacterRole[];
}

export interface Player {
	id: string;
	name: string;
	role?: PlayerRole;
	character?: CharacterRole;
	vote?: string;
	judasGuess?: string;
	isConnected: boolean;
	socketId?: string;
	joinedAt: Date;
}

export interface Round {
	storyId: string;
	phase: GamePhase;
	phaseStartedAt: Date;
	timerSeconds: number;
	timerRemaining: number;
	judasId: string;
	outcome: RoundOutcome;
	votes: Map<string, string>;
}

export interface RoomSettings {
	questionDuration: number; // in seconds
}

export interface GameRoom {
	code: string;
	hostId: string;
	state: RoomState;
	players: Map<string, Player>;
	currentRound: Round | null;
	settings: RoomSettings;
	createdAt: Date;
	lastActivityAt: Date;
}

export interface PlayerSummary {
	id: string;
	name: string;
	isConnected: boolean;
}

export interface StorySummary {
	id: string;
	title: string;
}

export interface GameState {
	phase: "waiting" | "question" | "vote" | "reveal";
	roomState: RoomState;
	players: PlayerSummary[];
	isHost: boolean;
	role?: PlayerRole;
	character?: CharacterRole;
	story?: BiblicalStory;
	possibleStories?: StorySummary[];
	timerRemaining?: number;
	votesCounted?: number;
	totalVoters?: number;
	totalPlayers?: number;
}

export interface GameStartedPayload {
	role: PlayerRole;
	characterId?: string;
	storyId?: string;
	phase: "question";
	timerSeconds: number;
}

export interface CreateRoomResult {
	roomCode: string;
	playerId: string;
}

export interface JoinRoomResult {
	player: Player;
	players: PlayerSummary[];
	playerCount: number;
	hostId: string;
}

export interface LeaveRoomResult {
	playerName: string;
	playerCount: number;
	newHostId?: string;
	newHostName?: string;
}

export interface StartGameResult {
	playerStates: Map<string, GameStartedPayload>;
	questionDuration: number;
}

export interface CastVoteResult {
	votesCounted: number;
	totalVoters: number;
}

export interface JudasGuessResult {
	correct: boolean;
}
