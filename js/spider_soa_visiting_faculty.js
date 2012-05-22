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

var email = "";
var name = "";
var post = "";

var cv_link = "";
var qualifications = "";
var research = "";
var teaching = "";
var achievement = "";

var indepth_post = "";
var indepth_contact = "";

function crawl() {
	var url = "http://www.accountancy.smu.edu.sg/faculty/accounting/visiting/dsegal.asp";
	
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			
			var count = 1;
			
			$("iframe, td.bodytext td.bodytext p").each(function() {
				if ($(this).is("iframe")) {
					if ($(this).attr("src").indexOf("header") >= 0) {
						indepth_post = $(this).attr("src");
					} else if ($(this).attr("src").indexOf("contact") >= 0) {
						indepth_contact = $(this).attr("src");
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
			
			dive_contact(indepth_contact, indepth_post);
		}
	});
	
	c.queue(url);
	
}

function dive_contact(indepth_contact, indepth_post) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			$("a").each(function() {
				email = $(this).html();
				email = cleanup(email);
				email = removeBreaks(email);
			});
			
			dive_post(indepth_post);
		}
	});
	
	c.queue(indepth_contact);
}

function dive_post(indepth_post) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			$("span").each(function() {
				if ($(this).is("span.bodyHeader_verdana")) {
					name = $(this).html();
					name = cleanup(name);
					name = removeBreaks(name);
				} else if ($(this).is("span.subHeaderSOA")) {
					post = $(this).html();
					post = cleanup(post);
					post = removeBreaks(post);
				}
			});
			
			saveData();
		}
	});
	
	c.queue(indepth_post);
}

function saveData() {
	var faculty = "SOA";
	var indepth = null;
	
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
					'INSERT INTO ' + TABLE + ' SET name=?, email=?, post=?, research=?, teaching=?, faculty=?, qualifications=?, achievement=?, cv_link=?',
					[name, email, post, research, teaching, faculty, qualifications, achievement, cv_link],
					function selectCb(err) {
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
	return str.replace(/\s{2,}/g, ' ');
}

crawl();
