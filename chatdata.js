const defaultMessage = "Désolé, je ne comprends pas votre question.";

let md = `# ChatMD

> Bonjour, je suis ChatMD, un chatbot, que vous pouvez configurer par vous-même en Markdown :
> 1. Créez un fichier en markdown et mettez-le en ligne : sur CodiMD, ou sur une forge
> 2. Respectez la syntaxe de ChatMD pour définir votre chatbot
> 
> Votre chatbot est prêt et visible à l'adresse suivante : [https://eyssette.github.io/chatMD/#URL](https://eyssette.github.io/chatMD/#URL) (Mettez l'url de votre fichier à la place de URL)
`;

let chatData;

function getMarkdownContent() {
	const urlMD = window.location.hash.substring(1); // Récupère l'URL du hashtag sans le #
	if (urlMD !== "") {
		fetch(urlMD)
			.then((response) => response.text())
			.then((data) => {
				md = data;
				chatData = parseMarkdown(md);
				/* console.log(chatData); */
				createChatBot(chatData);
			})
			.catch((error) => console.error(error));
	} else {
		createChatBot(parseMarkdown(md));
	}
}

getMarkdownContent();

function parseMarkdown(markdownContent) {
	const lines = markdownContent.split("\n");
	let chatbotData = [];
	let chatbotTitle = [""];
	let initialMessage = [];
	let initialMessageComputed = false;
	let currentH2Title = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	const regexOrderedList = /^\d{1,3}\.\s/;
	let listParsed = false;

	for (let line of lines) {
		if (line.startsWith("# ")) {
			chatbotTitle[0] = line.replace("# ", "").trim();
		} else if (line.startsWith("> ") && !initialMessageComputed) {
			initialMessage.push(line.replace("> ", "").trim());
		} else if (line.startsWith("## ")) {
			initialMessageComputed = true;
			if (currentH2Title) {
				chatbotData.push([
					currentH2Title,
					currentLiItems,
					content,
					lastOrderedList,
				]);
			}
			currentH2Title = line.replace("## ", "").trim(); // Titre h2
			currentLiItems = [];
			lastOrderedList = null;
			listParsed = false;
			content = [];
		} else if (line.startsWith("- ") && !listParsed) {
			currentLiItems.push(line.replace("- ", "").trim());
		} else if (line.match(regexOrderedList)) {
			listParsed = false;
			if (!lastOrderedList) {
				lastOrderedList = [];
			}
			const listContent = line.replace(/^\d+\.\s/, "").trim();
			const link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			lastOrderedList.push([text, link]);
			/* lastOrderedList.push(listContent); */
		} else if (line.length > 0) {
			content.push(line);
			listParsed = true;
		}
	}
	chatbotData.push([
		currentH2Title,
		currentLiItems,
		content.join("\n"),
		lastOrderedList,
	]);
	chatbotData.push(initialMessage.join("\n"));
	chatbotData.push(chatbotTitle);

	return chatbotData;
}
