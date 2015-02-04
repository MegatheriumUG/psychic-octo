var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Workflow = new db.Schema({
	company: {type: ObjectId, ref: 'Company'}, // ermöglicht, Workflows nur für ein Unternehmen bereitzustellen
	project: {type: ObjectId, ref: 'Project'}, // ermöglicht, Worflows nur für ein Projekt bereitzustellen
	name: {type: String, required: true}
});

module.exports = db.model('Workflow', Workflow);