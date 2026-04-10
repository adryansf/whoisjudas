"use client";

import { cn } from "@whoisjudas/ui/lib/utils";
import { useTranslations } from "next-intl";

interface Player {
	id: string;
	name: string;
	isConnected: boolean;
}

interface PlayerListProps {
	players: Player[];
	hostId: string;
	maxPlayers?: number;
}

export function PlayerList({
	players,
	hostId,
	maxPlayers = 12,
}: PlayerListProps) {
	const t = useTranslations();

	return (
		<div className="space-y-2">
			<h2 className="font-semibold">
				{t("lobby.players")} ({players.length}/{maxPlayers})
			</h2>
			<div className="space-y-2">
				{players.map((player) => (
					<div
						key={player.id}
						className="flex items-center justify-between rounded bg-muted p-2"
					>
						<div className="flex items-center gap-2">
							<div
								className={cn(
									"h-2 w-2 rounded-full",
									player.isConnected
										? "bg-green-600 dark:bg-green-500"
										: "bg-muted-foreground",
								)}
								title={
									player.isConnected
										? t("common.connected")
										: t("common.disconnected")
								}
							/>
							<span className="truncate">{player.name}</span>
						</div>
						{hostId === player.id && (
							<span className="rounded bg-primary px-2 py-1 font-medium text-primary-foreground text-xs">
								{t("lobby.hostBadge")}
							</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
