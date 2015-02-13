var DiscussionThread = require('../model/DiscussionThread.js');

exports.setup = function(app) {
	app.get('/DiscussionThreadList', function(req, res, jump) {
		if (!req.param('boardId')) return res.send({status: 'error', errors: ['Du musst ein Forum angeben']});

		DiscussionThread.find({board: req.param('boardId'), hidden: false})
			.exec(function(err, threads) {
				if (err) return jump(err);

				res.send({data: {threads: threads}});
			});
	});

	app.post('/DiscussionThreadAdd', function(req, res, jump) {
		var thread = new DiscussionThread({
			user: res.locals.session.user,
			title: req.param('title'),
			board: req.param('board')
		});

		if (!thread.title) return res.send({status: 'error', errors: ['Du musst nen Titel zur identifizierung des Threads angeben']});
		if (!thread.board) return res.send({status: 'error', errors: ['Der Thread muss in einem Forum erstellt werden']});
		if (!thread.user) return res.send({status: 'error', errors: ['Ups. Nen Fehler passiert. Du musst angemeldet sein.']});
		thread.save(function(err) {
			if (err) return jump(err);

			res.send({status: 'success'});
		});
	});

	app.post('/DiscussionThreadDelete', function(req, res, jump) {
		DiscussionThread.findById(req.param('threadId'))
			.exec(function(err, thread) {
				if (err) return jump(err);
				if (!thread) return res.send({status: 'error', errors: ['Thread nicht gefunden']});

				thread.hidden = true;
				thread.save(function(err) {
					if (err) return jump(err);
					res.send({status: 'success', data: {threadId: thread._id}});
				});
			});
	});

	app.post('/DiscussionThreadEdit', function(req, res, jump) {
		DiscussionThread.findById(req.param('threadId'))
			.exec(function(err, thread) {
				if (err) return jump(err);
				if (!thread) return res.send({status: 'error', errors: ['Thread nicht gefunden']});

				thread.title = req.param('title');
				//thread.board = req.param('board');
				
				if (!thread.title) return res.send({status: 'error', errors: ['Du musst nen Titel zur identifizierung des Threads angeben']});
				if (!thread.board) return res.send({status: 'error', errors: ['Der Thread muss in einem Forum erstellt werden']});
				thread.save(function(err) {
					if (err) return jump(err);
					res.send({status: 'success'});
				});
			});
	});
}