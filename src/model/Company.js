var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Company = new db.Schema({
	name: {type: String, required: true, unique: true},
	description: {type: String}
});

module.exports = db.model('Company', Company);