var async = require('async'),
	doT = require('dot'),
	mongod = require('mongod-master'),
	Deployment = require('../model/Deployment.js');
doT.templateSettings.strip = false;

exports.setup = function(app) {
	var executeDeploymentScripts = function(action, req, res, jump) {
		Deployment.findById(req.query.deploymentId)
			.populate('services.service')
			.populate('services.servers.server')
			.populate('configurations')
			.exec(function(err, deployment) {
				if (err) return jump(err);

				var config = {};
				for (var i = 0; i < deployment.configurations.length; ++i) {
					for (var j = 0; j < deployment.configurations[i].fields.length; ++j) {
						var field = deployment.configurations[i].fields[j];
						config[field.name] = field.label;
					}
				}
				console.log(config);

				async.each(deployment.services, function(service, next) {
					service.service.populate('scripts')
						.populate('configurations', next);
				}, function(err) {
					if (err) return jump(err);

					var output = '';
					async.eachSeries(deployment.services, function(service, next) {
						var scripts = [];
						for (var i = 0; i < service.service.scripts.length; ++i) {
							if (service.service.scripts[i].type == action) scripts.push(service.service.scripts[i]);
						}
						var currentConfig = config;
						for (var i = 0; i < service.service.configurations.length; ++i) {
							for (var j = 0; j < service.service.configurations[i].fields.length; ++j) {
								var field = service.service.configurations[i].fields[j];
								if (!currentConfig.hasOwnProperty(field.name))
									currentConfig[field.name] = field.value;
							}
						}

						async.each(service.servers, function(item, next2) {
							var index = service.servers.indexOf(item);
							var server = item.server;
							var data = {};
							for (var i in currentConfig)
								if (currentConfig.hasOwnProperty(i))
									data[i] = currentConfig[i];
							data.serverIndex = index;
							data.deployment = deployment;
							data.service = service;
							data.getService = function(name) {
								for (var i = 0; i < deployment.services.length; ++i) {
									if (deployment.services[i].service.name == name) {
										var service = deployment.services[i].service;
										service.servers = [];
										for (var j = 0; j < deployment.services[i].servers.length; ++j) {
											service.servers.push(deployment.services[i].servers[j].server);
										}
										return service;
									}
								}
								return null;
							};
							data.hasService = function(name) {
								return data.getService(name) != null;
							};

							mongod.connect(server.ip+':2005', function(err) {
								if (err) return next2(err);

								async.parallel([
									function(next4) {
										async.eachSeries(scripts, function(script, next3) {
											var commands = script.commands.join('\n');
											mongod.executeCommands(server.ip+':2005', commands, function(err, out) {
												if (err) return next3(err);
												output += out;
												next3();
											});
										}, next4);
									},

									function(next4) {
										if (action != 'install') return next4();

										async.each(service.service.files, function(file, next3) {
											var fn = doT.template(file.content);
											var content = fn(data);
											mongod.writeFile(server.ip+':2005', file.name, content, next3);
										}, next4);
									}
								], next2);
							});
						}, next);
					}, function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/DeploymentView?sessionId='+res.locals.session._id+'&deploymentId='+deployment._id+'&status=sucess.'+action+'&message='+encodeURIComponent(output)});
						res.end();
					});
				});
			});
	};

	app.get('/DeploymentInstall', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canInstallService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['hier gibt es nichts zu sehen.']});

			executeDeploymentScripts('install', req, res, jump);
		});
	});

	app.get('/DeploymentUninstall', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canUninstallService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['hier gibt es nichts zu sehen.']});

			executeDeploymentScripts('uninstall', req, res, jump);
		});
	});

	app.get('/DeploymentStart', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canStartService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['hier gibt es nichts zu sehen.']});

			executeDeploymentScripts('start', req, res, jump);
		});
	});

	app.get('/DeploymentStop', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canStopService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['hier gibt es nichts zu sehen.']});

			executeDeploymentScripts('stop', req, res, jump);
		});
	});

	app.get('/DeploymentSetup', function(req, res, jump) {
		res.locals.session.hasPermission('deployment.canSetupService', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['hier gibt es nichts zu sehen.']});

			executeDeploymentScripts('setup', req, res, jump);
		});
	});
}