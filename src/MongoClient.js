"use strict";

var Mongo = require("mongodb").MongoClient;

export class MongoClient extends Mongo {

	constructor(url) {
		super();
		this.url = url;
		this.db = null;
	}

	connect(){
		console.log('entered connect function')
		var promise = new Promise(
			(resolve, reject) => {
				Mongo.connect(this.url, function(err,db) {
					resolve(db);
				});
			}
		);
		return promise;
	}

	setDB(db) {
		this.db = db;
		return this;
	}

	loadCollection(name) {
		var promise = new Promise(
			(resolve, reject) => {
				this.db.collection(name, (err,collection) => {
					if (err)
						reject (err);
					else
						resolve(collection);
				});
			}
		);
		return promise;
	}

};
