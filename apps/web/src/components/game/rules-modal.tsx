"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@whoisjudas/ui/components/dialog";
import { useTranslations } from "next-intl";
import { memo } from "react";

interface RulesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function RulesModalInner({ open, onOpenChange }: RulesModalProps) {
	const t = useTranslations();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{t("rules.title")}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 pb-4">
					<div className="space-y-1">
						<p className="font-semibold">{t("rules.objective")}</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.objectiveLine1")}
						</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.objectiveLine2")}
						</p>
					</div>

					<div className="space-y-1">
						<p className="font-semibold">{t("rules.roles")}</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.disciplesLabel")} {t("rules.disciplesDesc")}
						</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.judasLabel")} {t("rules.judasDesc")}
						</p>
					</div>

					<div className="space-y-1">
						<p className="font-semibold">{t("rules.phases")}</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.questionsLabel")} {t("rules.questionsDesc")}
						</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.voteLabel")} {t("rules.voteDesc")}
						</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.revealLabel")} {t("rules.revealDesc")}
						</p>
					</div>

					<div className="space-y-1">
						<p className="font-semibold">{t("rules.victory")}</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.disciplesWinLabel")} {t("rules.disciplesWinDesc")}
						</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.judasWinLabel")} {t("rules.judasWinDesc")}
						</p>
						<p className="text-muted-foreground text-sm">
							{t("rules.tieLabel")} {t("rules.tieDesc")}
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

export const RulesModal = memo(RulesModalInner);
