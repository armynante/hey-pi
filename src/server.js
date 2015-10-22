"use strict";

import {MongoClient} from './MongoClient.js';
import colUtil from './collectionUtil.js';

const http = require("http")
const _ = require("underscore")
const util = require('./utilities.js')
const url = 'mongodb://localhost:27017/hey-pi'
const DBClient = new MongoClient();

//TODO: make sure user only queries for one doc when doing POST

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


function patchData(path, data) {

	var collectionName = path[0];

	var promise = new Promise(
		(resolve, reject) => {

			if (path.length % 2 !== 0) {
				reject({ "code": 400, "body": "Wrong HTTP verb used."})
			}

			DBClient.connect(url)
			.then((db) => {
				DBClient.setDB(db);
				return DBClient.loadCollection(collectionName);
			})

			.then((collection) => {
				return patchDataHelper(collection);
			})

			.then((msg) => {
				var responseData = {"code": 204, "body": msg.message};
				resolve(responseData);
			},(err) => {
				displayErr(err);
				var responseData = {"code": 500, "body": err.message};
				console.log("response data is: "+ responseData)
				resolve(responseData);
			});
		});

	function patchDataHelper(collection) {

	  var mongoQuery = util.parseQuery(path[1]);

		var promise = new Promise(
			(resolve, reject) => {
				colUtil.updateOne(collection, mongoQuery, data)
				.then((message) => {
					resolve(message);
				}, (err) => {
					reject(err);
				})
			}
		);
		return promise;
	}
	return promise;
}

function saveData(path, data){

	var collectionName = path[0];

	var promise = new Promise(
		(resolve, reject) => {

			DBClient.connect(url)
			.then((db) => {
				DBClient.setDB(db);
				return DBClient.loadCollection(collectionName);
			})

			.then((collection) => {
				return saveDataHelper(collection);
			})

			.then((msg) => {
				var responseData = {"code": 201, "body": msg.message};
				resolve(responseData);
			},(err) => {
				displayErr(err);
				var responseData = {"code": 500, "body": err.message};
				console.log("response data is: "+ responseData)
				resolve(responseData);
			});
		}
	);

	return promise;


	function saveDataHelper(collection){

		if (path.length > 1) {
			var mongoQuery = util.parseQuery(path[1]);
		}

		if (path.length === 1){
			var promise = new Promise(
				(resolve, reject) => {
					collection.insertOne(data, function(err, data){
						if (err){
				  	  		reject(err);
				  	  	}
				  	  	else{
				  	  		updateSchema(data);
				  	  		resolve({ "code": 200, "body":"Successfully added new document\n"});
				  	  	}
					});
				}
			);
			return promise;
		}

		else if (path.length === 3){
			var collectionToAddTo = path[2];
			var parentID;

			var promise = new Promise(
				(resolve, reject) => {
					colUtil.findOne(collection, mongoQuery)

					.then((doc) => {
						parentID = doc._id.id;
						return DBClient.loadCollection(collectionToAddTo);
					})

					.then((collectionToAddToObj) => {
						var obj = {};
						var keyName = collectionName + "_id";
						obj[keyName] = parentID;
						data = _.extend(data, obj);
						return colUtil.insertOne(collectionToAddToObj, data);
					})

					.then((msg) => {
						resolve(msg);
					},(err) => {
						reject(err);
					});
				}
			);
			return promise;

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

	console.log(reason);
	return;
}

var server = http.createServer(function(req, resp) {

	if (req.url!=="/favicon.ico"){

		var path = util.stripPath(req.url);
		var data = "";

		switch(req.method){

			case "GET":
				var items = getData(path);
				resp.end(items);
				break;

			case "PATCH":
				req.on('data', function(chunk){
					data+=chunk;
				});

				req.on('end', function(){

					data = JSON.parse(data);
					patchData(path, data).then((responseData) => {
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
			case "POST":

				req.on('data', function(chunk){
					data+=chunk;
				});

				req.on('end', function(){
					data = JSON.parse(data);
					saveData(path, data).then((responseData) => {

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
