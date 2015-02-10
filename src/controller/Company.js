var async = require('async'),
	config = require('../config.js'),
	db = require('mongoose'),
	fs = require('fs'),
	Company = require('../model/Company.js'),
	File = require('../model/File.js');

exports.setup = function(app) {
	app.get('/CompanyList', function(req, res, jump) {
		Company.find({})
			.exec(function(err, companies) {
				if (err) return jump(err);

				res.send({data: {companies: companies}, template: 'CompanyList'});
			});
	});

	/**
	 * Hinzufügen von Unternehmen
	 */
	app.get('/CompanyAdd', function(req, res, jump) {
		res.send({template: 'CompanyAdd'});
	});
	app.post('/CompanyAdd', function(req, res, jump) {
		var company = new Company({
			name: req.param('name'),
			description: req.param('description')
		});

		if (!company.name) return res.send({status: 'error', errors: ['Sie müssen einen Namen für das Unternehmen angeben.']});
		if (req.param('image')) company.image = new File();

		async.parallel([
			function(next) {
				if (!req.param('image')) return next();

				company.image.save(next);
			},

			function(next) {
				if (!req.param('image')) return next();

				fs.writeFile(config.PICTURE_DIRECTORY+file._id, req.param('image'), next);
			},

			function(next) {company.save(next);}
		], function(err) {
			if (err) return jump(err);
			res.send({status: 'success', template: 'CompanyAdd'});
		});
	});
};