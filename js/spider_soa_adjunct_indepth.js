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
				console.log(err);
				client.end();
				return null;
			}
			
			for (counter = 0; counter<results.length; counter+=1) {
				var url = results[counter]['indepth'];
				if (url != null) {
					dive("http://"+url, results[counter]['email'], results[counter]['name']);
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
			var post = "";
			var qualifications = "";
			var achievement = "";
			var cv_link = "";
		
			var count = 0;
		
			$("td.bodytext p").each(function() {
				if ($(this).html().indexOf("CV") >= 0) {
					var chunk = $(this).html();
					var anchorStartIndex = chunk.indexOf("Full");
					anchorStartIndex = chunk.lastIndexOf("href", anchorStartIndex)+6;
					var anchorEndIndex = chunk.indexOf("\"", anchorStartIndex);
					
					cv_link = chunk.substring(anchorStartIndex, anchorEndIndex);
					cv_link = cv_link.substring(cv_link.lastIndexOf("/")+1);
					cv_link = "http://www.accountancy.smu.edu.sg/faculty/accounting/pdf/" + cv_link;
				} else if ($(this).is(".listSub")) {
					qualifications += $(this).html();
					qualifications = cleanup(qualifications);
					qualifications += "<br /> ";
				} else if ($(this).find(".bodyHeader").length > 0) {
					post = $(this).find("span.subHeaderSOA").html();
					post = cleanup(post);
				} else if ($(this).html().indexOf("Achievement") >= 0) {
					count = 1;
				} else {
					if (count == 1) {
						achievement += $(this).html();
						achievement = cleanup(achievement);
						achievement += "<br /> ";
					}
				}
			});
			
			saveData(email, post, qualifications, achievement, cv_link, name);
		}
	});
	
	c.queue(url);
}

function saveData(email, post, qualifications, achievement, cv_link, name) {
	var indepth = null;
	client.query(
		'UPDATE ' + TABLE + ' SET post=?, qualifications=?, achievement=?, cv_link=?, indepth=? WHERE email=?',
		[post, qualifications, achievement, cv_link, indepth, email],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();
				return;
			}
			
			console.log("Final update made on archive entry for " + name + ".");
		}
	);
}

function cleanup(str) {
	str = str.trim();
	
	return str.replace(/\s{2,}/g, ' ');;
}

crawl();
