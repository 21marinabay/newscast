//Spider project for SMU: Press releases
var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "archives_press";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

//Dropping table if exists
client.query(
	'DROP TABLE IF EXISTS ' + TABLE
);

//creating table if not already existing
client.query(
	'CREATE TABLE IF NOT EXISTS ' + TABLE +
	'(id INT NOT NULL AUTO_INCREMENT, ' +
	'date VARCHAR(20), ' +
	'title TEXT, ' +
	'link VARCHAR(255), ' +
	'content TEXT, ' +
	'PRIMARY KEY (id))'
);

function crawl() {
	var url = "http://smu.edu.sg/news_room/press_releases/";
	
	for (year = 1999; year <= 2012; year += 1) {
		var graburl = url + year + "/index.asp";
		var halfurl = url + year + "/";
		grabdata(graburl, halfurl);
	}
}

function pausecomp(ms) {
	ms += new Date().getTime();
	while (new Date() < ms) {}
} 
	

function grabdata(url, halfurl) {
	var c = new Crawler({
		"maxConnections":100,
		"timeout":60*10000, // seconds
		"debug":true,
		"jQueryUrl": '/home/super21/newscast/jquery.min.js',
		"callback":function(error,result,$) {
			
			var bodyText = $(".bodytext").html();
			$bodyText = $(bodyText);
			
			//Extracting the links/dates
			
			var date = "";
			var title = "";
			var link = "";
			
			$("td.bodytext > p").each(function(i, $bodyText) {
				var chunk = $(this).html();
				if (chunk.length > 10) {
					var temp = findDate(chunk);
					if (temp.length > 0) {
						date = findDate(chunk);
					}

					title = findTitle(chunk);
					link = findLink(chunk, halfurl);
					
					saveData(date, title, link);
				}
			});
		}
	});

	c.queue(url);
}

function findDate(chunk) {
	var startIndex = chunk.indexOf("[");
	var endIndex = chunk.indexOf("]");
	
	if (startIndex < 0) {
		return "";
	}
	
	var date = chunk.substring(startIndex+1, endIndex);
	date = date.replace("<strong>", "");
	date = date.replace("</strong>", "");
	date = date.replace("<br>", "");
	
	return date;
}

function findTitle(chunk) {
	var startIndex = chunk.lastIndexOf("\">");
	var endIndex = chunk.indexOf("</a", startIndex);
	
	var title = chunk.substring(startIndex+2, endIndex);
	
	if (title.length == 0) {
		startIndex = chunk.indexOf("\">");
		endIndex = chunk.indexOf("</a", startIndex);
		
		title = chunk.substring(startIndex+2, endIndex);
	}
	return title;
}

function findLink(chunk, halfurl) {
	var startIndex = chunk.lastIndexOf("href=") + 6;
	var endIndex = chunk.indexOf("\"", startIndex);
	
	var link = chunk.substring(startIndex, endIndex);
	
	if (link.indexOf("12_jan06.asp") > 0) {
		startIndex = chunk.indexOf("href=") + 6;
		endIndex = chunk.indexOf("\"", startIndex);
		
		link = chunk.substring(startIndex, endIndex);
	}
	
	if (link.charAt(0) == '/') {
		link = "http://smu.edu.sg" + link;
	} else if (!link.startsWith("http://")) {
		link = halfurl + link;
	}
	
	return link;
}

function saveData(date, title, link) {
	client.query(
		'INSERT INTO ' + TABLE + ' SET date=?, title=?, link=?',
		[date, title, link]
	);
	console.log("Saved archive successfully for " + date + ".");
}

String.prototype.startsWith = function(s)
{
   if( this.indexOf(s) == 0 ) return true;
   return false;
}

crawl();
