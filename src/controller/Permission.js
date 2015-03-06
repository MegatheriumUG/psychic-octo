var async = require('async'),
	Permission = require('../model/Permission.js'),
	Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/PermissionEdit', function(req, res, jump) {
		var permissions = [],
			usergroup = null;

		async.parallel([
			function(next) {
				Usergroup.findById(req.query.usergroupId)
					.exec(function(err, item) {
						if (err) return next(err);
						if (!item) return res.send({status: 'error', template: 'Error', errors: ['Die angeforderte Benutzergruppe konnte nicht gefunden werden.']});

						usergroup = item;
						next();
					});
			},

			function(next) {
				Permission.find({usergroup: req.query.usergroupId})
					.sort('name')
					.exec(function(err, items) {
						if (err) return next(err);
						permissions = items;

						next();
					});
			}
		], function(err) {
			if (err) return jump(err);

			var response = {template: 'PermissionEdit', data: {usergroup: usergroup, permissions: permissions}};
			if (req.query.status) response.status = req.query.status;
			res.send(response);
		});
	});

	app.post('/PermissionAdd', function(req, res, jump) {
		Permission.findOne({usergroup: req.body.usergroupId, name: req.body.name})
			.exec(function(err, permission) {
				if (err) return jump(err);

				if (!permission) permission = new Permission({usergroup: req.body.usergroupId, name: req.body.name});
				permission.value = true;
				permission.save(function(err) {
					if (err) return jump(err);

					res.writeHead(302, {'Location': '/PermissionEdit?sessionId='+req.query.sessionId+'&usergroupId='+req.body.usergroupId+'&status=add.success'});
					res.end();
				});
			});
	});

	app.get('/PermissionDelete', function(req, res, jump) {
		Permission.findByIdAndRemove(req.query.permissionId)
			.exec(function(err, permission) {
				if (err) return jump(err);

				res.writeHead(302, {'Location': '/PermissionEdit?sessionId='+req.query.sessionId+'&usergroupId='+permission.usergroup+'&status=delete.success'});
				res.end();
			});
	});
};