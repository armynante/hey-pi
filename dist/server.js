"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MongoClientJs = require('./MongoClient.js');

var _collectionUtilJs = require('./collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var http = require("http");
var _ = require("underscore");
var util = require('./utilities.js');
var url = 'mongodb://localhost:27017/hey-pi';
var DBClient = new _MongoClientJs.MongoClient();

//TODO: make sure user only queries for one doc when doing POST

DBClient.connect(url).then(function (db) {
	DBClient.setDB(db);
	console.log("database loaded");
});

function getData(path) {

	var promise = new Promise(function (resolve, reject) {

		propagateQuery(path).then(function (resolveObj) {
			debugger;
			var collection = resolveObj.collection;
			var mongoQuery = resolveObj.mongoQuery;

			collection.find(mongoQuery).toArray(function (err, docs) {

				console.log(err);
				debugger;
				docs = docs;

				if (err) reject({ "code": 500, "body": err });

				var responseData = { "code": 200, "body": docs };
				resolve(responseData);
			});
		}, function (err) {
			var responseData = { "code": 500, "body": err };
			reject(responseData);
		});
	});
	return promise;
}

function delData(path) {

	var promise = new Promise(function (resolve, reject) {

		propagateQuery(path).then(function (resolveObj) {
			var collection = resolveObj.collection;
			var mongoQuery = resolveObj.mongoQuery;

			collection.deleteMany(mongoQuery, function (err, result) {
				if (err) reject({ "code": 500, "body": err });

				var numDocsDeleted = result.deletedCount;
				var responseData = { "code": 200, "body": "Deleteted " + numDocsDeleted + " documents." };
				resolve(responseData);
			});
		}, function (err) {
			var responseData = { "code": 500, "body": err };
			reject(responseData);
		});
	});
	return promise;
}

function propagateQuery(path) {

	var pathArray = [];
	if (path.length % 2 === 1) path.push("");

	// load client
	var promise = new Promise(function (resolve, reject) {

		for (var i = 0; i < path.length; i += 2) {
			pathArray.push([path[i], path[i + 1]]);
		}

		var chain = pathArray.reduce(function (previous, item, index, array) {

			return previous.then(function (result) {
				var collectionName = item[0];
				var query = item[1];

				var mongoQuery = util.parseQuery(query);

				if (mongoQuery === null) {
					reject("bad request");
				}

				mongoQuery = _.extend(mongoQuery, result.fkQuery);

				var promise = new Promise(function (resolve, reject) {
					DBClient.loadCollection(collectionName).then(function (collection) {
						if (index !== pathArray.length - 1) {
							var cursor = collection.find(mongoQuery);
							console.log('got into if');
							cursor.toArray(function (err, docs) {
								if (err) {
									reject(err);
								} else {
									var keys = _.pluck(docs, "_id");

									for (var i = 0; i < keys.length; i++) {
										keys[i] = keys[i].toString();
									};

									var fkFieldName = collectionName + "id";
									var fkQuery = {};
									fkQuery[fkFieldName] = { $in: keys };
									resolve({ doc: docs, fkQuery: fkQuery });
								}
							});
						} else {
							console.log('got into else');
							debugger;
							var resolveObj = {};
							resolveObj["collection"] = collection;
							resolveObj["mongoQuery"] = mongoQuery;
							resolve(resolveObj);
						}
					});
				});
				return promise;
			});
		}, new Promise(function (resolve, reject) {
			//initial value given to reduce
			var result = {};
			result["fkQuery"] = {};
			resolve(result);
		}));

		chain.then(function (cursor) {
			//var responseData = {"code": 200, "body": result.doc};
			resolve(cursor);
		}, function (err) {
			console.log('got into error clause after chain is finished' + err);
			//var responseData = {"code": 500, "body": err};
			reject(err);
		});
	});
	return promise;
}

function updateData(path, data) {

	var collectionName = path[0];

	var promise = new Promise(function (resolve, reject) {

		DBClient.connect(url).then(function (db) {
			DBClient.setDB(db);
			return DBClient.loadCollection(collectionName);
		}).then(function (collection) {
			console.log('loading collection');
			debugger;
			return updateDataHelper(collection);
		}).then(function (response) {

			var modifiedCount = response.result.modifiedCount;

			if (modifiedCount > 0) {

				var responseData = { "code": 200, "body": "Updated " + modifiedCount + " documents" };
			} else {

				var responseData = { "code": 204, "body": "No documents updated :(" };
			}
			resolve(responseData);
		}, function (err) {
			var responseData = { "code": 500, "body": err.message };
			console.log("response data is: " + responseData);
			resolve(responseData);
		});
	});

	return promise;

	function updateDataHelper(collection) {
		// remove id field from obj
		data = delete data["id"];

		if (path.length > 1) {
			var mongoQuery = util.parseQuery(path[1]);
		}

		if (path.length == 2) {
			//TODO: need to take this out into its own function!!!

			var promise = new Promise(function (resolve, reject) {

				_collectionUtilJs2['default'].updateOne(collection, mongoQuery, data).then(function (result) {

					resolve(result);
				}, function (err) {
					console.log(err);
					reject(err);
				});
			});
			return promise;
		}
	}
}

function saveData(path, data, update) {

	var collectionName = path[0];

	var promise = new Promise(function (resolve, reject) {

		DBClient.connect(url).then(function (db) {
			DBClient.setDB(db);
			return DBClient.loadCollection(collectionName);
		}).then(function (collection) {
			console.log('loading collection');

			return saveDataHelper(collection);
		}).then(function (docs) {

			docs = util.sanitizeId(docs);
			var responseData = { "code": 201, "body": docs };
			resolve(responseData);
		}, function (err) {

			var responseData = { "code": 500, "body": err.message };
			console.log("response data is: " + responseData);
			resolve(responseData);
		});
	});

	return promise;

	function saveDataHelper(collection) {

		if (path.length > 1) {
			var mongoQuery = util.parseQuery(path[1]);
		}

		if (path.length === 1) {
			var promise = new Promise(function (resolve, reject) {
				collection.insertOne(data, function (err, result) {
					if (err) {
						reject(err);
					} else {
						resolve(result.ops[0]);
					}
				});
			});
			return promise;
		} else if (path.length == 2) {
			//TODO: need to take this out into its own function!!!

			var promise = new Promise(function (resolve, reject) {
				_collectionUtilJs2['default'].updateOne(collection, mongoQuery, data).then(function (result) {
					resolve(result);
				}, function (err) {
					reject(err);
				});
			});
			return promise;
		} else if (path.length === 3) {
			var collectionToAddTo = path[2];
			var parentID;

			var promise = new Promise(function (resolve, reject) {
				_collectionUtilJs2['default'].findOne(collection, mongoQuery).then(function (doc) {
					parentID = doc._id.toString();
					return DBClient.loadCollection(collectionToAddTo);
				}).then(function (collectionToAddToObj) {
					var obj = {};
					var keyName = collectionName + "id";
					obj[keyName] = parentID;
					data = _.extend(data, obj);
					return _collectionUtilJs2['default'].insertOne(collectionToAddToObj, data);
				}).then(function (result) {
					debugger;
					resolve(result.ops[0]);
				}, function (err) {
					reject(err);
				});
			});
			return promise;
		} else {}
	}

	function updateSchema(data) {
		var keys = Object.keys(data);

		DBClient.loadCollection("schemas").then(function (schemaCollection) {
			var result = schemaCollection.find({ "collectionName": collectionName });
			result.forEach(function (doc) {

				if (doc != null) {
					var diff = _.difference(keys, doc.fields);

					if (diff.length > 0) {
						doc.fields = diff.concat(doc.fields);
						schemaCollection.updateOne({ "collectionName": collectionName }, { $set: { "fields": doc.fields } }, function (err) {

							if (err) throw err;
							console.log("Schema updated");
						});
					}
				}
			});
		}, function (err) {
			console.log(err);
		});
	}
}

var server = http.createServer(function (req, resp) {

	resp.setHeader('Access-Control-Allow-Origin', '*');
	resp.setHeader('Access-Control-Request-Method', '*');
	resp.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
	resp.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Key');
	if (req.method === 'OPTIONS') {
		resp.writeHead(200);
		resp.end();
		return;
	}

	if (req.url.match(/^\/api/) !== null) {

		var path = util.stripPath(req.url);
		var data = "";

		if (path.length === 0) {
			resp.writeHead(200, {
				'Content-Length': 17,
				'Content-Type': 'text/plain'
			});

			resp.write('Welcome to hey-pi');
			resp.end();
		}

		switch (req.method) {

			case "GET":

				getData(path).then(function (response) {

					var responseStr = JSON.stringify(response.body);

					resp.writeHead(response.code, {
						'Content-Length': responseStr.length,
						'Content-Type': 'application/json'
					});

					resp.write(responseStr);
					resp.end();
				}, function (err) {

					resp.writeHead(err.code, {
						'Content-Length': err.body.length,
						'Content-Type': 'text/plain'
					});
					resp.write(err.body);
					resp.end();
				});

				break;

			case "PUT":

				req.on('data', function (chunk) {
					data += chunk;
				});

				req.on('end', function () {
					data = JSON.parse(data);
					updateData(path, data).then(function (responseData) {

						var respString = JSON.stringify(responseData.body);

						resp.writeHead(responseData.code, {
							'Content-Length': respString.length,
							'Content-Type': 'application/json'
						});

						resp.write(respString);
						resp.end();
					}, function (err) {
						resp.writeHead(err.code, {
							'Content-Length': err.body.length,
							'Content-Type': 'text/plain'
						});
						resp.write(err.body);
						resp.end();
					});
				});

				break;

			case "POST":

				// if post is /register
				// save data //

				req.on('data', function (chunk) {
					data += chunk;
				});

				req.on('end', function () {
					data = JSON.parse(data);
					saveData(path, data).then(function (responseData) {
						debugger;

						var respString = JSON.stringify(responseData.body);

						resp.writeHead(responseData.code, {
							'Content-Length': respString.length,
							'Content-Type': 'application/json'
						});

						resp.write(respString);
						resp.end();
					}, function (err) {
						resp.writeHead(err.code, {
							'Content-Length': err.body.length,
							'Content-Type': 'text/plain'
						});
						resp.write(err.body);
						resp.end();
					});
				});
				break;

			case "DELETE":

				delData(path).then(function (responseData) {

					var respString = JSON.stringify(responseData.body);

					resp.writeHead(responseData.code, {
						'Content-Length': respString.length,
						'Content-Type': 'application/json'
					});
					resp.write(respString);
					resp.end();
				}, function (err) {

					resp.writeHead(err.code, {
						'Content-Length': err.body.length,
						'Content-Type': 'text/plain'
					});
					resp.write(err.body);
					resp.end();
				});

				break;
		}
	} else {
		resp.writeHead(400, {
			'Content-Length': 15,
			'Content-Type': 'text/plain'
		});
		resp.write('route not found');
		resp.end();
	}
});

server.listen(8000, function () {
	console.log("Server listening on: http://localhost:8000");
});
//# sourceMappingURL=server.js.map