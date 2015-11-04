 "use strict";

 import utilities from './utilities.js';
 import collectionUtil from './collectionUtil.js';
 var Mongo = require("mongodb").MongoClient;
 var _ = require("underscore");

 export class MongoClient extends Mongo {

 	constructor() {
 		super();
 		this.db = null;
 	}

 	dbConnect(url) {
    var _this = this;
 		Mongo.connect(url, function(err, db) {
      if (err) throw err;
      _this.db = db
 		});
 	}

 	_loadCollection(name) {
 		var promise = new Promise(
 			(resolve, reject) => {
 				this.db.collection(name, (err, collection) => {
 					if (err)
 						reject(err);
 					else
 						resolve(collection);
 				});
 			}
 		);
 		return promise;
 	}

 	_getData(path) {
    debugger;
 		var promise = new Promise((resolve, reject) => {

 			this._propagateQuery(path).then((resolveObj) => {
 				var collection = resolveObj.collection;
 				var mongoQuery = resolveObj.mongoQuery;

 				collection.find(mongoQuery).toArray((err, docs) => {

 					console.log(err)
 					docs = (docs);

 					if (err) reject({
 						"code": 500,
 						"body": err
 					});

 					var responseData = {
 						"code": 200,
 						"body": docs
 					};
 					resolve(responseData);
 				});

 			}, (err) => {
 				var responseData = {
 					"code": 500,
 					"body": err
 				};
 				reject(responseData);
 			});
 		});
 		return promise;
 	}

 	delData(path) {

 		var promise = new Promise((resolve, reject) => {

 			propagateQuery(path).then((resolveObj) => {
 				var collection = resolveObj.collection;
 				var mongoQuery = resolveObj.mongoQuery;

 				collection.deleteMany(mongoQuery, (err, result) => {
 					if (err) reject({
 						"code": 500,
 						"body": err
 					});

 					var numDocsDeleted = result.deletedCount;
 					var responseData = {
 						"code": 200,
 						"body": "Deleteted " + numDocsDeleted + " documents."
 					};
 					resolve(responseData);
 				});
 			}, (err) => {
 				var responseData = {
 					"code": 500,
 					"body": err
 				};
 				reject(responseData);
 			});
 		});
 		return promise;
 	}

 	_propagateQuery(path) {
    debugger;
 		var pathArray = [];
 		if (path.length % 2 === 1) path.push("");

 		// load client
 		var promise = new Promise(
 			(resolve, reject) => {

 				for (var i = 0; i < path.length; i += 2) {
 					pathArray.push([path[i], path[i + 1]]);
 				}

 				var chain = pathArray.reduce((previous, item, index, array) => {

 					return previous.then((result) => {
 						var collectionName = item[0];
 						var query = item[1];

 						var mongoQuery = utilities.parseQuery(query);

 						if (mongoQuery === null) {
 							reject("bad request");
 						}

 						mongoQuery = _.extend(mongoQuery, result.fkQuery);

 						var promise = new Promise(
 							(resolve, reject) => {
 								this._loadCollection(collectionName)
 									.then((collection) => {
 										if (index !== (pathArray.length - 1)) {
 											var cursor = collection.find(mongoQuery);

 											cursor.toArray((err, docs) => {
 												if (err) {
 													reject(err);
 												} else {
 													var keys = _.pluck(docs, "_id");

 													for (var i = 0; i < keys.length; i++) {
 														keys[i] = keys[i].toString();
 													};

 													var fkFieldName = collectionName + "id";
 													var fkQuery = {};
 													fkQuery[fkFieldName] = {
 														$in: keys
 													};
 													resolve({
 														doc: docs,
 														fkQuery: fkQuery
 													});

 												}
 											})
 										} else {
 											var resolveObj = {};
 											resolveObj["collection"] = collection;
 											resolveObj["mongoQuery"] = mongoQuery;
 											resolve(resolveObj);
 										}
 									});
 							});
 						return promise;
 					});
 				}, new Promise(
 					(resolve, reject) => { //initial value given to reduce
 						var result = {};
 						result["fkQuery"] = {};
 						resolve(result);
 					}));

 				chain.then((cursor) => {
 					//var responseData = {"code": 200, "body": result.doc};
 					resolve(cursor);
 				}, (err) => {
 					console.log('got into error clause after chain is finished' + err);
 					//var responseData = {"code": 500, "body": err};
 					reject(err);
 				});
 			});
 		return promise;
 	}

 	updateData(path, data) {

 		var collectionName = path[0];

 		var promise = new Promise(
 			(resolve, reject) => {

 				DBClient.connect(url)
 					.then((db) => {
 						DBClient.setDB(db);
 						return DBClient._loadCollection(collectionName);
 					})

 				.then((collection) => {
 					console.log('loading collection');
 					debugger;
 					return updateDataHelper(collection);
 				})

 				.then((response) => {

 					var modifiedCount = response.result.modifiedCount;

 					if (modifiedCount > 0) {

 						var responseData = {
 							"code": 200,
 							"body": "Updated " +
 								modifiedCount +
 								" documents"
 						};
 					} else {

 						var responseData = {
 							"code": 204,
 							"body": "No documents updated :("
 						};
 					}
 					resolve(responseData);
 				}, (err) => {
 					var responseData = {
 						"code": 500,
 						"body": err.message
 					};
 					console.log("response data is: " + responseData)
 					resolve(responseData);
 				});
 			}
 		);

 		return promise;


 		function updateDataHelper(collection) {
 			// remove id field from obj
 			delete data["id"];

 			if (path.length > 1) {
 				var mongoQuery = utilities.parseQuery(path[1]);
 			}

 			if (path.length == 2) {
 				//TODO: need to take this out into its own function!!!

 				var promise = new Promise(
 					(resolve, reject) => {

 						collectionUtil.updateOne(collection, mongoQuery, data)
 							.then((result) => {

 								resolve(result)

 							}, (err) => {
 								console.log(err);
 								reject(err);
 							})
 					}
 				);
 				return promise;
 			}
 		}

 	}

 	saveData(path, data, update) {

 		var collectionName = path[0];

 		var promise = new Promise(
 			(resolve, reject) => {

 				DBClient.connect(url)
 					.then((db) => {
 						DBClient.setDB(db);
 						return DBClient._loadCollection(collectionName);
 					})

 				.then((collection) => {
 					console.log('loading collection');

 					return saveDataHelper(collection);
 				})

 				.then((docs) => {

 					docs = utilities.sanitizeId(docs);
 					var responseData = {
 						"code": 201,
 						"body": docs
 					};
 					resolve(responseData);

 				}, (err) => {

 					var responseData = {
 						"code": 500,
 						"body": err.message
 					};
 					console.log("response data is: " + responseData)
 					resolve(responseData);
 				});
 			}
 		);

 		return promise;


 		function saveDataHelper(collection) {

 			if (path.length > 1) {
 				var mongoQuery = utilities.parseQuery(path[1]);
 			}

 			if (path.length === 1) {
 				var promise = new Promise(
 					(resolve, reject) => {
 						collection.insertOne(data, function(err, result) {
 							if (err) {
 								reject(err);
 							} else {
 								resolve(result.ops[0]);
 							}
 						});
 					}
 				);
 				return promise;
 			} else if (path.length == 2) {
 				//TODO: need to take this out into its own function!!!

 				var promise = new Promise(
 					(resolve, reject) => {
 						collectionUtil.updateOne(collection, mongoQuery, data)
 							.then((result) => {
 								resolve(result)

 							}, (err) => {
 								reject(err);
 							})
 					}
 				);
 				return promise;
 			} else if (path.length === 3) {
 				var collectionToAddTo = path[2];
 				var parentID;

 				var promise = new Promise(
 					(resolve, reject) => {
 						collectionUtil.findOne(collection, mongoQuery)

 						.then((doc) => {
 							parentID = doc._id.toString();
 							return DBClient._loadCollection(collectionToAddTo);
 						})

 						.then((collectionToAddToObj) => {
 							var obj = {};
 							var keyName = collectionName + "id";
 							obj[keyName] = parentID;
 							data = _.extend(data, obj);
 							return collectionUtil.insertOne(collectionToAddToObj, data);
 						})

 						.then((result) => {
 							debugger;
 							resolve(result.ops[0]);
 						}, (err) => {
 							reject(err);
 						});
 					}
 				);
 				return promise;
 			}
 		}
 	}

 };
