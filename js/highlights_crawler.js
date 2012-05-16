/* this is a js script to extract data from remote webpage. */
var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");
var DATABASE	= "super21_nodejs";
var TABLE		= "archives_highlights";

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
	'type CHAR(1), ' +
	'content TEXT, ' +
	'PRIMARY KEY (id))'
);

function crawl(){

	var url = "http://www.smu.edu.sg/news_room/smu_highlights/";

	// for (counter = 2012 ; counter <= 2012; counter +=1) {

		// graburl = url+counter+"/index.asp" ;
		// grabdata(graburl);
		// graburl = "";

	// }
	
//		client.end();

	grabdata(url);

}



function grabdata(url)
{
	var c = new Crawler({
	"maxConnections":100,
	"timeout":60*100, // seconds
	"debug":true,
	"jQueryUrl": '/home/super21/newscast/jquery.min.js',	
	"callback":function(error,result,$) {

		var srcText = $("td.bodytext").html();
		
		$srcText = $(srcText);
		
		$("td.bodytext > p").each(function(i, $srcText) {
			var chunk = $(this).html();
			if (chunk.indexOf(">(Series)</a>") >= 0) {
				processSeries(chunk);
			} else {
				processAlone(chunk);
			}
		});
	}
});

	c.queue(url);
}

function processSeries(chunk) {
	index = 0;
	while (true) {
		index = chunk.indexOf(">(Series)</a>", index);
		
		if (index < 0) {
			break;
		}
		
		var titleEndIndex = chunk.lastIndexOf("<a ", index);
		var titleStartIndex = chunk.lastIndexOf(">", titleEndIndex);
		var title = chunk.substring(titleStartIndex+1, titleEndIndex);
		
		title = title.trim();
		
		var linkStartIndex = chunk.lastIndexOf("href=\"", index)+6;
		var linkEndIndex = chunk.indexOf("\">", linkStartIndex);
		var link = chunk.substring(linkStartIndex, linkEndIndex);
		link = "http://smu.edu.sg/news_room/smu_highlights/" + link;
		
		saveData("", title, link, 'S');
		
		index += 1;
	}
}

function processAlone(chunk) {
	var index = chunk.indexOf("<br />");
	var date = chunk.substring(0, index);
	
	var dateStartIndex = date.indexOf("[");
	var dateEndIndex = date.indexOf("]");
	date = date.substring(dateStartIndex+1, dateEndIndex);
	
	chunk = chunk.substring(index);
	var linkStartIndex = chunk.indexOf("href=") + 6;
	
	var linkEndIndex = chunk.indexOf("\">", linkStartIndex);
	var link = chunk.substring(linkStartIndex, linkEndIndex);
	
	if (!link.startsWith("http://")) {
		link = "http://smu.edu.sg/news_room/smu_highlights/" + link;
	}
	
	var titleStartIndex = linkEndIndex+2;
	var titleEndIndex = chunk.indexOf("</a>", titleStartIndex);
	var title = chunk.substring(titleStartIndex, titleEndIndex);
	title = title.trim();
	
	saveData(date, title, link, 'A');
}

String.prototype.startsWith = function(s)
{
   if( this.indexOf(s) == 0 ) return true;
   return false;
}

function saveData(date, title, link, type) {
	client.query(
		"INSERT INTO " + TABLE + " SET date=?,title=?,link=?,type=?",
		[date, title, link, type],
		function selectCb(err) {
			if (err) {
				console.log(err.message);
				client.end();

				return null;
			}
			
			if (type == 'A') {
				console.log("Archive saved successfully for " + date);
			} else {
				console.log("Archive saved successfully for series");
			}
		}
	)
}

crawl();
