export let config = {};

config.secureMode = false;
// Si on utilise le mode sécurisé, il faut indiquer les chatbots qui sont autorisés, soit en utilisant 'authorizedChatbots', soit en utilisant les raccourcis ci-dessous
// Les raccourcis définis plus bas sont également ajoutés aux chatbots autorisés si on utilise le mode sécurisé
config.authorizedChatbots = [
	"https://codimd.apps.education.fr/d3yEseF3RtWzeW3vcgn4MQ",
];

config.defaultMessage = [
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

config.badWordsMessage = [
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
config.shortcuts = [
	[
		"dissertation-philo",
		"https://raw.githubusercontent.com/eyssette/chatbot/main/dissertation-philosophie.md",
	],
	[
		"orientation",
		"https://codimd.apps.education.fr/UB1xium-TSqpdHEqdxipTw/download",
	],
	[
		"multiple-urls",
		[
			"https://codimd.apps.education.fr/t7yi1Ak7Q--r2r4oB-3Uhg/download",
			"https://codimd.apps.education.fr/fqjqvdIkQvWD-PVGONrq2g/download",
		],
	],
];

config.corsProxy = "https://corsproxy.io/?url=";

// Par défaut les titres des réponses sont définis par des titres en markdown niveau 2
config.responsesTitles = ["## "];

// Gestion des addOns
config.allowedAddOns = {
	maths: {
		js: "js/addOns/katex/katex.min.js",
		css: "js/addOns/katex/katex.min.css",
	},
	pako: { js: "js/addOns/pako.min.js" },
	kroki: { js: "js/addOns/kroki.js" },
	textFit: {
		js: "js/addOns/textFit.min.js",
		css: "<style>.katex-display{max-width:80%} .katex-display .textFitted{white-space:nowrap}</style>",
	},
};

config.addOnsDependencies = {
	kroki: ["pako"],
};

// Paramètres dans l'en-tête YAML
config.yaml = {
	addOns: "",
	avatar: "",
	avatarCircle: false,
	bots: {},
	detectBadWords: false,
	defaultMessage: config.defaultMessage,
	dynamicContent: false,
	favicon: "",
	footer: true,
	maths: false,
	obfuscate: false,
	responsesTitles: config.responsesTitles,
	searchInContent: false,
	style: "",
	theme: "",
	//useLLM : défini plus bas
	typeWriter: true,
	userInput: true,
	variables: "",
};

// Paramètres pour l'utilisation d'un LLM
const defaultMaxTokens = 300;
const defaultSystemPrompt =
	"Tu es un assistant efficace qui réponds en français et pas dans une autre langue. Les phrases de réponse doivent être courtes et claires.";
const defaultPostprompt = "\nN'oublie pas de répondre en français.";

config.yaml.useLLM = {
	url: "",
	askAPIkey: false,
	apiKey: "", // Attention à ne pas mettre votre apiKey en public !
	model: "",
	always: false,
	systemPrompt: defaultSystemPrompt,
	maxTokens: defaultMaxTokens,
	preprompt: "",
	postprompt: defaultPostprompt,
};

// Paramètres pour le RAG
const defaultRAGprompt = `
Voici ci-dessous le contexte à partir duquel tu dois prioritairement partir pour construire ta réponse, tu dois sélectionner dans ce contexte l'information qui est en lien avec la question et ne pas parler du reste. Si l'information n'est pas dans le contexte, indique-le et essaie de répondre malgré tout.
CONTEXTE : `;
// const defaultRAGpromptStrict = `
// Voici ci-dessous le contexte à partir duquel tu dois construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si la réponse à la question n'est pas dans le contexte, tu ne dois pas répondre et dire : je ne sais pas.
// CONTEXTE : `;
const RAG = {
	RAGinformations: "",
	RAGseparator: "\n",
	RAGmaxTopElements: 3,
	RAGprompt: defaultRAGprompt,
};

config.yaml.useLLM = { ...config.yaml.useLLM, ...RAG };
