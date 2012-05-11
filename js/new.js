/* this is a js script to extract data from remote webpage. */
var Crawler			= require("crawler").Crawler;
var mysql			= require("mysql");

var DATABASE		= "super21_nodejs";
var SELECT_TABLE	= "archives";
var SAVE_TABLE		= "month_archives";

var URL				= "http://www.smu.edu.sg";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

//creating table if not already existing
client.query(
	'CREATE TABLE IF NOT EXISTS ' + SAVE_TABLE +
	'(id INT NOT NULL AUTO_INCREMENT, ' +
	'date VARCHAR(20), ' +
	'description TEXT, ' +
	'title TEXT, ' +
	'link VARCHAR(255), ' +
	'PRIMARY KEY (id))'
);

function robot(){
	client.query(
		('SELECT * FROM ' + SELECT_TABLE),
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
						var fullUrl = URL + results[counter]['link'];
						console.log(results[counter]['year'] + converter(results[counter]['month']) + ": " + fullUrl);
					}
				}
			}
		}
	)
	
	client.end();
}

function converter(month) {
	if (month == 'January') {
		return "01";
	} else if (month == 'February') {
		return "02";
	} else if (month == 'March') {
		return "03";
	} else if (month == 'April') {
		return "04";
	} else if (month == 'May') {
		return "05";
	} else if (month == 'June') {
		return "06";
	} else if (month == 'July') {
		return "07";
	} else if (month == 'August') {
		return "08";
	} else if (month == 'September') {
		return "09";
	} else if (month == 'October') {
		return "10";
	} else if (month == 'November') {
		return "11";
	} else if (month == 'December') {
		return "12";
	}
}

robot();
