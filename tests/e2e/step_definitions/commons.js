const { I } = inject();

Given("Je lance ChatMD {string}", async (link, rawsource) => {
	const src = rawsource ? rawsource.content.trim() : link ? link.trim() : "#";
	const isRaw = rawsource && rawsource.content ? true : false;
	I.launchChatmd(src, isRaw);
});

When("Je demande {string}", async (question) => {
	I.askTheChatbot(question);
});

Given("Je clique sur le bouton {string}", async (buttonText) => {
	I.pressKey("Enter");
	I.waitForText(buttonText, 10);
	I.click(locate(".messageOptions li a").withText(buttonText));
});

Then("Le chatbot répond {string}", async (answer, listPossibleAnswers) => {
	I.pressKey("Enter");
	// On attend que le bot ait répondu
	const lastBotMessage = await locate(".bot-message").last();
	I.waitForElement(lastBotMessage, 10);
	// S'il y a une liste de réponses possibles, on vérifie que la réponse du bot en fait partie
	if (listPossibleAnswers && Array.isArray(listPossibleAnswers.rows)) {
		// On crée un tableau avec les réponses possibles
		const listPossibleAnswersArray = listPossibleAnswers.rows.map(
			(row) => row.cells[0].value,
		);
		// On récupère le contenu du dernier message du bot
		const lastBotMessageContent = await I.grabTextFrom(lastBotMessage);
		// On vérifie si le message du bot correspond à une des réponses possibles
		const found = listPossibleAnswersArray.some((possibleAnswer) =>
			lastBotMessageContent.includes(possibleAnswer),
		);
		// Si aucune réponse possible ne correspond, on lance une erreur
		if (!found) {
			throw new Error(
				"Le chatbot n'a pas répondu avec un des messages attendus.\n" +
					`Réponse obtenue : ${lastBotMessage}\n` +
					`Réponses possibles : ${JSON.stringify(listPossibleAnswers, null, 2)}`,
			);
		}
		return;
	}
	// S'il n'y a pas de liste de réponses possibles, on vérifie que la réponse du bot correspond à la réponse unique attendue
	I.waitForText(answer, 10, ".bot-message:last-child");
});

Then("Le chatbot répond exactement {string}", async (answer) => {
	I.pressKey("Enter");
	// On attend que le bot ait répondu
	const lastBotMessage = await locate(".bot-message").last();
	I.waitForElement(lastBotMessage, 10);
	// On vérifie que la réponse HTML du bot correspond exactement à la réponse unique attendue
	const lastBotMessageContent = await I.grabHTMLFrom(lastBotMessage);
	if (
		lastBotMessageContent.trim().replace("</li> </ul>", "</li></ul>") !==
		answer.trim().replace("</li> </ul>", "</li></ul>")
	) {
		throw new Error(
			"Le chatbot n'a pas répondu avec le message attendu.\n" +
				`Réponse obtenue : ${lastBotMessageContent}\n` +
				`Réponse attendue : ${answer}`,
		);
	}
});

Given("J'appuie sur la touche {string}", (string) => {
	I.pressKey(string);
});

Given("J'appuie sur le bouton “Envoyer”", () => {
	I.click("#send-button");
});

Then("{string} n'existe pas", (selector) => {
	if (selector == "Le message initial") {
		selector = ".bot-message > *:not(ul)";
	}
	I.dontSeeElement(selector);
});
