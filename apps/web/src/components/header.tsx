"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { RulesModal } from "./game/rules-modal";
import { LocaleToggle } from "./locale-toggle";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const t = useTranslations();
	const links = [{ to: "/", label: t("nav.home") }] as const;
	const [showRulesModal, setShowRulesModal] = useState(false);

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setShowRulesModal(true)}
						className="cursor-pointer rounded border border-white/50 px-3 py-1 text-sm text-white transition-colors hover:bg-white/10"
					>
						{t("rules.title")}
					</button>
					<LocaleToggle />
					<ModeToggle />
				</div>
				<RulesModal open={showRulesModal} onOpenChange={setShowRulesModal} />
			</div>
			<hr className="border-border" />
		</div>
	);
}
