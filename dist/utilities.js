'use strict';

module.exports = {
	getFieldNames: function getFieldNames(collection) {
		return Object.keys(collection);
	},
	stripPath: function stripPath(path) {

		path = path.split("/");
		path.splice(0, 2);
		return path;
	},
	parseQuery: function parseQuery(query) {
		/*
  Sample queries:
  	/completed_is_true
  	/user_is_lauren
  	/age_is_greater_than_21
  	/event_is_in_the_future
  	/event_was_in_the_past
  	/name_is_not_andrew
  */

		if (query.length === 0) return {};

		var queryWords = query.split('_');

		debugger;
		var fieldName = queryWords[0];
		var lastWord = queryWords[queryWords.length - 1];

		lastWord = lastWord.match(/^(\d)*$/) === null ? lastWord : parseInt(lastWord);
		lastWord = lastWord.match(/^(true)$/) === null ? lastWord : true;
		lastWord = lastWord.match(/^(false)$/) === null ? lastWord : false;

		var mongoQuery = {};
		var now = new Date().toISOString();

		if (query.match(/greater_than/)) {
			mongoQuery[fieldName] = { $gt: parseInt(lastWord) };
		} else if (query.match(/less_than/)) {
			mongoQuery[fieldName] = { $lt: parseInt(lastWord) };
		} else if (query.match(/is_not/)) {
			mongoQuery[fieldName] = { $ne: lastWord };
		} else if (query.match(/is_in_future/)) {
			mongoQuery[fieldName] = { $gt: now };
		} else if (query.match(/is_in_past/)) {
			mongoQuery[fieldName] = { $lt: now };
		} else if (query.match(/is/)) {
			mongoQuery[fieldName] = lastWord;
		} else {
			console.log('does not match any patterns');
			mongoQuery = null;
		}

		return mongoQuery;
	},

	sanitizeId: function sanitizeId(docs) {

		var clean = function clean(doc) {
			var id = doc._id;
			delete doc["_id"];
			debugger;
			doc["id"] = id.toString();
			return doc;
		};

		if (docs.toString().split(",")[0] !== '[object Object]') {
			debugger;
			return clean(docs);
		} else {
			debugger;
			return docs.map(clean);
		}
	}
};
//# sourceMappingURL=utilities.js.map