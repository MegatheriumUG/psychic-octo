var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Project = new db.Schema({
	name: {type: String, required: true, unique: true},
	companies: [{type: ObjectId, ref: 'Company'}]
});

module.exports = db.model('Project', Project);