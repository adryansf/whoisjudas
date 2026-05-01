export interface CharacterRole {
	id: string;
	name: string;
	description?: string;
}

export interface BiblicalStory {
	id: string;
	title: string;
	description: string;
	characters: CharacterRole[];
}

import enStories from "./stories/en.json" with { type: "json" };
import ptBRStories from "./stories/pt-BR.json" with { type: "json" };

const storiesByLocale: Record<"en" | "pt-BR", BiblicalStory[]> = {
	en: enStories.stories,
	"pt-BR": ptBRStories.stories,
};

function secureRandomIndex(max: number): number {
	if (max <= 0) return 0;
	const randomBuffer = new Uint32Array(1);
	crypto.getRandomValues(randomBuffer);
	return (randomBuffer[0] as number) % max;
}

export function loadStories(locale: "en" | "pt-BR"): BiblicalStory[] {
	return storiesByLocale[locale] || storiesByLocale.en;
}

export function getStoryById(
	storyId: string,
	locale: string,
): BiblicalStory | undefined {
	const stories = loadStories(locale as "en" | "pt-BR");
	return stories.find((s) => s.id === storyId);
}

export function getRandomStory(
	locale: string,
	playerCount: number,
): BiblicalStory {
	const stories = loadStories(locale as "en" | "pt-BR");
	const validStories = stories.filter(
		(s) => s.characters.length >= playerCount,
	);

	if (validStories.length === 0) {
		throw new Error(`No stories available for ${playerCount} players`);
	}

	const index = secureRandomIndex(validStories.length);
	const story = validStories[index];
	if (!story) {
		throw new Error(`No stories available for ${playerCount} players`);
	}
	return story;
}

export function getAllStorySummaries(
	locale: string,
): { id: string; title: string }[] {
	const stories = loadStories(locale as "en" | "pt-BR");
	return stories.map((s) => ({ id: s.id, title: s.title }));
}