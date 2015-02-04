var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var File = new db.Schema({
	
});

module.exports = db.model('File', File);