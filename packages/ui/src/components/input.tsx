import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@whoisjudas/ui/lib/utils";
import type * as React from "react";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				"h-8 w-full min-w-0 rounded-md border border-primary bg-white px-2.5 py-1 text-primary-foreground text-xs outline-none transition-colors file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-xs placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-xs dark:border-border dark:bg-primary-foreground dark:text-foreground dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80 dark:placeholder:text-muted-foreground/50",
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
