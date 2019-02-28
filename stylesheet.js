const lesslib = require('less');
const pathlib = require('path');
const fs = require('fs');

module.exports.handleMainCSS = function(cli) {
    // Read all files under ./less directory
    fs.readdir(pathlib.join(__dirname, 'less'), (err, dir) => {
        if (err || !dir) {
            cli.response.writeHead(500);
            cli.response.end(err ? err.toString() : "Main Less directory not found");
        } else {
            // Filter out anything that is not a .less file
            // Then, create import statements with absolute paths
            const code = dir.filter(x => x.endsWith('.less')).map(file => `@import "${pathlib.join(__dirname, 'less', file)}";`).join('\n');

            // Compile import string into CSS
            lesslib.render(code, { compress : false }, (err, result) => {
                if (err) {
                    cli.throwHTTP(500, err.toString());
                } else {
                    cli.response.writeHead(200, { "Content-Type" : "text/css" });
                    cli.response.end(result.css);
                }
            });
        }
    });
}

