export function processGoToNextMessage(chatbot, inputText) {
	const shouldGoToNextMessage =
		chatbot.nextMessage.goto != "" && !chatbot.nextMessage.needsProcessing;
	return shouldGoToNextMessage ? chatbot.nextMessage.goto : inputText;
}
