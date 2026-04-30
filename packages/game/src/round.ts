import type { GameRoom, RoundOutcome } from "./types";

export function determineWinner(room: GameRoom): RoundOutcome {
	const round = room.currentRound;
	if (!round) return null;

	const voteCounts = new Map<string, number>();
	for (const targetId of round.votes.values()) {
		voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
	}

	const judasVoteCount = voteCounts.get(round.judasId) || 0;
	const totalVotes = round.votes.size;

	const judasIdentified = totalVotes > 0 && judasVoteCount > totalVotes / 2;

	if (judasIdentified) {
		return "disciples-win";
	}

	const judas = room.players.get(round.judasId);
	const judasGuessed = judas?.judasGuess !== undefined;
	const judasGuessedCorrectly = judas?.judasGuess === round.storyId;

	if (judasGuessed && judasGuessedCorrectly) {
		return "judas-win";
	}

	return "tie";
}
