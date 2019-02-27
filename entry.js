const lesslib = require('less');
const pathlib = require('path');
const fs = require('fs');

const endpoints = lilium_require('pipeline/endpoints');
const livevars = lilium_require('pipeline/livevars');

function handleMainCSS(cli) {
    fs.readdir(pathlib.join(__dirname, 'less'), (err, dir) => {
        if (err || !dir) {
            cli.response.writeHead(500);
            cli.response.end(err ? err.toString() : "Main Less directory not found");
        } else {
            const code = dir.filter(x => x.endsWith('.less')).map(file => `@import "${pathlib.join(__dirname, 'less', file)}";`).join('\n');
            lesslib.render(code, { compress : false }, (err, result) => {
                if (err) {
                    cli.response.writeHead(500);
                    cli.response.end(err.toString());
                } else {
                    cli.response.writeHead(200, {
                        "Content-Type" : "text/css"
                    });
                    cli.response.end(result.css);
                }
            });
        }
    });
}

class LiliumVioletTheme {
    enable(_c, info, done) {
        endpoints.register(_c.id, 'style.css', 'GET', handleMainCSS);

        done();
    }

    disable(done) {
        done();
    }
}

module.exports = LiliumVioletTheme;
