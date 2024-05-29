let defaultMessage = [
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
	"Je ne parviens pas à répondre à votre requête. Veuillez m'excuser.",
];

const badWordsMessage = [
	"Même si je ne suis qu'un chatbot, merci de vous adresser à moi avec un langage approprié",
	"Je préférerais que nous restions courtois dans notre communication.",
	"Les insultes ne sont pas nécessaires. Comment puis-je vous aider autrement ?",
	"Essayons de garder une conversation respectueuse.",
	"Je préfère une conversation respectueuse et productive.",
	"Je vous encourage à reformuler votre question ou commentaire de manière respectueuse.",
	"Les mots offensants ne sont pas nécessaires ici. Comment puis-je vous aider de manière constructive ?",
	"Restons courtois dans nos échanges, s'il vous plaît.",
	"Injures et grossièretés ne mènent nulle part. Comment puis-je vous assister ?",
	"Je suis ouvert à la discussion, mais veuillez garder un langage respectueux.",
	"Essayons de communiquer de manière civilisée !",
];

let md = `---
gestionGrosMots: true
---
# ChatMD

Bonjour, je suis ChatMD, un chatbot, que vous pouvez configurer par vous-même en Markdown :

- Créez un fichier en Markdown et mettez-le en ligne : sur CodiMD, ou sur une forge
- Respectez la syntaxe de ChatMD pour définir votre chatbot

Votre chatbot est alors prêt et visible à l'adresse suivante : [https://chatmd.forge.apps.education.fr/#URL](https://chatmd.forge.apps.education.fr/#URL) (Mettez l'url de votre fichier à la place de URL)

1. [Qu'est-ce que le Markdown ?](Markdown)
2. [CodiMD, une forge : qu'est-ce que c'est ?](CodiMD et forge)
3. [Quelle syntaxe faut-il respecter pour ChatMD ?](Syntaxe)
4. [Tu peux me donner des exemples !](Exemples)
5. [Quelles sont les options de configuration plus avancées ?](Options de configuration)
6. [À quoi ça sert ?](À quoi ça sert ?)
7. [Comment utiliser ChatMD en tant que widget ?](Utilisation sous la forme d'un widget)

## Markdown
- markdown
Le Markdown est un format de balisage très léger qui permet d'écrire rapidement du texte formaté.

Pour découvrir le Markdown, vous pouvez suivre ce [tutoriel](https://www.markdowntutorial.com/fr/).

## CodiMD et forge
- codimd
- codi
- forge
- en ligne

[CodiMD](https://codimd.apps.education.fr/) est un outil pour écrire du Markdown en ligne et il est disponible avec vos identifiants académiques sur le [portail Apps Edu](https://portail.apps.education.fr/).

Une forge est un outil plus complet qui permet d'héberger des fichiers texte et de les transformer en site web, en carte mentale, ou encore ici en chatbot ! ChatMD est présent sur la [Forge des Communs Numériques Éducatifs](https://forge.apps.education.fr/) et vous pouvez aussi mettre vos fichiers sur cette forge.

## Syntaxe
- syntaxe
- règles
- comment

La syntaxe pour écrire un chatbot avec chatMD est la suivante, mais c'est peut-être plus simple de [voir des exemples](#Exemples) ou bien de [récupérer un modèle](https://codimd.apps.education.fr/mBGbHStJSVOSrlGfGb981A?both).

\`\`\`
​# Titre du chatbot
​
Message initial
​
1​. [Premier choix](Réponse 1)
2​. [Deuxième choix](Réponse 2)
​
​## Réponse 1
- déclencheur 1 (optionnel)
- déclencheur 2 (optionnel)
​
Contenu de la réponse
​
1​. [Proposition 1](Titre Proposition 1)
2​. [Proposition 2](Titre Proposition 2)
\`\`\`

Dans le message initial et le contenu de chaque réponse, **on peut utiliser toute la syntaxe Markdown** : intégrer des images, des vidéos, des iframes, et même utiliser des balises HTML.

Les **titres de niveau 2** servent à identifier les réponses possibles du chatbot

### Deux manières pour déclencher une réponse

:::info L'utilisateur va devoir cliquer sur des propositions
On indique alors en fin d'un message les propositions possibles, avec une liste ordonnée en Markdown.
Chaque élément de la liste doit avoir la forme suivante :
\`[intitulé de l'option qui s'affiche pour l'utilisateur](titre de la réponse correspondante dans le fichier en Markdown)\`.
:::

:::info L'utilisateur va poser une question
Pour permettre au chatbot de renvoyer la réponse la plus adéquate, on indique sous le titre de la réponse les mots clés ou expressions qui vont renforcer le choix de cette réponse. On utilise une liste non ordonnée en Markdown.
:::

C'est recommandé de combiner ces 2 options pour être sûr que l'utilisateur trouve les réponses à ses questions !



1. [Voir aussi les options de configuration plus avancées](Options de configuration)

## Options de configuration
- yaml
- en-tête
- en-tête yaml
- options
- avancé
- avatar
- mathématiques
- gros mots
- insulte
- style
- apparence

On peut ajouter un en-tête yaml à son fichier Markdown :

- \`clavier: false\` désactive le champ d'entrée clavier si on souhaite simplement guider l'utilisateur avec les options proposées en fin de chaque réponse.
- \`rechercheContenu: true\` permet d'ajouter une recherche de comparaison de l'entrée de l'utilisateur avec le contenu de chaque réponse
- \`style: a{color:red}\` permet d'ajouter des styles CSS personnalisés.
- \`gestionGrosMots: true\` permet de détecter les gros mots envoyés par l'utilisateur et de formuler une réponse adéquate si l'utilisateur en utilise
- \`maths: true\` permet d'écrire des formules mathématiques en Latex avec la syntaxe \`$Latex$\` ou \`$$Latex$$\`
- \`avatar: URL\` permet de changer l'avatar du chatbot (il faut mettre l'url de son image à la place de URL)
- \`footer: false\` permet de supprimer le footer
- \`theme: bubbles\` permet d'utiliser un thème CSS particulier (ici le thème "bubbles")

Le chatbot peut aussi sélectionner de manière aléatoire plusieurs versions d'une même réponse si on sépare ces différentes versions avec le séparateur \`---\`.

On peut également afficher les propositions en fin de message de manière aléatoire : si on met "1. proposition" : la proposition reste à la place indiquée, alors que si on met "1) proposition" : la proposition est réordonnée de manière aléatoire.

D'autres options plus avancées dans l'en-tête yaml :
- \`messageParDéfaut: ["message 1", "message 2", "message 3"]\` permet de modifier le message par défaut qui s'affiche aléatoirement quand le chatbot n'a pas trouvé de réponse pertinente 
- \`titresRéponses: ["### ", "#### "]\` permet de changer les identifiants possibles des réponses du chatbot si on veut pouvoir structurer les réponses du chatbot dans son document
- On peut aussi définir des variables que l'on peut utiliser dans son chatbot ainsi : &#64;{maVariable1}
\`\`\`
variables:
	maVariable1: "Ceci est ma variable 1"
	maVariable2: "Ceci est ma variable 2"
\`\`\`

## Exemples
- exemple
- donner un exemple
- concret
- concrètement
- modèle
- template

Voici un modèle que vous pouvez récupérer pour construire votre chatbot : [modèle à récupérer](https://codimd.apps.education.fr/mBGbHStJSVOSrlGfGb981A?both)

Voici quelques exemple de chatbot créés avec ChatMD : 

- [Méthode de la dissertation en philosophie](https://chatmd.forge.apps.education.fr/#https://eyssette.forge.apps.education.fr/chatbot/dissertation-philosophie.md)
- [Utilisation d'un microscope](https://chatmd.forge.apps.education.fr/#https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g) : un chatbot créé à partir du travail de  Sylvain Tissier, Guillaume Berthelot et de Jérémy Navoizat [voir la source](https://codimd.apps.education.fr/xGNHIJSeTVCk6FHas-_71g?both)

## À quoi ça sert ?
- à quoi ça sert ?
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
- utilité
- utile

On peut imaginer plusieurs usages de chatMD :
- Tutoriel pour un outil informatique
- Histoire dont vous êtes le héros
- Guide méthodologique
- Soutien pour la révision d'un cours
- Discussion avec un personnage historique …

On peut faire travailler des élèves ensemble sur un CodiMD, ou bien travailler collaborativement entre collègues, en tant que prof ou dans le cadre d'une formation.

Si vous avez trouvé des idées intéressantes, n'hésitez pas à les partager avec moi. Vous pouvez me contacter sur [Mastodon](https://scholar.social/@eyssette).

## Utilisation sous la forme d'un widget
- widget
- dans son site
- dans mon site
- intégrer
- intégration

Vous pouvez intégrer chatMD dans une page HTML en insérant ce code en bas de page dans l'élément \`\`\`body\`\`\`.

\`\`\`js
<script id="chatmdWidgetScript"
src="https://chatmd.forge.apps.education.fr/widget.min.js" 
data-chatbot="URL_DE_VOTRE_CHATBOT"></script>
\`\`\`

Il faut bien sûr remplacer \`\`\`URL_DE_VOTRE_CHATBOT\`\`\` par l'URL de la source de votre chatbot.

On peut customiser l'image du widget en ajoutant \`data-image="URL_IMAGE"\` comme paramètre.

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
- cool

Merci ! Si vous aimez ce travail, vous aimerez peut-être aussi les autres outils ou sites que je propose sur [mon site perso](https://eyssette.forge.apps.education.fr).


`;


