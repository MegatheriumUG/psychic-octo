var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var DiscussionBoard = new db.Schema({
	title: {type: String, required: true},
	threads: [{type: ObjectId, ref: 'DiscussionThread'}]
});

module.exports = db.model('DiscussionBoard', DiscussionBoard);