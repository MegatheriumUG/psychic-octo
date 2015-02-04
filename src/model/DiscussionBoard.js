var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var DiscussionBoard = new db.Schema({
	threads: [{type: ObjectId, ref: 'DiscussionThread'}]
});

module.exports = db.model('DiscussionBoard', DiscussionBoard);