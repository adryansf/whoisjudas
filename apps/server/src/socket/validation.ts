import { z } from "zod";

const PLAYER_ID_PATTERN = /^[A-Za-z0-9_-]{12}$/;

export const CreateRoomSchema = z.object({
	hostName: z.string().min(1).max(20).trim(),
});

export const JoinRoomSchema = z.object({
	roomCode: z
		.string()
		.min(1)
		.max(10)
		.transform((s) => s.toUpperCase()),
	playerName: z.string().min(1).max(20).trim(),
});

export const ReconnectSchema = z.object({
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

export const UpdateSettingsSchema = z.object({
	roomCode: z
		.string()
		.min(1)
		.max(10)
		.transform((s) => s.toUpperCase()),
	settings: z.object({ questionDuration: z.number().min(60).max(1800) }),
});

export const VoteCastSchema = z.object({
	targetId: z
		.string()
		.min(1)
		.regex(PLAYER_ID_PATTERN, "Invalid target ID format"),
});

export const JudasGuessSchema = z.object({
	storyId: z.string().min(1),
});

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type JoinRoomInput = z.infer<typeof JoinRoomSchema>;
export type ReconnectInput = z.infer<typeof ReconnectSchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export type VoteCastInput = z.infer<typeof VoteCastSchema>;
export type JudasGuessInput = z.infer<typeof JudasGuessSchema>;
