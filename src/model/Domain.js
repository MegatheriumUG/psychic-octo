var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Domain = new db.Schema({
	domain: {type: String, required: true, unique: true},
	company: {type: ObjectId, ref: 'Company'}
});

module.exports = db.model('Domain', Domain);