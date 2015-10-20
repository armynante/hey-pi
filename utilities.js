module.exports = {
	getFieldNames: function(collection){
		return Object.keys(collection);
	},
	stripPath: function(path){

		path = path.split("/")
		path.splice(0,1);
		return path;
	},
	parseQuery: function(query){
		/*
		Sample queries:
			/completed_is_true
			/user_is_lauren
			/age_is_greater_than_21
			/event_is_in_the_future
			/event_was_in_the_past
			/name_is_not_andrew
		*/

		var queryWords = query.split('_');

		var fieldName = queryWords[0];
		var lastWord  = queryWords[queryWords.length-1];
		var mongoQuery ={};

		if (query.match(/greater_than/)){

		}
		else if (query.match(/less_than/)){

		}
		else if (query.match(/is_not/)){

		}
		else if (query.match(/is_in_future/)){

		}
		else if (query.match(/is_in_past/)){
			
		}
		else if (query.match(/is/)){
			mongoQuery[fieldName] = lastWord;			
		}
		else{
			console.log('does not match any patterns')
		}

		return mongoQuery;
	}
}

