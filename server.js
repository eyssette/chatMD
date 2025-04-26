const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");
const { createReadStream } = require("fs");

const PORT = process.argv[2] || 8888;

// Liste des fichiers autorisés
const ALLOWED_FILES = [
	"/app/index.html",
	"/app/script.min.js",
	"/app/script.min.js.map",
	"/app/favicon.svg",
	"/app/css/styles.min.css",
	"/app/css/themes/bubbles.css",
	"/app/js/addOns/badWords-fr.js",
	"/app/js/addOns/kroki.js",
	"/app/js/addOns/leo-profanity.js",
	"/app/js/addOns/pako.min.js",
	"/app/js/addOns/textFit.min.js",
	"/app/js/addOns/katex/katex.min.js",
	"/app/js/addOns/katex/katex.min.css",
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

const crypto = require("crypto"); // Pour générer un nonce

// Serveur HTTP sécurisé
const server = http.createServer((request, response) => {
	// Limite la taille maximale des requêtes pour éviter le DoS
	if (request.headers["content-length"] > 1024) {
		response.writeHead(413, { "Content-Type": "text/plain" });
		response.end("413 Payload Too Large");
		return;
	}

	const parsedUrl = url.parse(request.url);
	const publicPath = decodeURIComponent(
		parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname,
	);
	const requestedPath = path.normalize(path.join("/app", publicPath));

	const isAllowedFontFile =
		requestedPath.includes("app/js/addOns/katex/fonts/") &&
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

		if (requestedPath === "/app/index.html") {
			fs.readFile(filePath, "utf8", (err, data) => {
				if (err) {
					response.writeHead(500, { "Content-Type": "text/plain" });
					response.end("500 Internal Server Error");
					return;
				}

				const apiKey = process.env.LLM_API_KEY
					? process.env.LLM_API_KEY.slice(1, -2)
					: "";
				const nonce = crypto.randomBytes(16).toString("base64"); // Générer un nonce

				const injectedScript = `<script nonce="${nonce}">const process={env: {LLM_API_KEY: "${apiKey}"}}</script>`;
				const modifiedData = injectedScript + data;

				response.writeHead(200, {
					"Content-Type": contentType,
					"X-Content-Type-Options": "nosniff",
					"Content-Security-Policy": `script-src 'self' 'nonce-${nonce}'`,
					"Strict-Transport-Security":
						"max-age=63072000; includeSubDomains; preload",
					"Cache-Control": "no-cache, no-store, must-revalidate",
					Pragma: "no-cache",
					Expires: "0",
				});
				response.end(modifiedData);
			});
		} else {
			// Diffusion du fichier en streaming pour les autres fichiers
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

			const stream = createReadStream(filePath);
			stream.on("error", (error) => {
				console.error("File read error:", error);
				response.writeHead(500, { "Content-Type": "text/plain" });
				response.end("500 Internal Server Error");
			});
			stream.pipe(response);
		}
	});
});

// Démarrage du serveur
server.listen(PORT, () => {
	console.log(
		`Static file server running at:\n  => http://localhost:${PORT}/index.html\nCTRL + C to shutdown`,
	);
});
