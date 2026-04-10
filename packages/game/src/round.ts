import type { GameRoom, RoundOutcome } from "./types";

export function determineWinner(room: GameRoom): RoundOutcome {
	const round = room.currentRound;
	if (!round) return null;

	// Count votes
	const voteCounts = new Map<string, number>();
	for (const targetId of round.votes.values()) {
		voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
	}

	// Check if Judas was identified (majority)
	// Actually, let's use most voted player. If tie, Judas wins.
	// Or as per spec: "Majority of votes correctly identify Judas"
	const judasVoteCount = voteCounts.get(round.judasId) || 0;
	const totalVotes = round.votes.size;

	// If nobody voted, Judas wins?
	// Let's stick to spec: majority
	const judasIdentified = totalVotes > 0 && judasVoteCount > totalVotes / 2;

	if (judasIdentified) {
		return "disciples-win";
	}

	// Judas was not identified - check if Judas guessed correctly
	const judas = room.players.get(round.judasId);
	const judasGuessedCorrectly = judas?.judasGuess === round.storyId;

	if (judasGuessedCorrectly) {
		return "judas-win";
	}

	return "tie";
}
