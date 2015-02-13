var Project = require('./model/Project.js');

exports.setup = function(app) {
	app.get('/ProjectList', function(req, res, jump) {
		var options = {};
		if (req.param('companyId')) options.companies = req.param('companyId');

		Project.find(options)
			.exec(function(err, projects) {
				if (err) return jump(err);

				res.send({template: 'ProjectList', data: {projects: projects}});
			});
	});

	app.get('/ProjectDelete', function(req, res, jump) {
		Project.findById(req.param('projectId'))
			.exec(function(err, project) {
				if (err) return jump(err);
				if (!project) return res.send({status: 'error', errors: ['Projekt nicht gefunden']});

				project.remove(function(err) {
					if (err) return jump(err);

					res.send({status: 'success'});
				});
			});
	});

	app.post('/ProjectAdd', function(req, res, jump) {
		var project = new Project({
			name: req.param('name'),
			companies: typeof req.param('companies') === 'string' ? [req.param('companies')] : req.param('companies')
		});

		if (!project.name) return res.send({status: 'error', errors: ['Wie willst du das Projekt denn ohne einen Namen sehen, he?']});
		if (!project.companies || project.companies.length == 0) return res.send({status: 'error', errors: ['Du dem Projekt ein Unternehmen zuordnen.']});
		project.save(function(err) {
			if (err) return jump(err);
			res.send({status: 'success', data: {projectId: project._id}});
		});
	});

	app.post('/ProjectEdit', function(req, res, jump) {
		Project.findById(req.param('projectId'))
			.exec(function(err, project) {
				if (err) return jump(err);
				if (!project) return res.send({status: 'success', errors: ['Projekt nicht gefunden']});

				project.name = req.param('name');
				project.companies = typeof req.param('companies') === 'string' ? [req.param('companies')] : req.param('companies');
				if (!project.name) return res.send({status: 'error', errors: ['Wie willst du das Projekt denn ohne einen Namen sehen, he?']});
				if (!project.companies || project.companies.length == 0) return res.send({status: 'error', errors: ['Du dem Projekt ein Unternehmen zuordnen.']});

				project.save(function(err) {
					if (err) return jump(err);
					res.send({status: 'success'});
				});
			});
	});
};