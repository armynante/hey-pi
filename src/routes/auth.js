import express from 'express'
import Mongo from '../server.js';
import config from '../config.js';
import bcrypt from 'bcryptjs';
import collectionUtil from '../collectionUtil.js';
import utilities from '../utilities.js';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';

var router = express.Router();



router.post('/',(req,res) => {
	var email = req.body.email || req.query.email;
	var pass = req.body.pass || req.query.pass;

	var user = { "email": email, "pass": pass};
	//find user and test pass
	Mongo._getData(['users','email_is_' + email]).then((resp) => {
		//if we get a match
		if (resp.message.length) {
			var user = resp.message[0];
			//test the password
			bcrypt.compare(pass, user.password, (err,valid) => {
				if(valid) {
					var token = jwt.sign(user, config.secret, {
						expiresInMinutes: 1440 //24r
					});

					user['token'] = token;
					delete user['pass'];
					user['authorized'] = true;
					res.json(user);

				} else {
					res.status(401).json({success: false, message:"password incorrect"});
				}

			});
		} else {
			res.status(404).json({success: false, message:"no user found with that email"});
		}
	})
	.catch((err) => {
		res.status(500).json(err)
	});
});

export default router;
