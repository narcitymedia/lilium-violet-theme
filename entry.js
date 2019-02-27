const endpoints = lilium_require('pipeline/endpoints');
const livevars = lilium_require('pipeline/livevars');

class LiliumVioletTheme {
    enable(_c, info, done) {
        done();
    }

    disable(done) {
        done();
    }
}

module.exports = LiliumVioletTheme;
