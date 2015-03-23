var async = require('async'),
	Fonds = require('../model/Fonds.js'),
	FondsFee = require('../model/FondsFee.js'),
	FondsPlatform = require('../model/FondsPlatform.js'),
	FondsTrade = require('../model/FondsTrade.js');

exports.setup = function(app) {
	app.get('/FondsView', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canView', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um diesen Fonds ansehen zu können.']});
			
			var fees = [],
				fonds = null,
				trades = [];

			async.parallel([
				function(next) {
					Fonds.findById(req.query.fondsId)
						.populate('customers')
						.lean()
						.exec(function(err, item) {
							if (err) return next(err);
							fonds = item;
							next();
						});
				},

				function(next) {
					FondsTrade.find({fonds: req.query.fondsId})
						.sort('-date')
						.exec(function(err, items) {
							if (err) return next(err);
							trades = items;
							next();
						});
				},

				function(next) {
					FondsFee.find({fonds: req.query.fondsId})
						.sort('-date')
						.exec(function(err, items) {
							if (err) return next(err);
							fees = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);
				if (!fonds) return res.send({status: 'error', template: 'Error', errors: ['Der Fonds konnte nicht gefunden werden.']});

				var balance = 0,
					deposit = 0,
					initial = 0;
				for (var i = 0; i < fonds.customers.length; ++i) {
					deposit += fonds.customers[i].deposit.initial;
					initial += fonds.customers[i].deposit.initial;
				}
				for (var i = 0; i < fonds.customers.length; ++i) {
					fonds.customers[i].fondsShare = fonds.customers[i].deposit.initial / initial;
				}
				for (var i = 0; i < fees.length; ++i) {
					balance -= fees[i].amount;
					deposit -= fees[i].amount;
				}
				for (var i = 0; i < trades.length; ++i) {
					deposit += trades[i].earnings;
					balance += trades[i].earnings;
				}
				res.send({template: 'FondsView', data: {fonds: fonds, trades: trades, deposit: deposit, balance: balance, fees: fees}});
			});
		});
	});

	app.get('/FondsList', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um alle Fonds auflisten zu können.']});

			Fonds.find({})
				.sort('name')
				.populate('platforms')
				.exec(function(err, fonds) {
					if (err) return jump(err);

					response = {template: 'FondsList', data: {fonds: fonds}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/FondsAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um Fonds erstellen zu können.']});

			FondsPlatform.find({})
				.sort('name')
				.exec(function(err, platforms) {
					if (err) return jump(err);

					res.send({template: 'FondsAdd', data: {platforms: platforms}});
				});
		});
	});

	app.post('/FondsAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um Fonds erstellen zu können.']});

			var fonds = new Fonds({
				name: req.body.name,
				description: req.body.description,
				platforms: req.body.platforms
			});

			async.parallel([
				function(next) {fonds.save(next)},
				function(next) {
					FondsPlatform.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							platforms = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'FondsAdd', data: {fonds: fonds, platforms: platforms}});
			});
		});
	});

	app.get('/FondsEdit', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um Fonds bearbeiten zu können.']});

			var fonds = null,
				platforms = [];
			async.parallel([
				function(next) {
					Fonds.findById(req.query.fondsId)
						.exec(function(err, item) {
							if (err) return next(err);
							fonds = item;
							next();
						});
				},

				function(next) {
					FondsPlatform.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							platforms = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);
				if (!fonds) return res.send({status: 'error', template: 'Error', errors: ['Der Fonds konnte nicht gefunden werden.']});

				res.send({template: 'FondsEdit', data: {fonds: fonds, platforms: platforms}});
			});
		});
	});

	app.post('/FondsEdit', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um Fonds bearbeiten zu können.']});

			var fonds = null,
				platforms = [];
			async.parallel([
				function(next) {
					Fonds.findById(req.body.fondsId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({status: 'error', template: 'Error', errors: ['Der Fonds konnte nicht gefunden werden.']});

							fonds = item;
							fonds.name = req.body.name;
							fonds.description = req.body.description;
							fonds.platforms = req.body.platforms;
							fonds.save(next);
						});
				},

				function(next) {
					FondsPlatform.find({})
						.sort('name')
						.exec(function(err, items) {
							if (err) return next(err);
							platforms = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'FondsEdit', data: {platforms: platforms, fonds: fonds}});
			});
		});
	});

	app.get('/FondsDelete', function(req, res, jump) {
		res.locals.session.hasPermission('fonds.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Zugriffsberechtigungen, um Fonds löschen zu können.']});

			Fonds.remove({_id: req.query.fondsId})
				.exec(function(err) {
					if (err) return jump(err);

					res.writeHead(302, {'Location': '/FondsList?sessionId='+res.locals.session._id+'&status=success.delete'});
					res.end();
				});
		});
	});
}