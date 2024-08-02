(function(){'use strict';let config = {};

config.secureMode = false;
// Si on utilise le mode sécurisé, il faut indiquer les chatbots qui sont autorisés, soit en utilisant 'authorizedChatbots', soit en utilisant les raccourcis ci-dessous
// Les raccourcis définis plus bas sont également ajoutés aux chatbots autorisés si on utilise le mode sécurisé
config.authorizedChatbots = ["https://codimd.apps.education.fr/d3yEseF3RtWzeW3vcgn4MQ"];

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
	["dissertation-philo","https://raw.githubusercontent.com/eyssette/chatbot/main/dissertation-philosophie.md"],
	["multiple-urls",["https://codimd.apps.education.fr/t7yi1Ak7Q--r2r4oB-3Uhg/download","https://codimd.apps.education.fr/fqjqvdIkQvWD-PVGONrq2g/download"]]
];

config.corsProxy = "https://corsproxy.io/?";

// Par défaut les titres des réponses sont définis par des titres en markdown niveau 2
config.responsesTitles = ["## "];

// Gestion des addOns
config.allowedAddOns = {
	pako: { js: "externals/pako.min.js" },
	kroki: { js: "externals/kroki.js" },
	textFit: {js: "externals/textFit.min.js", css: "<style>.katex-display{max-width:80%} .katex-display .textFitted{white-space:nowrap}</style>"}
};

config.addOnsDependencies = {
	kroki: ["pako"]
};

// Paramètres dans l'en-tête YAML
config.yaml = {
	// 'style': "",
	// 'favicon': "",
	// 'avatar': "",
	'userInput': true,
	'searchInContent': false,
	'detectBadWords': false,
	'maths': false,
	'footer': true,
	'theme': "",
	'dynamicContent': false,
	'typeWriter': true,
	'obfuscate': false,
	'addOns': '',
	'bots': '',
	'variables': '',
};

// Paramètres pour l'utilisation d'un LLM
const defaultMaxTokens = 100;
const defaultSystemPrompt = "Tu es un assistant efficace qui réponds en français et pas dans une autre langue. Les phrases de réponse doivent être courtes et claires.";
const defaultPostprompt = "\nN'oublie pas de répondre en français.";

config.yaml.useLLM = {
	'ok': false,
	'url': '',
	'askAPIkey': false,
	'apiKey': '', // Attention à ne pas mettre votre apiKey en public !
	'model': '',
	'always': false,
	'systemPrompt': defaultSystemPrompt,
	'maxTokens': defaultMaxTokens,
	'preprompt': '',
	'postprompt': defaultPostprompt,
};


// Paramètres pour le RAG
const defaultRAGprompt = `
Voici ci-dessous le contexte à partir duquel tu dois partir pour construire ta réponse, tu dois sélectionner dans ce contexte l'information pertinente et ne pas parler du reste. Si l'information n'est pas dans le contexte, indique-le et essaie de répondre malgré tout.
CONTEXTE : `;
config.yaml.useLLM.RAG = {
	'informations': '',
	'separator': '\n',
	'maxTopElements': 3,
	'prompt': defaultRAGprompt,
};// Pour tirer au hasard un élément dans un tableau
function getRandomElement(array) {
	return array[Math.floor(Math.random() * array.length)];
}

// Pour vérifier si une variable texte commence par un élément d'un tableau
function startsWithAnyOf(string, array) {
	for (const element of array) {
		if (string.startsWith(element)) {
			return element;
		}
	}
}

// Pour ne garder que les éléments avec la valeur la plus grande dans un tableau
function topElements(array, maxElements) {
	let topElements;
	if (array.length < maxElements) {
		// Si le tableau contient moins que maxElements : on garde tout le tableau
		topElements = array.map((element, index) => [element, index]);
	} else {
		// Sinon, on garde seulement les éléments qui ont la valeur la plus grande
		topElements = array.reduce((acc, val, index) => {
			if (acc.length < maxElements) {
				acc.push([val, index]);
				acc.sort((a, b) => a[0] - b[0]);
			} else if (val > acc[0][0]) {
				acc[0] = [val, index];
				acc.sort((a, b) => a[0] - b[0]);
			}
			return acc;
		}, []);
	}
	// Trier par ordre décroissant
	topElements.sort((a, b) => b[0] - a[0]);

	return topElements;
}

// Pour réordonner de manière aléatoire un tableau
function shuffleArray(array) {
	return array.sort(function () {
		return Math.random() - 0.5;
	});
}

// Pour mettre de l'aléatoire dans un tableau, en conservant cependant la position de certains éléments
function randomizeArrayWithFixedElements(array) {
	let randomizableElements = [];

	// On distingue les éléments fixes et les éléments à ordonner de manière aléatoire
	array.forEach(function (element) {
		if (!element[2]) ; else {
			randomizableElements.push(element);
		}
	});

	// On ordonne de manière aléatoire les éléments qui doivent l'être
	randomizableElements = shuffleArray(randomizableElements);

	// On reconstruit le tableau en réinsérant les éléments fixes au bon endroit
	var finalArray = [];
	array.forEach(function (element) {
		if (!element[2]) {
			finalArray.push(element);
		} else {
			finalArray.push(randomizableElements.shift());
		}
	});

	return finalArray;
}

// Pour tester si le tableau des options doit être réordonné avec de l'aléatoire
function shouldBeRandomized(array) {
	if (Array.isArray(array)) {
		const arrayLength = array.length;
		for (let i = 0; i < arrayLength; i++) {
			if (array[i][2] === true) {
				return true;
			}
		}
	}
	return false;
}

// Pour gérer l'URL de la source du chatbot
function handleURL(url) {
	if (url !== "") {
		let addCorsProxy = true;
		// Vérification de la présence d'un raccourci
		const shortcut = config.shortcuts.find((element) => element[0] == url);
		if (shortcut) {
			url = shortcut[1];
			// Si on a un raccourci, on n'a pas besoin de traiter correctement l'url
			return url
		}
		if (config.secureMode) {
			const authorizedChatbot = config.authorizedChatbots.find((element) => element == url);
			if(authorizedChatbot) {
				url = authorizedChatbot;
			} else {
				return '';
			}
		}
		// Gestion des fichiers hébergés sur la forge et publiés sur une page web
		if (url.includes(".forge")) {
			addCorsProxy = false;
		}
		// Gestion des fichiers hébergés sur github
		if (url.startsWith("https://github.com")) {
			addCorsProxy = false;
			url = url.replace(
				"https://github.com",
				"https://raw.githubusercontent.com"
			);
			url = url.replace("/blob/", "/");
		}
		// gestion des fichiers hébergés sur codiMD / hedgedoc / digipage
		if (
			url.startsWith("https://codimd") ||
			url.includes("hedgedoc") ||
			url.includes("digipage")
		) {
			addCorsProxy = false;
			url = url
				.replace("?edit", "")
				.replace("?both", "")
				.replace("?view", "")
				.replace(/#$/, "")
				.replace(/\/$/, "");
			url = url.indexOf("download") === -1 ? url + "/download" : url;
		}
		// gestion des fichiers hébergés sur framapad ou digidoc
		if ((url.includes("framapad") || url.includes("digidoc")) && !url.endsWith("/export/txt")) {
			addCorsProxy = false;
			url = url.replace(/\?.*/, "") + "/export/txt";
		}
		url = addCorsProxy ? config.corsProxy + url : url;
	}
	return url;
}

// Pour charger des scripts
function loadScript(src) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.src = src;
		script.onload = resolve;
		script.onerror = reject;
		document.head.appendChild(script);
	});
}

// Pour charger des CSS
function loadCSS(src) {
	return new Promise((resolve, reject) => {
		let styleElement;
		if (src.startsWith("<style>")) {
			styleElement = document.createElement("style");
			styleElement.textContent = src
				.replace("<style>", "")
				.replace("</style>", "");
		} else {
			styleElement = document.createElement("link");
			styleElement.href = src;
			styleElement.rel = "stylesheet";
			styleElement.onload = resolve;
			styleElement.onerror = reject;
		}
		document.head.appendChild(styleElement);
	});
}

// Gestion du scroll automatique vers le bas
function scrollWindow() {
	setTimeout(() => {
		window.scrollTo(0, document.body.scrollHeight);
	}, 100);
}

