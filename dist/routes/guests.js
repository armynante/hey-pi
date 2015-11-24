'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _serverJs = require('../server.js');

var _serverJs2 = _interopRequireDefault(_serverJs);

var _modelsUserJs = require('../models/user.js');

var _configJs = require('../config.js');

var _configJs2 = _interopRequireDefault(_configJs);

var _utilitiesJs = require('../utilities.js');

var _utilitiesJs2 = _interopRequireDefault(_utilitiesJs);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _bcryptjs = require('bcryptjs');

var _bcryptjs2 = _interopRequireDefault(_bcryptjs);

var _mongodb = require("mongodb");

var router = _express2['default'].Router();

router.post('/', function (req, res) {
	var guest = new _modelsUserJs.User(req.body.email);
	guest.isGuest = true;
	guest.usersId = req.user._id;
	guest.setPassword(req.body.pass).then(function () {
		return guest.save();
	}).then(function (resp) {
		var html = '';
		var emailSubject = '';
		if (req.body.htmlEmailMessage !== null && req.body.htmlEmailMessage !== '') {
			html = req.body.htmlEmailMessage;
		}
		if (req.body.emailSubject !== null && req.body.emailSubject !== '') {
			emailSubject = req.body.emailSubject;
		}
		html += "<br><p>please click on the link to confirm account<p></br><a href='http://hey-pi.com/confirm?token=" + resp.message.token + "'>confirm account...</a>";
		_utilitiesJs2['default'].sendEmail(guest.email, emailSubject, html);
		res.status(resp.code).json(resp.message);
	})['catch'](function (err) {
		res.status(err.code).json(err);
	});
});

router.post('/authorize', function (req, res) {
	var email = req.body.email || req.query.email;
	var pass = req.body.pass || req.query.pass;

	var user = { "email": email, "pass": pass };
	//find user and test pass
	_serverJs2['default']._getData(['users', 'email_is_' + email]).then(function (resp) {
		//if we get a match
		if (resp.message.length) {
			var user = resp.message[0];
			//test the password
			_bcryptjs2['default'].compare(pass, user.password, function (err, valid) {
				if (valid) {
					var token = _jsonwebtoken2['default'].sign(user, _configJs2['default'].secret, {
						expiresIn: "30d" //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.json(user);
				} else {
					res.status(401).json({ success: false, message: "password incorrect" });
				}
			});
		} else {
			res.status(404).json({ success: false, message: "no user found with that email" });
		}
	})['catch'](function (err) {
		console.log(err);
		res.status(500).json(err);
	});
});

router.get('/', function (req, res) {
	_serverJs2['default']._get('users', { 'usersId': req.user._id }).then(function (resp) {
		req.user.reads++;
		_serverJs2['default']._update('users', { '_id': req.user._id }, req.user);
		res.status(200).json(resp);
	})['catch'](function (err) {
		console.log(err);
		res.json(err);
	});
});

router.get('/:userId', function (req, res) {
	try {
		var id = new _mongodb.ObjectID(req.params.userId);
	} catch (e) {
		res.status(500).json({ message: "Error parsing id. Please check too see if the id is valid." });
	}

	_serverJs2['default']._get('users', { 'usersId': req.user._id, "_id": id }).then(function (resp) {
		req.user.reads++;
		_serverJs2['default']._update('users', { '_id': req.user._id }, req.user);
		res.status(200).json(resp);
	})['catch'](function (err) {
		console.log(err);
		res.json(err);
	});
});

router.put('/:userId', function (req, res) {

	try {

		var id = new _mongodb.ObjectID(req.params.userId);

		if (req.body._id !== undefined) {
			req.body._id = new _mongodb.ObjectID(req.body._id);
		}
	} catch (e) {
		res.status(500).json({ message: "Error parsing id. Please check too see if the id is valid." });
	}
	console.log(req.user._id);
	_serverJs2['default']._update('users', { "_id": id }, req.body).then(function (resp) {
		req.user.writes++;
		_serverJs2['default']._update('users', { '_id': req.user._id }, req.user);
		console.log(resp);
		res.status(200).json({ "success": true, "message": "guest record updated" });
	})['catch'](function (err) {
		res.status(err.message.code).json({ message: err.message.message });
	});
});

exports['default'] = router;
module.exports = exports['default'];
//# sourceMappingURL=guests.js.map