var DiscussionPost = require('../model/DiscussionPost.js');

exports.setup = function(app) {
	app.get('/DiscussionPostList', function(req, res, jump) {
		if (!req.param('threadId')) return res.send({status: 'error', errors: ['Du musst einen Thread angeben']});

		DiscussionPost.find({thread: req.param('threadId'), hidden: false})
			.exec(function(err, posts) {
				if (err) return jump(err);
				res.send({data: {posts: posts}});
			});
	});

	app.post('/DiscussionPostAdd', function(req, res, jump) {
		var post = new DiscussionPost({
			thread: req.param('thread'),
			user: res.locals.session.user,
			content: req.param('content')
		});
		if (req.param('parentPostId')) post.post = req.param('parentPostId');

		if (!post.thread) return res.send({status: 'error', errors: ['Ein Beitrag ohne Kontext ist wie ein... ach egal. gib einfach nen scheiß Thread an.']});
		if (!post.content) return res.send({status: 'error', errors: ['Du musst auch nen Beitrag schreiben. Sonst schreibst du halt keinen Beitrag.']});
		if (!post.user) return res.send({status: 'error', errors: ['Ups. Nen Fehler passiert. Du musst angemeldet sein.']});
		post.save(function(err) {
			if (err) return jump(err);

			res.send({status: 'success', data: {postId: post._id}});
		});
	});

	app.post('/DiscussionPostDelete', function(req, res, jump) {
		DiscussionPost.findById(req.param('postId'))
			.exec(function(err, post) {
				if (err) return jump(err);
				if (!post) return res.send({status: 'error', errors: ['Post nicht gefunden']});

				post.hidden = true;
				post.save(function(err) {
					if (err) return jump(err);
					res.send({status: 'success'});
				});
			});
	});

	app.post('/DiscussionPostEdit', function(req, res, jump) {
		DiscussionPost.findById(req.param('postId'))
			.exec(function(err, post) {
				if (err) return jump(err);
				if (!post) return res.send({status: 'error', errors: ['Post nicht gefunden']});

				post.content = req.param('content');
				post.save(function(err) {
					if (err) return jump(err);
					res.send({status: 'success'});
				});
			});
	});
};