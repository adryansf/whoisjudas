"use client";

import { Button } from "@whoisjudas/ui/components/button";
import { Card } from "@whoisjudas/ui/components/card";
import { useTranslations } from "next-intl";
import { PlayerList } from "./player-list";

interface Player {
	id: string;
	name: string;
	isConnected: boolean;
}

interface LobbyProps {
	roomCode: string;
	players: Player[];
	hostId: string;
	currentPlayerId: string;
	isStarting?: boolean;
	error?: string;
	onStart: () => Promise<void>;
	onLeave: () => void;
	onCopyCode: () => void;
}

export function Lobby({
	roomCode,
	players,
	hostId,
	currentPlayerId,
	isStarting = false,
	error,
	onStart,
	onLeave,
	onCopyCode,
}: LobbyProps) {
	const t = useTranslations();
	const isHost = hostId === currentPlayerId;
	const canStart = players.length >= 3;

	return (
		<div className="w-full max-w-md space-y-6 overflow-x-hidden">
			<div className="text-center">
				<h1 className="font-bold text-2xl">{t("lobby.title")}</h1>
			</div>

			<Card className="space-y-2 p-4">
				<div className="flex items-center justify-between">
					<span className="text-muted-foreground">{t("lobby.roomCode")}</span>
					<div className="flex items-center gap-2">
						<span className="font-bold font-mono text-lg">{roomCode}</span>
						<Button size="sm" variant="secondary" onClick={onCopyCode}>
							{t("lobby.copyCode")}
						</Button>
					</div>
				</div>
			</Card>

			<Card className="max-h-[300px] overflow-y-auto p-4">
				<PlayerList players={players} hostId={hostId} />
				{!isHost && players.length >= 3 && (
					<p className="text-center text-muted-foreground text-sm pt-2">
						{t("lobby.waitingForHost")}
					</p>
				)}
				{!canStart && (
					<p className="text-center text-muted-foreground text-sm pt-2">
						{t("lobby.needMorePlayers")}
					</p>
				)}
			</Card>

			{error && <p className="text-center text-destructive text-sm">{error}</p>}

			<div className="flex gap-2">
				<Button variant="secondary" onClick={onLeave} className="flex-1">
					{t("lobby.leaveRoom")}
				</Button>
				{isHost && (
					<Button
						onClick={onStart}
						disabled={isStarting || !canStart}
						className="flex-1"
					>
						{isStarting ? t("lobby.starting") : t("lobby.startGame")}
					</Button>
				)}
			</div>
		</div>
	);
}
