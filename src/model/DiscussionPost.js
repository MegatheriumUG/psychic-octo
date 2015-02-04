var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var DiscussionPost = new db.Schema({
	thread: {type: ObjectId, ref: 'DiscussionThread', required: true},
	post: {type: ObjectId, ref: 'DiscussionPost'}, // only if this post is a reply to another post, resulting in a subthread
	user: {type: ObjectId, ref: 'User', required: true},
	time: {type: Date, default: Date.now, required: true},
	content: {type: String, required: true},
	attachments: [{type: ObjectId, ref: 'File'}]
});

module.exports = db.model('DiscussionPost', DiscussionPost);