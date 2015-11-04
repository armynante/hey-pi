"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MongoClientJs = require('./MongoClient.js');

var _UserJs = require('./User.js');

var _collectionUtilJs = require('./collectionUtil.js');

var _collectionUtilJs2 = _interopRequireDefault(_collectionUtilJs);

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _jsonWebToken = require('json-web-token');

var _jsonWebToken2 = _interopRequireDefault(_jsonWebToken);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var url = 'mongodb://localhost:27017/hey-pi';
var secret = 'SUPERCEREALGUYS';

var Mongo = new _MongoClientJs.MongoClient();

//INTIALIZE EXPRESS:
var app = (0, _express2['default'])();

//LOAD THE DATABASE
Mongo._dbConnect(url);

//SETUP
app.use((0, _morgan2['default'])('dev')); //logging
app.use(_bodyParser2['default'].urlencoded({ extended: false }));
app.use(_bodyParser2['default'].json());

var urlStrip = function urlStrip(req, res, next) {
	var path = _utilitiesJs2['default'].stripPath(req.url);
	req.strip_path = path;
	next();
};

// var checkAuth = function(req, res, next) {
//
// }

app.route('/register/:email/:pass').post(function (req, res) {
	var email = req.params.email;
	var pass = req.params.pass;
	var User = new _UserJs.UserModel();

	User.create({ email: email, pass: pass }).then(function (userObj) {
		return Mongo._save('users', userObj);
	}).then(function (user) {
		res.json(user);
	})['catch'](function (err) {
		res.json({ message: "user looks like it already exists" });
	});
});

app.route('/authorize').get(function (req, res) {});

//Check authentication before proceeding to api
// app.use(checkAuth);

//strip path
app.use(urlStrip);

//api routes
app.route('/api/*').get(function (req, res) {
	Mongo._getData(req.strip_path).then(function (data) {
		res.json(data);
	});
});

var server = app.listen(3000, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
//# sourceMappingURL=server.js.map