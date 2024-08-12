var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    { exec } = require('child_process'),
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {
  

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

    fs.stat(filename, function(err,stats) {
      if (err) {
        response.writeHead(404, {'Content-Type': 'text/plain'})
        response.write('404 Not Found\n')
        response.end()
        return
      }
  
      if (stats.isDirectory()) filename += '/index.html'
  
      fs.readFile(filename, 'binary', function(err, file) {
        if(err) {
          response.writeHead(500, {'Content-Type': 'text/plain'})
          response.write(err + '\n')
          response.end()
          return
        }
        if(filename.includes("//index.html")) {
          const apiKey = process.env.LLM_API_KEY ? process.env.LLM_API_KEY.slice(1,-2) : "";
          file =  '<script>const process={env: {LLM_API_KEY: "'+apiKey+'"}}</script>' + file;
          response.writeHead(200)
          response.write(file, 'binary')
          response.end()
        } else {
          response.writeHead(200)
          response.write(file, 'binary')
          response.end()
        }
      })
    })
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

// Ouvrir automatiquement l'URL dans le navigateur
const localUrl = `http://localhost:${port}/`;
  
// Déterminer la commande en fonction du système d'exploitation
const startCommand = process.platform === 'win32' ? 'start' :
                     process.platform === 'darwin' ? 'open' :
                     'xdg-open'; // Linux

exec(`${startCommand} ${localUrl}`, (err) => {
  if (err) {
    console.error(`Failed to open browser: ${err}`);
  }
});