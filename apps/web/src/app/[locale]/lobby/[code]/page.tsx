"use client";

import { Button } from "@whoisjudas/ui/components/button";
import { Card } from "@whoisjudas/ui/components/card";
import { Input } from "@whoisjudas/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@whoisjudas/ui/components/select";
import { cn } from "@whoisjudas/ui/lib/utils";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSocket } from "@/hooks/use-socket";
import { useRouter } from "@/i18n/routing";
import { translateError } from "@/lib/errors";

interface Player {
	id: string;
	name: string;
	isConnected: boolean;
}

export default function LobbyPage() {
	const t = useTranslations();
	const _locale = useLocale();
	const params = useParams();
	const router = useRouter();
	const { emit, on, isConnected, connectionError, multipleSessionsReason } =
		useSocket();

	const roomCode = params.code as string;
	const [players, setPlayers] = useState<Player[]>([]);
	const [hostId, setHostId] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState("");
	const [playerId, setPlayerId] = useState<string | null>(null);
	const [name, setName] = useState("");
	const [isJoining, setIsJoining] = useState(false);
	const [settings, setSettings] = useState({ questionDuration: 300 });

	useEffect(() => {
		const id = localStorage.getItem("playerId");
		if (id) {
			setPlayerId(id);
		} else {
			setIsLoading(false);
		}
	}, []);

	const isHost = hostId === playerId;

	useEffect(() => {
		if (!isConnected || !playerId) return;

		emit<
			{ roomCode: string; playerId: string },
			{
				success: boolean;
				gameState?: {
					players: Player[];
					hostId: string;
					phase: string;
					isHost: boolean;
					settings: { questionDuration: number };
				};
			}
		>("room:reconnect", {
			roomCode,
			playerId: playerId as string,
		})
			.then((response) => {
				if (response.success && response.gameState) {
					setPlayers(response.gameState.players);
					setHostId(response.gameState.hostId);
					setSettings(response.gameState.settings);

					if (response.gameState.phase !== "waiting") {
						router.push(`/game/${roomCode}`);
					}
				} else {
					// Clear invalid session and show join form
					localStorage.removeItem("playerId");
					setPlayerId(null);
				}
			})
			.catch(() => {
				setError(t("common.connectionError"));
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [isConnected, playerId, roomCode, emit, router]);

	useEffect(() => {
		if (!isConnected) return;

		const unsub1 = on(
			"room:player-joined",
			(data: { player: Player; playerCount: number }) => {
				setPlayers((prev) => {
					if (prev.find((p) => p.id === data.player.id)) return prev;
					return [...prev, data.player];
				});
			},
		);

		const unsub2 = on(
			"room:player-left",
			(data: { playerId: string; playerName: string; playerCount: number }) => {
				setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
			},
		);

		const unsub3 = on(
			"room:host-changed",
			(data: { newHostId: string; newHostName: string }) => {
				setHostId(data.newHostId);
			},
		);

		const unsub4 = on("game:started", () => {
			router.push(`/game/${roomCode}`);
		});

		const unsub5 = on("player:updated", (data: { player: Player }) => {
			setPlayers((prev) =>
				prev.map((p) => (p.id === data.player.id ? data.player : p)),
			);
		});

		const unsub6 = on(
			"room:settings-updated",
			(data: { settings: { questionDuration: number } }) => {
				setSettings(data.settings);
				toast.info(
					t("lobby.roundTimeUpdated", {
						time: data.settings.questionDuration / 60,
					}),
				);
			},
		);

		return () => {
			unsub1();
			unsub2();
			unsub3();
			unsub4();
			unsub5();
			unsub6();
		};
	}, [isConnected, on, roomCode, router]);

	const handleJoin = async () => {
		if (!name.trim()) {
			setError(t("home.enterName"));
			return;
		}

		setIsJoining(true);
		setError("");

		try {
			const response = await emit<
				{ roomCode: string; playerName: string },
				{
					success: boolean;
					playerId?: string;
					hostId: string;
					players: Player[];
					error?: string;
				}
			>("room:join", {
				roomCode,
				playerName: name.trim(),
			});

			if (response.success && response.playerId) {
				localStorage.setItem("playerId", response.playerId);
				setPlayerId(response.playerId);
				setPlayers(response.players);
				setHostId(response.hostId);
			} else {
				setError(translateError(response.error, t));
			}
		} catch {
			setError(t("common.failedToJoin"));
		} finally {
			setIsJoining(false);
		}
	};

	const handleUpdateDuration = async (duration: number) => {
		try {
			await emit<
				{ roomCode: string; settings: { questionDuration: number } },
				{ success: boolean; error?: string }
			>("room:update-settings", {
				roomCode,
				settings: { questionDuration: duration },
			});
		} catch {
			toast.error(t("lobby.failedToUpdateSettings"));
		}
	};

	const handleStart = async () => {
		if (players.length < 3) {
			setError(t("lobby.needMorePlayers"));
			return;
		}

		setIsStarting(true);
		setError("");

		try {
			const response = await emit<
				unknown,
				{ success: boolean; error?: string }
			>("game:start", undefined);
			if (!response.success) {
				setError(
					translateError(response.error, t) || t("common.failedToStart"),
				);
			}
		} catch {
			setError(t("common.failedToStart"));
		} finally {
			setIsStarting(false);
		}
	};

	const handleLeave = async () => {
		console.log("Leaving room...");
		localStorage.removeItem("playerId");

		try {
			await emit<unknown, { success: boolean; error?: string }>(
				"room:leave",
				undefined,
			);
			console.log("Leave room emitted");
		} catch (err) {
			console.error("Failed to leave room:", err);
		}

		router.push("/");
	};

	const copyCode = () => {
		navigator.clipboard.writeText(roomCode);
		toast.success(t("lobby.codeCopied"));
	};

	const copyLink = () => {
		const url = window.location.href;
		navigator.clipboard.writeText(url);
		toast.success(t("lobby.linkCopied"));
	};

	const durationOptions = [
		{ value: "60", label: t("lobby.minutes", { count: 1 }) },
		{ value: "120", label: t("lobby.minutes", { count: 2 }) },
		{ value: "180", label: t("lobby.minutes", { count: 3 }) },
		{ value: "300", label: t("lobby.minutes", { count: 5 }) },
		{ value: "600", label: t("lobby.minutes", { count: 10 }) },
		{ value: "900", label: t("lobby.minutes", { count: 15 }) },
	];

	if (isLoading) {
		return (
			<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
				<p>{t("common.loading")}</p>
				{connectionError && (
					<p className="text-destructive text-sm">
						{t("common.connectionError")}: {connectionError}
					</p>
				)}
				{multipleSessionsReason && (
					<div className="flex flex-col items-center gap-2">
						<p className="text-destructive text-sm">{multipleSessionsReason}</p>
						<Button variant="secondary" onClick={() => router.push("/")}>
							{t("home.backToHome")}
						</Button>
					</div>
				)}
				{!isConnected && (
					<p className="text-muted-foreground text-sm">
						Connecting to server...
					</p>
				)}
			</div>
		);
	}
	if (!playerId) {
		return (
			<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
				<div className="w-full max-w-md space-y-6">
					<div className="text-center">
						<h1 className="font-bold text-2xl">{t("home.joinGame")}</h1>
						<p className="bg-black/30 p-2 font-bold text-primary text-shadow">
							{roomCode}
						</p>
					</div>
					<Card className="space-y-4 p-4">
						<Input
							placeholder={t("home.enterName")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							maxLength={20}
						/>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<Button
							className="w-full"
							onClick={handleJoin}
							disabled={isJoining || !isConnected}
						>
							{isJoining ? t("common.loading") : t("home.joinGame")}
						</Button>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="text-center">
					<h1 className="font-bold text-2xl">{t("lobby.title")}</h1>
				</div>

				<Card className="space-y-4 p-4">
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">{t("lobby.roomCode")}</span>
						<div className="flex items-center gap-2">
							<span className="font-bold font-mono text-lg">{roomCode}</span>
							<Button size="sm" variant="secondary" onClick={copyCode}>
								{t("lobby.copyCode")}
							</Button>
						</div>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-muted-foreground">
							{t("lobby.shareLink")}
						</span>
						<Button size="sm" variant="secondary" onClick={copyLink}>
							{t("lobby.shareLink")}
						</Button>
					</div>
					{isHost ? (
						<div className="flex items-center justify-between border-t pt-2">
							<span className="text-muted-foreground">
								{t("lobby.duration")}
							</span>
							<Select
								items={durationOptions}
								itemToStringLabel={(value) =>
									durationOptions.find((duration) => duration.value === value)
										?.label || value
								}
								value={settings.questionDuration.toString()}
								onValueChange={(value) => {
									if (value) {
										const duration = Number.parseInt(value, 10);
										if (!Number.isNaN(duration)) {
											handleUpdateDuration(duration);
										}
									}
								}}
							>
								<SelectTrigger className="h-8 w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{durationOptions.map((o) => (
										<SelectItem key={o.value} value={o.value}>
											{o.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					) : (
						<div className="flex items-center justify-between border-t pt-2 text-sm">
							<span className="text-muted-foreground">
								{t("lobby.duration")}
							</span>
							<span className="font-medium">
								{t("lobby.minutes", { count: settings.questionDuration / 60 })}
							</span>
						</div>
					)}
				</Card>

				<Card className="space-y-4 p-4">
					<h2 className="font-semibold">
						{t("lobby.players")} ({players.length}/12)
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
											player.isConnected ? "bg-green-500" : "bg-gray-400",
										)}
									/>
									<span>{player.name}</span>
								</div>
								{hostId === player.id && (
									<span className="rounded bg-primary/10 px-2 py-1 text-secondary text-xs dark:text-primary">
										{t("lobby.hostBadge")}
									</span>
								)}
							</div>
						))}
					</div>
					{!isHost && players.length >= 3 && (
						<p className="pt-2 text-center text-muted-foreground text-sm">
							{t("lobby.waitingForHost")}
						</p>
					)}
					{players.length < 3 && (
						<p className="pt-2 text-center text-muted-foreground text-sm">
							{t("lobby.minPlayersRequired")}
						</p>
					)}
				</Card>

				{error && (
					<p className="text-center text-destructive text-sm">{error}</p>
				)}

				<div className="flex gap-2">
					<Button variant="secondary" onClick={handleLeave} className="flex-1">
						{t("lobby.leaveRoom")}
					</Button>
					{isHost && (
						<Button
							onClick={handleStart}
							disabled={isStarting || players.length < 3}
							className="flex-1"
						>
							{isStarting ? t("lobby.starting") : t("lobby.startGame")}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
