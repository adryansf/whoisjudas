export function translateError(
	error: string | undefined,
	t: (key: string) => string,
): string {
	if (!error) return t("common.unknownError");

	// Check for error codes in format "CODE:message"
	if (error.includes(":")) {
		const code = error.split(":")[0].toUpperCase();

		switch (code) {
			case "ROOM_NOT_FOUND":
				return t("common.roomNotFound");
			case "PLAYER_NAME_TAKEN":
				return t("common.playerNameTaken");
			case "ROOM_FULL":
				return t("common.roomFull");
			case "NOT_HOST":
				return t("common.notHost");
			case "GAME_NOT_IN_WAITING":
				return t("common.gameNotInWaiting");
			case "ALREADY_STARTED":
				return t("common.gameAlreadyStarted");
			case "INVALID_VOTE":
				return t("common.invalidVote");
			case "ALREADY_VOTED":
				return t("common.alreadyVoted");
			case "NOT_JUDAS":
				return t("common.notJudas");
			case "ALREADY_GUESSED":
				return t("common.alreadyGuessed");
			case "NO_JUDAS_IN_ROOM":
				return t("common.noJudasInRoom");
			default:
				return t("common.unknownError");
		}
	}

	// Fallback for legacy error messages
	const errorKey = error.toLowerCase();

	if (
		errorKey.includes("room not found") ||
		errorKey.includes("sala não encontrada") ||
		errorKey.includes("ROOM_NOT_FOUND")
	) {
		return t("common.roomNotFound");
	}
	if (
		(errorKey.includes("name") && errorKey.includes("taken")) ||
		errorKey.includes("já está em uso") ||
		errorKey.includes("PLAYER_NAME_TAKEN")
	) {
		return t("common.playerNameTaken");
	}
	if (errorKey.includes("room full") || errorKey.includes("ROOM_FULL")) {
		return t("common.roomFull");
	}

	return t("common.unknownError");
}
