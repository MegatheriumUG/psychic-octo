var async = require('async'),
	Fonds = require('../model/Fonds.js'),
	FondsPlatform = require('../model/FondsPlatform.js'),
	FondsTrade = require('../model/FondsTrade.js');

exports.setup = function(app) {
	app.get('/FondsTradeAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsTrade.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Trades hinzufügen zu können.']});

			var fonds = null,
				platforms = [];

			async.parallel([
				function(next) {
					FondsPlatform.find({})
						.exec(function(err, items) {
							if (err) return next(err);
							platforms = items;
							next();
						});
				},
				function(next) {
					Fonds.findById(req.query.fondsId)
						.exec(function(err, item) {
							if (err) return jump(err);
							fonds = item;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({template: 'FondsTradeAdd', data: {platforms: platforms, fonds: fonds}});
			});
		});
	});

	app.post('/FondsTradeAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsTrade.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Trades hinzufügen zu können.']});

			var fonds = null,
				platforms = [],
				trade = new FondsTrade({
					platform: {
						open: req.body.platformOpen,
						close: req.body.platformClose
					},
					fonds: req.body.fonds,
					volume: req.body.volume,
					position: {
						open: req.body.positionOpen,
						expected: req.body.positionExpected,
						close: req.body.positionClose
					},
					earnings: req.body.earnings
				});

			async.parallel([
				function(next) {trade.save(next);},
				function(next) {
					Fonds.findById(req.body.fonds)
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

				res.send({status: 'success', template: 'FondsTradeAdd', data: {platforms: platforms, fonds: fonds}});
			});
		});
	});
};