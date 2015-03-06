var FondsPlatform = require('../model/FondsPlatform.js');

exports.setup = function(app) {
	app.get('/FondsPlatformList', function(req, res, jump) {
		res.locals.session.hasPermission('fondsPlatform.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Fonds-Plattformen auflisten zu können.']});

			FondsPlatform.find({})
				.sort('name')
				.exec(function(err, platforms) {
					if (err) return jump(err);

					var response = {template: 'FondsPlatformList', data: {platforms: platforms}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/FondsPlatformAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsPlatform.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Fonds-Plattformen hinzufügen zu können.']});

			res.send({template: 'FondsPlatformAdd'});
		});
	});

	app.post('/FondsPlatformAdd', function(req, res, jump) {
		res.locals.session.hasPermission('fondsPlatform.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Fonds-Plattformen hinzufügen zu können.']});

			var platform = new FondsPlatform({name: req.body.name});
			platform.save(function(err) {
				if (err) return jump(err);
				
				res.send({status: 'success', template: 'FondsPlatformAdd', data: {platform: platform}});
			});
		});
	});

	app.get('/FondsPlatformEdit', function(req, res, jump) {
		res.locals.session.hasPermission('fondsPlatform.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Fonds-Plattformen bearbeiten zu können.']});

			FondsPlatform.findById(req.query.platformId)
				.exec(function(err, platform) {
					if (err) return jump(err);
					if (!platform) return res.send({status: 'error', template: 'Error', errors: ['Die Trading-Plattform konnte nicht gefunden werden.']});

					res.send({template: 'FondsPlatformEdit', data: {platform: platform}});
				});
		});
	});

	app.post('/FondsPlatformEdit', function(req, res, jump) {
		res.locals.session.hasPermission('fondsPlatform.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Fonds-Plattformen bearbeiten zu können.']});

			FondsPlatform.findById(req.body.platformId)
				.exec(function(err, platform) {
					if (err) return jump(err);
					if (!platform) return res.send({status: 'error', template: 'Error', errors: ['Die Trading-Plattform konnte nicht gefunden werden.']});

					platform.name = req.body.name;
					platform.save(function(err) {
						if (err) return jump(err);

						res.send({status: 'success', template: 'FondsPlatformEdit', data: {platform: platform}});
					});
				});
		});
	});

	app.get('/FondsPlatformDelete', function(req, res, jump) {
		res.locals.session.hasPermission('fondsPlatform.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Fonds-Plattformen löschen zu können.']});

			FondsPlatform.remove({_id: req.query.platformId})
				.exec(function(err) {
					if (err) return jump(err);

					res.writeHead(302, {'Location': '/FondsPlatformList?sessionId='+res.locals.session._id+'&status=success.delete'});
					res.end();
				});
		});
	});
};