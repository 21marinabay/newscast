
/* this is a js script to extract data from remote webpage. */
var Crawler = require("crawler").Crawler;
var mysql = require("mysql");
var DATABASE = "super21_nodejs";
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});


function robot(){

	var url = "http://www.smu.edu.sg/news_room/smu_in_the_news/";
	var year = "2008";
        
	for (counter = 2008 ; counter <= 2012; counter +=1) {
	
		graburl = url+counter+"/index.asp" ;
		grabdata(graburl, counter);
		graburl = "";
	    
	}
	
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


			var bodytext=$("ul").html()  ;
		 	
			console.log("---START " + year + "---");
			console.log(bodytext);
			console.log("---END " + year + "---");
		  
		  
	   } 
	 });

	c.queue(url);
	
	
}

function startMySQL() {
	//using ddatabase
	client.query('USE ' + DATABASE);
	
	//creating table if not already existing
	client.query(
		'CREATE TABLE IF NOT EXISTS ' + TABLE +
		'(id INT(11) AUTO_INCREMENT, ' +
		'year CHAR(4), ' +
		'month CHAR(3), ' +
		'PRIMARY KEY (id))'
	);
}

function saveData(bodytext) {
	var index = 0;
	
}

startMySQL();
robot();





