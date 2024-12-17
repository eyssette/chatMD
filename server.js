const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const PORT = process.argv[2] || 8888;

const ALLOWED_FILES = [
	"/index.html",
	"/script.min.js",
	"/favicon.svg",
	"/css/styles.min.css",
	"/css/themes/bubbles.css",
	"/js/addOns/badWords-fr.js",
	"/js/addOns/kroki.js",
	"/js/addOns/leo-profanity.js",
	"/js/addOns/pako.min.js",
	"/js/addOns/textFit.min.js",
];

const server = http.createServer((request, response) => {
	// Validation et nettoyage du chemin de fichier
	const uri = url.parse(request.url).pathname;

	// Vérification si le fichier est dans la liste des fichiers autorisés
	if (!ALLOWED_FILES.includes(uri)) {
		response.writeHead(403, { "Content-Type": "text/plain" });
		response.end("403 Forbidden");
		return;
	}

	const filename = path.normalize(path.join(process.cwd(), uri));

	// Vérification que le fichier est dans le répertoire courant
	if (!filename.startsWith(process.cwd())) {
		response.writeHead(403, { "Content-Type": "text/plain" });
		response.end("403 Forbidden");
		return;
	}

	// Détermine le type de contenu en fonction de l'extension
	const contentType =
		{
			".html": "text/html; charset=utf-8",
			".css": "text/css; charset=utf-8",
			".svg": "image/svg+xml",
		}[path.extname(filename)] || "application/octet-stream";

	// Lecture du fichier
	fs.readFile(filename, (readErr, file) => {
		if (readErr) {
			response.writeHead(404, { "Content-Type": "text/plain" });
			response.end("404 Not Found");
			return;
		}

		response.writeHead(200, { "Content-Type": contentType });
		response.end(file);
	});
});

// Démarrage du serveur
server.listen(PORT, () => {
	console.log(
		`Static file server running at\n  => http://localhost:${PORT}/index.html\nCTRL + C to shutdown`,
	);

	// Ouverture automatique de l'URL dans le navigateur
	const localUrl = `http://localhost:${PORT}/index.html`;

	// Déterminer la commande en fonction du système d'exploitation
	const startCommand =
		process.platform === "win32"
			? "start"
			: process.platform === "darwin"
				? "open"
				: "xdg-open"; // Linux

	exec(`${startCommand} ${localUrl}`, (err) => {
		if (err) {
			console.error(`Failed to open browser: ${err}`);
		}
	});
});
