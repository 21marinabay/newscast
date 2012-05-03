var Crawler = require("Crawler");

var c = new Crawler({
    "maxConnections":1,
    "timeout":60,
    "debug":true,
    "cache":true,
    "callback":function(error,result,$) {
        $("a").each(function(i,a) {
            console.log(a.href);
        })
    }
});

c.queue(["http://www.smu.edu.sg"]);


