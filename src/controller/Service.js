var async = require('async'),
	Script = require('../model/Script.js'),
	Service = require('../model/Service.js');

exports.setup = function(app) {
	app.get('/ServiceList', function(req, res, jump) {
		res.locals.session.hasPermission('service.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canList)']});

			Service.find({})
				.exec(function(err, services) {
					if (err) return jump(err);

					res.send({template: 'ServiceList', data: {services: services}});
				});
		});
	});

	app.get('/ServiceAdd', function(req, res, jump) {
		res.locals.session.hasPermission('service.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canAdd)']});

			res.send({template: 'ServiceAdd'});
		});
	});

	app.post('/ServiceAdd', function(req, res, jump) {
		res.locals.session.hasPermission('service.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canAdd)']});

			var service = new Service({name: req.body.name});
			service.save(function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'ServiceAdd', data: {service: service}});
			});
		});
	});

	app.get('/ServiceView', function(req, res, jump) {
		res.locals.session.hasPermission('service.canView', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canView)']});

			Service.findById(req.query.serviceId)
				.populate('configurations')
				.populate('scripts')
				.exec(function(err, service) {
					if (err) return jump(err);
					if (!service) return res.send({errors: ['No such service, duh']});

					var response = {template: 'ServiceView', data: {service: service}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/ServiceScriptAdd', function(req, res, jump) {
		res.locals.session.hasPermission('service.canAddScript', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canAddScript)']});

			Service.findById(req.query.serviceId)
				.exec(function(err, service) {
					if (err) return jump(err);
					if (!service) return res.send({errors: ['Service nicht gefunden']});

					res.send({template: 'ServiceScriptAdd', data: {service: service}});
				});
		});
	});

	app.post('/ServiceScriptAdd', function(req, res, jump) {
		res.locals.session.hasPermission('service.canAddScript', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canAddScript)']});

			var script = new Script({
					service: req.body.serviceId,
					type: req.body.type,
					commands: []
				}),
				service = null;
			var parts = req.body.commands.split('\n');
			for (var i = 0; i < parts.length; ++i) {
				parts[i] = parts[i].trim();
				if (parts[i]) script.commands.push(parts[i]);
			}

			async.parallel([
				function(next) {script.save(next);},
				function(next) {
					Service.findById(req.body.serviceId)
						.exec(function(err, item) {
							if (err) return next(err);
							service = item;
							service.scripts.push(script._id);
							service.save(next);
						});
				}
			], function(err) {
				if (err) return jump(err);
				res.send({status: 'success', template: 'ServiceScriptAdd', data: {service: service}});
			});
		});
	});

	app.get('/ServiceScriptEdit', function(req, res, jump) {
		res.locals.session.hasPermission('service.canEditScript', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canEditScript)']});

			Script.findById(req.query.scriptId)
				.populate('service')
				.exec(function(err, script) {
					if (err) return jump(err);
					if (!script) return res.send({errors: ['Hatte keine Lust, nach dem Skript zu suchen.']});

					res.send({template: 'ServiceScriptEdit', data: {script: script}});
				});
		});
	});

	app.post('/ServiceScriptEdit', function(req, res, jump) {
		res.locals.session.hasPermission('service.canEditScript', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canEditScript)']});

			Script.findById(req.body.scriptId)
				.populate('service')
				.exec(function(err, script) {
					if (err) return jump(err);
					if (!script) return res.send({errors: ['Skript wurde, während du es bearbeitet hast, gelöscht. (also hat jemand anderes deine Arbeit zunichte gemacht)']});

					script.type = req.body.type;
					script.commands = [];
					var parts = req.body.commands.split(',');
					for (var i = 0; i < parts.length; ++i) {
						parts[i] = parts[i].trim();
						if (parts[i]) script.commands.push(parts[i]);
					}
					script.save(function(err) {
						if (err) return jump(err);

						res.send({status: 'success', template: 'ServiceScriptEdit', data: {script: script}});
					});
				});
		});
	});

	app.get('/ServiceScriptDelete', function(req, res, jump) {
		res.locals.session.hasPermission('service.canDeleteScript', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Du hast keine Rechte - also bist du kein Nazi. (service.canDeleteScript)']});

			Script.findById(req.query.scriptId)
				.exec(function(err, script) {
					if (err) return jump(err);
					if (!script) return res.send({errors: ['Skript nicht gefunden, also schon gelöscht! Glückwunsch!']});

					script.remove(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ServiceView?sessionId='+res.locals.session._id+'&serviceId='+script.service+'&status=success.scriptDelete'});
						res.end();
					});
				});
		});
	});
};