const { I } = inject();

import { config } from "../../../app/js/config.mjs";

Then("Le texte de présentation de ChatMD s'affiche d'un coup", () => {
	I.waitForText("Qui a créé ChatMD ?", 1);
});

Then(
	"Le chatbot répond qu'il ne peut pas répondre à cette question car il n'a pas l'information",
	async () => {
		I.pressKey("Enter");
		// On vérifie que le chatbot répond avec un des messages par défaut pour les questions hors-sujet
		const badResponseMessages = config.defaultMessage;
		const lastBotMessage = await I.grabTextFrom(".bot-message:last-child");
		const found = badResponseMessages.some((badResponseMessage) =>
			lastBotMessage.includes(badResponseMessage),
		);
		if (!found) {
			throw new Error(
				"Le chatbot n'a pas répondu avec un message par défaut pour les questions hors-sujet.",
			);
		}
	},
);
Given;
