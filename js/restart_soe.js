var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "staff";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

client.query(
	'DELETE FROM ' + TABLE + ' WHERE faculty=\'SOE\'',
	function selectCb(err) {
		if (err) {
			console.log(err.message);
			client.end();
			return null;
		}
		
		console.log("All rows regarding SOE Faculty/Staff have been deleted.");
		client.end();
	}
);
