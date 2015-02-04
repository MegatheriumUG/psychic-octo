var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var DiscussionThread = new db.Schema({
	board: {type: ObjectId, ref: 'DiscussionBoard', required: true},
	time: {type: Date, default: Date.now, required: true},
	user: {type: ObjectId, ref: 'User', required: true},
	title: {type: String, required: true}
});

module.exports = db.model('DiscussionThread', DiscussionThread);