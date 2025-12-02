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
import { processLightbox } from "./helpers/plugins/lighbox.mjs";
import { textFitForMathBlocks } from "./helpers/plugins/textFitForMathBlocks.mjs";
import { scrollWindow, scrollToLastUserMessage } from "../../utils/ui.mjs";

export async function displayMessage(md, options) {
	const isUser = options && options.isUser;
	const messageHtmlElement = options && options.htmlElement;
	const useCustomTarget = options && options.appendTo;
	const appendTarget = useCustomTarget ? options.appendTo : chatContainer;
	const changeExistingMessage = options && options.changeExistingMessage;
	const disableTypewriter = options && options.disableTypewriter;
	const checkTypeWriter = checkTypewriterPreferences(md);
	md = checkTypeWriter.md;
	const isMessageWithFormElement =
		md.includes("<select ") || md.includes(`<input type="text"`);
	const noTypewriter =
		disableTypewriter ||
		checkTypeWriter.useTypewriter === false ||
		isMessageWithFormElement;
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
			if (!isUser) {
				processLightbox();
			}
			textFitForMathBlocks(messageHtmlElement);
			if (!isUser) {
				// On scrolle vers le bas de la page pour voir la nouvelle réponse, avec un petit délai pour être sûr que le message a été ajouté au DOM
				setTimeout(() => {
					if (noTypewriter && !useCustomTarget) {
						// Si l'effet typewriter a été désactivé et que ce n'est pas un message qui s'affiche à l'intérieur d'un message plus long (composé de prompts), on scrolle au début du dernier message de l'utilisateur
						scrollToLastUserMessage();
					} else {
						// Sinon on scrolle au bas de la page
						scrollWindow({ scrollMode: "instant" });
					}
				}, 10);
			}
			resolve();
		} else {
			startTypeWriter(html, messageHtmlElement).then(() => {
				processLightbox();
				textFitForMathBlocks(messageHtmlElement);
				resolve();
			});
		}
	});
}
