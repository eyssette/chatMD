const { I } = inject();

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
	I.waitForElement(".message .messageOptions li:first-child a", 1);
	I.click(".message .messageOptions li:first-child a");
	I.pressKey("Enter");

	I.waitForElement(
		".message:nth-of-type(3) .messageOptions li:nth-child(2) a",
		1,
	);
	I.click(".message:nth-of-type(3) .messageOptions li:nth-child(2) a");
	I.pressKey("Enter");

	I.waitForElement(
		".message:nth-of-type(5) .messageOptions li:nth-child(3) a",
		1,
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
