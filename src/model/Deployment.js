var db = require('mongoose');
var ObjectId = db.Schema.Types.ObjectId;

var Deployment = new db.Schema({
	name: {type: String, required: true, index: {unique: true}},
	description: {type: String, default: ''},
	services: [{
		service: {type: ObjectId, ref: 'Service'},
		servers: [{
			server: {type: ObjectId, ref: 'Server'},
			installed: {type: Boolean, required: true, default: false}
		}]
	}],
	configurations: [{type: ObjectId, ref: 'Configuration'}]
});

module.exports = db.model('Deployment', Deployment);