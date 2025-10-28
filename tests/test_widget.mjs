import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer((req, res) => {
	if (req.url === "/widget.js") {
		// On part du dossier "test" et on remonte d’un cran, puis on va dans "widget/widget.js"
		const filePath = path.resolve(__dirname, "../widget/widget.js");

		fs.readFile(filePath, (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-Type": "text/plain" });
				res.end("Fichier non trouvé");
				return;
			}

			res.writeHead(200, { "Content-Type": "application/javascript" });
			res.end(data);
		});
	} else {
		// Page HTML par défaut
		res.writeHead(200, { "Content-Type": "text/html" });
		res.write(
			`<html>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<body>
					<script id="chatmdWidgetScript" src="http://localhost:3000/widget.js" data-chatbot=""></script>
				</body>
			</html>`,
		);
		res.end();
	}
});

server.listen(3000, () => {
	console.log("Serveur démarré sur http://localhost:3000");
});
