"use strict";

import {MongoClient} from './MongoClient.js';
import colUtil from './collectionUtil.js';

const http = require("http")
const _ = require("underscore")
const util = require('./utilities.js')
const url = 'mongodb://localhost:27017/hey-pi'
const DBClient = new MongoClient();

//TODO: make sure user only queries for one doc when doing POST

var getData = function(path) {

	  console.log("Connected correctly to server.");
		var mongoQuery = {};
		var collectionName = path[0];

		if (path.length > 1){
			mongoQuery = util.parseQuery(path[1]);
		}

		var promise = new Promise(
			(resolve, reject) => {
				DBClient.connect(url)
				.then((db) => {
					DBClient.setDB(db);
					return DBClient.loadCollection(collectionName);
				})
				.then((collection) => {
					return colUtil.findMany(collection, mongoQuery);
				})
				.then((docs) => {
					if (path.length <= 2) {
						resolve({"code":200,"body": docs});
					}
				}, (err) => {
					reject({"code": 404, "body":err.message});
				});
  		});
		 return promise;

};

var getData = function(path, querySum, docs) {
	var sum = {};
		
	if(path.length === 0) {
		/*
		var promise = new Promise{
			(resolve, reject) => {
				resolve({"code":200,"body": docs});
			}
		} */
		return promise;
	}
	else if (path.length === 1) {
		var promise = new Promise(
			(resolve, reject) => {
				DBClient.connect(url)
				.then((db) => {
					DBClient.setDB(db);
					return DBClient.loadCollection(collectionName);
				})
				.then((collection) => {
					return colUtil.findMany(collection, mongoQuery);
				})
				.then((docs) => {
					//resolve({"code":200,"body": docs});

					getData()
				}, (err) => {
					reject({"code": 404, "body":err.message});
				});
		});
	}
	else {
		var collectionName = path[0];
		if (path.length>1){
			var newQuery = util.parseQuery(path[1]);
			querySum = _.extend(querySum, newQuery);
			//reconstruct query
		}

		var promise = new Promise(
			(resolve, reject) => {
				DBClient.connect(url)
				.then((db) => {
					DBClient.setDB(db);
					return DBClient.loadCollection(collectionName);
				})
				.then((collection) => {
					return colUtil.findMany(collection, mongoQuery);
				})
				.then((docs) => {
					//resolve({"code":200,"body": docs});

					getData()
				}, (err) => {
					reject({"code": 404, "body":err.message});
				});
		});
	}
}

function saveData(path, data){
console.log('in save data');
	var collectionName = path[0];

	var promise = new Promise(
		(resolve, reject) => {

			DBClient.connect(url)
			.then((db) => {
				DBClient.setDB(db);
				return DBClient.loadCollection(collectionName);
			})

			.then((collection) => {
				console.log('loading collection');

				return saveDataHelper(collection);
			})

			.then((data) => {
				console.log(data);

				var responseData = {"code": 201, "body": data.message};
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

		else if (path.length == 2) {

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


		else if (path.length === 3){
			var collectionToAddTo = path[2];
			var parentID;

			var promise = new Promise(
				(resolve, reject) => {
					colUtil.findOne(collection, mongoQuery)

					.then((doc) => {
						parentID = doc._id.toString();
						return DBClient.loadCollection(collectionToAddTo);
					})

					.then((collectionToAddToObj) => {
						var obj = {};
						var keyName = collectionName + "id";
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
				getData(path).then((docs) => {

					var docStr = JSON.stringify(docs.body);

					resp.writeHead(docs.code, {
						'Content-Length': docStr.length,
						'Content-Type': 'application/json'
					});

					resp.write(docStr);
					resp.end();

				},(err) => {

					resp.writeHead(err.code, {
						'Content-Length': err.body.length,
						'Content-Type': 'text/plain'
					})
					resp.write(err.body);
					resp.end();
				});

				break;

			case "POST":

				req.on('data', function(chunk){
					data+=chunk;
				});

				req.on('end', function(){
					data = JSON.parse(data);
					saveData(path, data).then((responseData) => {


						var respString = JSON.stringify(responseData.body);

						resp.writeHead(responseData.code, {
							'Content-Length': respString.length,
							'Content-Type': 'application/json'
						});

						resp.write(respString);
						resp.end();

					}, (err) => {
						resp.writeHead(err.code, {
							'Content-Length': err.body.length,
							'Content-Type': 'text/plain'
						})
						resp.write(err.body);
						resp.end();
					});

				});
				break;
		}
	}

});

server.listen(8000, function(){
	console.log("Server listening on: http://localhost:8000");
});
