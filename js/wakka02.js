var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "staff";

var pdfUrl		= "http://www.accountancy.smu.edu.sg/faculty/accounting/";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

function crawl() {
	client.query(
		'SELECT * FROM ' + TABLE,
		function selectCb(err, results, fields) {
			for (counter = 0; counter<results.length; counter+=1) {
				if (results[counter]['indepth'] != null) {
					grabdata(results[counter]['indepth'], results[counter]['name'], results[counter]['email']);
				}
			}
		}
	);
}

function grabdata(url, name, email) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*100, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var cv_link = "";
			var qualifications = "";
			var research = "";
			var teaching = "";
			var achievement = "";
			var indepth = "";
			
			var count = 1;
			
			$("td.bodytext td.bodytext p, td.bodytext td.bodytext iframe").each(function() {
				if ($(this).is("iframe")) {
					if ($(this).attr("src").indexOf("header") >= 0) {
						indepth = $(this).attr("src");
					}
				} else {
					if ($(this).find(".highlightTitle").length > 0 || $(this).is(".highlightTitle")) {
						var varToUse = null;
						if ($(this).is(".highlightTitle")) {
							varToUse = $(this).html();
						} else {
							varToUse = $(this).find(".highlightTitle").html();
						}
						
						if (varToUse.indexOf("Research") >= 0 && varToUse.indexOf("Teaching") >= 0) {
							count = 5;
						} else if (varToUse.indexOf("Research") >= 0) {
							count = 2;
						} else if (varToUse.indexOf("Teaching") >= 0) {
							count = 3;
						} else if (varToUse.indexOf("Achievement") >= 0) {
							count = 4;
						}
					} else if ($(this).is("p.listSub")) {
						switch (count) {
							case 1:
								qualifications += $(this).html() + "<br />";
								break;
							case 2:
								research += $(this).html() + "<br />";
								break;
							case 3:
								teaching += $(this).html() + "<br />";
								break;
							case 4:
								achievement += $(this).html() + "<br />";
								break;
							case 5:
								research += $(this).html() + "<br />";
								teaching += $(this).html() + "<br />";
								break;
						}
					} else if ($(this).find("a").length > 0) {
						cv_link = $(this).find("a").attr("href");
						cv_link = "http://www.accountancy.smu.edu.sg" + cv_link;
					} else if ($(this).is("p") && $(this).find("strong").length > 0) {
						achievement += $(this).html() + "<br />";
					}
				}
			});
			
			research = cleanup(research);
			teaching = cleanup(teaching);
			qualifications = cleanup(qualifications);
			achievement = cleanup(achievement);
			
			saveData(email, research, cv_link, teaching, qualifications, achievement, indepth, name);
		}
	});
	
	c.queue(url);
}

function saveData(email, research, cv_link, teaching, qualifications, achievement, indepth, name) {
	client.query(
		'UPDATE ' + TABLE + ' SET research=?, cv_link=?, teaching=?, qualifications=?, achievement=?, indepth=? WHERE email=?',
		[research, cv_link, teaching, qualifications, achievement, indepth, email],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			console.log("Sucessfully updated archive entry for " + name + ".");
		}
	);
}

function cleanup(str) {
	str = str.trim();
	return str.replace(/\s{2,}/g, ' ');
}

crawl();
