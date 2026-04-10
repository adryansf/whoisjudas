"use client";

import type { PlayerRole } from "@whoisjudas/game";
import { Button } from "@whoisjudas/ui/components/button";
import { Card } from "@whoisjudas/ui/components/card";
import { cn } from "@whoisjudas/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Timer } from "./timer";

interface VoteTarget {
	id: string;
	name: string;
}

interface VotePhaseProps {
	role: PlayerRole;
	timerSeconds: number;
	voteTargets: VoteTarget[];
	votesCounted: number;
	totalVoters: number;
	onVote: (targetId: string) => Promise<void>;
	hasVoted?: boolean;
}

export function VotePhase({
	role,
	timerSeconds,
	voteTargets,
	votesCounted,
	totalVoters,
	onVote,
	hasVoted = false,
}: VotePhaseProps) {
	const t = useTranslations();
	const [selectedTarget, setSelectedTarget] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isJudas = role === "judas";

	const handleVote = async () => {
		if (!selectedTarget || isSubmitting) return;
		setIsSubmitting(true);
		try {
			await onVote(selectedTarget);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="space-y-4 overflow-x-hidden pb-6">
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					{t("game.timeRemaining")}
				</p>
				<Timer initialSeconds={timerSeconds} />
			</div>

			{!isJudas && !hasVoted && (
				<Card className="space-y-4 p-4">
					<p className="text-center font-semibold">{t("game.votePhase")}</p>
					<p className="font-semibold">{t("game.voteForJudas")}</p>
					<div className="space-y-2">
						{voteTargets.map((target) => (
							<Button
								key={target.id}
								type="button"
								variant={selectedTarget === target.id ? "default" : "outline"}
								className={cn(
									"w-full justify-start text-left",
									selectedTarget === target.id ? "" : "hover:bg-muted",
								)}
								onClick={() => setSelectedTarget(target.id)}
								disabled={isSubmitting}
							>
								{target.name}
							</Button>
						))}
					</div>
					<Button
						onClick={handleVote}
						disabled={!selectedTarget || isSubmitting}
						className="w-full"
					>
						{isSubmitting ? t("game.voting") : t("game.castVote")}
					</Button>
				</Card>
			)}

			{!isJudas && hasVoted && (
				<Card className="p-4 text-center">
					<p>{t("game.waitingForVotes")}</p>
					<p className="text-muted-foreground text-sm">
						{votesCounted} / {totalVoters} {t("game.votes")}
					</p>
				</Card>
			)}

			{isJudas && (
				<Card className="p-4 text-center">
					<p>{t("game.waitingForVotes")}</p>
					<p className="text-muted-foreground text-sm">
						{votesCounted} / {totalVoters} {t("game.votes")}
					</p>
				</Card>
			)}
		</div>
	);
}
