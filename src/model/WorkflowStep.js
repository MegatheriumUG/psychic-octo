var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var WorkflowStep = new db.Schema({
	workflow: {type: ObjectId, ref: 'Workflow', required: true},
	sourceStatus: {type: ObjectId, ref: 'ProjectTaskStatus', required: true},
	targetStatus: {type: ObjectId, ref: 'ProjectTaskStatus', required: true}
});

module.exports = db.model('WorkflowStep', WorkflowStep);