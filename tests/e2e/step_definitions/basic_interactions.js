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

When("Je clique sur le bouton de menu du dernier message", () => {
	I.pressKey("Enter");
	I.click(".message:last-child .messageMenu");
});

Then(
	"Je vois une fenêtre modale avec un lien vers l'historique de la conversation {string}",
	(historyUrl) => {
		I.waitForElement("#systemModal", 5);
		I.seeElement(locate('#systemModal a[href*="' + historyUrl + '"]'));
	},
);

Then(
	"Je vois une fenêtre modale avec un lien vers le titre du dernier message {string}",
	(titleUrl) => {
		I.waitForElement("#systemModal", 5);
		I.seeElement(locate('#systemModal a[href*="' + titleUrl + '"]'));
	},
);

When("Je clique en dehors de la fenêtre modale", () => {
	I.waitForElement("#systemModal", 5);
	I.click("#systemModal", "", { position: { x: 0, y: 0 } });
});

Then("La fenêtre modale n'est plus visible", () => {
	I.dontSeeElement("#systemModal");
});

Then("Je clique sur le bouton de fermeture de la fenêtre modale", () => {
	I.waitForElement("#systemModal", 5);
	I.click("#systemModal .close-button");
});

Then("Le dernier message contient {string}", (messageText) => {
	I.pressKey("Enter");
	I.see(messageText, ".message:last-child");
});

Then("Le dernier message ne contient pas {string}", (messageText) => {
	I.pressKey("Enter");
	I.dontSee(messageText, ".message:last-child");
});
