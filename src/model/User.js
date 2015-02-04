var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var User = new db.Schema({
	username: {type: String, unique: true, required: true},
	email: {type: String, unique: true, required: true},
	password: {type: String, required: true},
	name: {first: {type: String}, last: {type: String}},
	settings: {
		notificationMail: {type: Boolean, default: false} // true => Nutzer erhält Benachrichtigungen auch per E-Mail
	}
});

module.exports = db.model('User', User);