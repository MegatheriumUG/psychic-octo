var config = require('../config/config.js'),
	git = require('nodegit');

exports.setup = function(app) {
	app.get('/GitRepositoryClone', function(req, res, jump) {
		console.log('clone from '+req.param('source'));
		git.Clone.clone(req.param('source'), config.GIT_REPOSITORY_DIRECTORY+req.param('target'))
			.then(function(repository) {
				res.send(repository);
			});
	});

	app.get('/GitRepositoryCreate', function(req, res, jump) {
		console.log('creating repository in');
		console.log(config.GIT_REPOSITORY_DIRECTORY+req.param('name'));
		git.Repository.init(config.GIT_REPOSITORY_DIRECTORY+req.param('name'), false)
			.then(function(result) {
				res.send({status: result});
			});
	});
}