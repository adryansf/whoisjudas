import { cn } from "@whoisjudas/ui/lib/utils";
import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono, Nunito } from "next/font/google";
import Head from "next/head";
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

export const metadata: Metadata = {
	title: "Who Is Judas?",
	description: "A biblical social deduction game",
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
		description: "A biblical social deduction game",
		type: "website",
	},
};

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
			<Head>
				<meta name="apple-mobile-web-app-title" content="Who Is Judas?" />
				<meta name="mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta
					name="apple-mobile-web-app-status-bar-style"
					content="black-translucent"
				/>
				<link rel="apple-touch-icon" href="/icon-192.png" />
			</Head>
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