// Pour cacher le footer
const footerElement = document.getElementById("footer");
function hideFooter() {
	const controlsElement = document.getElementById("controls");
	footerElement.style.display = "none";
	controlsElement.style.height = "70px";
	const styleControls =
		"@media screen and (max-width: 500px) { #controls {height:110px!important}}";
	const styleSheet = document.createElement("style");
	styleSheet.innerText = styleControls;
	document.head.appendChild(styleSheet);
}const defaultMD = `# test de Chatbot

Avec programmation en modules`;/*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
	return (typeof subject === 'undefined') || (subject === null);
  }
  
  
  function isObject(subject) {
	return (typeof subject === 'object') && (subject !== null);
  }
  
  
  function toArray(sequence) {
	if (Array.isArray(sequence)) return sequence;
	else if (isNothing(sequence)) return [];
  
	return [ sequence ];
  }
  
  
  function extend(target, source) {
	var index, length, key, sourceKeys;
  
	if (source) {
	  sourceKeys = Object.keys(source);
  
	  for (index = 0, length = sourceKeys.length; index < length; index += 1) {
		key = sourceKeys[index];
		target[key] = source[key];
	  }
	}
  
	return target;
  }
  
  
  function repeat(string, count) {
	var result = '', cycle;
  
	for (cycle = 0; cycle < count; cycle += 1) {
	  result += string;
	}
  
	return result;
  }
  
  
  function isNegativeZero(number) {
	return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
  }
  
  
  var isNothing_1      = isNothing;
  var isObject_1       = isObject;
  var toArray_1        = toArray;
  var repeat_1         = repeat;
  var isNegativeZero_1 = isNegativeZero;
  var extend_1         = extend;
  
  var common = {
	  isNothing: isNothing_1,
	  isObject: isObject_1,
	  toArray: toArray_1,
	  repeat: repeat_1,
	  isNegativeZero: isNegativeZero_1,
	  extend: extend_1
  };
  
  // YAML error class. http://stackoverflow.com/questions/8458984
  
  
  function formatError(exception, compact) {
	var where = '', message = exception.reason || '(unknown reason)';
  
	if (!exception.mark) return message;
  
	if (exception.mark.name) {
	  where += 'in "' + exception.mark.name + '" ';
	}
  
	where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';
  
	if (!compact && exception.mark.snippet) {
	  where += '\n\n' + exception.mark.snippet;
	}
  
	return message + ' ' + where;
  }
  
  
  function YAMLException$1(reason, mark) {
	// Super constructor
	Error.call(this);
  
	this.name = 'YAMLException';
	this.reason = reason;
	this.mark = mark;
	this.message = formatError(this, false);
  
	// Include stack trace in error object
	if (Error.captureStackTrace) {
	  // Chrome and NodeJS
	  Error.captureStackTrace(this, this.constructor);
	} else {
	  // FF, IE 10+ and Safari 6+. Fallback for others
	  this.stack = (new Error()).stack || '';
	}
  }
  
  
  // Inherit from Error
  YAMLException$1.prototype = Object.create(Error.prototype);
  YAMLException$1.prototype.constructor = YAMLException$1;
  
  
  YAMLException$1.prototype.toString = function toString(compact) {
	return this.name + ': ' + formatError(this, compact);
  };
  
  
  var exception = YAMLException$1;
  
  // get snippet for a single line, respecting maxLength
  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
	var head = '';
	var tail = '';
	var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  
	if (position - lineStart > maxHalfLength) {
	  head = ' ... ';
	  lineStart = position - maxHalfLength + head.length;
	}
  
	if (lineEnd - position > maxHalfLength) {
	  tail = ' ...';
	  lineEnd = position + maxHalfLength - tail.length;
	}
  
	return {
	  str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
	  pos: position - lineStart + head.length // relative position
	};
  }
  
  
  function padStart(string, max) {
	return common.repeat(' ', max - string.length) + string;
  }
  
  
  function makeSnippet(mark, options) {
	options = Object.create(options || null);
  
	if (!mark.buffer) return null;
  
	if (!options.maxLength) options.maxLength = 79;
	if (typeof options.indent      !== 'number') options.indent      = 1;
	if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
	if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;
  
	var re = /\r?\n|\r|\0/g;
	var lineStarts = [ 0 ];
	var lineEnds = [];
	var match;
	var foundLineNo = -1;
  
	while ((match = re.exec(mark.buffer))) {
	  lineEnds.push(match.index);
	  lineStarts.push(match.index + match[0].length);
  
	  if (mark.position <= match.index && foundLineNo < 0) {
		foundLineNo = lineStarts.length - 2;
	  }
	}
  
	if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
  
	var result = '', i, line;
	var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
	var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  
	for (i = 1; i <= options.linesBefore; i++) {
	  if (foundLineNo - i < 0) break;
	  line = getLine(
		mark.buffer,
		lineStarts[foundLineNo - i],
		lineEnds[foundLineNo - i],
		mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
		maxLineLength
	  );
	  result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
		' | ' + line.str + '\n' + result;
	}
  
	line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
	result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
	  ' | ' + line.str + '\n';
	result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';
  
	for (i = 1; i <= options.linesAfter; i++) {
	  if (foundLineNo + i >= lineEnds.length) break;
	  line = getLine(
		mark.buffer,
		lineStarts[foundLineNo + i],
		lineEnds[foundLineNo + i],
		mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
		maxLineLength
	  );
	  result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
		' | ' + line.str + '\n';
	}
  
	return result.replace(/\n$/, '');
  }
  
  
  var snippet = makeSnippet;
  
  var TYPE_CONSTRUCTOR_OPTIONS = [
	'kind',
	'multi',
	'resolve',
	'construct',
	'instanceOf',
	'predicate',
	'represent',
	'representName',
	'defaultStyle',
	'styleAliases'
  ];
  
  var YAML_NODE_KINDS = [
	'scalar',
	'sequence',
	'mapping'
  ];
  
  function compileStyleAliases(map) {
	var result = {};
  
	if (map !== null) {
	  Object.keys(map).forEach(function (style) {
		map[style].forEach(function (alias) {
		  result[String(alias)] = style;
		});
	  });
	}
  
	return result;
  }
  
  function Type$1(tag, options) {
	options = options || {};
  
	Object.keys(options).forEach(function (name) {
	  if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
		throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
	  }
	});
  
	// TODO: Add tag format check.
	this.options       = options; // keep original options in case user wants to extend this type later
	this.tag           = tag;
	this.kind          = options['kind']          || null;
	this.resolve       = options['resolve']       || function () { return true; };
	this.construct     = options['construct']     || function (data) { return data; };
	this.instanceOf    = options['instanceOf']    || null;
	this.predicate     = options['predicate']     || null;
	this.represent     = options['represent']     || null;
	this.representName = options['representName'] || null;
	this.defaultStyle  = options['defaultStyle']  || null;
	this.multi         = options['multi']         || false;
	this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);
  
	if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
	  throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
	}
  }
  
  var type = Type$1;
  
  /*eslint-disable max-len*/
  
  
  
  
  
  function compileList(schema, name) {
	var result = [];
  
	schema[name].forEach(function (currentType) {
	  var newIndex = result.length;
  
	  result.forEach(function (previousType, previousIndex) {
		if (previousType.tag === currentType.tag &&
			previousType.kind === currentType.kind &&
			previousType.multi === currentType.multi) {
  
		  newIndex = previousIndex;
		}
	  });
  
	  result[newIndex] = currentType;
	});
  
	return result;
  }
  
  
  function compileMap(/* lists... */) {
	var result = {
		  scalar: {},
		  sequence: {},
		  mapping: {},
		  fallback: {},
		  multi: {
			scalar: [],
			sequence: [],
			mapping: [],
			fallback: []
		  }
		}, index, length;
  
	function collectType(type) {
	  if (type.multi) {
		result.multi[type.kind].push(type);
		result.multi['fallback'].push(type);
	  } else {
		result[type.kind][type.tag] = result['fallback'][type.tag] = type;
	  }
	}
  
	for (index = 0, length = arguments.length; index < length; index += 1) {
	  arguments[index].forEach(collectType);
	}
	return result;
  }
  
  
  function Schema$1(definition) {
	return this.extend(definition);
  }
  
  
  Schema$1.prototype.extend = function extend(definition) {
	var implicit = [];
	var explicit = [];
  
	if (definition instanceof type) {
	  // Schema.extend(type)
	  explicit.push(definition);
  
	} else if (Array.isArray(definition)) {
	  // Schema.extend([ type1, type2, ... ])
	  explicit = explicit.concat(definition);
  
	} else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
	  // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
	  if (definition.implicit) implicit = implicit.concat(definition.implicit);
	  if (definition.explicit) explicit = explicit.concat(definition.explicit);
  
	} else {
	  throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
		'or a schema definition ({ implicit: [...], explicit: [...] })');
	}
  
	implicit.forEach(function (type$1) {
	  if (!(type$1 instanceof type)) {
		throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
	  }
  
	  if (type$1.loadKind && type$1.loadKind !== 'scalar') {
		throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
	  }
  
	  if (type$1.multi) {
		throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
	  }
	});
  
	explicit.forEach(function (type$1) {
	  if (!(type$1 instanceof type)) {
		throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
	  }
	});
  
	var result = Object.create(Schema$1.prototype);
  
	result.implicit = (this.implicit || []).concat(implicit);
	result.explicit = (this.explicit || []).concat(explicit);
  
	result.compiledImplicit = compileList(result, 'implicit');
	result.compiledExplicit = compileList(result, 'explicit');
	result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);
  
	return result;
  };
  
  
  var schema = Schema$1;
  
  var str = new type('tag:yaml.org,2002:str', {
	kind: 'scalar',
	construct: function (data) { return data !== null ? data : ''; }
  });
  
  var seq = new type('tag:yaml.org,2002:seq', {
	kind: 'sequence',
	construct: function (data) { return data !== null ? data : []; }
  });
  
  var map = new type('tag:yaml.org,2002:map', {
	kind: 'mapping',
	construct: function (data) { return data !== null ? data : {}; }
  });
  
  var failsafe = new schema({
	explicit: [
	  str,
	  seq,
	  map
	]
  });
  
  function resolveYamlNull(data) {
	if (data === null) return true;
  
	var max = data.length;
  
	return (max === 1 && data === '~') ||
		   (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
  }
  
  function constructYamlNull() {
	return null;
  }
  
  function isNull(object) {
	return object === null;
  }
  
  var _null = new type('tag:yaml.org,2002:null', {
	kind: 'scalar',
	resolve: resolveYamlNull,
	construct: constructYamlNull,
	predicate: isNull,
	represent: {
	  canonical: function () { return '~';    },
	  lowercase: function () { return 'null'; },
	  uppercase: function () { return 'NULL'; },
	  camelcase: function () { return 'Null'; },
	  empty:     function () { return '';     }
	},
	defaultStyle: 'lowercase'
  });
  
  function resolveYamlBoolean(data) {
	if (data === null) return false;
  
	var max = data.length;
  
	return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
		   (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
  }
  
  function constructYamlBoolean(data) {
	return data === 'true' ||
		   data === 'True' ||
		   data === 'TRUE';
  }
  
  function isBoolean(object) {
	return Object.prototype.toString.call(object) === '[object Boolean]';
  }
  
  var bool = new type('tag:yaml.org,2002:bool', {
	kind: 'scalar',
	resolve: resolveYamlBoolean,
	construct: constructYamlBoolean,
	predicate: isBoolean,
	represent: {
	  lowercase: function (object) { return object ? 'true' : 'false'; },
	  uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
	  camelcase: function (object) { return object ? 'True' : 'False'; }
	},
	defaultStyle: 'lowercase'
  });
  
  function isHexCode(c) {
	return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
		   ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
		   ((0x61/* a */ <= c) && (c <= 0x66/* f */));
  }
  
  function isOctCode(c) {
	return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
  }
  
  function isDecCode(c) {
	return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
  }
  
  function resolveYamlInteger(data) {
	if (data === null) return false;
  
	var max = data.length,
		index = 0,
		hasDigits = false,
		ch;
  
	if (!max) return false;
  
	ch = data[index];
  
	// sign
	if (ch === '-' || ch === '+') {
	  ch = data[++index];
	}
  
	if (ch === '0') {
	  // 0
	  if (index + 1 === max) return true;
	  ch = data[++index];
  
	  // base 2, base 8, base 16
  
	  if (ch === 'b') {
		// base 2
		index++;
  
		for (; index < max; index++) {
		  ch = data[index];
		  if (ch === '_') continue;
		  if (ch !== '0' && ch !== '1') return false;
		  hasDigits = true;
		}
		return hasDigits && ch !== '_';
	  }
  
  
	  if (ch === 'x') {
		// base 16
		index++;
  
		for (; index < max; index++) {
		  ch = data[index];
		  if (ch === '_') continue;
		  if (!isHexCode(data.charCodeAt(index))) return false;
		  hasDigits = true;
		}
		return hasDigits && ch !== '_';
	  }
  
  
	  if (ch === 'o') {
		// base 8
		index++;
  
		for (; index < max; index++) {
		  ch = data[index];
		  if (ch === '_') continue;
		  if (!isOctCode(data.charCodeAt(index))) return false;
		  hasDigits = true;
		}
		return hasDigits && ch !== '_';
	  }
	}
  
	// base 10 (except 0)
  
	// value should not start with `_`;
	if (ch === '_') return false;
  
	for (; index < max; index++) {
	  ch = data[index];
	  if (ch === '_') continue;
	  if (!isDecCode(data.charCodeAt(index))) {
		return false;
	  }
	  hasDigits = true;
	}
  
	// Should have digits and should not end with `_`
	if (!hasDigits || ch === '_') return false;
  
	return true;
  }
  
  function constructYamlInteger(data) {
	var value = data, sign = 1, ch;
  
	if (value.indexOf('_') !== -1) {
	  value = value.replace(/_/g, '');
	}
  
	ch = value[0];
  
	if (ch === '-' || ch === '+') {
	  if (ch === '-') sign = -1;
	  value = value.slice(1);
	  ch = value[0];
	}
  
	if (value === '0') return 0;
  
	if (ch === '0') {
	  if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
	  if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
	  if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
	}
  
	return sign * parseInt(value, 10);
  }
  
  function isInteger(object) {
	return (Object.prototype.toString.call(object)) === '[object Number]' &&
		   (object % 1 === 0 && !common.isNegativeZero(object));
  }
  
  var int = new type('tag:yaml.org,2002:int', {
	kind: 'scalar',
	resolve: resolveYamlInteger,
	construct: constructYamlInteger,
	predicate: isInteger,
	represent: {
	  binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
	  octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
	  decimal:     function (obj) { return obj.toString(10); },
	  /* eslint-disable max-len */
	  hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
	},
	defaultStyle: 'decimal',
	styleAliases: {
	  binary:      [ 2,  'bin' ],
	  octal:       [ 8,  'oct' ],
	  decimal:     [ 10, 'dec' ],
	  hexadecimal: [ 16, 'hex' ]
	}
  });
  
  var YAML_FLOAT_PATTERN = new RegExp(
	// 2.5e4, 2.5 and integers
	'^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
	// .2e4, .2
	// special case, seems not from spec
	'|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
	// .inf
	'|[-+]?\\.(?:inf|Inf|INF)' +
	// .nan
	'|\\.(?:nan|NaN|NAN))$');
  
  function resolveYamlFloat(data) {
	if (data === null) return false;
  
	if (!YAML_FLOAT_PATTERN.test(data) ||
		// Quick hack to not allow integers end with `_`
		// Probably should update regexp & check speed
		data[data.length - 1] === '_') {
	  return false;
	}
  
	return true;
  }
  
  function constructYamlFloat(data) {
	var value, sign;
  
	value  = data.replace(/_/g, '').toLowerCase();
	sign   = value[0] === '-' ? -1 : 1;
  
	if ('+-'.indexOf(value[0]) >= 0) {
	  value = value.slice(1);
	}
  
	if (value === '.inf') {
	  return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  
	} else if (value === '.nan') {
	  return NaN;
	}
	return sign * parseFloat(value, 10);
  }
  
  
  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  
  function representYamlFloat(object, style) {
	var res;
  
	if (isNaN(object)) {
	  switch (style) {
		case 'lowercase': return '.nan';
		case 'uppercase': return '.NAN';
		case 'camelcase': return '.NaN';
	  }
	} else if (Number.POSITIVE_INFINITY === object) {
	  switch (style) {
		case 'lowercase': return '.inf';
		case 'uppercase': return '.INF';
		case 'camelcase': return '.Inf';
	  }
	} else if (Number.NEGATIVE_INFINITY === object) {
	  switch (style) {
		case 'lowercase': return '-.inf';
		case 'uppercase': return '-.INF';
		case 'camelcase': return '-.Inf';
	  }
	} else if (common.isNegativeZero(object)) {
	  return '-0.0';
	}
  
	res = object.toString(10);
  
	// JS stringifier can build scientific format without dots: 5e-100,
	// while YAML requres dot: 5.e-100. Fix it with simple hack
  
	return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }
  
  function isFloat(object) {
	return (Object.prototype.toString.call(object) === '[object Number]') &&
		   (object % 1 !== 0 || common.isNegativeZero(object));
  }
  
  var float = new type('tag:yaml.org,2002:float', {
	kind: 'scalar',
	resolve: resolveYamlFloat,
	construct: constructYamlFloat,
	predicate: isFloat,
	represent: representYamlFloat,
	defaultStyle: 'lowercase'
  });
  
  var json = failsafe.extend({
	implicit: [
	  _null,
	  bool,
	  int,
	  float
	]
  });
  
  var core = json;
  
  var YAML_DATE_REGEXP = new RegExp(
	'^([0-9][0-9][0-9][0-9])'          + // [1] year
	'-([0-9][0-9])'                    + // [2] month
	'-([0-9][0-9])$');                   // [3] day
  
  var YAML_TIMESTAMP_REGEXP = new RegExp(
	'^([0-9][0-9][0-9][0-9])'          + // [1] year
	'-([0-9][0-9]?)'                   + // [2] month
	'-([0-9][0-9]?)'                   + // [3] day
	'(?:[Tt]|[ \\t]+)'                 + // ...
	'([0-9][0-9]?)'                    + // [4] hour
	':([0-9][0-9])'                    + // [5] minute
	':([0-9][0-9])'                    + // [6] second
	'(?:\\.([0-9]*))?'                 + // [7] fraction
	'(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
	'(?::([0-9][0-9]))?))?$');           // [11] tz_minute
  
  function resolveYamlTimestamp(data) {
	if (data === null) return false;
	if (YAML_DATE_REGEXP.exec(data) !== null) return true;
	if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
	return false;
  }
  
  function constructYamlTimestamp(data) {
	var match, year, month, day, hour, minute, second, fraction = 0,
		delta = null, tz_hour, tz_minute, date;
  
	match = YAML_DATE_REGEXP.exec(data);
	if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
  
	if (match === null) throw new Error('Date resolve error');
  
	// match: [1] year [2] month [3] day
  
	year = +(match[1]);
	month = +(match[2]) - 1; // JS month starts with 0
	day = +(match[3]);
  
	if (!match[4]) { // no hour
	  return new Date(Date.UTC(year, month, day));
	}
  
	// match: [4] hour [5] minute [6] second [7] fraction
  
	hour = +(match[4]);
	minute = +(match[5]);
	second = +(match[6]);
  
	if (match[7]) {
	  fraction = match[7].slice(0, 3);
	  while (fraction.length < 3) { // milli-seconds
		fraction += '0';
	  }
	  fraction = +fraction;
	}
  
	// match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute
  
	if (match[9]) {
	  tz_hour = +(match[10]);
	  tz_minute = +(match[11] || 0);
	  delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
	  if (match[9] === '-') delta = -delta;
	}
  
	date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  
	if (delta) date.setTime(date.getTime() - delta);
  
	return date;
  }
  
  function representYamlTimestamp(object /*, style*/) {
	return object.toISOString();
  }
  
  var timestamp = new type('tag:yaml.org,2002:timestamp', {
	kind: 'scalar',
	resolve: resolveYamlTimestamp,
	construct: constructYamlTimestamp,
	instanceOf: Date,
	represent: representYamlTimestamp
  });
  
  function resolveYamlMerge(data) {
	return data === '<<' || data === null;
  }
  
  var merge = new type('tag:yaml.org,2002:merge', {
	kind: 'scalar',
	resolve: resolveYamlMerge
  });
  
  /*eslint-disable no-bitwise*/
  
  
  
  
  
  // [ 64, 65, 66 ] -> [ padding, CR, LF ]
  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';
  
  
  function resolveYamlBinary(data) {
	if (data === null) return false;
  
	var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;
  
	// Convert one by one.
	for (idx = 0; idx < max; idx++) {
	  code = map.indexOf(data.charAt(idx));
  
	  // Skip CR/LF
	  if (code > 64) continue;
  
	  // Fail on illegal characters
	  if (code < 0) return false;
  
	  bitlen += 6;
	}
  
	// If there are any bits left, source was corrupted
	return (bitlen % 8) === 0;
  }
  
  function constructYamlBinary(data) {
	var idx, tailbits,
		input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
		max = input.length,
		map = BASE64_MAP,
		bits = 0,
		result = [];
  
	// Collect by 6*4 bits (3 bytes)
  
	for (idx = 0; idx < max; idx++) {
	  if ((idx % 4 === 0) && idx) {
		result.push((bits >> 16) & 0xFF);
		result.push((bits >> 8) & 0xFF);
		result.push(bits & 0xFF);
	  }
  
	  bits = (bits << 6) | map.indexOf(input.charAt(idx));
	}
  
	// Dump tail
  
	tailbits = (max % 4) * 6;
  
	if (tailbits === 0) {
	  result.push((bits >> 16) & 0xFF);
	  result.push((bits >> 8) & 0xFF);
	  result.push(bits & 0xFF);
	} else if (tailbits === 18) {
	  result.push((bits >> 10) & 0xFF);
	  result.push((bits >> 2) & 0xFF);
	} else if (tailbits === 12) {
	  result.push((bits >> 4) & 0xFF);
	}
  
	return new Uint8Array(result);
  }
  
  function representYamlBinary(object /*, style*/) {
	var result = '', bits = 0, idx, tail,
		max = object.length,
		map = BASE64_MAP;
  
	// Convert every three bytes to 4 ASCII characters.
  
	for (idx = 0; idx < max; idx++) {
	  if ((idx % 3 === 0) && idx) {
		result += map[(bits >> 18) & 0x3F];
		result += map[(bits >> 12) & 0x3F];
		result += map[(bits >> 6) & 0x3F];
		result += map[bits & 0x3F];
	  }
  
	  bits = (bits << 8) + object[idx];
	}
  
	// Dump tail
  
	tail = max % 3;
  
	if (tail === 0) {
	  result += map[(bits >> 18) & 0x3F];
	  result += map[(bits >> 12) & 0x3F];
	  result += map[(bits >> 6) & 0x3F];
	  result += map[bits & 0x3F];
	} else if (tail === 2) {
	  result += map[(bits >> 10) & 0x3F];
	  result += map[(bits >> 4) & 0x3F];
	  result += map[(bits << 2) & 0x3F];
	  result += map[64];
	} else if (tail === 1) {
	  result += map[(bits >> 2) & 0x3F];
	  result += map[(bits << 4) & 0x3F];
	  result += map[64];
	  result += map[64];
	}
  
	return result;
  }
  
  function isBinary(obj) {
	return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
  }
  
  var binary = new type('tag:yaml.org,2002:binary', {
	kind: 'scalar',
	resolve: resolveYamlBinary,
	construct: constructYamlBinary,
	predicate: isBinary,
	represent: representYamlBinary
  });
  
  var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
  var _toString$2       = Object.prototype.toString;
  
  function resolveYamlOmap(data) {
	if (data === null) return true;
  
	var objectKeys = [], index, length, pair, pairKey, pairHasKey,
		object = data;
  
	for (index = 0, length = object.length; index < length; index += 1) {
	  pair = object[index];
	  pairHasKey = false;
  
	  if (_toString$2.call(pair) !== '[object Object]') return false;
  
	  for (pairKey in pair) {
		if (_hasOwnProperty$3.call(pair, pairKey)) {
		  if (!pairHasKey) pairHasKey = true;
		  else return false;
		}
	  }
  
	  if (!pairHasKey) return false;
  
	  if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
	  else return false;
	}
  
	return true;
  }
  
  function constructYamlOmap(data) {
	return data !== null ? data : [];
  }
  
  var omap = new type('tag:yaml.org,2002:omap', {
	kind: 'sequence',
	resolve: resolveYamlOmap,
	construct: constructYamlOmap
  });
  
  var _toString$1 = Object.prototype.toString;
  
  function resolveYamlPairs(data) {
	if (data === null) return true;
  
	var index, length, pair, keys, result,
		object = data;
  
	result = new Array(object.length);
  
	for (index = 0, length = object.length; index < length; index += 1) {
	  pair = object[index];
  
	  if (_toString$1.call(pair) !== '[object Object]') return false;
  
	  keys = Object.keys(pair);
  
	  if (keys.length !== 1) return false;
  
	  result[index] = [ keys[0], pair[keys[0]] ];
	}
  
	return true;
  }
  
  function constructYamlPairs(data) {
	if (data === null) return [];
  
	var index, length, pair, keys, result,
		object = data;
  
	result = new Array(object.length);
  
	for (index = 0, length = object.length; index < length; index += 1) {
	  pair = object[index];
  
	  keys = Object.keys(pair);
  
	  result[index] = [ keys[0], pair[keys[0]] ];
	}
  
	return result;
  }
  
  var pairs = new type('tag:yaml.org,2002:pairs', {
	kind: 'sequence',
	resolve: resolveYamlPairs,
	construct: constructYamlPairs
  });
  
  var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
  
  function resolveYamlSet(data) {
	if (data === null) return true;
  
	var key, object = data;
  
	for (key in object) {
	  if (_hasOwnProperty$2.call(object, key)) {
		if (object[key] !== null) return false;
	  }
	}
  
	return true;
  }
  
  function constructYamlSet(data) {
	return data !== null ? data : {};
  }
  
  var set = new type('tag:yaml.org,2002:set', {
	kind: 'mapping',
	resolve: resolveYamlSet,
	construct: constructYamlSet
  });
  
  var _default = core.extend({
	implicit: [
	  timestamp,
	  merge
	],
	explicit: [
	  binary,
	  omap,
	  pairs,
	  set
	]
  });
  
  /*eslint-disable max-len,no-use-before-define*/
  
  
  
  
  
  
  
  var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  
  
  var CONTEXT_FLOW_IN   = 1;
  var CONTEXT_FLOW_OUT  = 2;
  var CONTEXT_BLOCK_IN  = 3;
  var CONTEXT_BLOCK_OUT = 4;
  
  
  var CHOMPING_CLIP  = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP  = 3;
  
  
  var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  
  
  function _class(obj) { return Object.prototype.toString.call(obj); }
  
  function is_EOL(c) {
	return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
  }
  
  function is_WHITE_SPACE(c) {
	return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
  }
  
  function is_WS_OR_EOL(c) {
	return (c === 0x09/* Tab */) ||
		   (c === 0x20/* Space */) ||
		   (c === 0x0A/* LF */) ||
		   (c === 0x0D/* CR */);
  }
  
  function is_FLOW_INDICATOR(c) {
	return c === 0x2C/* , */ ||
		   c === 0x5B/* [ */ ||
		   c === 0x5D/* ] */ ||
		   c === 0x7B/* { */ ||
		   c === 0x7D/* } */;
  }
  
  function fromHexCode(c) {
	var lc;
  
	if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
	  return c - 0x30;
	}
  
	/*eslint-disable no-bitwise*/
	lc = c | 0x20;
  
	if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
	  return lc - 0x61 + 10;
	}
  
	return -1;
  }
  
  function escapedHexLen(c) {
	if (c === 0x78/* x */) { return 2; }
	if (c === 0x75/* u */) { return 4; }
	if (c === 0x55/* U */) { return 8; }
	return 0;
  }
  
  function fromDecimalCode(c) {
	if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
	  return c - 0x30;
	}
  
	return -1;
  }
  
  function simpleEscapeSequence(c) {
	/* eslint-disable indent */
	return (c === 0x30/* 0 */) ? '\x00' :
		  (c === 0x61/* a */) ? '\x07' :
		  (c === 0x62/* b */) ? '\x08' :
		  (c === 0x74/* t */) ? '\x09' :
		  (c === 0x09/* Tab */) ? '\x09' :
		  (c === 0x6E/* n */) ? '\x0A' :
		  (c === 0x76/* v */) ? '\x0B' :
		  (c === 0x66/* f */) ? '\x0C' :
		  (c === 0x72/* r */) ? '\x0D' :
		  (c === 0x65/* e */) ? '\x1B' :
		  (c === 0x20/* Space */) ? ' ' :
		  (c === 0x22/* " */) ? '\x22' :
		  (c === 0x2F/* / */) ? '/' :
		  (c === 0x5C/* \ */) ? '\x5C' :
		  (c === 0x4E/* N */) ? '\x85' :
		  (c === 0x5F/* _ */) ? '\xA0' :
		  (c === 0x4C/* L */) ? '\u2028' :
		  (c === 0x50/* P */) ? '\u2029' : '';
  }
  
  function charFromCodepoint(c) {
	if (c <= 0xFFFF) {
	  return String.fromCharCode(c);
	}
	// Encode UTF-16 surrogate pair
	// https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
	return String.fromCharCode(
	  ((c - 0x010000) >> 10) + 0xD800,
	  ((c - 0x010000) & 0x03FF) + 0xDC00
	);
  }
  
  var simpleEscapeCheck = new Array(256); // integer, for fast access
  var simpleEscapeMap = new Array(256);
  for (var i$1 = 0; i$1 < 256; i$1++) {
	simpleEscapeCheck[i$1] = simpleEscapeSequence(i$1) ? 1 : 0;
	simpleEscapeMap[i$1] = simpleEscapeSequence(i$1);
  }
  
  
  function State$1(input, options) {
	this.input = input;
  
	this.filename  = options['filename']  || null;
	this.schema    = options['schema']    || _default;
	this.onWarning = options['onWarning'] || null;
	// (Hidden) Remove? makes the loader to expect YAML 1.1 documents
	// if such documents have no explicit %YAML directive
	this.legacy    = options['legacy']    || false;
  
	this.json      = options['json']      || false;
	this.listener  = options['listener']  || null;
  
	this.implicitTypes = this.schema.compiledImplicit;
	this.typeMap       = this.schema.compiledTypeMap;
  
	this.length     = input.length;
	this.position   = 0;
	this.line       = 0;
	this.lineStart  = 0;
	this.lineIndent = 0;
  
	// position of first leading tab in the current line,
	// used to make sure there are no tabs in the indentation
	this.firstTabInLine = -1;
  
	this.documents = [];
  
	/*
	this.version;
	this.checkLineBreaks;
	this.tagMap;
	this.anchorMap;
	this.tag;
	this.anchor;
	this.kind;
	this.result;*/
  
  }
  
  
  function generateError(state, message) {
	var mark = {
	  name:     state.filename,
	  buffer:   state.input.slice(0, -1), // omit trailing \0
	  position: state.position,
	  line:     state.line,
	  column:   state.position - state.lineStart
	};
  
	mark.snippet = snippet(mark);
  
	return new exception(message, mark);
  }
  
  function throwError(state, message) {
	throw generateError(state, message);
  }
  
  function throwWarning(state, message) {
	if (state.onWarning) {
	  state.onWarning.call(null, generateError(state, message));
	}
  }
  
  
  var directiveHandlers = {
  
	YAML: function handleYamlDirective(state, name, args) {
  
	  var match, major, minor;
  
	  if (state.version !== null) {
		throwError(state, 'duplication of %YAML directive');
	  }
  
	  if (args.length !== 1) {
		throwError(state, 'YAML directive accepts exactly one argument');
	  }
  
	  match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
  
	  if (match === null) {
		throwError(state, 'ill-formed argument of the YAML directive');
	  }
  
	  major = parseInt(match[1], 10);
	  minor = parseInt(match[2], 10);
  
	  if (major !== 1) {
		throwError(state, 'unacceptable YAML version of the document');
	  }
  
	  state.version = args[0];
	  state.checkLineBreaks = (minor < 2);
  
	  if (minor !== 1 && minor !== 2) {
		throwWarning(state, 'unsupported YAML version of the document');
	  }
	},
  
	TAG: function handleTagDirective(state, name, args) {
  
	  var handle, prefix;
  
	  if (args.length !== 2) {
		throwError(state, 'TAG directive accepts exactly two arguments');
	  }
  
	  handle = args[0];
	  prefix = args[1];
  
	  if (!PATTERN_TAG_HANDLE.test(handle)) {
		throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
	  }
  
	  if (_hasOwnProperty$1.call(state.tagMap, handle)) {
		throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
	  }
  
	  if (!PATTERN_TAG_URI.test(prefix)) {
		throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
	  }
  
	  try {
		prefix = decodeURIComponent(prefix);
	  } catch (err) {
		throwError(state, 'tag prefix is malformed: ' + prefix);
	  }
  
	  state.tagMap[handle] = prefix;
	}
  };
  
  
  function captureSegment(state, start, end, checkJson) {
	var _position, _length, _character, _result;
  
	if (start < end) {
	  _result = state.input.slice(start, end);
  
	  if (checkJson) {
		for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
		  _character = _result.charCodeAt(_position);
		  if (!(_character === 0x09 ||
				(0x20 <= _character && _character <= 0x10FFFF))) {
			throwError(state, 'expected valid JSON character');
		  }
		}
	  } else if (PATTERN_NON_PRINTABLE.test(_result)) {
		throwError(state, 'the stream contains non-printable characters');
	  }
  
	  state.result += _result;
	}
  }
  
  function mergeMappings(state, destination, source, overridableKeys) {
	var sourceKeys, key, index, quantity;
  
	if (!common.isObject(source)) {
	  throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
	}
  
	sourceKeys = Object.keys(source);
  
	for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
	  key = sourceKeys[index];
  
	  if (!_hasOwnProperty$1.call(destination, key)) {
		destination[key] = source[key];
		overridableKeys[key] = true;
	  }
	}
  }
  
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
	startLine, startLineStart, startPos) {
  
	var index, quantity;
  
	// The output is a plain object here, so keys can only be strings.
	// We need to convert keyNode to a string, but doing so can hang the process
	// (deeply nested arrays that explode exponentially using aliases).
	if (Array.isArray(keyNode)) {
	  keyNode = Array.prototype.slice.call(keyNode);
  
	  for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
		if (Array.isArray(keyNode[index])) {
		  throwError(state, 'nested arrays are not supported inside keys');
		}
  
		if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
		  keyNode[index] = '[object Object]';
		}
	  }
	}
  
	// Avoid code execution in load() via toString property
	// (still use its own toString for arrays, timestamps,
	// and whatever user schema extensions happen to have @@toStringTag)
	if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
	  keyNode = '[object Object]';
	}
  
  
	keyNode = String(keyNode);
  
	if (_result === null) {
	  _result = {};
	}
  
	if (keyTag === 'tag:yaml.org,2002:merge') {
	  if (Array.isArray(valueNode)) {
		for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
		  mergeMappings(state, _result, valueNode[index], overridableKeys);
		}
	  } else {
		mergeMappings(state, _result, valueNode, overridableKeys);
	  }
	} else {
	  if (!state.json &&
		  !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
		  _hasOwnProperty$1.call(_result, keyNode)) {
		state.line = startLine || state.line;
		state.lineStart = startLineStart || state.lineStart;
		state.position = startPos || state.position;
		throwError(state, 'duplicated mapping key');
	  }
  
	  // used for this specific key only because Object.defineProperty is slow
	  if (keyNode === '__proto__') {
		Object.defineProperty(_result, keyNode, {
		  configurable: true,
		  enumerable: true,
		  writable: true,
		  value: valueNode
		});
	  } else {
		_result[keyNode] = valueNode;
	  }
	  delete overridableKeys[keyNode];
	}
  
	return _result;
  }
  
  function readLineBreak(state) {
	var ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch === 0x0A/* LF */) {
	  state.position++;
	} else if (ch === 0x0D/* CR */) {
	  state.position++;
	  if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
		state.position++;
	  }
	} else {
	  throwError(state, 'a line break is expected');
	}
  
	state.line += 1;
	state.lineStart = state.position;
	state.firstTabInLine = -1;
  }
  
  function skipSeparationSpace(state, allowComments, checkIndent) {
	var lineBreaks = 0,
		ch = state.input.charCodeAt(state.position);
  
	while (ch !== 0) {
	  while (is_WHITE_SPACE(ch)) {
		if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
		  state.firstTabInLine = state.position;
		}
		ch = state.input.charCodeAt(++state.position);
	  }
  
	  if (allowComments && ch === 0x23/* # */) {
		do {
		  ch = state.input.charCodeAt(++state.position);
		} while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
	  }
  
	  if (is_EOL(ch)) {
		readLineBreak(state);
  
		ch = state.input.charCodeAt(state.position);
		lineBreaks++;
		state.lineIndent = 0;
  
		while (ch === 0x20/* Space */) {
		  state.lineIndent++;
		  ch = state.input.charCodeAt(++state.position);
		}
	  } else {
		break;
	  }
	}
  
	if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
	  throwWarning(state, 'deficient indentation');
	}
  
	return lineBreaks;
  }
  
  function testDocumentSeparator(state) {
	var _position = state.position,
		ch;
  
	ch = state.input.charCodeAt(_position);
  
	// Condition state.position === state.lineStart is tested
	// in parent on each call, for efficiency. No needs to test here again.
	if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
		ch === state.input.charCodeAt(_position + 1) &&
		ch === state.input.charCodeAt(_position + 2)) {
  
	  _position += 3;
  
	  ch = state.input.charCodeAt(_position);
  
	  if (ch === 0 || is_WS_OR_EOL(ch)) {
		return true;
	  }
	}
  
	return false;
  }
  
  function writeFoldedLines(state, count) {
	if (count === 1) {
	  state.result += ' ';
	} else if (count > 1) {
	  state.result += common.repeat('\n', count - 1);
	}
  }
  
  
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
	var preceding,
		following,
		captureStart,
		captureEnd,
		hasPendingContent,
		_line,
		_lineStart,
		_lineIndent,
		_kind = state.kind,
		_result = state.result,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (is_WS_OR_EOL(ch)      ||
		is_FLOW_INDICATOR(ch) ||
		ch === 0x23/* # */    ||
		ch === 0x26/* & */    ||
		ch === 0x2A/* * */    ||
		ch === 0x21/* ! */    ||
		ch === 0x7C/* | */    ||
		ch === 0x3E/* > */    ||
		ch === 0x27/* ' */    ||
		ch === 0x22/* " */    ||
		ch === 0x25/* % */    ||
		ch === 0x40/* @ */    ||
		ch === 0x60/* ` */) {
	  return false;
	}
  
	if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
	  following = state.input.charCodeAt(state.position + 1);
  
	  if (is_WS_OR_EOL(following) ||
		  withinFlowCollection && is_FLOW_INDICATOR(following)) {
		return false;
	  }
	}
  
	state.kind = 'scalar';
	state.result = '';
	captureStart = captureEnd = state.position;
	hasPendingContent = false;
  
	while (ch !== 0) {
	  if (ch === 0x3A/* : */) {
		following = state.input.charCodeAt(state.position + 1);
  
		if (is_WS_OR_EOL(following) ||
			withinFlowCollection && is_FLOW_INDICATOR(following)) {
		  break;
		}
  
	  } else if (ch === 0x23/* # */) {
		preceding = state.input.charCodeAt(state.position - 1);
  
		if (is_WS_OR_EOL(preceding)) {
		  break;
		}
  
	  } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
				 withinFlowCollection && is_FLOW_INDICATOR(ch)) {
		break;
  
	  } else if (is_EOL(ch)) {
		_line = state.line;
		_lineStart = state.lineStart;
		_lineIndent = state.lineIndent;
		skipSeparationSpace(state, false, -1);
  
		if (state.lineIndent >= nodeIndent) {
		  hasPendingContent = true;
		  ch = state.input.charCodeAt(state.position);
		  continue;
		} else {
		  state.position = captureEnd;
		  state.line = _line;
		  state.lineStart = _lineStart;
		  state.lineIndent = _lineIndent;
		  break;
		}
	  }
  
	  if (hasPendingContent) {
		captureSegment(state, captureStart, captureEnd, false);
		writeFoldedLines(state, state.line - _line);
		captureStart = captureEnd = state.position;
		hasPendingContent = false;
	  }
  
	  if (!is_WHITE_SPACE(ch)) {
		captureEnd = state.position + 1;
	  }
  
	  ch = state.input.charCodeAt(++state.position);
	}
  
	captureSegment(state, captureStart, captureEnd, false);
  
	if (state.result) {
	  return true;
	}
  
	state.kind = _kind;
	state.result = _result;
	return false;
  }
  
  function readSingleQuotedScalar(state, nodeIndent) {
	var ch,
		captureStart, captureEnd;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch !== 0x27/* ' */) {
	  return false;
	}
  
	state.kind = 'scalar';
	state.result = '';
	state.position++;
	captureStart = captureEnd = state.position;
  
	while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	  if (ch === 0x27/* ' */) {
		captureSegment(state, captureStart, state.position, true);
		ch = state.input.charCodeAt(++state.position);
  
		if (ch === 0x27/* ' */) {
		  captureStart = state.position;
		  state.position++;
		  captureEnd = state.position;
		} else {
		  return true;
		}
  
	  } else if (is_EOL(ch)) {
		captureSegment(state, captureStart, captureEnd, true);
		writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
		captureStart = captureEnd = state.position;
  
	  } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
		throwError(state, 'unexpected end of the document within a single quoted scalar');
  
	  } else {
		state.position++;
		captureEnd = state.position;
	  }
	}
  
	throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }
  
  function readDoubleQuotedScalar(state, nodeIndent) {
	var captureStart,
		captureEnd,
		hexLength,
		hexResult,
		tmp,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch !== 0x22/* " */) {
	  return false;
	}
  
	state.kind = 'scalar';
	state.result = '';
	state.position++;
	captureStart = captureEnd = state.position;
  
	while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	  if (ch === 0x22/* " */) {
		captureSegment(state, captureStart, state.position, true);
		state.position++;
		return true;
  
	  } else if (ch === 0x5C/* \ */) {
		captureSegment(state, captureStart, state.position, true);
		ch = state.input.charCodeAt(++state.position);
  
		if (is_EOL(ch)) {
		  skipSeparationSpace(state, false, nodeIndent);
  
		  // TODO: rework to inline fn with no type cast?
		} else if (ch < 256 && simpleEscapeCheck[ch]) {
		  state.result += simpleEscapeMap[ch];
		  state.position++;
  
		} else if ((tmp = escapedHexLen(ch)) > 0) {
		  hexLength = tmp;
		  hexResult = 0;
  
		  for (; hexLength > 0; hexLength--) {
			ch = state.input.charCodeAt(++state.position);
  
			if ((tmp = fromHexCode(ch)) >= 0) {
			  hexResult = (hexResult << 4) + tmp;
  
			} else {
			  throwError(state, 'expected hexadecimal character');
			}
		  }
  
		  state.result += charFromCodepoint(hexResult);
  
		  state.position++;
  
		} else {
		  throwError(state, 'unknown escape sequence');
		}
  
		captureStart = captureEnd = state.position;
  
	  } else if (is_EOL(ch)) {
		captureSegment(state, captureStart, captureEnd, true);
		writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
		captureStart = captureEnd = state.position;
  
	  } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
		throwError(state, 'unexpected end of the document within a double quoted scalar');
  
	  } else {
		state.position++;
		captureEnd = state.position;
	  }
	}
  
	throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }
  
  function readFlowCollection(state, nodeIndent) {
	var readNext = true,
		_line,
		_lineStart,
		_pos,
		_tag     = state.tag,
		_result,
		_anchor  = state.anchor,
		following,
		terminator,
		isPair,
		isExplicitPair,
		isMapping,
		overridableKeys = Object.create(null),
		keyNode,
		keyTag,
		valueNode,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch === 0x5B/* [ */) {
	  terminator = 0x5D;/* ] */
	  isMapping = false;
	  _result = [];
	} else if (ch === 0x7B/* { */) {
	  terminator = 0x7D;/* } */
	  isMapping = true;
	  _result = {};
	} else {
	  return false;
	}
  
	if (state.anchor !== null) {
	  state.anchorMap[state.anchor] = _result;
	}
  
	ch = state.input.charCodeAt(++state.position);
  
	while (ch !== 0) {
	  skipSeparationSpace(state, true, nodeIndent);
  
	  ch = state.input.charCodeAt(state.position);
  
	  if (ch === terminator) {
		state.position++;
		state.tag = _tag;
		state.anchor = _anchor;
		state.kind = isMapping ? 'mapping' : 'sequence';
		state.result = _result;
		return true;
	  } else if (!readNext) {
		throwError(state, 'missed comma between flow collection entries');
	  } else if (ch === 0x2C/* , */) {
		// "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
		throwError(state, "expected the node content, but found ','");
	  }
  
	  keyTag = keyNode = valueNode = null;
	  isPair = isExplicitPair = false;
  
	  if (ch === 0x3F/* ? */) {
		following = state.input.charCodeAt(state.position + 1);
  
		if (is_WS_OR_EOL(following)) {
		  isPair = isExplicitPair = true;
		  state.position++;
		  skipSeparationSpace(state, true, nodeIndent);
		}
	  }
  
	  _line = state.line; // Save the current line.
	  _lineStart = state.lineStart;
	  _pos = state.position;
	  composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
	  keyTag = state.tag;
	  keyNode = state.result;
	  skipSeparationSpace(state, true, nodeIndent);
  
	  ch = state.input.charCodeAt(state.position);
  
	  if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
		isPair = true;
		ch = state.input.charCodeAt(++state.position);
		skipSeparationSpace(state, true, nodeIndent);
		composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
		valueNode = state.result;
	  }
  
	  if (isMapping) {
		storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
	  } else if (isPair) {
		_result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
	  } else {
		_result.push(keyNode);
	  }
  
	  skipSeparationSpace(state, true, nodeIndent);
  
	  ch = state.input.charCodeAt(state.position);
  
	  if (ch === 0x2C/* , */) {
		readNext = true;
		ch = state.input.charCodeAt(++state.position);
	  } else {
		readNext = false;
	  }
	}
  
	throwError(state, 'unexpected end of the stream within a flow collection');
  }
  
  function readBlockScalar(state, nodeIndent) {
	var captureStart,
		folding,
		chomping       = CHOMPING_CLIP,
		didReadContent = false,
		detectedIndent = false,
		textIndent     = nodeIndent,
		emptyLines     = 0,
		atMoreIndented = false,
		tmp,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch === 0x7C/* | */) {
	  folding = false;
	} else if (ch === 0x3E/* > */) {
	  folding = true;
	} else {
	  return false;
	}
  
	state.kind = 'scalar';
	state.result = '';
  
	while (ch !== 0) {
	  ch = state.input.charCodeAt(++state.position);
  
	  if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
		if (CHOMPING_CLIP === chomping) {
		  chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
		} else {
		  throwError(state, 'repeat of a chomping mode identifier');
		}
  
	  } else if ((tmp = fromDecimalCode(ch)) >= 0) {
		if (tmp === 0) {
		  throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
		} else if (!detectedIndent) {
		  textIndent = nodeIndent + tmp - 1;
		  detectedIndent = true;
		} else {
		  throwError(state, 'repeat of an indentation width identifier');
		}
  
	  } else {
		break;
	  }
	}
  
	if (is_WHITE_SPACE(ch)) {
	  do { ch = state.input.charCodeAt(++state.position); }
	  while (is_WHITE_SPACE(ch));
  
	  if (ch === 0x23/* # */) {
		do { ch = state.input.charCodeAt(++state.position); }
		while (!is_EOL(ch) && (ch !== 0));
	  }
	}
  
	while (ch !== 0) {
	  readLineBreak(state);
	  state.lineIndent = 0;
  
	  ch = state.input.charCodeAt(state.position);
  
	  while ((!detectedIndent || state.lineIndent < textIndent) &&
			 (ch === 0x20/* Space */)) {
		state.lineIndent++;
		ch = state.input.charCodeAt(++state.position);
	  }
  
	  if (!detectedIndent && state.lineIndent > textIndent) {
		textIndent = state.lineIndent;
	  }
  
	  if (is_EOL(ch)) {
		emptyLines++;
		continue;
	  }
  
	  // End of the scalar.
	  if (state.lineIndent < textIndent) {
  
		// Perform the chomping.
		if (chomping === CHOMPING_KEEP) {
		  state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
		} else if (chomping === CHOMPING_CLIP) {
		  if (didReadContent) { // i.e. only if the scalar is not empty.
			state.result += '\n';
		  }
		}
  
		// Break this `while` cycle and go to the funciton's epilogue.
		break;
	  }
  
	  // Folded style: use fancy rules to handle line breaks.
	  if (folding) {
  
		// Lines starting with white space characters (more-indented lines) are not folded.
		if (is_WHITE_SPACE(ch)) {
		  atMoreIndented = true;
		  // except for the first content line (cf. Example 8.1)
		  state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
  
		// End of more-indented block.
		} else if (atMoreIndented) {
		  atMoreIndented = false;
		  state.result += common.repeat('\n', emptyLines + 1);
  
		// Just one line break - perceive as the same line.
		} else if (emptyLines === 0) {
		  if (didReadContent) { // i.e. only if we have already read some scalar content.
			state.result += ' ';
		  }
  
		// Several line breaks - perceive as different lines.
		} else {
		  state.result += common.repeat('\n', emptyLines);
		}
  
	  // Literal style: just add exact number of line breaks between content lines.
	  } else {
		// Keep all line breaks except the header line break.
		state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
	  }
  
	  didReadContent = true;
	  detectedIndent = true;
	  emptyLines = 0;
	  captureStart = state.position;
  
	  while (!is_EOL(ch) && (ch !== 0)) {
		ch = state.input.charCodeAt(++state.position);
	  }
  
	  captureSegment(state, captureStart, state.position, false);
	}
  
	return true;
  }
  
  function readBlockSequence(state, nodeIndent) {
	var _line,
		_tag      = state.tag,
		_anchor   = state.anchor,
		_result   = [],
		following,
		detected  = false,
		ch;
  
	// there is a leading tab before this token, so it can't be a block sequence/mapping;
	// it can still be flow sequence/mapping or a scalar
	if (state.firstTabInLine !== -1) return false;
  
	if (state.anchor !== null) {
	  state.anchorMap[state.anchor] = _result;
	}
  
	ch = state.input.charCodeAt(state.position);
  
	while (ch !== 0) {
	  if (state.firstTabInLine !== -1) {
		state.position = state.firstTabInLine;
		throwError(state, 'tab characters must not be used in indentation');
	  }
  
	  if (ch !== 0x2D/* - */) {
		break;
	  }
  
	  following = state.input.charCodeAt(state.position + 1);
  
	  if (!is_WS_OR_EOL(following)) {
		break;
	  }
  
	  detected = true;
	  state.position++;
  
	  if (skipSeparationSpace(state, true, -1)) {
		if (state.lineIndent <= nodeIndent) {
		  _result.push(null);
		  ch = state.input.charCodeAt(state.position);
		  continue;
		}
	  }
  
	  _line = state.line;
	  composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
	  _result.push(state.result);
	  skipSeparationSpace(state, true, -1);
  
	  ch = state.input.charCodeAt(state.position);
  
	  if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
		throwError(state, 'bad indentation of a sequence entry');
	  } else if (state.lineIndent < nodeIndent) {
		break;
	  }
	}
  
	if (detected) {
	  state.tag = _tag;
	  state.anchor = _anchor;
	  state.kind = 'sequence';
	  state.result = _result;
	  return true;
	}
	return false;
  }
  
  function readBlockMapping(state, nodeIndent, flowIndent) {
	var following,
		allowCompact,
		_line,
		_keyLine,
		_keyLineStart,
		_keyPos,
		_tag          = state.tag,
		_anchor       = state.anchor,
		_result       = {},
		overridableKeys = Object.create(null),
		keyTag        = null,
		keyNode       = null,
		valueNode     = null,
		atExplicitKey = false,
		detected      = false,
		ch;
  
	// there is a leading tab before this token, so it can't be a block sequence/mapping;
	// it can still be flow sequence/mapping or a scalar
	if (state.firstTabInLine !== -1) return false;
  
	if (state.anchor !== null) {
	  state.anchorMap[state.anchor] = _result;
	}
  
	ch = state.input.charCodeAt(state.position);
  
	while (ch !== 0) {
	  if (!atExplicitKey && state.firstTabInLine !== -1) {
		state.position = state.firstTabInLine;
		throwError(state, 'tab characters must not be used in indentation');
	  }
  
	  following = state.input.charCodeAt(state.position + 1);
	  _line = state.line; // Save the current line.
  
	  //
	  // Explicit notation case. There are two separate blocks:
	  // first for the key (denoted by "?") and second for the value (denoted by ":")
	  //
	  if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {
  
		if (ch === 0x3F/* ? */) {
		  if (atExplicitKey) {
			storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
			keyTag = keyNode = valueNode = null;
		  }
  
		  detected = true;
		  atExplicitKey = true;
		  allowCompact = true;
  
		} else if (atExplicitKey) {
		  // i.e. 0x3A/* : */ === character after the explicit key.
		  atExplicitKey = false;
		  allowCompact = true;
  
		} else {
		  throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
		}
  
		state.position += 1;
		ch = following;
  
	  //
	  // Implicit notation case. Flow-style node as the key first, then ":", and the value.
	  //
	  } else {
		_keyLine = state.line;
		_keyLineStart = state.lineStart;
		_keyPos = state.position;
  
		if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
		  // Neither implicit nor explicit notation.
		  // Reading is done. Go to the epilogue.
		  break;
		}
  
		if (state.line === _line) {
		  ch = state.input.charCodeAt(state.position);
  
		  while (is_WHITE_SPACE(ch)) {
			ch = state.input.charCodeAt(++state.position);
		  }
  
		  if (ch === 0x3A/* : */) {
			ch = state.input.charCodeAt(++state.position);
  
			if (!is_WS_OR_EOL(ch)) {
			  throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
			}
  
			if (atExplicitKey) {
			  storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
			  keyTag = keyNode = valueNode = null;
			}
  
			detected = true;
			atExplicitKey = false;
			allowCompact = false;
			keyTag = state.tag;
			keyNode = state.result;
  
		  } else if (detected) {
			throwError(state, 'can not read an implicit mapping pair; a colon is missed');
  
		  } else {
			state.tag = _tag;
			state.anchor = _anchor;
			return true; // Keep the result of `composeNode`.
		  }
  
		} else if (detected) {
		  throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
  
		} else {
		  state.tag = _tag;
		  state.anchor = _anchor;
		  return true; // Keep the result of `composeNode`.
		}
	  }
  
	  //
	  // Common reading code for both explicit and implicit notations.
	  //
	  if (state.line === _line || state.lineIndent > nodeIndent) {
		if (atExplicitKey) {
		  _keyLine = state.line;
		  _keyLineStart = state.lineStart;
		  _keyPos = state.position;
		}
  
		if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
		  if (atExplicitKey) {
			keyNode = state.result;
		  } else {
			valueNode = state.result;
		  }
		}
  
		if (!atExplicitKey) {
		  storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
		  keyTag = keyNode = valueNode = null;
		}
  
		skipSeparationSpace(state, true, -1);
		ch = state.input.charCodeAt(state.position);
	  }
  
	  if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
		throwError(state, 'bad indentation of a mapping entry');
	  } else if (state.lineIndent < nodeIndent) {
		break;
	  }
	}
  
	//
	// Epilogue.
	//
  
	// Special case: last mapping's node contains only the key in explicit notation.
	if (atExplicitKey) {
	  storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
	}
  
	// Expose the resulting mapping.
	if (detected) {
	  state.tag = _tag;
	  state.anchor = _anchor;
	  state.kind = 'mapping';
	  state.result = _result;
	}
  
	return detected;
  }
  
  function readTagProperty(state) {
	var _position,
		isVerbatim = false,
		isNamed    = false,
		tagHandle,
		tagName,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch !== 0x21/* ! */) return false;
  
	if (state.tag !== null) {
	  throwError(state, 'duplication of a tag property');
	}
  
	ch = state.input.charCodeAt(++state.position);
  
	if (ch === 0x3C/* < */) {
	  isVerbatim = true;
	  ch = state.input.charCodeAt(++state.position);
  
	} else if (ch === 0x21/* ! */) {
	  isNamed = true;
	  tagHandle = '!!';
	  ch = state.input.charCodeAt(++state.position);
  
	} else {
	  tagHandle = '!';
	}
  
	_position = state.position;
  
	if (isVerbatim) {
	  do { ch = state.input.charCodeAt(++state.position); }
	  while (ch !== 0 && ch !== 0x3E/* > */);
  
	  if (state.position < state.length) {
		tagName = state.input.slice(_position, state.position);
		ch = state.input.charCodeAt(++state.position);
	  } else {
		throwError(state, 'unexpected end of the stream within a verbatim tag');
	  }
	} else {
	  while (ch !== 0 && !is_WS_OR_EOL(ch)) {
  
		if (ch === 0x21/* ! */) {
		  if (!isNamed) {
			tagHandle = state.input.slice(_position - 1, state.position + 1);
  
			if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
			  throwError(state, 'named tag handle cannot contain such characters');
			}
  
			isNamed = true;
			_position = state.position + 1;
		  } else {
			throwError(state, 'tag suffix cannot contain exclamation marks');
		  }
		}
  
		ch = state.input.charCodeAt(++state.position);
	  }
  
	  tagName = state.input.slice(_position, state.position);
  
	  if (PATTERN_FLOW_INDICATORS.test(tagName)) {
		throwError(state, 'tag suffix cannot contain flow indicator characters');
	  }
	}
  
	if (tagName && !PATTERN_TAG_URI.test(tagName)) {
	  throwError(state, 'tag name cannot contain such characters: ' + tagName);
	}
  
	try {
	  tagName = decodeURIComponent(tagName);
	} catch (err) {
	  throwError(state, 'tag name is malformed: ' + tagName);
	}
  
	if (isVerbatim) {
	  state.tag = tagName;
  
	} else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
	  state.tag = state.tagMap[tagHandle] + tagName;
  
	} else if (tagHandle === '!') {
	  state.tag = '!' + tagName;
  
	} else if (tagHandle === '!!') {
	  state.tag = 'tag:yaml.org,2002:' + tagName;
  
	} else {
	  throwError(state, 'undeclared tag handle "' + tagHandle + '"');
	}
  
	return true;
  }
  
  function readAnchorProperty(state) {
	var _position,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch !== 0x26/* & */) return false;
  
	if (state.anchor !== null) {
	  throwError(state, 'duplication of an anchor property');
	}
  
	ch = state.input.charCodeAt(++state.position);
	_position = state.position;
  
	while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	  ch = state.input.charCodeAt(++state.position);
	}
  
	if (state.position === _position) {
	  throwError(state, 'name of an anchor node must contain at least one character');
	}
  
	state.anchor = state.input.slice(_position, state.position);
	return true;
  }
  
  function readAlias(state) {
	var _position, alias,
		ch;
  
	ch = state.input.charCodeAt(state.position);
  
	if (ch !== 0x2A/* * */) return false;
  
	ch = state.input.charCodeAt(++state.position);
	_position = state.position;
  
	while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
	  ch = state.input.charCodeAt(++state.position);
	}
  
	if (state.position === _position) {
	  throwError(state, 'name of an alias node must contain at least one character');
	}
  
	alias = state.input.slice(_position, state.position);
  
	if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
	  throwError(state, 'unidentified alias "' + alias + '"');
	}
  
	state.result = state.anchorMap[alias];
	skipSeparationSpace(state, true, -1);
	return true;
  }
  
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
	var allowBlockStyles,
		allowBlockScalars,
		allowBlockCollections,
		indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
		atNewLine  = false,
		hasContent = false,
		typeIndex,
		typeQuantity,
		typeList,
		type,
		flowIndent,
		blockIndent;
  
	if (state.listener !== null) {
	  state.listener('open', state);
	}
  
	state.tag    = null;
	state.anchor = null;
	state.kind   = null;
	state.result = null;
  
	allowBlockStyles = allowBlockScalars = allowBlockCollections =
	  CONTEXT_BLOCK_OUT === nodeContext ||
	  CONTEXT_BLOCK_IN  === nodeContext;
  
	if (allowToSeek) {
	  if (skipSeparationSpace(state, true, -1)) {
		atNewLine = true;
  
		if (state.lineIndent > parentIndent) {
		  indentStatus = 1;
		} else if (state.lineIndent === parentIndent) {
		  indentStatus = 0;
		} else if (state.lineIndent < parentIndent) {
		  indentStatus = -1;
		}
	  }
	}
  
	if (indentStatus === 1) {
	  while (readTagProperty(state) || readAnchorProperty(state)) {
		if (skipSeparationSpace(state, true, -1)) {
		  atNewLine = true;
		  allowBlockCollections = allowBlockStyles;
  
		  if (state.lineIndent > parentIndent) {
			indentStatus = 1;
		  } else if (state.lineIndent === parentIndent) {
			indentStatus = 0;
		  } else if (state.lineIndent < parentIndent) {
			indentStatus = -1;
		  }
		} else {
		  allowBlockCollections = false;
		}
	  }
	}
  
	if (allowBlockCollections) {
	  allowBlockCollections = atNewLine || allowCompact;
	}
  
	if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
	  if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
		flowIndent = parentIndent;
	  } else {
		flowIndent = parentIndent + 1;
	  }
  
	  blockIndent = state.position - state.lineStart;
  
	  if (indentStatus === 1) {
		if (allowBlockCollections &&
			(readBlockSequence(state, blockIndent) ||
			 readBlockMapping(state, blockIndent, flowIndent)) ||
			readFlowCollection(state, flowIndent)) {
		  hasContent = true;
		} else {
		  if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
			  readSingleQuotedScalar(state, flowIndent) ||
			  readDoubleQuotedScalar(state, flowIndent)) {
			hasContent = true;
  
		  } else if (readAlias(state)) {
			hasContent = true;
  
			if (state.tag !== null || state.anchor !== null) {
			  throwError(state, 'alias node should not have any properties');
			}
  
		  } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
			hasContent = true;
  
			if (state.tag === null) {
			  state.tag = '?';
			}
		  }
  
		  if (state.anchor !== null) {
			state.anchorMap[state.anchor] = state.result;
		  }
		}
	  } else if (indentStatus === 0) {
		// Special case: block sequences are allowed to have same indentation level as the parent.
		// http://www.yaml.org/spec/1.2/spec.html#id2799784
		hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
	  }
	}
  
	if (state.tag === null) {
	  if (state.anchor !== null) {
		state.anchorMap[state.anchor] = state.result;
	  }
  
	} else if (state.tag === '?') {
	  // Implicit resolving is not allowed for non-scalar types, and '?'
	  // non-specific tag is only automatically assigned to plain scalars.
	  //
	  // We only need to check kind conformity in case user explicitly assigns '?'
	  // tag, for example like this: "!<?> [0]"
	  //
	  if (state.result !== null && state.kind !== 'scalar') {
		throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
	  }
  
	  for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
		type = state.implicitTypes[typeIndex];
  
		if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
		  state.result = type.construct(state.result);
		  state.tag = type.tag;
		  if (state.anchor !== null) {
			state.anchorMap[state.anchor] = state.result;
		  }
		  break;
		}
	  }
	} else if (state.tag !== '!') {
	  if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
		type = state.typeMap[state.kind || 'fallback'][state.tag];
	  } else {
		// looking for multi type
		type = null;
		typeList = state.typeMap.multi[state.kind || 'fallback'];
  
		for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
		  if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
			type = typeList[typeIndex];
			break;
		  }
		}
	  }
  
	  if (!type) {
		throwError(state, 'unknown tag !<' + state.tag + '>');
	  }
  
	  if (state.result !== null && type.kind !== state.kind) {
		throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
	  }
  
	  if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
		throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
	  } else {
		state.result = type.construct(state.result, state.tag);
		if (state.anchor !== null) {
		  state.anchorMap[state.anchor] = state.result;
		}
	  }
	}
  
	if (state.listener !== null) {
	  state.listener('close', state);
	}
	return state.tag !== null ||  state.anchor !== null || hasContent;
  }
  
  function readDocument(state) {
	var documentStart = state.position,
		_position,
		directiveName,
		directiveArgs,
		hasDirectives = false,
		ch;
  
	state.version = null;
	state.checkLineBreaks = state.legacy;
	state.tagMap = Object.create(null);
	state.anchorMap = Object.create(null);
  
	while ((ch = state.input.charCodeAt(state.position)) !== 0) {
	  skipSeparationSpace(state, true, -1);
  
	  ch = state.input.charCodeAt(state.position);
  
	  if (state.lineIndent > 0 || ch !== 0x25/* % */) {
		break;
	  }
  
	  hasDirectives = true;
	  ch = state.input.charCodeAt(++state.position);
	  _position = state.position;
  
	  while (ch !== 0 && !is_WS_OR_EOL(ch)) {
		ch = state.input.charCodeAt(++state.position);
	  }
  
	  directiveName = state.input.slice(_position, state.position);
	  directiveArgs = [];
  
	  if (directiveName.length < 1) {
		throwError(state, 'directive name must not be less than one character in length');
	  }
  
	  while (ch !== 0) {
		while (is_WHITE_SPACE(ch)) {
		  ch = state.input.charCodeAt(++state.position);
		}
  
		if (ch === 0x23/* # */) {
		  do { ch = state.input.charCodeAt(++state.position); }
		  while (ch !== 0 && !is_EOL(ch));
		  break;
		}
  
		if (is_EOL(ch)) break;
  
		_position = state.position;
  
		while (ch !== 0 && !is_WS_OR_EOL(ch)) {
		  ch = state.input.charCodeAt(++state.position);
		}
  
		directiveArgs.push(state.input.slice(_position, state.position));
	  }
  
	  if (ch !== 0) readLineBreak(state);
  
	  if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
		directiveHandlers[directiveName](state, directiveName, directiveArgs);
	  } else {
		throwWarning(state, 'unknown document directive "' + directiveName + '"');
	  }
	}
  
	skipSeparationSpace(state, true, -1);
  
	if (state.lineIndent === 0 &&
		state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
		state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
		state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
	  state.position += 3;
	  skipSeparationSpace(state, true, -1);
  
	} else if (hasDirectives) {
	  throwError(state, 'directives end mark is expected');
	}
  
	composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
	skipSeparationSpace(state, true, -1);
  
	if (state.checkLineBreaks &&
		PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
	  throwWarning(state, 'non-ASCII line breaks are interpreted as content');
	}
  
	state.documents.push(state.result);
  
	if (state.position === state.lineStart && testDocumentSeparator(state)) {
  
	  if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
		state.position += 3;
		skipSeparationSpace(state, true, -1);
	  }
	  return;
	}
  
	if (state.position < (state.length - 1)) {
	  throwError(state, 'end of the stream or a document separator is expected');
	} else {
	  return;
	}
  }
  
  
  function loadDocuments(input, options) {
	input = String(input);
	options = options || {};
  
	if (input.length !== 0) {
  
	  // Add tailing `\n` if not exists
	  if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
		  input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
		input += '\n';
	  }
  
	  // Strip BOM
	  if (input.charCodeAt(0) === 0xFEFF) {
		input = input.slice(1);
	  }
	}
  
	var state = new State$1(input, options);
  
	var nullpos = input.indexOf('\0');
  
	if (nullpos !== -1) {
	  state.position = nullpos;
	  throwError(state, 'null byte is not allowed in input');
	}
  
	// Use 0 as string terminator. That significantly simplifies bounds check.
	state.input += '\0';
  
	while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
	  state.lineIndent += 1;
	  state.position += 1;
	}
  
	while (state.position < (state.length - 1)) {
	  readDocument(state);
	}
  
	return state.documents;
  }
  
  
  function loadAll$1(input, iterator, options) {
	if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
	  options = iterator;
	  iterator = null;
	}
  
	var documents = loadDocuments(input, options);
  
	if (typeof iterator !== 'function') {
	  return documents;
	}
  
	for (var index = 0, length = documents.length; index < length; index += 1) {
	  iterator(documents[index]);
	}
  }
  
  
  function load$1(input, options) {
	var documents = loadDocuments(input, options);
  
	if (documents.length === 0) {
	  /*eslint-disable no-undefined*/
	  return undefined;
	} else if (documents.length === 1) {
	  return documents[0];
	}
	throw new exception('expected a single document in the stream, but found more');
  }
  
  
  var loadAll_1 = loadAll$1;
  var load_1    = load$1;
  
  var loader = {
	  loadAll: loadAll_1,
	  load: load_1
  };
  
  /*eslint-disable no-use-before-define*/
  
  
  
  
  
  var _toString       = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  
  var CHAR_BOM                  = 0xFEFF;
  var CHAR_TAB                  = 0x09; /* Tab */
  var CHAR_LINE_FEED            = 0x0A; /* LF */
  var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
  var CHAR_SPACE                = 0x20; /* Space */
  var CHAR_EXCLAMATION          = 0x21; /* ! */
  var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
  var CHAR_SHARP                = 0x23; /* # */
  var CHAR_PERCENT              = 0x25; /* % */
  var CHAR_AMPERSAND            = 0x26; /* & */
  var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
  var CHAR_ASTERISK             = 0x2A; /* * */
  var CHAR_COMMA                = 0x2C; /* , */
  var CHAR_MINUS                = 0x2D; /* - */
  var CHAR_COLON                = 0x3A; /* : */
  var CHAR_EQUALS               = 0x3D; /* = */
  var CHAR_GREATER_THAN         = 0x3E; /* > */
  var CHAR_QUESTION             = 0x3F; /* ? */
  var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
  var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
  var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
  var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
  var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
  var CHAR_VERTICAL_LINE        = 0x7C; /* | */
  var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */
  
  var ESCAPE_SEQUENCES = {};
  
  ESCAPE_SEQUENCES[0x00]   = '\\0';
  ESCAPE_SEQUENCES[0x07]   = '\\a';
  ESCAPE_SEQUENCES[0x08]   = '\\b';
  ESCAPE_SEQUENCES[0x09]   = '\\t';
  ESCAPE_SEQUENCES[0x0A]   = '\\n';
  ESCAPE_SEQUENCES[0x0B]   = '\\v';
  ESCAPE_SEQUENCES[0x0C]   = '\\f';
  ESCAPE_SEQUENCES[0x0D]   = '\\r';
  ESCAPE_SEQUENCES[0x1B]   = '\\e';
  ESCAPE_SEQUENCES[0x22]   = '\\"';
  ESCAPE_SEQUENCES[0x5C]   = '\\\\';
  ESCAPE_SEQUENCES[0x85]   = '\\N';
  ESCAPE_SEQUENCES[0xA0]   = '\\_';
  ESCAPE_SEQUENCES[0x2028] = '\\L';
  ESCAPE_SEQUENCES[0x2029] = '\\P';
  
  var DEPRECATED_BOOLEANS_SYNTAX = [
	'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
	'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
  ];
  
  var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
  
  function compileStyleMap(schema, map) {
	var result, keys, index, length, tag, style, type;
  
	if (map === null) return {};
  
	result = {};
	keys = Object.keys(map);
  
	for (index = 0, length = keys.length; index < length; index += 1) {
	  tag = keys[index];
	  style = String(map[tag]);
  
	  if (tag.slice(0, 2) === '!!') {
		tag = 'tag:yaml.org,2002:' + tag.slice(2);
	  }
	  type = schema.compiledTypeMap['fallback'][tag];
  
	  if (type && _hasOwnProperty.call(type.styleAliases, style)) {
		style = type.styleAliases[style];
	  }
  
	  result[tag] = style;
	}
  
	return result;
  }
  
  function encodeHex(character) {
	var string, handle, length;
  
	string = character.toString(16).toUpperCase();
  
	if (character <= 0xFF) {
	  handle = 'x';
	  length = 2;
	} else if (character <= 0xFFFF) {
	  handle = 'u';
	  length = 4;
	} else if (character <= 0xFFFFFFFF) {
	  handle = 'U';
	  length = 8;
	} else {
	  throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
	}
  
	return '\\' + handle + common.repeat('0', length - string.length) + string;
  }
  
  
  var QUOTING_TYPE_SINGLE = 1,
	  QUOTING_TYPE_DOUBLE = 2;
  
  function State(options) {
	this.schema        = options['schema'] || _default;
	this.indent        = Math.max(1, (options['indent'] || 2));
	this.noArrayIndent = options['noArrayIndent'] || false;
	this.skipInvalid   = options['skipInvalid'] || false;
	this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
	this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
	this.sortKeys      = options['sortKeys'] || false;
	this.lineWidth     = options['lineWidth'] || 80;
	this.noRefs        = options['noRefs'] || false;
	this.noCompatMode  = options['noCompatMode'] || false;
	this.condenseFlow  = options['condenseFlow'] || false;
	this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
	this.forceQuotes   = options['forceQuotes'] || false;
	this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;
  
	this.implicitTypes = this.schema.compiledImplicit;
	this.explicitTypes = this.schema.compiledExplicit;
  
	this.tag = null;
	this.result = '';
  
	this.duplicates = [];
	this.usedDuplicates = null;
  }
  
  // Indents every line in a string. Empty lines (\n only) are not indented.
  function indentString(string, spaces) {
	var ind = common.repeat(' ', spaces),
		position = 0,
		next = -1,
		result = '',
		line,
		length = string.length;
  
	while (position < length) {
	  next = string.indexOf('\n', position);
	  if (next === -1) {
		line = string.slice(position);
		position = length;
	  } else {
		line = string.slice(position, next + 1);
		position = next + 1;
	  }
  
	  if (line.length && line !== '\n') result += ind;
  
	  result += line;
	}
  
	return result;
  }
  
  function generateNextLine(state, level) {
	return '\n' + common.repeat(' ', state.indent * level);
  }
  
  function testImplicitResolving(state, str) {
	var index, length, type;
  
	for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
	  type = state.implicitTypes[index];
  
	  if (type.resolve(str)) {
		return true;
	  }
	}
  
	return false;
  }
  
  // [33] s-white ::= s-space | s-tab
  function isWhitespace(c) {
	return c === CHAR_SPACE || c === CHAR_TAB;
  }
  
  // Returns true if the character can be printed without escaping.
  // From YAML 1.2: "any allowed characters known to be non-printable
  // should also be escaped. [However,] This isn’t mandatory"
  // Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
  function isPrintable(c) {
	return  (0x00020 <= c && c <= 0x00007E)
		|| ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
		|| ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
		||  (0x10000 <= c && c <= 0x10FFFF);
  }
  
  // [34] ns-char ::= nb-char - s-white
  // [27] nb-char ::= c-printable - b-char - c-byte-order-mark
  // [26] b-char  ::= b-line-feed | b-carriage-return
  // Including s-white (for some reason, examples doesn't match specs in this aspect)
  // ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
  function isNsCharOrWhitespace(c) {
	return isPrintable(c)
	  && c !== CHAR_BOM
	  // - b-char
	  && c !== CHAR_CARRIAGE_RETURN
	  && c !== CHAR_LINE_FEED;
  }
  
  // [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
  //                             c = flow-in   ⇒ ns-plain-safe-in
  //                             c = block-key ⇒ ns-plain-safe-out
  //                             c = flow-key  ⇒ ns-plain-safe-in
  // [128] ns-plain-safe-out ::= ns-char
  // [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
  // [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
  //                            | ( /* An ns-char preceding */ “#” )
  //                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
  function isPlainSafe(c, prev, inblock) {
	var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
	var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
	return (
	  // ns-plain-safe
	  inblock ? // c = flow-in
		cIsNsCharOrWhitespace
		: cIsNsCharOrWhitespace
		  // - c-flow-indicator
		  && c !== CHAR_COMMA
		  && c !== CHAR_LEFT_SQUARE_BRACKET
		  && c !== CHAR_RIGHT_SQUARE_BRACKET
		  && c !== CHAR_LEFT_CURLY_BRACKET
		  && c !== CHAR_RIGHT_CURLY_BRACKET
	)
	  // ns-plain-char
	  && c !== CHAR_SHARP // false on '#'
	  && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
	  || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
	  || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
  }
  
  // Simplified test for values allowed as the first character in plain style.
  function isPlainSafeFirst(c) {
	// Uses a subset of ns-char - c-indicator
	// where ns-char = nb-char - s-white.
	// No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
	return isPrintable(c) && c !== CHAR_BOM
	  && !isWhitespace(c) // - s-white
	  // - (c-indicator ::=
	  // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
	  && c !== CHAR_MINUS
	  && c !== CHAR_QUESTION
	  && c !== CHAR_COLON
	  && c !== CHAR_COMMA
	  && c !== CHAR_LEFT_SQUARE_BRACKET
	  && c !== CHAR_RIGHT_SQUARE_BRACKET
	  && c !== CHAR_LEFT_CURLY_BRACKET
	  && c !== CHAR_RIGHT_CURLY_BRACKET
	  // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
	  && c !== CHAR_SHARP
	  && c !== CHAR_AMPERSAND
	  && c !== CHAR_ASTERISK
	  && c !== CHAR_EXCLAMATION
	  && c !== CHAR_VERTICAL_LINE
	  && c !== CHAR_EQUALS
	  && c !== CHAR_GREATER_THAN
	  && c !== CHAR_SINGLE_QUOTE
	  && c !== CHAR_DOUBLE_QUOTE
	  // | “%” | “@” | “`”)
	  && c !== CHAR_PERCENT
	  && c !== CHAR_COMMERCIAL_AT
	  && c !== CHAR_GRAVE_ACCENT;
  }
  
  // Simplified test for values allowed as the last character in plain style.
  function isPlainSafeLast(c) {
	// just not whitespace or colon, it will be checked to be plain character later
	return !isWhitespace(c) && c !== CHAR_COLON;
  }
  
  // Same as 'string'.codePointAt(pos), but works in older browsers.
  function codePointAt(string, pos) {
	var first = string.charCodeAt(pos), second;
	if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
	  second = string.charCodeAt(pos + 1);
	  if (second >= 0xDC00 && second <= 0xDFFF) {
		// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
		return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
	  }
	}
	return first;
  }
  
  // Determines whether block indentation indicator is required.
  function needIndentIndicator(string) {
	var leadingSpaceRe = /^\n* /;
	return leadingSpaceRe.test(string);
  }
  
  var STYLE_PLAIN   = 1,
	  STYLE_SINGLE  = 2,
	  STYLE_LITERAL = 3,
	  STYLE_FOLDED  = 4,
	  STYLE_DOUBLE  = 5;
  
  // Determines which scalar styles are possible and returns the preferred style.
  // lineWidth = -1 => no limit.
  // Pre-conditions: str.length > 0.
  // Post-conditions:
  //    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
  //    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
  //    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
	testAmbiguousType, quotingType, forceQuotes, inblock) {
  
	var i;
	var char = 0;
	var prevChar = null;
	var hasLineBreak = false;
	var hasFoldableLine = false; // only checked if shouldTrackWidth
	var shouldTrackWidth = lineWidth !== -1;
	var previousLineBreak = -1; // count the first line correctly
	var plain = isPlainSafeFirst(codePointAt(string, 0))
			&& isPlainSafeLast(codePointAt(string, string.length - 1));
  
	if (singleLineOnly || forceQuotes) {
	  // Case: no block styles.
	  // Check for disallowed characters to rule out plain and single.
	  for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
		char = codePointAt(string, i);
		if (!isPrintable(char)) {
		  return STYLE_DOUBLE;
		}
		plain = plain && isPlainSafe(char, prevChar, inblock);
		prevChar = char;
	  }
	} else {
	  // Case: block styles permitted.
	  for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
		char = codePointAt(string, i);
		if (char === CHAR_LINE_FEED) {
		  hasLineBreak = true;
		  // Check if any line can be folded.
		  if (shouldTrackWidth) {
			hasFoldableLine = hasFoldableLine ||
			  // Foldable line = too long, and not more-indented.
			  (i - previousLineBreak - 1 > lineWidth &&
			   string[previousLineBreak + 1] !== ' ');
			previousLineBreak = i;
		  }
		} else if (!isPrintable(char)) {
		  return STYLE_DOUBLE;
		}
		plain = plain && isPlainSafe(char, prevChar, inblock);
		prevChar = char;
	  }
	  // in case the end is missing a \n
	  hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
		(i - previousLineBreak - 1 > lineWidth &&
		 string[previousLineBreak + 1] !== ' '));
	}
	// Although every style can represent \n without escaping, prefer block styles
	// for multiline, since they're more readable and they don't add empty lines.
	// Also prefer folding a super-long line.
	if (!hasLineBreak && !hasFoldableLine) {
	  // Strings interpretable as another type have to be quoted;
	  // e.g. the string 'true' vs. the boolean true.
	  if (plain && !forceQuotes && !testAmbiguousType(string)) {
		return STYLE_PLAIN;
	  }
	  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
	}
	// Edge case: block indentation indicator can only have one digit.
	if (indentPerLevel > 9 && needIndentIndicator(string)) {
	  return STYLE_DOUBLE;
	}
	// At this point we know block styles are valid.
	// Prefer literal style unless we want to fold.
	if (!forceQuotes) {
	  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
	}
	return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  
  // Note: line breaking/folding is implemented for only the folded style.
  // NB. We drop the last trailing newline (if any) of a returned block scalar
  //  since the dumper adds its own newline. This always works:
  //    • No ending newline => unaffected; already using strip "-" chomping.
  //    • Ending newline    => removed then restored.
  //  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
  function writeScalar(state, string, level, iskey, inblock) {
	state.dump = (function () {
	  if (string.length === 0) {
		return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
	  }
	  if (!state.noCompatMode) {
		if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
		  return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
		}
	  }
  
	  var indent = state.indent * Math.max(1, level); // no 0-indent scalars
	  // As indentation gets deeper, let the width decrease monotonically
	  // to the lower bound min(state.lineWidth, 40).
	  // Note that this implies
	  //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
	  //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
	  // This behaves better than a constant minimum width which disallows narrower options,
	  // or an indent threshold which causes the width to suddenly increase.
	  var lineWidth = state.lineWidth === -1
		? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
  
	  // Without knowing if keys are implicit/explicit, assume implicit for safety.
	  var singleLineOnly = iskey
		// No block styles in flow mode.
		|| (state.flowLevel > -1 && level >= state.flowLevel);
	  function testAmbiguity(string) {
		return testImplicitResolving(state, string);
	  }
  
	  switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
		testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
  
		case STYLE_PLAIN:
		  return string;
		case STYLE_SINGLE:
		  return "'" + string.replace(/'/g, "''") + "'";
		case STYLE_LITERAL:
		  return '|' + blockHeader(string, state.indent)
			+ dropEndingNewline(indentString(string, indent));
		case STYLE_FOLDED:
		  return '>' + blockHeader(string, state.indent)
			+ dropEndingNewline(indentString(foldString(string, lineWidth), indent));
		case STYLE_DOUBLE:
		  return '"' + escapeString(string) + '"';
		default:
		  throw new exception('impossible error: invalid scalar style');
	  }
	}());
  }
  
  // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
  function blockHeader(string, indentPerLevel) {
	var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';
  
	// note the special case: the string '\n' counts as a "trailing" empty line.
	var clip =          string[string.length - 1] === '\n';
	var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
	var chomp = keep ? '+' : (clip ? '' : '-');
  
	return indentIndicator + chomp + '\n';
  }
  
  // (See the note for writeScalar.)
  function dropEndingNewline(string) {
	return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
  }
  
  // Note: a long line without a suitable break point will exceed the width limit.
  // Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
  function foldString(string, width) {
	// In folded style, $k$ consecutive newlines output as $k+1$ newlines—
	// unless they're before or after a more-indented line, or at the very
	// beginning or end, in which case $k$ maps to $k$.
	// Therefore, parse each chunk as newline(s) followed by a content line.
	var lineRe = /(\n+)([^\n]*)/g;
  
	// first line (possibly an empty line)
	var result = (function () {
	  var nextLF = string.indexOf('\n');
	  nextLF = nextLF !== -1 ? nextLF : string.length;
	  lineRe.lastIndex = nextLF;
	  return foldLine(string.slice(0, nextLF), width);
	}());
	// If we haven't reached the first content line yet, don't add an extra \n.
	var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
	var moreIndented;
  
	// rest of the lines
	var match;
	while ((match = lineRe.exec(string))) {
	  var prefix = match[1], line = match[2];
	  moreIndented = (line[0] === ' ');
	  result += prefix
		+ (!prevMoreIndented && !moreIndented && line !== ''
		  ? '\n' : '')
		+ foldLine(line, width);
	  prevMoreIndented = moreIndented;
	}
  
	return result;
  }
  
  // Greedy line breaking.
  // Picks the longest line under the limit each time,
  // otherwise settles for the shortest line over the limit.
  // NB. More-indented lines *cannot* be folded, as that would add an extra \n.
  function foldLine(line, width) {
	if (line === '' || line[0] === ' ') return line;
  
	// Since a more-indented line adds a \n, breaks can't be followed by a space.
	var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
	var match;
	// start is an inclusive index. end, curr, and next are exclusive.
	var start = 0, end, curr = 0, next = 0;
	var result = '';
  
	// Invariants: 0 <= start <= length-1.
	//   0 <= curr <= next <= max(0, length-2). curr - start <= width.
	// Inside the loop:
	//   A match implies length >= 2, so curr and next are <= length-2.
	while ((match = breakRe.exec(line))) {
	  next = match.index;
	  // maintain invariant: curr - start <= width
	  if (next - start > width) {
		end = (curr > start) ? curr : next; // derive end <= length-2
		result += '\n' + line.slice(start, end);
		// skip the space that was output as \n
		start = end + 1;                    // derive start <= length-1
	  }
	  curr = next;
	}
  
	// By the invariants, start <= length-1, so there is something left over.
	// It is either the whole string or a part starting from non-whitespace.
	result += '\n';
	// Insert a break if the remainder is too long and there is a break available.
	if (line.length - start > width && curr > start) {
	  result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
	} else {
	  result += line.slice(start);
	}
  
	return result.slice(1); // drop extra \n joiner
  }
  
  // Escapes a double-quoted string.
  function escapeString(string) {
	var result = '';
	var char = 0;
	var escapeSeq;
  
	for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
	  char = codePointAt(string, i);
	  escapeSeq = ESCAPE_SEQUENCES[char];
  
	  if (!escapeSeq && isPrintable(char)) {
		result += string[i];
		if (char >= 0x10000) result += string[i + 1];
	  } else {
		result += escapeSeq || encodeHex(char);
	  }
	}
  
	return result;
  }
  
  function writeFlowSequence(state, level, object) {
	var _result = '',
		_tag    = state.tag,
		index,
		length,
		value;
  
	for (index = 0, length = object.length; index < length; index += 1) {
	  value = object[index];
  
	  if (state.replacer) {
		value = state.replacer.call(object, String(index), value);
	  }
  
	  // Write only valid elements, put null instead of invalid elements.
	  if (writeNode(state, level, value, false, false) ||
		  (typeof value === 'undefined' &&
		   writeNode(state, level, null, false, false))) {
  
		if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
		_result += state.dump;
	  }
	}
  
	state.tag = _tag;
	state.dump = '[' + _result + ']';
  }
  
  function writeBlockSequence(state, level, object, compact) {
	var _result = '',
		_tag    = state.tag,
		index,
		length,
		value;
  
	for (index = 0, length = object.length; index < length; index += 1) {
	  value = object[index];
  
	  if (state.replacer) {
		value = state.replacer.call(object, String(index), value);
	  }
  
	  // Write only valid elements, put null instead of invalid elements.
	  if (writeNode(state, level + 1, value, true, true, false, true) ||
		  (typeof value === 'undefined' &&
		   writeNode(state, level + 1, null, true, true, false, true))) {
  
		if (!compact || _result !== '') {
		  _result += generateNextLine(state, level);
		}
  
		if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
		  _result += '-';
		} else {
		  _result += '- ';
		}
  
		_result += state.dump;
	  }
	}
  
	state.tag = _tag;
	state.dump = _result || '[]'; // Empty sequence if no valid values.
  }
  
  function writeFlowMapping(state, level, object) {
	var _result       = '',
		_tag          = state.tag,
		objectKeyList = Object.keys(object),
		index,
		length,
		objectKey,
		objectValue,
		pairBuffer;
  
	for (index = 0, length = objectKeyList.length; index < length; index += 1) {
  
	  pairBuffer = '';
	  if (_result !== '') pairBuffer += ', ';
  
	  if (state.condenseFlow) pairBuffer += '"';
  
	  objectKey = objectKeyList[index];
	  objectValue = object[objectKey];
  
	  if (state.replacer) {
		objectValue = state.replacer.call(object, objectKey, objectValue);
	  }
  
	  if (!writeNode(state, level, objectKey, false, false)) {
		continue; // Skip this pair because of invalid key;
	  }
  
	  if (state.dump.length > 1024) pairBuffer += '? ';
  
	  pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');
  
	  if (!writeNode(state, level, objectValue, false, false)) {
		continue; // Skip this pair because of invalid value.
	  }
  
	  pairBuffer += state.dump;
  
	  // Both key and value are valid.
	  _result += pairBuffer;
	}
  
	state.tag = _tag;
	state.dump = '{' + _result + '}';
  }
  
  function writeBlockMapping(state, level, object, compact) {
	var _result       = '',
		_tag          = state.tag,
		objectKeyList = Object.keys(object),
		index,
		length,
		objectKey,
		objectValue,
		explicitPair,
		pairBuffer;
  
	// Allow sorting keys so that the output file is deterministic
	if (state.sortKeys === true) {
	  // Default sorting
	  objectKeyList.sort();
	} else if (typeof state.sortKeys === 'function') {
	  // Custom sort function
	  objectKeyList.sort(state.sortKeys);
	} else if (state.sortKeys) {
	  // Something is wrong
	  throw new exception('sortKeys must be a boolean or a function');
	}
  
	for (index = 0, length = objectKeyList.length; index < length; index += 1) {
	  pairBuffer = '';
  
	  if (!compact || _result !== '') {
		pairBuffer += generateNextLine(state, level);
	  }
  
	  objectKey = objectKeyList[index];
	  objectValue = object[objectKey];
  
	  if (state.replacer) {
		objectValue = state.replacer.call(object, objectKey, objectValue);
	  }
  
	  if (!writeNode(state, level + 1, objectKey, true, true, true)) {
		continue; // Skip this pair because of invalid key.
	  }
  
	  explicitPair = (state.tag !== null && state.tag !== '?') ||
					 (state.dump && state.dump.length > 1024);
  
	  if (explicitPair) {
		if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
		  pairBuffer += '?';
		} else {
		  pairBuffer += '? ';
		}
	  }
  
	  pairBuffer += state.dump;
  
	  if (explicitPair) {
		pairBuffer += generateNextLine(state, level);
	  }
  
	  if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
		continue; // Skip this pair because of invalid value.
	  }
  
	  if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
		pairBuffer += ':';
	  } else {
		pairBuffer += ': ';
	  }
  
	  pairBuffer += state.dump;
  
	  // Both key and value are valid.
	  _result += pairBuffer;
	}
  
	state.tag = _tag;
	state.dump = _result || '{}'; // Empty mapping if no valid pairs.
  }
  
  function detectType(state, object, explicit) {
	var _result, typeList, index, length, type, style;
  
	typeList = explicit ? state.explicitTypes : state.implicitTypes;
  
	for (index = 0, length = typeList.length; index < length; index += 1) {
	  type = typeList[index];
  
	  if ((type.instanceOf  || type.predicate) &&
		  (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
		  (!type.predicate  || type.predicate(object))) {
  
		if (explicit) {
		  if (type.multi && type.representName) {
			state.tag = type.representName(object);
		  } else {
			state.tag = type.tag;
		  }
		} else {
		  state.tag = '?';
		}
  
		if (type.represent) {
		  style = state.styleMap[type.tag] || type.defaultStyle;
  
		  if (_toString.call(type.represent) === '[object Function]') {
			_result = type.represent(object, style);
		  } else if (_hasOwnProperty.call(type.represent, style)) {
			_result = type.represent[style](object, style);
		  } else {
			throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
		  }
  
		  state.dump = _result;
		}
  
		return true;
	  }
	}
  
	return false;
  }
  
  // Serializes `object` and writes it to global `result`.
  // Returns true on success, or false on invalid object.
  //
  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
	state.tag = null;
	state.dump = object;
  
	if (!detectType(state, object, false)) {
	  detectType(state, object, true);
	}
  
	var type = _toString.call(state.dump);
	var inblock = block;
	var tagStr;
  
	if (block) {
	  block = (state.flowLevel < 0 || state.flowLevel > level);
	}
  
	var objectOrArray = type === '[object Object]' || type === '[object Array]',
		duplicateIndex,
		duplicate;
  
	if (objectOrArray) {
	  duplicateIndex = state.duplicates.indexOf(object);
	  duplicate = duplicateIndex !== -1;
	}
  
	if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
	  compact = false;
	}
  
	if (duplicate && state.usedDuplicates[duplicateIndex]) {
	  state.dump = '*ref_' + duplicateIndex;
	} else {
	  if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
		state.usedDuplicates[duplicateIndex] = true;
	  }
	  if (type === '[object Object]') {
		if (block && (Object.keys(state.dump).length !== 0)) {
		  writeBlockMapping(state, level, state.dump, compact);
		  if (duplicate) {
			state.dump = '&ref_' + duplicateIndex + state.dump;
		  }
		} else {
		  writeFlowMapping(state, level, state.dump);
		  if (duplicate) {
			state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
		  }
		}
	  } else if (type === '[object Array]') {
		if (block && (state.dump.length !== 0)) {
		  if (state.noArrayIndent && !isblockseq && level > 0) {
			writeBlockSequence(state, level - 1, state.dump, compact);
		  } else {
			writeBlockSequence(state, level, state.dump, compact);
		  }
		  if (duplicate) {
			state.dump = '&ref_' + duplicateIndex + state.dump;
		  }
		} else {
		  writeFlowSequence(state, level, state.dump);
		  if (duplicate) {
			state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
		  }
		}
	  } else if (type === '[object String]') {
		if (state.tag !== '?') {
		  writeScalar(state, state.dump, level, iskey, inblock);
		}
	  } else if (type === '[object Undefined]') {
		return false;
	  } else {
		if (state.skipInvalid) return false;
		throw new exception('unacceptable kind of an object to dump ' + type);
	  }
  
	  if (state.tag !== null && state.tag !== '?') {
		// Need to encode all characters except those allowed by the spec:
		//
		// [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
		// [36] ns-hex-digit    ::=  ns-dec-digit
		//                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
		// [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
		// [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
		// [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
		//                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
		//                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
		//
		// Also need to encode '!' because it has special meaning (end of tag prefix).
		//
		tagStr = encodeURI(
		  state.tag[0] === '!' ? state.tag.slice(1) : state.tag
		).replace(/!/g, '%21');
  
		if (state.tag[0] === '!') {
		  tagStr = '!' + tagStr;
		} else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
		  tagStr = '!!' + tagStr.slice(18);
		} else {
		  tagStr = '!<' + tagStr + '>';
		}
  
		state.dump = tagStr + ' ' + state.dump;
	  }
	}
  
	return true;
  }
  
  function getDuplicateReferences(object, state) {
	var objects = [],
		duplicatesIndexes = [],
		index,
		length;
  
	inspectNode(object, objects, duplicatesIndexes);
  
	for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
	  state.duplicates.push(objects[duplicatesIndexes[index]]);
	}
	state.usedDuplicates = new Array(length);
  }
  
  function inspectNode(object, objects, duplicatesIndexes) {
	var objectKeyList,
		index,
		length;
  
	if (object !== null && typeof object === 'object') {
	  index = objects.indexOf(object);
	  if (index !== -1) {
		if (duplicatesIndexes.indexOf(index) === -1) {
		  duplicatesIndexes.push(index);
		}
	  } else {
		objects.push(object);
  
		if (Array.isArray(object)) {
		  for (index = 0, length = object.length; index < length; index += 1) {
			inspectNode(object[index], objects, duplicatesIndexes);
		  }
		} else {
		  objectKeyList = Object.keys(object);
  
		  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
			inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
		  }
		}
	  }
	}
  }
  
  function dump$1(input, options) {
	options = options || {};
  
	var state = new State(options);
  
	if (!state.noRefs) getDuplicateReferences(input, state);
  
	var value = input;
  
	if (state.replacer) {
	  value = state.replacer.call({ '': value }, '', value);
	}
  
	if (writeNode(state, 0, value, true, true)) return state.dump + '\n';
  
	return '';
  }
  
  var dump_1 = dump$1;
  
  var dumper = {
	  dump: dump_1
  };
  
  function renamed(from, to) {
	return function () {
	  throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
		'Use yaml.' + to + ' instead, which is now safe by default.');
	};
  }
  
  
  var Type                = type;
  var Schema              = schema;
  var FAILSAFE_SCHEMA     = failsafe;
  var JSON_SCHEMA         = json;
  var CORE_SCHEMA         = core;
  var DEFAULT_SCHEMA      = _default;
  var load                = loader.load;
  var loadAll             = loader.loadAll;
  var dump                = dumper.dump;
  var YAMLException       = exception;
  
  // Re-export all types in case user wants to create custom schema
  var types = {
	binary:    binary,
	float:     float,
	map:       map,
	null:      _null,
	pairs:     pairs,
	set:       set,
	timestamp: timestamp,
	bool:      bool,
	int:       int,
	merge:     merge,
	omap:      omap,
	seq:       seq,
	str:       str
  };
  
  // Removed functions from JS-YAML 3.0.x
  var safeLoad            = renamed('safeLoad', 'load');
  var safeLoadAll         = renamed('safeLoadAll', 'loadAll');
  var safeDump            = renamed('safeDump', 'dump');
  
  var jsYaml = {
	  Type: Type,
	  Schema: Schema,
	  FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
	  JSON_SCHEMA: JSON_SCHEMA,
	  CORE_SCHEMA: CORE_SCHEMA,
	  DEFAULT_SCHEMA: DEFAULT_SCHEMA,
	  load: load,
	  loadAll: loadAll,
	  dump: dump,
	  YAMLException: YAMLException,
	  types: types,
	  safeLoad: safeLoad,
	  safeLoadAll: safeLoadAll,
	  safeDump: safeDump
  };let yaml = {
	'maths': config.yaml.maths,
	'addOns': config.yaml.addOns,
	'style': config.yaml.style,
	'userInput': config.yaml.userInput,
	'responsesTitles': config.responsesTitles,
	'searchInContent': config.yaml.searchInContent,
	'detectBadWords': config.yaml.detectBadWords,
	'avatar': config.yaml.avatar,
	'footer': config.yaml.footer,
	'theme': config.yaml.theme,
	'dynamicContent': config.yaml.dynamicContent,
	'typeWriter': config.yaml.typeWriter,
	'obfuscate': config.yaml.obfuscate,
	'bots': config.yaml.bots,
	'useLLM': config.yaml.useLLM,
	'variables': config.yaml.variables,
};

