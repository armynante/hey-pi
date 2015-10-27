"use strict";

var colUtil =  {
	findOne: function(collection, query){
		var promise = new Promise(
			(resolve, reject) => {
				collection.find(query, (err, docs) => {
					docs.toArray((err, docArray) => {

						if (docArray.length > 1){
							reject({"message": "More than one doc found\n", "result": docArray});
						}
						else if (!docArray.length){
							reject({"message": "No documents found\n", "result": docArray});
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
				debugger;
				collection.find(query, (err, docs) => {
					debugger;
					if (err)
						console.log(err);

					// docs.toArray((err, docArray) => {
					// 	//debugger;
					// 	if (!docArray.length){
					// 		reject("No documents found\n");
					// 	}
					// 	else{
					// 		resolve(docArray);
					// 	}
					// });
				
					docs.toArray()
					.then((docArray) => {
						debugger;
						console.log(docArray);
						resolve(docArray);
					}, (err) => {
						console.log(err)
					});
				});
			}
		);
		return promise;
	},

	insertOne: function(collection, data) {
		var promise = new Promise(
			(resolve, reject) => {
				collection.insertOne(data,function(err, data){
					if (err){
			  	  		reject(err);
			  	  	}
			  	  	else{
			  	  		//updateSchema(data);
			  	  		//TODO: message should also tell user what the new doc looks like now
			  	  		resolve({"message": "Successfully added new document\n"});
			  	  	}
				});
			}
		);
		return promise;
	},

	updateOne: function(collection, query, data) {

		var promise = new Promise (
			(resolve, reject) => {
					collection.updateOne(query,
					{ $set: data },
					(err, result) => {
						if (err) {
							reject({"message":" Error updating doc: "  + err});
						} else {
							resolve({"message": "Successfully updated the document", "result": result});
						}
					}
				)
			}
		);
		return promise;
	}
};

export default colUtil;
