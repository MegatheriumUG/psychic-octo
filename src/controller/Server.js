var async = require('async'),
	Owner = require('../model/Owner.js'),
	Server = require('../model/Server.js');

exports.setup = function(app) {
	app.get('/ServerList', function(req, res, jump) {
		res.locals.session.hasPermission('server.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechtigung (server.canList).']});

			Server.find({})
				.populate('owner')
				.sort('owner ip')
				.exec(function(err, servers) {
					if (err) return jump(err);

					var response = {template: 'ServerList', data: {servers: servers}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/ServerAdd', function(req, res, jump) {
		res.locals.session.hasPermission('server.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canAdd).']});

			Owner.find({})
				.sort('name')
				.exec(function(err, owners) {
					if (err) return jump(err);

					res.send({template: 'ServerAdd', data: {owners: owners}});
				});
		});
	});

	app.post('/ServerAdd', function(req, res, jump) {
		res.locals.session.hasPermission('server.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canAdd).']});

			var server = new Server({
				ip: req.body.ip,
				owner: req.body.ownerId,
				domains: [],
				resources: {
					ram: req.body.ram,
					cpus: req.body.cpus,
					hdd: req.body.hdd,
					ssd: req.body.ssd
				}
			});
			var parts = req.body.domains.split(',');
			for (var i = 0; i < parts.length; ++i) {
				parts[i] = parts[i].trim();
				if (parts[i]) server.domains.push(parts[i]);
			}

			var owners = [];
			async.parallel([
				function(next) {server.save(next);},
				function(next) {
					Owner.find({})
						.sort('name')
						.exec(function(err, items) {
							owners = items;
							next(err);
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'ServerAdd', data: {owners: owners}});
			});
		});
	});

	app.get('/ServerEdit', function(req, res, jump) {
		res.locals.session.hasPermission('server.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canEdit).']});

			Server.findById(req.query.serverId)
				.populate('owner')
				.exec(function(err, server) {
					if (err) return jump(err);
					if (!server) return res.send({errors: ['Der Server ist nonexistent.']});

					res.send({template: 'ServerEdit', data: {server: server}});
				});
		});
	});

	app.post('/ServerEdit', function(req, res, jump) {
		res.locals.session.hasPermission('server.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canEdit).']});

			Server.findById(req.body.serverId)
				.populate('owner')
				.exec(function(err, server) {
					if (err) return jump(err);
					if (!server) return res.send({errors: ['Der Server ist nonexistent.']});

					server.ip = req.body.ip;
					server.owner = req.body.ownerId;
					server.resources = {
						ram: req.body.ram,
						cpus: req.body.cpus,
						hdd: req.body.hdd,
						ssd: req.body.ssd
					};
					server.save(function(err) {
						if (!err) return jump(err);

						res.send({status: 'success', template: 'ServerEdit', data: {server: server}});
					});
				});
		});
	});

	app.get('/ServerView', function(req, res, jump) {
		res.locals.session.hasPermission('server.canView', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canView).']});

			Server.findById(req.query.serverId)
				.populate('owner')
				.exec(function(err, server) {
					if (err) return jump(err);
					if (!server) return res.send({errors: ['Der Server ist nonexistent.']});

					var response = {template: 'server.canView', data: {server: server}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/ServerDelete', function(req, res, jump) {
		res.locals.session.hasPermission('server.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canDelete).']});

			Server.findById(req.query.serverId)
				.exec(function(err, server) {
					if (err) return jump(err);
					if (!server) return res.send({errors: ['Der Server ist nonexistent.']});

					server.remove(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ServerList?sessionId='+res.locals.session._id+'&status=delete.success'});
						res.end();
					});
				});

		});
	});

	app.post('/ServerDomainAdd', function(req, res, jump) {
		res.locals.session.hasPermission('server.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({template: 'PermissionError', errors: ['Sie haben nicht die notwendige Berechigung (server.canEdit).']});

			Server.findById(req.body.serverId)
				.exec(function(err, server) {
					if (err) return jump(err);
					if (!server) return res.send({errors: ['Der Server ist nonexistent.']});

					if (!server.domains) server.domains = [];
					server.domains.push(req.body.domain);
					server.save(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ServerView?sessionId='+res.locals.session._id+'&serverId='+req.body.serverId+'&status=success.domainAdd'});
						res.end();
					});
				});	

		});
	});
}