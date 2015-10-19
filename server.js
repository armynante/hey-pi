var http = require("http");
var Mongo = require("mongodb").MongoClient;

var url = 'mongodb://localhost:27017/hey-pi';

var PORT = 8000;

var saveData = function(data) {

  Mongo.connect(url, function(err, db) {
		
		console.log("Connected correctly to server.");
								
			var collection_name = data[1]; 
			var query = data[2]; 
			var cursor = db.collection('todos').find();
			cursor.each(function(err, doc) {
					if( doc !== null) {
							console.log(doc)
					} else {
							db.close();
					}
			});
  });

}
		

var server = http.createServer(function(req, resp) {
		var path = req.url.split("/");
		console.log(path);
		items = saveData(path);
		resp.end(items);
});

server.listen(8000, function(){
		console.log("Server listening on: http://localhost:8000");
});


 
