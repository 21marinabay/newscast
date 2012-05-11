var mysql		= require("mysql");
var DATABASE	= "super21_nodejs";
var TABLE		= "month_archives";

//preparing SQL
var client = mysql.createClient({
	user: "super21_nodejs",
	password: "nodejs",
});

//using database
client.query('USE ' + DATABASE);

client.query(
  'DROP TABLE IF EXISTS ' + TABLE,
  function selectCb(err, results, fields) {
	client.end();
  }
);
