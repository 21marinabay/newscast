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

client.query(
  'SELECT * FROM '+ TABLE,
  function selectCb(err, results, fields) {
    if (err) {
      throw err;
    }

    console.log(results);
    console.log(fields);
    client.end();
  }
);
