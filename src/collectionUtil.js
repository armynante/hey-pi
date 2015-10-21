"use strict";

var colUtil =  {
	findOne: function(collection, query){
		var promise = new Promise(
			(resolve, reject) => {
				collection.find(query, (err, docs) => {
					docs.toArray((err, docArray) => {
						if (docArray.length > 1){
							reject({"message": "More than one docs found", "documents": docArray});
						}
						else if (!docArray.length){
							reject({"message": "No documents found", "documents": docArray});
						}
						else{
							resolve(docArray[0]);
						}
					});
				});
			}
		);
		return promise;
	},

	findMany: function(collection, query){
		var promise = new Promise(
			(resolve, reject) => {
				collection.find(query, (err, docs) => {
					docs.toArray((err, docArray) => {
						if (!docArray.length){
							reject({"message": "No documents found", "documents": docArray});
						}
						else{
							resolve(docArray);
						}
					});
				});
			}
		);
		return promise;
	},

	insertOne: function(collection, data){
		var promise = new Promise(
			(resolve, reject) => {
				collection.insertOne(collection,function(err, data){
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
};

export default colUtil;