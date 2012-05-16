var mysql		= require("mysql");

var DATABASE	= "super21_nodejs";
var TABLE		= "staff";

var pdfUrl		= "http://www.accountancy.smu.edu.sg/faculty/accounting/";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});
	
//using database
client.query('USE ' + DATABASE);

function drop() {
	client.query('DROP TABLE ' + TABLE,
	function selectCb(err) {
		if (err) {
			console.log(err.message);
			client.end();
			return null;
		}
		
		console.log("Table " + TABLE + " dropped.");
		client.end();
	});
}

drop();
