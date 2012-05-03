<?php

/* this is to collect the news */


/* Function : to generate the url as follows automatically 
   http://www.smu.edu.sg/news_room/smu_in_the_news/2012/index.asp
*/

var Crawler = require("crawler").Crawler;

function robot(){

	$url = "http://www.smu.edu.sg/news_room/smu_in_the_news/";
	$year = "2008";
        
	for ( $counter = 2008 ; $counter <= 2012; $counter +=1) {
	
	$url = $url.$counter."/index.asp" ;
	echo $url ;
	grabpage($url);

	
	}
	
}



/* Let's collect the page data for the year. This would help us understand any issues for the data. Using Curl */


function  grabpage($url){
        //$url = "http://www.smu.edu.sg/news_room/smu_in_the_news/2012/index.asp" ;
	$ch = curl_init();
  	$timeout = 5;
  	curl_setopt($ch,CURLOPT_URL,$url);
  	curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
  	curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,$timeout);
  	$data = curl_exec($ch);
  	curl_close($ch);
  	echo $data;


  }

robot();



?>
