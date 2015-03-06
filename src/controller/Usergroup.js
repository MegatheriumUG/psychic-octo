var Usergroup = require('../model/Usergroup.js');

exports.setup = function(app) {
	app.get('/UsergroupList', function(req, res, jump) {
		Usergroup.find({})
			.exec(function(err, usergroups) {
				if (err) return jump(err);

				res.send({template: 'UsergroupList', data: {usergroups: usergroups}});
			});
	});

	app.get('/UsergroupAdd', function(req, res, jump) {
		res.send({template: 'UsergroupAdd'});
	});

	app.post('/UsergroupAdd', function(req, res, jump) {
		var group = new Usergroup({name: req.body.name});
		group.save(function(err) {
			if (err) return jump(err);

			res.send({template: 'UsergroupAdd', status: 'success', data: {group: group}});
		});
	});
}