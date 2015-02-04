var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Notification = new db.Schema({
	user: {type: ObjectId, ref: 'User', required: true},
	time: {type: Date, default: Date.now, required: true},
	link: {type: String, required: true}, // the content this notification links to
	message: {type: String, required: true}
});

module.exports = db.model('Notification', Notification);