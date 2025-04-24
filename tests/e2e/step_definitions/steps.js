const { I } = inject();
// Add in your custom step files

Given("Je suis sur le site de ChatMD", async () => {
	// From "features/basic.feature" {"line":7,"column":5}
	I.amOnPage("");
	I.see("ChatMD");
});

When("Je demande quelle licence ChatMD utilise", () => {
	// From "features/basic.feature" {"line":8,"column":5}
	I.askTheChatbot("quelle est la licence de ChatMD ?");
});

Then("Le chatbot répond que ChatMD est sous licence MIT", () => {
	// From "features/basic.feature" {"line":9,"column":5}
	I.pressKey("Enter");
	//await I.waitForTypewriterToFinish();
	I.waitForText("licence MIT", 10);
});

Given(
	"J'utilise le chatbot pour la méthodologie d'une dissertation de philosophie",
	() => {
		// From "features/basic.feature" {"line":13,"column":5}
		I.amOnPage("#dissertation-philo");
		I.see("La dissertation en philosophie");
	},
);

When(
	"Je demande si je peux utiliser une structure thèse-antithèse-synthèse",
	() => {
		// From "features/basic.feature" {"line":14,"column":5}
		I.askTheChatbot("Puis-je utiliser un plan thèse antithèse synthèse ?");
	},
);

Then(
	"Le chatbot explique que la structure thèse-antithèse-synthèse n'est pas appropriée pour une dissertation de philosophie",
	() => {
		// From "features/basic.feature" {"line":15,"column":5}
		I.waitForText("Ce n'est pas ce qu'il faut faire !", 10);
	},
);
