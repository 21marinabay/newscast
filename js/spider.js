/* this is a js script to extract data from remote webpage. */
var Crawler		= require("crawler").Crawler;
var mysql		= require("mysql");
var DATABASE	= "super21_nodejs";
var TABLE		= "archives";

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
	'(year CHAR(4), ' +
	'month VARCHAR(9), ' +
	'link VARCHAR(255), ' +
	'CONSTRAINT archive_PK PRIMARY KEY (month, year))'
);

function robot(){

        var url = "http://www.smu.edu.sg/news_room/smu_in_the_news/";
        var year = "2008";

        for (counter = 2008 ; counter <= 2012; counter +=1) {

                graburl = url+counter+"/index.asp" ;
                grabdata(graburl, counter);
                graburl = "";

        }
		
//		client.end();

}



function grabdata(url, year)
{
	var c = new Crawler({
	"maxConnections":100,
	"timeout":60*100, // seconds
	"debug":true,
	"jQueryUrl": '/home/super21/newscast/jquery.min.js',
	"callback":function(error,result,$) {

		console.log("Got page"+url);
		var srcText = $("ul").html();
		
		$srcText = $(srcText);
		
		$("li > a").each(function(i, $srcText) {
			var aUrl = $(this).attr("href");
			var aDate = $(this).html();
			
			saveData(aDate, aUrl);
		});
	}
});

	c.queue(url);
	console.log("Ended.");
}

function saveData(date, link) {
	date = trim(date);
	
	if (date.length > 0 && link.length > 0) {
		var firstSpaceLocation = date.indexOf(" ");
		var month = date.substring(0, firstSpaceLocation);
		
		var lastSpaceLocation = date.lastIndexOf(" ") + 1;
		var year = date.substring(lastSpaceLocation);
		
		if (!link.startsWith("/news_room/smu_in_the_news/")) {
			link = "/news_room/smu_in_the_news/" + year + "/" + link;
		}
		
		client.query(
			'SELECT * FROM ' + TABLE + ' WHERE year='+year + ' AND month='+month,
			function selectCb(err, results, fields) {
				if (results == undefined) {
					client.query(
						'INSERT INTO ' + TABLE + ' SET year = ?, month = ?, link = ?',
						[year, month, link]
					);
					console.log("Saved archive successfully for " + date + ".");
				} else {
					if (results.length > 0) {
						console.log("There is already an archive entry for " + date + ".");
					} else {
						client.query(
							'INSERT INTO ' + TABLE + ' SET year = ?, month = ?, link = ?',
							[year, month, link]
						);
						console.log("Saved archive successfully for " + date + ".");
					}
				}
			}
		);
	}
}

function trim(str)
{
    if(!str || typeof str != 'string')
        return null;

    return str.replace(/^[\s]+/,'').replace(/[\s]+$/,'').replace(/[\s]{2,}/,' ');
}

String.prototype.startsWith = function(s)
{
   if( this.indexOf(s) == 0 ) return true;
   return false;
}

robot();
