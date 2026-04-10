"use client";

import type { PlayerRole } from "@whoisjudas/game";
import { Card } from "@whoisjudas/ui/components/card";
import { cn } from "@whoisjudas/ui/lib/utils";
import { useTranslations } from "next-intl";

interface RoleCardProps {
	role: PlayerRole;
	characterName: string;
	story?: {
		id: string;
		title: string;
		description: string;
	};
}

export function RoleCard({ role, characterName, story }: RoleCardProps) {
	const t = useTranslations();

	const isJudas = role === "judas";

	return (
		<Card className="p-4">
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm">{t("game.yourRole")}</p>
				<p
					className={cn(
						"font-bold text-xl",
						isJudas ? "text-destructive" : "text-primary",
					)}
				>
					{isJudas ? t("game.judas") : t("game.disciple")}
				</p>
			</div>
			<div className="mt-4 space-y-2">
				<p className="text-muted-foreground text-sm">
					{t("game.yourCharacter")}
				</p>
				<p className="font-semibold text-lg">{characterName}</p>
			</div>
			{story && (
				<div className="mt-4 space-y-2">
					<p className="text-muted-foreground text-sm">{t("game.theStory")}</p>
					<p className="font-semibold text-lg">{story.title}</p>
					<p className="mt-2 text-muted-foreground">{story.description}</p>
				</div>
			)}
		</Card>
	);
}
