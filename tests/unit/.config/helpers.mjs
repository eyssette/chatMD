import { JSDOM } from "jsdom";

export function getWindow() {
	const { window } = new JSDOM(`<!DOCTYPE html><body>
		<h1 id="chatbot-name">&nbsp;</h1>
		<main>
			<div id="chat" class="chat-container" role="region" aria-label="Zone de conversation">
					<!-- La conversation sera affichée ici -->
			</div>
			<div id="controls">
					<div id="input-container">
						<label id="user-input-label" class="sr-only" for="user-input">Écrivez votre message</label>
						<div id="user-input" contenteditable="true" placeholder="Écrivez votre message" tabindex="0" role="textbox" aria-labelledby="user-input-label" title="Écrivez votre message"></div>
					</div>
					<button id="send-button" type="button">Envoyer</button>
			</div>
		</main>
		<footer id="footer">
			ChatMD – Outil libre & gratuit créé par <a href="https://eyssette.forge.apps.education.fr/">Cédric Eyssette</a>
		</footer>
		<script src="script.min.js"></script>
	</body>`);
	return window;
}
