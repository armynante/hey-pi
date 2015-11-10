"use strict";

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _MongoClientJs = require('./MongoClient.js');

var _configJs = require('./config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _utilitiesJs = require('./utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _morgan = require('morgan');

var _morgan2 = _interopRequireDefault(_morgan);

var _mongodb = require("mongodb");

//routers

var _routesAuthJs = require('./routes/auth.js');

var _routesAuthJs2 = _interopRequireDefault(_routesAuthJs);

var _routesRegisterJs = require('./routes/register.js');

var _routesRegisterJs2 = _interopRequireDefault(_routesRegisterJs);

var _routesApiJs = require('./routes/api.js');

var _routesApiJs2 = _interopRequireDefault(_routesApiJs);

//initialize express:
var app = (0, _express2['default'])();

//load the database
var Mongo = new _MongoClientJs.MongoClient();
exports['default'] = Mongo;

Mongo._dbConnect(_configJs2['default'].mongoUrl);

//setiings
app.use((0, _morgan2['default'])('dev')); //logging
app.use(_bodyParser2['default'].urlencoded({ extended: false }));
app.use(_bodyParser2['default'].json());

//middlewares
var checkAuth = function checkAuth(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		_jsonwebtoken2['default'].verify(token, _configJs2['default'].secret, function (err, validUser) {
			if (err) {
				res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
			} else {

				Mongo._get('users', { '_id': new _mongodb.ObjectID(validUser._id) }).then(function (docs) {
					if (docs.length > 0) {
						req.user = docs[0];
						next();
					} else {
						res.code(500).json("can't find user");
					}
				})['catch'](function (err) {
					res.code(500).json(err.message);
				});
				//user is stuck withthe token vesion// need to re load the user object
			}
		});
	} else {
			res.status(401).json({ success: false, message: 'Failed to provide authentication token.' });
		}
};

var urlStrip = function urlStrip(req, res, next) {
	var path = _utilitiesJs2['default'].stripPath(req.url);
	req.strip_path = path;
	next();
};

//pre-auth routes
app.get('/');
app.use('/register', _routesRegisterJs2['default']);
app.use('/authorize', _routesAuthJs2['default']);

//check authentication before proceeding to api
app.use(checkAuth);

//strip path
app.use(urlStrip);

//api routes
app.use('/api', _routesApiJs2['default']);

app.get('*', function (req, res) {
	res.send('can\'t find that!', 404);
});

var server = app.listen(_configJs2['default'].port, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Listening at http://%s:%s', host, port);
});
module.exports = exports['default'];
//# sourceMappingURL=server.js.map