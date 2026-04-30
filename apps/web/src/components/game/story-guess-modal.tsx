"use client";

import { Button } from "@whoisjudas/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@whoisjudas/ui/components/dialog";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

interface StoryOption {
	id: string;
	title: string;
}

interface StoryGuessModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	possibleStories: StoryOption[];
	onSubmit: (storyId: string) => Promise<void>;
	disabled?: boolean;
}

export function StoryGuessModal({
	open,
	onOpenChange,
	possibleStories,
	onSubmit,
	disabled = false,
}: StoryGuessModalProps) {
	const t = useTranslations();
	const locale = useLocale();
	const [selectedStory, setSelectedStory] = useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async () => {
		if (!selectedStory || isSubmitting) return;
		setIsSubmitting(true);
		try {
			await onSubmit(selectedStory);
			onOpenChange(false);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t("game.guessStory")}</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<p className="text-muted-foreground text-sm">
						{t("game.selectStory")}
					</p>
					<div className="space-y-2">
						{possibleStories
							.slice()
							.sort((a, b) => a.title.localeCompare(b.title, locale))
							.map((story) => (
								<Button
									key={story.id}
									type="button"
									variant={selectedStory === story.id ? "default" : "outline"}
									className="w-full justify-start text-left"
									onClick={() => setSelectedStory(story.id)}
									disabled={disabled || isSubmitting}
								>
									{story.title}
								</Button>
							))}
					</div>
					<Button
						onClick={handleSubmit}
						disabled={!selectedStory || disabled || isSubmitting}
						className="w-full"
					>
						{isSubmitting ? t("game.submitting") : t("game.submitGuess")}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
