var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Configuration = new db.Schema({
	fields: [{
		name: {type: String, required: true},
		value: {type: String, required: true}
	}]
});

module.exports = db.model('Configuration', Configuration);