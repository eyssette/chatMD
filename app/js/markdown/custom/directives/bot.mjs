import { pauseTypeWriterMultipleBots } from "../../../shared/constants.mjs";

// Gestion de la directive !Bot: botName pour pouvoir avoir différents bots possibles
export function processDirectiveBot(message, chatMessage) {
	message = message.replace(/!Bot:(.*)/, function (match, botName) {
		if (match && botName) {
			botName = botName.trim().replaceAll(" ", "");
			chatMessage.classList.add("botName-" + botName);
		}
		return "";
	});
	return message;
}

// Possibilité d'avoir plusieurs bots qui répondent dans un même message
export function processMultipleBots(html) {
	const htmlSplitDirectiveBot = html.split("<p>!Bot:");
	const numberOfBots = htmlSplitDirectiveBot.length;
	if (numberOfBots > 1) {
		let newHtml = htmlSplitDirectiveBot[0];
		for (let index = 1; index < numberOfBots; index++) {
			const botMessageContent = htmlSplitDirectiveBot[index].trim();
			const botNameMatch = botMessageContent.match(/(.*?)<\/p>((.|\n)*)/);
			const botName = botNameMatch[1].trim();
			const botMessage = botNameMatch[2].trim();
			newHtml =
				newHtml +
				pauseTypeWriterMultipleBots +
				'<div class="message bot-message botName-' +
				botName +
				'">' +
				botMessage +
				"</div>";
		}
		html = newHtml;
	}
	return html;
}
