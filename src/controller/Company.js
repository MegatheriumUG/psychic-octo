var db = require('mongoose'),
	Company = require('../model/Company.js');

exports.setup = function(app) {
	app.get('/CompanyList', function(req, res, jump) {
		Company.find({})
			.exec(function(err, companies) {
				if (err) return jump(err);

				res.send({data: {companies: companies}, template: 'CompanyList'});
			});
	});
};