"use client";

import { Card } from "@whoisjudas/ui/components/card";
import { cn } from "@whoisjudas/ui/lib/utils";
import { useTranslations } from "next-intl";

interface ConnectionStatusProps {
	isConnected: boolean;
	isReconnecting?: boolean;
}

export function ConnectionStatus({
	isConnected,
	isReconnecting = false,
}: ConnectionStatusProps) {
	const t = useTranslations();

	if (isConnected && !isReconnecting) return null;

	return (
		<div className="fixed top-16 right-4 z-50">
			<Card className="flex items-center gap-2 p-2">
				<div
					className={cn(
						"h-2 w-2 rounded-full",
						isReconnecting ? "animate-pulse bg-yellow-500" : "bg-destructive",
					)}
				/>
				<span className="text-muted-foreground text-xs">
					{isReconnecting ? t("common.reconnecting") : t("common.disconnected")}
				</span>
			</Card>
		</div>
	);
}

interface ConnectionBannerProps {
	isConnected: boolean;
	isReconnecting?: boolean;
}

export function ConnectionBanner({
	isConnected,
	isReconnecting = false,
}: ConnectionBannerProps) {
	const t = useTranslations();
	if (isConnected && !isReconnecting) return null;

	return (
		<div
			className={cn(
				"w-full p-2 text-center text-sm",
				isReconnecting
					? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
					: "bg-destructive/10 text-destructive",
			)}
		>
			{isReconnecting ? t("common.reconnecting") : t("common.connectionLost")}
		</div>
	);
}
