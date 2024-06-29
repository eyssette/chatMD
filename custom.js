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

Le chatbot peut aussi sélectionner de manière aléatoire plusieurs versions d'une même réponse si on sépare ces différentes versions avec le séparateur \`-​-​-\`.

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
data-chatbot="URL_SOURCE_CHATBOT"></script>
\`\`\`

Il faut bien sûr remplacer \`\`\`URL_SOURCE_CHATBOT\`\`\` par l'URL de la source de votre chatbot.

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

// Raccourcis vers des chatbots particuliers
const shortcuts = [
	["dissertation-philo","https://raw.githubusercontent.com/eyssette/chatbot/main/dissertation-philosophie.md"]
];

const corsProxy = "https://corsproxy.io/?";


// Gestion des addOns
const allowedAddOns = {
	pako: { js: "scripts/pako.min.js" },
	kroki: { js: "scripts/kroki.js" },
};

const addOnsDependencies = {
	kroki: ["pako"]
}

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
let yamlUseAddOns;

// Paramètres pour l'utilisation d'un LLM
let yamlUseLLMurl;
let yamlUseLLMapiKey = ''; // Attention à ne pas mettre votre apiKey en public !
let yamlUseLLMmodel;
let yamlUseLLMalways = false;

const defaultMaxTokens = 100;
const defaultSystemPrompt = "Tu es un assistant efficace qui réponds en français et pas dans une autre langue. Les phrases de réponse doivent être courtes et claires."
const defaultPostprompt = "\nN'oublie pas de répondre en français.";
let yamlUseLLMsystemPrompt = defaultSystemPrompt;
let yamlUseLLMmaxTokens = defaultMaxTokens;
let yamlUseLLMinformations = '';
let yamlUseLLMpreprompt = '';
let yamlUseLLMpostprompt = defaultPostprompt;


// Paramètres pour le RAG
const defaultRAGprompt = `
Voici ci-dessous le contexte à partir duquel tu dois partir pour construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si l'information n'est pas dans le contexte, indique-le et essaie de répondre malgré tout.
CONTEXTE : `;
const defaultRAGpromptStrict = `
Voici ci-dessous le contexte à partir duquel tu dois construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si la réponse à la question n'est pas dans le contexte, tu ne dois pas répondre et dire : je ne sais pas. 
CONTEXTE : `;
let yamlUseLLMragSeparator = '\n';
let yamlUseLLMmaxTopElements = 3;
let yamlUseLLMragPrompt = defaultRAGprompt;


