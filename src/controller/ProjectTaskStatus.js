var async = require('async'),
	ProjectTask = require('../model/ProjectTask.js'),
	ProjectTaskStatus = require('../model/ProjectTaskStatus.js');

exports.setup = function(app) {
	app.get('/ProjectTaskStatusDelete', function(req, res, jump) {
		async.parallel([
			function(next) {
				ProjectTaskStatus.findById(req.param('statusId'))
					.exec(function(err, item) {
						if (err) return next(err);
						status = item;
						next();
					});
			},

			function(next) {
				ProjectTaskStatus.findById(req.param('newStatusId'))
					.exec(function(err, item) {
						if (err) return next(err);
						newStatus = item;
						next();
					});
			}
		], function(err) {
			if (err) return jump(err);
			if (!status) return res.send({status: 'error', errors: ['Status konnte nicht gefunden werden.']});
			if (!newStatus) return res.send({status: 'error', errors: ['Neuer Status konnte nicht gefunden werden.']});
			if ((newStatus.project && newStatus.project != status.project) || (newStatus.company && newStatus.company != status.company)) return res.send({status: 'error', errors: ['Der neue Status hat strengere Filterkriterien (Projekt oder Unternehmen) als der alte Status. Daher kann der alte nicht mit dem neuen ersetzt werden.']});

			// setze neuen Status für alle Tasks mit dem alten Status
			async.parallel([
				function(next) {
					ProjectTask.update({status: status._id}, {$set: {status: newStatus._id}}, {multiple: true})
						.exec(next);
				},

				function(next) {
					status.remove(next);
				}
			], function(err) {
				if (err) return jump(err);
				res.send({status: 'success'});
			});
		});
	});

	app.post('/ProjectTaskStatusEdit', function(req, res, jump) {
		ProjectTaskStatus.findById(req.param('statusId'))
			.exec(function(err, status) {
				if (err) return jump(err);
				if (!status) return res.send({status: 'error', errors: ['Status nicht gefunden']});

				status.name = req.param('name');
				status.finished = req.param('finished') ? true : false;
				status.company = req.param('company') ? req.param('company') : null;
				status.project = req.param('project') ? req.param('project') : null;

				if (!status.name) return res.send({status: 'error', errors: ['Dude... ohne nen Namen ist nen Status unsichtbar.']});

				status.save(function(err) {
					if (err) return jump(err);

					res.send({status: 'success'});
				});
			});
	});

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