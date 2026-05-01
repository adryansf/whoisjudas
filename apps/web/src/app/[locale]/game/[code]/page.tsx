"use client";

import { loadStories } from "@whoisjudas/data";
import { Button } from "@whoisjudas/ui/components/button";
import { Card } from "@whoisjudas/ui/components/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@whoisjudas/ui/components/dialog";
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
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/error-boundary";
import { TimerCard } from "@/components/game/timer";
import { useSocket } from "@/hooks/use-socket";
import { useRouter } from "@/i18n/routing";

interface PlayerSummary {
	id: string;
	name: string;
	isConnected: boolean;
}

interface GameStartedPayload {
	role: "disciple" | "judas";
	characterId?: string;
	storyId?: string;
	phase: "question";
	timerSeconds: number;
}

export default function GamePage() {
	const t = useTranslations();
	const locale = useLocale() as "en" | "pt-BR";
	const params = useParams();
	const router = useRouter();
	const { emit, on, isConnected } = useSocket();

	const roomCode = params.code as string;
	const [gameData, setGameData] = useState<GameStartedPayload | null>(null);
	const [playerId, setPlayerId] = useState<string | null>(null);
	const [players, setPlayers] = useState<PlayerSummary[]>([]);
	const [hostId, setHostId] = useState<string>("");
	const [phase, setPhase] = useState<"question" | "vote" | "reveal">(
		"question",
	);
	const isHost = hostId === playerId;
	const [timer, setTimer] = useState(0);
	const [votesCounted, setVotesCounted] = useState(0);
	const [totalVoters, setTotalVoters] = useState(0);
	const [selectedVote, setSelectedVote] = useState<string>("");
	const [selectedGuess, setSelectedGuess] = useState<string>("");
	const [hasVoted, setHasVoted] = useState(false);
	const [hasGuessed, setHasGuessed] = useState(false);
	const [showCharactersDialog, setShowCharactersDialog] = useState(false);
	const [selectedStoryForChars, setSelectedStoryForChars] = useState<
		string | null
	>(null);
	const [revealData, setRevealData] = useState<{
		judasId: string;
		judasName: string;
		storyId: string;
		winner: string;
		votes: { voterName: string; targetId: string }[];
		judasGuess?: string;
	} | null>(null);
	const player = players.find((p) => p.id === playerId);

	// Initialize playerId from localStorage on client side only
	useEffect(() => {
		const storedPlayerId = localStorage.getItem("playerId");
		if (storedPlayerId) {
			setPlayerId(storedPlayerId);
		}
	}, []);

	const allStories = loadStories(locale);
	const currentStory = allStories.find((s) => s.id === gameData?.storyId);
	const currentCharacter = currentStory?.characters.find(
		(c) => c.id === gameData?.characterId,
	);

	const playerItems = players
		.filter((p) => p.id !== playerId)
		.map((player) => ({ value: player.id, label: player.name }));

	const storyItems = allStories
		.map((s) => ({ value: s.id, label: s.title }))
		.sort((a, b) => a.label.localeCompare(b.label, locale));

	// Ref to track players count for stale closure fix
	const playersCountRef = useRef(players.length);
	useEffect(() => {
		playersCountRef.current = players.length;
	}, [players.length]);

	useEffect(() => {
		if (!isConnected || !playerId) return;

		emit<
			{ roomCode: string; playerId: string },
			{
				success: boolean;
				gameState?: {
					phase: string;
					timerRemaining?: number;
					role?: "disciple" | "judas";
					characterId?: string;
					storyId?: string;
					timerSeconds?: number;
					players: PlayerSummary[];
					totalVoters?: number;
					votesCounted?: number;
					hostId: string;
				};
			}
		>("room:reconnect", { roomCode, playerId }).then((response) => {
			if (
				response.success &&
				response.gameState &&
				response.gameState.phase !== "waiting"
			) {
				setGameData({
					role: response.gameState.role as "disciple" | "judas",
					characterId: response.gameState.characterId,
					storyId: response.gameState.storyId,
					phase: "question", // This will be updated by phase-change or initial state
					timerSeconds: response.gameState.timerSeconds || 300,
				});
				setPhase(response.gameState.phase as "question" | "vote" | "reveal");
				setTimer(response.gameState.timerRemaining || 0);
				setPlayers(response.gameState.players);
				setHostId(response.gameState.hostId);
				setTotalVoters(
					response.gameState.totalVoters ||
						response.gameState.players.length - 1,
				);
				setVotesCounted(response.gameState.votesCounted || 0);
			}
		});
	}, [isConnected, playerId, roomCode, emit]);

	useEffect(() => {
		if (!isConnected) return;

		const unsub1 = on<GameStartedPayload>("game:started", (data) => {
			setGameData(data);
			setPhase("question");
			setTimer(data.timerSeconds);
			setHasVoted(false);
			setHasGuessed(false);
			setSelectedVote("");
			setSelectedGuess("");
			// Use ref to avoid stale closure issue with players.length
			setTotalVoters(playersCountRef.current - 1);
		});

		const unsub2 = on<{
			phase: "question" | "vote" | "reveal";
			timerSeconds: number;
		}>("game:phase-change", (data) => {
			setPhase(data.phase);
			setTimer(data.timerSeconds);
		});

		const unsub3 = on<{ votesCounted: number; totalVoters: number }>(
			"vote:update",
			(data) => {
				setVotesCounted(data.votesCounted);
				setTotalVoters(data.totalVoters);
			},
		);

		const unsub4 = on<{
			judasId: string;
			judasName: string;
			storyId: string;
			winner: string;
			votes: { voterName: string; targetId: string }[];
			judasGuess?: string;
		}>("game:reveal", (data) => {
			setRevealData(data);
			setPhase("reveal");
		});

		const unsub_timer = on<{ timerRemaining: number; phase: string }>(
			"game:timer",
			(data) => {
				setTimer(data.timerRemaining);
				if (data.phase !== phase) {
					setPhase(data.phase as "question" | "vote" | "reveal");
				}
			},
		);

		const unsub5 = on<{ player: PlayerSummary; playerCount: number }>(
			"room:player-joined",
			(data) => {
				setPlayers((prev) => [...prev, data.player]);
				setTotalVoters(data.playerCount - 1);
			},
		);

		const unsub6 = on<{ playerId: string; playerCount: number }>(
			"room:player-left",
			(data) => {
				setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
				setTotalVoters(data.playerCount - 1);
			},
		);

		const unsub_play_again = on("room:rejoin", () => {
			router.push(`/lobby/${roomCode}`);
		});

		return () => {
			unsub1();
			unsub2();
			unsub3();
			unsub4();
			unsub_timer();
			unsub5();
			unsub6();
			unsub_play_again();
		};
	}, [isConnected, on, roomCode, router, phase]);

	const handleVote = async () => {
		if (!selectedVote) return;
		try {
			const response = await emit<
				{ targetId: string },
				{ success: boolean; error?: string }
			>("vote:cast", { targetId: selectedVote });
			if (response.success) {
				setHasVoted(true);
			} else {
				toast.error(response.error || t("common.voteFailed"));
			}
		} catch (e) {
			console.error("Vote failed", e);
			toast.error(t("common.voteFailed"));
		}
	};

	const handleGuess = async () => {
		if (!selectedGuess) return;
		try {
			const response = await emit<
				{ storyId: string },
				{ success: boolean; error?: string }
			>("judas:guess", { storyId: selectedGuess });
			if (response.success) {
				setHasGuessed(true);
			} else {
				toast.error(response.error || t("common.guessFailed"));
			}
		} catch (e) {
			console.error("Guess failed", e);
			toast.error(t("common.guessFailed"));
		}
	};

	if (!gameData) {
		return (
			<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
				<p>{t("common.loading")}</p>
			</div>
		);
	}

	return (
		<ErrorBoundary>
			<div className="flex min-h-[calc(100vh-4rem)] flex-col items-center p-4 pb-24">
				<div className="w-full max-w-md space-y-4 pb-4">
					{phase !== "reveal" && <TimerCard initialSeconds={timer} />}

					{phase === "vote" && gameData.role === "disciple" && !hasVoted && (
						<Card className="space-y-4 p-4">
							<p className="font-semibold">{t("game.voteForJudas")}</p>
							<div className="space-y-2">
								<Select
									items={playerItems}
									itemToStringLabel={(value) =>
										playerItems.find((player) => player.value === value)
											?.label || value
									}
									value={selectedVote}
									onValueChange={(value) => {
										if (value) setSelectedVote(value);
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder={t("game.selectPlayer")} />
									</SelectTrigger>
									<SelectContent>
										{playerItems.map((item) => (
											<SelectItem key={item.value} value={item.value}>
												{item.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<Button
								onClick={handleVote}
								disabled={!selectedVote}
								className="w-full"
							>
								{t("game.castVote")}
							</Button>
						</Card>
					)}

					{gameData.role === "judas" && phase === "vote" && !hasGuessed && (
						<Card className="space-y-4 p-4">
							<p className="font-semibold">{t("game.guessStory")}</p>
							<Select
								items={storyItems}
								itemToStringLabel={(value) =>
									storyItems.find((story) => story.value === value)?.label ||
									value
								}
								value={selectedGuess}
								onValueChange={(value) => {
									if (value) setSelectedGuess(value);
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder={t("game.selectStory")} />
								</SelectTrigger>
								<SelectContent>
									{storyItems.map((item) => (
										<SelectItem key={item.value} value={item.value}>
											{item.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Button
								onClick={handleGuess}
								disabled={!selectedGuess}
								className="w-full"
							>
								{t("game.submitGuess")}
							</Button>
						</Card>
					)}

					<Card className="p-4">
						{player && (
							<div className="mb-4 border-b pb-2">
								<p className="text-muted-foreground text-xs">
									{t("game.yourName")}
								</p>
								<p className="font-semibold">{player.name}</p>
							</div>
						)}
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">
								{t("game.yourRole")}
							</p>
							<p
								className={cn(
									"font-bold text-xl",
									gameData.role === "judas"
										? "text-destructive"
										: "text-primary",
								)}
							>
								{gameData.role === "judas"
									? t("game.judas")
									: t("game.disciple")}
							</p>
						</div>
						{gameData.role === "disciple" && currentCharacter && (
							<div className="mt-4 space-y-2">
								<p className="text-muted-foreground text-sm">
									{t("game.yourCharacter")}
								</p>
								<p className="font-semibold text-lg">{currentCharacter.name}</p>
							</div>
						)}
					</Card>

					{gameData.role === "disciple" && currentStory && (
						<Dialog
							open={showCharactersDialog}
							onOpenChange={setShowCharactersDialog}
						>
							<Card
								className="cursor-pointer p-4"
								onClick={() => setShowCharactersDialog(true)}
							>
								<p className="text-muted-foreground text-sm">
									{t("game.theStory")}
								</p>
								<p className="font-semibold text-lg">{currentStory.title}</p>
								<p className="mt-2 text-muted-foreground">
									{currentStory.description}
								</p>
								<p className="mt-2 text-primary text-xs">
									{t("game.clickToSeeCharacters")}
								</p>
							</Card>
							<DialogContent className="max-h-[80vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>{currentStory.title}</DialogTitle>
								</DialogHeader>
								<div className="space-y-4 pb-4">
									<p className="text-muted-foreground text-sm">
										{currentStory.description}
									</p>
									<div className="space-y-2">
										<p className="font-semibold text-sm">
											{t("game.characters")}
										</p>
										{currentStory.characters.map((char) => (
											<div
												key={char.id}
												className="flex items-center gap-3 rounded-lg border p-3"
											>
												<span className="font-medium">{char.name}</span>
											</div>
										))}
									</div>
								</div>
							</DialogContent>
						</Dialog>
					)}

					{(phase === "question" || phase === "vote") && (
						<Card className="space-y-2 p-4">
							<p className="font-semibold text-sm">
								{t("game.possibleStories")}
							</p>
							<div className="flex flex-wrap gap-2">
								{allStories
									.slice()
									.sort((a, b) => a.title.localeCompare(b.title, locale))
									.map((s) => (
										<Dialog
											key={s.id}
											open={selectedStoryForChars === s.id}
											onOpenChange={(open) =>
												setSelectedStoryForChars(open ? s.id : null)
											}
										>
											<DialogTrigger
												render={
													<button
														type="button"
														className={cn(
															"cursor-pointer rounded-md border px-2 py-1 text-xs",
															gameData.role === "disciple" &&
																gameData.storyId === s.id
																? "border-primary bg-primary/10 font-bold text-primary"
																: "bg-muted text-muted-foreground hover:bg-muted/80",
														)}
													>
														{s.title}
													</button>
												}
											/>
											<DialogContent className="max-h-[80vh] overflow-y-auto">
												<DialogHeader>
													<DialogTitle>{s.title}</DialogTitle>
												</DialogHeader>
												<div className="space-y-4 pb-4">
													<p className="text-muted-foreground text-sm">
														{s.description}
													</p>
													<div className="space-y-2">
														<p className="font-semibold text-sm">
															{t("game.characters")}
														</p>
														{s.characters.map((char) => (
															<div
																key={char.id}
																className="flex items-center gap-3 rounded-lg border p-3"
															>
																<span className="font-medium">{char.name}</span>
															</div>
														))}
													</div>
												</div>
											</DialogContent>
										</Dialog>
									))}
							</div>
						</Card>
					)}

					{phase === "vote" && (hasVoted || gameData.role === "judas") && (
						<Card className="p-4 text-center">
							<p>{t("game.waitingForVotes")}</p>
							<p className="text-muted-foreground text-sm">
								{votesCounted} / {totalVoters} {t("game.votes")}
							</p>
						</Card>
					)}

					{phase === "reveal" && revealData && (
						<Card className="space-y-4 p-4">
							<div className="text-center">
								<p className="text-muted-foreground text-sm">
									{t("reveal.theJudasWas")}
								</p>
								<p className="font-bold text-xl">{revealData.judasName}</p>
							</div>
							<div className="text-center">
								<p className="text-muted-foreground text-sm">
									{t("reveal.theStoryWas")}
								</p>
								<p className="font-semibold text-lg">
									{allStories.find((s) => s.id === revealData.storyId)?.title ||
										revealData.storyId}
								</p>
							</div>
							<div className="text-center">
								<p
									className={cn(
										"font-bold text-2xl",
										revealData.winner === "disciples"
											? "text-green-500"
											: revealData.winner === "judas"
												? "text-red-500"
												: "text-yellow-500",
									)}
								>
									{revealData.winner === "disciples"
										? t("reveal.disciplesWin")
										: revealData.winner === "judas"
											? t("reveal.judasWins")
											: t("reveal.tie")}
								</p>
							</div>

							{revealData.judasGuess && (
								<div className="text-center">
									<p className="text-muted-foreground text-sm">
										{t("reveal.judasGuessed")}
									</p>
									<p className="font-semibold">
										{allStories.find((s) => s.id === revealData.judasGuess)
											?.title || revealData.judasGuess}{" "}
										(
										{revealData.judasGuess === revealData.storyId
											? t("reveal.correctGuess")
											: t("reveal.wrongGuess")}
										)
									</p>
								</div>
							)}

							<div className="mt-4 space-y-2">
								<p className="font-semibold text-sm">
									{t("reveal.voteResults")}
								</p>
								{revealData.votes.map((v, i) => (
									<div key={i} className="flex justify-between text-sm">
										<span>{v.voterName}</span>
										<span className="text-muted-foreground">
											→{" "}
											{players.find((p) => p.id === v.targetId)?.name ||
												v.targetId}
										</span>
									</div>
								))}
							</div>

							<Button
								onClick={() => emit("game:play-again", undefined)}
								className="mt-4 w-full"
								disabled={!isHost}
							>
								{t("reveal.playAgain")}
							</Button>
						</Card>
					)}
				</div>
			</div>
		</ErrorBoundary>
	);
}
