"use strict";

import {MongoClient} from './MongoClient.js'

const http = require("http")
const _ = require("underscore")
const util = require('./utilities.js')
const url = 'mongodb://localhost:27017/hey-pi'
const DBClient = new MongoClient();

var getData = function(data) {

	DBClient.connect(url, function(err, db) {

	  console.log("Connected correctly to server.");

		var collection_name = data[0];
		var query = data[1];
		var mongoQuery = util.parseQuery(query)

		if (mongoQuery === null) {
      console.log('nothing found')
      db.close();
      return;
    }

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

function saveData(path, data, resp){

	var collectionName = path[0];
	var promise = new Promise(
		(resolve, reject) => {
			DBClient.connect(url)
			.then(function(db){
				DBClient.setDB(db);
				DBClient.loadCollection(collectionName)
				.then((collection) => {
					debugger;
					resolve(processCollection(collection));
				})
				.catch(displayErr);
			})
			.catch(displayErr);
		}
		return promise;
	);

	function processCollection(collection){

		if (path.length === 1){

			collection.insertOne(data, function(err, data){
			  if (err)
		  	  throw err;
		    else
			    console.log('data saved properly');
			});
			updateSchema(data);
		}
		else if(path.length % 2 === 0){

			var mongoQuery = util.parseQuery(path[1]);

			collection.find(mongoQuery, (err, documents) => {
				documents.toArray().then((docs) => {
					if (docs.length > 1) {
						return  { "code": 406, "body":"Returned multiple documents, please use a unique identier"};
					}
				});
			});

		}
		else if (path.length % 2 === 1){
			//inserting doc, with a foreign key relationship
		}
		else{

		}
	}

	function updateSchema(data){
		var keys = Object.keys(data);

		DBClient.loadCollection("schemas")
		.then((schemaCollection) => {
			var result = schemaCollection.find({"collectionName":collectionName});
			result.forEach(function(doc){

				if( doc != null) {
					var diff = _.difference(keys,doc.fields);

					if (diff.length > 0) {
						doc.fields = diff.concat(doc.fields);
						schemaCollection.updateOne({"collectionName":collectionName},
						{$set: {"fields":doc.fields}},  function(err) {

							if (err) throw err;
							console.log("Schema updated")
						});
					}
				}
			});
		})
		.catch(displayErr);
	}
}

function displayErr (reason){

	console.log(reason)
}

function respToClient(response, httpCode, body) {

	response.writeHead(httpCode, {
		'Content-Length': body.length,
		'Content-Type': 'application/json'
	});

	if (body.length) {
		response.write(body);
  }
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
					data+=chunk;
				});

				req.on('end', function(){
					data = JSON.parse(data);
					saveData(path, data ,resp).then((responseData) => {
						debugger;
						resp.writeHead(responseData.code, {
							'Content-Length': responseData.body.length,
							'Content-Type': 'application/json'
						});

						if (responseData.body.length) {
							resp.write(responseData.body);
							resp.end();
					  }

					});
				});
				break;
		}
	}

});

server.listen(8000, function(){
	console.log("Server listening on: http://localhost:8000");
});