// Raccourcis vers des chatbots particuliers
const shortcuts = [
	["dissertation-philo","https://raw.githubusercontent.com/eyssette/chatbot/main/dissertation-philosophie.md"]
];


// Paramètres dans l'en-tête YAML
let yamlStyle = "";
let yamlUserInput = true;
let yamlSearchInContent = false;
let yamldetectBadWords = false;
let yamlMaths = false;
let yamlFooter = true;
let yamlTheme = "";
let yamlDynamicContent = false;
let yamlTypeWriter = true;
let yamlObfuscate = false;

let yamlUseLLM;
let yamlUseLLMurl;
let yamlUseLLMmodel;
let yamlUseLLMalways = false;
const defaultSystemPrompt = "Tu es un assistant efficace qui réponds en français et pas dans une autre langue. Les phrases de réponse doivent être courtes et claires."
let yamlUseLLMsystemPrompt = defaultSystemPrompt;
const defaultMaxTokens = 100;
let yamlUseLLMmaxTokens = defaultMaxTokens;
let yamlUseLLMinformations = '';
let yamlUseLLMpreprompt = '';
let yamlUseLLMpostprompt = "\nN'oublie pas de répondre en français.";
const defaultRAGprompt = `
Voici ci-dessous le contexte à partir duquel tu dois partir pour construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si l'information n'est pas dans le contexte, indique-le et essaie de répondre malgré tout.
CONTEXTE : `
const defaultRAGpromptStrict = `
Voici ci-dessous le contexte à partir duquel tu dois construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si la réponse à la question n'est pas dans le contexte, tu ne dois pas répondre et dire : je ne sais pas. 
CONTEXTE : `
let yamlUseLLMragPrompt = defaultRAGprompt;
let yamlUseLLMragSeparator = '\n';
let yamlUseLLMmaxTopElements = 3;
let yamlUseLLMapiKey = '';

