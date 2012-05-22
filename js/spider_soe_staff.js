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
	var url = "http://www.economics.smu.edu.sg/about_school/staff.asp";
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var chunk = $("td.bodytext td.bodytext").html();
			chunk = removeParagraphs(chunk);
			chunk = removeStrong(chunk);
			chunk = unComment(chunk);
			
			var nameStartIndex = 0;
			var nameEndIndex = 0;
			
			var postStartIndex = 0;
			var postEndIndex = 0;
			
			var emailStartIndex = 0;
			var emailEndIndex = 0;
			
			var phoneStartIndex = 0;
			var phoneEndIndex = 0;
			
			while (true) {
				var nameDist1 = chunk.indexOf("Professor", phoneEndIndex);
				var nameDist2 = chunk.indexOf("Ms", phoneEndIndex);
				var nameDist3 = chunk.indexOf("Mr", phoneEndIndex);
				var nameDist4 = chunk.indexOf("Mrs", phoneEndIndex);
				
				nameStartIndex = closest(nameDist1, nameDist2, nameDist3, nameDist4);
				if (nameStartIndex < 0) {
					break;
				}
				nameEndIndex = chunk.indexOf("<br />", nameStartIndex);
				var name = chunk.substring(nameStartIndex, nameEndIndex);
				
				postStartIndex = nameEndIndex + 6;
				postEndIndex = chunk.indexOf("Email", postStartIndex);
				var fullPost = chunk.substring(postStartIndex, postEndIndex);
				fullPost = removeSpans(fullPost);
				fullPost = cleanup(fullPost);
				
				emailStartIndex = chunk.indexOf("<a", postEndIndex);
				emailStartIndex = chunk.indexOf(">", emailStartIndex)+1;
				emailEndIndex = chunk.indexOf("</a>", emailStartIndex);
				var email = chunk.substring(emailStartIndex, emailEndIndex);
				
				phoneStartIndex = chunk.indexOf("Tel", emailEndIndex)+5;
				phoneEndIndex = chunk.indexOf("Fax", phoneStartIndex);
				var phone = chunk.substring(phoneStartIndex, phoneEndIndex);
				
				saveData(email, name, fullPost, phone, "SOE");
			}
		}
	});
	
	c.queue(url);
}

function saveData(email, name, post, phone, faculty) {
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
					'INSERT INTO ' + TABLE + ' SET email=?, name=?, post=?, phone=?, faculty=?',
					[email, name, post, phone, faculty],
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

function closest(dist1, dist2, dist3, dist4) {
	if (dist1 < 0 && dist2 < 0 && dist3 < 0 && dist4 < 0) {
		return -1;
	} else {
		var temp = 0;
		if (dist1 >= 0) {
			temp = dist1;
		}
		
		if (dist2 >= 0) {
			if (temp == 0) {
				temp = dist2;
			} else if (temp > dist2) {
				temp = dist2;
			}
		}
		
		if (dist3 >= 0) {
			if (temp == 0) {
				temp = dist3;
			} else if (temp > dist3) {
				dist3;
			}
		}
		
		if (dist4 >= 0) {
			if (temp == 0) {
				temp = dist4;
			} else if (temp > dist4) {
				dist4;
			}
		}
		
		return temp;
	}
}

function cleanup(str) {
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
}

function removeSpans(str) {
	while(true) {
		var spanstartIndex = str.indexOf("<span");
		var spanEndIndex = str.indexOf(">", spanstartIndex);
		
		var span;
		
		if (spanstartIndex < 0) {
			break;
		}
		
		span = str.substring(spanstartIndex, spanEndIndex+1);
		
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

function removeParagraphs(str) {
	while(true) {
		var pStartIndex = str.indexOf("<p");
		var pEndIndex = str.indexOf(">", pStartIndex);
		
		var p;
		
		if (pStartIndex < 0) {
			break;
		}
		
		p = str.substring(pStartIndex, pEndIndex+1);
		
		str = str.replace(p, "");
	}
	
	while (true) {
		var index = str.indexOf("</p>");
		if (index >= 0) {
			str = str.replace("</p>", "");
		} else {
			break;
		}
	}
	
	return str;
}

function removeStrong(str) {
	while (true) {
		if (str.indexOf("<strong>") >= 0) {
			str = str.replace("<strong>", "");
		} else {
			break;
		}
	}
	
	while (true) {
		if (str.indexOf("</strong>") >= 0) {
			str = str.replace("</strong>", "");
		} else {
			break;
		}
	}
	return str;
}

function unComment(str) {
	while (true) {
		var commentStartIndex = str.indexOf("<!--");
		var commentEndIndex = str.indexOf("-->");
		
		var comment;

		if (commentStartIndex >= 0 && commentEndIndex >= 0) {		//Both indexes found
			comment = str.substring(commentStartIndex, commentEndIndex+1);
		} else if (commentStartIndex >= 0 && commentEndIndex < 0) {	//Only the start tag found; meaning it's at the end!
			comment = str.substring(commentStartIndex);
		} else if (commentStartIndex < 0 && commentEndIndex >= 0) {	//Only the end tag found; meaning it's at the start!
			comment = str.substring(0, commentEndIndex+1);
		} else {													//Both indexes not found
			break;
		}
		
		str = str.replace(comment, "");
	}
	
	return str;
}

crawl();
