
/* this is a js script to extract data from remote webpage. */
var Crawler = require("crawler").Crawler;



function robot(){

	var url = "http://www.smu.edu.sg/news_room/smu_in_the_news/";
	var year = "2008";
        
	for (counter = 2008 ; counter <= 2012; counter +=1) {
	
		graburl = url+counter+"/index.asp" ;
		grabdata(graburl);
		graburl = "";
	    
	}
	
}



function grabdata(url)
{
	

	var c = new Crawler({
	"maxConnections":100,
	"timeout":60*100, // seconds
	"debug":true,
	"jQueryUrl": '/Applications/MAMP/htdocs/jquery.min.js',
	"callback":function(error,result,$) {
		
		console.log("Got page"+url);


			var bodytext = $("#bodycontent").html()  ;
		 
			console.log("Got page"+bodytext);
		  
		  
	   } 
	 });

	c.queue(url);
	
	
}

robot();





