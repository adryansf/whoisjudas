"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LocaleToggle } from "./locale-toggle";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
	const t = useTranslations();
	const links = [{ to: "/", label: t("nav.home") }] as const;

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
					<LocaleToggle />
					<ModeToggle />
				</div>
			</div>
			<hr className="border-border" />
		</div>
	);
}
