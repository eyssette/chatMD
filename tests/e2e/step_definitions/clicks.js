const { I } = inject();

Given("Je suis sur le site de ChatMD", async () => {
	I.amOnPage("");
	I.see("ChatMD");
});

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

Given(
	"J'utilise le chatbot pour la méthodologie d'une dissertation de philosophie",
	() => {
		I.amOnPage("#dissertation-philo");
		I.see("La dissertation en philosophie");
	},
);

When("Je clique sur une suite d'options de choix", () => {
	I.pressKey("Enter");
	I.waitForElement(".message .messageOptions li:first-child a", 0.5);
	I.click(".message .messageOptions li:first-child a");
	I.pressKey("Enter");

	I.waitForElement(
		".message:nth-of-type(3) .messageOptions li:nth-child(2) a",
		0.5,
	);
	I.click(".message:nth-of-type(3) .messageOptions li:nth-child(2) a");
	I.pressKey("Enter");

	I.waitForElement(
		".message:nth-of-type(5) .messageOptions li:nth-child(3) a",
		0.5,
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
