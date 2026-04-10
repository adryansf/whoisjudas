"use client";

import { Card } from "@whoisjudas/ui/components/card";
import { cn } from "@whoisjudas/ui/lib/utils";
import { useEffect, useState } from "react";

interface TimerProps {
	initialSeconds: number;
	onComplete?: () => void;
}

export function Timer({ initialSeconds, onComplete }: TimerProps) {
	const [seconds, setSeconds] = useState(initialSeconds);

	useEffect(() => {
		setSeconds(initialSeconds);
	}, [initialSeconds]);

	useEffect(() => {
		if (seconds <= 0) {
			onComplete?.();
			return;
		}
		const interval = setInterval(() => {
			setSeconds((s) => Math.max(0, s - 1));
		}, 1000);
		return () => clearInterval(interval);
	}, [seconds, onComplete]);

	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

	const isLow = seconds <= 30;

	return (
		<div className="text-center">
			<p
				className={cn(
					"font-bold text-3xl tabular-nums",
					isLow ? "animate-pulse text-destructive" : "",
				)}
			>
				{formatted}
			</p>
		</div>
	);
}

interface TimerCardProps {
	initialSeconds: number;
	onComplete?: () => void;
}

export function TimerCard({ initialSeconds, onComplete }: TimerCardProps) {
	const [seconds, setSeconds] = useState(initialSeconds);

	useEffect(() => {
		setSeconds(initialSeconds);
	}, [initialSeconds]);

	useEffect(() => {
		if (seconds <= 0) {
			onComplete?.();
			return;
		}
		const interval = setInterval(() => {
			setSeconds((s) => Math.max(0, s - 1));
		}, 1000);
		return () => clearInterval(interval);
	}, [seconds, onComplete]);

	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	const formatted = `${mins}:${secs.toString().padStart(2, "0")}`;

	const isLow = seconds <= 30;

	return (
		<Card className="p-4">
			<div className="text-center">
				<p
					className={cn(
						"font-bold text-3xl tabular-nums",
						isLow ? "animate-pulse text-destructive" : "",
					)}
				>
					{formatted}
				</p>
			</div>
		</Card>
	);
}
