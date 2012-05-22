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
	var url = "http://www.economics.smu.edu.sg/faculty/adjuncts/index.asp";
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var name = "";
			var indepth = "";
			var post = "Adjunct Faculty";
			var email = "";
			var phone = "";
			$("td.bodytext td.bodytext td.bodytext").each(function() {
				name = $(this).find("a").html();
				name = removeBreaks(name);
				name = cleanup(name);
				
				indepth = $(this).find("a").attr("href");
				indepth = "http://www.economics.smu.edu.sg/faculty/adjuncts/" + indepth;
				
				var chunk = $(this).html();
				
				var emailStartIndex = chunk.indexOf("Email");
				emailStartIndex = chunk.indexOf("\">", emailStartIndex) + 2;
				var emailEndIndex = chunk.indexOf("</a>", emailStartIndex);
				
				email = chunk.substring(emailStartIndex, emailEndIndex);
				email = removeSpans(email);
				email = removeBreaks(email);
				email = cleanup(email);
				
				var phoneStartIndex = chunk.indexOf("Phone: ") + 7;
				var phoneEndIndex = chunk.indexOf("</p>", phoneStartIndex);
				
				if (phoneEndIndex >= 0) {
					phone = chunk.substring(phoneStartIndex, phoneEndIndex);
				} else {
					phone = chunk.substring(phoneStartIndex);
				}
				
				saveData(email, name, post, phone, indepth, "SOE");
			});
		}
	});
	
	c.queue(url);
}

function saveData(email, name, post, phone, indepth, faculty) {
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
					'INSERT INTO ' + TABLE + ' SET email=?, name=?, post=?, phone=?, indepth=?, faculty=?',
					[email, name, post, phone, indepth, faculty],
					function selectCb(err) {
						if (err) {
							console.log(err.message);
							client.end();
							return null;
						}
						
						console.log("Successfully saved archive entry for " + name + ".");
					}
				);
			} else {
				console.log("There is already an archive entry for " + name + ".");
			}
		}
	);
}

function cleanup(str) {
	str = str.replace("<strong>", "");
	str = str.replace("</strong>", "");
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
}

function removeSpans(str) {
	while (true) {
		var spanStartIndex = str.indexOf("<span");
		var spanEndIndex = str.indexOf("\">", spanStartIndex);
		var span;
		
		if (spanStartIndex >= 0 && spanEndIndex >= 0) {		//Both indexes found
			span = str.substring(spanStartIndex, spanEndIndex+2);
		} else if (spanStartIndex >= 0 && spanEndIndex < 0) {	//Only the start tag found; meaning it's at the end!
			span = str.substring(spanStartIndex);
		} else if (spanStartIndex < 0 && spanEndIndex >= 0) {	//Only the end tag found; meaning it's at the start!
			span = str.substring(0, spanEndIndex+2);
		} else {													//Both indexes not found
			break;
		}
		
		str = str.replace(span, "");
	}
	
	while (true) {
		var index = str.indexOf("</span>");
		if (index >= 0) {
			str = str.replace("</span>", "");
		} else {
			break;
		}
	}
	
	return str;
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

crawl();
