const chatData = [
    ["discussion1", ["hello", "you"], ["Hello how are you ?", "Good ?"], null],
    ["discussion2", ["coucou"], ["Salut ça va", "Nickel ?"], ["option 1", "option 2"]],
    ["Nom du chatbot"]
];

const chatbotName = chatData.pop();
document.getElementById('chatbot-name').textContent = chatbotName;

const chatContainer = document.getElementById('chat');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function createChatMessage(message, isUser) {
    const chatMessage = document.createElement('div');
    chatMessage.classList.add(isUser ? 'user-message' : 'bot-message');
    chatMessage.textContent = message;
    chatContainer.appendChild(chatMessage);
}

function chatbotResponse(userInputText) {
    for (let i = 0; i < chatData.length; i++) {
        const keywords = chatData[i][1];
        const responses = chatData[i][2];

        if (keywords.every(keyword => userInputText.includes(keyword))) {
            // Trouvé une correspondance, afficher la réponse du chatbot
            for (let response of responses) {
                createChatMessage(response, false);
            }
            return;
        }
    }
    // Aucune correspondance trouvée
    createChatMessage("Désolé, je ne comprends pas votre question.", false);
}

sendButton.addEventListener('click', () => {
    const userInputText = userInput.value;
    if (userInputText.trim() !== '') {
        createChatMessage(userInputText, true);
        chatbotResponse(userInputText);
        userInput.value = '';
    }
});

userInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

// Message d'accueil du chatbot
createChatMessage("Bonjour, en quoi puis-je vous être utile ?", false);
