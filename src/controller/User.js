var async = require('async'),
	Session = require('../model/Session.js'),
	User = require('../model/User.js');

exports.setup = function(app) {
	app.post('/UserLogin', function(req, res, jump) {
		User.findOne({username: req.param('username')})
			.exec(function(err, user) {
				if (err) return jump(err);
				if (!user) return res.send({status: 'error', errors: ['Login fehlgeschlagen.']});

				user.comparePassword(req.param('password'), function(err, isMatch) {
					if (err) return jump(err);
					if (!isMatch) return res.send({status: 'error', errors: ['Login fehlgeschlagen.']});

					var session = new Session({
						user: user._id
					});
					session.save(function(err) {
						if (err) return jump(err);

						res.send({data: {sessionId: session._id}});
					});
				});
			});
	});

	app.post('/UserAdd', function(req, res, jump) {
		var user = new User({
			username: req.param('username'),
			email: req.param('email'),
			password: req.param('password'),
			name: {first: req.param('name.first'), last: req.param('name.last')}
		});

		if (!user.username) return res.send({status: 'error', errors: ['Benutzer ohne Benutzernamen machen wohl wenig Sinn.']});
		if (!user.email) return res.send({status: 'error', errors: ['Srsly. Du musst ne E-Mail angeben. Sorry.']});
		if (!user.password) return res.send({status: 'error', errors: ['Wieviel Sicherheit steckt in dem Password "" ?']});
		user.save(function(err) {
			if (err) return jump(err);

			res.send({status: 'success', data: {user: user._id}});
		});
	});
}