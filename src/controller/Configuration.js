var async = require('async'),
	Configuration = require('../model/Configuration.js');

exports.setup = function(app) {
	app.get('/ConfigurationFieldList', function(req, res, jump) {
		res.locals.session.hasPermission('configurationField.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['DU darfst das nicht. (configurationField.canList)']});

			Configuration.findById(req.query.configurationId)
				.exec(function(err, configuration) {
					if (err) return jump(err);
					if (!configuration) return res.send({errors: ['No config for yu.']});

					// sortieren
					configuration.fields.sort(function(a, b) {
						if (a.name > b.name) return 1;
						if (a.name < b.name) return -1;
						return 0;
					});

					res.send({template: 'ConfigurationFieldList', data: {configuration: configuration}});
				});
		});
	});

	app.post('/ConfigurationFieldAdd', function(req, res, jump) {
		res.locals.session.hasPermission('configurationField.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['DU darfst das nicht. (configurationField.canAdd)']});

			Configuration.findById(req.body.configurationId)
				.exec(function(err, configuration) {
					if (err) return jump(err);
					if (!configuration) return res.send({errors: ['No such config']});

					for (var i = 0; i < configuration.fields.length; ++i) {
						if (configuration.fields[i].name == req.body.name) {
							configuration.fields.splice(i, 1);
							--i;
						}
					}

					configuration.fields.push({name: req.body.name, value: req.body.value});
					configuration.save(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ConfigurationFieldList?sessionId='+req.query.sessionId+'&configurationId='+req.body.configurationId+'&status=success.add'});
						res.send();
					})
				});
		});
	});

	app.get('/ConfigurationFieldDelete', function(req, res, jump) {
		res.locals.session.hasPermission('configurationField.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['DU darfst das nicht. (configurationField.canDelete)']});

			Configuration.findById(req.query.configurationId)
				.exec(function(err, configuration) {
					if (err) return jump(err);
					if (!configuration) return res.send({errors: ['No such config']});

					for (var i = 0; i < configuration.fields.length; ++i) {
						if (configuration.fields[i].name == req.query.name) {
							configuration.fields.splice(i, 1);
							break;
						}
					}

					configuration.save(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ConfigurationFieldList?sessionId='+req.query.sessionId+'&configurationId='+req.body.configurationId+'&status=success.delete'});
						res.send();
					});
				});
		});
	});

	app.post('/ConfigurationFieldEdit', function(req, res, jump) {
		res.locals.session.hasPermission('configurationField.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['DU darfst das nicht. (configurationField.canEdit)']});

			Configuration.findById(req.body.configurationId)
				.exec(function(err, configuration) {
					if (err) return jump(err);
					if (!configuration) return res.send({errors: ['No such config']});

					for (var i = 0; i < configuration.fields.length; ++i) {
						if (configuration.fields[i].name == req.query.name) {
							configuration.fields.splice(i, 1);
							break;
						}
					}

					configuration.save(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ConfigurationFieldList?sessionId='+req.query.sessionId+'&configurationId='+req.body.configurationId+'&status=success.edit'});
						res.send();
					});
				})
		});
	})
};