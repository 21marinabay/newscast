var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "staff";

var URL			= "http://www.accountancy.smu.edu.sg/about_school/deanoffice.asp";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

//creating table if not already existing
client.query(
	'CREATE TABLE IF NOT EXISTS ' + TABLE +
	'(email VARCHAR(255) NOT NULL, ' +
	'name VARCHAR(255), ' +
	'faculty VARCHAR(4), ' +
	'post TEXT, ' +
	'phone VARCHAR(20), ' +
	'research TEXT, ' +
	'teaching TEXT, ' +
	'achievement TEXT, ' +
	'cv_link VARCHAR(255), ' +
	'indepth VARCHAR(255), ' +
	'qualifications TEXT, ' +
	'PRIMARY KEY (email))'
);

function crawl() {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*100, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var name = "";
			var email = "";
			var phone = "";
			var indepth = "";
			var post = "";
			$("table.bodytext p").each(function() {
				if ($(this).find("img").length == 0) {
					var chunk = $(this).html();
					if (chunk.indexOf("Email") < 0) {
						if ($(this).find("a").length != 0) {
							name = $(this).find("a").html();
							if (name.indexOf(",") >= 0) {
								name = name.substring(0, name.indexOf(","));
							}
							
							indepth = $(this).find("a").attr("href");
							indepth = indepth.replace("..", "");
							indepth = "http://www.accountancy.smu.edu.sg" + indepth;
							post = "";
						} else {
							name = chunk.substring(0, chunk.indexOf("<br"));
							name = removeTags(name);
							name = cleanup(name);
							
							post = chunk.substring(chunk.indexOf("<br") + 6);
							post = removeTags(post);
							post = cleanup(post);
							indepth = "";
						}
					} else {
						email = $(this).find("a").html();
						
						var phoneIndex = $(this).html().indexOf("Phone:") + 6;
						phone = $(this).html().substring(phoneIndex);
						phone = cleanup(phone);
						phone = removeTags(phone);
						
						saveData(name, email, phone, post, indepth, "SOA");
					}
				}
			});
		}
	});
	
	c.queue(URL);
}

function saveData(name, email, phone, post, indepth, faculty) {

	if (indepth == "") {
		indepth = null;
	}
	
	if (post == "") {
		post = null;
	}
	
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
					'INSERT INTO ' + TABLE + ' SET email=?, name=?, phone=?, post=?, indepth=?, faculty=?',
					[email, name, phone, post, indepth, faculty],
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
				console.log("An entry already exists for " + name + ".");
			}
		}
	);
}

function cleanup(str) {
	str = str.trim();
	return str.replace(/\s{2,}/g, ' ');;
}

function removeTags(str) {
	str = str.replace("<strong>", "");
	str = str.replace("</strong>", "");
	return str;
}

crawl();
