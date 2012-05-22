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

function crawl() {
	var url = "http://www.accountancy.smu.edu.sg/faculty/accounting/adjunct/index.asp";
	
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			$("td.bodytext td.bodytext tr td:nth-child(2)").each(function() {
				if ($(this).find("a").length != 0) {
					var name = "";
					var email = "";
					var phone = "";
					var indepth = "";
				
					name = $(this).find("a:nth-child(1)").html();
					name = masterClean(name);
					indepth = $(this).find("a:nth-child(1)").attr("href");
					indepth = indepth.substring(indepth.lastIndexOf("/")+1);
					indepth = "www.accountancy.smu.edu.sg/faculty/accounting/adjunct/" + indepth;
					
					var chunk = $(this).html();
					var emailStartIndex = chunk.indexOf("Email")+7;
					var emailEndIndex = chunk.indexOf("</a>", emailStartIndex);
					email = chunk.substring(emailStartIndex, emailEndIndex);
					email = masterClean(email);
					
					var phoneStartIndex = chunk.indexOf("Phone")+7;
					var phoneEndIndex = chunk.indexOf("<", phoneStartIndex);
					phone = chunk.substring(phoneStartIndex, phoneEndIndex);
					phone = masterClean(phone);
					
					saveData(name, email, phone, indepth);
				}
			});
		}
	});
	
	c.queue(url);
}

function saveData(name, email, phone, indepth) {
	var faculty = "SOA";
	
	client.query(
		'SELECT * FROM ' + TABLE + ' WHERE email=?',
		[email],
		function (err, results, fields) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			if (results.length == 0) {
				client.query(
					'INSERT INTO ' + TABLE + ' SET email=?, name=?, phone=?, indepth=?, faculty=?',
					[email, name, phone, indepth, faculty],
					function selectCb(err) {
						if (err) {
							console.log(err.message);
							client.end();
							return null;
						}
						
						console.log("Saved archive successfully for " + name + ".");
					}
				);
			} else {
				console.log("There is already an entry for " + name + ".");
			}
		}
	);
}

function masterClean(str) {
	str = removeBreaks(str);
	str = removeStrong(str);
	str = dropAnchors(str);
	str = cleanup(str);
	
	return str;
}

function dropAnchors(str) {
	while(true) {
		var anchorStartIndex = str.indexOf("<a");
		var anchorEndIndex = str.indexOf(">", anchorStartIndex);
		
		if (anchorStartIndex < 0) {
			break;
		}
		
		var anchor = str.substring(anchorStartIndex, anchorEndIndex+1);
		
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

crawl();
