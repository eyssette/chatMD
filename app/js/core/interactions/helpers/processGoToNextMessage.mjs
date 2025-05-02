export function processGoToNextMessage(chatbot, inputText) {
	const shouldGoToNextMessage =
		chatbot.nextMessage.goto != "" && !chatbot.nextMessage.onlyIfKeywords;
	return shouldGoToNextMessage ? chatbot.nextMessage.goto : inputText;
}
