var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Session = new db.Schema({
	user: {type: ObjectId, ref: 'User'}
});

module.exports = db.model('Session', Session);