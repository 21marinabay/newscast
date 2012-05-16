/* this is a js script to extract data from remote webpage. */
var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");
var DATABASE	= "super21_nodejs";
var TABLE		= "archives_highlights";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

function crawl(){
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
						var type = results[counter]['type'];
						
						if (results[counter]['content'] == null) {
							if (type == "A") {
								grabAlone(fullUrl);
							} else {
								grabSeries(fullUrl);
							}
						}
					}
				}
			}
		}
	);
}

function grabAlone(url) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',
		"callback":function(error,result,$) {
			var content = $("td.bodytext td.bodytext").html();
			
			saveData(content, url);
		}
	});

	c.queue(url);
}

function grabSeries(url) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',
		"callback":function(error,result,$) {
			var content = "";
			
			$("td.h2-subhead2 td.bodytext, p.readmore, p.h1-head, p.h1-head+p").each(function() {
				content += $(this).html();
			});
			
			saveData(content, url);
		}
	});

	c.queue(url);
}

function saveData(content, url) {
	client.query(
		"UPDATE " + TABLE + " SET content=? WHERE link=?",
		[content, url],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			console.log("Archive updated for " + url + ".");
		}
	);
}

crawl();
