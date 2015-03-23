var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Service = new db.Schema({
	name: {type: String, required: true, index: {unique: true}},
	scripts: [{type: ObjectId, ref: 'Script'}],
	files: [{
		name: {type: String, required: true},
		content: {type: String, default: ''}
	}],
	configurations: [{type: ObjectId, ref: 'Configuration'}]
});

module.exports = db.model('Service', Service);