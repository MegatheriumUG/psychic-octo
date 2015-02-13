var DiscussionBoard = require('../model/DiscussionBoard'),
	ProjectTask = require('../model/ProjectTask.js');

exports.setup = function(app) {
	app.get('/ProjectTaskList', function(req, res, jump) {
		var query = {};
		if (req.param('projectId')) query.project = req.param('projectId');
		if (req.param('title')) query.title = new RegExp('.*'+req.param('title')+'.*', 'i');
		if (req.param('time')) query.time = {$gte: req.param('time')};

		ProjectTask.find(query)
			.exec(function(err, tasks) {
				if (err) return jump(err);

				res.send({data: {tasks: tasks}});
			});
	});

	app.post('/ProjectTaskAdd', function(req, res, jump) {
		var task = new ProjectTask({
			project: req.param('project'),
			title: req.param('title'),
			description: req.param('description'),
			status: req.param('status')
		});

		if (!task.project) return res.send({status: 'error', errors: ['Zu welchem Projekt soll denn der Task gehören?']});
		if (!task.title) return res.send({status: 'error', errors: ['Eine Aufgabe ohne Aufgabe macht wenig Sinn... oder?']});
		task.board = new DiscussionBoard({title: 'Aufgabe '+task._id});

		task.save(function(err) {
			if (err) return jump(err);

			res.send({data: {taskId: task._id}});
		});
	});

	app.get('/ProjectTaskDelete', function(req, res, jump) {
		ProjectTask.findById(req.param('taskId'))
			.exec(function(err, task) {
				if (err) return jump(err);
				if (!task) return res.send({status: 'error', errors: ['Task nicht gefunden']});

				task.remove(function(err) {
					if (err) return jump(err);

					res.send({status: 'success'});
				});
			});
	});

	app.post('/ProjectTaskEdit', function(req, res, jump) {
		ProjectTask.findById(req.param('taskId'))
			.exec(function(err, task) {
				if (err) return jump(err);
				if (!task) return res.send({status: 'success', errors: ['Task nicht gefunden']});

				task.project = req.param('project');
				task.title = req.param('title');
				task.description = req.param('description');
				task.status = req.param('status');
				if (!task.project) return res.send({status: 'error', errors: ['Zu welchem Projekt soll denn der Task gehören?']});
				if (!task.title) return res.send({status: 'error', errors: ['Eine Aufgabe ohne Aufgabe macht wenig Sinn... oder?']});

				task.save(function(err) {
					if (err) return jump(err);

					res.send({status: 'success'});
				});
			});
	});
};