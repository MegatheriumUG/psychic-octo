var async = require('async'),
	Company = require('../model/Company.js'),
	Project = require('../model/Project.js');

exports.setup = function(app) {
	app.get('/ProjectList', function(req, res, jump) {
		res.locals.session.hasPermission('project.canList', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um alle Projekte auflisten zu können.']});

			var options = {};
			if (req.param('companyId')) options.companies = req.param('companyId');

			Project.find(options)
				.sort('name')
				.populate('companies')
				.exec(function(err, projects) {
					if (err) return jump(err);

					var response = {template: 'ProjectList', data: {projects: projects}};
					if (req.query.status) response.status = req.query.status;
					res.send(response);
				});
		});
	});

	app.get('/ProjectDelete', function(req, res, jump) {
		res.locals.session.hasPermission('project.canDelete', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um Projekte löschen zu können.']});

			Project.findById(req.param('projectId'))
				.exec(function(err, project) {
					if (err) return jump(err);
					if (!project) return res.send({status: 'error', template: 'Error', errors: ['Projekt nicht gefunden']});

					project.remove(function(err) {
						if (err) return jump(err);

						res.writeHead(302, {'Location': '/ProjectList?sessionId='+res.locals.session._id+'&status=success.delete'});
						res.end();
					});
				});
		});
	});

	app.get('/ProjectAdd', function(req, res, jump) {
		res.locals.session.hasPermission('project.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Projekte anlegen zu können.']});

			Company.find({})
				.sort('name')
				.exec(function(err, companies) {
					if (err) return jump(err);

					res.send({template: 'ProjectAdd', data: {companies: companies}});
				});
		});
	});

	app.post('/ProjectAdd', function(req, res, jump) {
		res.locals.session.hasPermission('project.canAdd', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um neue Projekte anlegen zu können.']});

			var companies = []
				project = new Project({
					name: req.param('name'),
					companies: typeof req.param('companies') === 'string' ? [req.param('companies')] : req.param('companies')
				});

			if (!project.name) return res.send({status: 'error', errors: ['Wie willst du das Projekt denn ohne einen Namen sehen, he?']});
			if (!project.companies || project.companies.length == 0) return res.send({status: 'error', errors: ['Du dem Projekt ein Unternehmen zuordnen.']});
			async.parallel([
				function(next) {project.save(next);},
				function(next) {
					Company.find({})
						.sort('name')
						.exec(function(err, items) {
							if (err) return jump(err);
							companies = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({template: 'ProjectAdd', status: 'success', data: {project: project, companies: companies}});
			});
		});
	});

	app.get('/ProjectEdit', function(req, res, jump) {
		res.locals.session.hasPermission('project.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Projekte bearbeiten zu können.']});

			var companies = [],
				project = null;
			async.parallel([
				function(next) {
					Project.findById(req.query.projectId)
						.exec(function(err, item) {
							if (err) return next(err);
							project = item;
							next();
						});
				},
				function(next) {
					Company.find({})
						.sort('name')
						.exec(function(err, items) {
							if (err) return next(err);
							companies = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);
				if (!project) return res.send({status: 'error', template: 'Error', errors: ['Das Projekt konnte nicht gefunden werden.']});

				res.send({template: 'ProjectEdit', data: {project: project, companies: companies}});
			});
		});
	});

	app.post('/ProjectEdit', function(req, res, jump) {
		res.locals.session.hasPermission('project.canEdit', function(err, has) {
			if (err) return jump(err);
			if (!has) return res.send({status: 'error', template: 'PermissionError', errors: ['Du besitzt nicht die notwendigen Berechtigungen, um bestehende Projekte bearbeiten zu können.']});

			var companies = [],
				project = null;
			async.parallel([
				function(next) {
					Project.findById(req.body.projectId)
						.exec(function(err, item) {
							if (err) return next(err);
							if (!item) return res.send({status: 'success', template: 'Error', errors: ['Projekt nicht gefunden']});
							project = item;

							project.name = req.param('name');
							project.companies = req.body.companies;
							if (!project.name) return res.send({status: 'error', template: 'Error', errors: ['Wie willst du das Projekt denn ohne einen Namen sehen, he?']});
							if (!project.companies || project.companies.length == 0) return res.send({status: 'error', errors: ['Du dem Projekt ein Unternehmen zuordnen.']});
							project.save(next);
						});
				},
				function(next) {
					Company.find({})
						.sort('name')
						.exec(function(err, items) {
							if (err) return next(err);
							companies = items;
							next();
						});
				}
			], function(err) {
				if (err) return jump(err);

				res.send({status: 'success', template: 'ProjectEdit', data: {project: project, companies: companies}});
			});
		});
	});
};