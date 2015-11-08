import express from 'express'
import Mongo from '../server.js';
import bodyParser from 'body-parser';


var router = express.Router();


router.get('/*', (req, res) => {
		if(req.strip_path[0].length > 1) {
	 		Mongo._getData(req.strip_path).then((resp) => {
				res.status(resp.code).json(resp.body);
			})
			.catch((err) => {
				res.json("error querying path " + req.strip_path);
			});
		} else {
			res.status(404).json("Hi!");
		}
	})

router.post('/*', (req,res) => {
		Mongo._saveData(req.strip_path, req.body).then((resp) => {
			res.status(resp.code).json(resp.body);
		})
		.catch((err) => {
			res.status(err.code).json("error saving data");
		});
	})

router.put('/*', (req,res) => {
		Mongo._updateData(req.strip_path, req.body).then((resp) => {
			res.status(resp.code).json(resp.body);
		})
		.catch((err) => {
			res.status(err.code).json(err.body);
		});
	})

router.delete('/*', (req,res) => {
		Mongo._delData(req.strip_path).then((resp) => {
			res.status(resp.code).json(resp.body);
		})
		.catch((err) => {
			res.status(err.code).json("error updating data");
		});
	});

export default router
