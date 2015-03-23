var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Script = new db.Schema({
	service: {type: ObjectId, ref: 'Service', required: true},
	type: {type: String, enum: ['install', 'uninstall', 'start', 'stop', 'setup'], required: true},
	commands: [{type: String}]
});

module.exports = db.model('Script', Script);