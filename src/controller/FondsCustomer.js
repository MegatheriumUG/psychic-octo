var async = require('async'),
	Fonds = require('../model/Fonds.js'),
	FondsCustomer = require('../model/FondsCustomer.js');

exports.setup = function(app) {
	app.get('/FondsCustomerAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsCustomer.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Fonds-Kunden anlegen zu können.']});
			if (!req.query.fondsId) return res.send({status: 'error', template: 'Error', errors: ['Fonds konnte nicht gefunden werden.']});

			Fonds.findById(req.query.fondsId)
				.exec(function(err, fonds) {
					if (err) return jump(err);

					res.send({template: 'FondsCustomerAdd', data: {fonds: fonds}});
				});
		});
	});

	app.post('/FondsCustomerAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsCustomer.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Fonds-Kunden anlegen zu können.']});

			var fonds = null;
			var customer = new FondsCustomer({
				fonds: req.body.fondsId,
				name: req.body.name,
				deposit: {
					initial: req.body.depositInitial,
					current: req.body.depositInitial,
					max: req.body.depositMax
				},
				reserve: 0
			});

			async.parallel([
				function(next) {customer.save(next);},
				function(next) {
					Fonds.findById(req.body.fondsId)
						.exec(function(err, item) {
							if (err) return next(err);
							fonds = item;

							fonds.customers.push(customer._id);
							fonds.save(next);
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'FondsCustomerAdd', data: {customer: customer, fonds: fonds}});
			});
		});
	});
};