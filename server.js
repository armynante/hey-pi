var http = require("http");
var Mongo = require("mongodb").MongoClient;

var url = 'mongodb://localhost:27017/hey-pi';
var util = require('./utilities.js');

var getData = function(path) {

  Mongo.connect(url, function(err, db) {
		
	console.log("Connected correctly to server.");
							
		var collection_name = path[0]; 
		var query = path[1]; 
		
		debugger;
		var collection = db.collection(collection_name).find();
		//var collection = db.collection(collection_name);	
		var fieldNames = util.getFieldNames(collection);
		
		
		cursor.each(function(err, doc) {

			if( doc !== null) {
				console.log(doc)
			} 
			else {
				db.close();
			}
		});
  });

}

function saveData(path, data){

	var collectionName = path[0];
	var keys = Object.keys(data);

	Mongo.connect(url, function(err, db) {

		db.collection(collectionName, function(err,collection){
			debugger;
			if (err){
				console.log('theres error when calling collection')
			}
			else{
				collection.insertOne(data, function(err, data){
					if (err)
						throw err;
					else
						console.log('data saved properly');
				});
			}
		});

	});
}

var server = http.createServer(function(req, resp) {
	
	if (req.url!=="/favicon.ico"){
		switch(req.method){
			case "GET":
				var path = util.stripPath(req.url);
				items = getData(path);
				resp.end(items);
				break;
			case "POST":
				var data = "";
				var path = util.stripPath(req.url);
				req.on('data', function(chunk){
					console.log('received data', chunk)
					data+=chunk;
				});
				req.on('end', function(){
					data = JSON.parse(data);
					resp = saveData(path, data);
				});

				if (resp)
					resp.end("saved properly, yay!")
				break;
		}
	}
	
});

server.listen(8000, function(){
	console.log("Server listening on: http://localhost:8000");
});


 
