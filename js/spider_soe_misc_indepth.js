var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "staff";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

function crawl() {
	client.query(
		'SELECT * FROM ' + TABLE + ' WHERE faculty=\'SOE\'',
		function selectCb(err, results, fields) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			for (counter=0; counter < results.length; counter += 1) {
				var url = results[counter]['indepth'];
				if (url != null) {
					dive(url, results[counter]['email'], results[counter]['name'], results[counter]['post']);
				}
			}
		}
	);
}

function dive(url, email, name, post) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var cv_link = "";
			var qualifications = "";
			var research = "";
			
			var count = 1;
			$("span.bodytext, p.listSub, span.highlightTitle").each(function() {
				if ($(this).is("span.bodytext")) {
					cv_link = $(this).find("a:nth-child(2)").attr("href");
					var linkStartIndex = cv_link.indexOf("cv");
					if (linkStartIndex < 0) {
						linkStartIndex = cv_link.indexOf("CV");
					}
					cv_link = cv_link.substring(linkStartIndex);
					
					if (post.indexOf("Adjunct") >= 0) {
						cv_link = "http://www.economics.smu.edu.sg/faculty/adjuncts/" + cv_link;
					} else {
						cv_link = "http://www.economics.smu.edu.sg/faculty/visiting/" + cv_link;
					}
				} else if ($(this).is("p.listSub")) {
					if (count == 1) {
						qualifications = qualifications + $(this).html() + ";";
					} else if (count == 2) {
						research = research + $(this).html() + ";";
					}
				} else if ($(this).is("span.highlightTitle")) {
					count = 2;
				}
			});
			
			research = removeBreaks(research);
			research = cleanup(research);
			
			saveData(email, cv_link, qualifications, research, name);
		}
	});
	
	c.queue(url);
}

function saveData(email, cv_link, qualifications, research, name) {
	var indepth = null;
	client.query(
		'UPDATE ' + TABLE + ' SET cv_link=?, qualifications=?, research=?, indepth=? WHERE email=?',
		[cv_link, qualifications, research, indepth, email],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			console.log("Final update made on archive entry for " + name + ".");
		}
	);
}

function removeBreaks(str) {
	while(true) {
		var breakIndex = str.indexOf("<br />");
		if (breakIndex >= 0) {
			str = str.replace("<br />", "");
		} else {
			break;
		}
	}
	
	return str;
}

function cleanup(str) {
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
}

crawl();
