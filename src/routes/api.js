import express from 'express'
import Mongo from '../server.js';
import bodyParser from 'body-parser';


var router = express.Router();


router.get('/*', (req, res) => {
		if(req.strip_path[0] !== undefined) {
	 		Mongo._getData(req.strip_path, req.user).then((resp) => {
				res.status(resp.code).json(resp.message);
			})
			.catch((err) => {
				res.json("error querying path " + req.strip_path);
			});
		} else {
			res.status(404).json("Hi!");
		}
	})

router.post('/*', (req,res) => {
		Mongo._saveData(req.strip_path, req.body, req.user).then((resp) => {
			res.status(resp.code).json(resp.message);
		})
		.catch((err) => {
			res.status(err.code).json("error saving data");
		});
    req.user.documents++;
    Mongo._update('users',{'_id':user._id}, req.user);
	})

router.put('/*', (req,res) => {
		Mongo._updateData(req.strip_path, req.body, req.user).then((resp) => {
			res.status(resp.code).json(resp.message);
		})
		.catch((err) => {
      console.log(err);
			res.status(500).json(err.message);
		});
	})

router.delete('/*', (req,res) => {
		Mongo._delData(req.strip_path, req.user).then((resp) => {
			res.status(resp.code).json(resp.message);
		})
		.catch((err) => {
			res.status(err.code).json("error updating data");
		});
	});

export default router
