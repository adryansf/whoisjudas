"use client";

import type { PlayerRole } from "@whoisjudas/game";
import { Button } from "@whoisjudas/ui/components/button";
import { Card } from "@whoisjudas/ui/components/card";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { RoleCard } from "./role-card";
import { StoryGuessModal } from "./story-guess-modal";
import { Timer } from "./timer";

interface StoryOption {
	id: string;
	title: string;
}

interface QuestionPhaseProps {
	role: PlayerRole;
	characterName: string;
	story?: {
		id: string;
		title: string;
		description: string;
	};
	possibleStories: StoryOption[];
	timerSeconds: number;
	onJudasGuess: (storyId: string) => Promise<void>;
	hasGuessed?: boolean;
}

export function QuestionPhase({
	role,
	characterName,
	story,
	possibleStories,
	timerSeconds,
	onJudasGuess,
	hasGuessed = false,
}: QuestionPhaseProps) {
	const t = useTranslations();
	const [showGuessModal, setShowGuessModal] = useState(false);
	const isJudas = role === "judas";

	return (
		<div className="space-y-4 overflow-x-hidden">
			<div className="text-center">
				<p className="text-muted-foreground text-sm">
					{t("game.timeRemaining")}
				</p>
				<Timer initialSeconds={timerSeconds} />
			</div>

			<RoleCard role={role} characterName={characterName} story={story} />

			<Card className="p-4">
				<p className="text-center text-muted-foreground">
					{t("game.questionPhase")}
				</p>
				<p className="mt-2 text-center text-sm">{t("game.askQuestions")}</p>
			</Card>

			{isJudas && !hasGuessed && (
				<StoryGuessModal
					open={showGuessModal}
					onOpenChange={setShowGuessModal}
					possibleStories={possibleStories}
					onSubmit={onJudasGuess}
				/>
			)}

			{isJudas && !hasGuessed && (
				<Button
					type="button"
					variant="destructive"
					className="w-full"
					onClick={() => setShowGuessModal(true)}
				>
					{t("game.guessStory")}
				</Button>
			)}

			{isJudas && hasGuessed && (
				<Card className="p-4 text-center">
					<p className="text-muted-foreground">{t("game.guessSubmitted")}</p>
				</Card>
			)}
		</div>
	);
}