let filterBadWords;
function processYAML(markdownContent) {
	if (markdownContent.split("---").length > 2 && markdownContent.startsWith("---")) {
		try {
			// Traitement des propriétés dans le YAML
			const yamlData = jsYaml.load(markdownContent.split("---")[1]);
			yaml = yamlData ? Object.assign(yaml,yamlData) : yaml;
			if (yaml.maths === true) {
				yaml.addOns = yaml.addOns ? yaml.addOns + ",textFit" : "textFit";
				Promise.all([
					loadScript(
						"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"
					),
					loadCSS(
						"https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
					),
				]);
			}
			if (yaml.addOns) {
				// Gestion des addOns (scripts et css en plus)
				yaml.addOns = yaml.addOns.replace(' ','').split(",");
				let addOnsDependenciesArray = [];
				// On ajoute aussi les dépendances pour chaque addOn
				for (const [addOn, addOnDependencies] of Object.entries(config.addOnsDependencies)) {
					if(yaml.addOns.includes(addOn)) {
						for (const addOnDependencie of addOnDependencies) {
							addOnsDependenciesArray.push(addOnDependencie);
						}
					}
				}
				yaml.addOns.push(...addOnsDependenciesArray);
				// Pour chaque addOn, on charge le JS ou le CSS correspondant
				for (const desiredAddOn of yaml.addOns) {
					const addOnsPromises = [];
					const addDesiredAddOn = config.allowedAddOns[desiredAddOn];
					if (addDesiredAddOn) {
						if (addDesiredAddOn.js) {
							addOnsPromises.push(loadScript(addDesiredAddOn.js));
						}
						if (addDesiredAddOn.css) {
							addOnsPromises.push(loadCSS(addDesiredAddOn.css));
						}
						Promise.all(addOnsPromises);
					}
				}
			}
			if (yaml.titresRéponses || yaml.responsesTitles) {
				yaml.responsesTitles = yaml.responsesTitles ? yaml.responsesTitles : yaml.titresRéponses;
				if (typeof yaml.responsesTitles === 'string') {
					// Cas où le yaml pour les titres des réponses ne contient pas un tableau, mais un seul élément
					yaml.responsesTitles = [yaml.responsesTitles];
				}
			}
			if (yaml.style) {
				const styleElement = document.createElement("style");
				styleElement.innerHTML = yaml.style;
				document.body.appendChild(styleElement);
			}
			if (
				yaml.userInput ||
				yaml.clavier ||
				yaml.keyboard
			) {
				yaml.userInput = yaml.userInput ? yaml.userInput : (yaml.keyboard ? yaml.keyboard : yaml.clavier);
				if (yaml.userInput === false) {
					document.body.classList.add('hideControls');
				}
			}
			if (yaml.searchInContent || yaml.rechercheContenu) {
				yaml.searchInContent = yaml.searchInContent ? yaml.searchInContent : yaml.rechercheContenu;
			}
			if (yaml.gestionGrosMots || yaml.detectBadWords) {
				yaml.detectBadWords = yaml.detectBadWords ? yaml.detectBadWords : yaml.gestionGrosMots;
				if (yaml.detectBadWords === true) {
					Promise.all([
						loadScript("externals/leo-profanity.js"),
						loadScript("externals/badWords-fr.js"),
					])
						.then(() => {
							// Les deux scripts sont chargés et prêts à être utilisés
							filterBadWords = window.LeoProfanity;
							filterBadWords.add(window.badWordsFR);
						})
						.catch((error) => {
							console.error(
								"Une erreur s'est produite lors du chargement des scripts :",
								error
							);
						});
				}
			}
			if (yaml.favicon) {
				const faviconElement = document.getElementById("favicon");
				faviconElement.href=yaml.favicon;
			}
			if (yaml.avatar) {
				const avatarCSS = `
					.bot-message > :first-child:before {
					background-image: url("${yaml.avatar}");
				`;
				const avatarStyleElement = document.createElement('style');
				avatarStyleElement.textContent = avatarCSS;
				document.head.appendChild(avatarStyleElement);
			}
			if (yaml.defaultMessage || yaml.messageParDéfaut) {
				config.defaultMessage = yaml.defaultMessage ? yaml.defaultMessage : yaml.messageParDéfaut;
				while (config.defaultMessage.length<5) {
					config.defaultMessage.push(...config.defaultMessage);
				}
			}
			if (yaml.footer) {
				if(yaml.footer === true) {
					document.body.classList.add('hideFooter');
				}
			}
			if (yaml.theme) {
				const cssFile = yaml.theme.endsWith('.css') ? "themes/"+yaml.theme : "themes/"+yaml.theme+".css";
				loadCSS(cssFile);
			}
			if (yaml.dynamicContent || yaml.contenuDynamique) {
				yaml.dynamicContent = yaml.dynamicContent ? yaml.dynamicContent : yaml.contenuDynamique;
			}
			if (yaml.typeWriter || yaml.effetDactylo) {
				yaml.typeWriter = yaml.typeWriter ? yaml.typeWriter : yaml.effetDactylo;
			}
			if (yaml.obfuscate) {
				yaml.obfuscate = yaml.obfuscate ? true : false;
			}
			if (yaml.bots) {
				for (const [botName,botProperties] of Object.entries(yaml.bots)) {
					const botAvatarCustomImageCSS = botProperties.avatar ? 'background-image:url("' + botProperties.avatar + '"); ' : '';  
					const botAvatarCSSfromYAML = botProperties.cssAvatar ? botProperties.cssAvatar : '';
					const botAvatarCSS =  '.botName-'+botName+'>:first-child:before {'+ botAvatarCustomImageCSS + botAvatarCSSfromYAML +'}';
					const botCSSmessage = botProperties.cssMessage ? botProperties.cssMessage : '';
					const botCSS = '<style>'+botAvatarCSS+' .botName-'+botName+'{'+botCSSmessage+'}</style>';
					Promise.all([
						loadCSS(botCSS)
					]);
				}
			}
			if (yaml.useLLM.ok || yaml.utiliserLLM) {
				yaml.useLLM = yaml.utiliserLLM ? yaml.utiliserLLM : yaml.useLLM;
				// On utilise window.useLLMpromise car on aura besoin de savoir quand la promise sera terminée dans un autre script : chatbot.js, (pour calculer les vecteurs de mot pour le RAG : on a besoin que le fichier RAG.js soit bien chargé)  
				window.useLLMpromise = Promise.all([
					loadScript(
						"LLM/useLLM.js",
					),
					loadScript(
						"LLM/RAG.js",
					)
				]).then(() => {
					window.useLLMragContentPromise = new Promise((resolve, reject) => {
						try {
							const content = window.getRAGcontent(
								yaml.useLLM.RAG.informations
							);
							resolve(content);
						} catch(error) {
							reject(error);
						}
						}
					);
				}
				).catch((error) => console.error(error));
				yaml.useLLM.ok = true;
				if(yaml.useLLM.askAPIkey === true) {
					yaml.useLLM.apiKey = prompt("Ce chatbot peut se connecter à une IA pour enrichir les réponses proposées. Entrez votre clé API, puis cliquez sur “OK” pour pouvoir bénéficier de cette fonctionnalité. Sinon, cliquez sur “Annuler”.");
				} else {
					yaml.useLLM.apiKey = yaml.useLLM.askAPIkey ? yaml.useLLM.askAPIkey : ""; // Attention à ne pas diffuser publiuement votre clé API
				}
			}
		} catch (e) {}
	}
}function t(){return t=Object.assign?Object.assign.bind():function(t){for(var s=1;s<arguments.length;s++){var e=arguments[s];for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);}return t},t.apply(this,arguments)}var s={strings:["These are the default values...","You know what you should do?","Use your own!","Have a great day!"],stringsElement:null,typeSpeed:0,startDelay:0,backSpeed:0,smartBackspace:!0,shuffle:!1,backDelay:700,fadeOut:!1,fadeOutClass:"typed-fade-out",fadeOutDelay:500,loop:!1,loopCount:Infinity,showCursor:!0,cursorChar:"|",autoInsertCss:!0,attr:null,bindInputFocusEvents:!1,contentType:"html",onBegin:function(t){},onComplete:function(t){},preStringTyped:function(t,s){},onStringTyped:function(t,s){},onLastStringBackspaced:function(t){},onTypingPaused:function(t,s){},onTypingResumed:function(t,s){},onReset:function(t){},onStop:function(t,s){},onStart:function(t,s){},onDestroy:function(t){}},e=new(/*#__PURE__*/function(){function e(){}var n=e.prototype;return n.load=function(e,n,i){if(e.el="string"==typeof i?document.querySelector(i):i,e.options=t({},s,n),e.isInput="input"===e.el.tagName.toLowerCase(),e.attr=e.options.attr,e.bindInputFocusEvents=e.options.bindInputFocusEvents,e.showCursor=!e.isInput&&e.options.showCursor,e.cursorChar=e.options.cursorChar,e.cursorBlinking=!0,e.elContent=e.attr?e.el.getAttribute(e.attr):e.el.textContent,e.contentType=e.options.contentType,e.typeSpeed=e.options.typeSpeed,e.startDelay=e.options.startDelay,e.backSpeed=e.options.backSpeed,e.smartBackspace=e.options.smartBackspace,e.backDelay=e.options.backDelay,e.fadeOut=e.options.fadeOut,e.fadeOutClass=e.options.fadeOutClass,e.fadeOutDelay=e.options.fadeOutDelay,e.isPaused=!1,e.strings=e.options.strings.map(function(t){return t.trim()}),e.stringsElement="string"==typeof e.options.stringsElement?document.querySelector(e.options.stringsElement):e.options.stringsElement,e.stringsElement){e.strings=[],e.stringsElement.style.cssText="clip: rect(0 0 0 0);clip-path:inset(50%);height:1px;overflow:hidden;position:absolute;white-space:nowrap;width:1px;";var r=Array.prototype.slice.apply(e.stringsElement.children),o=r.length;if(o)for(var a=0;a<o;a+=1)e.strings.push(r[a].innerHTML.trim());}for(var u in e.strPos=0,e.currentElContent=this.getCurrentElContent(e),e.currentElContent&&e.currentElContent.length>0&&(e.strPos=e.currentElContent.length-1,e.strings.unshift(e.currentElContent)),e.sequence=[],e.strings)e.sequence[u]=u;e.arrayPos=0,e.stopNum=0,e.loop=e.options.loop,e.loopCount=e.options.loopCount,e.curLoop=0,e.shuffle=e.options.shuffle,e.pause={status:!1,typewrite:!0,curString:"",curStrPos:0},e.typingComplete=!1,e.autoInsertCss=e.options.autoInsertCss,e.autoInsertCss&&(this.appendCursorAnimationCss(e),this.appendFadeOutAnimationCss(e));},n.getCurrentElContent=function(t){return t.attr?t.el.getAttribute(t.attr):t.isInput?t.el.value:"html"===t.contentType?t.el.innerHTML:t.el.textContent},n.appendCursorAnimationCss=function(t){var s="data-typed-js-cursor-css";if(t.showCursor&&!document.querySelector("["+s+"]")){var e=document.createElement("style");e.setAttribute(s,"true"),e.innerHTML="\n        .typed-cursor{\n          opacity: 1;\n        }\n        .typed-cursor.typed-cursor--blink{\n          animation: typedjsBlink 0.7s infinite;\n          -webkit-animation: typedjsBlink 0.7s infinite;\n                  animation: typedjsBlink 0.7s infinite;\n        }\n        @keyframes typedjsBlink{\n          50% { opacity: 0.0; }\n        }\n        @-webkit-keyframes typedjsBlink{\n          0% { opacity: 1; }\n          50% { opacity: 0.0; }\n          100% { opacity: 1; }\n        }\n      ",document.body.appendChild(e);}},n.appendFadeOutAnimationCss=function(t){var s="data-typed-fadeout-js-css";if(t.fadeOut&&!document.querySelector("["+s+"]")){var e=document.createElement("style");e.setAttribute(s,"true"),e.innerHTML="\n        .typed-fade-out{\n          opacity: 0;\n          transition: opacity .25s;\n        }\n        .typed-cursor.typed-cursor--blink.typed-fade-out{\n          -webkit-animation: 0;\n          animation: 0;\n        }\n      ",document.body.appendChild(e);}},e}()),n=new(/*#__PURE__*/function(){function t(){}var s=t.prototype;return s.typeHtmlChars=function(t,s,e){if("html"!==e.contentType)return s;var n=t.substring(s).charAt(0);if("<"===n||"&"===n){var i;for(i="<"===n?">":";";t.substring(s+1).charAt(0)!==i&&!(1+ ++s>t.length););s++;}return s},s.backSpaceHtmlChars=function(t,s,e){if("html"!==e.contentType)return s;var n=t.substring(s).charAt(0);if(">"===n||";"===n){var i;for(i=">"===n?"<":"&";t.substring(s-1).charAt(0)!==i&&!(--s<0););s--;}return s},t}()),i=/*#__PURE__*/function(){function t(t,s){e.load(this,s,t),this.begin();}var s=t.prototype;return s.toggle=function(){this.pause.status?this.start():this.stop();},s.stop=function(){this.typingComplete||this.pause.status||(this.toggleBlinking(!0),this.pause.status=!0,this.options.onStop(this.arrayPos,this));},s.start=function(){this.typingComplete||this.pause.status&&(this.pause.status=!1,this.pause.typewrite?this.typewrite(this.pause.curString,this.pause.curStrPos):this.backspace(this.pause.curString,this.pause.curStrPos),this.options.onStart(this.arrayPos,this));},s.destroy=function(){this.reset(!1),this.options.onDestroy(this);},s.reset=function(t){void 0===t&&(t=!0),clearInterval(this.timeout),this.replaceText(""),this.cursor&&this.cursor.parentNode&&(this.cursor.parentNode.removeChild(this.cursor),this.cursor=null),this.strPos=0,this.arrayPos=0,this.curLoop=0,t&&(this.insertCursor(),this.options.onReset(this),this.begin());},s.begin=function(){var t=this;this.options.onBegin(this),this.typingComplete=!1,this.shuffleStringsIfNeeded(this),this.insertCursor(),this.bindInputFocusEvents&&this.bindFocusEvents(),this.timeout=setTimeout(function(){0===t.strPos?t.typewrite(t.strings[t.sequence[t.arrayPos]],t.strPos):t.backspace(t.strings[t.sequence[t.arrayPos]],t.strPos);},this.startDelay);},s.typewrite=function(t,s){var e=this;this.fadeOut&&this.el.classList.contains(this.fadeOutClass)&&(this.el.classList.remove(this.fadeOutClass),this.cursor&&this.cursor.classList.remove(this.fadeOutClass));var i=this.humanizer(this.typeSpeed),r=1;!0!==this.pause.status?this.timeout=setTimeout(function(){s=n.typeHtmlChars(t,s,e);var i=0,o=t.substring(s);if("^"===o.charAt(0)&&/^\^\d+/.test(o)){var a=1;a+=(o=/\d+/.exec(o)[0]).length,i=parseInt(o),e.temporaryPause=!0,e.options.onTypingPaused(e.arrayPos,e),t=t.substring(0,s)+t.substring(s+a),e.toggleBlinking(!0);}if("`"===o.charAt(0)){for(;"`"!==t.substring(s+r).charAt(0)&&(r++,!(s+r>t.length)););var u=t.substring(0,s),p=t.substring(u.length+1,s+r),c=t.substring(s+r+1);t=u+p+c,r--;}e.timeout=setTimeout(function(){e.toggleBlinking(!1),s>=t.length?e.doneTyping(t,s):e.keepTyping(t,s,r),e.temporaryPause&&(e.temporaryPause=!1,e.options.onTypingResumed(e.arrayPos,e));},i);},i):this.setPauseStatus(t,s,!0);},s.keepTyping=function(t,s,e){0===s&&(this.toggleBlinking(!1),this.options.preStringTyped(this.arrayPos,this));var n=t.substring(0,s+=e);this.replaceText(n),this.typewrite(t,s);},s.doneTyping=function(t,s){var e=this;this.options.onStringTyped(this.arrayPos,this),this.toggleBlinking(!0),this.arrayPos===this.strings.length-1&&(this.complete(),!1===this.loop||this.curLoop===this.loopCount)||(this.timeout=setTimeout(function(){e.backspace(t,s);},this.backDelay));},s.backspace=function(t,s){var e=this;if(!0!==this.pause.status){if(this.fadeOut)return this.initFadeOut();this.toggleBlinking(!1);var i=this.humanizer(this.backSpeed);this.timeout=setTimeout(function(){s=n.backSpaceHtmlChars(t,s,e);var i=t.substring(0,s);if(e.replaceText(i),e.smartBackspace){var r=e.strings[e.arrayPos+1];e.stopNum=r&&i===r.substring(0,s)?s:0;}s>e.stopNum?(s--,e.backspace(t,s)):s<=e.stopNum&&(e.arrayPos++,e.arrayPos===e.strings.length?(e.arrayPos=0,e.options.onLastStringBackspaced(),e.shuffleStringsIfNeeded(),e.begin()):e.typewrite(e.strings[e.sequence[e.arrayPos]],s));},i);}else this.setPauseStatus(t,s,!1);},s.complete=function(){this.options.onComplete(this),this.loop?this.curLoop++:this.typingComplete=!0;},s.setPauseStatus=function(t,s,e){this.pause.typewrite=e,this.pause.curString=t,this.pause.curStrPos=s;},s.toggleBlinking=function(t){this.cursor&&(this.pause.status||this.cursorBlinking!==t&&(this.cursorBlinking=t,t?this.cursor.classList.add("typed-cursor--blink"):this.cursor.classList.remove("typed-cursor--blink")));},s.humanizer=function(t){return Math.round(Math.random()*t/2)+t},s.shuffleStringsIfNeeded=function(){this.shuffle&&(this.sequence=this.sequence.sort(function(){return Math.random()-.5}));},s.initFadeOut=function(){var t=this;return this.el.className+=" "+this.fadeOutClass,this.cursor&&(this.cursor.className+=" "+this.fadeOutClass),setTimeout(function(){t.arrayPos++,t.replaceText(""),t.strings.length>t.arrayPos?t.typewrite(t.strings[t.sequence[t.arrayPos]],0):(t.typewrite(t.strings[0],0),t.arrayPos=0);},this.fadeOutDelay)},s.replaceText=function(t){this.attr?this.el.setAttribute(this.attr,t):this.isInput?this.el.value=t:"html"===this.contentType?this.el.innerHTML=t:this.el.textContent=t;},s.bindFocusEvents=function(){var t=this;this.isInput&&(this.el.addEventListener("focus",function(s){t.stop();}),this.el.addEventListener("blur",function(s){t.el.value&&0!==t.el.value.length||t.start();}));},s.insertCursor=function(){this.showCursor&&(this.cursor||(this.cursor=document.createElement("span"),this.cursor.className="typed-cursor",this.cursor.setAttribute("aria-hidden",!0),this.cursor.innerHTML=this.cursorChar,this.el.parentNode&&this.el.parentNode.insertBefore(this.cursor,this.el.nextSibling)));},t}();const chatContainer = document.getElementById("chat");
const userInput = document.getElementById("user-input");

