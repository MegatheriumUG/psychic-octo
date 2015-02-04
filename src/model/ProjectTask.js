var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var ProjectTask = new db.Schema({
	project: {type: ObjectId, ref: 'Project', required: true},
	task: {type: String, required: true},
	description: {type: String},
	time: {type: Date, default: Date.now},
	status: {type: ObjectId, ref: 'ProjectTaskStatus'},
	board: {type: ObjectId, ref: 'DiscussionBoard'}
});

module.exports = db.model('ProjectTask', ProjectTask);