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

	app.post('/ProjectAdd', function(req, res, jump) {
		var project = new Project({
			name: req.param('name'),
			companies: typeof req.param('companies') === 'string' ? [req.param('companies')] : req.param('companies')
		});

		if (!project.companies || project.companies.length == 0) return res.send({status: 'error', errors: ['Du dem Projekt ein Unternehmen zuordnen.']});
		project.save(function(err) {
			if (err) return jump(err);
			res.send({status: 'success', data: {projectId: project._id}});
		});
	});
};