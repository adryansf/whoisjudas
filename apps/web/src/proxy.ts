import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export function proxy(req: NextRequest) {
	return handleI18nRouting(req);
}

export const config = {
	matcher: ["/", "/(en|pt-BR)/:path*"],
};