// Le focus automatique sur l'userInput est désactivé sur les téléphones mobiles
const isMobile =
	/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
		navigator.userAgent
	);
const autoFocus = isMobile ? false : true;

const thresholdMouseMovement = 10;
const regexPre = /(<pre(.|\n)*<\/pre>)/gm;
const regexMessageOptions = /(<ul class="messageOptions"\>[\s\S]*<\/ul>)/gm;
const regexIframe = /(<iframe(.|\n)*<\/iframe>)/gm;

// Configuration de MutationObserver
let mutationObserver;
const observerConfig = {
	childList: true,
	subtree: true,
};

const messageTypeEnterToStopTypeWriter = isMobile ? "Clic sur “Envoyer” pour stopper l'effet “machine à écrire”" : window.innerWidth > 880 ? "Appuyez sur “Enter” pour stopper l'effet “machine à écrire” et afficher la réponse immédiatement" : "“Enter” pour stopper l'effet “machine à écrire”";

let typed;
const pauseTypeWriter = "^300 ";
const pauseTypeWriterMultipleBots = "^200 "; // Valeur qui doit être différente de pauseTypeWriter pour ne pas créer de conflit dans la fonction stopTypeWriter
const stopTypeWriterExecutionTimeThreshold = 800;
// Effet machine à écrire
function typeWriter(content, element) {
	// Pour stopper l'effet machine à écrire (en appuyant sur “Enter”)
	function stopTypeWriter(slowContent) {
		typed.stop();
		typed.reset();
		slowContent = slowContent.replaceAll('`','');
		slowContent = slowContent.replace(
			regexMessageOptions,
			"`$1`"
		);
		// On doit conserver les retours à la ligne dans les blocs "pre"
		const contentKeepReturnInCode = slowContent.replaceAll(
			regexPre,
			function (match) {
				return match.replaceAll("\n", "RETURNCHARACTER");
			}
		);
		const contentArray = contentKeepReturnInCode.split("\n");
		// On découpe chaque paragraphe pour pouvoir ensuite l'afficher d'un coup
		const contentArrayFiltered = contentArray.map((element) =>
			element.startsWith(pauseTypeWriter)
				? element
						.replace(pauseTypeWriter, "")
						.replaceAll("RETURNCHARACTER", "\n") + "`"
				: element.endsWith("`")
				? "`" + element.replaceAll("RETURNCHARACTER", "\n")
				: "`" + element.replaceAll("RETURNCHARACTER", "\n").replace(pauseTypeWriterMultipleBots,'') + "`"
		);
		typed.strings = [contentArrayFiltered.join(" ")];
		typed.start();
		typed.destroy();
	}

	function keypressHandler(event) {
		if (event.key === "Enter") {
			mutationObserver.disconnect();
			observerConnected = false;
			stopTypeWriter(content);
		}
	}

	let counter = 0;
	const start = Date.now();
	let observerConnected = true;
	function handleMutation() {
		// On arrête l'effet “machine à écrire” si le temps d'exécution est trop important
		const executionTime = Date.now() - start;
		if (
			counter == 50 &&
			executionTime > stopTypeWriterExecutionTimeThreshold &&
			observerConnected
		) {
			stopTypeWriter(content);
			observerConnected = false;
			mutationObserver.disconnect();
		}
		// On scrolle automatiquement la fenêtre pour suivre l'affichage du texte
		scrollWindow();
		counter++;
	}

	// S'il y a des options en fin de message, on les fait apparaître d'un coup, sans effet typeWriter
	content = content.replace(
		regexMessageOptions,
		pauseTypeWriter + "`$1`"
	);

	// On fait apparaître d'un coup les iframes
	content = content.replaceAll(regexIframe,"`$1`");

	// Effet machine à écrire
	typed = new i(element, {
		strings: [content],
		typeSpeed: -5000,
		startDelay: 100,
		showCursor: false,
		onBegin: () => {
			// Quand l'effet démarre, on refocalise sur userInput (sauf sur les smartphones)
			if (autoFocus) {
				userInput.focus();
			}
			// On détecte un appui sur Enter pour stopper l'effet machine à écrire
			userInput.addEventListener("keypress", keypressHandler);
			userInput.setAttribute("placeholder", messageTypeEnterToStopTypeWriter);

			// On détecte le remplissage petit à petit du DOM pour scroller automatiquement la fenêtre vers le bas
			mutationObserver = new MutationObserver(handleMutation);
			function enableAutoScroll() {
				mutationObserver.observe(chatContainer, observerConfig);
			}
			enableAutoScroll();

			setTimeout(() => {
				// Arrêter le scroll automatique en cas de mouvement de la souris ou de contact avec l'écran
				document.addEventListener("mousemove", function (e) {
					if (Math.abs(e.movementX) > thresholdMouseMovement || Math.abs(e.movementY) > thresholdMouseMovement) {
						observerConnected = false;
						mutationObserver.disconnect();
					}
				});
				document.addEventListener("wheel", function (e) {
					if (e.deltaY > 0) {
						// On détecte si on a fait un mouvement vers le bas
						if (
							window.scrollY + window.innerHeight >=
							document.body.offsetHeight
						) {
							// On remet le scroll automatique si on a scrollé jusqu'au bas de la page
							enableAutoScroll();
						} else {
							observerConnected = false;
							mutationObserver.disconnect();
						}
					} else {
						observerConnected = false;
						mutationObserver.disconnect();
					}
				});
				document.addEventListener("touchstart", function () {
					observerConnected = false;
					mutationObserver.disconnect();
					setTimeout(() => {
						if (
							window.scrollY + window.innerHeight + 200 >=
							document.documentElement.scrollHeight
						) {
							// On remet le scroll automatique si on a scrollé jusqu'au bas de la page
							enableAutoScroll();
						}
					}, 5000);
				});
			}, 1000);
		},
		onComplete: () => {
			// Gestion de textFit pour les éléments en Latex
			if (yaml.addOns && yaml.addOns.includes("textFit")) {
				window.textFit(element.querySelectorAll(".katex-display"));
			}
			// Quand l'effet s'arrête on supprime la détection du bouton Enter pour stopper l'effet
			userInput.removeEventListener("keypress", keypressHandler);
			if (
				userInput.getAttribute("placeholder") ==
				messageTypeEnterToStopTypeWriter
			) {
				userInput.setAttribute("placeholder", "Écrivez votre message");
			}
			observerConnected = false;
			mutationObserver.disconnect();
		},
	});
}


