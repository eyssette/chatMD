const chatData = [
	["discussion1", ["hello", "you"], ["Hello how are you ?", "Good ?"], null],
	[
		"discussion2",
		["salut", "toi"],
		["Salut ça va", "Nickel ?"],
		["option 1", "option 2"],
	],
	["Nom du chatbot"],
];

const initialMessage = "Bonjour, en quoi puis-je vous être utile ?";

const chatbotName = chatData.pop();
document.getElementById("chatbot-name").textContent = chatbotName;

const chatContainer = document.getElementById("chat");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");

function createChatMessage(message, isUser) {
	const chatMessage = document.createElement("div");
	chatMessage.classList.add(isUser ? "user-message" : "bot-message");
	chatMessage.textContent = message;
	chatContainer.appendChild(chatMessage);
}

function levenshteinDistance(a, b) {
	if (a.length === 0) return b.length;
	if (b.length === 0) return a.length;

	const matrix = [];
	for (let i = 0; i <= b.length; i++) {
		matrix[i] = [i];
	}

	for (let j = 0; j <= a.length; j++) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= b.length; i++) {
		for (let j = 1; j <= a.length; j++) {
			const cost = a[j - 1] === b[i - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1,
				matrix[i][j - 1] + 1,
				matrix[i - 1][j - 1] + cost
			);
		}
	}

	return matrix[b.length][a.length];
}

const LEVENSHTEIN_THRESHOLD = 3; // Seuil de similarité
const MATCH_SCORE_IDENTITY = 5; // Pour régler le fait de privilégier l'identité d'un mot à la simple similarité

function chatbotResponse(userInputText) {
	let bestMatch = null;
	let bestMatchScore = 0;
	let bestDistanceScore = 0;
	let userInputTextToLowerCase = userInputText.toLowerCase();

	for (let i = 0; i < chatData.length; i++) {
		const keywords = chatData[i][1];
		const responses = chatData[i][2];
		let matchScore = 0;
		let distanceScore = 0;
		let distance = 0;
		for (let keyword of keywords) {
			let keywordToLowerCase=keyword.toLowerCase();
			if (userInputTextToLowerCase.includes(keywordToLowerCase)) {
				matchScore = matchScore + MATCH_SCORE_IDENTITY;
			} else {
				distance = levenshteinDistance(keywordToLowerCase, userInputTextToLowerCase);
				if (distance < LEVENSHTEIN_THRESHOLD) {
					distanceScore++;
				}
			}
		}
		/* console.log("matchScore:"+matchScore);
		console.log("distanceScore:"+distanceScore); */
		if (matchScore == 0) {
			if (distanceScore > bestDistanceScore) {
				matchScore++;
				bestDistanceScore = distanceScore;
			}
		}
		if (matchScore > bestMatchScore) {
			bestMatch = responses;
			bestMatchScore = matchScore;
		}
	}

	if (bestMatch) {
		for (let response of bestMatch) {
			createChatMessage(response, false);
		}
	} else {
		// Aucune correspondance trouvée
		createChatMessage("Désolé, je ne comprends pas votre question.", false);
	}
}

sendButton.addEventListener("click", () => {
	const userInputText = userInput.innerText;
	if (userInputText.trim() !== "") {
		createChatMessage(userInputText, true);
		chatbotResponse(userInputText);
		userInput.innerText = "";
	}
});

userInput.addEventListener("keyup", (event) => {
	if (event.key === "Enter") {
		sendButton.click();
	}
});

userInput.focus();

userInput.addEventListener('focus', function(){
  this.classList.remove('placeholder');
});

userInput.addEventListener('blur', function(){
	this.classList.add('placeholder');
});



// Message d'accueil du chatbot
createChatMessage(initialMessage, false);