let chatData;
let filterBadWords;

function handleURL(url) {
	if (url !== "") {
		// Gestion des fichiers hébergés sur github
		if (url.startsWith("https://github.com")) {
			url = url.replace(
				"https://github.com",
				"https://raw.githubusercontent.com"
			);
			url = url.replace("/blob/", "/");
		}
		// Gestion des fichiers hébergés sur codiMD
		if (
			url.startsWith("https://codimd") &&
			url.indexOf("download") === -1
		) {
			url =
				url.replace("?edit", "").replace("?both", "").replace("?view", "").replace(/#$/,"") +
				"/download";
		}
		// Gestion des fichiers hébergés via Hedgedoc
		if (
			url.includes("hedgedoc") &&
			url.indexOf("download") === -1
		) {
			url =
				url
					.replace("?edit", "")
					.replace("?both", "")
					.replace("?view", "")
					.replace(/#$/, "") + "/download";
		}
		// Vérification de la présence d'un raccourci
		shortcut = shortcuts.find(element => element[0]==url);
		if (shortcut) {
			url = shortcut[1];
		}
	}
	return url;
}

function getMarkdownContent() {
	// Récupération du markdown externe
	const url = window.location.hash.substring(1); // Récupère l'URL du hashtag sans le #
	if (url !== "") {
		const urlMD = handleURL(url)
		// Récupération du contenu du fichier
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

function loadScript(src) {
	// Fonction pour charger des scripts
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}
function loadCSS(src) {
	// Fonction pour charger des CSS
	return new Promise((resolve, reject) => {
		const styleElement = document.createElement("link");
		styleElement.href = src;
		styleElement.rel = "stylesheet";
		styleElement.onload = resolve;
		styleElement.onerror = reject;
		document.head.appendChild(styleElement);
	});
}

function startsWithAnyOf(string,array) {
	// Vérifie si une variable texte commence par un élément d'un tableau
	for (const element of array) {
		if (string.startsWith(element)) {
		  return element;
		}
	}
}

let yamlData;



function prepareRAGdata(informations, separator) {
	if(separator) {
		if(separator == 'auto') {
			// Une fonction pour découper le texte en morceaux d'environ 600 caractères.
			function splitIntoChunks(text, charLimit = 600) {
				let chunks = [];
				let startIndex = 0;
				while (startIndex < text.length) {
					let endIndex = startIndex + charLimit;
					if (endIndex < text.length) {
						let spaceIndex = text.lastIndexOf(' ', endIndex);
						if (spaceIndex > startIndex) {
							endIndex = spaceIndex;
						}
					}
					chunks.push(text.slice(startIndex, endIndex).trim());
					startIndex = endIndex + 1;
				}
				return chunks;
			}
			return splitIntoChunks(informations);
		} else {
			return yamlUseLLM.separator == 'break' ? informations.split('---').map(element => element.replaceAll('\n',' ').trim()) : informations.split(yamlUseLLM.separator);
		}
	} else {
		return informations.split('\n').filter(line => line.trim() !== '');
	}
}

async function getRAGcontent(informations) {
	if(informations) {
		yamlUseLLMmaxTopElements = yamlUseLLM.maxTopElements ? yamlUseLLM.maxTopElements : 3;
		if(informations.includes('http')) {
			const urlRAGfile = handleURL(informations);
			yamlUseLLMinformations = await fetch(urlRAGfile)
				.then((response) => response.text())
				.then((data) => {
					return prepareRAGdata(data, yamlUseLLM.separator);
				})
		} else {
			if(informations.toString().includes("useFile")) {
				RAGinformations = RAGinformations.trim();
				yamlUseLLMinformations = prepareRAGdata(RAGinformations, yamlUseLLM.separator);
			} else {
				RAGinformations = informations.trim();
				yamlUseLLMinformations = prepareRAGdata(RAGinformations, yamlUseLLM.separator);
			}
			return yamlUseLLMinformations
		}
	}
}

function parseMarkdown(markdownContent) {
	let responsesTitles = ["## "]; // Par défaut les titres des réponses sont définis par des titres en markdown niveau 2
	if (markdownContent.split("---").length > 2) {
		try {
			yamlData = jsyaml.load(markdownContent.split("---")[1]);
			for (const property in yamlData) {
				if (property == "maths") {
					yamlMaths = yamlData[property];
					if (yamlMaths === true) {
						Promise.all([
							loadScript(
								"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
							),
							loadCSS(
								"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
							),
						]);
					}
				}
				if (property == "titresRéponses" || property == "responsesTitles") {
					responsesTitles = yamlData[property];
					if (typeof responsesTitles === 'string') {
						// Cas où le yaml pour les titres des réponses ne contient pas un tableau, mais un seul élément
						responsesTitles = [responsesTitles];
					}
				}
				if (property == "style") {
					yamlStyle = yamlData[property];
					const styleElement = document.createElement("style");
					styleElement.innerHTML = yamlStyle;
					document.body.appendChild(styleElement);
				}
				if (
					property == "userInput" ||
					property == "clavier" ||
					property == "keyboard"
				) {
					yamlUserInput = yamlData[property];
					if (yamlUserInput === false) {
						const controls = document.getElementById("controls");
						controls.style.display = "none";
					}
				}
				if (property == "searchInContent" || property == "rechercheContenu") {
					yamlSearchInContent = yamlData[property];
				}
				if (property == "gestionGrosMots" || property == "detectBadWords") {
					yamldetectBadWords = yamlData[property];
					if (yamldetectBadWords === true) {
						Promise.all([
							loadScript("scripts/leo-profanity.js"),
							loadScript("badWords-fr.js"),
						])
							.then(() => {
								// Les deux scripts sont chargés et prêts à être utilisés
								filterBadWords = LeoProfanity;
								filterBadWords.add(badWordsFR);
							})
							.catch((error) => {
								console.error(
									"Une erreur s'est produite lors du chargement des scripts :",
									error
								);
							});
					}
				}
				if (property == "avatar") {
					yamlAvatar = yamlData[property];
					const avatarCSS = `
  						.bot-message > :first-child:before {
        				background-image: url("${yamlAvatar}");
					`;
					const avatarStyleElement = document.createElement('style');
					avatarStyleElement.textContent = avatarCSS;
					document.head.appendChild(avatarStyleElement);
				}
				if (property == "defaultMessage" || property == "messageParDéfaut") {
					yamlDefaultMessage = yamlData[property];
					defaultMessage = yamlDefaultMessage;
					while (defaultMessage.length<5) {
						defaultMessage.push(...defaultMessage);
					}
				}
				if (property == "footer") {
					yamlFooter = yamlData[property];
				}
				if (property == "theme") {
					yamlTheme = yamlData[property];
					const cssFile = yamlTheme.endsWith('.css') ? "themes/"+yamlTheme : "themes/"+yamlTheme+".css";
					loadCSS(cssFile);
				}
				if (property == "dynamicContent" || property =="contenuDynamique") {
					yamlDynamicContent = yamlData[property];
				}
				if (property == "typeWriter" || property =="effetDactylo") {
					yamlTypeWriter = yamlData[property];
				}
				if (property == "obfuscate") {
					yamlObfuscate = yamlData[property] ? true : false;
				}
				if (property == "useLLM" || property =="utiliserLLM") {
					// On utilise window.useLLMpromise car on aura besoin de savoir quand la promise sera terminée dans un autre script : chatbot.js, (pour calculer les vecteurs de mot pour le RAG : on a besoin que le fichier RAG.js soit bien chargé)  
					window.useLLMpromise = Promise.all([
						loadScript(
							"useLLM.js",
						),
						loadScript(
							"RAG.js",
						)
					]).then(() => {
						window.useLLMragContentPromise = new Promise((resolve, reject) => {
							try {
								const content = getRAGcontent(
									yamlUseLLM.informations
								)
								resolve(content);
							} catch(error) {
								reject(error);
							}
							}
						)
					}
					).catch((error) => console.error(error));
					yamlUseLLM = yamlData[property];
					yamlUseLLMurl = yamlUseLLM.url;
					if(yamlUseLLM.askAPIkey === true) {
						yamlUseLLMapiKey = prompt("Entrez votre clé API");
					} else {
						yamlUseLLMapiKey = '';
					}
					yamlUseLLMmodel = yamlUseLLM.model;
					yamlUseLLMalways = yamlUseLLM.always;
					yamlUseLLMsystemPrompt = yamlUseLLM.systemPrompt ? yamlUseLLM.systemPrompt : defaultSystemPrompt;
					yamlUseLLMmaxTokens = yamlUseLLM.maxTokens ? yamlUseLLM.maxTokens : defaultMaxTokens;
				}
			}
		} catch (e) {}
	}
	
	let chatbotData = [];
	let currentH2Title = null;
	let currentLiItems = [];
	let content = [];
	let lastOrderedList = null;
	const regexOrderedList = /^\d{1,3}(\.|\))\s\[/;
	const regexOrderedListRandom = /^\d{1,3}\)/;
	const regexDynamicContentIfBlock = /\`if (.*?)\`/;
	let listParsed = false;
	let initialMessageContentArray = [];
	let initialMessageOptions = [];
	let randomOrder = false;

	// On récupère le contenu principal sans l'en-tête YAML s'il existe
	const indexFirstH1title = markdownContent.indexOf("# ");
	const mainContent = markdownContent.substring(indexFirstH1title);
	const mainContentWithoutH1 = mainContent.substring(1);
	// On récupère la séparation entre la première partie des données (titre + message principal) et la suite avec les réponses possibles
	const possibleTitles = ["# ","## ","### ","#### ","##### "]
	const indexOfFirstTitles = possibleTitles.map(title => mainContentWithoutH1.indexOf(title)).filter(index => index > 0);
	const indexAfterFirstMessage = Math.min(...indexOfFirstTitles);

	// Gestion de la première partie des données : titre + message initial
	const firstPart = mainContent.substring(0,indexAfterFirstMessage);
	// Gestion du titre
	const chatbotTitle = firstPart.match(/# .*/)[0];
	const chatbotTitleArray = chatbotTitle ? [chatbotTitle.replace('# ','').trim()] : [""];
	const indexStartTitle = firstPart.indexOf(chatbotTitle);
	// Gestion du message initial
	const initialMessageContent = firstPart.substring(indexStartTitle+chatbotTitle.length);
	const initialMessageContentLines = initialMessageContent.split("\n")
	for (let line of initialMessageContentLines) {
		line = line.replace(/^>\s?/, "").trim();
		if (line.match(regexOrderedList)) {
			// Récupération des options dans le message initial, s'il y en a
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yamlObfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			initialMessageOptions.push([text, link, randomOrder]);
		} else {
			initialMessageContentArray.push(line);
		}
	}
	
	const contentAfterFirstPart = mainContent.substring(indexAfterFirstMessage);
	const contentAfterFirstPartLines = contentAfterFirstPart.split("\n");
	let ifCondition = '';

	for (let line of contentAfterFirstPartLines) {
		if (startsWithAnyOf(line,responsesTitles)) {
			// Gestion des identifiants de réponse, et début de traitement du contenu de chaque réponse
			if (currentH2Title) {
				chatbotData.push([
					currentH2Title,
					currentLiItems,
					content,
					lastOrderedList,
				]);
			}
			currentH2Title = line.replace(startsWithAnyOf(line,responsesTitles), "").trim(); // Titre h2
			currentLiItems = [];
			lastOrderedList = null;
			listParsed = false;
			content = [];
		} else if (line.startsWith("- ") && !listParsed) {
			// Gestion des listes
			currentLiItems.push(line.replace("- ", "").trim());
		} else if (yamlDynamicContent && line.match(regexDynamicContentIfBlock)) {
			ifCondition = line.match(regexDynamicContentIfBlock)[1] ? line.match(regexDynamicContentIfBlock)[1] : '';
			content.push(line + "\n");
			listParsed = true;
		} else if (yamlDynamicContent && line.match('`endif`')) {
			ifCondition = '';
			content.push(line + "\n");
			listParsed = true;
		}
			else if (line.match(regexOrderedList)) {
			// Cas des listes ordonnées
			listParsed = false;
			if (!lastOrderedList) {
				lastOrderedList = [];
			}
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yamlObfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			lastOrderedList.push([text, link, randomOrder, ifCondition]);
			/* lastOrderedList.push(listContent); */
		} else if (line.length > 0 && !line.startsWith('# ')) {
			// Gestion du reste du contenu (on supprime les éventuels titres 1 dans le contenu)
			content.push(line + "\n");
			listParsed = true;
		}
	}
	
	chatbotData.push([
		currentH2Title,
		currentLiItems,
		content,
		lastOrderedList,
	]);

	const initialMessage = [initialMessageContentArray, initialMessageOptions];
	chatbotData.push(initialMessage);
	chatbotData.push(chatbotTitleArray);

	return chatbotData;
}
