"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var colUtil = {
	findOne: function findOne(collection, query) {
		var promise = new Promise(function (resolve, reject) {
			collection.find(query, function (err, docs) {
				docs.toArray(function (err, docArray) {

					if (docArray.length > 1) {
						reject({ "message": "More than one doc found\n", "result": docArray });
					} else if (!docArray.length) {
						reject({ "message": "No documents found\n", "result": docArray });
					} else {
						resolve(docArray[0]);
					}
				});
			});
		});
		return promise;
	},
	//
	// findMany: function(collection, query){
	// 	var promise = new Promise(
	// 		(resolve, reject) => {
	// 			debugger;
	// 			collection.find(query, (err, docs) => {
	// 				debugger;
	// 				if (err) console.log(err);
	//
	// 				// docs.toArray((err, docArray) => {
	// 				// 	//debugger;
	// 				// 	if (!docArray.length){
	// 				// 		reject("No documents found\n");
	// 				// 	}
	// 				// 	else{
	// 				// 		resolve(docArray);
	// 				// 	}
	// 				// });
	//
	// 				docs.toArray()
	// 				.then((docArray) => {
	// 					debugger;
	// 					console.log(docArray);
	// 					resolve(docArray);
	// 				}, (err) => {
	// 					debugger;
	// 					reject(err);
	// 					console.log(err)
	// 				});
	// 			}
	// 		})
	// 	return promise;
	// },

	insertOne: function insertOne(collection, data) {
		var promise = new Promise(function (resolve, reject) {
			collection.insertOne(data, function (err, result) {
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		});
		return promise;
	},

	updateOne: function updateOne(collection, query, data) {

		var promise = new Promise(function (resolve, reject) {
			collection.updateOne(query, { $set: data }, function (err, result) {
				if (err) {
					reject({ "message": " Error updating doc: " + err });
				} else {
					resolve({ "message": "Successfully updated the document", "result": result });
				}
			});
		});
		return promise;
	}
};

exports["default"] = colUtil;
module.exports = exports["default"];
//# sourceMappingURL=collectionUtil.js.map