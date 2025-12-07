import { JSDOM } from "jsdom";

let computeSimilarityScore;

describe("computeSimilarityScore", () => {
	let chatbot;

	beforeEach(async () => {
		const { window } = new JSDOM(`<!DOCTYPE html><body>
	 <h1 id="chatbot-name">&nbsp;</h1>
	 <main>
		  <div id="chat" class="chat-container" role="region" aria-label="Zone de conversation">
				<!-- La conversation sera affichée ici -->
		  </div>
		  <div id="controls">
				<div id="input-container">
					 <label id="user-input-label" class="sr-only" for="user-input">Écrivez votre message</label>
					 <div id="user-input" contenteditable="true" placeholder="Écrivez votre message" tabindex="0" role="textbox" aria-labelledby="user-input-label" title="Écrivez votre message"></div>
				</div>
				<button id="send-button" type="button">Envoyer</button>
		  </div>
	 </main>
	 <footer id="footer">
		  ChatMD – Outil libre & gratuit créé par <a href="https://eyssette.forge.apps.education.fr/">Cédric Eyssette</a>
	 </footer>
	 <script src="script.min.js"></script>
</body>`);

		global.window = window;
		global.document = window.document;

		// Importer le module APRÈS avoir créé global.document
		const mod = await import(
			"../../../../../../app/js/core/interactions/helpers/findBestResponse/computeSimilarityScore.mjs"
		);
		computeSimilarityScore = mod.computeSimilarityScore;

		chatbot = {
			responses: [],
			nextMessage: {
				needsProcessing: false,
				goto: null,
				selected: null,
				ignoreKeywords: false,
			},
			vectorChatBotResponses: [],
		};
	});

	it("returns no match when there are no responses", () => {
		const result = computeSimilarityScore(chatbot, "contenu pour tester");

		expect(result.bestMatch).toBe(null);
		expect(result.bestMatchScore).toBe(0);
		expect(result.indexBestMatch).toBeUndefined();
	});

	it("returns no match when responses have no titles", () => {
		chatbot.responses = [{ content: "Réponse sans titre", title: "" }];
		const result = computeSimilarityScore(chatbot, "contenu pour tester");

		expect(result.bestMatch).toBe(null);
		expect(result.bestMatchScore).toBe(0);
	});

	it("finds the best matching response based on keywords", () => {
		chatbot.responses = [
			{
				title: "Horaires",
				keywords: ["horaire", "ouverture", "fermé"],
				content: "Nous sommes ouverts de 9h à 18h",
			},
			{
				title: "Contact",
				keywords: ["téléphone", "appeler"],
				content: "Voici notre numéro de téléphone : xx-xx-xx-xx-xx",
			},
		];
		const result = computeSimilarityScore(
			chatbot,
			"Comment faire pour vous appeler ?",
		);

		expect(result.bestMatch).toBe(
			"Voici notre numéro de téléphone : xx-xx-xx-xx-xx",
		);
		expect(result.bestMatchScore).toBeGreaterThan(0);
		expect(result.indexBestMatch).toBe(1);
	});

	it("gives higher score for longer matching keywords", () => {
		chatbot.responses = [
			{
				title: "Test1",
				keywords: ["info"],
				content: "Réponse courte",
			},
			{
				title: "Test2",
				keywords: ["information"],
				content: "Réponse longue",
			},
			{
				title: "Test3",
				keywords: ["informationnel"],
				content: "Réponse encore plus longue",
			},
		];

		const result = computeSimilarityScore(chatbot, "information");

		expect(result.indexBestMatch).toBe(1);
	});

	it("handles accents in keywords and user input", () => {
		chatbot.responses = [
			{
				title: "Info",
				keywords: ["café"],
				content: "Réponse café",
			},
		];

		const result = computeSimilarityScore(chatbot, "cafe");

		expect(result.bestMatchScore).toBeGreaterThan(0);
	});

	it("includes title in matching when no keywords", () => {
		chatbot.responses = [
			{
				title: "Horaires",
				keywords: [],
				content: "Les horaires sont affichés",
			},
		];

		const result = computeSimilarityScore(chatbot, "horaires");

		expect(result.bestMatchScore).toBe(30.8);
	});

	it("penalizes responses with negative keywords present in user input", () => {
		chatbot.responses = [
			{
				title: "Réponse1",
				keywords: ["! non merci", "aide", "aidant", "aidez-moi"],
				content: "Première réponse",
			},
			{
				title: "Réponse2",
				keywords: ["aide"],
				content: "Deuxième réponse",
			},
		];

		const result = computeSimilarityScore(chatbot, "aide non merci");

		expect(result.indexBestMatch).toBe(1);
	});

	it("goes to the specified response with !Next", () => {
		chatbot.responses = [
			{
				title: "Etape1",
				keywords: [],
				content: "Première étape",
			},
			{
				title: "Etape2",
				keywords: [],
				content: "Deuxième étape",
			},
		];
		chatbot.nextMessage.needsProcessing = true;
		chatbot.nextMessage.goto = "Etape2";

		const result = computeSimilarityScore(chatbot, "contenu pour tester");

		expect(result.indexBestMatch).toBe(1);
	});

	it("prioritizes the !Next response even if keywords match another response better", () => {
		chatbot.responses = [
			{
				title: "Autre",
				keywords: ["argument", "argumentation", "argumenter", "arguments"],
				content: "Autre réponse",
			},
			{
				title: "Cible",
				keywords: ["argument"],
				content: "Réponse ciblée",
			},
		];
		chatbot.nextMessage.needsProcessing = true;
		chatbot.nextMessage.goto = "Cible";

		const result = computeSimilarityScore(chatbot, "argument");

		expect(result.indexBestMatch).toBe(1);
	});

	it("takes keywords into account with !Next directive if ignoreKeywords is set to false", () => {
		chatbot.responses = [
			{
				title: "Cible",
				keywords: ["specifique"],
				content: "Réponse avec keyword",
			},
		];
		chatbot.nextMessage.needsProcessing = true;
		chatbot.nextMessage.goto = "Cible";
		chatbot.nextMessage.ignoreKeywords = false;

		const resultWithKeyword = computeSimilarityScore(chatbot, "specifique");
		const resultWithoutKeyword = computeSimilarityScore(chatbot, "autre");

		expect(resultWithKeyword.bestMatchScore).toBeGreaterThan(
			resultWithoutKeyword.bestMatchScore,
		);
		expect(resultWithKeyword.indexBestMatch).toBe(0);
		expect(resultWithoutKeyword.indexBestMatch).not.toBe(0);
	});

	it("does not take case into account with !Next directive if ignoreKeywords is false", () => {
		chatbot.responses = [
			{
				title: "Cible",
				keywords: ["Spécifique"],
				content: "Réponse avec keyword",
			},
		];
		chatbot.nextMessage.needsProcessing = true;
		chatbot.nextMessage.goto = "Cible";
		chatbot.nextMessage.ignoreKeywords = false;

		const resultWithExactCase = computeSimilarityScore(chatbot, "Spécifique");
		const resultWithDifferentCase = computeSimilarityScore(
			chatbot,
			"spécifique",
		);

		expect(resultWithExactCase.indexBestMatch).toBe(0);
		expect(resultWithDifferentCase.indexBestMatch).toBe(0);
	});

	it("does not take into account accents with !Next directive if ignoreKeywords is false", () => {
		chatbot.responses = [
			{
				title: "Cible",
				keywords: ["café"],
				content: "Réponse avec keyword",
			},
		];
		chatbot.nextMessage.needsProcessing = true;
		chatbot.nextMessage.goto = "Cible";
		chatbot.nextMessage.ignoreKeywords = false;

		const resultWithAccent = computeSimilarityScore(chatbot, "café");
		const resultWithoutAccent = computeSimilarityScore(chatbot, "cafe");

		expect(resultWithAccent.indexBestMatch).toBe(0);
		expect(resultWithoutAccent.indexBestMatch).toBe(0);
	});

	it("gives a higher score for exact match and a lower score for partial match in !Next mode", () => {
		chatbot.responses = [
			{
				title: "contenu pour tester",
				keywords: ["contenu pour tester"],
				content: "Réponse test",
			},
		];
		chatbot.nextMessage.needsProcessing = true;
		chatbot.nextMessage.goto = "contenu pour tester";

		const resultExact = computeSimilarityScore(chatbot, "contenu pour tester");
		const resultPartiel = computeSimilarityScore(chatbot, "testabc");

		expect(resultExact.bestMatchScore).toBeGreaterThan(
			resultPartiel.bestMatchScore,
		);
	});

	it("checks only the selected response with !SelectNext", () => {
		chatbot.responses = [
			{
				title: "Option1",
				keywords: ["test", "tests", "tester", "testons"],
				content: "Première option",
			},
			{
				title: "Option2",
				keywords: ["test"],
				content: "Deuxième option",
			},
		];
		chatbot.nextMessage.selected = "Option2";

		const result = computeSimilarityScore(chatbot, "testons");

		expect(result.indexBestMatch).toBe(1);
	});

	it("finds approximate matches with minor typos", () => {
		chatbot.responses = [
			{
				title: "contenu pour tester",
				keywords: ["bonjour"],
				content: "Réponse bonjour",
			},
		];

		const result = computeSimilarityScore(chatbot, "bonjur");

		expect(result.bestMatchScore).toBeGreaterThan(0);
	});

	it("ignores or penalizes greatly short keywords in user input", () => {
		chatbot.responses = [
			{
				title: "contenu pour tester",
				keywords: ["bonjour", "poteau"],
				content: "Réponse",
			},
		];

		const result = computeSimilarityScore(chatbot, "bon pote");

		expect(result.bestMatchScore).toBeLessThan(5);
	});

	it("does not ignore short keywords", () => {
		chatbot.responses = [
			{
				title: "contenu pour tester",
				keywords: ["art"],
				content: "Réponse courte",
			},
		];

		const result = computeSimilarityScore(
			chatbot,
			"j'aime ce qui est artistique",
		);

		expect(result.bestMatchScore).toBe(30.3);
	});

	it("matches keywords regardless of case", () => {
		chatbot.responses = [
			{
				title: "contenu pour tester",
				keywords: ["BOnJoUR"],
				content: "Salut",
			},
		];

		const result = computeSimilarityScore(chatbot, "bonjour");

		expect(result.bestMatchScore).toBeGreaterThan(0);
	});

	it("selects the response with the highest bestMatchScore", () => {
		chatbot.responses = [
			{
				title: "Faible",
				keywords: ["correspondance", "moins", "importante"],
				content: "Réponse faible",
			},
			{
				title: "Forte",
				keywords: ["correspondance", "plus", "importante"],
				content: "Réponse forte",
			},
		];

		const result = computeSimilarityScore(
			chatbot,
			"correspondance plus importante",
		);

		expect(result.indexBestMatch).toBe(1);
		expect(result.bestMatch).toBe("Réponse forte");
	});

	it("calculates correctly when user input is close to keywords", () => {
		chatbot.responses = [
			{
				title: "Test",
				keywords: ["test", "testing", "tester"],
				content: "Réponse test",
			},
		];

		const result1 = computeSimilarityScore(chatbot, "testons");
		const result2 = computeSimilarityScore(chatbot, "test");
		const result3 = computeSimilarityScore(chatbot, "tester");
		const result4 = computeSimilarityScore(chatbot, "testing");
		const result5 = computeSimilarityScore(chatbot, "castings");

		expect(result1.bestMatchScore).toBe(60.8);
		expect(result2.bestMatchScore).toBe(60.8);
		expect(result3.bestMatchScore).toBe(91.4);
		expect(result4.bestMatchScore).toBe(91.5);
		expect(result2).toBeGreaterThanOrEqual(result1);
		expect(result3).toBeGreaterThanOrEqual(result2);
		expect(result4).toBeGreaterThanOrEqual(result3);
		expect(result5.bestMatchScore).toBeCloseTo(0.47, 2);
	});
});
