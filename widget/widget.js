// Style CSS personnalisé pour le widget
const widgetStyle = `
#chatmdWidget {
	width: 80px;
	height: 80px;
	cursor: pointer;
	position: fixed;
	border-radius:50%;
	bottom:40px;
	right:40px;
	font-family:sans-serif;
	z-index:10000;
}

#chatmdWidget div:nth-of-type(1) {
	position:absolute;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #f4f4f4;
	padding: 10px;
	border-radius:50%;
	z-index:1;
	width: inherit;
	height: inherit;
	border:1px solid #b0b0b0;
}

#chatmdWidget img {
	width:80%;
}

#chatmdWidget div:nth-of-type(2) {
	position: fixed;
	right:30px;
	bottom:130px;
	display: none;
	width: 400px;
	height: min(600px,70vh);
	border-radius: 10px;
	border: 1px solid lightgrey;
   padding: 0.25em;
}
#chatmdWidget div:nth-of-type(2) iframe {
	padding: 0px;
	height:inherit;
}

@media screen and (max-width: 500px) {
	#chatmdWidget {
		bottom: 30px;
		right: 30px;
		width: 60px;
		height: 60px;
	}
	#chatmdWidget div:nth-of-type(1) {
		width: 60px;
		height: 60px;
	}
	#chatmdWidget img {
		width:90%;
	}
	#chatmdWidget div:nth-of-type(2) {
		right: 0px;
		padding: 0px;
		width: 100%;
		top: 0px;
		bottom: auto;
		height: 100vh;
	}
	#chatmdWidget div:nth-of-type(2) iframe {
		width: 100%;
		height: 100%;
		padding:0px;
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

const imageWidget = widgetScript.getAttribute("data-image")
	? widgetScript.getAttribute("data-image")
	: "https://chatmd.forge.apps.education.fr/widget/message.svg";

// Créer un élément div avec l'id "chatmdWidget"
let widgetContainer = document.createElement("div");
widgetContainer.id = "chatmdWidget";

// Créer le premier sous-div
const widget = document.createElement("div");
widget.innerHTML = '<img src="' + imageWidget + '"/>';

// Créer le deuxième sous-div, qui est caché par défaut
const chatbotBox = document.createElement("div");

chatbotBox.innerHTML =
	'<iframe sandbox="allow-scripts allow-modals allow-popups allow-same-origin" src="https://chatmd.forge.apps.education.fr/' +
	chatbotSRC +
	'" width="400" height="600" style="border:none" allow="fullscreen"></iframe>';

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
