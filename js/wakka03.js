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
			var post = $("span.subHeaderSOA").html();
			
			saveData(email, post, name);
		}
	});
	
	c.queue(url);
}

function saveData(email, post, name) {
	var indepth = null;
	client.query(
		'UPDATE ' + TABLE + ' SET post=?, indepth=? WHERE email=?',
		[post, indepth, email],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();
				return null;
			}
			
			console.log("Final update made to archive entry on " + name + ".");
		}
	);
}

crawl();
