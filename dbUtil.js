var Mongo = require("mongodb").MongoClient;
module.exports = {
	connect: function(url){
		console.log('entered connect function')
		var promise = new Promise(
			function(resolve, reject){
				Mongo.connect(url, function(err,db){
					console.log('got into mongo connect function',db)
					resolve(db);
				});
			}
		);
		return promise;
	}
}