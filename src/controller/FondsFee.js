var async = require('async'),
	Fonds = require('../model/Fonds.js'),
	FondsFee = require('../model/FondsFee.js');

exports.setup = function(app) {
	app.get('/FondsFeeAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsFee.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Fonds-Gebühren melden zu können.']});

			Fonds.findById(req.query.fondsId)
				.exec(function(err, fonds) {
					if (err) return jump(err);
					if (!fonds) return res.send({status: 'error', template: 'Error', errors: ['Der Fonds konnte nicht gefunden werden.']});

					res.send({template: 'FondsFeeAdd', data: {fonds: fonds}});
				});
		});
	});

	app.post('/FondsFeeAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsFee.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Fonds-Gebühren melden zu können.']});

			var fee = new FondsFee({
					fonds: req.body.fonds,
					title: req.body.title,
					description: req.body.description,
					amount: req.body.amount
				}),
				fonds = null;

			async.parallel([
				function(next) {fee.save(next);},
				function(next) {
					Fonds.findById(req.body.fonds)
						.exec(function(err, item) {
							if (err) return next(err);
							fonds = item;
							next();
						})
				}
			], function(err) {
				if (err) return jump(err);

				res.send({template: 'FondsFeeAdd', status: 'success', data: {fonds: fonds, fee: fee}});
			});
		});
	});
}