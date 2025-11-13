import { processRandomMessage } from "../../../../app/js/markdown/custom/random.mjs";

const choiceOptionsHTML =
	'<ul class="messageOptions"><li><a href="#choix1">Choix 1</a></li> <li><a href="#choix2">choix 2</a></li> </ul>';

describe("processRandomMessage", () => {
	it("returns the original message when there is no separator", () => {
		const input = "Hello!\nHow are you !";
		const output = processRandomMessage(input);
		expect(output).toBe(input);
	});

	it('picks one element from multiple messages separated by "\n---\n"', () => {
		const variants = [`Hi!`, `Hello!`, `Hey!`];
		const input = `
${variants[0]}
---
${variants[1]}
---
${variants[2]}`;
		const output = processRandomMessage(input);
		expect(variants).toContain(output);
	});

	it("handles messages containing choiceOptions correctly", () => {
		const variants = [
			`Message
variante 1`,
			`Message
variante 2`,
			`Message
variante 3`,
		];
		const input = `
${variants[0]}
---
${variants[1]}
---
${variants[2]}

${choiceOptionsHTML}`;

		const output = processRandomMessage(input);
		const bareOutputWithoutChoiceOptions = output
			.replace(choiceOptionsHTML, "")
			.trim();
		expect(variants).toContain(bareOutputWithoutChoiceOptions);
		expect(output).toContain(`${choiceOptionsHTML}`);
	});

	it("ignores parts that contain only multi-line HTML comments", () => {
		const variants = ["Real message 1", "Real message 2"];
		const input = `
<!--
  This is a multi-line comment
  that should be ignored
-->
---
${variants[0]}
---
<!-- Another comment -->
<!-- Another comment -->

<!-- Another comment -->
---
${variants[1]}

${choiceOptionsHTML}
`;

		const output = processRandomMessage(input).trim();
		const bareOutputWithoutChoiceOptions = output
			.replace(choiceOptionsHTML, "")
			.trim();

		// Vérifie que la sortie ne contient pas de commentaire
		expect(bareOutputWithoutChoiceOptions.startsWith("<!--")).toBeFalse();
		expect(bareOutputWithoutChoiceOptions.endsWith("-->")).toBeFalse();
	});

	it("ignores empty or whitespace-only parts between separators or before choiceOptions", () => {
		const variants = [`Real message 1`, `Real message 2`];
		const input = `
${variants[0]}

---
   
---
${variants[1]}

---

${choiceOptionsHTML}`;

		const output = processRandomMessage(input);
		const bareOutputWithoutChoiceOptions = output
			.replace(choiceOptionsHTML, "")
			.trim();

		// On vérifie que le message choisi est bien l’un des vrais messages
		expect(variants).toContain(bareOutputWithoutChoiceOptions);

		// Et qu’aucune partie vide n’est retournée
		expect(bareOutputWithoutChoiceOptions).not.toBe("");
	});

	it("returns an empty string when the message is empty", () => {
		const input = "";
		const output = processRandomMessage(input);
		expect(output).toBe("");
	});
});
