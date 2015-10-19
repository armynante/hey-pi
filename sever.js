var http = require("http");
var Mongo = require("mongodb").MongoClient;

var url = 'mongodb://localhost:27017/hey-api';

var PORT = 8000;

var saveData = function(data) {

  MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server.");

		//get data
		var collection_name = data[1]; 
		var query = data[2]; 
		var collection = 	db.collection(collection_name).find();
		collection.find({"name":query});
		console.log(collection[0]);
		db.close();
  });

}
		

var server = http.createServer(function(req, resp) {
		debugger;
		var path = req.url.split("/");
		console.log(path);
		saveData(path);
		resp.end();
});

server.listen(8000, function(){
		console.log("Server listening on: http://localhost:8000");
});


 
