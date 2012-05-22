var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "staff";

var URL			= "http://www.accountancy.smu.edu.sg/faculty/accounting/";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

function crawl(){
	var url = "http://www.economics.smu.edu.sg/faculty/visiting/";
	
	for (year = 2002; year <= 2012; year += 1) {
		var fullUrl = url + year + ".asp";
		
		dive(fullUrl);
	}
}

function dive(url) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var name = "";
			var supporting = "";
			var qualifications = "";
			var post = "Visiting Faculty";
			
			var chunk = $("td.bodytext td.bodytext").html();
			var startIndex = 0;
			var endIndex = 0;
			
			while (true) {
				startIndex = chunk.indexOf("<a href", endIndex);
				if (startIndex < 0) {
					break;
				}
				
				endIndex = chunk.indexOf("</em>", startIndex);
				var text = chunk.substring(startIndex, endIndex);
				
				var suppStartIndex = 0;
				var suppEndIndex = 0;
				
				var nameStartIndex = 0;
				var nameEndIndex = 0;
				
				while (true) {
					suppStartIndex = text.indexOf("a href=", nameEndIndex) + 8;
					suppEndIndex = text.indexOf("\"", suppStartIndex);
					supporting = text.substring(suppStartIndex, suppEndIndex);
					
					nameStartIndex = text.indexOf(">", suppEndIndex)+1;
					nameEndIndex = text.indexOf("</a>", nameStartIndex);
					name = text.substring(nameStartIndex, nameEndIndex);
					
					if (name.length > 0) {
						break;
					}
				}
				
				var qualStartIndex = text.indexOf("<br />", nameEndIndex) + 6;
				var qualEndIndex = text.indexOf("<br />", qualStartIndex);
				qualifications = text.substring(qualStartIndex, qualEndIndex);
				
				var durationIndex = text.indexOf("<em>", qualEndIndex)+4;
				var duration = text.substring(durationIndex);
				var fullPost = post + " (" + duration + ")";
				
				name = masterClean(name);
				qualifications = masterClean(qualifications);
				fullPost = masterClean(fullPost);
				
				saveData(name, supporting, qualifications, fullPost);
			}
		}
	});
	
	c.queue(url);
}

function saveData(name, supporting, qualifications, post) {
	var faculty = "SOE";
	var email = "N/A (" + name + ")";
	
	client.query(
		'SELECT * FROM ' + TABLE + ' WHERE email=?',
		[email],
		function selectCb(err, results, fields) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			if (results.length == 0) {
				client.query(
					'INSERT INTO ' + TABLE + ' SET email=?, name=?, supporting=?, qualifications=?, post=?, faculty=?',
					[email, name, supporting, qualifications, post, faculty],
					function selectCb(err, results, fields) {
						if (err) {
							console.log(err.message);
							client.end();
							return null;
						}
						
						console.log("Archive entry saved successfully for " + name + ".");
					}
				);
			} else {
				console.log("An archive entry already exists for " + name + ".");
			}
		}
	);
}

function masterClean(str) {
	str = removeBreaks(str);
	str = dropAnchors(str);
	str = removeStrong(str);
	str = cleanup(str);
	
	return str;
}
	

function cleanup(str) {
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
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

function dropAnchors(str) {
	while(true) {
		var anchorStartIndex = str.indexOf("<a");
		var anchorEndIndex = str.indexOf("</a>");
		
		var anchor;
		
		if (anchorStartIndex >= 0 && anchorEndIndex >= 0) {		//Both indexes found
			anchor = str.substring(anchorStartIndex, anchorEndIndex+4);
		} else if (anchorStartIndex >= 0 && anchorEndIndex < 0) {	//Only the start tag found; meaning it's at the end!
			anchor = str.substring(anchorStartIndex);
		} else if (anchorStartIndex < 0 && anchorEndIndex >= 0) {	//Only the end tag found; meaning it's at the start!
			anchor = str.substring(0, anchorEndIndex+4);
		} else {													//Both indexes not found
			break;
		}
		
		str = str.replace(anchor, "");
	}
	
	while (true) {
		var index = str.indexOf("</a>");
		if (index >= 0) {
			str = str.replace("</a>", "");
		} else {
			break;
		}
	}
	
	return str;
}

function removeStrong(str) {
	str = str.replace("<strong>", "");
	str = str.replace("</strong>", "");
	
	return str;
}

crawl();
