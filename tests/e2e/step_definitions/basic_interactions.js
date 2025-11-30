const { I } = inject();

import { config } from "../../../app/js/config.mjs";

When("Je demande quelle licence ChatMD utilise", () => {
	I.askTheChatbot("quelle est la licence de ChatMD ?");
});

Then("Le chatbot répond que ChatMD est sous licence MIT", () => {
	I.pressKey("Enter");
	I.waitForText("licence MIT", 10);
});

When(
	"Je demande si je peux utiliser une structure thèse-antithèse-synthèse",
	() => {
		I.askTheChatbot("Puis-je utiliser un plan thèse antithèse synthèse ?");
	},
);

Then(
	"Le chatbot explique que la structure thèse-antithèse-synthèse n'est pas appropriée pour une dissertation de philosophie",
	() => {
		I.waitForText("Ce n'est pas ce qu'il faut faire !", 10);
	},
);

Then("Le texte de présentation de ChatMD s'affiche d'un coup", () => {
	I.waitForText("Qui a créé ChatMD ?", 1);
});

When("Je pose une question qui n'est pas dans la base de connaissances", () => {
	I.askTheChatbot("Qu'est-ce qu'un bronchiosaure ?");
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

When(
	"Je clique sur un bouton d'option de choix après le message initial",
	() => {
		I.pressKey("Enter");
		I.waitForElement(".messageOptions li:first-child a", 0.5);
		I.click(".messageOptions li:first-child a");
	},
);

Then("Le chatbot répond en fonction de l'option choisie", () => {
	I.pressKey("Enter");
	I.waitForText("On peut imaginer de nombreux usages", 10);
});

When("Je clique sur une suite d'options de choix", () => {
	I.pressKey("Enter");
	I.waitForElement(".message .messageOptions li:first-child a", 3);
	I.click(".message .messageOptions li:first-child a");
	I.pressKey("Enter");

	I.waitForElement(
		".message:nth-of-type(3) .messageOptions li:nth-child(2) a",
		3,
	);
	I.click(".message:nth-of-type(3) .messageOptions li:nth-child(2) a");
	I.pressKey("Enter");

	I.waitForElement(
		".message:nth-of-type(5) .messageOptions li:nth-child(3) a",
		3,
	);
	I.click(".message:nth-of-type(5) .messageOptions li:nth-child(3) a");
	I.pressKey("Enter");
});

Then("Le chatbot répond en fonction de la suite d'options choisies", () => {
	I.waitForText(
		"Dans la conclusion, le but est simplement de retracer le cheminement parcouru.",
		10,
	);
});
