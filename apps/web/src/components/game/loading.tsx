"use client";

import { Card } from "@whoisjudas/ui/components/card";
import { useTranslations } from "next-intl";

interface LoadingSpinnerProps {
	message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
	const t = useTranslations();

	return (
		<div className="flex min-h-dvh flex-col items-center justify-center p-4">
			<div className="flex flex-col items-center gap-4">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				<p className="text-muted-foreground">
					{message || t("common.loading")}
				</p>
			</div>
		</div>
	);
}

interface GameLoadingProps {
	phase?: "lobby" | "game";
}

export function GameLoading({ phase = "lobby" }: GameLoadingProps) {
	const t = useTranslations();

	return (
		<div className="flex min-h-dvh items-center justify-center p-4">
			<Card className="p-6">
				<div className="flex flex-col items-center gap-4">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
					<p className="text-muted-foreground text-sm">
						{phase === "lobby"
							? t("lobby.waitingForPlayers")
							: t("common.loading")}
					</p>
				</div>
			</Card>
		</div>
	);
}
