import { RedirectType, redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

export default function RootLayout(_props: { children: React.ReactNode }) {
	redirect(`/${defaultLocale}`, RedirectType.replace);
}
