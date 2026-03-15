"use client";

import { Button } from "@whoisjudas/ui/components/button";
import { Input } from "@whoisjudas/ui/components/input";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useRouter } from "@/i18n/routing";

export default function HomePage() {
	const t = useTranslations();
	const _locale = useLocale();
	const router = useRouter();
	const { emit, isConnected, connectionError } = useSocket();

	const [mode, setMode] = useState<"home" | "create" | "join">("home");
	const [name, setName] = useState("");
	const [roomCode, setRoomCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleCreate = async () => {
		if (!name.trim()) {
			setError(t("home.enterName"));
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await emit<
				{ hostName: string },
				{
					success: boolean;
					roomCode?: string;
					playerId?: string;
					error?: string;
				}
			>("room:create", {
				hostName: name.trim(),
			});

			if (response.success && response.roomCode && response.playerId) {
				localStorage.setItem("playerId", response.playerId);
				router.push(`/lobby/${response.roomCode}`);
			} else {
				setError(response.error || "Failed to create room");
			}
		} catch {
			setError("Failed to create room");
		} finally {
			setIsLoading(false);
		}
	};

	const handleJoin = async () => {
		if (!name.trim()) {
			setError(t("home.enterName"));
			return;
		}
		if (!roomCode.trim()) {
			setError(t("home.enterCode"));
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await emit<
				{ roomCode: string; playerName: string },
				{ success: boolean; playerId?: string; error?: string }
			>("room:join", {
				roomCode: roomCode.trim(),
				playerName: name.trim(),
			});

			if (response.success && response.playerId) {
				localStorage.setItem("playerId", response.playerId);
				router.push(`/lobby/${roomCode.trim().toUpperCase()}`);
			} else {
				setError(response.error || "Failed to join room");
			}
		} catch {
			setError("Failed to join room");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4">
			<div className="w-full max-w-md space-y-6">
				<div className="space-y-4 text-center">
					<p className="font-medium text-foreground text-lg">
						{t("home.subtitle")}
					</p>
				</div>

				{!isConnected && (
					<div className="text-center">
						<p className="text-yellow-500">{t("common.connecting")}</p>
						{connectionError && (
							<p className="mt-1 text-destructive text-sm">
								{t("common.error")}: {connectionError}
							</p>
						)}
					</div>
				)}

				{mode === "home" && (
					<div className="space-y-3">
						<Button
							className="h-14 w-full text-lg"
							onClick={() => setMode("create")}
							disabled={!isConnected}
						>
							{t("home.createGame")}
						</Button>
						<Button
							className="h-14 w-full text-lg"
							variant="secondary"
							onClick={() => setMode("join")}
							disabled={!isConnected}
						>
							{t("home.joinGame")}
						</Button>
					</div>
				)}

				{mode === "create" && (
					<div className="space-y-4">
						<Input
							placeholder={t("home.enterName")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-12"
							maxLength={20}
						/>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setMode("home");
									setError("");
								}}
								className="flex-1"
							>
								{t("common.back")}
							</Button>
							<Button
								onClick={handleCreate}
								disabled={isLoading || !isConnected}
								className="flex-1"
							>
								{isLoading ? t("common.loading") : t("home.createGame")}
							</Button>
						</div>
					</div>
				)}

				{mode === "join" && (
					<div className="space-y-4">
						<Input
							placeholder={t("home.enterName")}
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-12"
							maxLength={20}
						/>
						<Input
							placeholder={t("home.enterCode")}
							value={roomCode}
							onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
							className="h-12"
							maxLength={8}
						/>
						{error && <p className="text-destructive text-sm">{error}</p>}
						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setMode("home");
									setError("");
								}}
								className="flex-1"
							>
								{t("common.back")}
							</Button>
							<Button
								onClick={handleJoin}
								disabled={isLoading || !isConnected}
								className="flex-1"
							>
								{isLoading ? t("common.loading") : t("home.joinGame")}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
