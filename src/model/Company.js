var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Company = new db.Schema({
	image: {type: ObjectId, ref: 'File'},
	name: {type: String, required: true, unique: true},
	description: {type: String}
});

module.exports = db.model('Company', Company);