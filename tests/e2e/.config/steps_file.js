// in this file you can append custom step methods to 'I' object

// on import la fonction decodeString depuis app/js/utils/strings.mjs
const { encodeString } = require("../../../app/js/utils/strings.mjs");

module.exports = function () {
	return actor({
		// Define custom steps here, use 'this' to access default methods of I.
		// It is recommended to place a general 'login' function here.
		askTheChatbot: async function (txt) {
			this.click("#user-input");
			this.fillField("#user-input", txt);
			this.click("#send-button");
		},
		loadAchatbot: async function (src) {
			if (src === "#") {
				this.amOnPage("");
				return;
			}

			// Si la source commence par # suivi immédiatmeent d'un caractère qui n'est pas un espace
			if (/^#\S/.test(src)) {
				this.amOnPage(src);
				return;
			}

			// Si la source commence par http
			if (/^https?:\/\//.test(src)) {
				this.amOnPage(src);
				return;
			}

			// Dernière possibilité : la source est un texte brut, on l'encode en base64 et on le passe en paramètre src)
			const decodedSrc = encodeString(src);
			this.amOnPage(decodedSrc);
		},
	});
};
