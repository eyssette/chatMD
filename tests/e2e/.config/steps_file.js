// in this file you can append custom step methods to 'I' object

module.exports = function () {
	return actor({
		// Define custom steps here, use 'this' to access default methods of I.
		// It is recommended to place a general 'login' function here.
		askTheChatbot: async function (txt) {
			this.click("#user-input");
			this.fillField("#user-input", txt);
			this.click("#send-button");
		},
		launchChatmd: async function (src, isRaw = false) {
			if (isRaw) {
				const encodedSrc = Buffer.from(encodeURIComponent(src)).toString(
					"base64",
				);
				this.amOnPage(`#${encodedSrc}?raw=1`);
				return;
			}

			if (src === "#") {
				this.amOnPage("");
				return;
			}

			// Si la source commence par # suivi immédiatement d'un caractère qui n'est pas un espace
			if (/^#\S/.test(src)) {
				this.amOnPage(src);
				return;
			}

			// Si la source commence par http
			if (/^https?:\/\//.test(src)) {
				this.amOnPage(src);
				return;
			}

			this.amOnPage("");
		},
	});
};
