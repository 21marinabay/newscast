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

//dropping table to reset data if existing
client.query(
	'DROP TABLE IF EXISTS ' + SAVE_TABLE
);

//creating table
client.query(
	'CREATE TABLE ' + SAVE_TABLE +
	'(id INT NOT NULL AUTO_INCREMENT, ' +
	'date VARCHAR(20), ' +
	'description TEXT, ' +
	'title TEXT, ' +
	'src TEXT, ' +
	'link VARCHAR(255), ' +
	'CONSTRAINT month_PK PRIMARY KEY (id))'
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
}

function grabdata(url, saveTo)
{
	var c = new Crawler({
	"maxConnections":100,
	"timeout":60*1000, // seconds
	"debug":true,
	"jQueryUrl": '/home/super21/newscast/jquery.min.js',
	"callback":function(error,result,$) {
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
				title = clean(title);
				var aUrl = $(this).find('a').attr("href");
				if (!(aUrl == undefined)) {
					if (aUrl.lastIndexOf("/news_room", 0) === 0) {
						aUrl = URL + aUrl;
					} else if (!(aUrl.lastIndexOf("http://", 0)) == 0) {
						aUrl = saveTo + aUrl;
					}
					
					var startIndex = body.indexOf('<br />')+6;
					var endIndex = body.indexOf('<br />', startIndex);
					var desc = body.substring(startIndex, endIndex);
					desc = desc.trim();
					desc = clean(desc);
					
					startIndex = body.lastIndexOf('<em>')+4;
					endIndex = body.indexOf('</em>', startIndex);
					var src = body.substring(startIndex, endIndex);
					src = src.trim();
					src = clean(src);
					
					saveData(date, title, aUrl, desc, src);
				}
			}
		});
	}
});

	c.queue(url);
}

function saveData(date, title, link, desc, src) {
	if (link != null) {
		client.query(
			'INSERT INTO ' + SAVE_TABLE + ' SET date = ?, description = ?, title = ?, src = ?, link = ?',
			[date, desc, title, src, link]
		);
		console.log("Saved archive successfully for " + link + ".");
	}
}

function clean(str) {
	if (str != null) {
		var start = 0;
		var end = 0;
		while (true) {
			//locate start and end of tag
			start = str.indexOf("<");
			end = str.indexOf(">", start);
			
			if (start < 0 && end < 0) {
				break;
			}
			
			end += 1;
			
			if (start > 0 && end < 0) {				//Got ">" no "<"
				str = str.substring(end+1);
			} else if (start < 0 && end > 0) {		//Got "<" no ">"
				str = str.substring(0, start);
			} else {
				var tag = str.substring(start, end);
				str = str.replace(tag, "");
			}
		}
		
		return str;
	}
	
	return null;
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