function displayMessage(html, isUser, chatMessage) {
	// Effet machine à écrire : seulement quand c'est le chatbot qui répond, sinon affichage direct
	// Pas d'effet machine à écrire s'il y a la préférence : "prefers-reduced-motion"
	chatContainer.appendChild(chatMessage);
	if (
		isUser ||
		window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
		yaml.typeWriter === false
	) {
		chatMessage.innerHTML = html;
	} else {
		typeWriter(html, chatMessage);
	}
}let nextMessage = {
	'goto': '',
	'lastMessageFromBot': '',
	'selected': '',
	'onlyIfKeywords': false,
	'errorsCounter': 0,
	'maxErrors': 3,
	'messageIfKeywordsNotFound': '',
};

// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
function processDirectiveNext(message) {
	message = message.replaceAll(/!Next ?:(.*)/g, function (match, nextDirectiveContent) {
		const nextDirectiveContentSplit = nextDirectiveContent.split("/");
		let messageIfError;
		if (nextDirectiveContentSplit.length > 0) {
			nextDirectiveContent = nextDirectiveContentSplit[0];
			messageIfError = nextDirectiveContentSplit[1];
		} else {
			nextDirectiveContent = nextDirectiveContentSplit[0];
		}

		nextMessage.lastMessageFromBot = message;
		nextMessage.goto = nextDirectiveContent.trim();
		nextMessage.onlyIfKeywords = true;
		nextMessage.messageIfKeywordsNotFound = messageIfError
			? messageIfError.trim()
			: "Ce n'était pas la bonne réponse, merci de réessayer !";
		nextMessage.messageIfKeywordsNotFound = nextMessage.messageIfKeywordsNotFound + "\n\n";
		nextMessage.errorsCounter++;
		if (
			match &&
			nextMessage.errorsCounter < nextMessage.maxErrors
		) {
			return "";
		} else {
			const skipMessage = `<ul class="messageOptions"><li><a href="#${
				yaml.obfuscate ? btoa(nextMessage.goto) : nextMessage.goto
			}">Passer à la suite !</a></li></ul>`;
			return skipMessage;
		}
	});
	return message
}


// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
function processDirectiveSelectNext(message) {
	message = message.replaceAll(/!SelectNext:(.*)/g, function (match, v1) {
		if (match) {
			const v1Split = v1.split("/");
			nextMessage.lastMessageFromBot = "";
			nextMessage.goto = "";
			nextMessage.onlyIfKeywords = false;
			nextMessage.selected = getRandomElement(v1Split).trim();
			return "";
		} else {
			nextMessage.selected = '';
		}
	});
	return message
}

// Gestion de la directive "!Select: x" : on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
function processDirectiveSelect(response, options) {
	response = response.replaceAll(
		/\!Select ?: ?([0-9]*)/g,
		function (match, v1) {
			if (match && v1 <= options.length) {
				options = shuffleArray(options).slice(0, v1);
				return "<!--" + match + "-->";
			} else {
				return "";
			}
		}
	);
	return [response, options]
}

// Gestion de la directive !Bot: botName pour pouvoir avoir différents bots possibles
function processDirectiveBot(message,chatMessage) {
	message = message.replace(/!Bot:(.*)/, function(match, botName) {
		if(match && botName) {
			botName = botName.trim().replaceAll(' ','');
			chatMessage.classList.add('botName-'+botName);
		}
		return ''
	});
	return message
} 

// Possibilité d'avoir plusieurs bots qui répondent dans un même message
function processMultipleBots(html) {
	const htmlSplitDirectiveBot = html.split("<p>!Bot:");
	const numberOfBots = htmlSplitDirectiveBot.length;
	if(numberOfBots>1) {
		let newHtml = htmlSplitDirectiveBot[0];
		for (let index = 1; index < numberOfBots; index++) {
			const botMessageContent = htmlSplitDirectiveBot[index].trim();
			const botNameMatch = botMessageContent.match(/(.*?)<\/p>((.|\n)*)/);
			const botName = botNameMatch[1].trim();
			const botMessage = botNameMatch[2].trim();
			newHtml = newHtml + pauseTypeWriterMultipleBots + '<div class="message bot-message botName-'+botName+'">'+botMessage+'</div>';
		}
		html = newHtml;
	}
	return html
}

// Gestion du cas où il y a plusieurs messages possibles de réponse, séparés par "---"
function processRandomMessage(message) {
	const messageSplitHR = message.split("\n---\n");
	if (messageSplitHR.length > 1) {
		const messageHasOptions = message.indexOf(
			'<ul class="messageOptions">'
		);
		if (messageHasOptions > -1) {
			const messageWithoutOptions = message.substring(0, messageHasOptions);
			const messageOptions = message.substring(messageHasOptions);
			const messageWithoutOptionsSplitHR =
				messageWithoutOptions.split("---");
			message =
				getRandomElement(messageWithoutOptionsSplitHR) + messageOptions;
		} else {
			message = getRandomElement(messageSplitHR);
		}
	}
	return message
}

// Gestion de l'audio
function processAudio(message) {
	// Gestion des éléments audio autoplay
	message = message.replaceAll(
		/<audio[\s\S]*?src="([^"]+)"[\s\S]*?<\/audio>/gm,
		function (match, v1) {
			if (match.includes("autoplay")) {
				const audio = new Audio(v1);
				audio.play();
				return `<!--${match}-->`;
			} else {
				return match;
			}
		}
	);
	// Gestion de l'audio avec la directive !Audio
	message = message.replaceAll(/!Audio:(.*)/g, function (match, v1) {
		const audio = new Audio(v1.trim());
		audio.play();
		return "";
	});

	return message
}


// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en addOn si on veut l'utiliser)

