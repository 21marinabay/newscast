//Spider project for SMU: Press releases
var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "archives_press";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

function crawl() {
	client.query(
		('SELECT * FROM ' + TABLE),
		function selectCb(err, results, fields) {
			if (err) {
				console.log('GetData error: ' + err.message);
				client.end();
				return null;
			}
			
			if (typeof results == 'undefined') {
				console.log("gg");
			} else {
				if (results.length > 0) {
					for (counter = 0; counter<results.length; counter+=1) {
						var fullUrl = results[counter]['link'];
						
						if (!fullUrl.endsWith("#") && results[counter]['content'] == null) {
							grabdata(fullUrl);
						}
					}
				}
			}
		}
	)
}
	

function grabdata(url) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',
		"callback":function(error,result,$) {
			
			var content = $("td.bodytext > table > tr > td.bodytext").html();
			
			saveData(content, url);
		}
	});

	c.queue(url);
}

function saveData(content, url) {
	client.query(
		"UPDATE " + TABLE + " SET content=? WHERE link=?",
		[content, url]
	);
	
	console.log("Archive updated for " + url + ".");
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

crawl();
