/* this is a js script to extract data from remote webpage. */
var Crawler			= require("crawler").Crawler;
var mysql			= require("mysql");

var DATABASE		= "super21_nodejs";
var SELECT_TABLE	= "archives";
var SAVE_TABLE		= "month_archives";

var URL				= "http://www.smu.edu.sg";
var saveURL			= "http://www.smu.edu.sg/news_room/smu_in_the_news/"

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
	'(date VARCHAR(20), ' +
	'description TEXT, ' +
	'title TEXT, ' +
	'src TEXT, ' +
	'link VARCHAR(255) NOT NULL, ' +
	'PRIMARY KEY (link))'
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
						var saveTo = saveURL + results[counter]['year'] + "/";
						
						grabdata(fullUrl, saveTo);
					}
				}
			}
		}
	)
	
	client.end();
}

function grabdata(url, saveTo)
{
	var c = new Crawler({
	"maxConnections":100,
	"timeout":60*100, // seconds
	"debug":true,
	"jQueryUrl": '/home/super21/newscast/jquery.min.js',
	"callback":function(error,result,$) {

		console.log("-----------------------");
		console.log(url);
		console.log(saveTo);
		var bodyText = $(".bodytext").html();
		
		$bodyText = $(bodyText);
		var date = "";
		
		$("td.bodytext > p, ul").each(function(i, $bodyText) {
			if ($(this).is('p')) {
				var startIndex = $(this).html().indexOf('[')+1;
				var endIndex = $(this).html().indexOf(']');
				
				if (startIndex > 0) {
					date = $(this).html().substring(startIndex, endIndex);
				}
			} else if ($(this).is('ul')) {
				var body = $(this).html();
				
				var title = $(this).find('a').html();
				var aUrl = $(this).find('a').attr("href");
				
				var startIndex = body.indexOf('<br />')+6;
				var endIndex = body.indexOf('<br />', startIndex);
				var desc = body.substring(startIndex, endIndex);
				desc = desc.trim();
				
				startIndex = body.lastIndexOf('<em>')+4;
				endIndex = body.indexOf('</em>', startIndex);
				var src = body.substring(startIndex, endIndex);
				src = src.trim();
				src = saveTo + src;
				
				// console.log('date: ' + date);
				// console.log('title: ' + title);
				// console.log('link: ' + aUrl);
				// console.log('desc: ' + desc);
				// console.log('src: ' + src);
				
				//saveData(date, title, aUrl, desc, src);
			}
		});
	}
});

	c.queue(url);
}

function saveData(date, title, link, desc, src) {
	client.query(
		'SELECT * FROM ' + SAVE_TABLE + ' WHERE link='+link,
		function selectCb(err, results, fields) {
			if (results == undefined) {
				client.query(
					'INSERT INTO ' + SAVE_TABLE + ' SET date = ?, description = ?, title = ?, src = ?, link = ?',
					[date, desc, title, src, link]
				);
				console.log("Saved archive successfully for " + link + ".");
			} else {
				if (results.length > 0) {
					console.log("There is already an archive entry for " + link + ".");
				} else {
					client.query(
						'INSERT INTO ' + SAVE_TABLE + ' SET date = ?, description = ?, title = ?, src = ?, link = ?',
						[date, desc, title, src, link]
					);
					console.log("Saved archive successfully for " + date + ".");
				}
			}
		}
	);
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
//grabdata('http://www.smu.edu.sg/news_room/smu_in_the_news/2012/201205.asp');