function processKroki(message) {
	if (yaml.addOns && yaml.addOns.includes("kroki")) {
		message = message.replaceAll(
			/```(mermaid|tikz|graphviz|plantuml|excalidraw|vegalite|vega)((.|\n)*?)```/gm,
			function (match, type, source) {
				source = source.replaceAll("\n\n\n", "\n\n");
				return window.krokiCreateImageFromSource(type, source);
			}
		);
	}
	return message
}// Gestion des variables fixes : soit avant de parser le markdown, soit après
function processFixedVariables(content, preprocess = false) {
	// Les variables fixes qui commencent par _ sont traitées avant de parser le contenu du Markdown
	const regex = preprocess ? /@{(_\S+)}/g : /@{(\S+)}/g;
	return content.replaceAll(
		regex,
		function (match, variableName, positionMatch) {
			const positionLastMatch = content.lastIndexOf(match);
			if (yaml.variables && yaml.variables[variableName]) {
				const variableValue = yaml.variables[variableName];
				const variableValueSplit = variableValue.split("///");
				const variableValueChoice = getRandomElement(variableValueSplit);
				if (preprocess && positionMatch == positionLastMatch) {
					// Les variables fixes qui ont été traitées au tout début, avant de parser le contenu du Markdown, sont ensuite supprimés.
					delete yaml.variables[variableName];
				}
				return variableValueChoice;
			} else {
				return "@{" + variableName + "}";
			}
		}
	);
}let getLastMessage = false;

// Opérations autorisées pour le calcul des expressions complexes
const sanitizeCodeAllowedOperations = [
	'+','-','*','/',
	'<=', '>=',
	'<', '>',
	'==', '!=', 
	'&&', '||', '!',
];

// Sanitize le code avant d'utiliser new Function
function sanitizeCode(code) {
	// On supprime d'abord dans l'expression les variables dynamiques
	let codeWithoutAllowedOperations = code.replace(/tryConvertStringToNumber\(.*?\]\)/g,'');
	// On supprime ensuite les opérations autorisées
	sanitizeCodeAllowedOperations.forEach((allowedOperation) => {
		codeWithoutAllowedOperations = codeWithoutAllowedOperations.replaceAll(allowedOperation, "///");
	});
	// On supprime aussi tous les nombres (ils sont autorisés)
	codeWithoutAllowedOperations = codeWithoutAllowedOperations.replace(/[0-9]*/g,'');
	// On supprime les chaînes de caractères entre guillemets
	codeWithoutAllowedOperations = codeWithoutAllowedOperations.replace(/".*?"/g,'///');
	// Ne reste plus qu'une suite de caractères non autorisées qu'on va supprimer dans le code
	const forbiddenExpressions = codeWithoutAllowedOperations.split('///');
	forbiddenExpressions.forEach((forbiddenExpression) => {
		code = code.replaceAll(forbiddenExpression,'');
	});
	return code;
}

function evaluateExpression(expression,dynamicVariables) {
	// Si on est déjà dans le mode sécurisé (contrôle de la source des chatbots), on n'a pas besoin de sanitizer le code ; sinon, on sanitize le code
	expression = config.secureMode ? expression : sanitizeCode(expression);
	const result = new Function("dynamicVariables", "return " + expression)(dynamicVariables);
	return result
}

function processComplexDynamicVariables(complexExpression,dynamicVariables) {
	// Remplace "@variableName" par la variable correspondante, en la convertissant en nombre si c'est possible
	let calc = complexExpression.replace(
		/@(\w+)/g,
		function (match, varName) {
			return 'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])';
		}
	);
	// Évalue l'expression de manière sécurisée
	const calcResult = evaluateExpression(calc,dynamicVariables);
	return calcResult;
}

