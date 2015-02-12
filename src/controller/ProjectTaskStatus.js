var ProjectTaskStatus = require('../model/ProjectTaskStatus.js');

exports.setup = function(app) {
	app.get('/ProjectTaskStatusList', function(req, res, jump) {
		var options = {};
		if (req.param('companyId')) options.company = req.param('companyId');
		if (req.param('projectId')) options.project = req.param('projectId');

		ProjectTaskStatus.find(options)
			.exec(function(err, status) {
				if (err) return jump(err);

				res.send({data: {status: status}});
			});
	});

	app.post('/ProjectTaskStatusAdd', function(req, res, jump) {
		var status = new ProjectTaskStatus({
			name: req.param('name'),
			finished: req.param('finished') ? true : false
		});
		if (req.param('company')) status.company = req.param('company');
		if (req.param('project')) status.project = req.param('project');

		if (!status.name) return res.send({status: 'error', errors: ['Dude... ohne nen Namen ist nen Status unsichtbar.']});

		status.save(function(err) {
			if (err) return jump(err);

			res.send({status: 'success', data: {statusId: status._id}});
		})
	});
};