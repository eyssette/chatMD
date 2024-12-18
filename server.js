const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { createReadStream } = require("fs");

const PORT = process.argv[2] || 8888;

// Liste des fichiers autorisés
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
	"/js/addOns/katex/katex.min.js",
	"/js/addOns/katex/katex.min.css",
];

// Type MIME sécurisé
const MIME_TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "application/javascript; charset=utf-8",
	".svg": "image/svg+xml",
	".json": "application/json; charset=utf-8",
	".txt": "text/plain; charset=utf-8",
	".ico": "image/x-icon",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
};

// Serveur HTTP sécurisé
const server = http.createServer((request, response) => {
	// Limite la taille maximale des requêtes pour éviter le DoS
	if (request.headers["content-length"] > 1024) {
		response.writeHead(413, { "Content-Type": "text/plain" });
		response.end("413 Payload Too Large");
		return;
	}

	const parsedUrl = url.parse(request.url);
	const requestedPath = decodeURIComponent(parsedUrl.pathname); // Nettoyage des caractères encodés

	const isAllowedFontFile =
		requestedPath.includes("js/addOns/katex/fonts/") &&
		(requestedPath.endsWith(".woff2") ||
			requestedPath.endsWith(".woff") ||
			requestedPath.endsWith(".ttf"));

	// Vérification si le fichier demandé est autorisé
	if (!ALLOWED_FILES.includes(requestedPath) && !isAllowedFontFile) {
		response.writeHead(403, { "Content-Type": "text/plain" });
		response.end("403 Forbidden: Access Denied");
		return;
	}

	// Normalisation et sécurisation du chemin d'accès
	const filePath = path.normalize(path.join(process.cwd(), requestedPath));

	// Vérification pour s'assurer que le chemin reste dans le répertoire courant
	if (!filePath.startsWith(process.cwd())) {
		response.writeHead(403, { "Content-Type": "text/plain" });
		response.end("403 Forbidden: Invalid Path");
		return;
	}

	// Déterminer le type MIME
	const ext = path.extname(filePath);
	const contentType = MIME_TYPES[ext] || "application/octet-stream";

	// Lecture sécurisée du fichier
	fs.access(filePath, fs.constants.F_OK, (err) => {
		if (err) {
			response.writeHead(404, { "Content-Type": "text/plain" });
			response.end("404 Not Found: File does not exist");
			return;
		}

		// Réponse avec des en-têtes sécurisés
		response.writeHead(200, {
			"Content-Type": contentType,
			"X-Content-Type-Options": "nosniff",
			"Content-Security-Policy": "script-src 'self'",
			"Strict-Transport-Security":
				"max-age=63072000; includeSubDomains; preload",
			"Cache-Control": "no-cache, no-store, must-revalidate",
			Pragma: "no-cache",
			Expires: "0",
		});

		// Diffusion du fichier en streaming
		const stream = createReadStream(filePath);
		stream.on("error", (error) => {
			console.error("File read error:", error);
			response.writeHead(500, { "Content-Type": "text/plain" });
			response.end("500 Internal Server Error");
		});
		stream.pipe(response);
	});
});

// Démarrage du serveur
server.listen(PORT, () => {
	console.log(
		`Static file server running at:\n  => http://localhost:${PORT}/index.html\nCTRL + C to shutdown`,
	);
});
