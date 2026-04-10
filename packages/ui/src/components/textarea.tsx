import { cn } from "@whoisjudas/ui/lib/utils";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"field-sizing-content flex min-h-16 w-full rounded-md border border-primary bg-white px-2.5 py-2 text-primary-foreground text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:border-border dark:bg-primary-foreground dark:text-foreground dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80 dark:placeholder:text-muted-foreground/50",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
