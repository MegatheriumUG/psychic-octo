var async = require('async'),
	Deployment = require('../model/Deployment.js'),
	Server = require('../model/Server.js'),
	Service = require('../model/Service.js');

exports.setup = function(app) {
	app.get('/DeploymentList', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canList)']});

			Deployment.find({})
				.sort('name')
				.populate('services.service')
				.exec(function(err, deployments) {
					if (err) return jump(err);

					var response = {template: 'DeploymentList', data: {deployments: deployments}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/DeploymentView', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canView', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canView)']});

			Deployment.findById(req.query.deploymentId)
				.populate('services.service')
				.populate('services.servers.server')
				.populate('configurations')
				.exec(function(err, deployment) {
					if (err) return jump(err);
					if (!deployment) return res.send({errors: ['no such deploy']});

					var response = {template: 'DeploymentView', data: {deployment: deployment}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.post('/DeploymentAdd', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canAdd)']});

			var deployment = new Deployment({name: req.body.name, description: req.body.description});
			deployment.save(function(err) {
				if (err) return jump(err);

				res.writeHead(302, {'Location': '/DeploymentView?sessionId='+res.locals.session._id+'&deploymentId='+deployment._id+'&status=success.add'});
				res.end();
			});
		});
	});

	app.get('/DeploymentDelete', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canDelete)']});

			Deployment.findById(req.query.deploymentId)
				.exec(function(err, deployment) {
					if (err) return jump(err);
					if (!deployment) return res.send({errors: ['no such deploy']});

					deployment.remove(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/DeploymentList?sessionId='+res.locals.session._id+'&status=success.delete'});
						res.end();
					});
				});
		});
	});

	app.get('/DeploymentServiceAdd', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canAddService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canAddService)']});

			var deployment = null,
				servers = [],
				services = [];
			async.parallel([
				function(next) {
					Deployment.findById(req.query.deploymentId)
						.exec(function(err, item) {
							if (!item) return res.send({errors: ['no such deploy']});
							deployment = item;
							next(err);
						});
				},

				function(next) {
					Service.find({})
						.sort('name')
						.exec(function(err, items) {
							services = items;
							next(err);
						});
				},

				function(next) {
					Server.find({})
						.populate('owner')
						.sort('owner ip')
						.exec(function(err, items) {
							servers = items;
							next(err);
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({template: 'DeploymentServiceAdd', data: {deployment: deployment, services: services, servers: servers}});
			});
		});
	});

	app.post('/DeploymentServiceAdd', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canAddService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canAddService)']});

			var service = {
				service: req.body.serviceId,
				servers: []
			};
			var serverIds = (!Array.isArray(req.body.servers)) ? [req.body.servers] : req.body.servers;
			for (var i = 0; i < serverIds.length; ++i) {
				service.servers.push({server: serverIds[i], installed: false});
			}

			var deployment = null,
				servers = [],
				services = [];
			async.parallel([
				function(next) {
					Deployment.findById(req.body.deploymentId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({errors: ['no such deploy']});
							deployment = item;

							deployment.services.push(service);
							deployment.save(next);
						});
				},

				function(next) {
					Service.find({})
						.sort('name')
						.exec(function(err, items) {
							services = items;
							next(err);
						});
				},

				function(next) {
					Server.find({})
						.populate('owner')
						.sort('owner ip')
						.exec(function(err, items) {
							servers = items;
							next(err);
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'DeploymentServiceAdd', data: {deployment: deployment, servers: servers, services: services}});
			});
		});
	});

	app.get('/DeploymentConfigurationDelete', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canDeleteConfiguration', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canDeleteConfiguration)']});

			Deployment.findById(req.query.deploymentId)
				.exec(function(err, deployment) {
					if (err) return jump(err);
					if (!deployment) return res.send({errors: ['no such deploy']});

					for (var i = 0; i < deployment.configurations.length; ++i) {
						if (deployment.configurations[i].equals(req.query.configurationId)) {
							deployment.splice(i, 1);
							break;
						}
					}

					res.writeHead(302, {'Location': '/DeploymentView?sessionId='+res.locals.session._id+'&deploymentId='+req.query.deploymentId+'&status=success.configurationDelete'});
					res.end();
				});
		});
	});

	app.get('/DeploymentServiceEdit', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canEditService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canEditService)']});

			Deployment.findById(req.query.deploymentId)
				.exec(function(err, deployment) {
					if (err) return jump(err);
					if (!deployment) return res.send({errors: ['no such deploy']});

					res.send('auf mehr hatte ich noch kein bock. mache ich morgen. sorry.');
				});
		});
	});

	app.get('/DeploymentServiceDelete', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canDeleteService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['keine rechte wie bei ner autonomen demo (deployment.canDeleteService)']});

			Deployment.findById(req.query.deploymentId)
				.exec(function(err, deployment) {
					if (err) return jump(err);
					if (!deployment) return res.send({errors: ['no such deploy']});

					for (var i = 0; i < deployment.services.length; ++i) {
						if (deployment.services[i].service.equals(req.query.serviceId)) {
							deployment.services.splice(i, 1);
							break;
						}
					}

					deployment.save(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/DeploymentView?sessionId='+res.locals.session._id+'&deploymentId='+deployment._id+'&status=success.serviceDelete'});
						res.end();
					});
				});
		});
	});
}