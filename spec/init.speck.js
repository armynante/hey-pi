var index = require('../index');
var mongo = require('mongo');

describe("Setting up the data", function() {
		it("can detect if mongo is installed", function() {
				var version_resp  = index.init();				    
				expect(version).toBe("MongoDB shell version: 3.0.6");
		});
});
