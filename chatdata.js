const defaultMessage = "Désolé, je ne comprends pas votre question.";

let md = `# ChatMD

> Bonjour, je suis ChatMD, un chatbot, que vous pouvez configurer par vous-même en Markdown :
> 
> - Créez un fichier en markdown et mettez-le en ligne : sur CodiMD, ou sur une forge
> - Respectez la syntaxe de ChatMD pour définir votre chatbot
> 
> Votre chatbot est alors prêt et visible à l'adresse suivante : [https://eyssette.github.io/chatMD/#URL](https://eyssette.github.io/chatMD/#URL) (Mettez l'url de votre fichier à la place de URL)
> 
> 1. [Qu'est-ce que le markdown ?](Markdown)
> 2. [CodiMD, une forge : qu'est-ce que c'est ?](CodiMD et forge)
> 3. [Quelle syntaxe faut-il respecter pour ChatMD ?](Syntaxe)
> 4. [Tu peux me donner un exemple !](Exemple)

## Markdown
- markdown
Le markdown est un format de balisage très léger qui permet d'écrire rapidement du texte formaté.

Pour découvrir le Markown, vous pouvez suivre ce [tutoriel](https://www.markdowntutorial.com/fr/).

## CodiMD et forge
- codimd
- forge
- en ligne

[CodiMD](https://codimd.apps.education.fr/) est un outil pour écrire du markdown en ligne et il est disponible avec vos identifiants académiques sur le [portail Apps Edu](https://portail.apps.education.fr/).

Une forge est un outil plus complet qui permet d'héberger des fichiers texte et de les transformer en site web, en carte mentale, ou encore ici en chatbot ! ChatMD est présent sur la [Forge des Communs Numériques](https://forge.aeif.fr/) et vous pouvez aussi mettre vos fichiers sur cette forge.

## Syntaxe
- syntaxe

La syntaxe pour écrire un chatbot avec chatMD est la suivante : [voir un exemple](#Exemple)

- On définit le titre du chatbot dans un titre de niveau 1
- Le message initial est à mettre dans un bloc de citation après le titre du chatbot
- Les titres de niveau 2 servent à identifier les réponses possibles du chatbot
- Sous chaque titre de niveau 2 : 
	- On indique avec une liste non ordonnée les mots clés ou expressions qui vont déclencher la réponse. On peut éventuellement s'en passer si on guide l'utilisateur avec un choix d'options (voir ci-dessous).
	- On écrit une réponse en Markdown.
	- [Optionnel] On indique avec une liste ordonnée les options possibles. Chaque élément de la liste doit être un lien en Mardown de la forme suivante : \`[intitulé de l'option](identifiant de l'option, qui doit correspondre à l'un des titres de niveau 2)\`.

## Exemple
- exemple
- donner un exemple
- concret
- concrètement

Voici un exemple de chatbot qui a été créé avec ChatMD à partir du travail de Guillaume Berthelot et de Jérémy Navoizat : 

- [Utilisation d'un microscope](https://eyssette.github.io/chatMD/#https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g/download).

Vous pouvez aussi [voir la source](https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g?both) pour mieux comprendre

## Merci
- merci
- remercier
- félicitation
- bravo
- super
- excellent
- génial

Merci ! Si vous aimez ce travail, vous aimerez peut-être aussi les autres outils ou sites que je propose sur [mon site perso](https://eyssette.github.io).


`;

let chatData;

function getMarkdownContent() {
	let urlMD = window.location.hash.substring(1); // Récupère l'URL du hashtag sans le #
	if (urlMD !== "") {
		if (urlMD.startsWith('https://github.com')) {
			urlMD = urlMD.replace('https://github.com', 'https://raw.githubusercontent.com');
				urlMD = urlMD.replace('/blob/', '/');
			}
			if (urlMD.startsWith('https://codimd') && urlMD.indexOf('download')=== -1 ) {
				urlMD = urlMD.replace('?edit','').replace('?both','').replace('?view','')+'/download';
			}
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
	
	let initialMessageComputed = false;
	let currentH2Title = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	const regexOrderedList = /^\d{1,3}\.\s/;
	let listParsed = false;
	let initialMessageContent = [];
	let initialMessageOptions = [];

	for (let line of lines) {
		if (line.startsWith("# ")) {
			chatbotTitle[0] = line.replace("# ", "").trim();
		} else if (line.startsWith("> ") && !initialMessageComputed) {
			line = line.replace(/^> /, "").trim();
			if (line.match(regexOrderedList)) {
				line = line.replace(/^> /, "").trim();
				const listContent = line.replace(/^\d+\.\s/, "").trim();
				const link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
				const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
				initialMessageOptions.push([text, link]);
			} else {
				initialMessageContent.push(line)
			}
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

	const initialMessage = [initialMessageContent,initialMessageOptions];
	chatbotData.push(initialMessage);
	chatbotData.push(chatbotTitle);

	return chatbotData;
}
