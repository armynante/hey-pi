"use strict";

var Mongo = require("mongodb").MongoClient;

export class MongoClient extends Mongo {

	constructor(url) {
		super();
		this.url = url;
	}

	connect(){
		console.log('entered connect function')
		var promise = new Promise(
			(resolve, reject) => {
				Mongo.connect(this.url, function(err,db){
					console.log('got into mongo connect function',db)
					resolve(db);
				});
			}
		);
		return promise;
	}

	collection(name) {

	}
};
