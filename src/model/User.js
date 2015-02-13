var bcrypt = require('bcrypt'),
	config = require('../config.js'),
	db = require('mongoose');
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

User.pre('save', function(callback) {
	var user = this;

	// verschlüssele das Passwort nur, wenn es geändert wurde
	if (!user.isModified('password')) return callback();

	// generiere SALT
	bcrypt.genSalt(config.PASSWORD_SALT_WORK_FACTOR, function (err, salt) {
		if (err) return callback(err);

		// verschlüssele das Passwort
		bcrypt.hash(user.password, salt, function(err, hash) {
			if (err) return callback(err);

			// überschreibe Passwort mit Verschlüsselung
			user.password = hash;
			callback();
		});
	});
});
User.methods.comparePassword = function(candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err) return callback(err);
		callback(null, isMatch);
	});
};

module.exports = db.model('User', User);