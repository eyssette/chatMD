const initialMessage = "Bonjour, en quoi puis-je vous être utile ?";
const defaultMessage = "Désolé, je ne comprends pas votre question.";

md = `# Chatbot Philo

## Définition de la philosophie
- définir
- définition
- ce qu'est la philosophie
- Qu'est-ce que la philosophie ?

Faire de la philosophie, c'est réfléchir à des questions qui portent sur des notions générales et fondamentales de notre existence (la liberté, le bien et le mal, la vérité, …).

## Les grandes démarches
- démarche
- quatre démarches
- 4 démarches

En philosophie, il y a 4 démarches importantes :
- problématiser
- analyser
- argumenter
- mobiliser ses connaissances

1. option 1
2. option 2
`

const chatData = parseMarkdown(md);

/* console.log(chatData); */

function parseMarkdown(markdownContent) {
    const lines = markdownContent.split('\n');
    let chatbotData = [];
    let chatbotTitle = [''];
    let currentH2Title = null;
    let currentLiItems = [];
    let content = []
    let lastOrderedList = null;
    const regexOrderedList = /^\d{1,3}\.\s/;
    let listParsed = false;

    for (let line of lines) {
        if (line.startsWith("# ")) {
        		chatbotTitle[0] = line.replace("# ", "").trim()
        } else if (line.startsWith("## ")) {
            if (currentH2Title) {
                chatbotData.push([currentH2Title, currentLiItems, content, lastOrderedList]);
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
            lastOrderedList.push(line.replace(/^\d+\.\s/, "").trim());
        } else {
        		if (line.length>0) {
            	content.push(line);
              listParsed = true;
           	}
        }
    }
    chatbotData.push([currentH2Title, currentLiItems, content.join('\n'), lastOrderedList])

	chatbotData.push(chatbotTitle); 

    return chatbotData;
}