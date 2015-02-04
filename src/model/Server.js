var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Server = new db.Schema({
	ip: {type: String, required: true, unique: true},
	owner: {type: ObjectId, ref: 'Company', required: true},
	domains: [{type: String}],
	resources: {ram: {type: Number, default: 0}, cpus: {type: Number, default: 0}, hdd: {type: Number, default: 0}, ssd: {type: Number, default: 0}}
});

module.exports = db.model('Server', Server);