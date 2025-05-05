import { yaml } from "../../markdown/custom/yaml.mjs";
import { markdownToHTML } from "../../markdown/parser.mjs";
import { processCopyCode } from "./helpers/plugins/copyCode.mjs";
import { startTypeWriter } from "./typewriter/start.mjs";
import { checkTypewriterPreferences } from "./typewriter/checkPreferences.mjs";
import { cleanTypewriterSyntax } from "./typewriter/sanitize.mjs";
import { appendMessageToContainer } from "./helpers/dom.mjs";
import { waitForKaTeX } from "./helpers/plugins/waitForKatex.mjs";
import { convertLatexExpressions } from "../../markdown/latex.mjs";
import { processMultipleBots } from "../../markdown/custom/directives/bot.mjs";
import { chatContainer } from "../../shared/selectors.mjs";

export async function displayMessage(md, options) {
	const isUser = options && options.isUser;
	const messageHtmlElement = options && options.htmlElement;
	const appendTarget =
		options && options.appendTo ? options.appendTo : chatContainer;
	const changeExistingMessage = options && options.changeExistingMessage;
	const checkTypeWriter = checkTypewriterPreferences(md);
	md = checkTypeWriter.md;
	const isMessageWithSelectElement = md.includes("<select ");
	const noTypewriter =
		checkTypeWriter.useTypewriter === false || isMessageWithSelectElement;
	let html = markdownToHTML(md);
	if (yaml && yaml.bots && !isUser) {
		html = processMultipleBots(html);
	}
	if (yaml && yaml.maths) {
		await waitForKaTeX();
		html = convertLatexExpressions(html);
	}

	return new Promise((resolve) => {
		if (!html) return resolve();

		// On ajoute dans le DOM le message HTML dans le container spécifié
		if (!changeExistingMessage)
			appendMessageToContainer(messageHtmlElement, appendTarget);

		html = isUser ? html : processCopyCode(html);

		// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
		// Pas d'effet machine à écrire s'il a été désactivé par l'utilisateur ou le créateur du chatbot
		if (isUser || noTypewriter) {
			// Si on n'utilise pas l'effet typewriter, on supprime la syntaxe spécifique à cet effet dans le message
			messageHtmlElement.innerHTML = cleanTypewriterSyntax(html);
			resolve();
		} else {
			startTypeWriter(html, messageHtmlElement).then(() => resolve());
		}
	});
}