function processDynamicVariables(message,dynamicVariables,isUser) {
	// Cas où le message vient du bot
	if (!isUser) {
		// On traite le cas des assignations de valeurs à une variable, et on masque dans le texte ces assignations
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?(?<!@)(.*?)\`/g,
			function (match, variableName, variableValue) {
				if (!match.includes("calc(") && !match.includes("@INPUT")) {
					dynamicVariables[variableName] = variableValue;
					return match.includes("KEYBOARD") ? "<!--"+match+"-->" : "";
				} else {
					return match;
				}
			}
		);
		message = message.replaceAll('<!--<!--','<!--').replaceAll('-->-->','-->');
		// Possibilité d'activer ou de désactiver le clavier au cas par cas
		if (yaml.userInput === false) {
			if (dynamicVariables["KEYBOARD"] == "true") {
				document.body.classList.remove("hideControls");
				dynamicVariables["KEYBOARD"] = "false";
			} else {
				document.body.classList.add("hideControls");
			}
		} else {
			if (dynamicVariables["KEYBOARD"] == "false") {
				document.body.classList.add("hideControls");
				dynamicVariables["KEYBOARD"] = "true";
			} else {
				document.body.classList.remove("hideControls");
			}
		}
		// On remplace dans le texte les variables `@nomVariable` par leur valeur
		message = message.replaceAll(
			/\`@([^\s]*?)\`/g,
			function (match, variableName) {
				if (match.includes("=")) {
					return match;
				} else {
					return dynamicVariables[variableName]
						? dynamicVariables[variableName]
						: match;
				}
			}
		);
		// Calcul des variables qui dépendent d'autres variables
		const hasComplexVariable = message.includes("calc(") ? true : false;
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?calc\((.*)\)\`/g,
			function (match, variableName, complexExpression) {
				try {
					// Calcule l'expression complexe
					const calcResult = processComplexDynamicVariables(complexExpression,dynamicVariables);
					dynamicVariables[variableName] = calcResult;
					return "";
				} catch (e) {
					console.error("Error evaluating :", match, e);
					return "<!--" + match + "-->";
				}
			}
		);

		// Si on a des variables complexes ou s'il reste des variables sans assignation de valeur : 2e passage pour remplacer dans le texte les variables `@nomVariable` par leur valeur (qui vient d'être définie)
		if (hasComplexVariable || message.includes("`@")) {
			message = message.replaceAll(
				/\`@([^\s]*?)\`/g,
				function (match, variableName) {
					if (match.includes("=")) {
						return match;
					} else {
						return dynamicVariables[variableName]
							? dynamicVariables[variableName]
							: "";
					}
				}
			);
		}

		// On masque dans le texte les demandes de définition d'une variable par le prochain Input
		message = message.replaceAll(
			/\`@([^\s]*?) ?= ?@INPUT : (.*)\`/g,
			function (match, variableName, nextAnswer) {
				getLastMessage = match ? [variableName, nextAnswer] : false;
				return "";
			}
		);

		
		// Au lieu de récupérer l'input, on peut récupérer le contenu d'un bouton qui a été cliqué et on assigne alors ce contenu à une variable : pour cela on intègre la variable dans le bouton, et on la masque avec la classe "hidden"
		message = message.replaceAll(
			/ (@[^\s]*?\=.*?)\</g,
			'<span class="hidden">$1</span><'
		);
		message = message.replaceAll(
			/>(@[^\s]*?\=)/g,
			'><span class="hidden">$1</span>'
		);
		// Traitement du cas où on a l'affichage d'un contenu est conditionné par la valeur d'une variable
		message = message.replaceAll(
			/\`if (.*?)\`((\n|.*)*?)\`endif\`/g,
			function (match, condition, content) {
				if (condition) {
					try {
						// Remplace les variables personnalisées dans la condition
						condition = condition.replace(
							/@([^\s()&|!=<>]+)/g,
							function (match, varName) {
								return 'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])';
							}
						);
						// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
						condition = condition
							.replaceAll(
								/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|\&|\||$)/g,
								function (
									match,
									comparisonSignLeft,
									value,
									comparisonSignRight
								) {
									return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
								}
							)
							.replaceAll('""', '"')
							.replace('"undefined"', "undefined");
						// Évalue l'expression de manière sécurisée
						const result = evaluateExpression(condition,dynamicVariables);
						return result ? content : ""
					} catch (e) {
						console.error("Error evaluating condition:", condition, e);
						return "<!--" + condition + "-->";
					}
				} else {
					return "";
				}
			}
		);
		// On nettoie le message en supprimant les lignes vides en trop
		message = message.replaceAll(/\n\n\n*/g, "\n\n");
	} else {
		// Cas où le message vient de l'utilisateur

		// Traitement du cas où on a dans le message une assignation de variable (qui vient du fait qu'on a cliqué sur une option qui intégrait cette demande d'assignation de variable)
		message = message.replaceAll(
			/@([^\s]*?)\=(.*)/g,
			function (match, variableName, variableValue, offset) {
				if(match.includes('calc(')) {
					try {
						// Calcule l'expression complexe
						const complexExpression = variableValue.replace('calc(','').trim().slice(0, -1);
						const calcResult = processComplexDynamicVariables(complexExpression,dynamicVariables);
						dynamicVariables[variableName] = calcResult;
					} catch (e) {
						console.error("Error evaluating :", match, e);
						return "<!--" + match + "-->";
					}
				} else {
					dynamicVariables[variableName] = variableValue;
				}
				// S'il n'y avait pas de texte en plus de la valeur de la variable, on garde la valeur de la variable dans le bouton, sinon on l'enlève
				return offset == 0 ? variableValue : "";
			}
		);

		if (getLastMessage) {
			// Si dans le précédent message, on avait demandé à récupérer l'input : on récupère cette input et on le met dans la variable correspondante
			// Puis on renvoie vers le message correspondant
			if (getLastMessage && getLastMessage.length > 0) {
				dynamicVariables[getLastMessage[0]] = message;
				nextMessage.goto = getLastMessage[1];
				getLastMessage = false;
			} else {
				nextMessage.goto = "";
			}
		} else {
			nextMessage.goto = nextMessage.onlyIfKeywords ? nextMessage.goto : "";
		}
	}
	return message;
}function convertLatexExpressions(string) {
	string = string
		.replace(/\$\$(.*?)\$\$/g, "&#92;[$1&#92;]")
		.replace(/\$(.*?)\$/g, "&#92;($1&#92;)");
	let expressionsLatex = string.match(
		new RegExp(/&#92;\[.*?&#92;\]|&#92;\(.*?&#92;\)/g)
	);
	if (expressionsLatex) {
		// On n'utilise Katex que s'il y a des expressions en Latex dans le Markdown
		for (let expressionLatex of expressionsLatex) {
			// On vérifie le mode d'affichage de l'expression (inline ou block)
			const inlineMaths = expressionLatex.includes("&#92;[") ? true : false;
			// On récupère la formule mathématique
			let mathInExpressionLatex = expressionLatex
				.replace("&#92;[", "")
				.replace("&#92;]", "");
			mathInExpressionLatex = mathInExpressionLatex
				.replace("&#92;(", "")
				.replace("&#92;)", "");
			mathInExpressionLatex = mathInExpressionLatex
				.replaceAll("&lt;", "\\lt")
				.replaceAll("&gt;", "\\gt");
			mathInExpressionLatex = mathInExpressionLatex
				.replaceAll("<em>","_")
				.replaceAll("</em>","_")
				.replaceAll("&amp;","&")
				.replaceAll("\ ","\\ ");
			// On convertit la formule mathématique en HTML avec Katex
			const stringWithLatex = window.katex.renderToString(mathInExpressionLatex, {
				displayMode: inlineMaths,
			});
			string = string.replace(expressionLatex, stringWithLatex);
		}
	}
	// Optimisation pour le Latex avec l'effet typeWriter
	if(yaml.typeWriter === true) {
		string = string.replaceAll(
			/(<span class="katex-mathml">(.|\n)*?<\/span>)/gm,
			"`$1`"
		);
		string = string.replaceAll(/(<span class=".?strut">.*?<\/span>)/g, "`$1`");
	}
	return string;
}// Extensions pour Showdown

// Gestion des admonitions
function showdownExtensionAdmonitions() {
	return [
		{
			type: "output",
			filter: (text) => {
				text = text.replaceAll(/<p>:::(.*?)<\/p>/g, ":::$1");
				const regex = /:::(.*?)\n(.*?):::/gs;
				const matches = text.match(regex);
				if (matches) {
					let modifiedText = text;
					for (const match of matches) {
						const regex2 = /:::(.*?)\s(.*?)\n(.*?):::/s;
						const matchInformations = regex2.exec(match);
						const indexMatch = text.indexOf(match);
						// Pas de transformation de l'admonition en html si l'admonition est dans un bloc code
						const isInCode =
							text.substring(indexMatch - 6, indexMatch) == "<code>"
								? true
								: false;
						if (!isInCode) {
							let type = matchInformations[1];
							let title = matchInformations[2];
							if (type.includes("<br")) {
								type = type.replace("<br", "");
								title = "";
							}
							const content = matchInformations[3];
							let matchReplaced;
							if (title.includes("collapsible")) {
								title = title.replace("collapsible", "");
								matchReplaced = `<div><div class="admonition ${type}"><details><summary class="admonitionTitle">${title}</summary><div class="admonitionContent">${content}</div></details></div></div>`;
							} else {
								matchReplaced = `<div><div class="admonition ${type}"><div class="admonitionTitle">${title}</div><div class="admonitionContent">${content}</div></div></div>`;
							}
							modifiedText = modifiedText.replaceAll(match, matchReplaced);
						}
					}
					return modifiedText;
				} else {
					return text;
				}
			},
		},
	];
}

// Gestion du markdown dans les réponses du chatbot
const converter = new window.showdown.Converter({
	emoji: true,
	parseImgDimensions: true,
	simpleLineBreaks: true,
	simplifiedAutoLink: true,
	tables: true,
	openLinksInNewWindow: true,
	extensions: [showdownExtensionAdmonitions],
});

// Conversion du Markdown en HTML
function markdownToHTML(text) {
	text = text.replaceAll("\n\n|", "|");
	const html = converter.makeHtml(text).replaceAll('&amp;#96','\`&#96\`');
	return html;
}function levenshteinDistance(a, b) {
	/* Fonction pour calculer une similarité plutôt que d'en rester à une identité stricte */
	const aLength = a.length;
	const bLength = b.length;
	if (aLength === 0) return bLength;
	if (bLength === 0) return aLength;

	const matrix = [];
	for (let i = 0; i <= bLength; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= aLength; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= bLength; i++) {
		for (let j = 1; j <= aLength; j++) {
			const cost = a[j - 1] === b[i - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost
			);
		}
	}

	return matrix[bLength][aLength];
}

function hasLevenshteinDistanceLessThan(string, keyWord, distance) {
	// Teste la présence d'un mot dans une chaîne de caractère qui a une distance de Levenshstein inférieure à une distance donnée

	const words = string.split(" ");
	// On parcourt les mots

	for (const word of words) {
		// On calcule la distance de Levenshtein entre le mot et le mot cible
		const distanceLevenshtein = levenshteinDistance(word, keyWord);

		// Si la distance est inférieure à la distance donnée, on renvoie vrai
		if (distanceLevenshtein < distance) {
			return true;
		}
	}

	// Si on n'a pas trouvé de mot avec une distance inférieure à la distance donnée, on renvoie faux
	return false;
}

function removeAccents(str) {
	const accentMap = {
		à: "a",
		â: "a",
		é: "e",
		è: "e",
		ê: "e",
		ë: "e",
		î: "i",
		ï: "i",
		ô: "o",
		ö: "o",
		û: "u",
		ü: "u",
		ÿ: "y",
		ç: "c",
		À: "A",
		Â: "A",
		É: "E",
		È: "E",
		Ê: "E",
		Ë: "E",
		Î: "I",
		Ï: "I",
		Ô: "O",
		Ö: "O",
		Û: "U",
		Ü: "U",
		Ÿ: "Y",
		Ç: "C",
	};

	return str.replace(
		/[àâéèêëîïôöûüÿçÀÂÉÈÊËÎÏÔÖÛÜŸÇ]/g,
		(match) => accentMap[match] || match
	);
}

// Calcule le produit scalaire de deux vecteurs
function dotProduct(vec1, vec2) {
	const commonWords = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
	let dot = 0;
	for (const word of commonWords) {
		dot += (vec1[word] || 0) * (vec2[word] || 0);
	}
	return dot;
}

// Calcule la magnitude d'un vecteur
function magnitude(vec) {
	let sum = 0;
	for (const word in vec) {
		sum += vec[word] ** 2;
	}
	return Math.sqrt(sum);
}

function tokenize(text, titleResponse) {
	// Fonction pour diviser une chaîne de caractères en tokens, éventuellement en prenant en compte l'index de la réponse du Chatbot (pour prendre en compte différement les tokens présents dans le titre de la réponse)

	// On garde d'abord seulement les mots d'au moins 5 caractères et on remplace les lettres accentuées par l'équivalent sans accent
	let words = text.toLowerCase();
	words = words.replace(/,|\.|\:|\?|\!|\(|\)|\[|\||\/\]/g, "");
	words = words.replaceAll("/", " ");
	words = removeAccents(words);
	words =
		words
			.split(/\s|'/)
			.map((word) => word.trim())
			.filter((word) => word.length >= 5) || [];
	const tokens = [];

	// On va créer des tokens avec à chaque fois un poids associé
	// Plus le token est long, plus le poids du token est important
	const weights = [0, 0, 0, 0, 0.4, 0.6, 0.8];
	// Si le token correspond au début du mot, le poids est plus important
	const bonusStart = 0.2;
	// Si le token est présent dans le titre, le poids est très important
	const bonusInTitle = nextMessage.goto ? 100 : 10;

	function weightedToken(index, tokenDimension, word) {
		let weight = weights[tokenDimension - 1]; // Poids en fonction de la taille du token
		weight = index === 0 ? weight + bonusStart : weight; // Bonus si le token est en début du mot
		const token = word.substring(index, index + tokenDimension);
		if (titleResponse) {
			titleResponse = titleResponse.toLowerCase();
			// Bonus si le token est dans le titre
			if (titleResponse.includes(token)) {
				weight = weight + bonusInTitle;
			}
		}
		return { token, weight: weight };
	}

	const wordsLength = words.length;
	for (let wordIndex = 0; wordIndex < wordsLength; wordIndex++) {
		const word = words[wordIndex];
		// Premier type de token : le mot en entier ; poids le plus important
		tokens.push({ token: word, weight: 5 });
		// Ensuite on intègre des tokens de 5, 6 et 7 caractères consécutifs pour détecter des racines communes
		const wordLength = word.length;
		if (wordLength >= 5) {
			for (let i = 0; i <= wordLength - 5; i++) {
				tokens.push(weightedToken(i, 5, word));
			}
		}
		if (wordLength >= 6) {
			for (let i = 0; i <= wordLength - 6; i++) {
				tokens.push(weightedToken(i, 6, word));
			}
		}
		if (wordLength >= 7) {
			for (let i = 0; i <= wordLength - 7; i++) {
				tokens.push(weightedToken(i, 7, word));
			}
		}
	}
	return tokens;
}

function createVector(text, titleResponse) {
	// Fonction pour créer un vecteur pour chaque texte en prenant en compte le poids de chaque token et éventuellement l'index de la réponse du chatbot
	const tokens = tokenize(text, titleResponse);
	const vec = {};
	for (const { token, weight } of tokens) {
		if (token) {
			vec[token] = (vec[token] || 0) + weight;
		}
	}
	return vec;
}

function cosineSimilarity(str, vector) {
	// Calcul de similarité entre une chaîne de caractère (ce sera le message de l'utilisateur) et une autre chaîne de caractère déjà transformée en vecteur (c'est le vecteur de la réponse du chatbot)

	// Crée les vecteurs pour la chaîne de caractère (qui correspondra au message de l'utilisateur)
	const vectorString = createVector(str);

	// Calcule la similarité cosinus
	const dot = dotProduct(vectorString, vector);
	const mag1 = magnitude(vectorString);
	const mag2 = magnitude(vector);

	if (mag1 === 0 || mag2 === 0) {
		return 0; // Évitez la division par zéro
	} else {
		return dot / (mag1 * mag2);
	}
}const sendButton = document.getElementById("send-button");

function createChatBot(chatData) {
	let dynamicVariables = {};
	const params1 = Object.fromEntries(
		new URLSearchParams(document.location.search)
	);
	const params2 = Object.fromEntries(
		new URLSearchParams(document.location.hash.replace(/#.*\?/, ""))
	);
	const params = { ...params1, ...params2 };
	// On récupère les paramètres dans l'URL et on les place dans dynamicVariables
	// Si on utilise du contenu dynamique : on pourra utiliser ces variables
	for (const [key, value] of Object.entries(params)) {
		dynamicVariables["GET" + key] = value;
	}

	if (yaml.footer === false) {
		hideFooter();
	} else if (yaml.footer !== true) {
		footerElement.innerHTML = yaml.footer;
	}

	const chatbotName = chatData.pop();
	let initialMessage = chatData.pop();
	const chatDataLength = chatData.length;
	document.getElementById("chatbot-name").textContent = chatbotName;
	document.title = chatbotName;

	let optionsLastResponse = null;
	let randomDefaultMessageIndex = Math.floor(
		Math.random() * config.defaultMessage.length
	);
	let randomDefaultMessageIndexLastChoice = [];

	// Création du message par le bot ou l'utilisateur
	function createChatMessage(message, isUser) {
		const chatMessage = document.createElement("div");
		chatMessage.classList.add("message");
		chatMessage.classList.add(isUser ? "user-message" : "bot-message");
		nextMessage.selected = undefined;
		// Gestion des variables fixes prédéfinies
		message = processFixedVariables(message);

		if (!isUser) {
			message = processRandomMessage(message);
		}

		if (yaml.dynamicContent) {
			// On traite les variables dynamiques
			message = processDynamicVariables(message,dynamicVariables,isUser);
		}

		// Cas où c'est un message du bot
		if (!isUser) {
			// Gestion de la directive !Bot: botName
			message = processDirectiveBot(message,chatMessage);

			// Gestion de l'audio
			message = processAudio(message);

			// Gestion de la directive !Next: Titre réponse / message si mauvaise réponse
			message = processDirectiveNext(message);
			
			// Gestion de la directive !SelectNext pour sélectionner aléatoirement le prochain message du chatbot
			message = processDirectiveSelectNext(message);
			
			// Gestion de schémas et images créés avec mermaid, tikz, graphviz, plantuml …  grâce à Kroki (il faut l'inclure en addOn si on veut l'utiliser)
			message = processKroki(message);
		}

		let html = markdownToHTML(message);
		html = processMultipleBots(html);
		if (yaml.maths === true) {
			// S'il y a des maths, on doit gérer le Latex avant d'afficher le message
			html = convertLatexExpressions(html);
			setTimeout(() => {
				displayMessage(html, isUser, chatMessage);
			}, 100);
		} else {
			displayMessage(html, isUser, chatMessage);
		}
		if (nextMessage.selected) {
			chatbotResponse(nextMessage.selected);
		}
	}

	const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité
	const MATCH_SCORE_IDENTITY = 5; // Pour régler le fait de privilégier l'identité d'un mot à la simple similarité
	const BESTMATCH_THRESHOLD = 0.55; // Seuil pour que le bestMatch soit pertinent

	function responseToSelectedOption(optionLink) {
		// Gestion de la réponse à envoyer si on sélectionne une des options proposées
		if (optionLink != "") {
			for (let i = 0; i < chatDataLength; i++) {
				let title = chatData[i][0];
				title = yaml.obfuscate ? btoa(title) : title;
				if (optionLink == title) {
					let response = chatData[i][2];
					const options = chatData[i][3];
					response = Array.isArray(response) ? response.join("\n\n") : response;
					optionsLastResponse = options;
					response = options ? gestionOptions(response, options) : response;
					createChatMessage(response, false);
					break;
				}
			}
		} else {
			createChatMessage(initialMessage, false);
		}
	}

	let vectorChatBotResponses = [];
	// On précalcule les vecteurs des réponses du chatbot
	if (yaml.searchInContent || yaml.useLLM.ok) {
		for (let i = 0; i < chatDataLength; i++) {
			const responses = chatData[i][2];
			let response = Array.isArray(responses)
				? responses.join(" ").toLowerCase()
				: responses.toLowerCase();
			const titleResponse = chatData[i][0];
			response = titleResponse + " " + response;
			const vectorResponse = createVector(response, titleResponse);
			vectorChatBotResponses.push(vectorResponse);
		}
	}
	let vectorRAGinformations = [];

	function createVectorRAGinformations(informations) {
		if (informations) {
			const informationsLength = informations.length;
			for (let i = 0; i < informationsLength; i++) {
				const RAGinformation = informations[i];
				const vectorRAGinformation = createVector(RAGinformation);
				vectorRAGinformations.push(vectorRAGinformation);
			}
		}
	}

	if (window.useLLMpromise) {
		window.useLLMpromise
			.then(() => {
				if (window.useLLMragContentPromise) {
					window.useLLMragContentPromise.then(() => {
						createVectorRAGinformations(yaml.useLLM.RAG.informations);
					});
				} else {
					createVectorRAGinformations(yaml.useLLM.RAG.informations);
				}
			})
			.catch((error) => {
				console.error("Erreur d'accès aux données RAG : ", error);
			});
	}

	function chatbotResponse(inputText) {
		// Cas où on va directement à un prochain message (sans même avoir à tester la présence de keywords)
		if (nextMessage.goto != "" && !nextMessage.onlyIfKeywords) {
			inputText = nextMessage.goto;
		}
		let RAGbestMatchesInformation = "";
		let questionToLLM;
		if (yaml.useLLM.ok) {
			inputText = inputText.replace(
				'<span class="hidden">!useLLM</span>',
				"!useLLM"
			);
			questionToLLM = inputText.trim().replace("!useLLM", "");
			if (yaml.useLLM.RAG.informations) {
				// On ne retient dans les informations RAG que les informations pertinentes par rapport à la demande de l'utilisateur
				const cosSimArray = vectorRAGinformations.map((vectorRAGinformation) =>
					cosineSimilarity(questionToLLM, vectorRAGinformation)
				);
				const RAGbestMatchesIndexes = topElements(
					cosSimArray,
					yaml.useLLM.RAG.maxTopElements
				);
				RAGbestMatchesInformation = RAGbestMatchesIndexes.map(
					(element) => yaml.useLLM.RAG.informations[element[1]]
				).join("\n");
			}
		}

		// Choix de la réponse que le chatbot va envoyer
		if (yaml.detectBadWords === true && window.filterBadWords) {
			if (window.filterBadWords.check(inputText)) {
				createChatMessage(getRandomElement(config.badWordsMessage), false);
				return;
			}
		}

		let bestMatch = null;
		let bestMatchScore = 0;
		let bestDistanceScore = 0;
		let userInputTextToLowerCase = inputText.toLowerCase();
		let indexBestMatch;

		let optionsLastResponseKeysToLowerCase;
		let indexLastResponseKeyMatch;
		if (optionsLastResponse) {
			// On va comparer le message de l'utilisateur aux dernières options proposées s'il y en a une
			optionsLastResponseKeysToLowerCase = optionsLastResponse.map(
				(element) => {
					return element[0].toLowerCase();
				}
			);
			indexLastResponseKeyMatch = optionsLastResponseKeysToLowerCase.indexOf(
				userInputTextToLowerCase
			);
		}

		if (optionsLastResponse && indexLastResponseKeyMatch > -1) {
			// Si le message de l'utilisateur correspond à une des options proposées, on renvoie directement vers cette option
			const optionLink = optionsLastResponse[indexLastResponseKeyMatch][1];
			responseToSelectedOption(optionLink);
		} else {
			/* Sinon, on cherche la meilleure réponse possible en testant l'identité ou la similarité entre les mots ou expressions clés de chaque réponse possible et le message envoyé */
			for (let i = 0; i < chatDataLength; i++) {
				const titleResponse = chatData[i][0];
				const keywordsResponse = chatData[i][1];
				// Si on a la directive !Next, on teste seulement la similarité avec la réponse indiquée dans !Next et on saute toutes les autres réponses
				if (nextMessage.onlyIfKeywords && titleResponse != nextMessage.goto) {
					continue;
				}
				// Si on a la directive !Next, alors si la réponse à tester ne contient pas de conditions, on va directement vers cette réponse
				if (
					nextMessage.onlyIfKeywords &&
					titleResponse == nextMessage.goto &&
					keywordsResponse.length == 0
				) {
					userInputTextToLowerCase = nextMessage.goto.toLowerCase();
				}
				const keywords = keywordsResponse.concat(titleResponse);
				const responses = chatData[i][2];
				let matchScore = 0;
				let distanceScore = 0;
				if (yaml.searchInContent) {
					const cosSim = cosineSimilarity(
						userInputTextToLowerCase,
						vectorChatBotResponses[i]
					);
					matchScore = matchScore + cosSim + 0.5;
				}
				for (let keyword of keywords) {
					let keywordToLowerCase = keyword.toLowerCase();
					if (userInputTextToLowerCase.includes(keywordToLowerCase)) {
						// Test de l'identité stricte
						let strictIdentityMatch = false;
						if (nextMessage.onlyIfKeywords) {
							// Si on utilise la directive !Next, on vérifie que le keyword n'est pas entouré de lettres ou de chiffres dans le message de l'utilisateur
							userInputTextToLowerCase = removeAccents(
								userInputTextToLowerCase
							);
							keywordToLowerCase = removeAccents(keywordToLowerCase);
							const regexStrictIdentityMatch = new RegExp(
								`\\b${keywordToLowerCase}\\b`
							);
							if (regexStrictIdentityMatch.test(userInputTextToLowerCase)) {
								strictIdentityMatch = true;
							}
						} else {
							strictIdentityMatch = true;
						}
						if (strictIdentityMatch) {
							// En cas d'identité stricte, on monte le score d'une valeur plus importante que 1 (définie par MATCH_SCORE_IDENTITY)
							matchScore = matchScore + MATCH_SCORE_IDENTITY;
							// On privilégie les correspondances sur les keywords plus longs
							matchScore = matchScore + keywordToLowerCase.length / 10;
						}
					} else if (userInputTextToLowerCase.length > 4) {
						// Sinon : test de la similarité (seulement si le message de l'utilisateur n'est pas très court)
						if (
							hasLevenshteinDistanceLessThan(
								userInputTextToLowerCase,
								keyword,
								LEVENSHTEIN_THRESHOLD
							)
						) {
							distanceScore++;
						}
					}
				}
				if (matchScore == 0 && !nextMessage.onlyIfKeywords) {
					// En cas de simple similarité : on monte quand même le score, mais d'une unité seulement. Mais si on est dans le mode où on va directement à une réponse en testant la présence de keywords, la correspondance doit être stricte, on ne fait pas de calcul de similarité
					if (distanceScore > bestDistanceScore) {
						matchScore++;
						bestDistanceScore = distanceScore;
					}
				}
				// Si on a la directive !Next : titre réponse, alors on augmente de manière importante le matchScore si on a un matchScore > 0 et que la réponse correspond au titre de la réponse voulue dans la directive
				if (
					matchScore > 0 &&
					nextMessage.onlyIfKeywords &&
					titleResponse == nextMessage.goto
				) {
					matchScore = matchScore + MATCH_SCORE_IDENTITY;
				}
				if (matchScore > bestMatchScore) {
					bestMatch = responses;
					bestMatchScore = matchScore;
					indexBestMatch = i;
				}
			}
			// Soit il y a un bestMatch, soit on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
			if (
				(bestMatch && bestMatchScore > BESTMATCH_THRESHOLD) ||
				nextMessage.onlyIfKeywords
			) {
				if (bestMatch && nextMessage.onlyIfKeywords) {
					// Réinitialiser si on a trouvé la bonne réponse après une directive !Next
					nextMessage.lastMessageFromBot = "";
					nextMessage.goto = "";
					nextMessage.errorsCounter = 0;
					nextMessage.onlyIfKeywords = false;
				}
				// On envoie le meilleur choix s'il en existe un
				let selectedResponseWithoutOptions = bestMatch
					? Array.isArray(bestMatch)
						? bestMatch.join("\n\n")
						: bestMatch
					: "";
				const titleBestMatch = bestMatch ? chatData[indexBestMatch][0] : "";
				let optionsSelectedResponse = bestMatch
					? chatData[indexBestMatch][3]
					: [];
				// Cas où on veut aller directement à un prochain message mais seulement si la réponse inclut les keywords correspondant (sinon on remet le message initial)
				let selectedResponseWithOptions;
				if (nextMessage.onlyIfKeywords && titleBestMatch !== nextMessage.goto) {
					selectedResponseWithOptions = nextMessage.lastMessageFromBot.includes(
						nextMessage.messageIfKeywordsNotFound
					)
						? nextMessage.lastMessageFromBot
						: nextMessage.messageIfKeywordsNotFound + nextMessage.lastMessageFromBot;
				} else {
					selectedResponseWithOptions = gestionOptions(
						selectedResponseWithoutOptions,
						optionsSelectedResponse
					);
				}
				// Si on a dans le yaml useLLM avec le paramètre `always: true` OU BIEN si on utilise la directive !useLLM dans l'input, on utilise un LLM pour répondre à la question
				if (
					(yaml.useLLM.ok &&
						yaml.useLLM.url &&
						yaml.useLLM.model &&
						yaml.useLLM.always) ||
					inputText.includes("!useLLM")
				) {
					window.getAnswerFromLLM(
						questionToLLM.trim(),
						selectedResponseWithoutOptions + "\n" + RAGbestMatchesInformation
					);
					return;
				} else {
					createChatMessage(selectedResponseWithOptions, false);
				}
			} else {
				if (
					(yaml.useLLM.ok &&
						yaml.useLLM.url &&
						yaml.useLLM.model &&
						yaml.useLLM.always) ||
					inputText.includes("!useLLM")
				) {
					window.getAnswerFromLLM(questionToLLM, RAGbestMatchesInformation);
					return;
				} else {
					// En cas de correspondance non trouvée, on envoie un message par défaut (sélectionné au hasard dans la liste définie par defaultMessage)
					// On fait en sorte que le message par défaut envoyé ne soit pas le même que les derniers messages par défaut envoyés
					while (
						randomDefaultMessageIndexLastChoice.includes(
							randomDefaultMessageIndex
						)
					) {
						randomDefaultMessageIndex = Math.floor(
							Math.random() * config.defaultMessage.length
						);
					}
					if (randomDefaultMessageIndexLastChoice.length > 4) {
						randomDefaultMessageIndexLastChoice.shift();
					}
					randomDefaultMessageIndexLastChoice.push(randomDefaultMessageIndex);
					let messageNoAnswer = config.defaultMessage[randomDefaultMessageIndex];
					if (
						yaml.useLLM.ok &&
						!yaml.useLLM.always &&
						yaml.useLLM.url &&
						yaml.useLLM.model
					) {
						const optionMessageNoAnswer = [
							["Voir une réponse générée par une IA", "!useLLM " + inputText],
						];
						messageNoAnswer = gestionOptions(
							messageNoAnswer,
							optionMessageNoAnswer
						);
					}
					createChatMessage(messageNoAnswer, false);
				}
			}
		}
	}

	function gestionOptions(response, options) {
		// Si on a du contenu dynamique et qu'on utilise <!-- if @VARIABLE==VALEUR … --> on filtre d'abord les options si elles dépendent d'une variable
		if (yaml.dynamicContent && Object.keys(dynamicVariables).length > 0) {
			if (options) {
				options = options.filter((element) => {
					let condition = element[3];
					if (!condition) {
						return true;
					} else {
						// Remplace les variables personnalisées dans la condition
						condition = condition.replace(
							/@([^\s()&|!=<>]+)/g,
							function (match, varName) {
								return 'tryConvertStringToNumber(dynamicVariables["' + varName.trim() + '"])';
							}
						);
						// Gestion des valeurs si elles ne sont pas mises entre guillemets + gestion du cas undefined
						condition = condition
							.replaceAll(
								/(==|!=|<=|>=|<|>) ?(.*?) ?(\)|\&|\||$)/g,
								function (
									match,
									comparisonSignLeft,
									value,
									comparisonSignRight
								) {
									return `${comparisonSignLeft}"${value}" ${comparisonSignRight}`;
								}
							)
							.replaceAll('""', '"')
							.replace('"undefined"', "undefined");
						return evaluateExpression(condition,dynamicVariables)
					}
				});
			}
		}

		// S'il y a la directive !Select: x on sélectionne aléatoirement seulement x options dans l'ensemble des options disponibles
		[response, options] = processDirectiveSelect(response, options);

		// On teste s'il faut mettre de l'aléatoire dans les options
		if (shouldBeRandomized(options)) {
			options = randomizeArrayWithFixedElements(options);
		}
		if (options) {
			optionsLastResponse = options;
			// Gestion du cas où il y a un choix possible entre différentes options après la réponse du chatbot
			let messageOptions = '\n<ul class="messageOptions">';
			const optionsLength = options.length;
			for (let i = 0; i < optionsLength; i++) {
				const option = options[i];
				const optionText = option[0];
				const optionLink = option[1];
				messageOptions =
					messageOptions +
					'<li><a href="#' +
					optionLink +
					'">' +
					optionText +
					"</a></li>\n";
			}
			messageOptions = messageOptions + "</ul>";
			response = response + messageOptions;
		} else {
			optionsLastResponse = null;
		}
		return response;
	}

	// Gestion des événéments js
	sendButton.addEventListener("click", () => {
		const userInputText = userInput.innerText;
		if (userInputText.trim() !== "") {
			createChatMessage(userInputText, true);
			setTimeout(() => {
				chatbotResponse(userInputText);
				scrollWindow();
			}, 100);
			userInput.innerText = "";
		} else {
			const enterEvent = new KeyboardEvent("keypress", {
				key: "Enter",
				keyCode: 13,
				which: 13
			  });
			userInput.dispatchEvent(enterEvent);
		}
	});

	document.addEventListener("keypress", (event) => {
		userInput.focus();
		if (event.key === "Enter") {
			event.preventDefault();
			sendButton.click();
			scrollWindow();
		} else if (
			userInput.parentElement.parentElement.classList.contains("hideControls")
		) {
			// Si l'userInput est caché : on désactive l'entrée clavier (sauf pour Enter qui permet toujours d'afficher plus vite la suite)
			event.preventDefault();
		}
	});

	userInput.focus({ preventScroll: true });

	userInput.addEventListener("focus", function () {
		this.classList.remove("placeholder");
	});

	userInput.addEventListener("blur", function () {
		this.classList.add("placeholder");
	});

	function handleClick(event) {
		const target = event.target;
		if (target.tagName === "A") {
			// Gestion du cas où on clique sur un lien
			const currentUrl = window.location.href;
			const link = target.getAttribute("href");
			if (link.startsWith(currentUrl)) {
				// Si le lien est vers un autre chatbot (avec la même url d'origine), alors on ouvre le chatbot dans un autre onglet
				window.open(link);
			}
			if (link.startsWith("#")) {
				// Si le lien est vers une option, alors on envoie le message correspondant à cette option
				event.preventDefault();
				// Si on clique sur un lien après une directive !Next, on réinitalise les variables lastMessageFromBot, nextMessage.goto et nextMessage.onlyIfKeywords
				nextMessage.lastMessageFromBot = '';
				nextMessage.goto = '';
				nextMessage.onlyIfKeywords = false;
				let messageFromLink = target.innerText;
				// Si on a utilisé la directive !useLLM dans le lien d'un bouton : on renvoie vers une réponse par un LLM
				const linkDeobfuscated = yaml.obfuscate
					? atob(link.replace("#", ""))
					: link;
				if (
					yaml.useLLM.ok &&
					yaml.useLLM.url &&
					yaml.useLLM.model &&
					linkDeobfuscated.includes("!useLLM")
				) {
					messageFromLink = linkDeobfuscated
						.replace("#", "")
						.replace("!useLLM", '<span class="hidden">!useLLM</span>')
						.trim();
					createChatMessage(messageFromLink, true);
					chatbotResponse(messageFromLink);
				} else {
					createChatMessage(messageFromLink, true);
					const optionLink = link.substring(1);
					responseToSelectedOption(optionLink);
					// Supprimer le focus sur le bouton qu'on vient de cliquer
					document.activeElement.blur();
					// Refocaliser sur userInput
					if (autoFocus) {
						userInput.focus();
					}
				}
				// Si on clique sur un lien après une directive !Next, on réinitalise le compteur d'erreurs 
				nextMessage.errorsCounter = 0;
				scrollWindow();
			}
		}
	}

	chatContainer.addEventListener("click", (event) => handleClick(event));

	// Envoi du message d'accueil du chatbot
	initialMessage = gestionOptions(
		initialMessage[0].join("\n"),
		initialMessage[1]
	);

	if (yaml.dynamicContent) {
		// S'il y a des variables dynamiques dans le message initial, on les traite
		initialMessage = processDynamicVariables(initialMessage,dynamicVariables,false);
	}

	createChatMessage(initialMessage, false);
	initialMessage = initialMessage.replace(
		/<span class=\"unique\">.*?<\/span>/,
		""
	); // S'il y a un élément dans le message initial qui ne doit apparaître que la première fois qu'il est affiché, alors on supprime cet élément pour les prochaines fois
}let md = defaultMD;
let chatData;

document.getElementById("controls");

// Pour récupérer le markdown externe via le hash dans l'URL
function getMarkdownContent() {
	// On récupère l'URL du hashtag sans le #
	const url = window.location.hash.substring(1).replace(/\?.*/,'');
	// On traite l'URL pour pouvoir récupérer correctement la source du chatbot
	const sourceChatBot = handleURL(url);
	if (sourceChatBot !== "") {
		if (Array.isArray(sourceChatBot)) {
			// Cas où la source est répartie dans plusieurs fichiers
			const promises = sourceChatBot.map(url => fetch(url).then(data => data.text()));
			Promise.all(promises).then(data => {
				md = data.join("\n");
				chatData = parseMarkdown(md);
				createChatBot(chatData);
			}).catch((error) => console.error(error));
		} else {
			// Récupération du contenu du fichier
			fetch(sourceChatBot)
			.then((response) => response.text())
			.then((data) => {
				md = data;
				chatData = parseMarkdown(md);
				createChatBot(chatData);
			}).catch((error) => console.error(error));
		}
	} else {
		createChatBot(parseMarkdown(md));
	}
}

getMarkdownContent();

function parseMarkdown(markdownContent) {
	processYAML(markdownContent);
	
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
	let indexFirstH1title = markdownContent.indexOf("# ");
	const indexFirstH2title = markdownContent.indexOf("## ");
	if(indexFirstH2title > -1 && indexFirstH2title == indexFirstH1title - 1) {
		indexFirstH1title = 0;
	}
	let mainContent = markdownContent.substring(indexFirstH1title);
	if(yaml.variables) {
		mainContent = processFixedVariables(mainContent, true);
	}
	const mainContentWithoutH1 = mainContent.substring(1);
	// On récupère la séparation entre la première partie des données (titre + message principal) et la suite avec les réponses possibles
	const possibleTitles = ["# ","## ","### ","#### ","##### "];
	const indexOfFirstTitles = possibleTitles.map(title => mainContentWithoutH1.indexOf(title)).filter(index => index > 0);
	const indexAfterFirstMessage = Math.min(...indexOfFirstTitles);

	// Gestion de la première partie des données : titre + message initial
	const firstPart = mainContent.substring(0,indexAfterFirstMessage);
	// Gestion du titre
	const chatbotTitleMatch = firstPart.match(/# .*/);
	const chatbotTitle = chatbotTitleMatch ? chatbotTitleMatch[0] : "Chatbot";
	const chatbotTitleArray = chatbotTitle ? [chatbotTitle.replace('# ','').trim()] : [""];
	const indexStartTitle = firstPart.indexOf(chatbotTitle);
	// Gestion du message initial
	const initialMessageContent = chatbotTitleMatch ? firstPart.substring(indexStartTitle+chatbotTitle.length) : firstPart.substring(indexStartTitle);
	const initialMessageContentLines = initialMessageContent.split("\n");
	for (let line of initialMessageContentLines) {
		line = line.replace(/^>\s?/, "").trim();
		if (regexOrderedList.test(line)) {
			// Récupération des options dans le message initial, s'il y en a
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yaml.obfuscate ? btoa(link) : link;
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
		if (startsWithAnyOf(line,yaml.responsesTitles)) {
			// Gestion des identifiants de réponse, et début de traitement du contenu de chaque réponse
			if (currentH2Title) {
				chatbotData.push([
					currentH2Title,
					currentLiItems,
					content,
					lastOrderedList,
				]);
			}
			currentH2Title = line.replace(startsWithAnyOf(line,yaml.responsesTitles), "").trim(); // Titre h2
			currentLiItems = [];
			lastOrderedList = null;
			listParsed = false;
			content = [];
		} else if (line.startsWith("- ") && !listParsed) {
			// Gestion des listes
			currentLiItems.push(line.replace("- ", "").trim());
		} else if (yaml.dynamicContent && regexDynamicContentIfBlock.test(line)) {
			ifCondition = line.match(regexDynamicContentIfBlock)[1] ? line.match(regexDynamicContentIfBlock)[1] : '';
			content.push(line + "\n");
			listParsed = true;
		} else if (yaml.dynamicContent && line.includes('`endif`')) {
			ifCondition = '';
			content.push(line + "\n");
			listParsed = true;
		} else if (regexOrderedList.test(line)) {
			// Cas des listes ordonnées
			listParsed = false;
			if (!lastOrderedList) {
				lastOrderedList = [];
			}
			randomOrder = regexOrderedListRandom.test(line);
			const listContent = line.replace(/^\d+(\.|\))\s/, "").trim();
			let link = listContent.replace(/^\[.*?\]\(/, "").replace(/\)$/, "");
			link = yaml.obfuscate ? btoa(link) : link;
			const text = listContent.replace(/\]\(.*/, "").replace(/^\[/, "");
			lastOrderedList.push([text, link, randomOrder, ifCondition]);
			/* lastOrderedList.push(listContent); */
		} else if (line.length > 0 && !line.startsWith('# ')) {
			// Gestion du reste du contenu (sans prendre en compte les éventuels titres 1 dans le contenu)
			// Possibilité de faire des liens à l'intérieur du contenu vers une réponse
			line = line.replaceAll(/\[(.*?)\]\((#.*?)\)/g,'<a href="$2">$1</a>');
			content.push(line);
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
}})();