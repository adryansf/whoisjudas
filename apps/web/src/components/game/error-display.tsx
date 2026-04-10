"use client";

import { Button } from "@whoisjudas/ui/components/button";
import { Card } from "@whoisjudas/ui/components/card";
import { useTranslations } from "next-intl";

interface ErrorDisplayProps {
	message?: string;
	onRetry?: () => void;
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
	const t = useTranslations();

	return (
		<div className="flex min-h-dvh items-center justify-center p-4">
			<Card className="max-w-md p-6">
				<div className="flex flex-col items-center gap-4 text-center">
					<div className="rounded-full bg-destructive/10 p-3">
						<svg
							className="h-6 w-6 text-destructive"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							role="img"
							aria-label={t("common.error")}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<p className="text-destructive">{message || t("common.error")}</p>
					{onRetry && (
						<Button variant="outline" onClick={onRetry}>
							{t("common.retry")}
						</Button>
					)}
				</div>
			</Card>
		</div>
	);
}
