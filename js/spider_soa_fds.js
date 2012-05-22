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
	var url = "http://www.accountancy.smu.edu.sg/faculty/accounting/fds.asp";
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var name = "";
			var email = "";
			var phone = "";
			var indepth = "";

			$("td.bodytext td.bodytext tr").each(function() {
				if ($(this).is(".bodytext_verdana")) {
					name = $(this).find("a").html();
					indepth = $(this).find("a").attr("href");
				} else if ($(this).is(".bodytext")) {
					chunk = $(this).html();
					if (chunk.indexOf("EMAIL") >= 0) {
						email = $(this).find("a").html();
					} else if (chunk.indexOf("PHONE") >= 0) {
						phone = $(this).find("td:nth-child(2)").html();
					}
				}
			});

			saveData(name, email, phone, indepth);
		}
	});	
	c.queue(url);
}

function saveData(name, email, phone, indepth) {
	var faculty = "SOA";
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
					'INSERT INTO ' + TABLE + ' SET name=?, email=?, phone=?, indepth=?, faculty=?',
					[name, email, phone, indepth, faculty],
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

crawl();
