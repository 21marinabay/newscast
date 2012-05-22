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
					dive(url, results[counter]['email'], results[counter]['name']);
				}
			}
		}
	);
}

function dive(url, email, name) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var cv_link = "";
			var supporting = "";
			var qualifications = "";
			var research = "";
			
			var count = 1;
			var linkCount = 1;
			
			var length = 0;
			$("td.bodytext a, p.listSub, td.bodytext p.subHeaderSESS, td.bodytext p.highlightTitle").each(function() {
				length += 1;
			});
			
			$("td.bodytext a, p.listSub, td.bodytext p.subHeaderSESS, td.bodytext p.highlightTitle").each(function(index, element) {
				if ($(this).is("p.listSub")) {
					if (count == 1) {
						qualifications = qualifications + $(this).html() + ";";
					} else if (count == 2) {
						research = research + $(this).html() + ";";
					}
				} else if ($(this).is("p.subHeaderSESS") || $(this).is("p.highlightTitle")) {
					count = 2;
				} else if ($(this).is("a")) {
					if ($(this).html().indexOf("CV") >= 0) {
						cv_link = $(this).attr("href");
						cv_link = "http://www.economics.smu.edu.sg/faculty/economics/" + cv_link;
					} else if ($(this).html().indexOf("Homepage") >= 0) {
						supporting = $(this).attr("href");
					}
				}
					
				if (index == length-1) {
					qualifications = stripComments(qualifications);
					qualifications = cleanup(qualifications);
					
					research = stripComments(research);
					research = cleanup(research);
					
					saveData(email, cv_link, supporting, qualifications, research, name);
					
					//Resetting necessary values
					qualifications = "";
					research = "";
				}
			});
		}
	});
	
	c.queue(url);
}

function saveData(email, cv_link, supporting, qualifications, research, name) {
	var indepth = null;
	client.query(
		'UPDATE ' + TABLE + ' SET cv_link=?, supporting=?, qualifications=?, research=?, indepth=? WHERE email=?',
		[cv_link, supporting, qualifications, research, indepth, email],
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

function stripComments(s) {
	while (true) {
		var commentStartIndex = s.indexOf("<!--");
		var commentEndIndex = s.indexOf("--!>");
		
		var comment;

		if (commentStartIndex >= 0 && commentEndIndex >= 0) {		//Both indexes found
			comment = s.substring(commentStartIndex, commentEndIndex+4);
		} else if (commentStartIndex >= 0 && commentEndIndex < 0) {	//Only the start tag found; meaning it's at the end!
			comment = s.substring(commentStartIndex);
		} else if (commentStartIndex < 0 && commentEndIndex >= 0) {	//Only the end tag found; meaning it's at the start!
			comment = s.substring(0, commentEndIndex+4);
		} else {													//Both indexes not found
			break;
		}
		
		s = s.replace(comment, "");
	}
	
	return s;
}

function cleanup(str) {
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
}

crawl();
