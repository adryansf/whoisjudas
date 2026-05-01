import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
	const t = useTranslations();

	return (
		<footer className="border-border border-t bg-black/20 py-4 text-center text-sm text-white/60 backdrop-blur-md">
			<p className="flex flex-wrap items-center justify-center gap-1">
				<span>{t("footer.gloryToGod")}</span>
				<span className="opacity-50">•</span>
				<span>
					{t("footer.developedWith")}
					<span className="mx-1 text-red-500">❤️</span>
					{t("footer.by")}
				</span>
				<Link
					href="https://github.com/adryansf"
					target="_blank"
					rel="noopener noreferrer"
					className="flex items-center gap-1 font-medium text-foreground underline-offset-4 transition-colors hover:underline"
				>
					Adryan Freitas
					<ExternalLink className="size-3" />
				</Link>
			</p>
		</footer>
	);
}
