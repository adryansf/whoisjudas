import { Analytics } from "@vercel/analytics/next";
import { cn } from "@whoisjudas/ui/lib/utils";
import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono, Nunito } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { type Locale, locales } from "@/i18n/config";

import "@/index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const fontSans = Nunito({ subsets: ["latin"], variable: "--font-sans" });
const fontSerif = Cinzel({
	subsets: ["latin"],
	variable: "--font-serif",
});
const fontMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

const descriptions: Record<string, string> = {
	en: "A biblical social deduction game",
	"pt-BR": "Um jogo bíblico de dedução social",
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const description = descriptions[locale] || descriptions.en;

	return {
		title: "Who Is Judas?",
		description,
		manifest: "/manifest.json",
		appleWebApp: {
			capable: true,
			statusBarStyle: "black-translucent",
			title: "Who Is Judas?",
		},
		formatDetection: {
			telephone: false,
		},
		openGraph: {
			title: "Who Is Judas?",
			description,
			type: "website",
		},
	};
}

export const viewport: Viewport = {
	themeColor: "#1a1a1a",
};

export function generateStaticParams() {
	return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	if (!locales.includes(locale as Locale)) {
		notFound();
	}

	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body
				className={cn(
					fontSans.variable,
					fontSerif.variable,
					fontMono.variable,
					"antialiased",
				)}
			>
				<NextIntlClientProvider messages={messages}>
					<Providers>
						<Analytics />
						<div className="grid h-svh grid-rows-[auto_1fr]">
							<Header />
							{children}
						</div>
					</Providers>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
