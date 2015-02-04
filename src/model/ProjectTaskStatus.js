var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var ProjectTaskStatus = new db.Schema({
	company: {type: ObjectId, ref: 'Company'}, // möglk. Stati nur für eine Company zu erstellen
	project: {type: ObjectId, ref: 'Project'}, // möglk. Stati nur für ein Projekt zu erstellen
	finished: {type: Boolean, default: false, required: true}, // true => Tasks dieses Status werden als "FERTIG" markiert
	name: {type: String, required: true} // der Name des Status
});

module.exports = db.model('ProjectTaskStatus', ProjectTaskStatus);