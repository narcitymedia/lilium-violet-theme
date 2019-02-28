const sharedcache = lilium_require('lib/sharedcache');
const filelogic = lilium_require('pipeline/filelogic');
const database = lilium_require('lib/db');

// Homepage will expire after 10 minutes
const HOMEPAGE_EXPIRY = 1000 * 60 * 10;
const ARTICLE_LIST_LIMIT = 30;

const ARTICLE_LIST_PIPELINE = [
    { $sort : { date : -1 } },
    { $limit : ARTICLE_LIST_LIMIT },
    { $lookup : {
        from : "uploads",
        localField : "media",
        foreignField : "_id",
        as : "featuredimage"
    }},
    { $lookup : {
        from : "editions",
        localField : "editions",
        foreignField : "_id",
        as : "alleditions"
    }},
    { $unwind : "$featuredimage" }
]

function generateHomePage(_c, sendback) {
    database.aggregate(_c, 'content', [
        { $match : { status : 'published', nsfw : { $ne : true } } },
        ...ARTICLE_LIST_PIPELINE
    ], posts => {
        filelogic.renderThemeLML(_c, 'home', 'index.html', { posts }, markup => {
            if (!markup || !Array.isArray(posts)) {
                sendback(new Error("Error generating homepage"));
            } else {
                sendback(undefined, markup);
            }
        });
    });
}

// Will generate home and store is in shared cache
module.exports.handleHomePage = function(cli) {
    const HOMEPAGE_KEY = 'homepage_' + cli._c.id;

    sharedcache.get(HOMEPAGE_KEY, (markup, expiry) => {
        // Quick check for markup and expiry < now
        if (markup && expiry && expiry < Date.now()) {
            // If homepage is in cache, send cached version
            cli.sendHTML(markup);
        } else {
            // Generate markup for homepage of current site
            generateHomePage(cli._c, (err, markup) => {
                if (err) {
                    cli.throwHTTP(500, err.toString(), true);
                } else {
                    // Store markup in shared cache, with expiry defined in file constant
                    sharedcache.set({ [HOMEPAGE_KEY] : { 
                        markup, expiry : Date.now() + HOMEPAGE_EXPIRY
                    } }, () => {
                        // Once stored, send markup
                        cli.sendHTML(markup);
                    });
                }
            });
        }
    });
};

module.exports.handleSearchPage = function(cli) {
    // For demonstration, the search page will be generated for all requests
    filelogic.renderThemeLML(cli._c, 'search', 'search.html', { }, markup => {
        cli.sendHTML(markup);
    });
};

module.exports.handleSearchQuery = function(cli) {
    // Search query will be passed as a URL query param
    const query = cli.routeinfo.params.q;

    if (!query) {
        cli.throwHTTP(400, 'Missing query param', true);
    } else {
        database.aggregate(cli._c, 'content', [
            { $match : { $text : { $search : query } } },
            ...ARTICLE_LIST_PIPELINE,
            { $project : { title : 1, url : 1 } }
        ], posts => {
            cli.sendJSON({ query, posts });
        })
    }   
}

module.exports.generateHomePage = generateHomePage;
