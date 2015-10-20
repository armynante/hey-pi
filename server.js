var http = require("http");
var Mongo = require("mongodb").MongoClient;
var _ = require("underscore");
var url = 'mongodb://localhost:27017/hey-pi';
var util = require('./utilities.js');

var getData = function(data) {

	Mongo.connect(url, function(err, db) {
		
		console.log("Connected correctly to server.");
								
		var collection_name = data[0]; 
		var query = data[1]; 
		debugger;
		var mongoQuery = util.parseQuery(query);
		var cursor = db.collection(collection_name).find(mongoQuery);
		cursor.forEach(function(doc) {
			if( doc !== null) {
					console.log(doc)
			} else {
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
			
			if (err){
				console.log(err);	
				console.log('theres error when calling collection')
			}
			else{
				console.log("in the second find");
					db.collection("schemas", function(err,schema) {
							
							result = schema.find({"collectionName":collectionName})
							
							result.forEach(function(doc){
									if( doc != null) {
											var diff = _.difference(keys,doc.fields);
											if (diff.length > 0) {
													doc.fields = diff.concat(doc.fields);
													debugger;
													schema.updateOne({"collectionName":collectionName}, {$set: {"fields":doc.fields}},  function(err) {
															if (err) throw err;
															console.log("Schema updated")
													});
											}
									}
									
							});
					})
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


 
