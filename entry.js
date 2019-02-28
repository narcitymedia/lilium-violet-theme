const endpoints = lilium_require('pipeline/endpoints');
const livevars = lilium_require('pipeline/livevars');
const hooks = lilium_require('lib/hooks');

const { handleMainCSS } = require('./stylesheet');
const { handleHomePage, handleSearchPage, handleSearchQuery, generateHomePage } = require('./generators');

class LiliumVioletTheme {
    enable(_c, info, done) {
        // Dynamic CSS stylesheet : Will compile LESS files into a CSS 
        endpoints.register(_c.id, 'style.css', 'GET', handleMainCSS);

        // Homepage : Passing an empty string as endpoint acts as a binding on "/"
        endpoints.register(_c.id, '', 'GET', handleHomePage);

        // Search page : for demonstration, it will be generated on each request
        endpoints.register(_c.id, 'search', 'GET', handleSearchPage);

        // Search query : this will act as an API endpoint to handle search queries
        endpoints.register(_c.id, 'find', 'GET', handleSearchQuery);

        // Hooks on event when homepage needs to be refreshed (article published for instance)
        hooks.bindSite(_c, 'homepage_needs_refresh', () => {
            generateHomePage(_c, () => {});
        });

        done();
    }

    disable(done) {
        done();
    }
}

module.exports = LiliumVioletTheme;
