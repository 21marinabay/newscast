var Crawler = require("node-crawler").Crawler;

var c = new Crawler({
    "maxConnections":10,
    "callback":function(error,result,$) {
        $("#content a:link").each(function(a) {
            c.queue(a.href);
        })
    }
});

// Queue a list of URLs, with default callback
c.queue(["http://jamendo.com/","http://tedxparis.com", ...]);

// Queue URLs with custom callbacks
c.queue([{
    "uri":"http://parisjs.org/register",
    "method":"POST",
    "callback":function(error,result,$) {
        $("div:contains(Thank you)").after(" very much");
    }
}]);

// Queue some HTML code directly without grabbing (mostly for tests)
c.queue([{
    "html":"<p>This is a <strong>test</strong></p>"
}]);
