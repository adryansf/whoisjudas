"use client";

import { Button } from "@whoisjudas/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@whoisjudas/ui/components/dropdown-menu";
import { cn } from "@whoisjudas/ui/lib/utils";
import { LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { type Locale, localeNames, locales } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/routing";

export function LocaleToggle() {
	const locale = useLocale() as Locale;
	const router = useRouter();
	const pathname = usePathname();

	const handleLocaleChange = (newLocale: Locale) => {
		router.replace(pathname, { locale: newLocale });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
				<LanguagesIcon className="h-5 w-5" />
				<span className="sr-only">Toggle language</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => handleLocaleChange(loc)}
						className={cn(locale === loc && "bg-accent")}
					>
						{localeNames[loc]}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
