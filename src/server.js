"use strict";

import {MongoClient} from './MongoClient.js';
import colUtil from './collectionUtil.js';

const http = require("http")
const _ = require("underscore")
const util = require('./utilities.js')
const url = 'mongodb://localhost:27017/hey-pi'
const DBClient = new MongoClient();

//TODO: make sure user only queries for one doc when doing POST

function getData(path) {
	//chunck the path into sections and build query interativly
	var pathArray = [];
	if (path.length % 2 === 1 ) path.push("");

		// load client
		DBClient.connect(url)
		.then((db) => {
			DBClient.setDB(db);

			console.log("db started");
			for (var i = 0; i < path.length; i += 2) {
				pathArray.push([path[i], path[i + 1]]);
			}

			var chain = pathArray.reduce((previous, item, index, array)=> {

				 return previous.then((result) => {
					 var collectionName = item[0];
					 var query = item[1];
					 var mongoQuery = util.parseQuery(query);

					 if (mongoQuery === null) {
						 reject({code:400, body:"bad request"});
					 }
					 mongoQuery = _.extend(mongoQuery,result.fkQuery);

					 var promise = new Promise (
						 (resolve, reject) => {
						 DBClient.loadCollection(collectionName)
						 .then((collection) => {

							 collection.find(mongoQuery)
							 .toArray((err, docs) => {
								 if (err) {
									 reject(err);
								 } else {
									 var keys = _.pluck(docs,"_id");

									 for (var i = 0; i < keys.length; i++) {
										 keys[i] = keys[i].toString();
									 };

									 var fkFieldName = collectionName + "id";
									 var fkQuery = {};
									 fkQuery[fkFieldName] = { $in: keys };
									resolve({doc: docs, fkQuery: fkQuery});

								 }
							 })
						 });
					 });
					 return promise;
				 });
			}, new Promise(
				(resolve, reject) => { //initial value given to reduce
				console.log("inside reduce");

				var collectionName = pathArray[0][0];
				var query = pathArray[0][1];

				//remove frist from array to prevent reduce from acting on it
				pathArray.splice(0,1);

				var mongoQuery = util.parseQuery(query);

				if (mongoQuery === null) {
					reject({code:400, body:"bad request"});
					//break;
				}

				DBClient.loadCollection(collectionName)
				.then((collection) => {

					collection.find(mongoQuery)
					.toArray((err, docs) => {
						if (err) {

							reject({ code: 500, body: "server error: " + err});
						} else {
							var keys = _.pluck(docs,"_id");

							for (var i = 0; i < keys.length; i++) {
								keys[i] = keys[i].toString();
							};

							var fkFieldName = collectionName + "id";
							var fkQuery = {};
							fkQuery[fkFieldName] = { $in: keys };

							var obj = {doc: docs, fkQuery: fkQuery};
							resolve(obj);
						}
					})
				})
			}));

		chain.then((result) => {
				debugger;
			}, (err) => {
				console.log('got into error clause after chain is finished' + err)
		});
	});
}

function saveData(path, data) {
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
			getData(path);
			/*
				getData(path).then((response) => {

					var responseStr = JSON.stringify(response.body);

					resp.writeHead(response.code, {
						'Content-Length': responseStr.length,
						'Content-Type': 'application/json'
					});

					resp.write(responseStr);
					resp.end();

				},(err) => {

					resp.writeHead(err.code, {
						'Content-Length': err.body.length,
						'Content-Type': 'text/plain'
					})
					resp.write(err.body);
					resp.end();
				});
				*/

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
