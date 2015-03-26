var async = require('async'),
	Configuration = require('../model/Configuration.js'),
	Deployment = require('../model/Deployment.js'),
	Service = require('../model/Service.js');

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
	});

	app.get('/ConfigurationAdd', function(req, res, jump) {
		res.locals.session.hasPermission('configuration.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Yoyo no can do that! (configuration.canAdd)']});
			
			var configurations = [],
				deployment = null,
				service = null;
			async.parallel([
				function(next) {
					Configuration.find({})
						.sort('name')
						.exec(function(err, items) {
							configurations = items;
							next(err);
						});
				},

				function(next) {
					if (!req.query.deploymentId) return next();

					Deployment.findById(req.query.deploymentId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({errors: ['no such deploy']});
							deployment = item;
							next();
						});
				},

				function(next) {
					if (!req.query.serviceId) return next();

					Service.findById(req.query.serviceId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!service) return res.send({errors: ['no such service']});
							service = item;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);
				res.send({template: 'ConfigurationAdd', data: {configurations: configurations, deployment: deployment, service: service}});
			});
		});
	});

	app.post('/ConfigurationAdd', function(req, res, jump) {
		res.locals.session.hasPermission('configuration.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Yoyo no can do that! (configuration.canAdd)']});
			
			var configuration = null,
				configurationId = null,
				configurations = [],
				deployment = null,
				service = null;
			if (req.body.configurationId) configurationId = req.body.configurationId;
			else {
				configuration = new Configuration({name: req.body.name});
				configurationId = configuration._id;
			}

			async.parallel([
				function(next) {
					if (!req.body.deploymentId) return next();

					Deployment.findById(req.body.deploymentId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({errors: ['no such deploy']});

							deployment = item;
							deployment.configurations.push(configurationId);
							deployment.save(next);
						});
				},

				function(next) {
					if (!req.body.serviceId) return next();

					Service.findById(req.body.serviceId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({errors: ['no such service']});

							service = item;
							service.configurations.push(configurationId);
							service.save(next);
						});
				},

				function(next) {
					if (!configuration) return next();

					configuration.save(next);
				},

				function(next) {
					Configuration.find({})
						.sort('name')
						.exec(function(err, items) {
							if (err) return next(err);
							configurations = items;
							next();
						})
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'ConfigurationAdd', data: {configuration: configuration, deployment: deployment, service: service, configurations: configurations}});
			});
		});
	});

	app.get('/ConfigurationEdit', function(req, res, jump) {
		res.locals.session.hasPermission('configuration.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Yoyo no can do that! (configuration.canEdit)']});
			
			var configuration = null;
			Configuration.findById(req.query.configurationId)
				.exec(function(err, configuration) {
					if (err) return jump(err);
					if (!configuration) return res.send({errors: ['no such config']});

					res.send({template: 'ConfigurationEdit', data: {configuration: configuration}});
				});
		});
	});

	app.post('/ConfigurationEdit', function(req, res, jump) {
		res.locals.session.hasPermission('configuration.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Yoyo no can do that! (configuration.canEdit)']});
			
			Configuration.findById(req.body.configurationId)
				.exec(function(err, configuration) {
					if (err) return jump(err);
					if (!configuration) return res.send({errors: ['no such config']});

					configuration.name = req.body.name;
					configuration.save(function(err) {
						if (err) return jump(err);
						res.send({status: 'success', template: 'ConfigurationEdit', data: {configuration: configuration}});
					});
				});
		});
	});

	app.get('/ConfigurationDelete', function(req, res, jump) {
		res.locals.session.hasPermission('configuration.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Yoyo no can do that! (configuration.canDelete)']});
			
			async.parallel([
				function(next) {
					if (!req.body.deploymentId) return next();

					Deployment.findById(req.query.deploymentId)
						.exec(function(err, deployment) {
							if (err) return next(err);
							if (!deployment) return res.send({errors: ['no such deploy']});

							for (var i = 0; i < deployment.configurations.length; ++i) {
								if (deployment.configurations[i].equals(req.query.configurationId)) {
									deployment.configurations.splice(i, 1);
									break;
								}
							}

							deployment.save(next);
						});
				},

				function(next) {
					if (!req.body.serviceId) return next();

					Service.findById(req.query.serviceId)
						.exec(function(err, service) {
							if (err) return next(err);
							if (!service) return res.send({errors: ['no such service']});

							for (var i = 0; i < service.configurations.length; ++i) {
								if (service.configurations[i].equals(req.query.configurationId)) {
									service.configurations.splice(i, 1);
									break;
								}
							}

							service.save(next);
						});
				}
			], function(err) {
				if (err) return jump(err);

				if (req.query.deploymentId) res.writeHead(302, {'Location': '/DeploymentView?sessionId='+res.locals.session._id+'&deploymentId='+req.query.deploymentId+'&status=success.configurationDelete'});
				else res.writeHead(302, {'Location': '/ServiceView?sessionId='+res.locals.session._id+'&serviceId='+req.query.serviceId+'&status=success.configurationDelete'});
				res.end();
			});
		});
	})
};