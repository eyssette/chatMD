// Style CSS personnalisé pour le widget
const widgetStyle = `
#chatmdWidget {
	width: 80px;
	height: 80px;
	background-color: #f4f4f4;
	padding: 10px;
	cursor: pointer;
	position: fixed;
	border-radius:50%;
	bottom:40px;
	right:40px;
	font-family:sans-serif;
}

#chatmdWidget div:nth-of-type(1) {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
}

#chatmdWidget img {
	width:80%;
}

#chatmdWidget div:nth-of-type(2) {
	position: fixed;
	right:40px;
	bottom:150px;
	display: none;
	width: 400px;
	height: 600px;
	padding: 10px;
	border-radius: 15px;
	background: linear-gradient(90deg, rgb(239, 242, 247) 0%, 7.60286%, rgb(237, 240, 249) 15.2057%, 20.7513%, rgb(235, 239, 248) 26.297%, 27.6386%, rgb(235, 239, 248) 28.9803%, 38.2826%, rgb(231, 237, 249) 47.585%, 48.1216%, rgb(230, 236, 250) 48.6583%, 53.1306%, rgb(228, 236, 249) 57.6029%, 61.5385%, rgb(227, 234, 250) 65.4741%, 68.7835%, rgb(222, 234, 250) 72.093%, 75.7603%, rgb(219, 230, 248) 79.4275%, 82.8265%, rgb(216, 229, 248) 86.2254%, 87.8354%, rgb(213, 228, 249) 89.4454%, 91.8605%, rgb(210, 226, 249) 94.2755%, 95.4383%, rgb(209, 225, 248) 96.6011%, 98.3005%, rgb(208, 224, 247) 100%);
}

@media screen and (max-width: 500px) {
	#chatmdWidget {
		bottom: 10px;
		right: 10px;
	}
	#chatmdWidget div:nth-of-type(2) {
		right: 0px;
		padding: 0px;
		width: 100%;
		top: 0px;
		bottom: auto;
		height: 500px;
	}
	#chatmdWidget div:nth-of-type(2) iframe {
		width: 100%;
		height: 540px;
	}
}
`;

const styleElement = document.createElement("style");
styleElement.innerHTML = widgetStyle;
document.body.appendChild(styleElement);

const widgetScript = document.getElementById("chatmdWidgetScript");
const chatbotSRC = widgetScript.getAttribute("data-chatbot")
	? "#" + widgetScript.getAttribute("data-chatbot")
	: "";

const imageWidget = widgetScript.getAttribute("data-image") ? widgetScript.getAttribute("data-image") : 'https://chatmd.forge.apps.education.fr/message.svg';

// Créer un élément div avec l'id "chatmdWidget"
let widgetContainer = document.createElement("div");
widgetContainer.id = "chatmdWidget";

// Créer le premier sous-div
const widget = document.createElement("div");
widget.innerHTML = '<img src="'+imageWidget+'"/>';

// Créer le deuxième sous-div, qui est caché par défaut
const chatbotBox = document.createElement("div");

chatbotBox.innerHTML =
	'<iframe src="https://chatmd.forge.apps.education.fr/' +
	chatbotSRC +
	'" width="400" height="600" style="border:none"></iframe>';

// Ajouter les sous-divs à l'élément principal
widgetContainer.appendChild(widget);
widgetContainer.appendChild(chatbotBox);

// Ajouter l'élément principal au body
document.body.appendChild(widgetContainer);

// Ajouter un gestionnaire d'événements pour basculer l'affichage du deuxième div
widgetContainer.addEventListener("click", function () {
	if (chatbotBox.style.display === "block") {
		chatbotBox.style.display = "none";
	} else {
		chatbotBox.style.display = "block";
	}
});