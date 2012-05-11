var request 		= require('request');
var fs 				= require('fs');

var mysql			= require("mysql");
var DATABASE		= "super21_nodejs";
var TABLE			= "month_archives";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});

//using database
client.query('USE ' + DATABASE);

function start() {
	client.query(
		('SELECT * FROM ' + TABLE),
		function selectCb(err, results, fields) {
			if (err) {
				console.log('GetData error: ' + err.message);
				client.end();
				return null;
			}
			
			if (typeof results == 'undefined') {
				console.log("gg");
			} else {
				if (results.length > 0) {
					for (counter = 0; counter<results.length; counter+=1) {
						var url = results[counter]['link'];
						if (endsWith(url, ".pdf")) {
							copy(url);
						}
					}
				}
			}
		}
	);
}

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function copy(filesrc) {
	var destination = "./pdfs";
	var point = filesrc.lastIndexOf("/");
	var fileName = filesrc.substring(point);
	destination = destination + fileName;
	
	request(filesrc).pipe(fs.createWriteStream(destination));
	console.log("Copied from: " + filesrc);
}

start();
