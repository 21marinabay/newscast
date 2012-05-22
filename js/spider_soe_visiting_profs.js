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
	'supporting VARCHAR(255), ' +
	'PRIMARY KEY (email))'
);

function crawl() {
	var url = "http://www.economics.smu.edu.sg/faculty/visiting_professor/index.asp";
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*1000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
		"callback":function(error,result,$) {
			var name = "";
			var indepth = "";
			var post = "Visiting Professor";
			var email = "";
			var phone = "";
			
			$("td.bodytext td.bodytext, td.tableOddRowSESS").each(function() {
				if ($(this).is("td.tableOddRowSESS")) {
					name = $(this).find("a").html();
					name = removeTags(name);
					
					indepth = $(this).find("a").attr("href");
					indepth = "http://www.economics.smu.edu.sg/faculty/visiting_professor/" + indepth;
				} else if ($(this).find("span.style4").length > 0) {
					var chunk = $(this).find("span").html();
					var durationIndex = chunk.indexOf("<br />");
					var temp = chunk.substring(0, durationIndex);
					
					temp = temp.replace("DURATION OF VISIT: ", "");
					post = post + " ("+temp+")";
					
					email = $(this).find("a").html();
					
					var phoneStartIndex = chunk.indexOf("PHONE") + 7;
					phone = chunk.substring(phoneStartIndex);
					
					saveData(name, email, post, phone, indepth, "SOE");
					
					post = "Visiting Professor";
				}
			});
		}
	});
	
	c.queue(url);
}

function saveData(name, email, post, phone, indepth, faculty) {
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
					'INSERT INTO ' + TABLE + ' SET name=?, email=?, post=?, phone=?, indepth=?, faculty=?',
					[name, email, post, phone, indepth, faculty],
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

function removeTags(str) {
	str = str.replace("<strong>", "");
	str = str.replace("</strong>", "");
	return str;
}

crawl();
