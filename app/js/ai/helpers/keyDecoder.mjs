function xorEncryptDecrypt(message, password) {
	let output = "";
	for (let i = 0; i < message.length; i++) {
		// XOR chaque caractère de l'entrée avec le caractère correspondant du mot de passe (ou un cycle de celui-ci)
		output += String.fromCharCode(
			message.charCodeAt(i) ^ password.charCodeAt(i % password.length),
		);
	}
	return output;
}

// function xorEncrypt(message, passwordApiKey) {
// 	const xorMessage = xorEncryptDecrypt(message, passwordApiKey);
// 	const xorMessageEncoded = btoa(xorMessage);
// 	return xorMessageEncoded;
// }

function xorDecrypt(xorMessageEncoded, passwordApiKey) {
	const xorMessage = atob(xorMessageEncoded);
	const message = xorEncryptDecrypt(xorMessage, passwordApiKey);
	return message;
}

export function decodeApiKey(encryptedApiKey, passwordApiKey, method) {
	switch (method) {
		case "XOR":
			return xorDecrypt(encryptedApiKey, passwordApiKey);
		default:
			return "";
	}
}
