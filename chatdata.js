const defaultMessage =  [
"Désolé, je ne comprends pas votre question.",
"Pardonnez-moi, mais je ne saisis pas votre demande.",
"Excusez-moi, je ne parviens pas à comprendre ce que vous demandez.",
"Je suis navré, mais je ne parviens pas à saisir votre question.",
"Malheureusement, je ne suis pas en mesure de comprendre votre question.",
"Je suis désolé, mais je ne saisis pas votre question.",
"Pardonnez-moi, mais je ne saisis pas le sens de votre question.",
"Je m'excuse, mais je ne parviens pas à saisir votre demande. Pouvez-vous reformuler votre question, s'il vous plaît ?",
"Je ne suis pas sûr de comprendre ce que vous demandez. Pouvez-vous expliquer davantage ?",
"Je ne peux pas répondre à votre question telle qu'elle est formulée. Pouvez-vous la poser différemment ?",
"Votre question ne semble pas correspondre à mes capacités actuelles. Pourriez-vous la reformuler autrement ?",
"Je n'ai malheureusement pas compris votre requête.",
"Je suis désolé, je ne suis pas capable de répondre.",
"Malheureusement, je ne peux pas répondre à votre question.",
"Malheureusement je n'arrive pas à comprendre votre requête.",
"Excusez-moi, je ne comprends pas votre requête.",
"Excusez-moi, je n'arrive pas à répondre à votre question.",
"Je ne parviens pas à répondre à votre requête. Veuillez m'excuser."
]

let md = `# ChatMD

> Bonjour, je suis ChatMD, un chatbot, que vous pouvez configurer par vous-même en Markdown :
> 
> - Créez un fichier en Markdown et mettez-le en ligne : sur CodiMD, ou sur une forge
> - Respectez la syntaxe de ChatMD pour définir votre chatbot
> 
> Votre chatbot est alors prêt et visible à l'adresse suivante : [https://eyssette.forge.aeif.fr/chatMD/#URL](https://eyssette.forge.aeif.fr/chatMD/#URL) (Mettez l'url de votre fichier à la place de URL)
> 
> 1. [Qu'est-ce que le Markdown ?](Markdown)
> 2. [CodiMD, une forge : qu'est-ce que c'est ?](CodiMD et forge)
> 3. [Quelle syntaxe faut-il respecter pour ChatMD ?](Syntaxe)
> 4. [Tu peux me donner un exemple !](Exemple)
> 5. [À quoi ça sert ?](À quoi ça sert ?)

## Markdown
- markdown
Le Markdown est un format de balisage très léger qui permet d'écrire rapidement du texte formaté.

Pour découvrir le Markdown, vous pouvez suivre ce [tutoriel](https://www.markdowntutorial.com/fr/).

## CodiMD et forge
- codimd
- forge
- en ligne

[CodiMD](https://codimd.apps.education.fr/) est un outil pour écrire du Markdown en ligne et il est disponible avec vos identifiants académiques sur le [portail Apps Edu](https://portail.apps.education.fr/).

Une forge est un outil plus complet qui permet d'héberger des fichiers texte et de les transformer en site web, en carte mentale, ou encore ici en chatbot ! ChatMD est présent sur la [Forge des Communs Numériques Éducatifs](https://forge.aeif.fr/) et vous pouvez aussi mettre vos fichiers sur cette forge.

## Syntaxe
- syntaxe
- règles
- comment

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

- [Utilisation d'un microscope](https://eyssette.forge.aeif.fr/chatMD/#https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g).

Vous pouvez aussi [voir la source](https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g?both) pour mieux comprendre

## À quoi ça sert ?
- pourquoi
- sert
- intérêt
- servir
- objectif
- but
- en faire
- tutoriel
- histoire
- méthod
- révision

On peut imaginer plusieurs usages de chatMD :
- Tutoriel pour un outil informatique
- Histoire dont vous êtes le héros
- Guide méthodologique
- Soutien pour la révision d'un cours
- …

On peut faire travailler des élèves ensemble sur un CodiMD, ou bien travailler collaborativement entre collègues, en tant que prof ou dans le cadre d'une formation.

Si vous avez trouvé des idées intéressantes, n'hésitez pas à les partager avec moi. Vous pouvez me contacter sur [Mastodon](https://scholar.social/@eyssette).

## Merci
- merci
- remercier
- remercie
- félicitations
- félicit
- bravo
- super
- excellent
- génial
- wow
- chouette
- sympa

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
	const regexOrderedList = /^\d{1,3}\.\s\[/;
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
			content.push(line+'\n');
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
