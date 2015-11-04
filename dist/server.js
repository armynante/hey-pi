"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MongoClientJs = require('./MongoClient.js');

var _collectionUtilJs = require('./collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var express = require("express");
var url = 'mongodb://localhost:27017/hey-pi';

var Mongo = new _MongoClientJs.MongoClient();

//INTIALIZE EXPRESS:
var app = express();

//LOAD THE DATABASE
Mongo.dbConnect(url);

var urlStrip = function urlStrip(req, res, next) {
	var path = _utilitiesJs2['default'].stripPath(req.url);
	req.strip_path = path;
	next();
};

//strip path
app.use(urlStrip);

app.route('/api/*').get(function (req, res) {
	Mongo._getData(req.strip_path).then(function (data) {
		debugger;
		// resp.send(data);
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
//# sourceMappingURL=server.js.map