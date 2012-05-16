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
			$("tr.bodytext, tr.bodytext_verdana").each(function() {
				if ($(this).is("tr.bodytext_verdana")) {
					name = $(this).find("a").html();
					name = cleanup(name);
					
					indepth = $(this).find("a").attr("href");
				} else if ($(this).is("tr.bodytext")) {
					var chunk = $(this).html();
					if (chunk.indexOf("EMAIL") > 0) {
						email = $(this).find("a").html();
					} else if (chunk.indexOf("PHONE") > 0) {
						phone = $(this).find("td:nth-child(2)").html();
						phone = cleanup(phone);
						phone = "(+65) " + phone;
						
						saveData(name, email, phone, indepth, "SOA");
					}
				}
			});
		}
	});
	
	c.queue(URL);
}

function saveData(name, email, phone, indepth, faculty) {
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
