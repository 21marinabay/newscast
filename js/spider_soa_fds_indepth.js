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
		'SELECT * FROM ' + TABLE + ' WHERE faculty=\'SOA\'',
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
			
			var count = 1;
			var indepth_post = "";
			var qualifications = "";
			var research = "";
			var teaching = "";
			var achievement = "";
			var cv_link = "";
			
			$("iframe, td.bodytext td.bodytext p").each(function() {
				if ($(this).is("iframe")) {
					if ($(this).attr("src").indexOf("header") >= 0) {
						indepth_post = $(this).attr("src");
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
						cv_link = cv_link.substring(cv_link.indexOf("/pdf/"));
						
						cv_link = "http://www.accountancy.smu.edu.sg/faculty/accounting" + cv_link;
					} else if ($(this).is("p") && $(this).find("strong").length > 0) {
						achievement += $(this).html() + "<br />";
					}
				}
			});
			
			research = cleanup(research);
			teaching = cleanup(teaching);
			qualifications = cleanup(qualifications);
			achievement = cleanup(achievement);
			
			dive_post(email, indepth_post, qualifications, research, teaching, achievement, cv_link, name);
		}
	});
	
	c.queue(url);
}

function dive_post(email, indepth_post, qualifications, research, teaching, achievement, cv_link, name) {
	var post = "";
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			$(".subHeaderSOA").each(function() {
				post = $(this).html();
				post = cleanup(post);
			});
			
			saveData(email, post, qualifications, research, teaching, achievement, cv_link, name);
		}
	});
	
	c.queue(indepth_post);
}

function saveData(email, post, qualifications, research, teaching, achievement, cv_link, name) {
	var indepth = null;
	
	client.query(
		'UPDATE ' + TABLE + ' SET post=?,qualifications=?,research=?,teaching=?,achievement=?,cv_link=?,indepth=? WHERE email=?',
		[post, qualifications, research, teaching, achievement, cv_link, indepth, email],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			console.log("Final updates made on archive entry for " + name + ".");
		}
	);
}

function cleanup(str) {
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
}

crawl();
