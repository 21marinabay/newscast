 /* 
  * Need to make the crawler replace the image src path with new path 
  */


var Crawler = require("crawler").Crawler;
var request = require('request');
var fs = require('fs');
var myimages=new Array();
var s = 0 ;


//var mainlink = "http://www.smu.edu.sg/IITS" ; 

var mainlink = "http://www.smu.edu.sg/IITS/helpdesk_support/student/printer.asp#networkprinter" ; 
//Queue a list of URLs, with default callback



var c = new Crawler({
"maxConnections":100,
"timeout":60*100, // seconds
"debug":true,
"jQueryUrl": '/Applications/MAMP/htdocs/jquery.min.js',
"callback":function(error,result,$) {
	
		console.log("Got page"+mainlink);


		var bodytext = $("#bodycontent").html()  ;

      //writing the code to find all images and save start 
    
      $bodytext = $(bodytext);
   
      // console.log(mycontent);
      $("img").each(function(i,$bodytext) {
      
    	  
    	  
    	  var imgsrc = $(this).attr('src');
    	  
    	  //$(this).replaceWith( "<amol>" + imgsrc + "</amol>" );
    	// $(this).attr('src','gutter.jpg');
    	   
    	  
    	//  $(this).attr('src').val("gutter.jpg");
    	   
    	   
    	  
    	  myimages[s] = imgsrc ;  
	    	var myimg = imgsrc ; 
    	  	console.log("OriginalPath"+myimg);
    	  	var point1 =  myimg.indexOf("/"); 
    	  	point1 =  myimg.indexOf("/"); 
    	
    	  	if(point1==0){
    	  		var newurlstring = mainlink+myimg ;
    	  		Fileimagepath = "/var/www/html/iits/sites/default/files"+myimg ;
    	  		
    	  		//console.log("IF"+newurlstring);
    	  		//console.log("IFIMAGEPATH"+Fileimagepath); 
    	  		//console.log("SRCPATH   /iits/sites/default/files"+myimg);
    	  		
    	  		//$(this).attr('id','gutter.jpg');
    	  		
    	  		
    	  		
    	  		//request(newurlstring).pipe(fs.createWriteStream(Fileimagepath));
    	  	}
    	  	else{
			    
    	  		myaltimg = myimg.substr(point1);
    	  		var newurlstring = mainlink+"/"+myaltimg ;
    	  		//console.log("Else"+newurlstring);
    	  		Fileimagepath = "/var/www/html/iits/sites/default/files"+myaltimg ;
    	  		//console.log("ELSEIMAGEPATH"+Fileimagepath);
			    finalpath = "/iits/sites/default/files"+myaltimg ;
    	  		//console.log("Final Path"+"/iits/sites/default/files"+myaltimg);
    	  		$(this).attr('src','gutter1.jpg');
    	  			//	request(newurlstring).pipe(fs.createWriteStream(Fileimagepath));
    	  		
    	  	}
             s = s+1 ; 
    		
      });
       
      testchange = $bodytext.html();
	  console.log("bodymanipulated"+testchange);
	 
	 
	  
	  
	  
   } 
 });

c.queue(mainlink);



function unique(arrayName)
{
		var newArray=new Array();
			label:for(var i=0; i<arrayName.length;i++ )
			{  
				for(var j=0; j<newArray.length;j++ )
					{
					if(newArray[j]==arrayName[i]) 
					continue label;
					}
				newArray[newArray.length] = arrayName[i];
			}
		return newArray;
}






